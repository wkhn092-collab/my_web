import { describe, expect, it } from 'vitest';
import { toVisualOrder } from './visual-order';

describe('toVisualOrder', () => {
  it('leaves Latin-only text alone', () => {
    expect(toVisualOrder('LALIBAKERY')).toBe('LALIBAKERY');
    expect(toVisualOrder('Space  Hub')).toBe('Space Hub');
  });

  it('reverses Hebrew letters and word order', () => {
    expect(toVisualOrder('תנא משקאות')).toBe('תואקשמ אנת');
  });

  it('keeps Latin runs and numbers readable inside Hebrew', () => {
    expect(toVisualOrder('אתר SpaceHub חדש')).toBe('שדח SpaceHub רתא');
    expect(toVisualOrder('דף נחיתה 3D Pro')).toBe('3D Pro התיחנ ףד');
  });
});
