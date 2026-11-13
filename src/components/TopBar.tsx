import React from 'react';

interface TopBarProps {
  isGeneratingBatch: boolean;
  selectedCount: number;
  onGenerateCampaign: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  isGeneratingBatch,
  selectedCount,
  onGenerateCampaign,
}) => {
  const appVersion = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '1.1.0';

  return (
    <header className="sticky top-0 z-30 bg-[#F7F8FA]/95 backdrop-blur-sm border-b border-[#E2E5EA]">
      <div className="max-w-[1280px] mx-auto px-6 md:px-10 h-16 flex items-center justify-between gap-8">
        <a
          href="#brief"
          className="font-display text-lg font-bold tracking-tight text-[#111315] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1D4ED8]"
        >
          Brand Builder
        </a>

        <nav
          aria-label="Primary"
          className="hidden md:flex items-center gap-6 text-sm font-medium text-[#4B5563]"
        >
          <a
            href="#brief"
            className="hover:text-[#111315] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Product Brief
          </a>
          <a
            href="#mediums"
            className="hover:text-[#111315] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Mediums
          </a>
          <a
            href="#campaign"
            className="hover:text-[#111315] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Campaign Board
          </a>
          <a
            href="#standards"
            className="hover:text-[#111315] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Standards
          </a>
        </nav>

        <div className="flex items-center gap-4 shrink-0">
          <span
            aria-label={`Version ${appVersion}`}
            className="text-xs font-mono text-[#6B7280] tabular-nums whitespace-nowrap shrink-0"
          >
            v{appVersion}
          </span>
          <button
            type="button"
            onClick={onGenerateCampaign}
            disabled={isGeneratingBatch || selectedCount === 0}
            className="px-4 py-2 text-sm font-medium text-white bg-[#1D4ED8] hover:bg-[#1E40AF] disabled:bg-[#9CA3AF] disabled:cursor-not-allowed rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8]"
          >
            {isGeneratingBatch
              ? 'Generating...'
              : `Generate Campaign (${selectedCount})`}
          </button>
        </div>
      </div>
    </header>
  );
};
