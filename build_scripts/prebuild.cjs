const {rmSync} = require("fs");
const {join} = require("path");

const fp = join(__dirname, "..", "dist");
console.log(`$ rm -rf ${fp}`);
rmSync(fp, {recursive: true, force: true});
