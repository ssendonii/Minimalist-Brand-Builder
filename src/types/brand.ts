export type AspectRatio = '1:1' | '3:4' | '4:3' | '9:16' | '16:9';

export type AestheticMood =
  | 'gallery-stone'
  | 'matte-slate'
  | 'raw-newsprint'
  | 'architectural-concrete';

export interface ProductBrief {
  name: string;
  description: string;
  tagline: string;
  palette: string;
  mood: AestheticMood;
}

export interface MediumDefinition {
  id: string;
  name: string;
  category: string;
  aspectRatio: AspectRatio;
  sceneBrief: string;
  defaultSelected?: boolean;
  isCustom?: boolean;
}

export type ShotStatus = 'idle' | 'generating' | 'ready' | 'error';

export interface GeneratedShot {
  mediumId: string;
  imageUrl: string | null;
  status: ShotStatus;
  error: string | null;
  artDirectionNote: string;
  promptUsed: string | null;
  updatedAt: number | null;
}

export interface AnchorState {
  imageUrl: string | null;
  source: 'generated' | 'uploaded' | null;
  status: ShotStatus;
  error: string | null;
}

export interface MediumBlueprint {
  mediumId: string;
  compositionNote: string;
  typographyNote: string;
}

export interface CampaignBlueprint {
  consistencyLock: string;
  minimalistDirective: string;
  mediumDirections: MediumBlueprint[];
}

