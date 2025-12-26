## 2024-05-23 - Poor Contrast on Image Overlays
**Learning:** Placing interactive elements (delete button) or status text (badges) over user-generated images with fixed low-opacity backgrounds (`bg-black/20`) leads to accessibility failures when the underlying image is dark or complex.
**Action:** Always use high-contrast backgrounds (e.g., `bg-white/90` or `bg-slate-900/80`) or ensure sufficient opacity/blur for text readability.
## 2025-10-25 - Interactive Breadcrumbs
**Learning:** Using `span` with `onClick` for navigation is a common accessibility trap. It breaks keyboard navigation and screen reader support.
**Action:** Always use `button` or `a` for navigation elements, and wrap breadcrumbs in a `nav` with an `aria-label`.

## 2025-12-26 - Form Label Association
**Learning:** Using generic IDs or missing `htmlFor` attributes in forms prevents screen readers from correctly announcing labels and reduces the hit area for mouse/touch users. When components are reused (like in modals), hardcoded IDs can collide.
**Action:** Use `React.useId()` to generate unique, stable IDs for each form instance, and consistently link all labels to their inputs using `htmlFor={id}` and `id={id}`.
