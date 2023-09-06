import React from 'react';

export interface Command {
  command?: String;
  icon?: React.ReactNode;
  title: String;
  description: String;
  arguments?: string[];
  prefilledArguments?: string[];
  schema?: ((props: any[]) => {})[];
  routingTarget?: string;
  routingFill?: string;
}

export interface ContextMenuItem {
  commandTitle: string;
  title: string;
  description: string;
  icon?: React.ReactNode;
  creatorId?: string;
}

export type MenuItem = Command | ContextMenuItem;
