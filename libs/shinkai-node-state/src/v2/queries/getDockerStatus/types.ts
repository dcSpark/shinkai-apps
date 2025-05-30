import { type DockerStatusResponse } from '@shinkai_network/shinkai-message-ts/api/general/types';
import { type QueryObserverOptions } from '@tanstack/react-query';

import { type FunctionKeyV2 } from '../../constants';

export type GetDockerStatusInput = {
  nodeAddress: string;
};
export type UseGetDockerStatus = [
  FunctionKeyV2.GET_DOCKER_STATUS,
  GetDockerStatusInput,
];
export type GetDockerStatusOutput = DockerStatusResponse;

export type Options = QueryObserverOptions<
  GetDockerStatusOutput,
  Error,
  GetDockerStatusOutput,
  GetDockerStatusOutput,
  UseGetDockerStatus
>;
