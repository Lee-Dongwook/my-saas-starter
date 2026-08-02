export const setupWorker = () => ({
  start: () => Promise.resolve(),
  stop: () => Promise.resolve(),
  use: () => {},
  resetHandlers: () => {},
  restoreHandlers: () => {},
  listHandlers: () => [],
});

export default { setupWorker };
