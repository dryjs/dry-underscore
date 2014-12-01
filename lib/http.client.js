function library(){

    function request_manager(){}


    var lib = new request_manager();
    lib.library = library;

    return(lib);
}

exports.library = library;
