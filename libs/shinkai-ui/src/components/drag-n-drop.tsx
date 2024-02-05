import {
  DraggableSyntheticListeners,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core';
import { Transform } from '@dnd-kit/utilities';
import React, { CSSProperties, forwardRef } from 'react';

import { cn } from '../utils';

export function Droppable(props: {
  className?: string;
  children: React.ReactNode;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: 'droppable',
  });

  return (
    <div className={cn(isOver && '', props.className)} ref={setNodeRef}>
      {props.children}
    </div>
  );
}

export interface ActionProps extends React.HTMLAttributes<HTMLButtonElement> {
  active?: {
    fill: string;
    background: string;
  };
  cursor?: CSSProperties['cursor'];
}

// eslint-disable-next-line react/display-name
export const Action = forwardRef<HTMLButtonElement, ActionProps>(
  ({ active, className, cursor, style, ...props }, ref) => {
    return (
      <button
        ref={ref}
        {...props}
        className={cn('Action', className)}
        style={
          {
            ...style,
            cursor,
            '--fill': active?.fill,
            '--background': active?.background,
          } as CSSProperties
        }
        tabIndex={0}
      />
    );
  },
);
// eslint-disable-next-line react/display-name
export const Handle = forwardRef<HTMLButtonElement, ActionProps>(
  (props, ref) => {
    return (
      <Action
        cursor="grab"
        data-cypress="draggable-handle"
        ref={ref}
        {...props}
      >
        <svg viewBox="0 0 20 20" width="12">
          <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z" />
        </svg>
      </Action>
    );
  },
);
export enum Axis {
  All,
  Vertical,
  Horizontal,
}

interface Props {
  axis?: Axis;
  dragOverlay?: boolean;
  dragging?: boolean;
  handle?: boolean;
  listeners?: DraggableSyntheticListeners;
  style?: React.CSSProperties;
  buttonStyle?: React.CSSProperties;
  transform?: Transform | null;
  children: React.ReactNode;
}

export const Draggable = forwardRef<HTMLButtonElement, Props>(
  function Draggable(
    {
      axis,
      dragOverlay,
      dragging,
      handle,
      listeners,
      transform,
      style,
      buttonStyle,
      children,
      ...props
    },
    ref,
  ) {
    return (
      <div
        className={cn(
          'Draggable',
          dragOverlay && 'dragOverlay',
          dragging && 'dragging',
          handle && 'handle',
        )}
        style={
          {
            ...style,
            '--translate-x': `${transform?.x ?? 0}px`,
            '--translate-y': `${transform?.y ?? 0}px`,
          } as React.CSSProperties
        }
      >
        <button
          {...props}
          aria-label="Draggable"
          data-cypress="draggable-item"
          {...(handle ? {} : listeners)}
          ref={ref}
          style={buttonStyle}
          tabIndex={handle ? -1 : undefined}
        >
          {children}
          {handle ? <Handle {...(handle ? listeners : {})} /> : null}
        </button>
      </div>
    );
  },
);

interface DraggableItemProps {
  handle?: boolean;
  style?: React.CSSProperties;
  buttonStyle?: React.CSSProperties;
  axis?: Axis;
  top?: number;
  left?: number;
  children: React.ReactNode;
}
export function DraggableItem({
  axis,
  style,
  top,
  left,
  handle,
  buttonStyle,
  children,
}: DraggableItemProps) {
  const { attributes, isDragging, listeners, setNodeRef, transform } =
    useDraggable({
      id: 'draggable',
    });

  return (
    <Draggable
      axis={axis}
      buttonStyle={buttonStyle}
      dragging={isDragging}
      handle={handle}
      listeners={listeners}
      ref={setNodeRef}
      style={{ ...style, top, left }}
      transform={transform}
      {...attributes}
    >
      {children}
    </Draggable>
  );
}
