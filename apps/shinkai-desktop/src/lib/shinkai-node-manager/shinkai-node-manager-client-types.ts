export enum ShinkaiNodeManagerEvent {
  StartingShinkaiNode = 'StartingShinkaiNode',
  ShinkaiNodeStarted = 'ShinkaiNodeStarted',
  ShinkaiNodeStartError = 'ShinkaiNodeStartError',

  StartingOllama = 'StartingOllama',
  OllamaStarted = 'OllamaStarted',
  OllamaStartError = 'OllamaStartError',

  PullingModelStart = 'PullingModelStart',
  PullingModelProgress = 'PullingModelProgress',
  PullingModelDone = 'PullingModelDone',
  PullingModelError = 'PullingModelError',

  StoppingShinkaiNode = 'StoppingShinkaiNode',
  ShinkaiNodeStopped = 'ShinkaiNodeStopped',
  ShinkaiNodeStopError = 'ShinkaiNodeStopError',

  StoppingOllama = 'StoppingOllama',
  OllamaStopped = 'OllamaStopped',
  OllamaStopError = 'OllamaStopError',
}

export interface ShinkaiNodeStartErrorEvent {
  error: string;
}
export interface OllamaStartErrorEvent {
  error: string;
}

export interface PullingModelStartEvent {
  model: string;
}
export interface PullingModelProgressEvent {
  model: string;
  progress: number;
}
export interface PullingModelDoneEvent {
  model: string;
}
export interface PullingModelErrorEvent {
  model: string;
  error: string;
}

export interface ShinkaiNodeStopErrorEvent {
  error: string;
}
export interface OllamaStopErrorEvent {
  error: string;
}

export type ShinkaiNodeManagerEventMap =
  | { type: ShinkaiNodeManagerEvent.StartingShinkaiNode; payload: never }
  | { type: ShinkaiNodeManagerEvent.ShinkaiNodeStarted; payload: never }
  | {
      type: ShinkaiNodeManagerEvent.ShinkaiNodeStartError;
      payload: ShinkaiNodeStartErrorEvent;
    }
  | { type: ShinkaiNodeManagerEvent.StartingOllama; payload: never }
  | { type: ShinkaiNodeManagerEvent.OllamaStarted; payload: never }
  | {
      type: ShinkaiNodeManagerEvent.OllamaStartError;
      payload: OllamaStartErrorEvent;
    }
  | {
      type: ShinkaiNodeManagerEvent.PullingModelStart;
      payload: PullingModelStartEvent;
    }
  | {
      type: ShinkaiNodeManagerEvent.PullingModelProgress;
      payload: PullingModelProgressEvent;
    }
  | {
      type: ShinkaiNodeManagerEvent.PullingModelDone;
      payload: PullingModelDoneEvent;
    }
  | {
      type: ShinkaiNodeManagerEvent.PullingModelError;
      payload: PullingModelErrorEvent;
    }
  | { type: ShinkaiNodeManagerEvent.StoppingShinkaiNode; payload: never }
  | { type: ShinkaiNodeManagerEvent.ShinkaiNodeStopped; payload: never }
  | {
      type: ShinkaiNodeManagerEvent.ShinkaiNodeStopError;
      payload: ShinkaiNodeStopErrorEvent;
    }
  | { type: ShinkaiNodeManagerEvent.StoppingOllama; payload: never }
  | { type: ShinkaiNodeManagerEvent.OllamaStopped; payload: never }
  | {
      type: ShinkaiNodeManagerEvent.OllamaStopError;
      payload: OllamaStopErrorEvent;
    };

export type ShinkaiNodeOptions = {
  port?: number;
  unstructured_server_url?: string;
  embeddings_server_url?: string;
  first_device_needs_registration_code?: string;
  initial_agent_names?: string;
  initial_agent_urls?: string;
  initial_agent_models?: string;
  initial_agent_api_keys?: string;
  starting_num_qr_devices?: number;
};

export type LogEntry = {
  timestamp: number;
  process: string;
  message: string;
};
