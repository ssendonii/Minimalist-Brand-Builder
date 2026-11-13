import type { AestheticMood, MediumDefinition, ProductBrief } from '../types/brand';

export const MOOD_OPTIONS: {
  id: AestheticMood;
  label: string;
  surfaceNote: string;
}[] = [
  {
    id: 'gallery-stone',
    label: 'Gallery Stone',
    surfaceNote: 'Pale limestone, soft diffused daylight, clean architectural shadows, high negative space',
  },
  {
    id: 'architectural-concrete',
    label: 'Raw Concrete',
    surfaceNote: 'Brushed architectural concrete, crisp directional sunlight, stark minimalist geometry',
  },
  {
    id: 'matte-slate',
    label: 'Matte Slate',
    surfaceNote: 'Deep charcoal basalt stone, sculpted rim lighting, quiet monochromatic restraint',
  },
  {
    id: 'raw-newsprint',
    label: 'Editorial Paper',
    surfaceNote: 'Uncoated warm off-white cotton paper, subtle grain, Swiss typographic composure',
  },
];

export const DEFAULT_MEDIUMS: MediumDefinition[] = [
  {
    id: 'billboard',
    name: 'Highway Billboard',
    category: 'Out of Home',
    aspectRatio: '16:9',
    defaultSelected: true,
    sceneBrief:
      'Minimalist architectural roadside billboard structure standing against a pale cloudless morning sky beside an empty geometric concrete highway overpass. The billboard canvas displays the exact product centered with vast uncluttered negative space and restrained Swiss typography.',
  },
  {
    id: 'newspaper',
    name: 'Broadsheet Newspaper',
    category: 'Print',
    aspectRatio: '3:4',
    defaultSelected: true,
    sceneBrief:
      'Overhead flat-lay studio photograph of a crisp folded broadsheet newspaper resting on a smooth stone table. A full-page minimalist print advertisement on uncoated matte newsprint features the exact product cleanly printed in the center with subtle editorial masthead framing and generous paper margins.',
  },
  {
    id: 'social-post',
    name: 'Social Post',
    category: 'Digital',
    aspectRatio: '1:1',
    defaultSelected: true,
    sceneBrief:
      'Square minimalist editorial still-life composition featuring the exact product resting on a sculpted travertine plinth against a smooth matte plaster wall, lit by a single clean diagonal shaft of window sunlight.',
  },
  {
    id: 'vertical-story',
    name: 'Vertical Story',
    category: 'Digital',
    aspectRatio: '9:16',
    defaultSelected: false,
    sceneBrief:
      'Tall 9:16 vertical minimalist composition with the exact product anchored in the lower-middle third on an architectural ledge, leaving the upper half as serene uncluttered sky-lit plaster negative space.',
  },
  {
    id: 'magazine-spread',
    name: 'Magazine Spread',
    category: 'Editorial',
    aspectRatio: '4:3',
    defaultSelected: false,
    sceneBrief:
      'An open heavyweight matte design magazine spread lying flat on brushed travertine. One page holds crisp minimalist editorial layout space while the facing page showcases a full-bleed quiet photograph of the exact product.',
  },
  {
    id: 'transit-shelter',
    name: 'Transit Shelter',
    category: 'Out of Home',
    aspectRatio: '3:4',
    defaultSelected: false,
    sceneBrief:
      'An empty minimalist glass and anodized aluminum architectural transit shelter on a deserted quiet street at dawn, housing a backlit vertical poster featuring the exact product surrounded by pure negative space.',
  },
  {
    id: 'gallery-podium',
    name: 'Retail Podium',
    category: 'Spatial',
    aspectRatio: '4:3',
    defaultSelected: false,
    sceneBrief:
      'Inside a quiet uninhabited minimalist flagship gallery with pale plaster walls and a single monolithic limestone pedestal in the center, displaying the exact product under soft overhead skylight.',
  },
  {
    id: 'packaging-box',
    name: 'Packaging Study',
    category: 'Packaging',
    aspectRatio: '1:1',
    defaultSelected: false,
    sceneBrief:
      'Clean geometric studio composition showing the exact product standing next to its minimalist matte-board presentation box with subtle blind-debossed typography on a flat neutral surface.',
  },
];

export const STARTER_BRIEFS: {
  id: string;
  label: string;
  brief: ProductBrief;
}[] = [
  {
    id: 'kettle',
    label: 'Stoneware Kettle',
    brief: {
      name: 'Kanso Pour-Over Kettle',
      description:
        'A sculptural matte-white unglazed ceramic gooseneck kettle with a slender dark walnut cylindrical handle, recessed flat lid with a brushed brass pin knob, and clean tapered pouring spout.',
      tagline: 'Quiet Boil.',
      palette: 'Chalk white ceramic, smoked walnut, muted brass',
      mood: 'gallery-stone',
    },
  },
  {
    id: 'lamp',
    label: 'Anodized Desk Lamp',
    brief: {
      name: 'Vespera Monolith Lamp',
      description:
        'A precision-milled bead-blasted silver anodized aluminum desk lamp composed of a solid cylindrical base, an ultra-thin vertical stem, and a cantilevered flat circular disc diffuser emitting warm indirect light.',
      tagline: 'Pure Horizon.',
      palette: 'Raw bead-blasted aluminum, warm 2700K glow, slate shadow',
      mood: 'architectural-concrete',
    },
  },
  {
    id: 'essence',
    label: 'Botanical Glass Bottle',
    brief: {
      name: 'Onda No. 04 Essence',
      description:
        'A heavy-base smoked olive cylindrical apothecary glass bottle with sharp chamfered shoulders, a matte black cylindrical cap, and a minimalist off-white cotton paper label centered with crisp black sans-serif lettering.',
      tagline: 'Distilled Stillness.',
      palette: 'Smoked olive glass, matte obsidian, unbleached cotton label',
      mood: 'matte-slate',
    },
  },
];
