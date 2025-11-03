export function waitFor(condition: () => boolean, timeout = 60000): Promise<void> {
  return new Promise((resolve, reject) => {
    const to = setTimeout(() => {
      clearInterval(interval);
      reject(new Error("Timeout waiting for condition " + condition.toString()));
    }, timeout);

    const interval = setInterval(() => {
      if (condition()) {
        clearTimeout(to);
        clearInterval(interval);
        resolve();
      }
    }, 100);
  });
}
