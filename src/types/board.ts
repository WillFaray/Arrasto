import { Camera, Rect } from '../geometry/math';

export interface BoardImage {
  id: string;
  blobId: string;
  blobUrl: string; // Object URL created in memory
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  naturalWidth: number;
  naturalHeight: number;
  rotation: number; // in radians
  locked: boolean;
}

export type InteractionMode = 'edit' | 'action';

export type AspectRatioPreset = '16:9' | '9:16' | '1:1' | '4:3' | 'free';

export interface RecordingAreaState {
  visible: boolean;
  adjusting: boolean;
  rect: Rect; // in screen coordinates
  aspect: AspectRatioPreset;
  dim: number; // 0 to 0.95
}

export type BackgroundTheme = 'dark' | 'light';

export interface BackgroundConfig {
  kind: 'dots' | 'grid' | 'solid';
  theme?: BackgroundTheme;
  color: string;
}

export interface BoardDocument {
  version: 1;
  camera: Camera;
  mode: InteractionMode;
  recordingArea: RecordingAreaState;
  background: BackgroundConfig;
  images: Array<{
    id: string;
    blobId: string;
    name: string;
    x: number;
    y: number;
    width: number;
    height: number;
    naturalWidth: number;
    naturalHeight: number;
    rotation: number;
    locked: boolean;
  }>;
}
