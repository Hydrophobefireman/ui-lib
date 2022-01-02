const { copyFileSync } = require("fs");
const { join } = require("path");
const base = join(__dirname, "..");

const source = join(base, "dist", "ui-lib.modern.js");
const target = join(base, "docs", "ui", "index.js");

console.log(`$ cp ${source} ${target}`);
copyFileSync(source, target);
