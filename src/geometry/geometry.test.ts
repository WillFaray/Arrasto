import { describe, it, expect } from 'vitest';
import {
  screenToWorld,
  worldToScreen,
  zoomAt,
  getRotatedCorners,
  pointInRotatedRect,
  rectIntersectsRotatedRect,
  Camera,
} from './math';
import { resizeItem, rotateItem, getHandleWorldPos } from './transform';
import { calculateObsCrop } from './obsCrop';

describe('Geometry Math', () => {
  it('converts screen to world and back accurately', () => {
    const cam: Camera = { x: 120, y: -45, zoom: 1.5 };
    const screenPt = { x: 450, y: 300 };

    const world = screenToWorld(screenPt, cam);
    const screenBack = worldToScreen(world, cam);

    expect(screenBack.x).toBeCloseTo(screenPt.x);
    expect(screenBack.y).toBeCloseTo(screenPt.y);
  });

  it('keeps world point under cursor stationary during zoomAt', () => {
    const cam: Camera = { x: 200, y: 150, zoom: 1.0 };
    const cursor = { x: 500, y: 400 };

    const worldBefore = screenToWorld(cursor, cam);
    const newCam = zoomAt(cam, cursor, 1.25);
    const worldAfter = screenToWorld(cursor, newCam);

    expect(worldAfter.x).toBeCloseTo(worldBefore.x);
    expect(worldAfter.y).toBeCloseTo(worldBefore.y);
  });

  it('calculates rotated corners and tests point containment', () => {
    const rect = { x: 100, y: 100, width: 200, height: 100 };
    const angle = Math.PI / 4; // 45 deg

    const corners = getRotatedCorners(rect, angle);
    expect(corners.length).toBe(4);

    // Center point (200, 150) should always be inside
    expect(pointInRotatedRect({ x: 200, y: 150 }, rect, angle)).toBe(true);

    // Far away point should be outside
    expect(pointInRotatedRect({ x: 0, y: 0 }, rect, angle)).toBe(false);
  });

  it('detects intersection between marquee and rotated item with SAT', () => {
    const target = { x: 100, y: 100, width: 100, height: 100 };
    const angle = Math.PI / 4;

    // Marquee clearly overlapping
    const marqueeIntersecting = { x: 80, y: 80, width: 50, height: 50 };
    expect(rectIntersectsRotatedRect(marqueeIntersecting, target, angle)).toBe(true);

    // Marquee far away
    const marqueeFar = { x: 500, y: 500, width: 50, height: 50 };
    expect(rectIntersectsRotatedRect(marqueeFar, target, angle)).toBe(false);
  });
});

describe('Transform & Handles', () => {
  it('pins opposite anchor when resizing from SE corner', () => {
    const item = { x: 100, y: 100, width: 100, height: 100, rotation: 0 };
    const nwHandleBefore = getHandleWorldPos(item, 'nw');

    // Drag SE corner to expand to 200x200
    const newItem = resizeItem(item, 'se', { x: 300, y: 300 }, { keepRatio: false });

    const nwHandleAfter = getHandleWorldPos(newItem, 'nw');
    expect(nwHandleAfter.x).toBeCloseTo(nwHandleBefore.x);
    expect(nwHandleAfter.y).toBeCloseTo(nwHandleBefore.y);
    expect(newItem.width).toBeCloseTo(200);
    expect(newItem.height).toBeCloseTo(200);
  });

  it('resizes while maintaining aspect ratio when keepRatio is true', () => {
    const item = { x: 100, y: 100, width: 200, height: 100, rotation: 0 };
    const newItem = resizeItem(item, 'se', { x: 400, y: 250 }, { keepRatio: true });

    const aspectBefore = item.width / item.height;
    const aspectAfter = newItem.width / newItem.height;
    expect(aspectAfter).toBeCloseTo(aspectBefore);
  });

  it('rotates and snaps to 15-degree increments when snap is true', () => {
    const item = { x: 100, y: 100, width: 100, height: 100, rotation: 0 };
    // Center is (150, 150)
    // Moving pointer to right (250, 150) -> angle relative to top is 90 degrees = PI/2
    const angle = rotateItem(item, { x: 250, y: 150 }, true);
    expect(angle).toBeCloseTo(Math.PI / 2);

    // Test snap on 17 degrees -> should snap to 15 degrees (PI / 12)
    const targetRad = (17 * Math.PI) / 180;
    // Point at targetRad:
    const px = 150 + 100 * Math.sin(targetRad);
    const py = 150 - 100 * Math.cos(targetRad);
    const snapped = rotateItem(item, { x: px, y: py }, true);
    expect(snapped).toBeCloseTo((15 * Math.PI) / 180);
  });
});

describe('OBS Crop Calculation', () => {
  it('computes exact OBS crop filter values matching DPR', () => {
    const viewport = { width: 1920, height: 1080 };
    const area = { x: 100, y: 50, width: 1280, height: 720 };

    const crop1x = calculateObsCrop(area, viewport, 1.0);
    expect(crop1x.left).toBe(100);
    expect(crop1x.top).toBe(50);
    expect(crop1x.right).toBe(1920 - 100 - 1280);
    expect(crop1x.bottom).toBe(1080 - 50 - 720);
    expect(crop1x.outputWidth).toBe(1280);
    expect(crop1x.outputHeight).toBe(720);

    const crop125x = calculateObsCrop(area, viewport, 1.25);
    expect(crop125x.left).toBe(125);
    expect(crop125x.top).toBe(63);
    expect(crop125x.outputWidth).toBe(1600);
    expect(crop125x.outputHeight).toBe(900);
  });
});
