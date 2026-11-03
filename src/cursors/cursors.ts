// Modern designer cursors encoded as clean SVG data URIs with crisp hotspots

function svgToCursor(svg: string, hx: number, hy: number): string {
  const encoded = encodeURIComponent(svg.trim());
  return `url("data:image/svg+xml,${encoded}") ${hx} ${hy}`;
}

// 1. Default designer arrow (sleek, dark with white border and subtle shadow)
const DEFAULT_ARROW_SVG = `
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M4 3L11.5 21L14.5 13.5L22 10.5L4 3Z" fill="#141419" stroke="#ffffff" stroke-width="1.75" stroke-linejoin="round"/>
</svg>
`;

// 2. Open Hand (hover over movable image)
const OPEN_HAND_SVG = `
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M7 11V6.5C7 5.67 7.67 5 8.5 5C9.33 5 10 5.67 10 6.5V10.5M10 6.5V4.5C10 3.67 10.67 3 11.5 3C12.33 3 13 3.67 13 4.5V10.5M13 5.5C13 4.67 13.67 4 14.5 4C15.33 4 16 4.67 16 5.5V11.5M16 8.5C16 7.67 16.67 7 17.5 7C18.33 7 19 7.67 19 8.5V14C19 18 16 21 12 21C8 21 5 18 5 14.5V11C5 10.17 5.67 9.5 6.5 9.5C7.33 9.5 8 10.17 8 11V11" 
    fill="#1e1e24" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;

// 3. Grabbing Hand (dragging image)
const GRABBING_HAND_SVG = `
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M7 11V9.5C7 8.67 7.67 8 8.5 8C9.33 8 10 8.67 10 9.5V11M10 9.5C10 8.67 10.67 8 11.5 8C12.33 8 13 8.67 13 9.5V11M13 9.5C13 8.67 13.67 8 14.5 8C15.33 8 16 8.67 16 9.5V11.5M16 10C16 9.17 16.67 8.5 17.5 8.5C18.33 8.5 19 9.17 19 10V14C19 18 16 21 12 21C8 21 5 18 5 14.5V11C5 10.17 5.67 9.5 6.5 9.5C7.33 9.5 8 10.17 8 11" 
    fill="#1e1e24" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;

// 4. Rotation curved arrow
const ROTATE_SVG = `
<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M14 4C19.52 4 24 8.48 24 14C24 19.52 19.52 24 14 24C8.48 24 4 19.52 4 14" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
  <path d="M14 4C19.52 4 24 8.48 24 14C24 19.52 19.52 24 14 24C8.48 24 4 19.52 4 14" stroke="#18181f" stroke-width="1.75" stroke-linecap="round"/>
  <polygon points="14,1 18,5 14,9" fill="#18181f" stroke="#ffffff" stroke-width="1.25"/>
</svg>
`;

// 5. Crosshair for Marquee Selection
const CROSSHAIR_SVG = `
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="12" cy="12" r="9" stroke="#ffffff" stroke-width="1.75"/>
  <circle cx="12" cy="12" r="9" stroke="#141419" stroke-width="1.25"/>
  <line x1="12" y1="2" x2="12" y2="7" stroke="#ffffff" stroke-width="2"/>
  <line x1="12" y1="2" x2="12" y2="7" stroke="#141419" stroke-width="1.25"/>
  <line x1="12" y1="17" x2="12" y2="22" stroke="#ffffff" stroke-width="2"/>
  <line x1="12" y1="17" x2="12" y2="22" stroke="#141419" stroke-width="1.25"/>
  <line x1="2" y1="12" x2="7" y2="12" stroke="#ffffff" stroke-width="2"/>
  <line x1="2" y1="12" x2="7" y2="12" stroke="#141419" stroke-width="1.25"/>
  <line x1="17" y1="12" x2="22" y2="12" stroke="#ffffff" stroke-width="2"/>
  <line x1="17" y1="12" x2="22" y2="12" stroke="#141419" stroke-width="1.25"/>
  <circle cx="12" cy="12" r="2" fill="#141419" stroke="#ffffff" stroke-width="1"/>
</svg>
`;

// 6. Locked / Not Allowed
const NOT_ALLOWED_SVG = `
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="12" cy="12" r="9" stroke="#ffffff" stroke-width="2"/>
  <circle cx="12" cy="12" r="9" stroke="#ef4444" stroke-width="1.5"/>
  <line x1="6" y1="6" x2="18" y2="18" stroke="#ffffff" stroke-width="2"/>
  <line x1="6" y1="6" x2="18" y2="18" stroke="#ef4444" stroke-width="1.5"/>
</svg>
`;

export const CURSORS = {
  default: `${svgToCursor(DEFAULT_ARROW_SVG, 4, 3)}, default`,
  pointer: `${svgToCursor(DEFAULT_ARROW_SVG, 4, 3)}, pointer`,
  grab: `${svgToCursor(OPEN_HAND_SVG, 12, 12)}, grab`,
  grabbing: `${svgToCursor(GRABBING_HAND_SVG, 12, 12)}, grabbing`,
  rotate: `${svgToCursor(ROTATE_SVG, 14, 14)}, crosshair`,
  marquee: `${svgToCursor(CROSSHAIR_SVG, 12, 12)}, crosshair`,
  locked: `${svgToCursor(NOT_ALLOWED_SVG, 12, 12)}, not-allowed`,
};

// Cache for rotated resize cursors (step = 15 deg)
const resizeCursorCache = new Map<number, string>();

/**
 * Returns a dynamically rotated double-headed resize cursor matching the angle.
 */
export function getRotatedResizeCursor(angleRad: number): string {
  // Normalize angle in degrees [0, 180)
  let deg = ((angleRad * 180) / Math.PI) % 180;
  if (deg < 0) deg += 180;
  // Snap to 15 degrees for caching
  const snapped = Math.round(deg / 15) * 15;

  if (resizeCursorCache.has(snapped)) {
    return resizeCursorCache.get(snapped)!;
  }

  // Draw double-headed arrow rotated by snapped angle
  const svg = `
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g transform="rotate(${snapped} 12 12)">
    <line x1="12" y1="4" x2="12" y2="20" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
    <line x1="12" y1="4" x2="12" y2="20" stroke="#141419" stroke-width="1.75" stroke-linecap="round"/>
    <polygon points="12,1 8,7 16,7" fill="#141419" stroke="#ffffff" stroke-width="1.25"/>
    <polygon points="12,23 8,17 16,17" fill="#141419" stroke="#ffffff" stroke-width="1.25"/>
  </g>
</svg>
`;

  const cursorVal = `${svgToCursor(svg, 12, 12)}, move`;
  resizeCursorCache.set(snapped, cursorVal);
  return cursorVal;
}

export function getHandleCursor(handle: string, itemRotationRad: number): string {
  if (handle === 'rot') return CURSORS.rotate;

  let baseAngle = 0;
  switch (handle) {
    case 'n':
    case 's':
      baseAngle = 0;
      break;
    case 'e':
    case 'w':
      baseAngle = Math.PI / 2;
      break;
    case 'nw':
    case 'se':
      baseAngle = -Math.PI / 4;
      break;
    case 'ne':
    case 'sw':
      baseAngle = Math.PI / 4;
      break;
  }

  return getRotatedResizeCursor(baseAngle + itemRotationRad);
}
