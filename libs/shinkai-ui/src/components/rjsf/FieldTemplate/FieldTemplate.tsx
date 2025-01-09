import {
  FieldTemplateProps,
  FormContextType,
  getTemplate,
  getUiOptions,
  RJSFSchema,
  StrictRJSFSchema,
} from '@rjsf/utils';

import { formatText } from '../../../helpers/format-text';
import { cn } from '../../../utils';

export default function FieldTemplate<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any,
>({
  id,
  children,
  displayLabel,
  rawErrors = [],
  errors,
  help,
  description,
  rawDescription,
  classNames,
  style,
  disabled,
  label,
  hidden,
  onDropPropertyClick,
  onKeyChange,
  readonly,
  required,
  schema,
  uiSchema,
  registry,
}: FieldTemplateProps<T, S, F>) {
  const uiOptions = getUiOptions(uiSchema);
  const WrapIfAdditionalTemplate = getTemplate<
    'WrapIfAdditionalTemplate',
    T,
    S,
    F
  >('WrapIfAdditionalTemplate', registry, uiOptions);
  if (hidden) {
    return <div className="hidden">{children}</div>;
  }
  return (
    <WrapIfAdditionalTemplate
      classNames={classNames}
      disabled={disabled}
      id={id}
      label={label}
      onDropPropertyClick={onDropPropertyClick}
      onKeyChange={onKeyChange}
      readonly={readonly}
      registry={registry}
      required={required}
      schema={schema}
      style={style}
      uiSchema={uiSchema}
    >
      <div className="mb-3 block">
        {displayLabel && (
          <label
            className={cn(
              'text-gray-80 mb-2 inline-block text-xs uppercase tracking-[2px]',
              rawErrors.length > 0 ? 'text-red-500' : '',
            )}
            htmlFor={id}
          >
            {formatText(label)}
            <span className="ml-1">{required ? '*' : null}</span>
          </label>
        )}
        {children}
        {displayLabel && rawDescription && (
          <small className="mt-1 block">
            <div
              className={cn(
                rawErrors.length > 0 ? 'text-red-500' : 'text-gray-80',
              )}
            >
              {description}
            </div>
          </small>
        )}
        {errors}
        {help}
      </div>
    </WrapIfAdditionalTemplate>
  );
}
