## 2024-05-24 - Interactive Card Accessibility
**Learning:** Complex cards with multiple interactive zones (expand vs delete) require careful layering. Nesting buttons is invalid, so absolute positioning with z-index is necessary to maintain semantic HTML structure while preserving visual design. `pointer-events-none` on overlay elements (like badges) is crucial to prevent blocking clicks on underlying buttons.
**Action:** When making card headers clickable, always check for nested interactive elements and refactor to use sibling positioning if needed.
