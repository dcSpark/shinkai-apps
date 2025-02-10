export enum QuestNames {
  CreateIdentity = 'CreateIdentity',
  DownloadFromStore = 'DownloadFromStore',
  ComeBack7Days = 'ComeBack7Days',
  CreateTool = 'CreateTool',
  SubmitAndGetApprovalForTool = 'SubmitAndGetApprovalForTool',
  Top50Ranking = 'Top50Ranking',
  WriteFeedback = 'WriteFeedback',
  WriteHonestReview = 'WriteHonestReview',
  UseRAG3Days = 'UseRAG3Days',
  UseSpotlight3Days = 'UseSpotlight3Days',
  Install3PlusCommunityTools = 'Install3PlusCommunityTools',
  Write3PlusAppReviews = 'Write3PlusAppReviews',
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
