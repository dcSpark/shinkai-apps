import {
  FormContextType,
  getUiOptions,
  RJSFSchema,
  StrictRJSFSchema,
  TitleFieldProps,
} from '@rjsf/utils';

import { cn } from '../../../utils';

export default function TitleField<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any,
>({ id, title, uiSchema }: TitleFieldProps<T, S, F>) {
  const uiOptions = getUiOptions<T, S, F>(uiSchema);

  return (
    <div id={id}>
      <h5 className={cn('mb-2 inline-block text-xs uppercase text-gray-50')}>
        {uiOptions.title || title}
      </h5>
      {/*<hr className="my-1 border-t border-gray-200" />*/}
    </div>
  );
}
