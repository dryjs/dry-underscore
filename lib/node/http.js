
var http = require('http');
var https = require('https');

function library(_){

    function request_manager(){
        _.http_base.call(this);
    }
    _.inherit(request_manager, _.http_base);

    request_manager.prototype.make_request = function(call, res_handler){
        var req = null;

        if(call.secure){
            req = https.request(call, res_handler);
        }else{
            req = http.request(call, res_handler);
        }

        return(req);
    };

    request_manager.prototype.connect_writer = function(call, callback){

        callback = callback || _.noop;

        if(this.unsafe){ call.rejectUnauthorized = false; }

        if(!_.get(call.headers, "connection")){ call.headers["connection"] = "close"; }

        var req = this.make_request(call, function(res) {
            var body = "";
            res.setEncoding('utf8');
            res.on('data', function (chunk) { body += chunk; });
            res.on('end', function(){
                var client_response = {
                    status: res.statusCode,
                    headers: res.headers,
                    body: body
                };
                callback(null, client_response, body);
            });
        });

        var dead = false;
        req.on('error', function(err){ 
            dead = true;
            return callback(err);
        });

        return({
            end: function(){ req.end(); },
            write: function(d){ if(!dead){ req.write(d); } }
        });
    };

    var lib = new request_manager();
    lib.library = library;

    return(lib);
}

exports.library = library;
