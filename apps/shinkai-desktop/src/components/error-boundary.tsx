const FullPageErrorFallback = ({ error }: { error: Error }) => {
  return (
    <div
      className="flex h-screen flex-col items-center justify-center text-red-400"
      role="alert"
    >
      <p>Something went wrong. Try refreshing the app.</p>
      <pre>{error.message}</pre>
    </div>
  );
};
export default FullPageErrorFallback;
