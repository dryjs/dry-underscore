
exports.mixin = function(_){

_.dry.renderFolder = function(src, dest, hash, callback){
    function ignoreFile(fileName){
        var ignore = new RegExp("^!");
        return(fileName.match(ignore));
    }

    function processFileName(fileName){
        if(hash.Type){
            var typeReg = new RegExp("^Model");
            var hiddenTypeReg = new RegExp("^.Model")
            fileName = fileName.replace(typeReg, hash.Type);
            fileName = fileName.replace(hiddenTypeReg, "." + hash.Type);
        }
        return(fileName);
    }

    _.fs.renderFolder(src, dest, hash, ignoreFile, processFileName, callback);
};

};

