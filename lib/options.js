"use strict";

exports.library = function(_){

    var options = function(f){

        if(f === undefined){ f = {}; }
            
        f.options_parent = _.rw("_options_parent");

        f.options = function(key, val){
            if(this._options === undefined){ this._options = {}; }
            if(key === undefined){ return(_.extend({}, this.options_parent() ? this.options_parent().options() : {}, this._options)); }
            if(val === undefined){
                if(this._options[key] !== undefined){ return(this._options[key]); }
                else if(this.options_parent()){ return(this.options_parent().options(key)); }
                else{ return(undefined); }
            }
            this._options[key] = val;
            return(this);
        };
               
        return(f);
    };

    options.fun = function(key){
        return(function(val){ return(this.options(key, val)); });
    };

    options.library = library;

    return(options);

};

