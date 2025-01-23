import {
  ArrayFieldTemplateItemType,
  ArrayFieldTemplateProps,
  FormContextType,
  getTemplate,
  getUiOptions,
  RJSFSchema,
  StrictRJSFSchema,
} from '@rjsf/utils';

import { cn } from '../../../utils';

export default function ArrayFieldTemplate<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any,
>(props: ArrayFieldTemplateProps<T, S, F>) {
  const {
    canAdd,
    disabled,
    idSchema,
    uiSchema,
    items,
    onAddClick,
    readonly,
    registry,
    required,
    schema,
    title,
  } = props;
  const uiOptions = getUiOptions<T, S, F>(uiSchema);
  const ArrayFieldDescriptionTemplate = getTemplate<
    'ArrayFieldDescriptionTemplate',
    T,
    S,
    F
  >('ArrayFieldDescriptionTemplate', registry, uiOptions);
  const ArrayFieldItemTemplate = getTemplate<'ArrayFieldItemTemplate', T, S, F>(
    'ArrayFieldItemTemplate',
    registry,
    uiOptions,
  );
  const ArrayFieldTitleTemplate = getTemplate<
    'ArrayFieldTitleTemplate',
    T,
    S,
    F
  >('ArrayFieldTitleTemplate', registry, uiOptions);
  // Button templates are not overridden in the uiSchema
  const {
    ButtonTemplates: { AddButton },
  } = registry.templates;

  return (
    <div>
      <div className="m-0 flex p-0">
        <div className="m-0 w-full p-0">
          <ArrayFieldTitleTemplate
            idSchema={idSchema}
            registry={registry}
            required={required}
            schema={schema}
            title={uiOptions.title || title}
            uiSchema={uiSchema}
          />
          <ArrayFieldDescriptionTemplate
            description={uiOptions.description || schema.description}
            idSchema={idSchema}
            registry={registry}
            schema={schema}
            uiSchema={uiSchema}
          />
          <div className={cn('m-0 w-full py-4', items.length === 1 && 'py-0')}>
            {items &&
              items.map(
                ({
                  key,
                  ...itemProps
                }: ArrayFieldTemplateItemType<T, S, F>) => (
                  <ArrayFieldItemTemplate key={key} {...itemProps} />
                ),
              )}

            {canAdd && (
              <AddButton
                className="array-item-add"
                disabled={disabled || readonly}
                onClick={onAddClick}
                registry={registry}
                uiSchema={uiSchema}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
