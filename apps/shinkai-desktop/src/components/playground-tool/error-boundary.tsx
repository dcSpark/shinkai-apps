import { Button } from '@shinkai_network/shinkai-ui';

export function ToolErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: (...args: any[]) => void;
}) {
  return (
    <div
      className="flex flex-col items-center justify-center px-8 py-4 text-xs text-red-400"
      role="alert"
    >
      <p>Something went wrong. Try renegerating tool metadata.</p>
      <pre className="mb-4 whitespace-pre-wrap text-balance break-all text-center">
        {error.message}
      </pre>
      <Button
        className="h-[30px]"
        onClick={() => resetErrorBoundary()}
        size="auto"
        type="button"
        variant="outline"
      >
        Try again
      </Button>
    </div>
  );
}
