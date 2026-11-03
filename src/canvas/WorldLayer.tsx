import React from 'react';
import { Camera } from '../geometry/math';
import { BoardImage, InteractionMode } from '../types/board';
import { ImageItem } from './ImageItem';

interface WorldLayerProps {
  camera: Camera;
  images: BoardImage[];
  selection: string[];
  mode: InteractionMode;
  isInteracting: boolean;
}

export const WorldLayer: React.FC<WorldLayerProps> = ({
  camera,
  images,
  mode,
  isInteracting,
}) => {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: 0,
        height: 0,
        transform: `translate3d(${camera.x}px, ${camera.y}px, 0) scale(${camera.zoom})`,
        transformOrigin: '0 0',
        willChange: isInteracting ? 'transform' : 'auto',
      }}
    >
      {images.map((image) => (
        <ImageItem
          key={image.id}
          image={image}
          mode={mode}
        />
      ))}
    </div>
  );
};
