import { Button } from "@shinkai_network/shinkai-ui";

const FullPageErrorFallback = ({ error }: { error: Error }) => {
  return (
    <div
      className="flex h-screen flex-col items-center justify-center px-8 text-red-400"
      role="alert"
    >
      <p>Something went wrong. Try refreshing the app.</p>
      <pre className="whitespace-pre-wrap text-balance break-all text-center mb-4">
        {error.message}
      </pre>
      <Button
        onClick={() => window.location.reload()}
        size="sm"
        variant="secondary"
      >
        Refresh
      </Button>
    </div>
  );
};
export default FullPageErrorFallback;
