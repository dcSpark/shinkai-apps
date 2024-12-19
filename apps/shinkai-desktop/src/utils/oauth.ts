export const oauthUrlMatcherFromErrorMessage = (errorMessage: string) => {
  const match = errorMessage?.match(
    /Execution error: OAuth not setup: (https:\/\/.*)/,
  );
  return match ? match[1] : undefined;
};
