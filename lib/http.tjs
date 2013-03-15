var url = require('url');
var nativeHttp = require('http');

function lib(_){

var http = {};

// pass null to data if you want a get request
http.callUrl = function(userOptions, data, callback, callbackData){

    var parsedUrl = url.parse(userOptions.url);
    
    var options = {
        host: parsedUrl.hostname,
        port: parsedUrl.port || 80,
        path: parsedUrl.pathname + (parsedUrl.search ? parsedUrl.search : ""),
        method: '',
        headers : {}
    };

    data = handleData(data);
    
    if(!data){
        options.method = 'GET';
    }else{
        options.method = 'POST';
        options.headers["Content-type"] = "application/x-www-form-urlencoded";        
        options.headers["Content-length"] = data.length;
        options.headers["Connection"] = "close";
    }
    
    if(userOptions.headers){
        for(var h in userOptions.headers){
            if(userOptions.headers.hasOwnProperty(h)){
                options.headers[h] = userOptions.headers[h];
            }
        }
    }

    var req = nativeHttp.request(options, function(res) {
        var body = "";
        
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            body += chunk;
        });
        res.on('end', function(){
            if(typeof(callback) === 'function') {
                res.responseText = body;
                if(callbackData !== undefined){
                    callback(res, callbackData);
                }else{
                    callback(res);
                }
            }
        });
    });

    if(data){ req.write(data); }

    req.end();
};


function handleData(data){
    var dataStr = "";
    if(typeof(data) === 'object'){
        
        for(var p in data){
            if(data.hasOwnProperty(p)){
                dataStr += p + "=" + data[p] + "&";
            }
        }
        
        if(dataStr.length > 0){ dataStr[dataStr.length-1] = ""; }
        
        return(dataStr);
        
    }else if(typeof(data) === 'string'){
        return(data);
    }else{
        throw(new Error("Unknown data type to post"));
    }
}

return(http);

}

exports.http = lib;
