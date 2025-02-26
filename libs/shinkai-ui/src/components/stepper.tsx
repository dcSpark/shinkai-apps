import { CheckIcon } from '@radix-ui/react-icons';
import { LoaderCircle } from 'lucide-react';
import * as React from 'react';
import { createContext, useContext } from 'react';

import { cn } from '../utils';

type StepperContextValue = {
  activeStep: number;
  setActiveStep: (step: number) => void;
  orientation: 'horizontal' | 'vertical';
};

type StepItemContextValue = {
  step: number;
  state: StepState;
  isDisabled: boolean;
  isLoading: boolean;
};

type StepState = 'active' | 'completed' | 'inactive' | 'loading';

const StepperContext = createContext<StepperContextValue | undefined>(
  undefined,
);
const StepItemContext = createContext<StepItemContextValue | undefined>(
  undefined,
);

const useStepper = () => {
  const context = useContext(StepperContext);
  if (!context) {
    throw new Error('useStepper must be used within a Stepper');
  }
  return context;
};

const useStepItem = () => {
  const context = useContext(StepItemContext);
  if (!context) {
    throw new Error('useStepItem must be used within a StepperItem');
  }
  return context;
};

interface StepperProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue?: number;
  value?: number;
  onValueChange?: (value: number) => void;
  orientation?: 'horizontal' | 'vertical';
}

const Stepper = React.forwardRef<HTMLDivElement, StepperProps>(
  (
    {
      defaultValue = 0,
      value,
      onValueChange,
      orientation = 'horizontal',
      className,
      ...props
    },
    ref,
  ) => {
    const [activeStep, setInternalStep] = React.useState(defaultValue);

    const setActiveStep = React.useCallback(
      (step: number) => {
        if (value === undefined) {
          setInternalStep(step);
        }
        onValueChange?.(step);
      },
      [value, onValueChange],
    );

    const currentStep = value ?? activeStep;

    return (
      <StepperContext.Provider
        value={{
          activeStep: currentStep,
          setActiveStep,
          orientation,
        }}
      >
        <div
          className={cn(
            'group/stepper inline-flex data-[orientation=horizontal]:w-full data-[orientation=horizontal]:flex-row data-[orientation=vertical]:flex-col',
            className,
          )}
          data-orientation={orientation}
          ref={ref}
          {...props}
        />
      </StepperContext.Provider>
    );
  },
);
Stepper.displayName = 'Stepper';

// StepperItem
interface StepperItemProps extends React.HTMLAttributes<HTMLDivElement> {
  step: number;
  completed?: boolean;
  disabled?: boolean;
  loading?: boolean;
}

const StepperItem = React.forwardRef<HTMLDivElement, StepperItemProps>(
  (
    {
      step,
      completed = false,
      disabled = false,
      loading = false,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const { activeStep } = useStepper();

    const state: StepState =
      completed || step < activeStep
        ? 'completed'
        : activeStep === step
          ? 'active'
          : 'inactive';

    const isLoading = loading && step === activeStep;

    return (
      <StepItemContext.Provider
        value={{ step, state, isDisabled: disabled, isLoading }}
      >
        <div
          className={cn(
            'group/step flex items-center group-data-[orientation=horizontal]/stepper:flex-row group-data-[orientation=vertical]/stepper:flex-col',
            className,
          )}
          data-state={state}
          ref={ref}
          {...(isLoading ? { 'data-loading': true } : {})}
          {...props}
        >
          {children}
        </div>
      </StepItemContext.Provider>
    );
  },
);
StepperItem.displayName = 'StepperItem';

// StepperTrigger
interface StepperTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

const StepperTrigger = React.forwardRef<HTMLButtonElement, StepperTriggerProps>(
  ({ asChild = false, className, children, ...props }, ref) => {
    const { setActiveStep } = useStepper();
    const { step, isDisabled } = useStepItem();

    if (asChild) {
      return <div className={className}>{children}</div>;
    }

    return (
      <button
        className={cn(
          'inline-flex items-center gap-3 disabled:pointer-events-none',
          className,
        )}
        disabled={isDisabled}
        onClick={() => setActiveStep(step)}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  },
);
StepperTrigger.displayName = 'StepperTrigger';

interface StepperIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

const StepperIndicator = React.forwardRef<
  HTMLDivElement,
  StepperIndicatorProps
>(({ asChild = false, className, children, ...props }, ref) => {
  const { state, step, isLoading } = useStepItem();

  return (
    <div
      className={cn(
        'bg-official-gray-700 text-muted-foreground data-[state=completed]:bg-brand data-[state=active]:text-primary-foreground data-[state=completed]:text-primary-foreground data-[state=active]:bg-official-gray-500 relative flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-medium',
        className,
      )}
      data-state={state}
      ref={ref}
      {...props}
    >
      {asChild ? (
        children
      ) : (
        <>
          <span className="transition-all group-data-[loading=true]/step:scale-0 group-data-[state=completed]/step:scale-0 group-data-[loading=true]/step:opacity-0 group-data-[state=completed]/step:opacity-0 group-data-[loading=true]/step:transition-none">
            {step}
          </span>
          <CheckIcon
            aria-hidden="true"
            className="absolute scale-0 opacity-0 transition-all group-data-[state=completed]/step:scale-100 group-data-[state=completed]/step:opacity-100"
            // size={16}
            strokeWidth={2}
          />
          {isLoading && (
            <span className="absolute transition-all">
              <LoaderCircle
                aria-hidden="true"
                className="animate-spin"
                size={14}
                strokeWidth={2}
              />
            </span>
          )}
        </>
      )}
    </div>
  );
});
StepperIndicator.displayName = 'StepperIndicator';

// StepperTitle
const StepperTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3 className={cn('text-sm font-medium', className)} ref={ref} {...props} />
));
StepperTitle.displayName = 'StepperTitle';

const StepperDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    className={cn('text-muted-foreground text-sm', className)}
    ref={ref}
    {...props}
  />
));
StepperDescription.displayName = 'StepperDescription';

const StepperSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      className={cn(
        'bg-muted group-data-[state=completed]/step:bg-primary m-0.5 group-data-[orientation=horizontal]/stepper:h-0.5 group-data-[orientation=vertical]/stepper:h-12 group-data-[orientation=horizontal]/stepper:w-full group-data-[orientation=vertical]/stepper:w-0.5 group-data-[orientation=horizontal]/stepper:flex-1',
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
StepperSeparator.displayName = 'StepperSeparator';

export {
  Stepper,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
};
