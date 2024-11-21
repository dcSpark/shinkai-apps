import {
  ariaDescribedByIds,
  BaseInputTemplateProps,
  examplesId,
  FormContextType,
  getInputProps,
  RJSFSchema,
  StrictRJSFSchema,
} from '@rjsf/utils';
import { ChangeEvent, FocusEvent } from 'react';

export default function BaseInputTemplate<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any,
>({
  id,
  placeholder,
  required,
  readonly,
  disabled,
  type,
  value,
  onChange,
  onChangeOverride,
  onBlur,
  onFocus,
  autofocus,
  options,
  schema,
  rawErrors = [],
  children,
  extraProps,
}: BaseInputTemplateProps<T, S, F>) {
  const inputProps = {
    ...extraProps,
    ...getInputProps<T, S, F>(schema, type, options),
  };
  const _onChange = ({ target: { value } }: ChangeEvent<HTMLInputElement>) =>
    onChange(value === '' ? options.emptyValue : value);
  const _onBlur = ({ target: { value } }: FocusEvent<HTMLInputElement>) =>
    onBlur(id, value);
  const _onFocus = ({ target: { value } }: FocusEvent<HTMLInputElement>) =>
    onFocus(id, value);

  const inputClass = `
    border rounded-lg p-2 py-2.5 text-sm text-white focus:border-gray-100 focus:outline-none w-full bg-gray-400
    ${rawErrors.length > 0 ? 'border-red-500' : 'border-gray-200'}
  `;

  return (
    <>
      <input
        autoFocus={autofocus}
        className={inputClass}
        disabled={disabled}
        id={id}
        list={schema.examples ? examplesId<T>(id) : undefined}
        name={id}
        placeholder={placeholder}
        readOnly={readonly}
        required={required}
        type={type}
        {...inputProps}
        aria-describedby={ariaDescribedByIds<T>(id, !!schema.examples)}
        onBlur={_onBlur}
        onChange={onChangeOverride || _onChange}
        onFocus={_onFocus}
        spellCheck={false}
        value={value || value === 0 ? value : ''}
      />
      {children}
      {Array.isArray(schema.examples) ? (
        <datalist id={examplesId<T>(id)}>
          {(schema.examples as string[])
            .concat(
              schema.default && !schema.examples.includes(schema.default)
                ? ([schema.default] as string[])
                : [],
            )
            .map((example: any) => {
              return <option key={example} value={example} />;
            })}
        </datalist>
      ) : null}
    </>
  );
}
