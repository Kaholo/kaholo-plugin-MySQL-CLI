const child_process = require("child_process")

function executeQuery(action) {
    return new Promise((resolve, reject) => {
        let execString = `${action.params.CONNECTION_STRING} -e '${action.params.QUERY}'`;

        child_process.exec(execString, (error, stdout, stderr) => {
            if (error) {
                reject(`exec error: ${error}`);
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
                reject(`exec error: ${error}`);
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
        let dumpWithData =`mysqldump -h ${action.params.HOST} -P ${action.params.PORT} -u ${action.params.USERNAME} -p${action.params.PASSWORD} ${action.params.DB_NAME} > dump.sql` ;
        let dumpWithoutData =  `mysqldump -h ${action.params.HOST} -P ${action.params.PORT} -u ${action.params.USERNAME} -d -p${action.params.PASSWORD} ${action.params.DB_NAME} > dump.sql`;
        let create_dbcopy = ` && mysqladmin -h ${action.params.HOST} -P ${action.params.PORT} -u ${action.params.USERNAME} -p${action.params.PASSWORD} create ${action.params.DB_NAME}.copy`;
        let importDB = ` && mysql -h ${action.params.HOST} -P ${action.params.PORT} -u ${action.params.USERNAME} -p${action.params.PASSWORD} ${action.params.DB_NAME}.copy < dump.sql`;
        let cmd;
        if(action.params.DATA == 'true'){
            cmd = dumpWithData+create_dbcopy+importDB;
        }
        else{
            cmd = dumpWithoutData+create_dbcopy+importDB;
        }
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
