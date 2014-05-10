
exports.mixin = function(_){

    function makeLogger(options){

        options = options || {};

        var log = function(){
            if(arguments.length){ writeToLog.call(this, "", _.toArray(arguments)); }
            return(makeLoggers());
        };

        log._ns = [];

        log.init = function(){
            log.timestamp(options.timestamp);
            if(options.namespace){ log._ns.push(options.namespace); }
            if(options.level){ log.level(options.level); }
            if(options.parent){ log._parent = options.parent; }
        };

        function makeLoggers(){
            var loggers = {};

            var priorities = log.priorities();

            var ignore = false;
            _.each(priorities, function(logName){
                if(ignore){ loggers[logName] = _.noop; }
                else{ loggers[logName] = function(){ writeToLog(logName, _.toArray(arguments)); }; }
                if(_.lc(log.level()) === _.lc(logName)){ ignore = true; }
            });

            return(loggers);
        }

        log.namespace = function(){
            var ns = "";

            if(log.parent()){
                ns += log.parent().ns()
            }

            if(log._ns.length){
                ns += log._ns.join(".");
            }

            return(ns);
        };

        function writeToLog(logLevel, pieces){ 

            if(_.isArray(logLevel)){
                pieces = logLevel;
                logLevel = "";
            }

            var ns = log.namespace();
            if(ns){ ns += ": "; }
            pieces.unshift(ns);
            var entry = _.format.apply(null, pieces);
            var ts = _.timestamp();

            _.each(log.transports, function(f){
                if(_.isFunction(f.writeEntry)){
                    f.writeEntry(logLevel, ts, entry);
                }else if(_.isFunction(f)){
                    f(logLevel, ts, entry);
                }
            });
        }

        log.levels = function(){ return(log._levels); };
        log.priorities = function(){ return(log._priorities); };
        log._levels = ['debug', 'info', 'notice', 'warning', 'error', 'crit', 'alert', 'emerg'];
        log._priorities = ['emerg', 'alert', 'crit', 'error', 'warning', 'notice', 'info', 'debug'];
        
        function consoleTransport(logLevel, timestamp, entry){ 
            var writer = _.stdout;
            var priority = _.indexOf(log._priorities, logLevel);
            
            // error or worse
            if(priority >= 0 && priority <= 3){ writer = _.stderr; }

            if(log.timestamp()){ writer(_.moment(timestamp).format("YYYY-MM-DD HH:MM:SS") + ":", entry); }
            else{ writer(entry); }
        }

        log.transports = [consoleTransport];

        // you can revert to parent settings by nulling out child settings
        log.setting = function(setting, defaultValue){
           if(log[setting] !== undefined && log[setting] !== null){
                return(log[setting]);
            }else if(log._parent){
                return(log._parent.getSetting(setting, defaultValue));
            }else{
                return(defaultValue);
            }
        };

        log.level = function(level){
            if(level !== undefined){
                log._level = level;
                return(log);
            }else{ 
                return(log.setting("_level", _.last(log.priorities())));
            }
        };

        log.timestamp = function(enable){
            if(enable !== undefined){
                log._timestamp = enable;
                return(log);
            }else{ 
                return(log.setting("_timestamp", false));
            }
        };

        log.make = function(options){
            return(makeLogger(options));
        };

        log.child = function(ns){ return(log.make({ namespace: ns, parent: log })); };

        log.parent = function(){ 
            if(log._parent){
                return(log._parent);
            }else{
                return(null);
            }
        };

        log.init();

        return(log);
    }

    function mixin(root, options){
        root = root || {};

        root.log = makeLogger(options);

        return(root.log);
    }
                
    return(mixin());
};

