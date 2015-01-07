function library(){

    function request_manager(){
        _.http_base.call(this);
    }
    _.inherit(request_manager, _.http_base);

    function getXHR() {
        if (window.XMLHttpRequest && ('file:' != window.location.protocol || !window.ActiveXObject)) {
            return new XMLHttpRequest;
        } else {
            try { return new ActiveXObject('Microsoft.XMLHTTP'); } catch(e) {}
            try { return new ActiveXObject('Msxml2.XMLHTTP.6.0'); } catch(e) {}
            try { return new ActiveXObject('Msxml2.XMLHTTP.3.0'); } catch(e) {}
            try { return new ActiveXObject('Msxml2.XMLHTTP'); } catch(e) {}
        }
        return null;
    }

    request_manager.prototype.connect_writer = function(call, callback){
        var xhr = getXHR();

        xhr.onreadystatechange = function(){
            if (xhr.readyState !== 4){ return; }

            var client_response = {
                body: xhr.responseText,
                status: xhr.status
            };

            return callback(null, client_response, client_response.body);
        };

        var data = "";

        return({
            write: function(d){ data += d; },
            end: function(d){ 
                if(d !== undefined){ data += d; }
                xhr.open(call.method, call.url, true);
                _.each(call.headers, function(val, key){
                    xhr.setRequestHeader(key, val);
                });
                xhr.send(data);
            }
        });
    };

    var lib = new request_manager();
    lib.library = library;

    return(lib);
}

exports.library = library;
