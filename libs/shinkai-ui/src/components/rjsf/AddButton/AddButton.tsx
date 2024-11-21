import { PlusCircledIcon } from '@radix-ui/react-icons';
import {
  FormContextType,
  IconButtonProps,
  RJSFSchema,
  StrictRJSFSchema,
  TranslatableString,
} from '@rjsf/utils';
import { PlusIcon } from 'lucide-react';

export default function AddButton<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any,
>({ uiSchema, registry, ...props }: IconButtonProps<T, S, F>) {
  const { translateString } = registry;
  return (
    <button
      {...props}
      className={`hover:bg-gray-350 ml-1 flex items-center justify-center gap-2 rounded-md border bg-gray-300 px-4 py-2 text-base text-sm font-normal text-white ${props.className}`}
      title={translateString(TranslatableString.AddItemButton)}
    >
      <PlusCircledIcon /> New Item
    </button>
  );
}
