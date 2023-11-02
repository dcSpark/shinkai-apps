const ErrorMessage = ({ message }: { message: string }) => {
  return (
    <div className="rounded bg-red-500/10 px-2 py-2 text-sm text-red-700">
      <strong className="font-bold">Error: </strong>
      <span className=" sm:inline"> {message} </span>
    </div>
  );
};

export default ErrorMessage;
