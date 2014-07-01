
exports.mixin = function(_){

    function waiter(options){

        options = options || {};

        this._results = [];
        this._totalCalls = 0;
        this._pendingCalls = 0;
        this._waitingFunction = null;
        this._returnedBeforeWait = false;
    }

    waiter.prototype._checkAndHandleDone = function(){
        if(this._pendingCalls === 0){
            if(this._waitingFunction){
                this._waitingFunction(this._results);
            }
        }
    };

    waiter.prototype.defer = function(){ 
        var self = this;

        function makeDefer(i){
            return(function(){
                self._results[i] = arguments;
                self._pendingCalls--;
                self._checkAndHandleDone();
            });
        }

        var def = makeDefer(this._totalCalls)
        this._totalCalls++;
        this._pendingCalls++;

        return(def);
    };

    waiter.prototype.callback = waiter.prototype.defer;

    waiter.prototype.wait = function(f){
        this._waitingFunction = f;
        this._checkAndHandleDone();
    };

    waiter.prototype.results = function(f, cb){
        this.wait(function(results){
            _.beach(results, _.bind(f.apply, f, null));
            if(cb){ cb(); }
        });
    };

    waiter.prototype.errors = function(callback){
        var errors = [];
        this.results(function(err){ 
            if(err){ errors.push(err); } 
        }, function(){
            if(errors.length){ callback(errors); }
            else{ callback(null); }
        }); 
    };

    // we could check for an error on every returned "defer"
    // and short circuit if we get one "early". in this case we wait for everything to come back,
    // and then check.
    waiter.prototype.plumb = function(good, bad){

        var error = null;

        this.results(function(err){ 
            if(err){ error = err; return(false); } 
        }, function(){
            if(error){ bad(error); }
            else{ good(null); }
        }); 
    };

    waiter.prototype.plumbAll = function(good, bad){
        this.errors(function(errs){ 
            if(errs){ bad(errs); }
            else{ good(null); }
        }); 
    };

    waiter.prototype.split = function(callback){
        var errors = [];
        var results = [];
        this.results(function(){ 
            var args = _.a(arguments);
            if(args[0]){ errors.push(args[0]); }
            else{ args.shift(); results.push(args); }
        }, function(){
            if(errors.length){ callback(errors); }
            else{ callback(null, results); }
        }); 
    };

    return(function(options){ return(new waiter(options)); });
};

