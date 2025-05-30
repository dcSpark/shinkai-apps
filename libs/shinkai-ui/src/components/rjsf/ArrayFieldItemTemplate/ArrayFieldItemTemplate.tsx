import {
  type ArrayFieldTemplateItemType,
  type FormContextType,
  type RJSFSchema,
  type StrictRJSFSchema,
} from '@rjsf/utils';
import { type CSSProperties } from 'react';

export default function ArrayFieldItemTemplate<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any,
>(props: ArrayFieldTemplateItemType<T, S, F>) {
  const {
    children,
    disabled,
    hasToolbar,
    hasCopy,
    hasMoveDown,
    hasMoveUp,
    hasRemove,
    index,
    onCopyIndexClick,
    onDropIndexClick,
    onReorderClick,
    readonly,
    registry,
    uiSchema,
  } = props;

  const { CopyButton, MoveDownButton, MoveUpButton, RemoveButton } =
    registry.templates.ButtonTemplates;
  const btnStyle: CSSProperties = {
    flex: 1,
    paddingLeft: 6,
    paddingRight: 6,
    fontWeight: 'bold',
  };

  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <div className="flex-1">{children}</div>
        <div className="flex-none">
          {hasToolbar && (
            <div className="flex gap-2">
              {/*{(hasMoveUp || hasMoveDown) && (*/}
              {/*  <div className="m-0 p-0">*/}
              {/*    <MoveUpButton*/}
              {/*      className="array-item-move-up"*/}
              {/*      disabled={disabled || readonly || !hasMoveUp}*/}
              {/*      onClick={onReorderClick(index, index - 1)}*/}
              {/*      registry={registry}*/}
              {/*      style={btnStyle}*/}
              {/*      uiSchema={uiSchema}*/}
              {/*    />*/}
              {/*  </div>*/}
              {/*)}*/}
              {/*{(hasMoveUp || hasMoveDown) && (*/}
              {/*  <div className="m-0 p-0">*/}
              {/*    <MoveDownButton*/}
              {/*      disabled={disabled || readonly || !hasMoveDown}*/}
              {/*      onClick={onReorderClick(index, index + 1)}*/}
              {/*      registry={registry}*/}
              {/*      style={btnStyle}*/}
              {/*      uiSchema={uiSchema}*/}
              {/*    />*/}
              {/*  </div>*/}
              {/*)}*/}
              {/*{hasCopy && (*/}
              {/*  <div className="m-0 p-0">*/}
              {/*    <CopyButton*/}
              {/*      disabled={disabled || readonly}*/}
              {/*      onClick={onCopyIndexClick(index)}*/}
              {/*      registry={registry}*/}
              {/*      style={btnStyle}*/}
              {/*      uiSchema={uiSchema}*/}
              {/*    />*/}
              {/*  </div>*/}
              {/*)}*/}
              {hasRemove && (
                <div className="m-0 p-0">
                  <RemoveButton
                    disabled={disabled || readonly}
                    onClick={onDropIndexClick(index)}
                    registry={registry}
                    style={btnStyle}
                    uiSchema={uiSchema}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
