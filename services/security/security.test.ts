
import { describe, it, expect } from 'vitest';
import { sanitizeInput, isSafeUrl } from './security';

describe('Security Service', () => {
  describe('sanitizeInput', () => {
    it('should trim whitespace', () => {
      expect(sanitizeInput('  hello  ')).toBe('hello');
    });

    it('should strip HTML tags', () => {
      expect(sanitizeInput('<script>alert(1)</script>')).toBe('alert(1)');
      expect(sanitizeInput('<b>Bold</b>')).toBe('Bold');
    });

    it('should limit length', () => {
      const long = 'a'.repeat(100);
      expect(sanitizeInput(long, 10)).toBe('aaaaaaaaaa');
    });

    it('should handle empty input', () => {
      expect(sanitizeInput('')).toBe('');
    });
  });

  describe('isSafeUrl', () => {
    it('should allow http/https', () => {
      expect(isSafeUrl('https://google.com')).toBe(true);
      expect(isSafeUrl('http://example.com')).toBe(true);
    });

    it('should allow data uris', () => {
      expect(isSafeUrl('data:image/png;base64,abc')).toBe(true);
    });

    it('should reject javascript:', () => {
      expect(isSafeUrl('javascript:alert(1)')).toBe(false);
      expect(isSafeUrl('JAVASCRIPT:alert(1)')).toBe(false);
      expect(isSafeUrl(' javascript:alert(1) ')).toBe(false);
    });

    it('should allow relative paths', () => {
      expect(isSafeUrl('/assets/image.png')).toBe(true);
    });
  });
});
