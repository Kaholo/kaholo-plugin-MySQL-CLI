const path = require("path");
const fs = require("fs/promises");
const kaholoPluginLibrary = require("@kaholo/plugin-library");

const mysqlService = require("./mysql-service");
const { assertPath } = require("./helpers");

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

async function executeSqlFile(params, { settings }) {
  const {
    sqlFilePath = "",
    connectionString,
    password,
  } = params;

  const absoluteSqlFilePath = path.resolve(sqlFilePath);
  await assertPath(absoluteSqlFilePath);
  const connectionDetails = mysqlService.createConnectionDetails({
    connectionString,
    password,
  });
  const query = await fs.readFile(sqlFilePath, { encoding: "utf-8" });

  return mysqlService.executeQuery({
    query,
    connectionDetails,
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
  } = params;
  const connectionDetails = mysqlService.createConnectionDetails({
    connectionString,
    password,
  });

  const dumpData = await mysqlService.dumpDatabase({
    connectionDetails,
    includeData,
    databaseName,
  }, {
    mysqlExecutablesPath: settings.mysqlExecutablesPath,
  });

  const absoluteDumpPath = path.resolve(dumpPath);
  await fs.writeFile(absoluteDumpPath, dumpData);
  console.info(`File ${absoluteDumpPath} saved!`);

  return dumpData;
}

async function copyDatabase(params, { settings }) {
  const {
    connectionString,
    password,
    destinationConnectionString,
    destinationPassword,
    newDatabaseName,
    sourceDatabaseName,
    includeData,
  } = params;

  const sourceConnectionDetails = mysqlService.createConnectionDetails({
    connectionString,
    password,
  });
  const destinationConnectionDetails = mysqlService.createConnectionDetails({
    connectionString: destinationConnectionString || connectionString,
    password: destinationPassword || password,
  });

  return mysqlService.copyDatabase({
    source: {
      connectionDetails: sourceConnectionDetails,
      databaseName: sourceDatabaseName,
    },
    destination: {
      connectionDetails: destinationConnectionDetails,
      databaseName: newDatabaseName,
    },
    includeData,
  }, {
    mysqlExecutablesPath: settings.mysqlExecutablesPath,
  });
}

module.exports = kaholoPluginLibrary.bootstrap({
  executeQuery,
  executeSqlFile,
  dumpDatabase,
  copyDatabase,
});
