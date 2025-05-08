import { PlatformService } from './interfaces';
import { platformService as webPlatformService } from './web/platform-service';

const platformService: PlatformService = webPlatformService;

export { platformService };
export * from './interfaces';
