import {
  type ErrorListProps,
  type FormContextType,
  type RJSFSchema,
  type StrictRJSFSchema,
  TranslatableString,
} from '@rjsf/utils';

export default function ErrorList<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any,
>({ errors, registry }: ErrorListProps<T, S, F>) {
  const { translateString } = registry;

  return (
    <div className="mb-4 rounded-sm border border-red-700">
      <div className="rounded-t bg-red-900/20 p-3 text-xs text-red-500">
        {translateString(TranslatableString.ErrorsLabel)}
      </div>
      <div className="p-0 text-xs">
        <ul>
          {errors.map((error, i: number) => {
            return (
              <li className="border-0 p-3" key={i}>
                <span>{error.stack}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
