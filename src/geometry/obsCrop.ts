import { Rect } from './math';

export interface ObsCropValues {
  left: number;
  top: number;
  right: number;
  bottom: number;
  outputWidth: number;
  outputHeight: number;
}

/**
 * Calculates OBS Crop/Pad (Recortar/Preencher) filter values based on
 * recording area on screen, viewport dimensions and devicePixelRatio.
 */
export function calculateObsCrop(
  recordingArea: Rect,
  viewport: { width: number; height: number },
  dpr: number = window.devicePixelRatio || 1
): ObsCropValues {
  const left = Math.max(0, Math.round(recordingArea.x * dpr));
  const top = Math.max(0, Math.round(recordingArea.y * dpr));
  const right = Math.max(
    0,
    Math.round((viewport.width - (recordingArea.x + recordingArea.width)) * dpr)
  );
  const bottom = Math.max(
    0,
    Math.round((viewport.height - (recordingArea.y + recordingArea.height)) * dpr)
  );
  const outputWidth = Math.max(1, Math.round(recordingArea.width * dpr));
  const outputHeight = Math.max(1, Math.round(recordingArea.height * dpr));

  return {
    left,
    top,
    right,
    bottom,
    outputWidth,
    outputHeight,
  };
}
