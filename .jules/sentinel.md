# Sentinel Journal

## 2024-05-22 - Unvalidated Redirect in Chatbot
**Vulnerability:** The Chatbot component renders links from the AI response directly into `href` attributes without validation. If the AI is manipulated or returns a malicious URL (like `javascript:alert(1)`), it could lead to XSS or phishing.
**Learning:** Even output from trusted AI models should be treated as untrusted input when rendering in the DOM, especially for sinks like `href` or `src`.
**Prevention:** Always validate protocols for dynamic URLs. Ensure they start with `http://` or `https://`.

## 2024-05-23 - Prompt Injection in Plant Search
**Vulnerability:** The `getPlantDetailsByName` function was vulnerable to Prompt Injection because it blindly replaced `{{NAME}}` in the system prompt with user input. A malicious user could craft a plant name that overrides system instructions.
**Learning:** String replacement (like `replace()`) for constructing LLM prompts is as dangerous as string concatenation for SQL queries ("Prompt Injection").
**Prevention:** Sanitize inputs before injecting them into prompts. Remove characters that can break the prompt structure (like quotes) or use parameterized prompts if supported by the model API. Also, implement input length limits to prevent resource exhaustion.

## 2025-12-24 - DoS via Image Upload
**Vulnerability:** The `PlantForm` component allowed users to upload images of any size, which were then base64 encoded and stored in `localStorage`. This could lead to a Denial of Service (DoS) by filling the storage quota (QuotaExceededError) or freezing the browser main thread during processing.
**Learning:** Client-side storage has strict limits (5-10MB). Allowing unchecked user content into storage is an availability risk.
**Prevention:** Implement client-side validation and processing. Resize and compress images to manageable dimensions (e.g., 800px) before storage. Use canvas to "scrub" the image data, which also removes potential metadata privacy leaks.
