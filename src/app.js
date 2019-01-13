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
        let dump =  `mysqldump -h ${action.params.SOURCE_HOST} -P ${action.params.SOURCE_PORT} -u ${action.params.USERNAME} ${action.params.DATA ? '' : '-d'} -p${action.params.PASSWORD} ${action.params.DB_NAME} > dump.${new Date().getTime()}.sql`;
        let create_dbcopy = ` && mysqladmin -h ${action.params.DEST_HOST || action.params.SOURCE_HOST} -P ${action.params.DEST_PORT || action.params.SOURCE_PORT} -u ${action.params.USERNAME} -p${action.params.PASSWORD} create ${action.params.DB_NAME_COPY}`;
        let importDB = ` && mysql -h ${action.params.DEST_HOST || action.params.SOURCE_HOST} -P ${action.params.DEST_PORT || action.params.SOURCE_PORT} -u ${action.params.USERNAME} -p${action.params.PASSWORD} ${action.params.DB_NAME_COPY} < dump.${new Date().getTime()}.sql`;
        let cmd = dump+create_dbcopy+importDB
        rimraf(`dump.${new Date().getTime()}.sql`,(err ,res) => {
            if(err){
                console.log(err)
            }
        })
        child_process.exec(cmd, (error, stdout, stderr) => {
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
