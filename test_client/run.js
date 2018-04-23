"use strict";

var _ = require('../');
var root = _.path.fun(__dirname);

var test_server = require('../test_server/server.tjs');

function main(){

    _.shell(root("..", "build"), function(code){
        if(code){ throw(_.error("build_error", "Build error code: " + code)); }
        test_server.start_server(function(){
            _.shell("./bin/resolve_run phantomjs-prebuilt/bin/phantomjs `bin/resolve mocha-phantomjs-core/mocha-phantomjs-core.js` http://localhost:9999/index.html dot", function(code){
                test_server.stop_server(function(){
                    if(code){ process.exit(code); }
                });
            });
        });
    });
}

main();
