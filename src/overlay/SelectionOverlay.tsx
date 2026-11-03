import React from 'react';
import { Camera, worldToScreen } from '../geometry/math';
import { BoardImage } from '../types/board';
import { getHandleCursor } from '../cursors/cursors';
import { HandleType } from '../geometry/transform';
import { ContextToolbar } from './ContextToolbar';

interface SelectionOverlayProps {
  camera: Camera;
  selectedImages: BoardImage[];
  isInteracting: boolean;
}

export const SelectionOverlay: React.FC<SelectionOverlayProps> = ({
  camera,
  selectedImages,
  isInteracting,
}) => {
  if (selectedImages.length === 0) return null;

  // Single item selection
  if (selectedImages.length === 1) {
    const item = selectedImages[0];
    const centerWorld = {
      x: item.x + item.width / 2,
      y: item.y + item.height / 2,
    };
    const centerScreen = worldToScreen(centerWorld, camera);
    const screenW = item.width * camera.zoom;
    const screenH = item.height * camera.zoom;

    const handleDefs: Array<{ type: HandleType; x: number; y: number }> = [
      { type: 'nw', x: -screenW / 2, y: -screenH / 2 },
      { type: 'n', x: 0, y: -screenH / 2 },
      { type: 'ne', x: screenW / 2, y: -screenH / 2 },
      { type: 'e', x: screenW / 2, y: 0 },
      { type: 'se', x: screenW / 2, y: screenH / 2 },
      { type: 's', x: 0, y: screenH / 2 },
      { type: 'sw', x: -screenW / 2, y: screenH / 2 },
      { type: 'w', x: -screenW / 2, y: 0 },
    ];

    const rotDistance = 28;

    return (
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          overflow: 'hidden',
          zIndex: 30,
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: centerScreen.x,
            top: centerScreen.y,
            transform: `rotate(${item.rotation}rad)`,
            pointerEvents: 'none',
          }}
        >
          {/* Selection border */}
          <div
            style={{
              position: 'absolute',
              left: -screenW / 2,
              top: -screenH / 2,
              width: screenW,
              height: screenH,
              border: item.locked
                ? '1.5px dashed rgba(248, 113, 113, 0.8)'
                : '1.5px solid #6366f1',
              boxSizing: 'border-box',
              pointerEvents: 'none',
            }}
          />

          {!item.locked && (
            <>
              {/* Rotation Handle Stem */}
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: -screenH / 2 - rotDistance,
                  width: 1.5,
                  height: rotDistance,
                  background: '#6366f1',
                  transform: 'translateX(-50%)',
                  pointerEvents: 'none',
                }}
              />

              {/* Rotation Handle Circle */}
              <div
                data-handle="rot"
                data-item-id={item.id}
                style={{
                  position: 'absolute',
                  left: 0,
                  top: -screenH / 2 - rotDistance,
                  width: 12,
                  height: 12,
                  transform: 'translate(-50%, -50%)',
                  borderRadius: '50%',
                  background: '#ffffff',
                  border: '2px solid #6366f1',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                  cursor: getHandleCursor('rot', item.rotation),
                  pointerEvents: 'auto',
                }}
              />

              {/* 8 Resize Handles */}
              {handleDefs.map((h) => {
                const isCorner = ['nw', 'ne', 'se', 'sw'].includes(h.type);
                const size = isCorner ? 10 : 8;
                return (
                  <div
                    key={h.type}
                    data-handle={h.type}
                    data-item-id={item.id}
                    style={{
                      position: 'absolute',
                      left: h.x,
                      top: h.y,
                      width: size,
                      height: size,
                      transform: 'translate(-50%, -50%)',
                      background: '#ffffff',
                      border: '1.5px solid #6366f1',
                      borderRadius: isCorner ? 2 : 4,
                      boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                      cursor: getHandleCursor(h.type, item.rotation),
                      pointerEvents: 'auto',
                    }}
                  />
                );
              })}
            </>
          )}
        </div>

        {/* Floating Context Toolbar */}
        {!isInteracting && (
          <ContextToolbar
            screenX={centerScreen.x}
            screenY={centerScreen.y - screenH / 2}
            isLocked={item.locked}
          />
        )}
      </div>
    );
  }

  // Multi-item selection: group bounding box
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const img of selectedImages) {
    minX = Math.min(minX, img.x);
    minY = Math.min(minY, img.y);
    maxX = Math.max(maxX, img.x + img.width);
    maxY = Math.max(maxY, img.y + img.height);
  }

  const tlScreen = worldToScreen({ x: minX, y: minY }, camera);
  const brScreen = worldToScreen({ x: maxX, y: maxY }, camera);
  const screenW = brScreen.x - tlScreen.x;
  const screenH = brScreen.y - tlScreen.y;
  const anyLocked = selectedImages.some((img) => img.locked);

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 30,
      }}
    >
      {/* Group Bounding Box */}
      <div
        style={{
          position: 'absolute',
          left: tlScreen.x,
          top: tlScreen.y,
          width: screenW,
          height: screenH,
          border: '1.5px dashed #6366f1',
          pointerEvents: 'none',
          boxSizing: 'border-box',
        }}
      />

      {/* Toolbar */}
      {!isInteracting && (
        <ContextToolbar
          screenX={tlScreen.x + screenW / 2}
          screenY={tlScreen.y}
          isLocked={anyLocked}
        />
      )}
    </div>
  );
};
