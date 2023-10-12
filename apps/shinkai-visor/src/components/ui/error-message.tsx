const ErrorMessage = ({ message }: { message: string }) => {
  return (
    <div className="rounded bg-red-500/10 px-4 py-2 text-sm text-red-700">
      <strong className="font-bold">Error: </strong>
      <span className="block sm:inline"> {message} </span>
    </div>
  );
};

export default ErrorMessage;
