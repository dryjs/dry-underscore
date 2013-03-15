
function timeout(msg, msecs){
    var that = {};
    msg = msg || "Operation timed out";
    msecs = (msecs !== undefined ? msecs : 1000);
    
    var timeout = null;

    that.start = function(){
        if(timeout !== null){ clearTimeout(timeout); }
        timeout = setTimeout(function(){ throw(new Error(msg));}, msecs);
    };
    
    that.back = function(){
        if(timeout !== null){ clearTimeout(timeout); }
    };
    
    that.start();
    
    return(that);
}

exports.timeout = timeout;
