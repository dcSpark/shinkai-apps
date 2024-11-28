import { PlusCircledIcon } from '@radix-ui/react-icons';
import {
  FormContextType,
  IconButtonProps,
  RJSFSchema,
  StrictRJSFSchema,
} from '@rjsf/utils';

import { cn } from '../../../utils';
import { Button } from '../../button';

export default function AddButton<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any,
>({ uiSchema, registry, ...props }: IconButtonProps<T, S, F>) {
  return (
    <Button
      {...props}
      className={cn(
        'flex w-full items-center justify-center gap-2 rounded-md border-0 px-4 py-2',
        props.className,
      )}
      size="sm"
      variant="outline"
    >
      <PlusCircledIcon /> New Item
    </Button>
  );
}
