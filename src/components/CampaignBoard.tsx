import React, { useState } from 'react';
import {
  Maximize2,
  RefreshCw,
  Download,
  AlertCircle,
  SlidersHorizontal,
} from 'lucide-react';
import type {
  AspectRatio,
  CampaignBlueprint,
  GeneratedShot,
  MediumDefinition,
} from '../types/brand';

interface CampaignBoardProps {
  mediums: MediumDefinition[];
  selectedIds: string[];
  shots: Record<string, GeneratedShot>;
  blueprint: CampaignBlueprint | null;
  isPlanningBlueprint: boolean;
  isGeneratingBatch: boolean;
  batchError: string | null;
  productName: string;
  onPlanBlueprint: () => void;
  onGenerateSingle: (mediumId: string) => void;
  onUpdateArtDirection: (mediumId: string, note: string) => void;
  onInspectShot: (medium: MediumDefinition, shot: GeneratedShot) => void;
  onGenerateBatch: () => void;
}

const ASPECT_CLASS_MAP: Record<AspectRatio, string> = {
  '16:9': 'aspect-video',
  '3:4': 'aspect-[3/4]',
  '1:1': 'aspect-square',
  '4:3': 'aspect-[4/3]',
  '9:16': 'aspect-[9/16]',
};

function triggerDownload(imageUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.href = imageUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export const CampaignBoard: React.FC<CampaignBoardProps> = ({
  mediums,
  selectedIds,
  shots,
  blueprint,
  isPlanningBlueprint,
  isGeneratingBatch,
  batchError,
  productName,
  onPlanBlueprint,
  onGenerateSingle,
  onUpdateArtDirection,
  onInspectShot,
  onGenerateBatch,
}) => {
  const [openNoteIds, setOpenNoteIds] = useState<Record<string, boolean>>({});
  const activeMediums = mediums.filter((m) => selectedIds.includes(m.id));
  const readyCount = activeMediums.filter((m) => shots[m.id]?.status === 'ready').length;

  const toggleNoteEditor = (id: string) => {
    setOpenNoteIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDownloadAll = () => {
    activeMediums.forEach((medium) => {
      const shot = shots[medium.id];
      if (shot?.imageUrl) {
        const slug = (productName || 'brand-product')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-');
        triggerDownload(shot.imageUrl, `${slug}-${medium.id}.png`);
      }
    });
  };

  return (
    <section id="campaign" className="py-12 border-b border-[#E2E5EA]">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-xs font-mono text-[#6B7280] tracking-tight mb-2">
            03 · Campaign Contact Sheet
          </p>
          <h2 className="text-2xl font-semibold tracking-tight text-[#111315]">
            Multi-Medium Renders
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-mono text-[#6B7280] tabular-nums">
            {readyCount}/{activeMediums.length} rendered
          </span>

          {readyCount > 0 && (
            <button
              type="button"
              onClick={handleDownloadAll}
              className="px-3.5 py-2 text-xs font-medium text-[#374151] bg-white hover:bg-[#F1F3F6] border border-[#E2E5EA] rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Download Ready ({readyCount})
            </button>
          )}

          <button
            type="button"
            onClick={onPlanBlueprint}
            disabled={isPlanningBlueprint || isGeneratingBatch || activeMediums.length === 0}
            className="px-3.5 py-2 text-xs font-medium text-[#374151] bg-white hover:bg-[#F1F3F6] disabled:opacity-50 border border-[#E2E5EA] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {isPlanningBlueprint ? 'Planning Blueprint...' : 'Plan Art Direction'}
          </button>

          <button
            type="button"
            onClick={onGenerateBatch}
            disabled={isGeneratingBatch || activeMediums.length === 0}
            className="px-4 py-2 text-xs font-medium text-white bg-[#111315] hover:bg-[#27272A] disabled:bg-[#9CA3AF] disabled:cursor-not-allowed rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {isGeneratingBatch ? 'Rendering Batch...' : 'Render Selected Mediums'}
          </button>
        </div>
      </div>

      {blueprint && (
        <div className="mb-8 bg-white border border-[#E2E5EA] rounded-xl p-5 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-mono text-[#6B7280] mb-1">
              Consistency Lock · Gemini Flash Lite
            </p>
            <p className="text-sm text-[#111315] leading-relaxed">
              {blueprint.consistencyLock}
            </p>
          </div>
          <div>
            <p className="text-xs font-mono text-[#6B7280] mb-1">
              Minimalist &amp; Negative Space Rule
            </p>
            <p className="text-sm text-[#111315] leading-relaxed">
              {blueprint.minimalistDirective}
            </p>
          </div>
        </div>
      )}

      {batchError && (
        <div
          role="alert"
          className="mb-8 flex items-start gap-3 p-4 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-sm text-[#991B1B]"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#DC2626]" />
          <div>
            <p className="font-medium">Generation Halted</p>
            <p className="text-xs mt-0.5 leading-relaxed">{batchError}</p>
          </div>
        </div>
      )}

      {activeMediums.length === 0 ? (
        <div className="bg-white border border-[#E2E5EA] rounded-xl p-12 text-center">
          <p className="text-base font-medium text-[#111315]">
            No mediums selected
          </p>
          <p className="text-sm text-[#6B7280] mt-1">
            Select at least one placement format above to compose your campaign contact sheet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 items-start">
          {activeMediums.map((medium, index) => {
            const shot = shots[medium.id];
            const status = shot?.status ?? 'idle';
            const aspectClass = ASPECT_CLASS_MAP[medium.aspectRatio];
            const indexLabel = String(index + 1).padStart(2, '0');
            const showNoteInput = Boolean(openNoteIds[medium.id]);
            const statusText =
              status === 'generating'
                ? 'Rendering'
                : status === 'ready'
                  ? 'Complete'
                  : status === 'error'
                    ? 'Failed'
                    : 'Ready to Render';

            return (
              <article
                key={medium.id}
                className="bg-white border border-[#E2E5EA] rounded-xl p-5 flex flex-col gap-4"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-base font-semibold text-[#111315] truncate">
                      {indexLabel}. {medium.name}
                    </h3>
                    <p className="text-xs font-mono text-[#6B7280] tabular-nums mt-0.5">
                      {medium.category} · {medium.aspectRatio}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-medium whitespace-nowrap shrink-0 ${
                      status === 'error'
                        ? 'text-[#DC2626]'
                        : status === 'ready'
                          ? 'text-[#1D4ED8]'
                          : 'text-[#6B7280]'
                    }`}
                  >
                    {statusText}
                  </span>
                </div>

                <div
                  className={`relative w-full ${aspectClass} bg-[#F3F4F6] border border-[#E2E5EA] rounded-lg overflow-hidden flex items-center justify-center`}
                >
                  {status === 'generating' ? (
                    <div className="flex flex-col items-center justify-center gap-3 p-6 text-center">
                      <RefreshCw className="w-5 h-5 text-[#1D4ED8] animate-spin" />
                      <div>
                        <p className="text-xs font-medium text-[#111315]">
                          Composing {medium.name}
                        </p>
                        <p className="text-xs text-[#6B7280] mt-0.5">
                          Nano-Banana Flash · Zero People
                        </p>
                      </div>
                    </div>
                  ) : shot?.imageUrl ? (
                    <button
                      type="button"
                      onClick={() => onInspectShot(medium, shot)}
                      className="group relative w-full h-full block cursor-zoom-in focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8]"
                    >
                      <img
                        src={shot.imageUrl}
                        alt={`${productName || 'Product'} featured in ${medium.name}`}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                      />
                    </button>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-3 p-6 text-center">
                      <span className="text-xs font-mono text-[#9CA3AF] tabular-nums">
                        {medium.aspectRatio}
                      </span>
                      <p className="text-xs text-[#6B7280] max-w-[28ch] leading-relaxed">
                        {medium.sceneBrief}
                      </p>
                      <button
                        type="button"
                        onClick={() => onGenerateSingle(medium.id)}
                        disabled={isGeneratingBatch}
                        className="px-3.5 py-1.5 text-xs font-medium text-[#111315] bg-white hover:bg-[#F7F8FA] border border-[#D1D5DB] rounded-md transition-colors cursor-pointer disabled:opacity-50"
                      >
                        Render Shot
                      </button>
                    </div>
                  )}
                </div>

                {shot?.error && (
                  <div
                    role="alert"
                    className="flex items-start gap-2 p-2.5 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#991B1B]"
                  >
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#DC2626]" />
                    <span>{shot.error}</span>
                  </div>
                )}

                {showNoteInput && (
                  <div className="pt-1">
                    <label
                      htmlFor={`note-${medium.id}`}
                      className="block text-xs font-medium text-[#374151] mb-1"
                    >
                      Art Direction Tweak
                    </label>
                    <input
                      id={`note-${medium.id}`}
                      type="text"
                      value={shot?.artDirectionNote ?? ''}
                      onChange={(e) => onUpdateArtDirection(medium.id, e.target.value)}
                      placeholder="e.g. Cooler dawn mist, longer shadow on left"
                      className="w-full px-3 py-1.5 text-xs bg-[#F7F8FA] border border-[#E2E5EA] rounded-md text-[#111315] placeholder:text-[#9CA3AF] focus:bg-white focus:border-[#1D4ED8] focus:outline-none"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#E2E5EA]">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onGenerateSingle(medium.id)}
                      disabled={status === 'generating' || isGeneratingBatch}
                      className="px-3 py-1.5 text-xs font-medium text-[#111315] bg-[#F7F8FA] hover:bg-[#EBEEF2] disabled:opacity-50 rounded-md transition-colors inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      {shot?.imageUrl ? 'Regenerate' : 'Render'}
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleNoteEditor(medium.id)}
                      aria-expanded={showNoteInput}
                      className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors inline-flex items-center gap-1 whitespace-nowrap cursor-pointer ${
                        showNoteInput || shot?.artDirectionNote
                          ? 'text-[#1D4ED8] bg-[#1D4ED8]/8'
                          : 'text-[#4B5563] hover:text-[#111315] hover:bg-[#F7F8FA]'
                      }`}
                    >
                      <SlidersHorizontal className="w-3 h-3" />
                      Tune
                    </button>
                  </div>

                  {shot?.imageUrl && (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onInspectShot(medium, shot)}
                        aria-label={`Inspect ${medium.name}`}
                        className="p-1.5 text-[#4B5563] hover:text-[#111315] hover:bg-[#F7F8FA] rounded-md transition-colors cursor-pointer"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const slug = (productName || 'brand-product')
                            .toLowerCase()
                            .replace(/[^a-z0-9]+/g, '-');
                          triggerDownload(shot.imageUrl!, `${slug}-${medium.id}.png`);
                        }}
                        aria-label={`Download ${medium.name}`}
                        className="p-1.5 text-[#4B5563] hover:text-[#111315] hover:bg-[#F7F8FA] rounded-md transition-colors cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};
