# Sentinel Journal

## 2024-05-22 - Unvalidated Redirect in Chatbot
**Vulnerability:** The Chatbot component renders links from the AI response directly into `href` attributes without validation. If the AI is manipulated or returns a malicious URL (like `javascript:alert(1)`), it could lead to XSS or phishing.
**Learning:** Even output from trusted AI models should be treated as untrusted input when rendering in the DOM, especially for sinks like `href` or `src`.
**Prevention:** Always validate protocols for dynamic URLs. Ensure they start with `http://` or `https://`.
