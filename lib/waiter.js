
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

    waiter.prototype.wait = function(f){
        this._waitingFunction = f;
        this._checkAndHandleDone();
    };

    return(function(options){ return(new waiter(options)); });
};

