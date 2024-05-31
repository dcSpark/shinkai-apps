import * as React from 'react';
import { useEffect, useImperativeHandle, useRef } from 'react';

import { cn } from '../utils';
import { Badge } from './badge';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, startAdornment, endAdornment, ...props }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const startAdornmentRef = useRef<HTMLDivElement>(null);
    const endAdornmentRef = useRef<HTMLDivElement>(null);

    const style: React.CSSProperties = {};
    if (startAdornment) {
      style.paddingLeft = `${
        (startAdornmentRef?.current?.offsetWidth ?? 0) + 20
      }px`;
    }
    if (endAdornment) {
      style.paddingRight = `${
        (endAdornmentRef?.current?.offsetWidth ?? 0) + 20
      }px`;
    }

    useImperativeHandle(ref, () => inputRef.current!, []);

    useEffect(() => {
      if (props.autoFocus) {
        setTimeout(() => {
          // trick to wait the modal to be opened to focus
          inputRef?.current?.focus();
        }, 0);
      }
    }, [props.autoFocus]);
    return (
      <>
        <input
          className={cn(
            'h-input disabled:text-gray-80 peer w-full rounded-lg border border-gray-200 bg-gray-400 px-4 py-3 pt-8 text-sm font-medium text-white placeholder-transparent outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-gray-200 focus:border focus:border-gray-100 focus:outline-0 disabled:border-0 disabled:bg-gray-400',
            startAdornment && 'pl-[var(--custom-padding-left-input)]',
            endAdornment && 'pr-[var(--custom-padding-right-input)]',
            className,
          )}
          placeholder=" "
          ref={inputRef}
          style={style}
          type={type}
          {...props}
        />
        {startAdornment ? (
          <Badge
            className="peer/adornment adornment absolute left-4 top-[30px]"
            ref={startAdornmentRef}
            variant="inputAdornment"
          >
            {startAdornment}
          </Badge>
        ) : null}
        {endAdornment && typeof endAdornment === 'string' ? (
          <Badge
            className="peer/adornment adornment absolute right-4 top-[30px]"
            ref={endAdornmentRef}
            variant="inputAdornment"
          >
            {endAdornment}
          </Badge>
        ) : null}
        {endAdornment &&
        typeof endAdornment !== 'string' &&
        React.isValidElement(endAdornment)
          ? React.cloneElement(endAdornment as React.ReactElement, {
              ref: endAdornmentRef,
            })
          : null}
      </>
    );
  },
);

Input.displayName = 'Input';

export { Input };
