// add package-specific dependencies
module.paths.unshift(`${process.cwd()}/node_modules`);

const fs = require("fs");
const path = require("path");
const ChromeExtension = require("crx");
const argv = require("minimist")(process.argv.slice(2));
/* eslint import/no-unresolved: 0 */

const name = require(path.join(process.cwd(), "/dist/manifest.json")).name;

function readKeyFromFile(keyPath) {
  if (!fs.existsSync(keyPath)) {
    throw new Error(`Key not found at ${keyPath}`);
  }
  return fs.readFileSync(keyPath);
}

function getPrivateKey() {
  if (argv.key == null) return null;
  if (argv.key.startsWith("./")) {
    return readKeyFromFile(argv.key);
  }
  return Buffer.from(argv.key, "utf-8");
}

const privateKey = getPrivateKey();
const zipOnly = argv["zip-only"];
const isCrx = !zipOnly;

if (!argv.codebase) {
  console.error("Missing codebase param.");
  process.exit();
}

const crx = new ChromeExtension({
  appId: argv["app-id"],
  codebase: argv.codebase,
  version: 3,
  privateKey,
});

async function compress(isCrxBuild) {
  await crx.load(path.join(process.cwd(), "/dist"));
  const archiveBuffer = await crx.loadContents();
  fs.writeFileSync(`${name}.zip`, archiveBuffer);

  if (isCrxBuild) {
    const crxBuffer = await crx.pack();
    fs.writeFileSync(`${name}-${argv.env}.crx`, crxBuffer);
  }
}

compress(isCrx).catch((err) => console.error(err));
