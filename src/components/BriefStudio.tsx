import React, { useRef } from 'react';
import { Upload, RefreshCw, Trash2, Sparkles, AlertCircle } from 'lucide-react';
import type { AnchorState, ProductBrief } from '../types/brand';
import { MOOD_OPTIONS, STARTER_BRIEFS } from '../data/mediums';

interface BriefStudioProps {
  brief: ProductBrief;
  anchor: AnchorState;
  onChangeBrief: (next: ProductBrief) => void;
  onGenerateAnchor: () => void;
  onUploadAnchor: (dataUrl: string) => void;
  onClearAnchor: () => void;
}

export const BriefStudio: React.FC<BriefStudioProps> = ({
  brief,
  anchor,
  onChangeBrief,
  onGenerateAnchor,
  onUploadAnchor,
  onClearAnchor,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onUploadAnchor(reader.result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <section id="brief" className="pt-10 pb-12 border-b border-[#E2E5EA]">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-mono text-[#6B7280] tracking-tight mb-2">
            01 · Product Specification &amp; Visual Anchor
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-[#111315] text-balance max-w-2xl">
            Describe your product once. Imagine it across every minimalist medium.
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <span className="text-xs text-[#6B7280] mr-1">Starter briefs:</span>
          {STARTER_BRIEFS.map((preset) => {
            const isActive = brief.name === preset.brief.name;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onChangeBrief(preset.brief)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8] ${
                  isActive
                    ? 'bg-[#111315] text-white border-[#111315]'
                    : 'bg-white text-[#374151] border-[#E2E5EA] hover:border-[#9CA3AF]'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <div className="lg:col-span-7 bg-white border border-[#E2E5EA] rounded-xl p-6 md:p-8 flex flex-col justify-between gap-6">
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label
                  htmlFor="product-name"
                  className="block text-sm font-medium text-[#111315] mb-1.5"
                >
                  Product Name
                </label>
                <input
                  id="product-name"
                  type="text"
                  value={brief.name}
                  onChange={(e) => onChangeBrief({ ...brief, name: e.target.value })}
                  placeholder="e.g. Kanso Pour-Over Kettle"
                  className="w-full px-3.5 py-2.5 text-sm bg-[#F7F8FA] border border-[#E2E5EA] rounded-lg text-[#111315] placeholder:text-[#9CA3AF] focus:bg-white focus:border-[#1D4ED8] focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label
                  htmlFor="product-tagline"
                  className="block text-sm font-medium text-[#111315] mb-1.5"
                >
                  Minimalist Headline (Optional)
                </label>
                <input
                  id="product-tagline"
                  type="text"
                  value={brief.tagline}
                  onChange={(e) => onChangeBrief({ ...brief, tagline: e.target.value })}
                  placeholder="e.g. Quiet Boil."
                  className="w-full px-3.5 py-2.5 text-sm bg-[#F7F8FA] border border-[#E2E5EA] rounded-lg text-[#111315] placeholder:text-[#9CA3AF] focus:bg-white focus:border-[#1D4ED8] focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="product-description"
                className="block text-sm font-medium text-[#111315] mb-1.5"
              >
                Physical Silhouette, Materials &amp; Details
              </label>
              <textarea
                id="product-description"
                rows={4}
                value={brief.description}
                onChange={(e) => onChangeBrief({ ...brief, description: e.target.value })}
                placeholder="Describe exact geometry, materials, surface finish, proportions, hardware, and label placement so every shot maintains product fidelity..."
                className="w-full px-3.5 py-2.5 text-sm leading-relaxed bg-[#F7F8FA] border border-[#E2E5EA] rounded-lg text-[#111315] placeholder:text-[#9CA3AF] focus:bg-white focus:border-[#1D4ED8] focus:outline-none transition-colors resize-y"
              />
            </div>

            <div>
              <label
                htmlFor="product-palette"
                className="block text-sm font-medium text-[#111315] mb-1.5"
              >
                Color &amp; Material Palette
              </label>
              <input
                id="product-palette"
                type="text"
                value={brief.palette}
                onChange={(e) => onChangeBrief({ ...brief, palette: e.target.value })}
                placeholder="e.g. Chalk white ceramic, smoked walnut, muted brass"
                className="w-full px-3.5 py-2.5 text-sm bg-[#F7F8FA] border border-[#E2E5EA] rounded-lg text-[#111315] placeholder:text-[#9CA3AF] focus:bg-white focus:border-[#1D4ED8] focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#E2E5EA]">
            <span className="block text-sm font-medium text-[#111315] mb-2.5">
              Campaign Surface Mood
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {MOOD_OPTIONS.map((option) => {
                const selected = brief.mood === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => onChangeBrief({ ...brief, mood: option.id })}
                    className={`px-3 py-2 text-xs font-medium rounded-lg border text-left transition-colors whitespace-nowrap truncate cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8] ${
                      selected
                        ? 'bg-[#1D4ED8]/8 text-[#1D4ED8] border-[#1D4ED8]'
                        : 'bg-[#F7F8FA] text-[#4B5563] border-[#E2E5EA] hover:border-[#9CA3AF] hover:text-[#111315]'
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 bg-white border border-[#E2E5EA] rounded-xl p-6 md:p-8 flex flex-col justify-between gap-5">
          <div>
            <div className="flex items-center justify-between gap-4 mb-1">
              <h2 className="text-base font-semibold text-[#111315]">
                Canonical Product Anchor
              </h2>
              <span className="text-xs font-mono text-[#6B7280] tabular-nums">
                1:1 · Reference Lock
              </span>
            </div>
            <p className="text-xs text-[#6B7280] leading-relaxed">
              Every medium shot is visually conditioned on this anchor to keep silhouette, materials, and proportions identical across scenes.
            </p>
          </div>

          <div className="relative aspect-square w-full bg-[#F4F4F2] border border-[#E2E5EA] rounded-lg overflow-hidden flex items-center justify-center">
            {anchor.status === 'generating' ? (
              <div className="flex flex-col items-center justify-center gap-3 p-6 text-center">
                <RefreshCw className="w-5 h-5 text-[#1D4ED8] animate-spin" />
                <div>
                  <p className="text-sm font-medium text-[#111315]">
                    Rendering Studio Anchor
                  </p>
                  <p className="text-xs text-[#6B7280] mt-1">
                    Nano-Banana Flash · Minimalist 1:1 Reference
                  </p>
                </div>
              </div>
            ) : anchor.imageUrl ? (
              <img
                src={anchor.imageUrl}
                alt={`Canonical studio anchor for ${brief.name || 'product'}`}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 p-8 text-center">
                <div className="w-10 h-10 rounded-full border border-[#D1D5DB] flex items-center justify-center text-[#6B7280]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <p className="text-sm font-medium text-[#111315]">
                  No Anchor Locked Yet
                </p>
                <p className="text-xs text-[#6B7280] max-w-[26ch]">
                  Generate an isolated studio shot or upload an existing product image.
                </p>
              </div>
            )}
          </div>

          {anchor.error && (
            <div
              role="alert"
              className="flex items-start gap-2.5 p-3 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#991B1B]"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#DC2626]" />
              <span>{anchor.error}</span>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={onGenerateAnchor}
              disabled={
                anchor.status === 'generating' ||
                !brief.name.trim() ||
                !brief.description.trim()
              }
              className="flex-1 min-w-[140px] px-4 py-2 text-xs font-medium text-white bg-[#111315] hover:bg-[#27272A] disabled:bg-[#9CA3AF] disabled:cursor-not-allowed rounded-lg transition-colors whitespace-nowrap cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8]"
            >
              {anchor.imageUrl ? 'Regenerate Anchor' : 'Generate Anchor'}
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={anchor.status === 'generating'}
              className="px-3.5 py-2 text-xs font-medium text-[#374151] bg-[#F7F8FA] hover:bg-[#EBEEF2] border border-[#E2E5EA] rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8]"
            >
              <Upload className="w-3.5 h-3.5" />
              Upload Photo
            </button>

            {anchor.imageUrl && (
              <button
                type="button"
                onClick={onClearAnchor}
                aria-label="Clear product anchor"
                className="p-2 text-[#6B7280] hover:text-[#DC2626] bg-[#F7F8FA] hover:bg-[#FEF2F2] border border-[#E2E5EA] rounded-lg transition-colors shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8]"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
