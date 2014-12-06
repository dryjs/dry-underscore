"use strict";

var _ = require('dry-underscore');
var root = _.path.fun(__dirname);

var express = require('express');

var server = null;

function start_server(callback){

    var app = express();

    app.use("/", express.static(root(".")));

    app.get('/get', function(req, res){

        var count = 0;

        function write_count(){ res.write("" + count++); }
        _.nextTick(write_count);
        _.nextTick(write_count);
        _.nextTick(write_count);
        _.nextTick(write_count);
        _.nextTick(function(){ res.end(); });
    });

    app.post('/echo', function(req, res){
        var body = "";
        req.on('data', function(chunk){ body += chunk; });
        req.on('end', function(){ 
            res.write(body);
            res.end();
        });
        res.status(202);
    });

    server = app.listen(9999);

    console.log("server running on port: ", 9999);

    callback();
};

function stop_server(callback){
    server.close(); 
    callback();
};


function main(){

    _.shell(root("..", "build"), function(code){
        if(code){ throw(_.error("BuildError", "Build error code: " + code)); }
        start_server(function(){
            _.shell("./node_modules/mocha-phantomjs/bin/mocha-phantomjs --reporter dot http://localhost:9999/index.html", function(code){
                stop_server(function(){
                    if(code){ process.exit(code); }
                });
            });
        });
    });
}

main();
