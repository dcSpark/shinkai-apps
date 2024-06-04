export const routes = {
  Welcome: '/welcome',
  Inboxes: '/inboxes',
  Inbox: '/inboxes/:inboxId',
  CreateInbox: '/inboxes/create-inbox',
  CreateJob: '/inboxes/create-job',
  CreateAITask: '/inboxes/create-ai-task',
  VectorFs: '/node-files',
  SearchNodeFiles: '/search-node-files',
  Subscriptions: '/subscriptions',
  PublicFolders: '/subscriptions/public',
  ConnectQuickStart: '/nodes/connect/method/quick-start',
  ConnectRestoreConnection: '/nodes/connect/method/restore-connection',
  ConnectQrCode: '/nodes/connect/method/qr-code',
  Agents: '/agents',
  AddAgent: '/agents/add',
  Settings: '/settings',
  ExportConnection: '/settings/export-connection',
  CreateRegistrationCode: '/settings/create-registration-code',
  PublicKeys: '/settings/public-keys',
} as const;

export const rootPages = [
  routes.Welcome,
  routes.Inboxes,
  routes.VectorFs,
  routes.Subscriptions,
  routes.PublicFolders,
  routes.SearchNodeFiles,
  routes.Agents,
  routes.Settings,
];

export const subPages = [
  routes.ConnectRestoreConnection,
  routes.ConnectQrCode,
  routes.CreateInbox,
  routes.CreateJob,
  routes.Agents,
  routes.AddAgent,
  routes.Inbox,
  routes.ExportConnection,
  routes.CreateRegistrationCode,
  routes.PublicKeys,
];
export const onboardingPages = [routes.ConnectQuickStart, routes.Welcome];
