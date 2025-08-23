const LOG_LEVELS = ["error", "warn", "log", "info", "debug"] as const;

const LOGGER_LVL: keyof typeof LOG_LEVELS = 2;
const universal =
  (level: number) =>
  (...args: any[]) => {
    if (LOGGER_LVL >= level) {
      console[LOG_LEVELS[level]](...args);
    }
  };
export const logger = Object.fromEntries(Object.entries(LOG_LEVELS).map(([key, value]) => [value, universal(Number(key))]));
