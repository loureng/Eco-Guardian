# Sentinel Journal

## 2024-05-22 - Unvalidated Redirect in Chatbot
**Vulnerability:** The Chatbot component renders links from the AI response directly into `href` attributes without validation. If the AI is manipulated or returns a malicious URL (like `javascript:alert(1)`), it could lead to XSS or phishing.
**Learning:** Even output from trusted AI models should be treated as untrusted input when rendering in the DOM, especially for sinks like `href` or `src`.
**Prevention:** Always validate protocols for dynamic URLs. Ensure they start with `http://` or `https://`.

## 2024-05-23 - Prompt Injection in Plant Search
**Vulnerability:** The `getPlantDetailsByName` function was vulnerable to Prompt Injection because it blindly replaced `{{NAME}}` in the system prompt with user input. A malicious user could craft a plant name that overrides system instructions.
**Learning:** String replacement (like `replace()`) for constructing LLM prompts is as dangerous as string concatenation for SQL queries ("Prompt Injection").
**Prevention:** Sanitize inputs before injecting them into prompts. Remove characters that can break the prompt structure (like quotes) or use parameterized prompts if supported by the model API. Also, implement input length limits to prevent resource exhaustion.

## 2024-05-24 - Indirect Prompt Injection via User Profile
**Vulnerability:** User-controlled data (stored in `localStorage`) was being injected raw into the Chatbot's System Instruction. A malicious plant name could permanently alter the chatbot's persona or rules ("Stored Prompt Injection").
**Learning:** Sanitization must apply to ALL contexts where user data meets LLM prompts, not just the immediate query. Stored data is often implicitly trusted but shouldn't be.
**Prevention:** Implemented `sanitizeForContext` to strip control characters (newlines) and enforce length limits on all profile fields before prompt construction.
