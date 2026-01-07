## 2024-05-22 - Missing CSP
**Vulnerability:** No Content Security Policy (CSP) defined in index.html.
**Learning:** CSP is a critical defense-in-depth mechanism against XSS.
**Prevention:** Always define a strict CSP meta tag in index.html.

## 2024-05-22 - Input Validation (Context)
**Note:** React automatically escapes values in JSX, providing default XSS protection. Explicit sanitization utilities are only needed for specific cases (e.g., `dangerouslySetInnerHTML`), which were not found in this pass. Avoid adding unused utility code (YAGNI).
