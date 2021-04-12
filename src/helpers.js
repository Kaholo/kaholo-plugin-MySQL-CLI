const child_process = require("child_process");
const {ConnectionString} = require('connection-string');

async function execCmd(command, args, description, path){
    let opts = {};
    if (path) opts.cwd = path;
    return new Promise((resolve, reject) => {
        child_process.execFile(command, args, opts, (error, stdout, stderr) => {
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

function conStrToArgs(conStr, dbNeeded){
    let args = [];
    const conObj = new ConnectionString(conStr);
    if (conObj.hasOwnProperty("user"))              args.push("-u", conObj.user);
    if (conObj.hasOwnProperty("password"))          args.push(`-p${conObj.password}`);
    if (conObj.hostname)                            args.push("-h", conObj.hostname);   // conObj.hosts[0].name
    if (conObj.port)                                args.push("-P", conObj.port);       // conObj.hosts[0].port
    if (dbNeeded && conObj.hasOwnProperty("path"))  args.push("-D", conObj.path.join("/"));
    
    return args;
}

module.exports = {
    execCmd,
    conStrToArgs
};
