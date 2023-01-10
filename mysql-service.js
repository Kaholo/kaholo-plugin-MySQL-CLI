const path = require("path");
const { ConnectionString } = require("connection-string");

const { execWithArgs, assertExecutableIsInstalled } = require("./helpers");

async function executeQuery({ query, connectionDetails }, { mysqlExecutablesPath } = {}) {
  const args = [];
  args.push(...buildMySqlShellArguments({
    connectionDetails,
    includeDatabase: true,
  }));
  args.push("-e", query);

  return runMysqlExecutable({
    executableName: "mysql",
    args,
    alternativeExecutablesPath: mysqlExecutablesPath,
  });
}

async function dumpDatabase(params, { mysqlExecutablesPath }) {
  const {
    connectionDetails,
    includeData,
    databaseName,
  } = params;

  const args = [];
  args.push(...buildMySqlShellArguments({
    connectionDetails,
    includeDatabasePath: false,
  }));
  if (!includeData) {
    args.push("--no-data");
  }
  args.push(databaseName);

  return runMysqlExecutable({
    executableName: "mysqldump",
    args,
    alternativeExecutablesPath: mysqlExecutablesPath,
  });
}

async function copyDatabase({ source, destination, includeData }, { mysqlExecutablesPath }) {
  const dumpData = await dumpDatabase({
    ...source,
    includeData,
  }, { mysqlExecutablesPath });

  const destinationShellArgs = [];
  destinationShellArgs.push(...buildMySqlShellArguments({
    connectionDetails: destination.connectionDetails,
    includeDatabase: false,
  }));

  const createDatabaseArgs = [...destinationShellArgs, "create", destination.databaseName];
  await runMysqlExecutable({
    executableName: "mysqladmin",
    args: createDatabaseArgs,
    alternativeExecutablesPath: mysqlExecutablesPath,
  });

  const importDumpArgs = [...destinationShellArgs, destination.databaseName, "-e", dumpData];
  await runMysqlExecutable({
    executableName: "mysql",
    args: importDumpArgs,
    alternativeExecutablesPath: mysqlExecutablesPath,
  });
}

function createConnectionDetails({ connectionString, password }) {
  const connectionDetails = new ConnectionString(connectionString);

  if (password) {
    connectionDetails.password = password;
  }

  return connectionDetails;
}

function buildMySqlShellArguments(payload) {
  const {
    connectionDetails,
    includeDatabase = false,
  } = payload;

  const args = [];

  if (connectionDetails.user) {
    args.push("-u", connectionDetails.user);
  }
  if (connectionDetails.password) {
    args.push(`--password=${connectionDetails.password}`);
  }
  if (connectionDetails.hostname) {
    args.push("-h", connectionDetails.hostname);
  }
  if (connectionDetails.port) {
    args.push("-P", connectionDetails.port);
  }
  if (includeDatabase && connectionDetails.path) {
    args.push("-D", connectionDetails.path.join("/"));
  }

  return args;
}

async function runMysqlExecutable({ executableName, args, alternativeExecutablesPath }) {
  // if alternativeExecutablesPath is undefined then
  // the executable will be the same as executableName
  const executable = path.join(alternativeExecutablesPath || "", executableName);
  await assertExecutableIsInstalled(executable);
  return execWithArgs(executable, args);
}

module.exports = {
  executeQuery,
  copyDatabase,
  createConnectionDetails,
  dumpDatabase,
};
