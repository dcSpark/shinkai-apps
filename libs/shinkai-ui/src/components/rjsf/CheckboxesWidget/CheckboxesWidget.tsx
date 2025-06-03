import {
  ariaDescribedByIds,
  enumOptionsDeselectValue,
  enumOptionsIsSelected,
  enumOptionsSelectValue,
  enumOptionsValueForIndex,
  type FormContextType,
  optionId,
  type RJSFSchema,
  type StrictRJSFSchema,
  type WidgetProps,
} from '@rjsf/utils';
import { type ChangeEvent, type FocusEvent } from 'react';

export default function CheckboxesWidget<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any,
>({
  id,
  disabled,
  options,
  value,
  autofocus,
  readonly,
  required,
  onChange,
  onBlur,
  onFocus,
}: WidgetProps<T, S, F>) {
  const { enumOptions, enumDisabled, inline, emptyValue } = options;
  const checkboxesValues = Array.isArray(value) ? value : [value];

  const _onChange =
    (index: number) =>
    ({ target: { checked } }: ChangeEvent<HTMLInputElement>) => {
      if (checked) {
        onChange(
          enumOptionsSelectValue<S>(index, checkboxesValues, enumOptions),
        );
      } else {
        onChange(
          enumOptionsDeselectValue<S>(index, checkboxesValues, enumOptions),
        );
      }
    };

  const _onBlur = ({ target: { value } }: FocusEvent<HTMLInputElement>) =>
    onBlur(id, enumOptionsValueForIndex<S>(value, enumOptions, emptyValue));
  const _onFocus = ({ target: { value } }: FocusEvent<HTMLInputElement>) =>
    onFocus(id, enumOptionsValueForIndex<S>(value, enumOptions, emptyValue));

  return (
    <div className="space-y-4">
      {Array.isArray(enumOptions) &&
        enumOptions.map((option, index: number) => {
          const checked = enumOptionsIsSelected<S>(
            option.value,
            checkboxesValues,
          );
          const itemDisabled =
            Array.isArray(enumDisabled) &&
            enumDisabled.indexOf(option.value) !== -1;

          return (
            <div
              className={`flex items-center ${inline ? 'space-x-2' : ''}`}
              key={option.value}
            >
              <input
                aria-describedby={ariaDescribedByIds<T>(id)}
                autoFocus={autofocus && index === 0}
                checked={checked}
                className="form-checkbox accent-brand border-0 bg-transparent"
                disabled={disabled || itemDisabled || readonly}
                id={optionId(id, index)}
                name={id}
                onBlur={_onBlur}
                onChange={_onChange(index)}
                onFocus={_onFocus}
                required={required}
                type="checkbox"
              />
              <label className="cursor-pointer" htmlFor={optionId(id, index)}>
                {option.label}
              </label>
            </div>
          );
        })}
    </div>
  );
}
