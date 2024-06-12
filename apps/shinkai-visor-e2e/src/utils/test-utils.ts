export const waitMs = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const waitFor = <T extends void>(
  fn: () => Promise<T | void>,
  retryMs: number,
  timeoutMs: number,
): Promise<T | void> => {
  const start = Date.now();
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    let currentValue: T | void;
    let lastError: Error | undefined;
    while (Date.now() - start < timeoutMs) {
      try {
        currentValue = await fn();
        return resolve(currentValue);
      } catch (e) {
        lastError = e;
        await waitMs(retryMs);
      }
    }
    reject(lastError);
  });
};
