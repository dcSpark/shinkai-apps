import { test } from "../fixtures/base";
import { actionButtonTests } from "./action-button.spec";
import { agentTests } from "./agents.spec";
import { connectMethodQuickStartTests } from "./connect-method-quick-start.spec";
import { popupTests } from "./popup.spec";
import { welcomeTests } from "./welcome.spec";

test.describe.configure({ mode: 'serial' });

test.describe('action button', actionButtonTests);
test.describe('popup', popupTests);
test.describe('welcome', welcomeTests);
test.describe('connect method quick start', connectMethodQuickStartTests);
test.describe('agents', agentTests);
