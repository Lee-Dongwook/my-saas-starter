// Storybook stub for @storybook/addon-actions.
// Story code can import `action`/`actions` but they are no-ops under Storybook.
export const action =
  (_name?: string) =>
  (...args: unknown[]) => {
    void args;
  };

export const actions = (..._names: string[]) =>
  new Proxy({}, { get: () => action() });

export default { action, actions };
