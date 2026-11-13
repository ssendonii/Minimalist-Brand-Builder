# Brand Builder

Minimalist multi-medium brand campaign studio powered by server-side Gemini API routes. Describe a product once, lock a canonical `1:1` studio reference anchor, and render consistent, uninhabited (zero-people), minimalist imagery across billboards, broadsheet newspapers, social posts, and custom formats.

## Architecture Highlights

- **Server-Side AI Resilience**: All `@google/genai` calls execute strictly on the Express server (`server.ts`) wrapped in `generateWithRetryAndFallback` with an 18-second `withTimeout` guard per model attempt.
- **Automatic Model Failover**: Blueprint planning uses `gemini-3.8-flash` with `ThinkingLevel.LOW` and automatic failover to `gemini-3.1-flash-lite` on transient demand/rate errors (`503`, `429`, `UNAVAILABLE`, `RESOURCE_EXHAUSTED`), timeouts, or `404` / `NOT_FOUND`. Image rendering uses `gemini-3.1-flash-lite-image` (Nano-Banana Lite).
- **Safe Frontend Fetch**: All API requests read raw response text first and handle HTML/non-JSON proxy error responses gracefully.

## Version History

### v1.1.0 (2026-11-12)
- Added `generateWithRetryAndFallback` with 18-second `withTimeout` per model attempt and automatic failover from `gemini-3.8-flash` to `gemini-3.1-flash-lite`.
- Configured `ThinkingLevel.LOW` for fast structured JSON blueprint generation and defensive markdown code-fence stripping before `JSON.parse`.
- Added `safeFetchJson` on the frontend to read raw response text first and translate HTML/non-JSON proxy errors cleanly.
- Synchronized application header version indicator with `package.json`.

### v1.0.0 (2026-11-12)
- Initial release of Brand Builder with Canonical Product Anchor conditioning, zero-people and minimalism guardrails, multi-medium selector, custom placement builder, and Lightbox inspection/download.
