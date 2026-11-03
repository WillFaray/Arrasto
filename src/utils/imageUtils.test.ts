import { describe, it, expect } from 'vitest';
import { removeWhiteBackground } from './imageUtils';

describe('imageUtils - removeWhiteBackground', () => {
  it('is a function that accepts a blob', () => {
    expect(typeof removeWhiteBackground).toBe('function');
  });
});
