## 2024-05-23 - Centralized Security Logic
**Vulnerability:** Security logic (URL sanitization) was hardcoded inside a UI component (`Chatbot.tsx`), making it hard to test and reuse.
**Learning:** Security checks should be treated as first-class citizens: centralized, exported, and rigorously tested independently of the UI.
**Prevention:** Extract security logic into `services/security.ts` and ensure every security function has a corresponding unit test in `services/security.test.ts`.

## 2024-05-24 - Input Sanitization Gaps
**Vulnerability:** User-editable fields (`scientificName`) and AI-populated fields were saved to storage without sanitization, creating a Stored XSS risk if rendered unsafely.
**Learning:** Sanitization must apply to *all* text fields before storage, not just the "obvious" ones. trusting AI output or "read-only" fields is risky if they can be manipulated upstream.
**Prevention:** Applied `sanitizeInput` to all string fields in `PlantForm.tsx` before saving.
