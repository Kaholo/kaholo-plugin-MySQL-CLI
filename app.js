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

async function restoreDatabase(params, { settings }) {
  const {
    connectionString,
    password,
    dumpData,
    databaseName,
  } = params;

  const connectionDetails = mysqlService.createConnectionDetails({
    connectionString,
    password,
  });

  return mysqlService.restoreDatabase({
    connectionDetails,
    databaseName,
    dumpData: dumpData.fileContent,
  }, {
    mysqlExecutablesPath: settings.mysqlExecutablesPath,
  });
}

module.exports = kaholoPluginLibrary.bootstrap({
  executeQuery,
  executeSqlFile,
  dumpDatabase,
  restoreDatabase,
});
