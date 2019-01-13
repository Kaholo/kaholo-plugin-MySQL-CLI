const rimraf = require('rimraf')
const child_process = require("child_process")

function executeQuery(action) {
    return new Promise((resolve, reject) => {
        let execString = `${action.params.CONNECTION_STRING} -e "${action.params.QUERY}"`;

        child_process.exec(execString, (error, stdout, stderr) => {
            if (error) {
                return reject(`exec error: ${error}`);
            }
            if (stderr) {
                console.log(`stderr: ${stderr}`);
            }
            return resolve(stdout);
        });
    });
}

function executeSQLFile(action) {
    return new Promise((resolve, reject) => {
        let execString = `${action.params.CONNECTION_STRING} < ${action.params.PATH}`;
        child_process.exec(execString, (error, stdout, stderr) => {
            if (error) {
               return reject(`exec error: ${error}`);
            }
            if (stderr) {
                console.log(`stderr: ${stderr}`);
            }
            return resolve(stdout);
        });
    });
}




function dumpDataBase(action){
    return new Promise((resolve,reject) => {
        let execString = `mysqldump -h ${action.params.HOST} -P ${action.params.PORT} -u ${action.params.USERNAME} -p${action.params.PASSWORD} ${action.params.DB_NAME} > ${action.params.PATH}`
        child_process.exec(execString, (error, stdout, stderr) => {
            if (error){
                reject(`exec error: ${error}`);
            }
            if (stderr) {
                console.log(`stderr: ${stderr}`);
            }
            return resolve(stdout);
        })
    })
}


function copyDataBase(action){
    return new Promise((resolve,reject) => {
        let dumpFile = `dump.${new Date().getTime()}.sql`
        let targetHost = action.params.DEST_HOST || action.params.SOURCE_HOST;
        let targetPort = action.params.DEST_PORT || action.params.SOURCE_PORT;
        let targetUser = action.params.DEST_USERNAME || action.params.SOURCE_USERNAME;
        let targetPassword = action.params.DEST_PASSWORD || action.params.SOURCE_PASSWORD;
        console.log(action.params.SOURCE_PASSWORD)
        let dump =  `mysqldump -h ${action.params.SOURCE_HOST} -P ${action.params.SOURCE_PORT} -u ${action.params.SOURCE_USERNAME} ${action.params.DATA ? '' : '-d'} -p${action.params.SOURCE_PASSWORD} ${action.params.DB_NAME} > ${dumpFile}`;
        let create_dbcopy = ` && mysqladmin -h ${targetHost} -P ${targetPort} -u ${targetUser} -p${targetPassword} create ${action.params.DB_NAME_COPY}`;
        let importDB = ` && mysql -h ${targetHost} -P ${targetPort} -u ${targetUser} -p${targetPassword} ${action.params.DB_NAME_COPY} < ${dumpFile}`;
        let cmd = dump+create_dbcopy+importDB
        child_process.exec(cmd, (error, stdout, stderr) => {
            rimraf(`dump.${new Date().getTime()}.sql`,(err ,res) => {
                if(err){
                    console.log(err)
                }
            })
            if (error) {
                reject(`exec error: ${error}`);
            }
            if (stderr) {
                console.log(`stderr: ${stderr}`);
            }
            return resolve(stdout);
        });
    })
}

module.exports = {
    executeQuery: executeQuery,
    executeSQLFile: executeSQLFile,
    dumpDataBase: dumpDataBase,
    copyDataBase : copyDataBase
};
