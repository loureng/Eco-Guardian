
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
    it('should strip HTML tags completely', () => {
      const malicious = '<script>alert(1)</script>';
      const expected = 'alert(1)'; // Content remains, tags stripped
      expect(sanitizeInput(malicious)).toBe(expected);
    });

    it('should strip bold tags', () => {
      const input = '<b>Rose</b>';
      const expected = 'Rose';
      expect(sanitizeInput(input)).toBe(expected);
    });

    it('should handle nested tags', () => {
      const input = '<div><b>Rose</b></div>';
      const expected = 'Rose';
      expect(sanitizeInput(input)).toBe(expected);
    });

    it('should trim whitespace', () => {
      const input = '   Rose   ';
      const expected = 'Rose';
      expect(sanitizeInput(input)).toBe(expected);
    });

    it('should handle empty input', () => {
        expect(sanitizeInput('')).toBe('');
    });
  });
});
