
function mixin(_){

    var ns = function(f, fname){

        fname = fname || "child";

        if(!f){ f = {}; }

        f[fname] = function(ns, val, cursor){ 

            if(_.isString(ns)){ ns = ns.split("."); }

            if(!cursor){ cursor = this; }
            if(!this._children){ this._children = {}; }

            var name = ns.shift();

            if(!ns.length){
                if(val !== undefined){ cursor[name] = val; }
                return(cursor[name]);
            }else{
                if(cursor[name] === undefined){
                    if(val === undefined){ return(cursor[name]); }
                    else{ cursor[name] = {}; }
                }
                return(f.child.call(this, ns, val, cursor[name]));
            }
        };

        return(f);
    };

    return(ns);
};


exports.mixin = mixin;
