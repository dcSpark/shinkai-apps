import { cn } from '../utils';

export const TextLink = ({
  label,
  url,
  className,
  ...props
}: {
  label: string;
  url: string;
} & React.ButtonHTMLAttributes<HTMLSpanElement>) => (
  <span
    className={cn('cursor-pointer text-white underline', className)}
    onClick={() => {
      window.open(url);
    }}
    {...props}
  >
    <a href={url} rel="noreferrer" target="_blank">
      {label}
    </a>
  </span>
);
