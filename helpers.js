const childProcess = require("child_process");
const { ConnectionString } = require("connection-string");

async function execCmd(command, args, description, path) {
  const opts = {};
  if (path) {
    opts.cwd = path;
  }
  return new Promise((resolve, reject) => {
    childProcess.execFile(command, args, opts, (error, stdout, stderr) => {
      if (error) {
        return reject(new Error(`${description} error: ${error}`));
      }
      if (stderr) {
        console.info(`${description} stderr: ${stderr}`);
      }
      return resolve(stdout);
    });
  });
}

function conStrToArgs(conStr, dbNeeded) {
  const args = [];
  const conObj = new ConnectionString(conStr);
  if (Reflect.has(conObj, "user")) {
    args.push("-u", conObj.user);
  }
  if (Reflect.has(conObj, "password")) {
    args.push(`-p${conObj.password}`);
  }
  if (Reflect.has(conObj, "hostname")) {
    args.push("-h", conObj.hostname);
  }
  if (Reflect.has(conObj, "port")) {
    args.push("-P", conObj.port);
  }
  if (dbNeeded && Reflect.has(conObj, "path")) {
    args.push("-D", conObj.path.join("/"));
  }

  return args;
}

module.exports = {
  execCmd,
  conStrToArgs,
};
