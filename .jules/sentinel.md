## 2024-05-21 - Implicit Trust in AI Components
**Vulnerability:** Chatbot rendered links from AI grounding chunks without validation, allowing potential XSS/Open Redirect if the AI hallucinates or is injected. Plant search injected raw user input into prompts.
**Learning:** AI components are external boundaries. Inputs must be sanitized (Prompt Injection) and outputs must be validated (XSS/Open Redirect), just like any other API.
**Prevention:** Use `isSafeUrl` for all AI-generated links. Sanitize all user inputs before inserting into prompts.
