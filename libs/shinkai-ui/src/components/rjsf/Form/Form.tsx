import { type FormProps, withTheme } from '@rjsf/core';
import { type FormContextType, type RJSFSchema, type StrictRJSFSchema } from '@rjsf/utils';
import { type ComponentType } from 'react';

import { generateTheme } from '../Theme';

export function generateForm<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any,
>(): ComponentType<FormProps<T, S, F>> {
  return withTheme<T, S, F>(generateTheme<T, S, F>());
}

export default generateForm();
