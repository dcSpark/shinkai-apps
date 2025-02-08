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
  message: string;
  quests_status: {
    [key in QuestNames]: boolean;
  };
  status: string;
};
