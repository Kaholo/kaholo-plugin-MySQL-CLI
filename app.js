const fs = require("fs");
const { execCmd, conStrToArgs } = require("./helpers");

async function executeQuery(action, settings) {
  const conStr = action.params.conStr || settings.conStr || "";
  if (!action.params.query) {
    throw new Error("No Query Provided");
  }
  const args = conStrToArgs(conStr, true);
  args.push("-e", `"${action.params.query}"`);
  return execCmd("mysql", args, "Run Query", settings.path);
}

async function executeSQLFile(action, settings) {
  const query = fs.readFileSync(action.params.path, "utf8");
  action.params.query = query;
  return executeQuery(action, settings);
}

async function dumpDataBaseToFile(action, settings) {
  if (!action.params.path) {
    throw new Error("Not given file path");
  }
  const dumpData = await dumpDataBase(action, settings);
  fs.writeFileSync(action.params.path, dumpData);
  return dumpData;
}

async function dumpDataBase(action, settings) {
  if (!action.params.dbName) {
    throw new Error("Not given database name");
  }

  const conStr = action.params.conStr || settings.conStr || "";
  const args = conStrToArgs(conStr, false);
  if (!action.params.data) {
    args.push("-d");
  }
  args.push(action.params.dbName);

  return execCmd("mysqldump", args, "Dump Database", settings.path);
}

async function copyDataBase(action, settings) {
  if (!action.params.dbNameCopy) {
    throw new Error("Not provided copy database name");
  }
  const destConStr = action.params.destConStr || action.params.conStr || settings.conStr || "";
  const destArgs = conStrToArgs(destConStr, false);

  // dump sorce database
  const dumpData = await dumpDataBase(action, settings);
  // create new database
  const createArgs = destArgs.concat(["create", action.params.dbNameCopy]);
  await execCmd("mysqladmin", createArgs, "Create Database For Copy", settings.path);
  // copy source database
  const dumpArgs = destArgs.concat([action.params.dbNameCopy, "-e", dumpData]);
  return execCmd("mysql", dumpArgs, "Copy Source Database From Dump", settings.path);
}

module.exports = {
  executeQuery,
  executeSQLFile,
  dumpDataBase: dumpDataBaseToFile,
  copyDataBase,
};
