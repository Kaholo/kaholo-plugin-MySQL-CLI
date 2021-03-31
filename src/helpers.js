const child_process = require("child_process");

async function execCmd(command, args, description){
    return new Promise((resolve, reject) => {
        child_process.execFile(command, args, (error, stdout, stderr) => {
            if (error) {
                return reject(`${description} error: ${error}`);
            }
            if (stderr) {
                console.log(`${description} stderr: ${stderr}`);
            }
            return resolve(stdout);
        });
    });
}

module.exports = {
    execCmd
};
