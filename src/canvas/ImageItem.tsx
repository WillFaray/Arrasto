import React, { memo } from 'react';
import { BoardImage, InteractionMode } from '../types/board';
import { CURSORS } from '../cursors/cursors';

interface ImageItemProps {
  image: BoardImage;
  mode: InteractionMode;
}

export const ImageItem: React.FC<ImageItemProps> = memo(
  ({ image, mode }) => {
    const isEdit = mode === 'edit';

    // In action mode, locked images pass clicks through entirely
    const pointerEvents = !isEdit && image.locked ? 'none' : 'auto';

    // Determine cursor
    let cursor = CURSORS.grab;
    if (image.locked) {
      cursor = isEdit ? CURSORS.locked : 'default';
    }

    return (
      <div
        data-image-id={image.id}
        style={{
          position: 'absolute',
          left: image.x,
          top: image.y,
          width: image.width,
          height: image.height,
          transform: `rotate(${image.rotation}rad)`,
          transformOrigin: 'center center',
          pointerEvents,
          cursor,
          userSelect: 'none',
          WebkitUserSelect: 'none',
          touchAction: 'none',
        }}
      >
        <img
          src={image.blobUrl}
          alt={image.name || 'Whiteboard image'}
          draggable={false}
          decoding="async"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'fill',
            display: 'block',
            pointerEvents: 'none',
            imageRendering: 'auto', // High quality sampling
          }}
        />

        {/* Lock indicator badge if locked (only in edit mode) */}
        {isEdit && image.locked && (
          <div
            style={{
              position: 'absolute',
              top: 6,
              right: 6,
              background: 'rgba(20, 20, 25, 0.85)',
              backdropFilter: 'blur(8px)',
              color: '#f87171',
              borderRadius: 6,
              padding: '3px 6px',
              fontSize: 11,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
              pointerEvents: 'none',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            Bloqueado
          </div>
        )}
      </div>
    );
  }
);
