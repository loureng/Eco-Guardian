## 2024-05-23 - Input Length Limits
**Vulnerability:** Text inputs in `PlantForm.tsx` and `App.tsx` lacked `maxLength` attributes.
**Learning:** React inputs default to unlimited length. Without constraints, a user could paste extremely large strings (megabytes of text) into fields like "Common Name" or "Description". This could lead to:
1.  **Denial of Service (DoS):** Rendering large text blocks can freeze the browser.
2.  **Storage Exhaustion:** Storing these large strings in `localStorage` (which has a ~5MB quota) could quickly fill it up, causing `QuotaExceededError` and breaking the app for the user.
**Prevention:** Always add `maxLength` attributes to `<input>` and `<textarea>` elements, especially when data is persisted to client-side storage or sent to APIs. Set reasonable limits (e.g., 50-100 chars for names, 500-1000 for descriptions).
