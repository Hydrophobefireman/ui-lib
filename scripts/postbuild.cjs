const {join} = require("path");
const {copyFile, dist, root} = require("./actions.cjs");
const {fromPackageJson} = require("./util.cjs");

const builtPackages = join(dist, "packages");
const srcPackages = join(root, "packages");

async function postbuild() {
  const {libPackages} = await fromPackageJson();
  return await Promise.all(
    libPackages.map(async (x) => {
      const sourceDir = join(srcPackages, x);
      const outDir = join(builtPackages, x);
      const packageJson = join(sourceDir, "package.json");
      return await copyFile(packageJson, join(outDir, "package.json"));
    })
  );
}

if (require.main === module) {
  postbuild();
}
