# Kaholo MySQL CLI Plugin
This plugin extends Kaholo's capabilities to include running SQL queries and scripts and copying or dumping databases in MySQL. It does so by executing `mysql` commands directly on the Kaholo agent. The [Kaholo MySQL Plugin](https://github.com/Kaholo/kaholo-plugin-MySQL/tags) (not CLI) in contrast interacts with MySQL by means of the [mysql npm package](https://www.npmjs.com/package/mysql).

With this plugin one may choose which version of the MySQL client to install on the Kaholo agent. If none is installed, the plugin will attempt to install one using the command `apk add mysql-client`. The non-CLI version of the plugin should work even if no MySQL client has been installed.

Choosing which of the two plugins to use also depends on the use case, for they have methods that are mutually exclusive and also some that are redundant. They may also be at different levels of development maturity. If you would like to see either of the plugins refined please do not hesitate to [contact us](https://kaholo.io/contact/).

Another alternative to any CLI plugin is one can run any arbitrary command (including `mysql` ones) on the Kaholo Agent using the [Command Line Plugin](https://github.com/Kaholo/kaholo-plugin-cmd/releases/tag/v3.2.0). This may provide an immediate and/or temporary solution if the action required is not covered by the plugin's methods.

## Forks of MySQL
When MySQL came under control of Oracle various open-source forks were created, the most common being MariaDB. This plugin will likely work for any of these variants of MySQL.

## Plugin Settings
Settings and Accounts are configured by clicking on Settings | Plugins and then the name of the plugin, `MySQL CLI`, in the list of plugins is a hyperlink to Settings and Accounts for this plugin. An Account is required to use the plugin. The setting is optional.

Plugin Settings normally serve as default values for Action parameters, but in the case of this plugin there is only one setting that is a global parameter for all actions that use this plugin. It is "MySQL Executable Path". By default the command is issued staring with just `mysql`, but if for example a custom mysql client has been installed in `/opt/mysql/mysqlv14/bin/`, putting this as the MySQL Executable Path in the settings will cause the plugin to use that one instead of whichever is found according to the $PATH, typically /`usr/bin/mysql`. Once this setting is configured, every action in every pipeline that uses this plugin will be concurrently altered to use this alternative executable. It is recommended to leave this setting empty unless certain an alternative `mysql` executable is required.

## Plugin Account
The MySQL CLI Plugin uses Kaholo Accounts to manage the connection string and password. This is for convenience and security. Once a default account is configured all new MySQL actions will automatically inherit it, so the same authentication details are pre-configured every time. If multiple accounts are configured, at the Action level which account to use is selected from a drop-down list.

The password is optionally stored in the Kaholo Vault so it does not appear in configuration, logs, or the user interface when used. It may also be included as part of the connection string. If both are used, the vaulted password will be used instead of the one in the connection string.

A typical connection string for MySQL looks something like this:

    Server=10.11.22.33;Port=3306;Database=mydb;Uid=myuser;Pwd=mypasswd;SslMode=Preferred;

The plugin is using a more universal [connection string format](https://www.npmjs.com/package/connection-string). The above connection string would be rewritten as:

    mysql://myuser:mypasswd@10.11.22.33:3306/mydb?SslMode=Preferred

The "mysql" protocol and SslMode elements are not implemented by the plugin, the connection string can be shortened:

    myuser:mypasswd@10.11.22.33:3306/mydb

If the password is in the Kaholo Vault instead of the connection string, the connection string can be shorter still:

    myuser@10.11.22.33:3306/mydb

Finally, the connection string can omit the database. When doing this the queries themselves are responsible to `USE <DATABASE_NAME>` when appropriate. For example to `SHOW TABLES;` of mydb with this connection string:

    myuser@10.11.22.33:3306

One must include `USE mydb;` in the query:

    USE mydb; SHOW TABLES;

## Getting JSON Output
The output of any query as seen in Activity Log is accessible as plain text using the Kaholo code layer, e.g. `kaholo.actions.MySQLCLI7318d3.output`. However to use the result in downstream conditionals and Action parameters, it is much easier to work with if you can access the Final Result as well-formed JSON. For example, running method "List Databases" provides the list as a JSON array of strings that could then be used in the code layer, for example as a conditional regarding whether or not database "kaholowiki" has been found:

    function kaholowikiFound() {
      const dbArray = kaholo.actions.MySQLCLI1.result;
      return(dbArray.includes("kaholowiki"))
    }

The plugin will attempt to parse any result for JSON. If the entire result of the query or all but the first line of the result parse as JSON then the plugin will succeed in returning it to Final Result as an object. To get query results formed as JSON, make use of MySQL functions `JSON_OBJECT` and `JSON_ARRAYAGG`.

For example if query `SELECT * FROM animals;` returns this data:

    idanimals name_common family lifespan carnivorous
    2551 Grasshopper insect 0.8 0
    22166 Shark fish 94.3 1
    23525 Lion mammals 58 1
    72452 Iguana reptile 27 0

Then query `SELECT JSON_ARRAYAGG(JSON_OBJECT('idanimals', idanimals, 'name_common', name_common, 'family',family,'lifespan',lifespan,'carnivorous',carnivorous)) from animals;` returns the same data as JSON:

    [
      {
        "family": "insect",
        "lifespan": 0.800000011920929,
        "idanimals": 2551,
        "carnivorous": 0,
        "name_common": "Grasshopper"
      },
      {
        "family": "fish",
        "lifespan": 94.30000305175781,
        "idanimals": 22166,
        "carnivorous": 1,
        "name_common": "Shark"
      },
      {
        "family": "mammals",
        "lifespan": 58,
        "idanimals": 23525,
        "carnivorous": 1,
        "name_common": "Lion"
      },
      {
        "family": "reptile",
        "lifespan": 27,
        "idanimals": 72452,
        "carnivorous": 0,
        "name_common": "Iguana"
      }
    ]

## Method: Execute Query
This method executes a query that is defined as text in the Action's parameters.

### Parameter: Query
The SQL query to execute. For example, `show databases;`

## Method: Execute SQL File
This method executes a SQL script from a file on the Kaholo agent. The file must first be written to the Kaholo agent. This is commonly done by means of a Git clone from a repository, or a file written by the Text Editor plugin.

### Parameter: SQL File Path
This is the path on the Kaholo Agent to the script file to execute. It may be relative or absolute. If relative, it is relative to the default working directory of the agent, e.g. `/twiddlebug/workspace`. Use the [Command Line Plugin](https://github.com/Kaholo/kaholo-plugin-cmd/releases/tag/v3.2.0) to run command `pwd` to identify the working directory of any Kaholo agent.

## Method: Dump Database
This method dumps Database Tables and if specified also data into a file.

### Parameter: Database
The name of the database to dump.

### Parameter: Dump File Path
The path on the Kaholo agent of the dump file to create. Both relative and absolute paths are accepted.

### Parameter: Include Data
If selected, data will be dumped as well as the schema of the database. By default data is included.

### Parameter: Overwrite Existing Files
If enabled, any file at the "Dump File Path" will be overwritten. Otherwise if the file already exists a `file already exists` error will occur.

## Method: Restore Database
Restores a database to a MySQL server using a dump file of the type created in method Dump Database.

### Parameter: Database Name
The name of the database to which the dump should be restored. If the database does not exist, it will be created.

### Parameter: Dump File Path
The path on the Kaholo agent of the dump file to restore. Both relative and absolute paths are accepted.

### Parameter: Drop Existing Database
If enabled and the database specified in "Database Name" exists, the existing database will be dropped and a new database of the same name created. Otherwise, a `database exists` error will occur.

## Method: Run MySQL CLI Command
This method runs any command using the mysql client.

### Parameter: Command
The command to run. Only commands beginning with `mysql` can be run. To run any other command, use the Command Line plugin instead.

### Parameter: Environment Variables
Key=value pairs entered here will be passed into the environment where the command is run. For example if environment variables include DATABASE=mydb, a command might include `-p $DATABASE`. This would cause the command to use the `mydb` database.

### Parameter: Working Directory
This is the directory were the command will be run, for example to find the appropriate input files or locate output files after a command completes. In many use cases it may be left unconfigured.

## Method: List Databases
This method lists all databases. Apart from this it is a good test method to ensure the connection string is correctly configured. It returns the same list whether or not the connection string includes a specific database name.