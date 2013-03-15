var path = require('path');
var formidable = require('formidable');

function lib(_){

var middleware = {};

middleware.acceptUploads = function(opt){

    var options = {
        'uploadRoot': opt.uploadRoot || '/tmp',
        'keepExtensions': opt.keepExtensions || false,
        'parameterName': opt.parameterName || 'datafile'
    };


    function makeFileEntry(file){
        
        var fileObj = file[options.parameterName]; 

        if(!fileObj){ return(null); }

        return({
            "name": path.basename(fileObj.path),
            "path": fileObj.path,
            "type": fileObj.type,
            "clientFilename": fileObj.name
        });
    }

    function createFilesArray(files) {
        var f = [];

        //console.dir(files);
        
        if(!Array.isArray(files)){ files = [files]; }
        for(var i = 0; i < files.length; i++) { f.push(makeFileEntry(files[i])); }

        return f;
    }


    _.fs.makeTree(options.UploadRoot);

    return( function (req, res, next) {
            
        var form = new formidable.IncomingForm();
        form.uploadDir = options.uploadRoot;
        
        form.parse(req, function(err, fields, files) {
            if (err) { next(err); }
            else {
                req.files = createFilesArray(files);
                req.fields = fields;
                next();
            }
        });
    });
};

return(middleware);

}

exports.middleware = lib;
