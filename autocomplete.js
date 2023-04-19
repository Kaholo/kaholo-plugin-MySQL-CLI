async function listDatabasesAuto(params, { settings }) {

    const databases = await listDatabases(params, { settings })
    const databasesArray = databases.split("\n").filter(element => element);
    // shift to remove column heading "Database" from array
    databasesArray.shift();

    const mappedAutocompleteItems = databasesArray.map((db) => ({
        id: db,
        value: db,
    }));

    return mappedAutocompleteItems;
}

module.exports = {
    listDatabasesAuto,
};