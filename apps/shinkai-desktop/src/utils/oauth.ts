export const oauthUrlMatcherFromErrorMessage = (errorMessage: string) => {
  const match = errorMessage?.match(
    /OAuth not setup: (https:\/\/.*)/,
  );
  return match ? match[1] : undefined;
};
