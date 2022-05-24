const {updatePackages} = require("./_update-peer-deps.cjs");
const {mkdir, root, writeFile} = require("./actions.cjs");
const {fromPackageJson, prettyJSON} = require("./util.cjs");
const {join} = require("path");

const packageJsonTemplate = (name, version) => ({
  name,
  version,
  private: true,
  main: `src/index.js`,
  module: `src/index.js`,
  types: "src/index.d.ts",
  license: "MIT",
  scripts: {},
});

function indexTemplate(name) {
  return `export * from "./${name}.js";\nexport * from "./types.js";\n`;
}

const MODULE_TEMPLATE = "export {}\n";

const packageJson = join(root, "package.json");
const packageDir = join(root, "packages");

async function createPackage() {
  const packageName = process.argv.slice(2)[0];
  if (!packageName) throw new Error("Invalid package name");
  const packageJsonContent = await fromPackageJson();
  const {libPackages, version} = packageJsonContent;

  if (libPackages.includes(packageName))
    throw new Error(`Package: "${packageName}" already exists`);

  const dir = join(packageDir, packageName);
  await mkdir(dir);

  const file = join(dir, "package.json");
  await writeFile(file, prettyJSON(packageJsonTemplate(packageName, version)));

  const src = join(dir, "src");
  await mkdir(src);

  const index = join(src, "index.ts");
  await writeFile(index, indexTemplate(packageName));

  const moduleCode = join(src, `${packageName}.ts`);
  await writeFile(moduleCode, MODULE_TEMPLATE);

  const typesFile = join(src, "types.ts");
  await writeFile(typesFile, MODULE_TEMPLATE);

  packageJsonContent.libPackages.push(packageName);
  packageJsonContent.libPackages.sort();

  await writeFile(packageJson, prettyJSON(packageJsonContent));
  await updatePackages();
}

if (require.main === module) {
  createPackage();
}
