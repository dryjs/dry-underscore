"use strict";

require('tamejs').register();

var fs = require('fs');
var child_process = require('child_process');

exports.mixin = function(_){

    _.code.noent = function(e){ return(_.code(e, "ENOENT", "MODULE_NOT_FOUND")); };

    _.code.notdir = function(e){ return(_.code(e, "ENOTDIR")); };

    _.stdout = function(){
        var entry = _.format.apply(null, arguments);
        process.stdout.write(entry);
        process.stdout.write("\n");
    };
    _.stderr = function(){
        var entry = _.format.apply(null, arguments);
        process.stderr.write(entry);
        process.stderr.write("\n");
    };
    _.p = _.stderr;

    _.stdout.write = function(){
        var entry = _.format.apply(null, arguments);
        process.stdout.write(entry);
    };

    _.stderr.write = function(){
        var entry = _.format.apply(null, arguments);
        process.stderr.write(entry);
    };
 

    _.getch = function(callback, keyOnReturn){

        var wasRaw = process.stdin.isRaw;

        var keypress = require('keypress');

        // make `process.stdin` begin emitting "keypress" events
        keypress(process.stdin);

        process.stdin.once('keypress', function (ch, key) {
            process.stdin.setRawMode(wasRaw);
            process.stdin.pause();

            if(keyOnReturn && key.name == 'return'){
                callback(keyOnReturn, key);
            }else{ callback(ch, key); }
        });

        process.stdin.setRawMode(true);
        process.stdin.resume();
    };

    _.keyprompt = function(prompt, callback, defaultChoice, writer){
        writer = writer || _.stderr;
        writer.write(prompt);
        _.getch(function(ch, key){
            writer.write(ch + "\n");
            callback(ch, key);
        }, defaultChoice);
    };

    _.nextTick = process.nextTick;
    _.test = require('assert');
    _.test.eq = function(){
        return(_.test.deepEqual.apply(null, arguments));
    };
    
    _.exit = function(err){
        if(_.isNumber(err)){ return process.exit(err); }
        else if(!err){ return process.exit(0); }

        var entry = "";

        function makeEntry(err){

            if(err.type === 'error' && err.message){ return(err.message); }
            
            var entry = "Unhandled Error:";

            if(err.path){ entry += " " + err.path; }

            entry += "\n";
            
            if(err.stack){ entry += err.stack; }
            else{ entry += err; }

            entry += makeTameTrace();

            return(entry);
        }

        function makeTameTrace(){
            var tame = require('tamejs').runtime;
            var entry = "";
            var tstack = tame.stackWalk();

            if(tstack.length){
                entry += "\n";
                entry += "Tame 'stack' trace:\n" + tstack.join("\n");
            }

            return(entry);
        }

        
        if(_.isArray(err)){
            var err_count = 0;
            err = _.flatten(err);
            _.each(err, function(e){
                if(!_.isObject(e)){ return; }
                err_count++;
                entry += "\n";
                entry += makeEntry(e);
                entry += "\n";
            });
            if(err_count === 0){
                entry += "There was an error array passed to _.exit, but it didn't contain any errors: " + _.format(err);
            }else{
                entry = err_count + " Errors encountered.\n" + entry;
            }
        }else{ 
            entry = makeEntry(err);
        }

        _.log.error(entry);

        process.exit(1);
    };

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

    _.dateHash = function(d){ 
        return({ 
            Type : 'Date',
            Year : d.getUTCFullYear(),
            Month : d.getUTCMonth(),
            Day : d.getUTCDate(),
            WeekDay : d.getUTCDay()
        });
    };
    _.dateTimeHash = function(d){
        return({ 
            Type : 'DateTime',
            Year : d.getUTCFullYear(),
            Month : d.getUTCMonth(),
            Day : d.getUTCDate(),
            WeekDay : d.getUTCDay(),
            Hour : d.getUTCHours(),
            Minute : d.getUTCMinutes(),
            Second : d.getUTCSeconds(),
            Millisecond : d.getUTCMilliseconds()
        });
    };

    // log needs to go first 

    _.log = require('./log.js').mixin(_);

    _.uuid = require('./uuid.js').library(_);
    _.sha256 = require('./sha256.js').library(_);
    _.format = require('./format.js').library(_);
    _.test = require('./test.js').library(_);
    _.string_builder = require('./string_builder.js').library(_);

    _.diff = require('./diff.js').diffString;
    _.path = require('./path.js').mixin(_);

    _.url = require('./url.js').library(_);
    _.querystring = require('./querystring.js').library(_);

    _.http_base = require('./http_base.js').library(_);
    _.http = require('./http.node.js').library(_);

    _.glob = require('./glob.js').mixin(_);
    _.fs = require('./fs.tjs').fs(_);
    _.npm = require('./npm.tjs').npm(_);
    _.source = require('./source.tjs').source(_);
    _.middleware = require('./middleware.js').middleware(_);

    _.tls = require('./tls.js').library(_);

    require('./render.tjs').mixin(_);

    _.mock = require('./mock.js').mixin(_);
    _.html = require('./html.js').mixin(_);
    _.ns = require('./ns.js').mixin(_);
    _.hb = require('handlebars')
    _.moment = require('moment-timezone');
    _.eventEmitter = require('./eventEmitter.js').mixin(_);
    _.event_emitter = _.eventEmitter;
    _.events = {};
    _.eventEmitter(_.events);
    _.fchain = require('./fchain.js').mixin(_);
    _.hook = require('./hook.js').mixin(_);
    _.hooks = {};
    _.hook(_.hooks);
    _.pipeline = require('./pipeline.js').mixin(_);
    _.builder = require('./builder.tjs').mixin(_);
    _.waiter = require('./waiter.js').mixin(_);
    _.timer = require('./timer.js').library(_);
};


