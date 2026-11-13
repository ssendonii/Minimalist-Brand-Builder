import React, { useEffect, useState } from 'react';
import { X, Download, ChevronDown, ChevronUp } from 'lucide-react';
import type { GeneratedShot, MediumDefinition } from '../types/brand';

interface LightboxModalProps {
  medium: MediumDefinition | null;
  shot: GeneratedShot | null;
  productName: string;
  onClose: () => void;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({
  medium,
  shot,
  productName,
  onClose,
}) => {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if (!medium || !shot) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [medium, shot, onClose]);

  if (!medium || !shot || !shot.imageUrl) return null;

  const handleDownload = () => {
    if (!shot.imageUrl) return;
    const slug = (productName || 'brand-product')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-');
    const link = document.createElement('a');
    link.href = shot.imageUrl;
    link.download = `${slug}-${medium.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${medium.name} preview`}
      className="fixed inset-0 z-50 bg-[#0B0C0E]/92 flex flex-col justify-between p-6 md:p-10"
    >
      <div className="flex items-center justify-between gap-4 text-white">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">{medium.name}</h2>
          <p className="text-xs font-mono text-white/70 tabular-nums mt-0.5">
            {medium.category} · {medium.aspectRatio} · Nano-Banana Flash
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleDownload}
            className="px-3.5 py-2 text-xs font-medium text-[#111315] bg-white hover:bg-white/90 rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Download PNG
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close preview"
            className="p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex items-center justify-center py-6">
        <img
          src={shot.imageUrl}
          alt={`${productName} in ${medium.name}`}
          referrerPolicy="no-referrer"
          className="max-h-full max-w-full object-contain rounded-lg shadow-2xl"
        />
      </div>

      <div className="max-w-3xl mx-auto w-full text-white/80">
        {shot.promptUsed && (
          <div className="border-t border-white/15 pt-3">
            <button
              type="button"
              onClick={() => setShowPrompt((prev) => !prev)}
              className="text-xs font-medium text-white/80 hover:text-white inline-flex items-center gap-1.5 cursor-pointer"
            >
              {showPrompt ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronUp className="w-3.5 h-3.5" />
              )}
              {showPrompt ? 'Hide Generation Directive' : 'View Generation Directive'}
            </button>
            {showPrompt && (
              <p className="mt-2 text-xs leading-relaxed text-white/70 font-mono max-h-28 overflow-y-auto">
                {shot.promptUsed}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
