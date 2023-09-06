import { EncryptedShipCredentials } from './types';

export class Shinkai {
  constructor(public ships: EncryptedShipCredentials[]) {
    return this;
  }
}
