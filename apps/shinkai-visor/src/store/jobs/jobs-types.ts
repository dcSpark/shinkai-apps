import { AsyncData } from "../helpers/async-data";

export type Job = {
  id: string;
};

export interface JobsState {
  create: AsyncData<{ job: Job }>,
}
