const {join} = require("path");
const {mkdir} = require("./actions.cjs");
const {postpublish, root} = require("./util.cjs");

async function main() {
  console.log(`Root: ${root}`);
  const core = join(root, "dist");
  await postpublish();
  await mkdir(core);
}

if (require.main === module) {
  main();
}
