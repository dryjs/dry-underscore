"use strict";

var _ = require('dry-underscore');
var root = _.path.fun(__dirname);

var test_server = require('../test_server/server.tjs');

function main(){

    _.shell(root("..", "build"), function(code){
        if(code){ throw(_.error("BuildError", "Build error code: " + code)); }
        test_server.start_server(function(){
            _.shell("./node_modules/mocha-phantomjs/bin/mocha-phantomjs --reporter dot http://localhost:9999/index.html", function(code){
                test_server.stop_server(function(){
                    if(code){ process.exit(code); }
                });
            });
        });
    });
}

main();
