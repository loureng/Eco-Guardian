## 2024-05-23 - [Compilation Fix & Memoization]
**Learning:** Sometimes the "performance" task reveals broken code (undefined variables). Optimization must include fixing the build.
**Action:** Always run `tsc` or a build check before assuming code is ready for optimization. In this case, `currentUser` was undefined in `App.tsx` and helper functions were missing in `PlantCard.tsx`.
