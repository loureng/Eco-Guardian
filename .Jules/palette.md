## 2025-05-18 - Accessibility on Floating Widgets
**Learning:** Floating widgets like chatbots are often invisible to screen readers without explicit ARIA roles. Adding `role="dialog"` and labeled triggers significantly improves discoverability.
**Action:** When creating floating interactive elements, always ensure they have a semantic role (dialog, alertdialog) and their triggers have accessible names.
