const {join} = require("path");
const {updatePackages} = require("./_update-peer-deps.cjs");
const {dist, rename, root} = require("./actions.cjs");
const {fromPackageJson} = require("./util.cjs");

const packages = join(dist, "packages");

async function movePackage(name) {
  const src = join(packages, name);
  const dest = join(root, name);
  await rename(src, dest);
}

async function main() {
  await updatePackages();
  const {libPackages} = await fromPackageJson();
  await Promise.all(libPackages.map((x) => movePackage(x)));
}

if (require.main === module) {
  main();
}
