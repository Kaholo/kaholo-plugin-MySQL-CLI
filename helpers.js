const childProcess = require("child_process");
const { promisify } = require("util");
const { ConnectionString } = require("connection-string");

const execFile = promisify(childProcess.execFile);

async function execCmd(command, args, description, path) {
  const options = {};
  if (path) {
    options.cwd = path;
  }

  let stdout;
  let stderr;
  try {
    ({ stdout, stderr } = await execFile(command, args, options));
  } catch (error) {
    throw new Error(`${description} error: ${error}`);
  }

  if (stderr) {
    console.info(`${description} stderr: ${stderr}`);
  }
  return stdout;
}

function parseConnectionStringToShellArguments(connectionString, isDbRequired) {
  const args = [];
  const connectionStringObject = new ConnectionString(connectionString);
  if (Reflect.has(connectionStringObject, "user")) {
    args.push("-u", connectionStringObject.user);
  }
  if (Reflect.has(connectionStringObject, "password")) {
    args.push(`-p${connectionStringObject.password}`);
  }
  if (Reflect.has(connectionStringObject, "hostname")) {
    args.push("-h", connectionStringObject.hostname);
  }
  if (Reflect.has(connectionStringObject, "port")) {
    args.push("-P", connectionStringObject.port);
  }
  if (isDbRequired && Reflect.has(connectionStringObject, "path")) {
    args.push("-D", connectionStringObject.path.join("/"));
  }

  return args;
}

module.exports = {
  execCmd,
  parseConnectionStringToShellArguments,
};
