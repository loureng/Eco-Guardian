## 2024-05-24 - Accessible File Inputs
**Learning:** Hidden file inputs (`opacity: 0`) used for custom styled upload buttons must have `aria-label` to be identifiable by screen readers. To support keyboard navigation, the parent container should use `focus-within` styles (e.g., `focus-within:ring-2`) to show focus when the invisible input is selected.
**Action:** When creating custom file inputs, always wrap them in a container with `focus-within` styles and ensure the input has a descriptive `aria-label`.
