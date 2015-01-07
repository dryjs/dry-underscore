
function library(_){

    function http_base(){ }

    http_base.prototype.process_headers = function(headers){
        var new_headers = {};

        // http spec, headers are not case sensitive
        // lowercase so we can compare
        _.each(headers, function(val, key){
            new_headers[key.toLowerCase()] = val;
        });
        return(new_headers);
    };

    http_base.prototype.make_call = function(options, method){

        var url = null;

        if(_.isString(options)){
            url = options;
            options = {};
        }else if(_.isObject(options)){
            url = options.url;
        }

        if(!url){ _.fatal("You must provide a url to connect to."); }
        if(!method){ _.fatal("You must provide a method (http verb)."); }

        // http spec, verbs are uppercase and case sensitive
        method = method.toUpperCase();

        var host = _.url.parse(url);
        var secure = (host.protocol && host.protocol === "https:") || host.port === 443;

        var headers = this.process_headers(options.headers || {});

        if(!headers["content-type"]){ headers["content-type"] = "text/plain"; }

        var call = {
            url: url,
            secure: secure,
            host: host.hostname,
            port: host.port || (secure ? 443 : 80),
            path: host.pathname + (host.search ? host.search : ""),
            method: method,
            headers : headers,
        };


        return(call);
    };

    http_base.prototype.get = function(options, callback){

        var call = this.make_call(options, "GET");

        return this.connect(call, "", callback);
    };

    http_base.prototype.post = function(options, data, callback){

        var use_writer = false;
        if(_.isFunction(data)){
            callback = data;
            data = null;
            use_writer = true;
        }

        var call = this.make_call(options, "POST");

        if(use_writer){
            return this.connect_writer(call, callback);
        }else{
            return this.connect(call, data, callback);
        }
    };

    http_base.prototype.connect = function(call, data, callback){

        callback = callback || _.noop;

        var writer = this.connect_writer(call, callback);

        if(data){ writer.write(data); }

        writer.end();
    };

    var lib = http_base;
    lib.library = library;

    return(lib);
}

exports.library = library;
