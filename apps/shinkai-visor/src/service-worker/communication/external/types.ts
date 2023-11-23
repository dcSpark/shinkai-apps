export enum ServiceWorkerExternalMessageType {
  InstallToolkit = 'install-toolkit',
}

export type ServiceWorkerExternalMessage =
  {
    type: ServiceWorkerExternalMessageType.InstallToolkit;
    data: {
        toolkit: {
          toolkitName: string;
          version: string;
          cover: string;
        },
        url: string,
    },
  };
