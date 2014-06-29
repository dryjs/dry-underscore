
exports.mixin = function(_){

    var nativePath = require('path');

    var lib = {};

    lib.join = nativePath.join;
    lib.normalize = nativePath.normalize;

    lib.dir = function(path){
        if(path[path.length-1] === "/"){
            return(path.substr(0, path.length-1));
        }else{
            return(nativePath.dirname(path));
        }
    };

    lib.file = function(path, newName){
        if(newName){ return(lib.join(nativePath.dirname(path), newName)); }
        else{ return(nativePath.basename(path)); }
    };

    lib.base = lib.file;

    lib.prepend = function(path, arr){
        if(_.isArray(arr)){
            return(_.map(arr, function(p){ return(lib.join(path, p)); }));
        }else{
            return(lib.join(path, arr));
        }
    };

    lib.extension = function(path, newExt){
        var file = lib.file(path);
        var fileSplit = file.split(".");
        var fileExt = fileSplit.pop() || "";

        if(!newExt){ return(fileExt); }

        fileSplit.push(newExt);
        
        return(lib.join(lib.dir(path), fileSplit.join(".")));
    };
 
    lib.extension.is = function(path, ext){ return(path.match(_.regex(ext + "$"))); };

    lib.hide = function(path){ return(lib.join(lib.dir(path), "." + lib.file(path))); };

    lib.hidden = function(path){ return(lib.file(path)[0] === "."); };

    lib.slash = function(path){
        if(path.length > 0 && path[path.length-1] !== '/'){ return(path + '/'); }
        else{ return(path); }   
    };

    lib.unslash = function(path){
        if(path.length > 0 && path[path.length-1] === '/'){ return(path.substr(0, path.length-1)); }
        else{ return(path); }   
    };

    lib.pop = function(path){
        var pathSplit = path.split('/');
        while(pathSplit.pop() === ""){ }
        if(pathSplit.length === 1 && pathSplit[0] === ""){
            return("/");
        }else{ return(pathSplit.join("/")); }
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

            return(lib.join(path, lib.join.apply(null, arguments)));
        });
    };
 
    function path(options){

        if(_.isString(options)){
            options = { root: options };
        }

        options = options || {};

        this._root = options.root || "";
    }

    _.extend(path.prototype, lib);

    path.prototype.root = function(path, setFlag){
        if(_.isString(path) && setFlag === true){
            this._root = path;
        }else{
            return(this.join(this._root, this.join.apply(null, arguments)));
        }
    };

    path.prototype.make = function(options){
        return(new path(options));
    };

    path.prototype.mixin = function mixin(root, options){
        root = root || {};

        root.path = new path(options);

        return(root.path);
    }

    return(new path());
};

