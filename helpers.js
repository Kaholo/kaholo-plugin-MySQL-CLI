const childProcess = require("child_process");
const fs = require("fs");
const { access } = require("fs/promises");
const path = require("path");
const util = require("util");
const { promisify } = require("util");
const exec = promisify(childProcess.exec);

async function execWithArgs(params) {

  const {
    executable,
    args,
    onProgressFn,
  } = params;

  let childProcessError;
  let childProcessInstance;
  try {
    childProcessInstance = childProcess.execFile(executable, args);
  } catch (error) {
    return { error };
  }

  const outputChunks = [];

  childProcessInstance.stdout.on("data", (data) => {
    outputChunks.push({ type: "stdout", data });
    onProgressFn?.(data);
  });
  childProcessInstance.stderr.on("data", (data) => {
    outputChunks.push({ type: "stderr", data });
    onProgressFn?.(data);
  });
  childProcessInstance.on("error", (error) => {
    childProcessError = error;
    onProgressFn?.(`ERROR: ${error.message}`);
  });

  await util.promisify(childProcessInstance.on.bind(childProcessInstance))("close");

  // const outputObject = outputChunks.reduce((acc, cur) => ({
  //   ...acc,
  //   [cur.type]: `${acc[cur.type]}${cur.data.toString()}`,
  // }), { stdout: "", stderr: "" });

  // if (childProcessError) {
  //   outputObject.error = childProcessError;
  // }

  // return outputObject;
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
