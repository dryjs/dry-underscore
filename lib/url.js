
exports.mixin = function(_){

    var lib = {};

    lib.join = function(){
        var joined = [].slice.call(arguments, 0).join('/');
        return(lib.normalize(joined));
    }

    lib.normalize = function(str) {
        return(
            str
            .replace(/[\/]+/g, '/')
            .replace(/\/\?/g, '?')
            .replace(/\/\#/g, '#')
            .replace(/\:\//g, '://')
        );
    };

    lib.fun = function(root, base){
        if(!_.isString(root) && !_.isFunction(root)){
            throw(_.exception("BadRoot", "root is not a string or function."));
        }

        return(function(){
            var path = null;
            if(_.isString(root)){
                path = root;
            }else if(_.isFunction(root)){
                path = root.call(this);
            }

            if(base){ path = lib.join(path, base); }

            if(!arguments.length){
                return(path);
            }else{
                return(lib.join(path, lib.join.apply(null, arguments)));
            }
        });
    };

    return(lib);
};

