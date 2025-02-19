import {
  ariaDescribedByIds,
  FormContextType,
  RJSFSchema,
  StrictRJSFSchema,
  WidgetProps,
} from '@rjsf/utils';
import { ChangeEvent, FocusEvent } from 'react';

type CustomWidgetProps<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any,
> = WidgetProps<T, S, F> & {
  options: any;
};

export default function TextareaWidget<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any,
>({
  id,
  placeholder,
  value,
  required,
  disabled,
  autofocus,
  readonly,
  onBlur,
  onFocus,
  onChange,
  options,
}: CustomWidgetProps<T, S, F>) {
  const _onChange = ({ target: { value } }: ChangeEvent<HTMLTextAreaElement>) =>
    onChange(value === '' ? options.emptyValue : value);
  const _onBlur = ({ target: { value } }: FocusEvent<HTMLTextAreaElement>) =>
    onBlur(id, value);
  const _onFocus = ({ target: { value } }: FocusEvent<HTMLTextAreaElement>) =>
    onFocus(id, value);

  return (
    <div className="flex">
      <textarea
        aria-describedby={ariaDescribedByIds<T>(id)}
        autoFocus={autofocus}
        className="bg-official-gray-900 w-full border px-3 py-2 text-white"
        disabled={disabled}
        id={id}
        name={id}
        onBlur={_onBlur}
        onChange={_onChange}
        onFocus={_onFocus}
        placeholder={placeholder}
        readOnly={readonly}
        required={required}
        rows={options.rows || 5}
        value={value}
      />
    </div>
  );
}
