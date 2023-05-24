const path = require("path");
const kaholoPluginLibrary = require("@kaholo/plugin-library");

const mysqlService = require("./mysql-service");
const autocomplete = require("./autocomplete");

const { execCmd } = require("./helpers");

async function executeQuery(params, { settings }) {
  const { connectionString, password } = params;
  const connectionDetails = mysqlService.createConnectionDetails({
    connectionString,
    password,
  });

  return mysqlService.executeQuery({
    query: params.query,
    connectionDetails,
  }, {
    mysqlExecutablesPath: settings.mysqlExecutablesPath,
  });
}

async function listDatabases(params, { settings }) {
  const { connectionString, password } = params;
  const connectionDetails = mysqlService.createConnectionDetails({
    connectionString,
    password,
  });

  return mysqlService.listDatabases({ connectionDetails }, {
    mysqlExecutablesPath: settings.mysqlExecutablesPath,
  });
}

async function executeSqlFile(params, { settings }) {
  const {
    sqlFilePath,
    connectionString,
    password,
  } = params;

  const connectionDetails = mysqlService.createConnectionDetails({
    connectionString,
    password,
  });

  return mysqlService.executeQueryFile({
    connectionDetails,
    sqlFilePath: sqlFilePath.passed,
  }, {
    mysqlExecutablesPath: settings.mysqlExecutablesPath,
  });
}

async function dumpDatabase(params, { settings }) {
  const {
    connectionString,
    password,
    includeData,
    databaseName,
    dumpPath,
    overwrite,
  } = params;

  if (dumpPath.exists && !overwrite) {
    throw new Error(`A file already exists at ${dumpPath.passed} and Overwrite is set to ${overwrite}.`);
  }

  const dumpDir = await kaholoPluginLibrary.parsers.filePath(path.dirname(dumpPath.absolutePath));
  if (!dumpDir.exists) {
    throw new Error(`Dump path includes non-existing directory ${dumpDir.absolutePath}.`);
  }
  if (dumpDir.type !== "directory") {
    throw new Error(`Dump path includes ${dumpDir.absolutePath}, which is not a directory.`);
  }

  const connectionDetails = mysqlService.createConnectionDetails({
    connectionString,
    password,
  });

  return mysqlService.dumpDatabase({
    connectionDetails,
    includeData,
    databaseName,
    dumpPath: dumpPath.absolutePath,
  }, {
    mysqlExecutablesPath: settings.mysqlExecutablesPath,
  });
}

async function restoreDatabase(params, { settings }) {
  const {
    connectionString,
    password,
    dumpDataPath,
    databaseName,
    useExistingDatabase,
    dropExistingDatabase,
  } = params;

  const connectionDetails = mysqlService.createConnectionDetails({
    connectionString,
    password,
  });

  return mysqlService.restoreDatabase({
    connectionDetails,
    databaseName,
    dumpDataPath: dumpDataPath.passed,
    options: {
      useExistingDatabase,
      dropExistingDatabase,
    },
  }, {
    mysqlExecutablesPath: settings.mysqlExecutablesPath,
  });
}

async function runMySQLCLICommand(params) {
  const {
    environmentVariables,
    workingDirectory,
    command,
  } = params;

  const execOptions = {};
  if (environmentVariables) {
    execOptions.env = environmentVariables;
  }
  if (workingDirectory) {
    execOptions.cwd = workingDirectory.absolutePath;
  }

  const mysqlCliCommand = command.startsWith("mysql") ? command : `mysql ${command}`;
  return execCmd(mysqlCliCommand, execOptions);
}

module.exports = kaholoPluginLibrary.bootstrap({
  executeQuery,
  executeSqlFile,
  dumpDatabase,
  restoreDatabase,
  listDatabases,
  runMySQLCLICommand,
}, autocomplete);
