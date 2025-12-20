## 2024-05-23 - Poor Contrast on Image Overlays
**Learning:** Placing interactive elements (delete button) or status text (badges) over user-generated images with fixed low-opacity backgrounds (`bg-black/20`) leads to accessibility failures when the underlying image is dark or complex.
**Action:** Always use high-contrast backgrounds (e.g., `bg-white/90` or `bg-slate-900/80`) or ensure sufficient opacity/blur for text readability.
