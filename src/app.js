const { execCmd, conStrToArgs } = require("./helpers");
const fs = require("fs");

async function executeQuery(action, settings) {
    const conStr = action.params.conStr || settings.conStr || "";
    if (!action.params.query) {
        throw "No Query Provided";
    }
    let args = conStrToArgs(conStr, true);
    args.push("-e", action.params.query);
    return execCmd("mysql", args, "Run Query");
}

async function executeSQLFile(action, settings) {
    const query = fs.readFileSync(action.params.path, 'utf8');
    action.params["query"] = query;
    return executeQuery(action, settings);
}

async function dumpDataBaseToFile(action, settings){
    if (!action.params.path){
        throw "Not given file path";
    }
    const dumpData = await dumpDataBase(action, settings);
    fs.writeFileSync(action.params.path, dumpData);
    return dumpData;
}

async function dumpDataBase(action, settings){
    if (!action.params.dbName){
        throw "Not given database name";
    }
    
    const conStr = action.params.conStr || settings.conStr || "";
    let args = conStrToArgs(conStr, false);
    if (!action.params.data) args.push("-d");
    args.push(action.params.dbName);
    
    return await execCmd("mysqldump", args, "Dump Database");
}

async function copyDataBase(action, settings){
    if (!action.params.dbNameCopy){
        throw "Not provided copy database name";
    }
    const destConStr = action.params.destConStr || action.params.conStr || settings.conStr || "";
    let destArgs = conStrToArgs(destConStr, false);

    // dump sorce database
    const dumpData = await dumpDataBase(action, settings);
    // create new database
    const createArgs = destArgs.concat(["create", action.params.dbNameCopy]);
    await execCmd("mysqladmin", createArgs, "Create Database For Copy");
    // copy source database 
    const dumpArgs = destArgs.concat([action.params.dbNameCopy, "-e", dumpData]);
    return execCmd("mysql", dumpArgs, "Copy Source Database From Dump");
}

module.exports = {
    executeQuery,
    executeSQLFile,
    dumpDataBase: dumpDataBaseToFile,
    copyDataBase
};
