## 2024-05-22 - Frontend Code Splitting
**Learning:** React's `React.lazy` defaults to expecting a `default` export. When working with components that use named exports (like `export const ComponentName = ...`), you must use an intermediate Promise to adapt the module structure: `React.lazy(() => import('./path').then(module => ({ default: module.ComponentName })))`.
**Action:** Use the adapter pattern for named exports when lazy loading, or switch to default exports if appropriate (though named exports are often better for refactoring).
