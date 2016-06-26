
var fs = require('fs');
var child_process = require('child_process');

exports.mixin = function(_){

    _.code.noent = function(e){ return(_.code(e, "ENOENT", "MODULE_NOT_FOUND")); };

    _.code.notdir = function(e){ return(_.code(e, "ENOTDIR")); };

    _.nextTick = process.nextTick;

    _.wget = function(url, destPath, callback){
        var wget = 'wget -O ' + destPath + ' ' + url;
        // excute wget using child_process' exec function

        child_process.exec(wget, function(err, stdout, stderr) {
            if (err){ callback(err); }
            else{ callback(null); }
        });
    };

    _.exec = function(command, args, callback){
        if(_.isFunction(args)){
            callback = args;
            args = null
        }

        if(!args){
            args = command.split(" ");
            command = args.shift();
        }

        var spawn = child_process.spawn;
        args.unshift(command);

        // use shell
        var cmd = spawn('sh', ["-c", args.join(" ")]);

        var stdout = "";
        var stderr = "";

        cmd.stdout.on('data', function (data) { stdout += data; });
        cmd.stderr.on('data', function (data) { stderr += data; });

        cmd.on('close', function (code) { if(callback){ callback(code, stdout, stderr); } });
    };
 
    _.shell = function(command, args, callback){
        if(_.isFunction(args)){
            callback = args;
            args = null
        }

        if(!args){
            args = command.split(" ");
            command = args.shift();
        }

        var spawn = child_process.spawn;
        args.unshift(command);

        // use shell
        var cmd = spawn('sh', ["-c", args.join(" ")], { stdio: 'inherit' });
        cmd.on('close', function(code){ if(callback){ callback(code); } });
    };

    _.exit = function(err){
        if(_.isNumber(err)){ return process.exit(err); }
        else if(!err){ return process.exit(0); }
        _.log.error(_.error.message(err));
        process.exit(1);
    };

}; 
