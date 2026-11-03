import { Vec, rotatePoint, getCenter } from './math';

export type HandleType =
  | 'nw'
  | 'ne'
  | 'se'
  | 'sw'
  | 'n'
  | 'e'
  | 's'
  | 'w'
  | 'rot';

export interface TransformableItem {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number; // in radians
}

/**
 * Returns world-space coordinates of a specific handle on an item.
 */
export function getHandleWorldPos(
  item: TransformableItem,
  handle: HandleType,
  rotDistance = 32
): Vec {
  const center = getCenter(item);
  const halfW = item.width / 2;
  const halfH = item.height / 2;

  let local: Vec;
  switch (handle) {
    case 'nw':
      local = { x: -halfW, y: -halfH };
      break;
    case 'ne':
      local = { x: halfW, y: -halfH };
      break;
    case 'se':
      local = { x: halfW, y: halfH };
      break;
    case 'sw':
      local = { x: -halfW, y: halfH };
      break;
    case 'n':
      local = { x: 0, y: -halfH };
      break;
    case 's':
      local = { x: 0, y: halfH };
      break;
    case 'w':
      local = { x: -halfW, y: 0 };
      break;
    case 'e':
      local = { x: halfW, y: 0 };
      break;
    case 'rot':
      local = { x: 0, y: -halfH - rotDistance };
      break;
  }

  return rotatePoint(
    { x: center.x + local.x, y: center.y + local.y },
    center,
    item.rotation
  );
}

/**
 * Resizes an item while pinning the opposite anchor point in world space.
 */
export function resizeItem(
  startItem: TransformableItem,
  handle: HandleType,
  pointerWorld: Vec,
  options: {
    keepRatio?: boolean;
    fromCenter?: boolean;
    minSize?: number;
  } = {}
): TransformableItem {
  const minSize = options.minSize ?? 10;
  const startCenter = getCenter(startItem);
  const rotation = startItem.rotation;

  if (options.fromCenter) {
    // Symmetrical resizing around center
    // Project pointer into item's local coordinate system relative to center
    const local = rotatePoint(pointerWorld, startCenter, -rotation);
    const dx = Math.abs(local.x - startCenter.x) * 2;
    const dy = Math.abs(local.y - startCenter.y) * 2;

    let newW = startItem.width;
    let newH = startItem.height;

    const isCorner = ['nw', 'ne', 'se', 'sw'].includes(handle);
    const isHorizontal = ['e', 'w'].includes(handle);
    const isVertical = ['n', 's'].includes(handle);

    if (isCorner) {
      if (options.keepRatio) {
        const scale = Math.max(dx / startItem.width, dy / startItem.height);
        newW = Math.max(minSize, startItem.width * scale);
        newH = Math.max(minSize, startItem.height * scale);
      } else {
        newW = Math.max(minSize, dx);
        newH = Math.max(minSize, dy);
      }
    } else if (isHorizontal) {
      newW = Math.max(minSize, dx);
      if (options.keepRatio) {
        newH = (newW / startItem.width) * startItem.height;
      }
    } else if (isVertical) {
      newH = Math.max(minSize, dy);
      if (options.keepRatio) {
        newW = (newH / startItem.height) * startItem.width;
      }
    }

    return {
      ...startItem,
      x: startCenter.x - newW / 2,
      y: startCenter.y - newH / 2,
      width: newW,
      height: newH,
    };
  }

  // Anchor is the opposite point in world space
  let anchorLocal: Vec;
  const halfW = startItem.width / 2;
  const halfH = startItem.height / 2;

  switch (handle) {
    case 'nw': anchorLocal = { x: halfW, y: halfH }; break;
    case 'ne': anchorLocal = { x: -halfW, y: halfH }; break;
    case 'se': anchorLocal = { x: -halfW, y: -halfH }; break;
    case 'sw': anchorLocal = { x: halfW, y: -halfH }; break;
    case 'n':  anchorLocal = { x: 0, y: halfH }; break;
    case 's':  anchorLocal = { x: 0, y: -halfH }; break;
    case 'w':  anchorLocal = { x: halfW, y: 0 }; break;
    case 'e':  anchorLocal = { x: -halfW, y: 0 }; break;
    default:
      return startItem;
  }

  const anchorWorld = rotatePoint(
    { x: startCenter.x + anchorLocal.x, y: startCenter.y + anchorLocal.y },
    startCenter,
    rotation
  );

  // Convert pointer position to local space anchored at anchorWorld
  const pointerRelativeToAnchor = rotatePoint(pointerWorld, anchorWorld, -rotation);
  const diffX = pointerRelativeToAnchor.x - anchorWorld.x;
  const diffY = pointerRelativeToAnchor.y - anchorWorld.y;

  let newW = startItem.width;
  let newH = startItem.height;

  const isCorner = ['nw', 'ne', 'se', 'sw'].includes(handle);
  const isHorizontal = ['e', 'w'].includes(handle);
  const isVertical = ['n', 's'].includes(handle);

  if (isCorner) {
    let rawW = Math.abs(diffX);
    let rawH = Math.abs(diffY);

    if (options.keepRatio) {
      const origAspect = startItem.width / startItem.height;
      const scale = Math.max(rawW / startItem.width, rawH / startItem.height);
      newW = Math.max(minSize, startItem.width * scale);
      newH = Math.max(minSize, newW / origAspect);
    } else {
      newW = Math.max(minSize, rawW);
      newH = Math.max(minSize, rawH);
    }
  } else if (isHorizontal) {
    newW = Math.max(minSize, Math.abs(diffX));
    if (options.keepRatio) {
      newH = (newW / startItem.width) * startItem.height;
    }
  } else if (isVertical) {
    newH = Math.max(minSize, Math.abs(diffY));
    if (options.keepRatio) {
      newW = (newH / startItem.height) * startItem.width;
    }
  }

  // Calculate new center based on anchor and direction
  // The new center in local space relative to anchor:
  let newCenterLocalRelAnchor: Vec;
  switch (handle) {
    case 'nw': newCenterLocalRelAnchor = { x: -newW / 2, y: -newH / 2 }; break;
    case 'ne': newCenterLocalRelAnchor = { x: newW / 2, y: -newH / 2 }; break;
    case 'se': newCenterLocalRelAnchor = { x: newW / 2, y: newH / 2 }; break;
    case 'sw': newCenterLocalRelAnchor = { x: -newW / 2, y: newH / 2 }; break;
    case 'n':  newCenterLocalRelAnchor = { x: 0, y: -newH / 2 }; break;
    case 's':  newCenterLocalRelAnchor = { x: 0, y: newH / 2 }; break;
    case 'w':  newCenterLocalRelAnchor = { x: -newW / 2, y: 0 }; break;
    case 'e':  newCenterLocalRelAnchor = { x: newW / 2, y: 0 }; break;
    default:   newCenterLocalRelAnchor = { x: 0, y: 0 }; break;
  }

  const unrotatedNewCenter: Vec = {
    x: anchorWorld.x + newCenterLocalRelAnchor.x,
    y: anchorWorld.y + newCenterLocalRelAnchor.y,
  };

  const newCenterWorld = rotatePoint(unrotatedNewCenter, anchorWorld, rotation);

  return {
    ...startItem,
    x: newCenterWorld.x - newW / 2,
    y: newCenterWorld.y - newH / 2,
    width: newW,
    height: newH,
  };
}

/**
 * Calculates new rotation angle in radians given a pointer in world space.
 * Optionally snaps to increments of 15 degrees (PI / 12).
 */
export function rotateItem(
  startItem: TransformableItem,
  pointerWorld: Vec,
  snap = false
): number {
  const center = getCenter(startItem);
  const dx = pointerWorld.x - center.x;
  const dy = pointerWorld.y - center.y;
  // Rotation handle is positioned vertically above the center (at angle -PI/2)
  let angle = Math.atan2(dy, dx) + Math.PI / 2;

  // Normalize between -PI and PI
  while (angle > Math.PI) angle -= 2 * Math.PI;
  while (angle < -Math.PI) angle += 2 * Math.PI;

  if (snap) {
    const step = Math.PI / 12; // 15 degrees
    angle = Math.round(angle / step) * step;
  }

  return angle;
}
