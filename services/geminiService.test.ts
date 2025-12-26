import { describe, it, expect } from 'vitest';
import { sanitizeForPrompt } from './geminiService';

describe('sanitizeForPrompt', () => {
  it('should remove quotes, braces and newlines', () => {
    const input = 'Hello "World" {Test} \n Newline';
    const expected = 'Hello World Test   Newline';
    expect(sanitizeForPrompt(input)).toBe(expected);
  });

  it('should truncate long strings', () => {
    const input = 'a'.repeat(200);
    const result = sanitizeForPrompt(input, 50);
    expect(result.length).toBe(50);
  });

  it('should handle empty input', () => {
    expect(sanitizeForPrompt(null)).toBe('');
    expect(sanitizeForPrompt(undefined)).toBe('');
    expect(sanitizeForPrompt('')).toBe('');
  });

  it('should handle custom max length', () => {
      const input = '1234567890';
      expect(sanitizeForPrompt(input, 5)).toBe('12345');
  });

  it('should trim whitespace', () => {
      const input = '  hello  ';
      expect(sanitizeForPrompt(input)).toBe('hello');
  });
});
