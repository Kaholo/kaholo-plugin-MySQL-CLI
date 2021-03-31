const { execCmd } = require("./helpers");
const fs = require("fs");

async function executeQuery(action, settings) {
    const conStr = (action.params.CONNECTION_STRING || settings.connectionString || "").replace(`"`,`'`);
    if (!conStr) {
        throw "No Connection String provided";
    }
    if (!action.params.QUERY) {
        throw "No Query Provided";
    }
    let [command, ...args] = conStr.split(" ");
    args.push("-e", action.params.QUERY);
    return execCmd(command, args, "Run Query");
}

async function executeSQLFile(action, settings) {
    const query = fs.readFileSync(action.params.PATH, 'utf8');
    action.params["QUERY"] = query;
    return executeQuery(action, settings);
}

async function dumpDataBase(action){
    if (!action.params.DB_NAME || !action.params.PATH){
        throw "Not given one of required parameters";
    }
    let args = [];
    if (action.params.HOST) args.push("-h", action.params.HOST);
    if (action.params.PORT) args.push("-P", action.params.PORT);
    if (action.params.USERNAME) args.push("-u", action.params.USERNAME);
    if (action.params.PASSWORD) args.push(`-p${action.params.PASSWORD}`);
    if (!action.params.DATA) args.push("-d");
    args.push(action.params.DB_NAME);
    const dumpData = await execCmd("mysqldump", args, "Dump Database");
    fs.writeFileSync(action.params.PATH, dumpData);
    return dumpData;
}

async function copyDataBase(action){
    const params = action.params; // for readabilty
    if (!params.DB_NAME || !params.DB_NAME_COPY){
        throw "Not provided source or copy database name";
    }
    // parse all params
    let srcArgs = [];
    let destArgs = [];
    // parse source db related args
    if (params.SOURCE_HOST) srcArgs.push("-h", params.SOURCE_HOST);
    if (params.SOURCE_PORT) srcArgs.push("-P", params.SOURCE_PORT);
    if (params.SOURCE_USERNAME) srcArgs.push("-u", params.SOURCE_USERNAME);
    if (params.SOURCE_PASSWORD) srcArgs.push(`-p${params.SOURCE_PASSWORD}`);
    if (!params.DATA) srcArgs.push("-d");
    srcArgs.push(params.DB_NAME);
    // parse new db related args
    if (params.DEST_HOST || params.SOURCE_HOST) 
        destArgs.push("-h", params.DEST_HOST || params.SOURCE_HOST);
    if (params.DEST_PORT || params.SOURCE_PORT)
        destArgs.push("-P", params.DEST_PORT || params.SOURCE_PORT);
    if (params.DEST_USERNAME || params.SOURCE_USERNAME)
        destArgs.push("-u", params.DEST_USERNAME || params.SOURCE_USERNAME);
    if (params.DEST_PASSWORD || params.SOURCE_PASSWORD)
        destArgs.push(`-p${params.DEST_PASSWORD || params.SOURCE_PASSWORD}`);
    
    // create dump data
    const dumpData = await execCmd("mysqldump", srcArgs, "Dump Database Tables And Data");
    // create new database
    const createArgs = destArgs.concat(["create", params.DB_NAME_COPY]);
    await execCmd("mysqladmin", createArgs, "Create Database For Copy");
    // copy source database 
    const dumpArgs = destArgs.concat([params.DB_NAME_COPY, "-e", dumpData]);
    return execCmd("mysql", dumpArgs, "Copy Source Database From Dump");
}

module.exports = {
    executeQuery,
    executeSQLFile,
    dumpDataBase,
    copyDataBase
};
