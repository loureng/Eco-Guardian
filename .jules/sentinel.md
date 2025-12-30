## 2024-05-23 - Centralized Security Logic
**Vulnerability:** Security logic (URL sanitization) was hardcoded inside a UI component (`Chatbot.tsx`), making it hard to test and reuse.
**Learning:** Security checks should be treated as first-class citizens: centralized, exported, and rigorously tested independently of the UI.
**Prevention:** Extract security logic into `services/security.ts` and ensure every security function has a corresponding unit test in `services/security.test.ts`.

## 2024-05-24 - Unsafe Image Source Handling
**Vulnerability:** The `PlantCard` component rendered `imageUrl` directly into the `src` attribute without validation, allowing potential XSS via malicious schemes like `javascript:`.
**Learning:** Even though modern browsers mitigate `javascript:` in `<img>`, explicit validation is a crucial defense-in-depth layer.
**Prevention:** Implemented `isSafeSrc` in `services/security.ts` to whitelist `http`, `https`, and `data` protocols, and applied this check in `PlantCard.tsx`.
