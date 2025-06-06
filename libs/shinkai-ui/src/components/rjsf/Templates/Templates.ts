import {
  type FormContextType,
  type RJSFSchema,
  type StrictRJSFSchema,
  type TemplatesType,
} from '@rjsf/utils';

import AddButton from '../AddButton';
import ArrayFieldItemTemplate from '../ArrayFieldItemTemplate';
import ArrayFieldTemplate from '../ArrayFieldTemplate';
import BaseInputTemplate from '../BaseInputTemplate/BaseInputTemplate';
import DescriptionField from '../DescriptionField';
import ErrorList from '../ErrorList';
import FieldErrorTemplate from '../FieldErrorTemplate';
import FieldHelpTemplate from '../FieldHelpTemplate';
import FieldTemplate from '../FieldTemplate';
import {
  CopyButton,
  MoveDownButton,
  MoveUpButton,
  RemoveButton,
} from '../IconButton';
import ObjectFieldTemplate from '../ObjectFieldTemplate';
import SubmitButton from '../SubmitButton';
import TitleField from '../TitleField';
import WrapIfAdditionalTemplate from '../WrapIfAdditionalTemplate';

export function generateTemplates<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any,
>(): Partial<TemplatesType<T, S, F>> {
  return {
    ArrayFieldItemTemplate,
    ArrayFieldTemplate,
    BaseInputTemplate,
    ButtonTemplates: {
      AddButton,
      CopyButton,
      MoveDownButton,
      MoveUpButton,
      RemoveButton,
      SubmitButton,
    },
    DescriptionFieldTemplate: DescriptionField,
    ErrorListTemplate: ErrorList,
    FieldErrorTemplate,
    FieldHelpTemplate,
    FieldTemplate,
    ObjectFieldTemplate,
    TitleFieldTemplate: TitleField,
    WrapIfAdditionalTemplate,
  };
}

export default generateTemplates();
