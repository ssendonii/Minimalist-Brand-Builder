/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { TopBar } from './components/TopBar';
import { BriefStudio } from './components/BriefStudio';
import { MediumSelector } from './components/MediumSelector';
import { CampaignBoard } from './components/CampaignBoard';
import { LightboxModal } from './components/LightboxModal';
import { DEFAULT_MEDIUMS, MOOD_OPTIONS, STARTER_BRIEFS } from './data/mediums';
import { safeFetchJson } from './utils/api';
import type {
  AnchorState,
  CampaignBlueprint,
  GeneratedShot,
  MediumDefinition,
  ProductBrief,
} from './types/brand';

export default function App() {
  const [brief, setBrief] = useState<ProductBrief>(STARTER_BRIEFS[0].brief);
  const [mediums, setMediums] = useState<MediumDefinition[]>(DEFAULT_MEDIUMS);
  const [selectedIds, setSelectedIds] = useState<string[]>(
    DEFAULT_MEDIUMS.filter((m) => m.defaultSelected).map((m) => m.id)
  );
  const [anchor, setAnchor] = useState<AnchorState>({
    imageUrl: null,
    source: null,
    status: 'idle',
    error: null,
  });
  const [blueprint, setBlueprint] = useState<CampaignBlueprint | null>(null);
  const [isPlanningBlueprint, setIsPlanningBlueprint] = useState(false);
  const [shots, setShots] = useState<Record<string, GeneratedShot>>({});
  const [isGeneratingBatch, setIsGeneratingBatch] = useState(false);
  const [batchError, setBatchError] = useState<string | null>(null);
  const [lightboxTarget, setLightboxTarget] = useState<{
    medium: MediumDefinition;
    shot: GeneratedShot;
  } | null>(null);

  const getMoodNote = (moodId: ProductBrief['mood']): string => {
    return MOOD_OPTIONS.find((m) => m.id === moodId)?.surfaceNote ?? '';
  };

  const handleChangeBrief = (next: ProductBrief) => {
    const productIdentityChanged =
      next.name !== brief.name || next.description !== brief.description;
    setBrief(next);
    setBatchError(null);
    if (productIdentityChanged) {
      setBlueprint(null);
      if (anchor.source === 'generated') {
        setAnchor({
          imageUrl: null,
          source: null,
          status: 'idle',
          error: null,
        });
      }
    }
  };

  const requestBlueprintGeneration = async (): Promise<CampaignBlueprint | null> => {
    const targets = mediums.filter((m) => selectedIds.includes(m.id));
    if (!brief.name.trim() || !brief.description.trim() || targets.length === 0) {
      return null;
    }

    setIsPlanningBlueprint(true);
    try {
      const { ok, data } = await safeFetchJson<{
        blueprint?: CampaignBlueprint;
        error?: string;
      }>('/api/brand/blueprint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: brief.name,
          description: brief.description,
          palette: brief.palette,
          tagline: brief.tagline,
          moodNote: getMoodNote(brief.mood),
          mediums: targets.map((m) => ({
            id: m.id,
            name: m.name,
            category: m.category,
            aspectRatio: m.aspectRatio,
            sceneBrief: m.sceneBrief,
          })),
        }),
      });
      if (!ok || !data.blueprint) {
        setBatchError(data.error ?? 'Failed to plan campaign blueprint.');
        return null;
      }

      setBlueprint(data.blueprint);
      return data.blueprint;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Network error planning campaign blueprint.';
      setBatchError(message);
      return null;
    } finally {
      setIsPlanningBlueprint(false);
    }
  };

  const requestAnchorGeneration = async (
    consistencyLock?: string
  ): Promise<string | null> => {
    if (!brief.name.trim() || !brief.description.trim()) {
      setAnchor((prev) => ({
        ...prev,
        status: 'error',
        error: 'Enter both a product name and physical description before generating.',
      }));
      return null;
    }

    setAnchor((prev) => ({ ...prev, status: 'generating', error: null }));
    try {
      const { ok, data } = await safeFetchJson<{
        imageUrl?: string;
        error?: string;
      }>('/api/brand/anchor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: brief.name,
          description: brief.description,
          palette: brief.palette,
          tagline: brief.tagline,
          moodNote: getMoodNote(brief.mood),
          consistencyLock: consistencyLock ?? blueprint?.consistencyLock,
        }),
      });
      if (!ok || !data.imageUrl) {
        const message = data.error ?? 'Failed to generate canonical product anchor.';
        setAnchor({
          imageUrl: null,
          source: null,
          status: 'error',
          error: message,
        });
        return null;
      }

      setAnchor({
        imageUrl: data.imageUrl,
        source: 'generated',
        status: 'ready',
        error: null,
      });
      return data.imageUrl;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Network error generating product anchor.';
      setAnchor({
        imageUrl: null,
        source: null,
        status: 'error',
        error: message,
      });
      return null;
    }
  };

  const handleUploadAnchor = (dataUrl: string) => {
    setAnchor({
      imageUrl: dataUrl,
      source: 'uploaded',
      status: 'ready',
      error: null,
    });
    setBatchError(null);
  };

  const handleClearAnchor = () => {
    setAnchor({
      imageUrl: null,
      source: null,
      status: 'idle',
      error: null,
    });
  };

  const handleToggleMedium = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectCoreTrio = () => {
    setSelectedIds(['billboard', 'newspaper', 'social-post']);
  };

  const handleSelectAll = () => {
    setSelectedIds(mediums.map((m) => m.id));
  };

  const handleAddCustomMedium = (medium: MediumDefinition) => {
    setMediums((prev) => [...prev, medium]);
    setSelectedIds((prev) => [...prev, medium.id]);
  };

  const handleRemoveCustomMedium = (id: string) => {
    setMediums((prev) => prev.filter((m) => m.id !== id));
    setSelectedIds((prev) => prev.filter((item) => item !== id));
    setShots((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  const handleUpdateArtDirection = (mediumId: string, note: string) => {
    setShots((prev) => {
      const existing = prev[mediumId];
      return {
        ...prev,
        [mediumId]: {
          mediumId,
          imageUrl: existing?.imageUrl ?? null,
          status: existing?.status ?? 'idle',
          error: existing?.error ?? null,
          artDirectionNote: note,
          promptUsed: existing?.promptUsed ?? null,
          updatedAt: existing?.updatedAt ?? null,
        },
      };
    });
  };

  const renderMediumShot = async (
    medium: MediumDefinition,
    resolvedAnchorUrl: string | null,
    activeBlueprint: CampaignBlueprint | null
  ): Promise<{ ok: boolean; error?: string }> => {
    const existingNote = shots[medium.id]?.artDirectionNote ?? '';
    const mediumDirection = activeBlueprint?.mediumDirections?.find(
      (d) => d.mediumId === medium.id
    );

    setShots((prev) => ({
      ...prev,
      [medium.id]: {
        mediumId: medium.id,
        imageUrl: prev[medium.id]?.imageUrl ?? null,
        status: 'generating',
        error: null,
        artDirectionNote: existingNote,
        promptUsed: prev[medium.id]?.promptUsed ?? null,
        updatedAt: prev[medium.id]?.updatedAt ?? null,
      },
    }));

    try {
      const { ok, data } = await safeFetchJson<{
        imageUrl?: string;
        promptUsed?: string;
        error?: string;
      }>('/api/brand/medium', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: brief.name,
          description: brief.description,
          palette: brief.palette,
          tagline: brief.tagline,
          moodNote: getMoodNote(brief.mood),
          mediumName: medium.name,
          sceneBrief: medium.sceneBrief,
          aspectRatio: medium.aspectRatio,
          artDirectionNote: existingNote,
          consistencyLock: activeBlueprint?.consistencyLock,
          minimalistDirective: activeBlueprint?.minimalistDirective,
          compositionNote: mediumDirection
            ? `${mediumDirection.compositionNote} ${mediumDirection.typographyNote}`.trim()
            : undefined,
          anchorImageDataUrl: resolvedAnchorUrl ?? undefined,
        }),
      });

      if (!ok || !data.imageUrl) {
        const message = data.error ?? `Failed to render ${medium.name}.`;
        setShots((prev) => ({
          ...prev,
          [medium.id]: {
            mediumId: medium.id,
            imageUrl: prev[medium.id]?.imageUrl ?? null,
            status: 'error',
            error: message,
            artDirectionNote: existingNote,
            promptUsed: prev[medium.id]?.promptUsed ?? null,
            updatedAt: prev[medium.id]?.updatedAt ?? null,
          },
        }));
        return { ok: false, error: message };
      }

      setShots((prev) => ({
        ...prev,
        [medium.id]: {
          mediumId: medium.id,
          imageUrl: data.imageUrl!,
          status: 'ready',
          error: null,
          artDirectionNote: existingNote,
          promptUsed: data.promptUsed ?? null,
          updatedAt: Date.now(),
        },
      }));
      return { ok: true };
    } catch (err) {
      const message =
        err instanceof Error ? err.message : `Network error rendering ${medium.name}.`;
      setShots((prev) => ({
        ...prev,
        [medium.id]: {
          mediumId: medium.id,
          imageUrl: prev[medium.id]?.imageUrl ?? null,
          status: 'error',
          error: message,
          artDirectionNote: existingNote,
          promptUsed: prev[medium.id]?.promptUsed ?? null,
          updatedAt: prev[medium.id]?.updatedAt ?? null,
        },
      }));
      return { ok: false, error: message };
    }
  };

  const handlePlanBlueprint = async () => {
    if (!brief.name.trim() || !brief.description.trim()) {
      setBatchError('Enter a product name and physical description before planning.');
      return;
    }
    setBatchError(null);
    await requestBlueprintGeneration();
  };

  const handleGenerateSingle = async (mediumId: string) => {
    const medium = mediums.find((m) => m.id === mediumId);
    if (!medium) return;

    if (!brief.name.trim() || !brief.description.trim()) {
      setBatchError('Enter a product name and physical description before rendering.');
      return;
    }

    setBatchError(null);
    const activeBlueprint = blueprint ?? (await requestBlueprintGeneration());
    const resolvedAnchorUrl =
      anchor.imageUrl ?? (await requestAnchorGeneration(activeBlueprint?.consistencyLock));
    if (!resolvedAnchorUrl) {
      setBatchError(
        'Could not establish the Canonical Product Anchor. Resolve the anchor error above to continue.'
      );
      return;
    }

    await renderMediumShot(medium, resolvedAnchorUrl, activeBlueprint);
  };

  const handleGenerateBatch = async () => {
    const targets = mediums.filter((m) => selectedIds.includes(m.id));
    if (targets.length === 0) return;

    if (!brief.name.trim() || !brief.description.trim()) {
      setBatchError('Enter a product name and physical description before rendering.');
      return;
    }

    setIsGeneratingBatch(true);
    setBatchError(null);

    const campaignSection = document.getElementById('campaign');
    campaignSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });

    const activeBlueprint = blueprint ?? (await requestBlueprintGeneration());
    const resolvedAnchorUrl =
      anchor.imageUrl ?? (await requestAnchorGeneration(activeBlueprint?.consistencyLock));
    if (!resolvedAnchorUrl) {
      setIsGeneratingBatch(false);
      setBatchError(
        'Unable to render the Canonical Product Anchor. Check the error message in Section 01 and try again.'
      );
      return;
    }

    for (const medium of targets) {
      const result = await renderMediumShot(medium, resolvedAnchorUrl, activeBlueprint);
      if (
        !result.ok &&
        result.error &&
        (result.error.includes('Secrets') ||
          result.error.includes('429') ||
          result.error.includes('quota'))
      ) {
        setBatchError(result.error);
        break;
      }
    }

    setIsGeneratingBatch(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8FA] text-[#111315]">
      <TopBar
        isGeneratingBatch={isGeneratingBatch}
        selectedCount={selectedIds.length}
        onGenerateCampaign={handleGenerateBatch}
      />

      <main className="flex-1 max-w-[1280px] w-full mx-auto px-6 md:px-10">
        <BriefStudio
          brief={brief}
          anchor={anchor}
          onChangeBrief={handleChangeBrief}
          onGenerateAnchor={() => requestAnchorGeneration()}
          onUploadAnchor={handleUploadAnchor}
          onClearAnchor={handleClearAnchor}
        />

        <MediumSelector
          mediums={mediums}
          selectedIds={selectedIds}
          onToggleMedium={handleToggleMedium}
          onSelectCoreTrio={handleSelectCoreTrio}
          onSelectAll={handleSelectAll}
          onAddCustomMedium={handleAddCustomMedium}
          onRemoveCustomMedium={handleRemoveCustomMedium}
        />

        <CampaignBoard
          mediums={mediums}
          selectedIds={selectedIds}
          shots={shots}
          blueprint={blueprint}
          isPlanningBlueprint={isPlanningBlueprint}
          isGeneratingBatch={isGeneratingBatch}
          batchError={batchError}
          productName={brief.name}
          onPlanBlueprint={handlePlanBlueprint}
          onGenerateSingle={handleGenerateSingle}
          onUpdateArtDirection={handleUpdateArtDirection}
          onInspectShot={(medium, shot) => setLightboxTarget({ medium, shot })}
          onGenerateBatch={handleGenerateBatch}
        />

        <section id="standards" className="py-12">
          <p className="text-xs font-mono text-[#6B7280] tracking-tight mb-2">
            04 · Campaign Guardrails
          </p>
          <h2 className="text-2xl font-semibold tracking-tight text-[#111315] mb-8">
            Active Generation Directives
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="border-t border-[#D1D5DB] pt-4">
              <h3 className="text-sm font-semibold text-[#111315] mb-1.5">
                01. Locked Product Consistency
              </h3>
              <p className="text-sm text-[#4B5563] leading-relaxed">
                Gemini Flash (<code className="font-mono text-xs">gemini-3.8-flash</code> with automatic <code className="font-mono text-xs">gemini-3.1-flash-lite</code> failover) locks physical invariants into a campaign blueprint, and every render conditions on the Canonical Product Anchor image.
              </p>
            </div>

            <div className="border-t border-[#D1D5DB] pt-4">
              <h3 className="text-sm font-semibold text-[#111315] mb-1.5">
                02. Strictly Uninhabited Scenes
              </h3>
              <p className="text-sm text-[#4B5563] leading-relaxed">
                Every billboard, broadsheet, transit pavilion, and studio composition enforces a zero-people constraint—no models, hands, pedestrians, drivers, or human silhouettes.
              </p>
            </div>

            <div className="border-t border-[#D1D5DB] pt-4">
              <h3 className="text-sm font-semibold text-[#111315] mb-1.5">
                03. Minimalist Composition
              </h3>
              <p className="text-sm text-[#4B5563] leading-relaxed">
                Images render with Nano-Banana Lite (<code className="font-mono text-xs">gemini-3.1-flash-lite-image</code>) using generous negative space, architectural shadow discipline, and restrained Swiss layout balance.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#E2E5EA] bg-white">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6B7280]">
          <span>Brand Builder · Multi-Medium Minimalist Campaign Studio</span>
          <span className="font-mono">
            Blueprint: gemini-3.8-flash / gemini-3.1-flash-lite · Images: gemini-3.1-flash-lite-image
          </span>
        </div>
      </footer>

      <LightboxModal
        medium={lightboxTarget?.medium ?? null}
        shot={lightboxTarget?.shot ?? null}
        productName={brief.name}
        onClose={() => setLightboxTarget(null)}
      />
    </div>
  );
}
