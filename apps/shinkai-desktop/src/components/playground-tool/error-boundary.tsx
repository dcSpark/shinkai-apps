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
      className="flex flex-col items-center gap-2 bg-red-900/20 px-3 py-4 text-xs text-red-400"
      role="alert"
    >
      <p>Tool metadata failed. Try generating again.</p>
      <pre className="max-w-sm whitespace-break-spaces text-center">
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
