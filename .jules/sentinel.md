## 2026-01-02 - CSP Implementation for Vite/ESM Architecture
**Vulnerability:** Lack of Content Security Policy (CSP) exposed the application to potential XSS attacks and unauthorized resource loading.
**Learning:** The application's architecture heavily relies on an inline `importmap` pointing to `https://esm.sh` and `https://cdn.tailwindcss.com`. A standard strict CSP (`default-src 'self'`) breaks the application immediately. The CSP must strictly whitelist these CDNs and allow `'unsafe-inline'` for `script-src` and `style-src` to accommodate the inline map and Tailwind's runtime injection.
**Prevention:** Future dependencies should be audited to see if they can be bundled (reducing reliance on 'unsafe-inline' and external CDNs) or if they must be added to the CSP whitelist.
