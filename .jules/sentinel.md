# Sentinel's Journal

## 2024-05-22 - URI Scheme Validation in Chatbot
**Vulnerability:** Potential XSS via malicious URI schemes (e.g., `javascript:`) in chatbot grounding links.
**Learning:** Even trusted APIs (like Gemini) should have their output treated as untrusted when rendering active content like links.
**Prevention:** Always validate URL protocols (`http:`, `https:`) before rendering `href` attributes.
