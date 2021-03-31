# kaholo-plugin-MySQL-CLI
Kaholo Plugin for running scripts and queries through MySQL cli.

## Settings:
1. Connection String (string) **Optional** - The Default MySQL command and all argumants to run queries. *For Example:* mysql -h localhost -P 3306 -u root -p1234 example_db

## Method: Execute Query
Execute a SQL query on a MySQL server.

### Parameters:
1. Query (String) **Required** - The SQL query to execute.
2. Connection String (String) **Optional** - The MySQL command and all argumants to run this query with. *For Example:* mysql -h localhost -P 3306 -u root -p1234 example_db

* Connection String is required in case it was not provided in settings!

## Method: Execute SQL File
Execute a SQL script from a file on a MySQL server.

### Parameters:
1. SQL File Path (String) **Required** - The path of the script file to execute.
2. Connection String (String) **Optional** - The MySQL command and all argumants to run this query with. *For Example:* mysql -h localhost -P 3306 -u root -p1234 example_db

* Connection String is required in case it was not provided in settings!

## Method: Dump a Database
Dump Database Tables and if specified also data into a file.

### Parameters:
1. User Name (String) **Optional** - The username of the user to connect to the server with.
2. Password (Vault) **Optional** - The password of the user.
3. Host (String) **Optional** - The URL of the MySQL server.
4. Port (Int) **Optional** - The port the MySQL server listens on.
5. Database Name (String) **Required** - The name of the database to dump.
6. File Path (String) **Required** - The path of the result dump file.
7. Include Data (Boolean) **Optional** - Whether to also dump data to the file or not. Default is false. 

## Method: Copy a Database
Copy a database from a source MySQL server to a target MySQL server.

### Parameters:
1. Source Username (String) **Optional** - The username of the user to connect to the source server with.
2. Source Password (Vault) **Optional** - The password of the source user.
3. Source Host (String) **Optional** - The URL of the source MySQL server.
4. Source Port (Int) **Optional** - The port the source MySQL server listens on.
5. Target Username (String) **Optional** - The username of the user to connect to the target server with. If not specified and source username is specified, will use source username.
6. Target Password (Vault) **Optional** - The password of the target user. If not specified and source password is specified, will use source password.
7. Target Host (String) **Optional** - The URL of the target MySQL server. If not specified and source host is specified, will use source host.
8. Target Port (Int) **Optional** - The port the target MySQL server listens on. If not specified and source port is specified, will use source port.
9. Source Database Name (String) **Required** - The name of the database to copy.
10. New Database Name (String) **Required** - The name of the new database.
11. Copy With Data (Boolean) **Optional** - Whether to also copy the data inside the database or not. Default is false.



