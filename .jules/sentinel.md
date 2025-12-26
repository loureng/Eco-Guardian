## 2024-05-23 - Centralized Security Logic
**Vulnerability:** Security logic (URL sanitization) was hardcoded inside a UI component (`Chatbot.tsx`), making it hard to test and reuse.
**Learning:** Security checks should be treated as first-class citizens: centralized, exported, and rigorously tested independently of the UI.
**Prevention:** Extract security logic into `services/security.ts` and ensure every security function has a corresponding unit test in `services/security.test.ts`.
