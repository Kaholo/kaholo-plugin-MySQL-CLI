const mysqlService = require("./mysql-service");

async function listDatabasesAuto(query, params, { settings }) {
  const { connectionString, password } = params;
  const connectionDetails = mysqlService.createConnectionDetails({
    connectionString,
    password,
  });

  const databasesRawResult = await mysqlService.listDatabases({ connectionDetails }, {
    mysqlExecutablesPath: settings.mysqlExecutablesPath,
  });

  const mappedAutocompleteItems = databasesRawResult
    .trim()
    .split(/\s*\n\s*/)
    .filter((db) => Boolean(db) && db !== "Database") // remove column heading "Database" from array
    .map((db) => ({
      id: db,
      value: db,
    }));

  if (!query) {
    return mappedAutocompleteItems;
  }

  return filterAutocompleteItems(mappedAutocompleteItems, query);
}

function filterAutocompleteItems(items, query) {
  const lowerCaseQuery = query.toLowerCase();
  const filteredAutocompleteItems = items.filter(({ id, value }) => (
    id.toLowerCase().includes(lowerCaseQuery)
    || value.toLowerCase().includes(lowerCaseQuery)
  ));

  return filteredAutocompleteItems;
}

module.exports = {
  listDatabasesAuto,
};
