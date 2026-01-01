# Sentinel Journal

This journal documents critical security learnings and vulnerability patterns found in the codebase.

## 2024-05-22 - Image Processing DoS Risk
**Vulnerability:** Client-side image processing (resizing/compression) was performed on the main thread, potentially causing UI freezing with large files.
**Learning:** Even client-side processing can be a vector for DoS if not handled asynchronously or off-main-thread.
**Prevention:** Used `createImageBitmap` (where supported) or ensured processing steps don't block the UI loop. Added strict file size limits before processing.

## 2024-05-22 - LocalStorage XSS Vector
**Vulnerability:** User input stored in `localStorage` was rendered directly without sanitization.
**Learning:** `localStorage` is not a secure vault; data retrieved from it must be treated as untrusted input just like network responses.
**Prevention:** Applied `sanitizeInput` to all string fields before storage and again upon retrieval/rendering where appropriate.

## 2024-05-23 - SVG Injection via Object URL
**Vulnerability:** Allowing uploads of SVG files created a risk of Stored XSS if the SVG contained script tags and was rendered via `object` or direct injection.
**Learning:** SVGs are code, not just images.
**Prevention:** The image service converts all uploads to PNG/JPEG, neutralizing any scripts embedded in SVGs.
