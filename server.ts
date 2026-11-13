import 'dotenv/config';
import express from 'express';
import type { Request, Response } from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';

const TEXT_MODELS = ['gemini-3.8-flash', 'gemini-3.1-flash-lite'];
const IMAGE_MODEL_NAME = 'gemini-3.1-flash-lite-image';
const PER_MODEL_TIMEOUT_MS = 18_000;
const PORT = Number(process.env.PORT ?? 3000);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type AspectRatio = '1:1' | '3:4' | '4:3' | '9:16' | '16:9';

interface BlueprintMediumInput {
  id: string;
  name: string;
  category: string;
  aspectRatio: AspectRatio;
  sceneBrief: string;
}

interface BlueprintRequestBody {
  name?: string;
  description?: string;
  palette?: string;
  tagline?: string;
  moodNote?: string;
  mediums?: BlueprintMediumInput[];
}

interface AnchorRequestBody {
  name?: string;
  description?: string;
  palette?: string;
  tagline?: string;
  moodNote?: string;
  consistencyLock?: string;
}

interface MediumRequestBody {
  name?: string;
  description?: string;
  palette?: string;
  tagline?: string;
  moodNote?: string;
  mediumName?: string;
  sceneBrief?: string;
  aspectRatio?: AspectRatio;
  artDirectionNote?: string;
  consistencyLock?: string;
  minimalistDirective?: string;
  compositionNote?: string;
  anchorImageDataUrl?: string;
}

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const err = new Error(
      'GEMINI_API_KEY is not configured. Add an API key in Settings > Secrets.'
    ) as Error & { statusCode?: number };
    err.statusCode = 400;
    throw err;
  }

  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function parseDataUrl(dataUrl: string): { mimeType: string; data: string } | null {
  const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(dataUrl);
  if (!match) return null;
  return {
    mimeType: match[1],
    data: match[2],
  };
}

function stripJsonCodeFences(raw: string): string {
  const trimmed = raw.trim();
  const fenced = /^```(?:json)?\s*\n?([\s\S]*?)\n?```$/i.exec(trimmed);
  if (fenced) {
    return fenced[1].trim();
  }
  return trimmed
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      const err = new Error(
        `TIMEOUT: Request to ${label} exceeded ${Math.round(ms / 1000)}s limit.`
      ) as Error & { statusCode?: number };
      err.statusCode = 504;
      reject(err);
    }, ms);

    promise
      .then((value) => resolve(value))
      .catch((err) => reject(err))
      .finally(() => clearTimeout(timer));
  });
}

function isTransientNetworkOrServerError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err);
  return (
    message.includes('503') ||
    message.includes('502') ||
    message.includes('UNAVAILABLE') ||
    message.includes('ETIMEDOUT') ||
    message.includes('ECONNRESET')
  );
}

function shouldFailoverError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err);
  return (
    isTransientNetworkOrServerError(err) ||
    message.includes('429') ||
    message.includes('RESOURCE_EXHAUSTED') ||
    message.includes('404') ||
    message.includes('NOT_FOUND') ||
    message.includes('TIMEOUT') ||
    message.includes('quota')
  );
}

async function generateWithRetryAndFallback<T>(
  models: string[],
  fn: (model: string) => Promise<T>,
  maxRetriesPerModel = 1
): Promise<{ result: T; modelUsed: string }> {
  let lastError: unknown;
  let lastModel = models[0] ?? '';

  for (let i = 0; i < models.length; i++) {
    const model = models[i];
    lastModel = model;

    for (let attempt = 0; attempt <= maxRetriesPerModel; attempt++) {
      try {
        const result = await withTimeout(fn(model), PER_MODEL_TIMEOUT_MS, model);
        return { result, modelUsed: model };
      } catch (err) {
        lastError = err;
        const canRetrySameModel =
          attempt < maxRetriesPerModel && isTransientNetworkOrServerError(err);
        if (canRetrySameModel) {
          await new Promise((resolve) => setTimeout(resolve, 450 * (attempt + 1)));
          continue;
        }
        break;
      }
    }

    const hasNextModel = i < models.length - 1;
    if (!hasNextModel || !shouldFailoverError(lastError)) {
      break;
    }
  }

  const wrapped =
    lastError instanceof Error ? lastError : new Error(String(lastError));
  (wrapped as Error & { failedModel?: string }).failedModel = lastModel;
  throw wrapped;
}

function extractReadableErrorMessage(raw: string): string {
  const jsonStart = raw.indexOf('{');
  if (jsonStart >= 0) {
    try {
      const parsed = JSON.parse(raw.slice(jsonStart)) as {
        error?: { message?: string };
        message?: string;
      };
      if (parsed?.error?.message) return parsed.error.message;
      if (parsed?.message) return parsed.message;
    } catch {
      // Fall through to raw string cleanup
    }
  }
  return raw.replace(/\s+/g, ' ').trim();
}

function formatGeminiError(
  err: unknown,
  defaultModelName: string
): { status: number; message: string } {
  const raw = err instanceof Error ? err.message : String(err);
  const failedModel =
    typeof err === 'object' && err !== null && 'failedModel' in err
      ? String((err as { failedModel?: string }).failedModel || defaultModelName)
      : defaultModelName;
  const statusCode =
    typeof err === 'object' && err !== null && 'statusCode' in err
      ? Number((err as { statusCode?: number }).statusCode)
      : undefined;

  if (statusCode === 400 && raw.includes('GEMINI_API_KEY')) {
    return { status: 400, message: raw };
  }

  if (statusCode === 504 || raw.includes('TIMEOUT')) {
    return {
      status: 504,
      message: `The request to ${failedModel} timed out after ${Math.round(
        PER_MODEL_TIMEOUT_MS / 1000
      )}s. Please try again.`,
    };
  }

  if (raw.includes('RESOURCE_EXHAUSTED') || raw.includes('429') || raw.includes('quota')) {
    return {
      status: 429,
      message: `Rate limit or billing quota reached for ${failedModel}. Note that Nano-Banana image generation (${IMAGE_MODEL_NAME}) requires a billing-enabled API key in Settings > Secrets, while Gemini Flash blueprint planning runs on standard tiers.`,
    };
  }

  if (
    raw.includes('PERMISSION_DENIED') ||
    raw.includes('403') ||
    raw.includes('API_KEY_INVALID') ||
    raw.includes('API key not valid')
  ) {
    return {
      status: 403,
      message: `Gemini API key was rejected or lacks permission for ${failedModel}. Please verify your key in Settings > Secrets.`,
    };
  }

  if (raw.includes('NOT_FOUND') || raw.includes('404')) {
    return {
      status: 404,
      message: `Model ${failedModel} was not found or is unavailable for the active API key.`,
    };
  }

  if (raw.includes('503') || raw.includes('502') || raw.includes('UNAVAILABLE')) {
    return {
      status: 503,
      message: `Upstream Gemini service (${failedModel}) is temporarily unavailable. Please retry in a moment.`,
    };
  }

  return {
    status: 500,
    message: extractReadableErrorMessage(raw) || 'Generation failed unexpectedly.',
  };
}

function buildAnchorPrompt(body: AnchorRequestBody): string {
  const name = (body.name ?? '').trim();
  const description = (body.description ?? '').trim();
  const palette = (body.palette ?? '').trim();
  const moodNote = (body.moodNote ?? '').trim();
  const consistencyLock = (body.consistencyLock ?? '').trim();

  return [
    `Studio reference product photograph of "${name}".`,
    `Exact physical product specification: ${description}.`,
    consistencyLock ? `Locked geometric & material traits: ${consistencyLock}.` : '',
    palette ? `Color and material palette: ${palette}.` : '',
    moodNote ? `Lighting and surface direction: ${moodNote}.` : '',
    'Composition: Centered isolated single product on a seamless matte off-white studio background (#F4F4F2) with soft diffused architectural lighting and crisp form definition so every material, proportion, and detail is unmistakably clear.',
    'PRIORITIZE MINIMALISM: Generous negative space around the product, zero props, zero clutter, calm Swiss editorial restraint.',
    'STRICTLY NO PEOPLE: Zero humans, zero hands, zero fingers, zero faces, zero silhouettes anywhere in the image.',
  ]
    .filter(Boolean)
    .join(' ');
}

function buildMediumPrompt(body: MediumRequestBody, hasAnchor: boolean): string {
  const name = (body.name ?? '').trim();
  const description = (body.description ?? '').trim();
  const palette = (body.palette ?? '').trim();
  const tagline = (body.tagline ?? '').trim();
  const moodNote = (body.moodNote ?? '').trim();
  const mediumName = (body.mediumName ?? 'Brand Medium').trim();
  const sceneBrief = (body.sceneBrief ?? '').trim();
  const artDirectionNote = (body.artDirectionNote ?? '').trim();
  const consistencyLock = (body.consistencyLock ?? '').trim();
  const minimalistDirective = (body.minimalistDirective ?? '').trim();
  const compositionNote = (body.compositionNote ?? '').trim();

  return [
    hasAnchor
      ? `Using the attached canonical reference photograph of "${name}", place the EXACT same product into a "${mediumName}" brand campaign photograph.`
      : `Create a "${mediumName}" brand campaign photograph featuring "${name}".`,
    hasAnchor
      ? 'PRODUCT CONSISTENCY MANDATE: Preserve the exact silhouette, proportions, surface texture, colorways, hardware details, and label placement of the product shown in the reference image without altering its design.'
      : '',
    `Canonical product specification: ${description}.`,
    consistencyLock ? `Locked consistency details: ${consistencyLock}.` : '',
    palette ? `Material & color palette: ${palette}.` : '',
    tagline
      ? `If text appears on the ${mediumName} layout, keep typography ultra-minimalist and strictly limited to "${name}" or "${tagline}" with clean Swiss sans-serif alignment.`
      : `Keep any layout typography ultra-minimalist or purely visual without cluttered copy.`,
    `Medium setting and framing: ${sceneBrief}`,
    compositionNote ? `Shot composition plan: ${compositionNote}.` : '',
    moodNote ? `Aesthetic mood: ${moodNote}.` : '',
    minimalistDirective ? `Minimalist lighting & space rule: ${minimalistDirective}.` : '',
    artDirectionNote ? `Additional art direction: ${artDirectionNote}.` : '',
    'PRIORITIZE MINIMALISM: Compose with at least 45% serene, uncluttered negative space, architectural geometry, quiet natural shadows, and restrained neutral tones.',
    'STRICTLY NO PEOPLE: Do not include any people, pedestrians, drivers, models, hands, arms, faces, reflections of people, or human silhouettes anywhere in the frame. The environment must be completely uninhabited.',
  ]
    .filter(Boolean)
    .join(' ');
}

const VALID_ASPECT_RATIOS = new Set<AspectRatio>(['1:1', '3:4', '4:3', '9:16', '16:9']);

async function startServer(): Promise<void> {
  const app = express();
  app.use(express.json({ limit: '15mb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      ok: true,
      textModels: TEXT_MODELS,
      imageModel: IMAGE_MODEL_NAME,
    });
  });

  app.post('/api/brand/blueprint', async (req: Request, res: Response) => {
    try {
      const body = (req.body ?? {}) as BlueprintRequestBody;
      if (!body.name?.trim() || !body.description?.trim()) {
        res.status(400).json({ error: 'Product name and physical description are required.' });
        return;
      }

      const mediums = Array.isArray(body.mediums) ? body.mediums : [];
      if (mediums.length === 0) {
        res.status(400).json({ error: 'At least one medium is required to build a blueprint.' });
        return;
      }

      const ai = getGeminiClient();
      const prompt = [
        `Product Name: ${body.name.trim()}`,
        `Physical Description: ${body.description.trim()}`,
        body.palette ? `Material & Color Palette: ${body.palette.trim()}` : '',
        body.tagline ? `Minimalist Headline: ${body.tagline.trim()}` : '',
        body.moodNote ? `Surface Mood: ${body.moodNote.trim()}` : '',
        'Selected Mediums:',
        ...mediums.map(
          (m) => `- id: "${m.id}", name: "${m.name}" (${m.aspectRatio}), brief: ${m.sceneBrief}`
        ),
      ]
        .filter(Boolean)
        .join('\n');

      const { result: response, modelUsed } = await generateWithRetryAndFallback(
        TEXT_MODELS,
        (model) =>
          ai.models.generateContent({
            model,
            contents: prompt,
            config: {
              systemInstruction:
                'You are a minimalist brand art director. Produce a concise, concrete visual consistency lock and per-medium composition plan. Every scene MUST remain strictly uninhabited (zero people, zero hands, zero silhouettes) and prioritize minimalism (generous negative space, quiet architectural geometry). Return valid JSON matching the schema.',
              thinkingConfig: {
                thinkingLevel: ThinkingLevel.LOW,
              },
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  consistencyLock: {
                    type: Type.STRING,
                    description:
                      'Concise canonical specification of exact silhouette, materials, colors, and proportions to keep identical across every shot.',
                  },
                  minimalistDirective: {
                    type: Type.STRING,
                    description:
                      'Unified lighting, shadow angle, and negative-space rules across the entire campaign.',
                  },
                  mediumDirections: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        mediumId: { type: Type.STRING },
                        compositionNote: {
                          type: Type.STRING,
                          description:
                            'Exact camera angle, negative space ratio, and uninhabited architectural framing for this medium.',
                        },
                        typographyNote: {
                          type: Type.STRING,
                          description:
                            'Restrained Swiss typographic treatment (or none) for this medium.',
                        },
                      },
                    },
                  },
                },
              },
            },
          })
      );

      const cleanedJson = stripJsonCodeFences(response.text ?? '{}');
      const parsed = JSON.parse(cleanedJson);
      res.json({ blueprint: parsed, model: modelUsed });
    } catch (err) {
      const formatted = formatGeminiError(err, TEXT_MODELS[0]);
      res.status(formatted.status).json({ error: formatted.message });
    }
  });

  app.post('/api/brand/anchor', async (req: Request, res: Response) => {
    try {
      const body = (req.body ?? {}) as AnchorRequestBody;
      if (!body.name?.trim() || !body.description?.trim()) {
        res.status(400).json({ error: 'Product name and physical description are required.' });
        return;
      }

      const ai = getGeminiClient();
      const prompt = buildAnchorPrompt(body);

      const { result: response, modelUsed } = await generateWithRetryAndFallback(
        [IMAGE_MODEL_NAME],
        (model) =>
          ai.models.generateContent({
            model,
            contents: {
              parts: [{ text: prompt }],
            },
            config: {
              imageConfig: {
                aspectRatio: '1:1',
              },
            },
          })
      );

      let imageUrl: string | null = null;
      for (const part of response.candidates?.[0]?.content?.parts ?? []) {
        if (part.inlineData?.data) {
          const mime = part.inlineData.mimeType ?? 'image/png';
          imageUrl = `data:${mime};base64,${part.inlineData.data}`;
          break;
        }
      }

      if (!imageUrl) {
        res.status(502).json({
          error: 'Nano-Banana Lite returned a response without an image part. Please retry.',
        });
        return;
      }

      res.json({ imageUrl, promptUsed: prompt, model: modelUsed });
    } catch (err) {
      const formatted = formatGeminiError(err, IMAGE_MODEL_NAME);
      res.status(formatted.status).json({ error: formatted.message });
    }
  });

  app.post('/api/brand/medium', async (req: Request, res: Response) => {
    try {
      const body = (req.body ?? {}) as MediumRequestBody;
      if (!body.name?.trim() || !body.description?.trim() || !body.sceneBrief?.trim()) {
        res.status(400).json({
          error: 'Product name, description, and medium scene brief are required.',
        });
        return;
      }

      const aspectRatio: AspectRatio =
        body.aspectRatio && VALID_ASPECT_RATIOS.has(body.aspectRatio) ? body.aspectRatio : '1:1';

      const parsedAnchor = body.anchorImageDataUrl
        ? parseDataUrl(body.anchorImageDataUrl)
        : null;

      const prompt = buildMediumPrompt(body, Boolean(parsedAnchor));
      const parts: Array<
        { inlineData: { data: string; mimeType: string } } | { text: string }
      > = [];

      if (parsedAnchor) {
        parts.push({
          inlineData: {
            data: parsedAnchor.data,
            mimeType: parsedAnchor.mimeType,
          },
        });
      }
      parts.push({ text: prompt });

      const ai = getGeminiClient();
      const { result: response, modelUsed } = await generateWithRetryAndFallback(
        [IMAGE_MODEL_NAME],
        (model) =>
          ai.models.generateContent({
            model,
            contents: { parts },
            config: {
              imageConfig: {
                aspectRatio,
              },
            },
          })
      );

      let imageUrl: string | null = null;
      for (const part of response.candidates?.[0]?.content?.parts ?? []) {
        if (part.inlineData?.data) {
          const mime = part.inlineData.mimeType ?? 'image/png';
          imageUrl = `data:${mime};base64,${part.inlineData.data}`;
          break;
        }
      }

      if (!imageUrl) {
        res.status(502).json({
          error: `Nano-Banana Lite did not return an image for ${body.mediumName ?? 'this medium'}. Please retry.`,
        });
        return;
      }

      res.json({ imageUrl, promptUsed: prompt, model: modelUsed });
    } catch (err) {
      const formatted = formatGeminiError(err, IMAGE_MODEL_NAME);
      res.status(formatted.status).json({ error: formatted.message });
    }
  });

  if (process.env.NODE_ENV === 'production') {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Brand Builder listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start Brand Builder server:', err);
  process.exit(1);
});
