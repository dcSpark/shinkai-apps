const FullPageErrorFallback = ({ error }: { error: Error }) => {
  return (
    <div
      className="flex h-screen flex-col items-center justify-center px-8 text-red-400"
      role="alert"
    >
      <p>Something went wrong. Try refreshing the app.</p>
      <pre className="whitespace-pre-wrap text-balance break-all text-center">
        {error.message}
      </pre>
    </div>
  );
};
export default FullPageErrorFallback;
