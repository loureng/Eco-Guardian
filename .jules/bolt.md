# Bolt's Journal

## 2024-05-22 - [Pattern] Memoization Stability
**Learning:** `useRef` is an effective way to keep callbacks stable for `React.memo` components when they need access to changing state (like `weatherRef` in `App.tsx`), avoiding the need to recreate the callback and break memoization.
**Action:** When optimizing handlers passed to expensive components, check if `useRef` can store the dependency instead of adding it to the dependency array.

## 2024-05-22 - [Pattern] Hoisting Constants
**Learning:** `Intl.DateTimeFormat` instantiation is expensive. Hoisting it outside the component (as done in `PlantCard.tsx`) significantly reduces overhead in lists.
**Action:** Always hoist `Intl` formatters and static helper functions outside the component body.
