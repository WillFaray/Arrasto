import React from 'react';
import { AspectRatioPreset, RecordingAreaState } from '../types/board';
import { CURSORS } from '../cursors/cursors';
import { Check, Move } from 'lucide-react';

interface RecordingAreaProps {
  state: RecordingAreaState;
  viewport: { width: number; height: number };
  onUpdate: (partial: Partial<RecordingAreaState>) => void;
  onCloseAdjust: () => void;
}

export const RecordingArea: React.FC<RecordingAreaProps> = ({
  state,
  viewport,
  onUpdate,
  onCloseAdjust,
}) => {
  if (!state.visible) return null;

  const { rect, adjusting, dim, aspect } = state;
  const dpr = window.devicePixelRatio || 1;
  const physW = Math.round(rect.width * dpr);
  const physH = Math.round(rect.height * dpr);

  const dimBg = `rgba(0, 0, 0, ${dim})`;

  // Preset aspect ratio handler
  const setPreset = (preset: AspectRatioPreset) => {
    let newH = rect.height;
    if (preset === '16:9') newH = (rect.width * 9) / 16;
    else if (preset === '9:16') newH = (rect.width * 16) / 9;
    else if (preset === '1:1') newH = rect.width;
    else if (preset === '4:3') newH = (rect.width * 3) / 4;

    onUpdate({
      aspect: preset,
      rect: { ...rect, height: Math.round(newH) },
    });
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 25,
        overflow: 'hidden',
      }}
    >
      {/* 4 Dimming Scrims outside the recording box */}
      {/* Top Scrim */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: Math.max(0, rect.y),
          backgroundColor: dimBg,
          pointerEvents: adjusting ? 'auto' : 'none',
          transition: 'background-color 0.15s ease',
        }}
      />
      {/* Bottom Scrim */}
      <div
        style={{
          position: 'absolute',
          top: Math.max(0, rect.y + rect.height),
          left: 0,
          width: '100%',
          height: Math.max(0, viewport.height - (rect.y + rect.height)),
          backgroundColor: dimBg,
          pointerEvents: adjusting ? 'auto' : 'none',
          transition: 'background-color 0.15s ease',
        }}
      />
      {/* Left Scrim */}
      <div
        style={{
          position: 'absolute',
          top: Math.max(0, rect.y),
          left: 0,
          width: Math.max(0, rect.x),
          height: Math.max(0, rect.height),
          backgroundColor: dimBg,
          pointerEvents: adjusting ? 'auto' : 'none',
          transition: 'background-color 0.15s ease',
        }}
      />
      {/* Right Scrim */}
      <div
        style={{
          position: 'absolute',
          top: Math.max(0, rect.y),
          left: Math.max(0, rect.x + rect.width),
          width: Math.max(0, viewport.width - (rect.x + rect.width)),
          height: Math.max(0, rect.height),
          backgroundColor: dimBg,
          pointerEvents: adjusting ? 'auto' : 'none',
          transition: 'background-color 0.15s ease',
        }}
      />

      {/* Recording Box Outlined Region */}
      <div
        style={{
          position: 'absolute',
          left: rect.x,
          top: rect.y,
          width: rect.width,
          height: rect.height,
          boxSizing: 'border-box',
          // Outline is outside so OBS capture does not record the stroke
          outline: adjusting
            ? '2px solid #ef4444'
            : '1.5px dashed rgba(239, 68, 68, 0.45)',
          outlineOffset: 0,
          pointerEvents: adjusting ? 'auto' : 'none',
        }}
      >
        {/* Adjusting UI Controls */}
        {adjusting && (
          <>
            {/* Center move handle */}
            <div
              data-recording-handle="move"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                cursor: CURSORS.grab,
                pointerEvents: 'auto',
              }}
            />

            {/* Adjust Bar on Top */}
            <div
              onPointerDown={(e) => e.stopPropagation()}
              style={{
                position: 'absolute',
                bottom: '100%',
                left: '50%',
                transform: 'translateX(-50%) translateY(-10px)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 12px',
                background: 'rgba(20, 21, 26, 0.95)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                borderRadius: 10,
                border: '1px solid rgba(239, 68, 68, 0.3)',
                boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
                pointerEvents: 'auto',
                whiteSpace: 'nowrap',
                userSelect: 'none',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  color: '#ef4444',
                  fontWeight: 600,
                  fontSize: 12,
                }}
              >
                <Move size={14} />
                Área de Gravação: {physW} × {physH} px
              </div>

              <div
                style={{
                  width: 1,
                  height: 16,
                  background: 'rgba(255,255,255,0.15)',
                }}
              />

              {/* Presets */}
              {(['16:9', '9:16', '1:1', '4:3', 'free'] as AspectRatioPreset[]).map(
                (p) => (
                  <button
                    key={p}
                    onClick={() => setPreset(p)}
                    style={{
                      background:
                        aspect === p
                          ? 'rgba(239, 68, 68, 0.25)'
                          : 'transparent',
                      color: aspect === p ? '#ef4444' : '#94a3b8',
                      border:
                        aspect === p
                          ? '1px solid #ef4444'
                          : '1px solid transparent',
                      padding: '2px 8px',
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {p === 'free' ? 'Livre' : p}
                  </button>
                )
              )}

              <button
                onClick={onCloseAdjust}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  background: '#ef4444',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 6,
                  padding: '3px 10px',
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                  marginLeft: 4,
                }}
              >
                <Check size={13} />
                Pronto
              </button>
            </div>

            {/* Corner Resize Handles */}
            {(['nw', 'ne', 'se', 'sw'] as const).map((handle) => {
              const isTop = handle.startsWith('n');
              const isLeft = handle.endsWith('w');
              return (
                <div
                  key={handle}
                  data-recording-handle={handle}
                  style={{
                    position: 'absolute',
                    top: isTop ? -5 : undefined,
                    bottom: !isTop ? -5 : undefined,
                    left: isLeft ? -5 : undefined,
                    right: !isLeft ? -5 : undefined,
                    width: 12,
                    height: 12,
                    background: '#ffffff',
                    border: '2px solid #ef4444',
                    borderRadius: 2,
                    cursor:
                      handle === 'nw' || handle === 'se'
                        ? 'nwse-resize'
                        : 'nesw-resize',
                    pointerEvents: 'auto',
                    zIndex: 2,
                  }}
                />
              );
            })}
          </>
        )}
      </div>
    </div>
  );
};
