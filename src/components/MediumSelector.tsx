import React, { useState } from 'react';
import { Plus, X, Check } from 'lucide-react';
import type { AspectRatio, MediumDefinition } from '../types/brand';

interface MediumSelectorProps {
  mediums: MediumDefinition[];
  selectedIds: string[];
  onToggleMedium: (id: string) => void;
  onSelectCoreTrio: () => void;
  onSelectAll: () => void;
  onAddCustomMedium: (medium: MediumDefinition) => void;
  onRemoveCustomMedium: (id: string) => void;
}

const ASPECT_OPTIONS: AspectRatio[] = ['16:9', '3:4', '1:1', '4:3', '9:16'];

export const MediumSelector: React.FC<MediumSelectorProps> = ({
  mediums,
  selectedIds,
  onToggleMedium,
  onSelectCoreTrio,
  onSelectAll,
  onAddCustomMedium,
  onRemoveCustomMedium,
}) => {
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customCategory, setCustomCategory] = useState('Custom');
  const [customRatio, setCustomRatio] = useState<AspectRatio>('4:3');
  const [customBrief, setCustomBrief] = useState('');

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim() || !customBrief.trim()) return;

    const newMedium: MediumDefinition = {
      id: `custom-${Date.now()}`,
      name: customName.trim(),
      category: customCategory.trim() || 'Custom',
      aspectRatio: customRatio,
      sceneBrief: customBrief.trim(),
      isCustom: true,
    };
    onAddCustomMedium(newMedium);
    setCustomName('');
    setCustomBrief('');
    setShowCustomForm(false);
  };

  return (
    <section id="mediums" className="py-12 border-b border-[#E2E5EA]">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <p className="text-xs font-mono text-[#6B7280] tracking-tight mb-2">
            02 · Campaign Mediums
          </p>
          <h2 className="text-2xl font-semibold tracking-tight text-[#111315]">
            Select Placements &amp; Formats
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono text-[#6B7280] tabular-nums mr-2">
            {selectedIds.length} of {mediums.length} selected
          </span>
          <button
            type="button"
            onClick={onSelectCoreTrio}
            className="px-3 py-1.5 text-xs font-medium text-[#374151] bg-white hover:bg-[#F1F3F6] border border-[#E2E5EA] rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Core Trio
          </button>
          <button
            type="button"
            onClick={onSelectAll}
            className="px-3 py-1.5 text-xs font-medium text-[#374151] bg-white hover:bg-[#F1F3F6] border border-[#E2E5EA] rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Select All
          </button>
          <button
            type="button"
            onClick={() => setShowCustomForm((prev) => !prev)}
            className="px-3 py-1.5 text-xs font-medium text-[#1D4ED8] bg-white hover:bg-[#1D4ED8]/5 border border-[#1D4ED8]/40 rounded-md transition-colors inline-flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
          >
            {showCustomForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            {showCustomForm ? 'Close' : 'Add Medium'}
          </button>
        </div>
      </div>

      {showCustomForm && (
        <form
          onSubmit={handleCreateCustom}
          className="mb-6 bg-white border border-[#E2E5EA] rounded-xl p-6 space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="custom-medium-name"
                className="block text-xs font-medium text-[#111315] mb-1.5"
              >
                Medium Name
              </label>
              <input
                id="custom-medium-name"
                type="text"
                required
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g. Airport Lightbox"
                className="w-full px-3 py-2 text-sm bg-[#F7F8FA] border border-[#E2E5EA] rounded-lg focus:bg-white focus:border-[#1D4ED8] focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="custom-medium-category"
                className="block text-xs font-medium text-[#111315] mb-1.5"
              >
                Category
              </label>
              <input
                id="custom-medium-category"
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="e.g. Out of Home"
                className="w-full px-3 py-2 text-sm bg-[#F7F8FA] border border-[#E2E5EA] rounded-lg focus:bg-white focus:border-[#1D4ED8] focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="custom-medium-ratio"
                className="block text-xs font-medium text-[#111315] mb-1.5"
              >
                Aspect Ratio
              </label>
              <select
                id="custom-medium-ratio"
                value={customRatio}
                onChange={(e) => setCustomRatio(e.target.value as AspectRatio)}
                className="w-full px-3 py-2 text-sm bg-[#F7F8FA] border border-[#E2E5EA] rounded-lg focus:bg-white focus:border-[#1D4ED8] focus:outline-none"
              >
                {ASPECT_OPTIONS.map((ratio) => (
                  <option key={ratio} value={ratio}>
                    {ratio}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="custom-medium-brief"
              className="block text-xs font-medium text-[#111315] mb-1.5"
            >
              Minimalist Scene &amp; Placement Brief
            </label>
            <textarea
              id="custom-medium-brief"
              rows={2}
              required
              value={customBrief}
              onChange={(e) => setCustomBrief(e.target.value)}
              placeholder="Describe the uninhabited architectural environment and how the product is framed..."
              className="w-full px-3 py-2 text-sm bg-[#F7F8FA] border border-[#E2E5EA] rounded-lg focus:bg-white focus:border-[#1D4ED8] focus:outline-none resize-none"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowCustomForm(false)}
              className="px-4 py-2 text-xs font-medium text-[#4B5563] hover:text-[#111315] rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium text-white bg-[#1D4ED8] hover:bg-[#1E40AF] rounded-lg transition-colors cursor-pointer"
            >
              Add Placement
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {mediums.map((medium) => {
          const isSelected = selectedIds.includes(medium.id);
          return (
            <div
              key={medium.id}
              className={`relative rounded-xl border transition-colors ${
                isSelected
                  ? 'bg-white border-[#1D4ED8]'
                  : 'bg-white border-[#E2E5EA] hover:border-[#9CA3AF]'
              }`}
            >
              <button
                type="button"
                onClick={() => onToggleMedium(medium.id)}
                className="w-full text-left p-4 pr-10 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8] rounded-xl"
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-sm font-medium text-[#111315] truncate">
                    {medium.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#6B7280] font-mono tabular-nums">
                  <span>{medium.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>{medium.aspectRatio}</span>
                </div>
              </button>

              <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5">
                {medium.isCustom && (
                  <button
                    type="button"
                    onClick={() => onRemoveCustomMedium(medium.id)}
                    aria-label={`Remove ${medium.name}`}
                    className="p-1 text-[#9CA3AF] hover:text-[#DC2626] transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onToggleMedium(medium.id)}
                  aria-label={isSelected ? `Deselect ${medium.name}` : `Select ${medium.name}`}
                  className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#1D4ED8] border-[#1D4ED8] text-white'
                      : 'bg-[#F7F8FA] border-[#D1D5DB] text-transparent'
                  }`}
                >
                  <Check className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
