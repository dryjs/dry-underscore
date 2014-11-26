"use strict";

exports.mixin = function(_){

var fchain = function(f){

    if(f === undefined){ f = {}; }

    f.add = function(f){
        if(this._fchain === undefined){ this._fchain = []; }
        if(f){ this._fchain.push(f); }
    };

    f.call = function(){ 
        var self = this;
        var args = _.a(arguments);

        var cb = args.pop();
        var brk = false;

        args.push(function(){
            brk = cb.apply(this, arguments);
        });

        _.beach(this._fchain, function(f){
            f.apply(self, args);
            return(brk);
        });
    };
    
    return(f);
};

return(fchain);

};

