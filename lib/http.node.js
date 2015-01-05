
var http = require('http');
var https = require('https');

function library(_){

    function request_manager(){}

    request_manager.prototype.base_options = function(url, method){

        var host = _.url.parse(url);
        var secure = (host.protocol && host.protocol === "https:") || host.port === 443;

        var options = {
            secure: secure,
            host: host.hostname,
            port: host.port || (secure ? 443 : 80),
            path: host.pathname + (host.search ? host.search : ""),
            method: method,
            headers : {},
        };

        if(this.unsafe){ options.rejectUnauthorized = false; }

        return(options);
    };

    request_manager.prototype.get = function(url, callback){

        var call = this.base_options(url, "GET");

        return this.connect(call, "", callback);
    };

    request_manager.prototype.post = function(url, data, callback){

        var use_writer = false;
        if(_.isFunction(data)){
            callback = data;
            data = null;
            use_writer = true;
        }

        var call = this.base_options(url, "POST");

        call.headers["Content-type"] = "text/plain";        
        call.headers["Connection"] = "close";

        if(use_writer){
            return this.connect_writer(call, callback);
        }else{
            return this.connect(call, data, callback);
        }
    };

    request_manager.prototype.connect = function(call, data, callback){

        callback = callback || _.noop;

        var writer = this.connect_writer(call, callback);

        if(data){ writer.write(data); }

        writer.end();
    };

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

        var req = this.make_request(call, function(res) {
            var body = "";
            res.setEncoding('utf8');
            res.on('data', function (chunk) { body += chunk; });
            res.on('end', function(){
                var client_response = {
                    body: body,
                    status: res.statusCode
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
