const path = require("path");
const { ConnectionString } = require("connection-string");
const { execWithArgs, execWithArgsSimple, assertExecutableIsInstalled } = require("./helpers");

async function executeQuery({ query, connectionDetails }, { mysqlExecutablesPath } = {}) {
  const args = buildMySqlShellArguments({
    connectionDetails,
    includeDatabase: true,
  }).concat("-e", query);

  return runMysqlExecutable({
    executableName: "mysql",
    args,
    alternativeExecutablesPath: mysqlExecutablesPath,
  });
}

async function executeQueryFile(params, { mysqlExecutablesPath }) {
  const {
    connectionDetails,
    sqlFilePath,
  } = params;

  const commonArgs = buildMySqlShellArguments({
    connectionDetails,
    includeDatabase: true,
  });

  const queryFileArgs = [...commonArgs, "-e", `source ${sqlFilePath};`];

  return runMysqlExecutable({
    executableName: "mysql",
    args: queryFileArgs,
    alternativeExecutablesPath: mysqlExecutablesPath,
  });
}

async function dumpDatabase(params, { mysqlExecutablesPath }) {
  const {
    connectionDetails,
    includeData,
    databaseName,
    dumpPath,
  } = params;

  const args = [];
  args.push(...buildMySqlShellArguments({
    connectionDetails,
    includeDatabase: false,
  }));
  if (!includeData) {
    args.push("--no-data");
  }
  args.push("-r", dumpPath);
  args.push(databaseName);

  console.info(`Dumping database ${databaseName} to file ${dumpPath}...`);

  await runMysqlExecutable({
    executableName: "mysqldump",
    args,
    alternativeExecutablesPath: mysqlExecutablesPath,
  });
}

async function restoreDatabase(params, { mysqlExecutablesPath }) {
  const {
    connectionDetails,
    dumpDataPath,
    databaseName,
    options = {},
  } = params;

  const commonArgs = buildMySqlShellArguments({
    connectionDetails,
    includeDatabase: false,
  });

  if (options.dropExistingDatabase) {
    const dropDatabaseArgs = [...commonArgs, "-e", `DROP DATABASE IF EXISTS \`${databaseName}\`;`];

    console.info(`Dropping database ${databaseName} (if it exists)...`);

    await runMysqlExecutable({
      executableName: "mysql",
      args: dropDatabaseArgs,
      alternativeExecutablesPath: mysqlExecutablesPath,
    });
  }

  const createDatabaseArgs = [...commonArgs, "create", databaseName];

  console.info(`Creating new database ${databaseName}...`);

  await runMysqlExecutable({
    executableName: "mysqladmin",
    args: createDatabaseArgs,
    alternativeExecutablesPath: mysqlExecutablesPath,
  });

  const importDumpArgs = [...commonArgs, "-e", `source ${dumpDataPath};`, databaseName];

  console.info(`Restoring dump file ${dumpDataPath} to database ${databaseName}...`);

  await runMysqlExecutable({
    executableName: "mysql",
    args: importDumpArgs,
    alternativeExecutablesPath: mysqlExecutablesPath,
  });
}

function listDatabases({ connectionDetails }, settings) {
  const executable = path.join(settings.mysqlExecutablesPath || "", "mysql");
  const args = buildMySqlShellArguments({
    connectionDetails,
    includeDatabase: false,
  }).concat("-e", "SHOW DATABASES;");

  return execWithArgsSimple(executable, args);
}

function listDatabasesJson({ connectionDetails }, settings) {
  return executeQuery({
    query: "USE information_schema; SELECT JSON_ARRAYAGG(schema_name) FROM schemata;",
    connectionDetails,
  }, settings);
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
  try {
    await assertExecutableIsInstalled(executable);
  } catch (error) {
    if (error.message !== `Executable ${executableName} was not found.`) {
      throw error;
    }

    try {
      await installMysqlCli();
    } catch (installError) {
      throw new Error(`${error.message}\nAttempted to install the mysql-client, but failed:\n${installError.message}`);
    }
  }

  return execWithArgs({
    executable,
    args,
    onProgressFn: process.stdout.write.bind(process.stdout),
  });
}

async function installMysqlCli() {
  await execWithArgsSimple("apk", ["add", "mysql-client"]);
  console.error("Installed mysql-client on Kaholo Agent");
}

module.exports = {
  createConnectionDetails,
  executeQuery,
  executeQueryFile,
  restoreDatabase,
  dumpDatabase,
  listDatabases,
  listDatabasesJson,
};
