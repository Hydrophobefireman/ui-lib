const {join} = require("path");
const {readFile, writeFile} = require("./actions.cjs");
const {
  fromPackageJson,
  packageDir,
  packageJsonLoc,
  prettyJSON,
} = require("./util.cjs");

async function updatePackages() {
  const packageJson = await fromPackageJson();
  const {libPackages, version, peerDependencies, exports} = packageJson;

  await Promise.all(
    libPackages.map(async (x) => {
      const folder = join(packageDir, x);
      const subPackageJson = join(folder, "package.json");
      const js = JSON.parse((await readFile(subPackageJson)).toString());
      js.version = version;
      js.type = "module";
      js.peerDependencies = Object.assign({}, peerDependencies);
      await writeFile(subPackageJson, prettyJSON(js));
    }),
  );
  libPackages.forEach((packageName) => {
    exports[`./${packageName}`] = `./${packageName}/src/index.js`;
  });
  packageJson.libPackages = libPackages.sort();
  await writeFile(packageJsonLoc, prettyJSON(packageJson));
}
module.exports = {updatePackages};

if (require.main === module) {
  updatePackages();
}
