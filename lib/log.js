
exports.mixin = function(_){

    function consoleTransport(log, logLevel, timestamp, entry){ 
        var writer = _.stdout;
        var priority = log.priority(logLevel);

        // error or worse
        if(priority > 3){ writer = _.stderr; }

        if(log.timestamp()){ writer(_.moment(timestamp).format("YYYY-MM-DD HH:MM:SS") + ":", entry); }
        else{ writer(entry); }
    }


    function logger(options){

        if(_.isString(options)){
            options = { namespace: options };
        }

        options = options || {};

        this._defaultLevel = "error";
        this._defaultVerboseLevel = "debug";

        if(options.ns && !options.namespace){ options.namespace = options.ns; }

        this._namespace = options.namespace ? options.namespace : "";
        this.timestamp(options.timestamp);

        if(options.parent){ 
            this._parent = options.parent;
            this._transports = [];
        }else{ 
            this._parent = null;
            this._transports = _.clone(this._defaultTransports);
        }

        if(options.level){ this.level(options.level); }
        if(options.verboseLevel){ this.verboseLevel(options.verboseLevel); }
    }

    logger.prototype._levels = ['debug', 'info', 'notice', 'warning', 'error', 'crit', 'alert', 'emerg'];
    logger.prototype._priorities = { 'debug' : 0, 'info' : 1, 'notice' : 2, 'warning' : 3, 'error' : 4, 'crit' : 5, 'alert' : 6, 'emerg' : 7 };

    logger.prototype.levels = function(){ return(this._levels); };
    logger.prototype.priorities = function(){ return(this._priorities); };

    logger.prototype.verbose = function(){
        return(this.priority(this.level()) <= this.priority(this.verboseLevel()));
    };

    logger.prototype.noop = function(){
        var self = this;
        if(!self._noop){  
            self._noop = self.make();
            self._noop._write = function(){};
            self._noop.make = function(){ return(self._noop); };
        }
        return(self._noop);
    };

    logger.prototype._defaultTransports = [consoleTransport];

    logger.prototype.transports = function(t){
        if(t){ this._transports = t; }
        else{ return(this._transports); }
    };

    logger.prototype.priority = function(level){ 
        if(level === undefined){
            return(this.priority(this.level()));
        }else if(this._priorities[level] !== undefined){
            return(this._priorities[level]);
        }else{
            return(-1); 
        }
    };

    logger.prototype.level = function(level){
        if(level !== undefined){
            if(this.priority(level) >= 0){ this._level = level; }
            return(this);
        }else{
            return(this.setting("_level", this._defaultLevel));
        }
    };

    logger.prototype.verboseLevel = function(level){
        if(level !== undefined){
            if(this.priority(level) >= 0){ this._verboseLevel = level; }
            return(this);
        }else{
            return(this.setting("_verboseLevel", this._defaultVerboseLevel));
        }
    };

    logger.prototype.namespace = function(ns){
        if(ns !== undefined){ this._namespace = ns; }

        var ns = "";

        if(this.parent()){ ns += this.parent().namespace(); }
        if(this._namespace){
            if(ns){ ns += "."; }
            ns += this._namespace;
        }

        return(ns);
    };

    logger.prototype._write = function(logLevel, pieces){ 

        var ns = this.namespace();
        if(ns){ ns += ": "; }
        pieces.unshift(ns);
        var entry = _.format.apply(null, pieces);

        this._transport(logLevel, entry);
    }

    logger.prototype._transport = function(logLevel, entry){
        var self = this;
        var ts = _.timestamp();

        _.each(this.transports(), function(f){
            if(_.isFunction(f.writeEntry)){
                f.writeEntry(self, logLevel, ts, entry);
            }else if(_.isFunction(f)){
                f(self, logLevel, ts, entry);
            }
        });

        if(this.parent()){ this.parent()._transport(logLevel, entry); }
    }

    logger.prototype.parent = function(){ 
        if(this._parent){ return(this._parent); }
        else{ return(null); }
    };

    function makeLogFunction(logLevel){
        return(function(){
            if(this.priority(this.level()) <= this.priority(logLevel)){
                this._write(logLevel, _.toArray(arguments));
            }
            return(this);
        });
    }

    _.each(logger.prototype._levels, function(logLevel){
        logger.prototype[logLevel] = makeLogFunction(logLevel);
    });

    // you can revert to parent settings by nulling out child settings
    logger.prototype.setting = function(setting, defaultValue){
        if(this[setting] !== undefined && this[setting] !== null){
            return(this[setting]);
        }else if(this.parent()){
            return(this.parent().setting(setting, defaultValue));
        }else{
            return(defaultValue);
        }
    };

    logger.prototype.timestamp = function(enable){
        if(enable !== undefined){
            this._timestamp = enable;
            return(this);
        }else{ 
            return(this.setting("_timestamp", false));
        }
    };

    logger.prototype.make = function(options){
        return(new logger(options));
    };

    logger.prototype.child = function(options){ 
        if(!options){ options = {}; }
        if(_.isString(options)){ options = { namespace: options }; }
        return(this.make(_.extend(options, { parent: this })));
    };

    logger.prototype.mixin = function(root, options){
        root = root || {};

        root.log = new logger(options);

        return(root.log);
    }

    return(logger.prototype.mixin());
};

