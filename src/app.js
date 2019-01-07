const child_process = require("child_process")

function executeQuery(action) {
    return new Promise((resolve, reject) => {
        let execString = `${action.params.CONNECTION_STRING} -e '${action.params.QUERY}'`;

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

module.exports = {
    executeQuery: executeQuery,
    executeSQLFile: executeSQLFile
};
