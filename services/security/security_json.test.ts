
import { describe, it, expect } from 'vitest';
import { isSafeJSON } from './security';

describe('isSafeJSON', () => {
  it('should parse valid JSON', () => {
    const valid = '{"key": "value"}';
    expect(isSafeJSON(valid)).toEqual({ key: 'value' });
  });

  it('should return null for invalid JSON', () => {
    const invalid = '{key: "value"}'; // Invalid JSON
    expect(isSafeJSON(invalid)).toBeNull();
  });

  it('should return null for null input', () => {
    expect(isSafeJSON(null)).toBeNull();
  });

  it('should return null for empty string', () => {
    expect(isSafeJSON('')).toBeNull();
  });
});
