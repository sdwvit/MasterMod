export const deepMerge = (target: unknown, source: unknown, preferLeft = true): typeof target & typeof source => {
  if (typeof target !== "object" || typeof source !== "object") {
    return source;
  }
  for (const key of Object.keys(source)) {
    if (key in target) {
      target[key] = deepMerge(target[key], source[key]);
    } else {
      if (preferLeft) {
        target[key] ||= source[key];
      } else {
        target[key] = source[key];
      }
    }
  }
  return target;
};
