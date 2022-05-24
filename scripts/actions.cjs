const {join, relative} = require("path");

const {
  copyFile: _copyFile,
  mkdir: _mkdir,
  readFile: _readFile,
  readdir: _readdir,
  rename: _rename,
  rm: _rm,
  writeFile: _writeFile,
} = require("fs/promises");

const root = join(__dirname, "..");
const dist = join(root, "dist");
function rRoot(path) {
  return relative(root, path);
}

/** @type {import("node:fs/promises")['writeFile']} */
const writeFile = async function writeFile(path, data) {
  console.log(`[fs] Writing to ${rRoot(path)}`);
  return await _writeFile(path, data);
};

/** @type {import("node:fs/promises")['readFile']} */
const readFile = async function readFile(path) {
  console.log(`[fs] Reading ${rRoot(path)}`);
  return await _readFile(path);
};

/** @type {import("node:fs/promises")['rm']} */
const rm = async function rm(path, options) {
  console.log(`$ rm -rf ${rRoot(path)}`);
  return await _rm(path, options);
};

/** @type {import("node:fs/promises")['mkdir']} */
const mkdir = async function mkdir(path, ...rest) {
  console.log(`$ mkdir ${rRoot(path)}`);
  return await _mkdir(path, ...rest);
};

/** @type {import("node:fs/promises")['readdir']} */
const readdir = async function readdir(path, ...rest) {
  console.log(`[fs] Reading ${rRoot(path)}/`);
  return await _readdir(path, ...rest);
};

/** @type {import("node:fs/promises")['rename']} */
const rename = async function rename(src, dest) {
  console.log(`$ mv ${rRoot(src)} ${rRoot(dest)}`);
  return await _rename(src, dest);
};

/**@type {import("node:fs/promises")['copyFile']} */
const copyFile = async function copyFile(src, dest, ...rest) {
  console.log(`$ cp ${rRoot(src)} ${rRoot(dest)}`);
  return await _copyFile(src, dest);
};
module.exports = {
  writeFile,
  dist,
  readFile,
  rm,
  mkdir,
  readdir,
  rename,
  rRoot,
  root,
  copyFile,
};
