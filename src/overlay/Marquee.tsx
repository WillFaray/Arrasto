import React from 'react';
import { Rect } from '../geometry/math';

interface MarqueeProps {
  rect: Rect | null;
}

export const Marquee: React.FC<MarqueeProps> = ({ rect }) => {
  if (!rect) return null;

  const left = Math.min(rect.x, rect.x + rect.width);
  const top = Math.min(rect.y, rect.y + rect.height);
  const width = Math.abs(rect.width);
  const height = Math.abs(rect.height);

  return (
    <div
      style={{
        position: 'absolute',
        left,
        top,
        width,
        height,
        backgroundColor: 'rgba(99, 102, 241, 0.12)',
        border: '1px solid rgba(99, 102, 241, 0.75)',
        pointerEvents: 'none',
        zIndex: 40,
        boxSizing: 'border-box',
      }}
    />
  );
};
