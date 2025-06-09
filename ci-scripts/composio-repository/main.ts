import { type AppDetails, ComposioApi } from './composio-api.ts';

const cache_folder = '.with-cache';
export const withCache = async <T>(
  rawCacheKey: string,
  fn: () => Promise<T>,
): Promise<T> => {
  const cacheKey = rawCacheKey.replace(/[^a-zA-Z0-9]/g, '-');
  try {
    await Deno.mkdir(cache_folder, { recursive: true });
  } catch (error) {
    if (!(error instanceof Deno.errors.AlreadyExists)) {
      throw error;
    }
  }

  const cacheFilePath = `${cache_folder}/${cacheKey}.json`;

  let fileStat;
  try {
    fileStat = await Deno.stat(cacheFilePath);
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      fileStat = null;
      console.log(`[withCache] Cache miss for key: ${cacheKey}`);
    } else {
      console.error(
        `[withCache] Error checking cache for key: ${cacheKey}`,
        error,
      );
      throw error;
    }
  }

  if (fileStat?.isFile) {
    console.log(`[withCache] Cache hit for key: ${cacheKey}`);
    const cache = await Deno.readTextFile(cacheFilePath);
    return JSON.parse(cache);
  }

  const result = await fn();
  await Deno.writeTextFile(cacheFilePath, JSON.stringify(result, null, 2));
  console.log(`[withCache] Cached result for key: ${cacheKey}`);
  return result;
};

const composioApi = new ComposioApi();
const composioApps = await withCache('composio-apps', () =>
  composioApi.getApps(),
);

const appsDetails: AppDetails[] = [];
for (const app of composioApps) {
  const appDetails = await withCache(`composio-app-${app.id}`, () =>
    composioApi.getApp(app.id),
  );
  appsDetails.push(appDetails);
}

const composioRegistry = {
  apps: composioApps,
  appDetails: Object.fromEntries(appsDetails.map((app) => [app.key, app])),
};

const registryJson = JSON.stringify(composioRegistry, null, 2);
await Deno.writeTextFile(
  'apps/shinkai-desktop/src/lib/composio/composio-registry.json',
  registryJson,
);
