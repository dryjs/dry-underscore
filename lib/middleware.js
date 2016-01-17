var path = require('path');
var formidable = require('formidable');

function lib(_){

var middleware = {};

middleware.receiveBody = function(options){
    options = options || {};
    var limit = options.limit || 1e6;

    function processor(req, res, next) {
        req.body = "";
        req.setEncoding('utf8');
        req.on('data', function(data){
            if(req.body.length + data.length > limit) {
                req.body = "";
                res.writeHead(413, {'Content-Type': 'text/plain'}).end();
                req.connection.destroy();
                return next(_.error("body_exceedes_limit", "body post request too big, exceedes limit: " + limit + " bytes."));
            }else{ req.body += data; }
        });

        req.on('end', function() {
            return next();
        });
    }
    return(processor);
};

middleware.threshold = function(t, f){
    return(function(req, res, next){
        req.thresholdToken = _.measurer.start();
        var oldEnd = res.end;
        res.end = function(){
            var duration = _.measurer.stop(req.thresholdToken).duration;
            oldEnd.apply(res, arguments);
            if(duration > t){ f(req, res, duration); }
        };
        next();
    });
}

middleware.noCache = function(){
    return(function (req, res, next){ res.setHeader('Cache-Control', 'no-cache'); next(); });
};

middleware.uploads = function(options){

    options = _.extend({
        'root': '/tmp',
        'extensions': false,
    }, options);

    function createFilesArray(files) {
        return(_.map(files, function(file, key){
            file.field = key;
            return(file);
        })); 
    }

    _.fs.mkdir.sync(options.root);

    return(function (req, res, next) {
            
        var form = new formidable.IncomingForm();
        form.uploadDir = options.root;
        
        form.parse(req, function(err, fields, files) {
            if (err) { next(err); }
            else {
                req.files = files;
                req.files_array = createFilesArray(files);
                req.fields = fields;
                next();
            }
        });
    });
};

return(middleware);

}

exports.middleware = lib;
