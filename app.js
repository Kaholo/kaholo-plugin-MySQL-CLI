const fs = require("fs/promises");
const kaholoPluginLibrary = require("@kaholo/plugin-library");

const {
  execCmd,
  parseConnectionStringToShellArguments,
} = require("./helpers");

async function executeQuery(params, { settings }) {
  const {
    conStr,
    query,
  } = params;

  const args = parseConnectionStringToShellArguments(conStr, true);
  args.push("-e", query);
  return execCmd("mysql", args, "Run Query", settings.path);
}

async function executeSQLFile(params, { settings }) {
  const {
    path,
    conStr,
  } = params;

  const query = await fs.readFile(path, { encoding: "utf-8" });
  return executeQuery({ query, conStr }, { settings });
}

async function dumpDataBaseToFile(params, { settings }) {
  const { path } = params;

  const dumpData = await dumpDataBase(params, { settings });
  await fs.writeFile(path, dumpData);

  return dumpData;
}

async function dumpDataBase(params, { settings }) {
  const {
    conStr: connectionString,
    data,
    dbName,
  } = params;

  const args = parseConnectionStringToShellArguments(connectionString, false);
  if (!data) {
    args.push("-d");
  }
  args.push(dbName);

  return execCmd("mysqldump", args, "Dump Database", settings.path);
}

async function copyDataBase(params, { settings }) {
  const {
    dbNameCopy: copiedDbName,
    destConStr: destinationDbConnectionString,
    conStr: connectionString,
  } = params;

  const resolvedDestDbConStr = destinationDbConnectionString || connectionString || "";
  const destinationDbArgs = parseConnectionStringToShellArguments(resolvedDestDbConStr, false);

  // dump sorce database
  const dumpData = await dumpDataBase(params, { settings });
  // create new database
  const createDbArgs = destinationDbArgs.concat(["create", copiedDbName]);
  await execCmd("mysqladmin", createDbArgs, "Create Database For Copy", settings.path);
  // copy source database
  const dumpArgs = destinationDbArgs.concat([copiedDbName, "-e", dumpData]);

  return execCmd("mysql", dumpArgs, "Copy Source Database From Dump", settings.path);
}

module.exports = kaholoPluginLibrary.bootstrap({
  executeQuery,
  executeSQLFile,
  dumpDataBase: dumpDataBaseToFile,
  copyDataBase,
});
