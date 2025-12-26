
import { describe, it, expect } from 'vitest';
import { isSafeUrl, sanitizeInput } from './security';

describe('Security Service', () => {
  describe('isSafeUrl', () => {
    it('should allow valid http URLs', () => {
      expect(isSafeUrl('http://example.com')).toBe(true);
    });

    it('should allow valid https URLs', () => {
      expect(isSafeUrl('https://example.com')).toBe(true);
    });

    it('should reject javascript: URLs', () => {
      expect(isSafeUrl('javascript:alert(1)')).toBe(false);
    });

    it('should reject data: URLs', () => {
      expect(isSafeUrl('data:text/html,<script>alert(1)</script>')).toBe(false);
    });

    it('should reject invalid URLs', () => {
      expect(isSafeUrl('not-a-url')).toBe(false);
    });

    it('should reject empty strings', () => {
      expect(isSafeUrl('')).toBe(false);
    });
  });

  describe('sanitizeInput', () => {
    it('should escape HTML characters', () => {
      const malicious = '<script>alert(1)</script>';
      const expected = '&lt;script&gt;alert(1)&lt;/script&gt;';
      expect(sanitizeInput(malicious)).toBe(expected);
    });

    it('should handle quotes', () => {
      const input = '"quote" and \'single\'';
      const expected = '&quot;quote&quot; and &#039;single&#039;';
      expect(sanitizeInput(input)).toBe(expected);
    });
  });
});
