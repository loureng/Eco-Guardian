export const DATE_FORMATTER = new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "short" });

// ⚡ Bolt Optimization: Cached formatters to prevent instantiation in render loops
export const WEEKDAY_SHORT_FORMATTER = new Intl.DateTimeFormat("pt-BR", { weekday: "short" });
export const WEEKDAY_LONG_FORMATTER = new Intl.DateTimeFormat("pt-BR", { weekday: "long" });
export const DATE_FULL_SHORT_FORMATTER = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
