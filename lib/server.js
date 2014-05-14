"use strict";

require('tamejs').register();

var fs = require('fs');
var url = require('url');
var child_process = require('child_process');

exports.mixin = function(_){

    _.ecode = {};
    _.ecode.moduleNotFound = function(e){
        return(e.code === "MODULE_NOT_FOUND");
    };
    _.ecode.noEnt = function(e){
        return(e.code === "ENOENT");
    };
    _.ecode.notDir = function(e){
        return(e.code === "ENOTDIR");
    };

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
    _.sout = _.stdout;
    _.serr = _.stderr;
    _.p = _.stderr;


    _.nextTick = process.nextTick;
    _.test = require('assert');
    _.test.eq = function(){
        return(_.test.deepEqual.apply(null, arguments));
    };

    _.render.templateRoot =  function(root){
        if(root){
            _.render._templateRoot = root;
        }else{
            if(_.render._templateRoot){ return(_.render._templateRoot); }
            else{ return(""); }
        }
    };

    _.render.loadDirectory = function(rootPath){
        function pattern(fileName){
            var include = _.glob.matchFile(fileName, "*.mu") || _.glob.matchFile(fileName, "*.hb");
            _.log.debug(fileName, ":", include);
            return(include);
        }
        var files = _.fs.find.sync(rootPath, { pattern : pattern });
        _.each(files, function(filePath){
            _.render.loadFile(filePath);
        });
    };

    _.render.loadFile = function(templateName, filePath){
        if(!filePath){
            filePath = templateName;
            templateName = _.paths.file(templateName);
            templateName = templateName.replace(_.regex(".mu$"), "");
            templateName = templateName.replace(_.regex(".hb$"), "");
        }

        filePath = _.paths.join(_.render.templateRoot(), filePath);;
        var template = _.fs.readFile.sync(filePath);
        if(template && template.length && template[template.length-1] == "\n"){
            template = template.substr(0, [template.length-1]);
        }
        _.log.debug(templateName, "(0, 20):", _.stringify(template).substr(0, 20));
        _.render.compile(templateName, template);
        return(templateName);
    };

    _.wget = function(url, destPath, callback){
        var wget = 'wget -O ' + destPath + ' ' + url;
        // excute wget using child_process' exec function

        child_process.exec(wget, function(err, stdout, stderr) {
            if (err){ callback(err); }
            else{ callback(null); }
        });
    };

    _.exec = function(command, args, callback, print){
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

        cmd.stdout.on('data', function (data) { 
            stdout += data;
            if(print){ process.stdout.write(data); }
        });
        cmd.stderr.on('data', function (data) { 
            stderr += data;
            if(print){ process.stderr.write(data); }
        });

        cmd.on('close', function (code) { if(callback){ callback(code, stdout, stderr); } });
    };
 
    _.shell = function(command, args, callback){
        _.exec(command, args, callback, true);
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
    _.request = require('superagent');

    // this order matters
    _.diff = require('./diff.js').diffString;
    _.paths = require('./paths.js').mixin(_);
    _.glob = require('./glob.js').mixin(_);
    _.fs = require('./fs.tjs').fs(_);
    _.code = require('./code.tjs').code(_);
    _.middleware = require('./middleware.js').middleware(_);
    _.http = require('./http.js').http(_);
    _.dry = require('./dry.js').mixin(_);
    _.test = require('./test.js').mixin(_);
    require('./dry.server.js').mixin(_);
    _.html = require('./html.js').mixin(_);
    _.log = require('./log.js').mixin(_);
    _.ns = require('./ns.js').mixin(_);
    _.hb = require('handlebars')
    _.moment = require('moment');
    _.eventEmitter = require('./eventEmitter.js').mixin(_);
    _.events = {};
    _.eventEmitter(_.events);
    _.hook = require('./hook.js').mixin(_);
    _.hooks = {};
    _.hook(_.hooks);
    _.measurer = require('./measurer.js').mixin(_);
    _.plumber = require('./plumber.js').mixin(_);
    _.plumber(_);
    _.build = require('./build.tjs').mixin(_);
    _.waiter = require('./waiter.js').mixin(_);
    _.getFirst = function(obj){
       for(var key in obj){
            if(obj.hasOwnProperty(key)){
                return(obj[key]);
            }
        }
        return(null);
    };
    _.getFirstExport = function(filePath){
        if(_.fs.Exists(filePath)){
            try{
                var exportsFile = require(filePath);
            }catch(e){
                throw(e);
            }
            return(_.getFirst(exportsFile));
        }
        return(null);
    };
};


