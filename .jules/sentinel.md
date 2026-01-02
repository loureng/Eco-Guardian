## 2024-05-23 - Centralized Security Logic
**Vulnerability:** Security logic (URL sanitization) was hardcoded inside a UI component (`Chatbot.tsx`), making it hard to test and reuse.
**Learning:** Security checks should be treated as first-class citizens: centralized, exported, and rigorously tested independently of the UI.
**Prevention:** Extract security logic into `services/security.ts` and ensure every security function has a corresponding unit test in `services/security.test.ts`.

## 2024-05-24 - Input Sanitization Gaps
**Vulnerability:** User-editable fields (`scientificName`) and AI-populated fields were saved to storage without sanitization, creating a Stored XSS risk if rendered unsafely.
**Learning:** Sanitization must apply to *all* text fields before storage, not just the "obvious" ones. trusting AI output or "read-only" fields is risky if they can be manipulated upstream.
**Prevention:** Applied `sanitizeInput` to all string fields in `PlantForm.tsx` before saving.
## 2026-01-02 - CSP Implementation for Vite/ESM Architecture
**Vulnerability:** Lack of Content Security Policy (CSP) exposed the application to potential XSS attacks and unauthorized resource loading.
**Learning:** The application's architecture heavily relies on an inline `importmap` pointing to `https://esm.sh` and `https://cdn.tailwindcss.com`. A standard strict CSP (`default-src 'self'`) breaks the application immediately. The CSP must strictly whitelist these CDNs and allow `'unsafe-inline'` for `script-src` and `style-src` to accommodate the inline map and Tailwind's runtime injection.
**Prevention:** Future dependencies should be audited to see if they can be bundled (reducing reliance on 'unsafe-inline' and external CDNs) or if they must be added to the CSP whitelist.
