
require('tamejs').register();

var fs = require('fs');
var url = require('url');
var child_process = require('child_process');
var mustache = require('mustache');

exports.mixin = function(_){

    _.nextTick = process.nextTick;
    _.test = require('assert');
    _.test.eq = function(){
        return(_.test.deepEqual.apply(null, arguments));
    };

    _.mixin({
        render : function(template, hash){
            return(mustache.render(template, hash))
        },
        wget : function(url, destPath, callback){
            var wget = 'wget -O ' + destPath + ' ' + url;
            // excute wget using child_process' exec function

            child_process.exec(wget, function(err, stdout, stderr) {
                if (err){ callback(err); }
                else{ callback(null); }
            });
        },
        shell : function(command, args, callback){
            if(_.isFunction(args)){
                callback = args;
                args = null
            }

            if(!args){
                args = command.split(" ");
                command = args.shift();
            }

            var spawn = child_process.spawn;
            var cmd = spawn(command, args);

            cmd.stdout.on('data', function (data) { process.stdout.write(data); });
            cmd.stderr.on('data', function (data) { process.stderr.write(data); });
            cmd.on('close', function (code) { if(callback){ callback(code); } });
        },
        dateHash : function(d){ 
            return({ 
                Type : 'Date',
            Year : d.getUTCFullYear(),
            Month : d.getUTCMonth(),
            Day : d.getUTCDate(),
            WeekDay : d.getUTCDay()
            });
        },
        dateTimeHash : function(d){
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
        },
        request : require('superagent')
    });

    // this order matters
    _.diff = require('./diff.js').diffString;
    _.timeout = require('./timeout.js').timeout;
    _.fs = require('./fs.tjs').fs(_);
    _.code = require('./code.tjs').code(_);
    _.middleware = require('./middleware.js').middleware(_);
    _.http = require('./http.js').http(_);
    _.dry = require('./dry.js').mixin(_);
    _.test = require('./test.js').mixin(_);
    require('./dry.server.js').mixin(_);
    _.log = require('./log.js').mixin(_);
    _.ns = require('./ns.js').mixin(_);
    _.moment = require('moment');
    _.eventEmitter = require('./eventEmitter.js').mixin(_);
    _.hook = require('./hook.js').mixin(_);
    _.events = {};
    _.eventEmitter(_.events);
    require('./log.server.tjs').mixin(_);
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
                console.log(filePath);
                throw(e);
            }
            return(_.getFirst(exportsFile));
        }
        return(null);
    };
    _.makeLogger = function(defaultLevel, dbName){
        var winston = require('winston');    
        defaultLevel = defaultLevel || 'debug';
        
        var options = { level : defaultLevel};
      
        if(dbName){
            var mongoDBTransport = new (require('winston-mongodb').MongoDB)({level : defaultLevel, db : dbName, keepAlive: 100});
            options.transports = [ new (winston.transports.Console)({level : defaultLevel}),
                                   mongoDBTransport
                                  ];
        }else{
            options.transports = [ new (winston.transports.Console)({level : defaultLevel})];
        }
        
        var logger = new (winston.Logger)(options);
        
        logger.setLevels(winston.config.syslog.levels);

        return(logger);
    };

};


