const childProcess = require("child_process");
const fs = require("fs");
const { access } = require("fs/promises");
const path = require("path");
const util = require("util");
const { promisify } = require("util");
const exec = promisify(childProcess.exec);
const constants = require("./consts.json");

async function execWithArgs(params) {
  const {
    executable,
    args,
    onProgressFn,
  } = params;

  const childProcessInstance = childProcess.execFile(executable, args);

  const outputChunks = [];
  let errors = 0;

  childProcessInstance.stdout.on("data", (data) => {
    outputChunks.push({ type: "stdout", data });
    onProgressFn?.(data);
  });
  childProcessInstance.stderr.on("data", (data) => {
    outputChunks.push({ type: "stderr", data });
    onProgressFn?.(data);
  });
  childProcessInstance.on("error", (error) => {
    errors += 1;
    onProgressFn?.(`WHOOPS: ${JSON.stringify(error)}`);
  });

  await util.promisify(childProcessInstance.on.bind(childProcessInstance))("close");

  const outputObject = outputChunks.reduce((acc, cur) => ({
    ...acc,
    [cur.type]: `${acc[cur.type]}${cur.data.toString()}`,
  }), { stdout: "", stderr: "" });

  if (errors > 0) {
    return constants.EMPTY_RETURN_VALUE
  }
  return outputObject;
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
