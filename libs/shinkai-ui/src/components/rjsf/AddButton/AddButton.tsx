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
      className={`hover:bg-gray-350 ml-1 grid justify-items-center rounded-md border bg-gray-300 px-4 py-2 text-base font-normal text-white ${props.className}`}
      style={{ width: '100%' }}
      title={translateString(TranslatableString.AddItemButton)}
    >
      <PlusIcon />
    </button>
  );
}
