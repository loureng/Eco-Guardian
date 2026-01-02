# Bolt's Performance Journal

## 2025-02-19 - React Memoization and Handler Stability
**Learning:** Even if a component seems simple, passing inline functions as props invalidates any potential `React.memo` optimization or even basic prop shallow comparison. In `App.tsx`, major handlers like `handleWater` were defined as inline arrow functions, causing all `PlantCard` components to re-render whenever the parent `App` re-rendered (e.g., menu toggle, weather refresh), regardless of whether the plant data changed.
**Action:** Always wrap handlers passed to lists of children in `useCallback` and ensure the children are wrapped in `React.memo`. This is critical for list performance.
