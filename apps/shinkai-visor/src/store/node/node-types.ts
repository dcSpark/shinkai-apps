export type NodeConnectionData = {
  nodeData: {
    registrationCode: string;
    permissionType: 'admin';
    identityType: 'device';
    profile: 'main';
    nodeAddress: string;
    shinkaiIdentity: string;
    nodeEncryptionPublicKey: string;
    nodeSignaturePublicKey: string;
  };
  userData: {
    registrationName: string;
  };
  credentials: {
    profileEncryptionPublicKey: string;
    profileSignaturePublicKey: string;
    myDeviceEncryptionPublicKey: string;
    myDeviceIdentityPublicKey: string;
    profileEncryptionSharedKey: string;
    profileSignatureSharedKey: string;
    myDeviceEncryptionSharedKey: string;
    myDeviceIdentitySharedKey: string;
  };
};

export interface NodeStore {
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | undefined;
  data: NodeConnectionData | undefined;
}
