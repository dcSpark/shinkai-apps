import {
  ArrayFieldTemplateItemType,
  ArrayFieldTemplateProps,
  FormContextType,
  getTemplate,
  getUiOptions,
  RJSFSchema,
  StrictRJSFSchema,
} from '@rjsf/utils';

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
          <div className="m-0 w-full rounded-md border border-gray-200 bg-gray-400 p-4">
            {items &&
              items.map(
                ({
                  key,
                  ...itemProps
                }: ArrayFieldTemplateItemType<T, S, F>) => (
                  <ArrayFieldItemTemplate key={key} {...itemProps} />
                ),
              )}
            {items.length === 0 && canAdd && (
              <div className="mx-auto flex w-full max-w-[160px] flex-col items-center justify-between gap-4 py-2.5">
                <p className="text-gray-80 text-sm">No items found.</p>
                <AddButton
                  className="array-item-add"
                  disabled={disabled || readonly}
                  onClick={onAddClick}
                  registry={registry}
                  uiSchema={uiSchema}
                />
              </div>
            )}
            {items.length > 0 && canAdd && (
              <div className="">
                <div className="mt-2 flex">
                  <div className="w-3/4" />
                  <div className="w-1/4 px-4 py-6">
                    <AddButton
                      className="array-item-add"
                      disabled={disabled || readonly}
                      onClick={onAddClick}
                      registry={registry}
                      uiSchema={uiSchema}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
