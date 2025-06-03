import {
  canExpand,
  descriptionId,
  type FormContextType,
  getTemplate,
  getUiOptions,
  type ObjectFieldTemplateProps,
  type RJSFSchema,
  type StrictRJSFSchema,
  titleId,
} from '@rjsf/utils';

export default function ObjectFieldTemplate<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any,
>({
  description,
  title,
  properties,
  required,
  uiSchema,
  idSchema,
  schema,
  formData,
  onAddClick,
  disabled,
  readonly,
  registry,
}: ObjectFieldTemplateProps<T, S, F>) {
  const uiOptions = getUiOptions<T, S, F>(uiSchema);
  const TitleFieldTemplate = getTemplate<'TitleFieldTemplate', T, S, F>(
    'TitleFieldTemplate',
    registry,
    uiOptions,
  );
  const DescriptionFieldTemplate = getTemplate<
    'DescriptionFieldTemplate',
    T,
    S,
    F
  >('DescriptionFieldTemplate', registry, uiOptions);
  // Button templates are not overridden in the uiSchema
  const {
    ButtonTemplates: { AddButton },
  } = registry.templates;

  return (
    <>
      {title && (
        <TitleFieldTemplate
          id={titleId<T>(idSchema)}
          registry={registry}
          required={required}
          schema={schema}
          title={title}
          uiSchema={uiSchema}
        />
      )}
      {description && (
        <DescriptionFieldTemplate
          description={description}
          id={descriptionId<T>(idSchema)}
          registry={registry}
          schema={schema}
          uiSchema={uiSchema}
        />
      )}
      <div className="p-0">
        {properties.map((element: any, index: number) => (
          <div
            className={`${element.hidden ? 'hidden' : ''} mb-2.5 flex`}
            key={index}
          >
            <div className="w-full"> {element.content}</div>
          </div>
        ))}
        {canExpand(schema, uiSchema, formData) ? (
          <div className="flex">
            <div className="ml-auto w-1/4 py-4">
              <AddButton
                className="object-property-expand"
                disabled={disabled || readonly}
                onClick={onAddClick(schema)}
                registry={registry}
                uiSchema={uiSchema}
              />
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}
