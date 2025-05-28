import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '../utils';

const alertVariants = cva(
  '[&>svg]:text-foreground relative w-full rounded-lg border p-4 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg~*]:pl-7',
  {
    variants: {
      variant: {
        default: 'background-secondary-600/50 text-foreground',
        info: 'text-gray-80 [&>svg]:text-gray-80 bg-gray-250 border-gray-100 border-gray-200',
        destructive:
          'border-[#4d0408] bg-[#2d0607] text-[#ff9ea1] [&>svg]:text-[#ff9ea1]',
        warning:
          'border-yellow-800 bg-yellow-900 text-yellow-400 [&>svg]:text-yellow-400',
        success:
          'border-green-800 bg-green-900 text-green-400 [&>svg]:text-green-400',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

type AlertProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof alertVariants> & {
    ref?: React.RefObject<HTMLDivElement>;
  };

const Alert = ({ className, variant, ref, ...props }: AlertProps) => (
  <div
    className={cn(alertVariants({ variant }), className)}
    ref={ref}
    role="alert"
    {...props}
  />
);
Alert.displayName = 'Alert';

type AlertTitleProps = React.HTMLAttributes<HTMLHeadingElement> & {
  ref?: React.RefObject<HTMLParagraphElement>;
};

const AlertTitle = ({ className, ref, ...props }: AlertTitleProps) => (
  // eslint-disable-next-line jsx-a11y/heading-has-content
  <h5
    className={cn('mb-1 font-medium leading-none tracking-tight', className)}
    ref={ref}
    {...props}
  />
);
AlertTitle.displayName = 'AlertTitle';

type AlertDescriptionProps = React.HTMLAttributes<HTMLParagraphElement> & {
  ref?: React.RefObject<HTMLParagraphElement>;
};

const AlertDescription = ({ className, ref, ...props }: AlertDescriptionProps) => (
  <div
    className={cn('text-sm [&_p]:leading-relaxed', className)}
    ref={ref}
    {...props}
  />
);
AlertDescription.displayName = 'AlertDescription';

export { Alert, AlertTitle, AlertDescription };
