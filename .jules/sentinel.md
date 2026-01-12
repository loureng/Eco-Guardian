## 2024-05-23 - Critical Missing CSP
**Vulnerability:** The application was completely missing a Content Security Policy (CSP), allowing unrestricted script execution and external connections. The `index.html` also contained a legacy `importmap` that bypassed the build process.
**Learning:** Reliance on build tools (Vite) does not automatically enforce runtime security headers. Legacy code or "quick start" snippets (like CDN-based importmaps) can leave security gaps if not cleaned up.
**Prevention:** Always explicitly define a strict CSP in the HTML entry point or server headers. Regularly audit `index.html` for unused scripts or configuration debris.
