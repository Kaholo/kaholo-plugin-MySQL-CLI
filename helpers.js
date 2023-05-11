const childProcess = require("child_process");
const fs = require("fs");
const { access } = require("fs/promises");
const path = require("path");
const { promisify } = require("util");

const exec = promisify(childProcess.exec);

async function execWithArgs(command, args) {
  const { stdout, stderr } = await promisify(childProcess.execFile)(command, args);

  if (stderr) {
    console.error(stderr);
  }

  return stdout;
}

async function execCmd(command, execOptions = {}) {
  const { stdout, stderr } = await exec(command, execOptions);

  if (stderr) {
    console.error(stderr);
  }

  return stdout;
}

async function assertPath(filePath) {
  try {
    await access(filePath, fs.constants.F_OK);
  } catch {
    throw new Error(`Path ${filePath} does not exist on the agent`);
  }
}

async function assertExecutableIsInstalled(executableOrPath) {
  if (path.basename(executableOrPath) !== executableOrPath) {
    // executableOrPath contains path to the executable then
    return assertPath(executableOrPath);
  }

  try {
    await exec(`which ${executableOrPath}`);
  } catch {
    throw new Error(`Executable ${executableOrPath} is not installed`);
  }

  return true;
}

module.exports = {
  execWithArgs,
  execCmd,
  assertExecutableIsInstalled,
  assertPath,
};
