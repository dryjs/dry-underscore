
exports.mixin = function(_){

    function waiter(){
        this._results = [];
        this._contexts = [];
        this._total_calls = 0;
        this._pending_calls = 0;
        this._waiting_function = null;
    }

    waiter.prototype.callback = function(){};
    waiter.prototype._handle_done = function(){};

    waiter.prototype.context = _.rk("_contexts"); 
    waiter.prototype.results = _.rk("_results");

    waiter.prototype.wait = function(f){
        this._waiting_function = f;
        this._check_and_handle_done();
    };

    waiter.prototype._call_complete = function(){
        this._pending_calls--;
        this._check_and_handle_done();
    };

    waiter.prototype._check_and_handle_done = function(){
        if(this._pending_calls === 0 && this._waiting_function){
            this._handle_done();
        }
    };

    waiter.prototype.make_callback = function(context, f){ 
        var self = this;

        var def = (function(i){
            return(function(){
                var args = _.a(arguments);
                self._contexts[i] = context;
                f(i, args);
                self._call_complete();
            });
        })(this._total_calls);

        this._total_calls++;
        this._pending_calls++;

        return(def);
    };

    function raw_waiter(){
        waiter.call(this);
    }

    _.inherit(raw_waiter, waiter);

    raw_waiter.prototype._handle_done = function(){
        this._waiting_function(this._results, this._contexts);
    };

    raw_waiter.prototype.callback = function(context){ 
        var self = this;

        return(self.make_callback(context, function(i, args){
            self._results[i] = args;
        }));
    };

    function smart_waiter(){
        waiter.call(this);
        this._errors = [];
        this._has_errors = false;
    }

    _.inherit(smart_waiter, waiter);

    smart_waiter.prototype.errors = _.rk("_errors"); 

    smart_waiter.prototype._handle_done = function(){
        if(this._has_errors){
            return this._waiting_function(this._errors, this._results, this._contexts);
        }else{
            return this._waiting_function(null, this._results, this._contexts);
        }
    };

    smart_waiter.prototype.callback = function(context){ 
        var self = this;

        return(self.make_callback(context, function(i, args){
            if(args.length && args[0]){
                self._has_errors = true;
                self._errors[i] = args[0];
                self._results[i] = _.rest(args);
            }else{
                self._errors[i] = null;
                self._results[i] = _.rest(args);
            }
        }));
    };

    smart_waiter.prototype.raw = function(){ return(new raw_waiter()); };

    return(function(){ return(new smart_waiter()); });
};

