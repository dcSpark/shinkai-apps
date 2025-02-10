export enum QuestNames {
  InstalledApp = 'InstalledApp',
  CreateIdentity = 'CreateIdentity',
  DownloadFromStore = 'DownloadFromStore',
  ComeBack2Days = 'ComeBack2Days',
  ComeBack4Days = 'ComeBack4Days',
  ComeBack7Days = 'ComeBack7Days',
  CreateTool = 'CreateTool',
  SubmitAndGetApprovalForTool = 'SubmitAndGetApprovalForTool',
  SubmitAndGetApprovalFor2Tool = 'SubmitAndGetApprovalFor2Tool',
  SubmitAndGetApprovalFor3Tool = 'SubmitAndGetApprovalFor3Tool',
  FeaturedInRanking = 'FeaturedInRanking',
  WriteHonestReview = 'WriteHonestReview',
  Write5HonestReview = 'Write5HonestReview',
  Write10HonestReview = 'Write10HonestReview',
  UseRAG3Days = 'UseRAG3Days',
}

export type GetQuestsStatusResponse = {
  data: {
    node_name: string;
    proof: string;
    quests: {
      name: QuestNames;
      status: boolean;
    }[];
    signature: string;
  };
  message: string;
  status: string;
};

export type UpdateQuestsStatusResponse = {
  data: {
    node_name: string;
    proof: string;
  };
};
