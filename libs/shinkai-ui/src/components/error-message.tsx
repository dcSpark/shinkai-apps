import React from 'react';

interface ErrorMessageProps extends React.HTMLAttributes<HTMLDivElement> {
  message: string;
}

const ErrorMessage = ({ message, ...props }: ErrorMessageProps) => {
  return (
    <div
      className="rounded-sm bg-red-500/10 px-4 py-2 text-sm text-red-700"
      {...props}
    >
      <strong className="font-bold">Error: </strong>
      <span className="block sm:inline"> {message} </span>
    </div>
  );
};

export { ErrorMessage };
