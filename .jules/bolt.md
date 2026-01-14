## 2026-01-14 - Broken Codebase State
**Learning:** The codebase contained undefined references (`currentUser`, `getAlertStyle`) and a broken `index.html` (missing entry script).
**Action:** Always run a build/type-check step (`tsc`) before attempting optimizations to verify baseline health. Fix critical errors first.
