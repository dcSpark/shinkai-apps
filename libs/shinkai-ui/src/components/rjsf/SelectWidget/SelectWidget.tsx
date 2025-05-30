import {
  ariaDescribedByIds,
  enumOptionsIndexForValue,
  enumOptionsValueForIndex,
  type FormContextType,
  type RJSFSchema,
  type StrictRJSFSchema,
  type WidgetProps,
} from '@rjsf/utils';
import { type ChangeEvent, type FocusEvent } from 'react';

export default function SelectWidget<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any,
>({
  schema,
  id,
  options,
  required,
  disabled,
  readonly,
  value,
  multiple,
  autofocus,
  onChange,
  onBlur,
  onFocus,
  placeholder,
  rawErrors = [],
}: WidgetProps<T, S, F>) {
  const { enumOptions, enumDisabled, emptyValue: optEmptyValue } = options;

  const emptyValue = multiple ? [] : '';

  function getValue(event: FocusEvent | ChangeEvent | any, multiple?: boolean) {
    if (multiple) {
      return [].slice
        .call(event.target.options as any)
        .filter((o: any) => o.selected)
        .map((o: any) => o.value);
    } else {
      return event.target.value;
    }
  }
  const selectedIndexes = enumOptionsIndexForValue<S>(
    value,
    enumOptions,
    multiple,
  );

  return (
    <select
      aria-describedby={ariaDescribedByIds<T>(id)}
      autoFocus={autofocus}
      className={`w-full border border-gray-100 bg-gray-400 p-2 text-white focus:border-gray-100 focus:outline-none ${rawErrors.length > 0 ? 'border-red-500' : 'border-gray-100'} `}
      disabled={disabled || readonly}
      id={id}
      multiple={multiple}
      name={id}
      onBlur={
        onBlur &&
        ((event: FocusEvent) => {
          const newValue = getValue(event, multiple);
          onBlur(
            id,
            enumOptionsValueForIndex<S>(newValue, enumOptions, optEmptyValue),
          );
        })
      }
      onChange={(event: ChangeEvent) => {
        const newValue = getValue(event, multiple);
        onChange(
          enumOptionsValueForIndex<S>(newValue, enumOptions, optEmptyValue),
        );
      }}
      onFocus={
        onFocus &&
        ((event: FocusEvent) => {
          const newValue = getValue(event, multiple);
          onFocus(
            id,
            enumOptionsValueForIndex<S>(newValue, enumOptions, optEmptyValue),
          );
        })
      }
      required={required}
      value={
        typeof selectedIndexes === 'undefined' ? emptyValue : selectedIndexes
      }
    >
      {!multiple && schema.default === undefined && (
        <option className="bg-gray-400" value="">
          {placeholder}
        </option>
      )}
      {(enumOptions as any).map(({ value, label }: any, i: number) => {
        const disabled: any =
          Array.isArray(enumDisabled) &&
          (enumDisabled as any).indexOf(value) != -1;
        return (
          <option
            className="bg-gray-400"
            disabled={disabled}
            id={label}
            key={i}
            value={String(i)}
          >
            {label}
          </option>
        );
      })}
    </select>
  );
}
