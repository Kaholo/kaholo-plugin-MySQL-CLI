const mysqlService = require("./mysql-service");

async function listDatabasesAuto(query, params, { settings }) {
  const { connectionString, password } = params;
  const connectionDetails = mysqlService.createConnectionDetails({
    connectionString,
    password,
  });
  console.error(`KOTCHI-ACSTRING: ${JSON.stringify(connectionString)}`)
  console.error(`KOTCHI-ACPASS: ${JSON.stringify(password)}`)
  console.error(`KOTCHI-ACDETAILS: ${JSON.stringify(connectionDetails)}`)
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
