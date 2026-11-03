export interface Vec {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Camera {
  x: number;
  y: number;
  zoom: number;
}

export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

export function screenToWorld(p: Vec, cam: Camera): Vec {
  return {
    x: (p.x - cam.x) / cam.zoom,
    y: (p.y - cam.y) / cam.zoom,
  };
}

export function worldToScreen(p: Vec, cam: Camera): Vec {
  return {
    x: p.x * cam.zoom + cam.x,
    y: p.y * cam.zoom + cam.y,
  };
}

export function zoomAt(
  cam: Camera,
  screenPt: Vec,
  factor: number,
  minZoom = 0.05,
  maxZoom = 25
): Camera {
  const newZoom = clamp(cam.zoom * factor, minZoom, maxZoom);
  const w = screenToWorld(screenPt, cam);
  return {
    zoom: newZoom,
    x: screenPt.x - w.x * newZoom,
    y: screenPt.y - w.y * newZoom,
  };
}

export function rotatePoint(p: Vec, center: Vec, angleRad: number): Vec {
  const cos = Math.cos(angleRad);
  const sin = Math.sin(angleRad);
  const dx = p.x - center.x;
  const dy = p.y - center.y;
  return {
    x: center.x + (dx * cos - dy * sin),
    y: center.y + (dx * sin + dy * cos),
  };
}

export function getCenter(rect: Rect): Vec {
  return {
    x: rect.x + rect.width / 2,
    y: rect.y + rect.height / 2,
  };
}

/**
 * Returns the 4 corners in order: TL, TR, BR, BL in world space
 */
export function getRotatedCorners(rect: Rect, angleRad: number): [Vec, Vec, Vec, Vec] {
  const center = getCenter(rect);
  const halfW = rect.width / 2;
  const halfH = rect.height / 2;

  const tl: Vec = { x: center.x - halfW, y: center.y - halfH };
  const tr: Vec = { x: center.x + halfW, y: center.y - halfH };
  const br: Vec = { x: center.x + halfW, y: center.y + halfH };
  const bl: Vec = { x: center.x - halfW, y: center.y + halfH };

  if (Math.abs(angleRad) < 1e-6) {
    return [tl, tr, br, bl];
  }

  return [
    rotatePoint(tl, center, angleRad),
    rotatePoint(tr, center, angleRad),
    rotatePoint(br, center, angleRad),
    rotatePoint(bl, center, angleRad),
  ];
}

/**
 * Check if a point is inside a rotated rectangle
 */
export function pointInRotatedRect(pt: Vec, rect: Rect, angleRad: number): boolean {
  const center = getCenter(rect);
  // Transform point into local unrotated rect coordinate space
  const localPt = rotatePoint(pt, center, -angleRad);
  const halfW = rect.width / 2;
  const halfH = rect.height / 2;
  return (
    localPt.x >= center.x - halfW &&
    localPt.x <= center.x + halfW &&
    localPt.y >= center.y - halfH &&
    localPt.y <= center.y + halfH
  );
}

/**
 * Separating Axis Theorem (SAT) to detect intersection between two rotated rectangles
 */
export function polygonsIntersect(polyA: Vec[], polyB: Vec[]): boolean {
  const polygons = [polyA, polyB];
  for (let i = 0; i < polygons.length; i++) {
    const polygon = polygons[i];
    for (let j = 0; j < polygon.length; j++) {
      const p1 = polygon[j];
      const p2 = polygon[(j + 1) % polygon.length];

      // Perpendicular normal vector to edge
      const normal: Vec = {
        x: -(p2.y - p1.y),
        y: p2.x - p1.x,
      };

      // Project polyA
      let minA = Infinity;
      let maxA = -Infinity;
      for (const p of polyA) {
        const projected = p.x * normal.x + p.y * normal.y;
        if (projected < minA) minA = projected;
        if (projected > maxA) maxA = projected;
      }

      // Project polyB
      let minB = Infinity;
      let maxB = -Infinity;
      for (const p of polyB) {
        const projected = p.x * normal.x + p.y * normal.y;
        if (projected < minB) minB = projected;
        if (projected > maxB) maxB = projected;
      }

      // Check for separation
      if (maxA < minB || maxB < minA) {
        return false;
      }
    }
  }
  return true;
}

export function rectIntersectsRotatedRect(
  marquee: Rect,
  targetRect: Rect,
  targetAngleRad: number
): boolean {
  // Normalize marquee in case drag was done backwards
  const normMarquee: Rect = {
    x: Math.min(marquee.x, marquee.x + marquee.width),
    y: Math.min(marquee.y, marquee.y + marquee.height),
    width: Math.abs(marquee.width),
    height: Math.abs(marquee.height),
  };

  const marqueeCorners: [Vec, Vec, Vec, Vec] = [
    { x: normMarquee.x, y: normMarquee.y },
    { x: normMarquee.x + normMarquee.width, y: normMarquee.y },
    { x: normMarquee.x + normMarquee.width, y: normMarquee.y + normMarquee.height },
    { x: normMarquee.x, y: normMarquee.y + normMarquee.height },
  ];

  const targetCorners = getRotatedCorners(targetRect, targetAngleRad);

  return polygonsIntersect(marqueeCorners, targetCorners);
}
