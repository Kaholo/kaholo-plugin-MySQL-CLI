# kaholo-plugin-MySQL-CLI
Kaholo Plugin for running scripts and queries through MySQL cli.

## Settings:
1. Connection String (string) **Optional** - The Default MySQL Server connection string to connect with.

## Method: Execute Query
Execute a SQL query on a MySQL server.

### Parameters:
1. Query (String) **Required** - The SQL query to execute.
2. Connection String (String) **Optional** - The MySQL Server connection string to connect with this time.

## Method: Execute SQL File
Execute a SQL script from a file on a MySQL server.

### Parameters:
1. SQL File Path (String) **Required** - The path of the script file to execute.
2. Connection String (String) **Optional** - The MySQL Server connection string to connect with this time.


## Method: Dump a Database
Dump Database Tables and if specified also data into a file.

### Parameters:
1. Database Name (String) **Required** - The name of the database to dump.
2. File Path (String) **Required** - The path of the result dump file.
3. Include Data (Boolean) **Optional** - Whether to also dump data to the file or not. Default is false. 
4. Connection String (String) **Optional** - The MySQL Server connection string to connect with this time.

## Method: Copy a Database
Copy a database from a source MySQL server to a target MySQL server.

### Parameters:
1. Source Database Name (String) **Required** - The name of the database to copy.
2. New Database Name (String) **Required** - The name of the new database.
3. Source Connection String (String) **Optional** - The MySQL Server connection string to connect with to the source database(to copy).
4. Destination Connection String (String) **Optional** - The MySQL Server connection string to connect with to the server you want to copy the database into.
5. Copy With Data (Boolean) **Optional** - Whether to also copy the data inside the database or not. Default is false.



