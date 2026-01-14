## 2024-05-22 - Semantic Expansion
**Learning:** `PlantCard` used `div` with `onClick` for expansion, which is inaccessible to keyboard users.
**Action:** Replaced with `<button>` and added `aria-expanded` / `aria-controls`. Ensure future expandable sections use semantic buttons.
