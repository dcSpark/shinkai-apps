import { EncryptedShipCredentials } from './types';

export class Agrihan {
  constructor(public ships: EncryptedShipCredentials[]) {
    return this;
  }
}
