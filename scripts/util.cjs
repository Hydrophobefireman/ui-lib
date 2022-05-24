const {join} = require("path");
const {rRoot, readFile, rm, root} = require("./actions.cjs");

const packageJsonLoc = join(root, "package.json");
const packageDir = join(root, "packages");

/**@returns {Promise<typeof import("../package.json")>} */
async function fromPackageJson() {
  const js = await readFile(packageJsonLoc);
  return JSON.parse(js.toString());
}

async function postpublish() {
  const {libPackages} = await fromPackageJson();
  await rm(join(root, "dist"), {force: true, recursive: true});
  return await Promise.all(
    libPackages.map(async (x) => {
      const loc = join(root, x);
      try {
        await rm(loc, {force: true, recursive: true});
      } catch (e) {
        console.log("[prebuild] Skip clean", rRoot(loc));
      }
    })
  );
}

function prettyJSON(x) {
  return JSON.stringify(x, null, 3);
}

module.exports = {
  prettyJSON,
  root,
  rRoot,
  packageDir,
  postpublish,
  fromPackageJson,
  packageJsonLoc,
};
