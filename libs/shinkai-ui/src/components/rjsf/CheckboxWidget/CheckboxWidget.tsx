import {
  ariaDescribedByIds,
  descriptionId,
  FormContextType,
  getTemplate,
  labelValue,
  RJSFSchema,
  schemaRequiresTrueValue,
  StrictRJSFSchema,
  WidgetProps,
} from '@rjsf/utils';
import React, { FocusEvent } from 'react';

import { cn } from '../../../utils';

export default function CheckboxWidget<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any,
>(props: WidgetProps<T, S, F>) {
  const {
    id,
    value,
    disabled,
    readonly,
    label,
    hideLabel,
    schema,
    autofocus,
    options,
    onChange,
    onBlur,
    onFocus,
    registry,
    uiSchema,
  } = props;
  // Because an unchecked checkbox will cause html5 validation to fail, only add
  // the "required" attribute if the field value must be "true", due to the
  // "const" or "enum" keywords
  const required = schemaRequiresTrueValue<S>(schema);
  const DescriptionFieldTemplate = getTemplate<
    'DescriptionFieldTemplate',
    T,
    S,
    F
  >('DescriptionFieldTemplate', registry, options);

  const _onChange = ({ target: { checked } }: FocusEvent<HTMLInputElement>) =>
    onChange(checked);
  const _onBlur = ({ target: { checked } }: FocusEvent<HTMLInputElement>) =>
    onBlur(id, checked);
  const _onFocus = ({ target: { checked } }: FocusEvent<HTMLInputElement>) =>
    onFocus(id, checked);

  const description = options.description || schema.description;
  return (
    <div
      aria-describedby={ariaDescribedByIds<T>(id)}
      className={`relative ${
        disabled || readonly ? 'cursor-not-allowed opacity-50' : ''
      }`}
    >
      {!hideLabel && !!description && (
        <DescriptionFieldTemplate
          description={description}
          id={descriptionId<T>(id)}
          registry={registry}
          schema={schema}
          uiSchema={uiSchema}
        />
      )}

      <label
        className={cn('mt-4 inline-block cursor-pointer text-sm leading-none')}
      >
        {/*<Checkbox*/}
        {/*  autoFocus={autofocus}*/}
        {/*  checked={typeof value === 'undefined' ? false : value}*/}
        {/*  disabled={disabled || readonly}*/}
        {/*  id={id}*/}
        {/*  name={id}*/}
        {/*  onBlur={_onBlur as any}*/}
        {/*  onCheckedChange={(checked) =>*/}
        {/*    _onChange({ target: { checked: checked as boolean } } as any)*/}
        {/*  }*/}
        {/*  onFocus={_onFocus as any}*/}
        {/*  required={required}*/}
        {/*/>*/}
        <input
          autoFocus={autofocus}
          checked={typeof value === 'undefined' ? false : value}
          className="form-checkbox text-primary accent-brand"
          disabled={disabled || readonly}
          id={id}
          name={id}
          onBlur={_onBlur}
          onChange={_onChange}
          onFocus={_onFocus}
          required={required}
          type="checkbox"
        />
        <span className="ml-2">{labelValue(label, hideLabel || !label)}</span>
      </label>
    </div>
  );
}
