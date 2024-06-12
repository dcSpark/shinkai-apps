import { test } from '../fixtures/base';
import { agentTests } from './agents.spec';
import { connectMethodQuickStartTests } from './connect-method-quick-start.spec';
import { extenralCommunicationTests } from './external-communication.spec';
import { jobsTests } from './jobs.spec';
import { popupTests } from './popup.spec';
import { storageTests } from './storage.spec';
import { welcomeTests } from './welcome.spec';

test.describe.configure({ mode: 'serial' });
// eslint-disable-next-line no-empty-pattern
test.beforeEach(({}, testInfo) => {
  console.log(`Executing ${testInfo.title}`);
});
// eslint-disable-next-line playwright/valid-describe-callback
test.describe('popup', popupTests);
// eslint-disable-next-line playwright/valid-describe-callback
test.describe('welcome', welcomeTests);
// eslint-disable-next-line playwright/valid-describe-callback
test.describe('connect method quick start', connectMethodQuickStartTests);
// eslint-disable-next-line playwright/valid-describe-callback
test.describe('agents', agentTests);
// eslint-disable-next-line playwright/valid-describe-callback
test.describe('jobs', jobsTests);
// eslint-disable-next-line playwright/valid-describe-callback
test.describe('external communication', extenralCommunicationTests);
// eslint-disable-next-line playwright/valid-describe-callback
test.describe('storage', storageTests);
