## 2024-05-23 - Broken Code Hides Behind Build Success
**Learning:** `pnpm build` (via Vite) might succeed even if there are runtime errors or missing references if they are not caught by the type checker (e.g. if the file content on disk is different from what I assume or if I misinterpret `read_file` output). In this case, `read_file` showed me truncated or incomplete files, leading to confusion about missing constants like `DATE_FORMATTER`.
**Action:** Always verify `read_file` output completeness (use `cat` or check line counts if suspicious) before assuming code is broken. Also, trust the compiler (`tsc`) more than my eyes on truncated output.

## 2024-05-23 - Memoization requires stable callbacks
**Learning:** `React.memo` on a child component is useless if the parent passes unstable inline functions as props. This is a common anti-pattern.
**Action:** Always check the parent component (`App.tsx`) for `useCallback` on event handlers before applying `React.memo` to children.
