import subprocess
import shutil
import os

# microbundle -f modern --target web --raw true -i src/index.js -o dist && mv ./dist/ui-lib.modern.js ./dist/ui-lib.m.js && cp ./dist/ui-lib.m.js ./docs/ui/index.js

OUTPUT_FILE_PATH_DEFAULT = "./dist/ui-lib.modern.js"
OUTPUT_FILE_SET = "./dist/ui-lib.m.js"
DOCS_FILE_PATH = "./docs/ui/index.js"
JSX_RUNTIME_FOLDER_OUTPUT = "./dist/jsx-runtime"
JSX_RUNTIME_SRC = "./src/jsx-runtime"


def run():
    subprocess.Popen(["npm", "run", "microbundle-start"]).wait()
    shutil.copyfile(OUTPUT_FILE_PATH_DEFAULT, DOCS_FILE_PATH)
    os.rename(OUTPUT_FILE_PATH_DEFAULT, OUTPUT_FILE_SET)
    if os.path.isdir(JSX_RUNTIME_FOLDER_OUTPUT):
        shutil.rmtree(JSX_RUNTIME_FOLDER_OUTPUT)
    shutil.copytree(JSX_RUNTIME_SRC, JSX_RUNTIME_FOLDER_OUTPUT)


if __name__ == "__main__":
    run()
