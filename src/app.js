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

const functions = {
    executeQuery: executeQuery,
    executeSQLFile: executeSQLFile
};

function main(argv) {
    if (argv.length < 3) {
        console.log('{err: "not enough parameters"}');
        // Invalid Argument
        // Either an unknown option was specified, or an option requiring a value was provided without a value.
        process.exit(9);
    }
    let action = JSON.parse(argv[2]);
    functions[action.method.name](action)
        .then(res => {
            console.log(res);
            process.exit(0); // Success
        }).catch(err => {
        console.log("an error occured", err);
        // Uncaught Fatal Exception
        // There was an uncaught exception, and it was not handled by a domain or an 'uncaughtException' event handler.
        process.exit(1); // Failure
    });
}

main(process.argv);
