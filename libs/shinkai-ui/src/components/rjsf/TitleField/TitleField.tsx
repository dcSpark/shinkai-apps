import {
  FormContextType,
  getUiOptions,
  RJSFSchema,
  StrictRJSFSchema,
  TitleFieldProps,
} from '@rjsf/utils';

export default function TitleField<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any,
>({ id, title, uiSchema }: TitleFieldProps<T, S, F>) {
  const uiOptions = getUiOptions<T, S, F>(uiSchema);

  return (
    <div className="my-1" id={id}>
      <h5 className="mb-2 text-lg font-medium leading-tight">
        {uiOptions.title || title}
      </h5>
      <hr className="border-muted my-4 border-t" />
    </div>
  );
}
