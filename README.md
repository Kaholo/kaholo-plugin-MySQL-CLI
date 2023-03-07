# Kaholo MySQL CLI Plugin
This plugin extends Kaholo's capabilities to include running SQL queries and scripts and copying or dumping databases in MySQL. It does so by executing `mysql` commands directly on the Kaholo agent. The [Kaholo MySQL Plugin](https://github.com/Kaholo/kaholo-plugin-MySQL/tags) (not CLI) in contrast interacts with MySQL by means of the [mysql npm package](https://www.npmjs.com/package/mysql).

With this plugin you may choose which version of the MySQL client to install on the Kaholo agent. If none is installed, the plugin will attempt to install one for you using the command `apk add mysql-client`. The non-CLI version of the plugin should work even if no MySQL client has been installed.

Choosing which of the two plugins to use also depends on your use case, for they have methods that are mutually exclusive and also some that are redundant. They may alse be at different levels of development maturity. If you would like to see either of the plugins refined please do not hesitate to [contact us](https://kaholo.io/contact/).

Another alternative to any CLI plugin is you can run any arbitrary command (including `mysql` ones) on the Kaholo Agent using the [Command Line Plugin](https://github.com/Kaholo/kaholo-plugin-cmd/releases/tag/v3.2.0). This may provide an immediate and/or temporary solution if the action you require is not covered by the plugin's methods.

## Forks of MySQL
When MySQL came under control of Oracle various open-source forks were created, the most common being MariaDB. This plugin will likely work for any of these variants of MySQL.

## Plugin Settings
Settings and Accounts are configured by clicking on Settings | Plugins and then the name of the plugin, `MySQL CLI`, in the list of plugins is a hyperlink that will take you to Settings and Accounts for this plugin. An Account is required to use the plugin. The setting is optional.

Plugin Settings normally serve as default values for Action parameters, but in the case of this plugin there is only one setting that is a global parameter for all actions that use this plugin. It is "MySQL Executable Path". By default the command is issued staring with just `mysql`, but if for example a custom mysql client has been installed in `/opt/mysql/mysqlv14/bin/`, putting this as the MySQL Executable Path in the settings will cause the plugin to use that one instead of whichever is found according to the $PATH, typically /`usr/bin/mysql`. If you make this setting, every action in every pipeline that uses this plugin will be concurrently altered to use this alternative executable. Unless you are sure you need an alternative client, it is recommended to leave this setting empty.

## Plugin Account
The MySQL CLI Plugin uses Kaholo Accounts to manage the connection string and password. This is for convenience and security. Once a default account is configured all new MySQL actions will automatically inherit it, so you don't have to configure the same authentication details every time. You may also configure multiple accounts and at the Action level select which to use from a drop-down list.

The password is optionally stored in the Kaholo Vault so it does not appear in configuration, logs, or the user interface when used. It may also be included as part of the connection string. If both are used, the vaulted password will be used instead of the one in the connection string.

A typical connection string for MySQL looks something like this:

    Server=10.11.22.33;Port=3306;Database=mydb;Uid=myuser;Pwd=mypasswd;SslMode=Preferred;

The plugin is using a more universal [connection string format](https://www.npmjs.com/package/connection-string). The above connection string would be rewritten as:

    mysql://myuser:mypasswd@10.11.22.33:3306/mydb?SslMode=Preferred

The "mysql" protocol and SslMode elements are not implemented by the plugin, the connection string can be shortened:

    myuser:mypasswd@10.11.22.33:3306/mydb

If the password is in the Kaholo Vault instead of the connection string, the connection string can be shorter still:

    myuser@10.11.22.33:3306/mydb

## Method: Execute Query
This method executes a query that is defined as text in the Action's parameters.

### Parameter: Query
The SQL query to execute. For example, `show databases;`

## Method: Execute SQL File
This method executes a SQL script from a file on the Kaholo agent. The file must first be written to the Kaholo agent. This is commonly done by means of a Git clone from a repository, or a file written by the Text Editor plugin. There are many potential ways a SQL script could end up on the Kaholo agent as part of your pipeline.

### Parameter: SQL File Path
This is the path on the Kaholo Agent to the script file you wish to execute. It may be relative or absolute. If relative, it is relative to the default working directory of the agent, e.g. `/twiddlebug/workspace`. Use the [Command Line Plugin](https://github.com/Kaholo/kaholo-plugin-cmd/releases/tag/v3.2.0) to run command `pwd` if you wish to confirm the working directory of your agent.

## Method: Dump Database
This method dumps Database Tables and if specified also data into a file.

### Parameter: Database
The name of the database to dump.

### Parameter: File Path
The path on the Kaholo agent of the dump file to create.

### Parameter: Include Data
If selected, data will be dumped as well as the schema of the database. By default data is NOT included.

## Method: Restore Database
Restores a database to a MySQL server using a dump file of the type created in method Dump Database.

### Parameter: New Database Name
The name of the database to which the dump should be restored.



