"use strict";

var _ = require('dry-underscore');

var root = _.path.fun(__dirname);

var fs = require('fs');
var http = require('http');
var https = require('https');

var express = require('express');

var eq = _.test.eq;
var ok = _.test.ok;

suite('request');

var http_server = null;
var https_server = null;

function add_handlers(app, name){
    app.get('/get', function(req, res){

        var count = 0;

        function write_count(){ res.write("" + count++); }
        _.nextTick(write_count);
        _.nextTick(write_count);
        _.nextTick(write_count);
        _.nextTick(write_count);
        _.nextTick(function(){ res.end(); });
    });

    app.post('/post', function(req, res){
        var body = "";
        req.on('data', function(chunk){ body += chunk; });
        req.on('end', function(){ eq(body, "hello"); });
        res.status(202);
        res.write("good");
        res.end();
    });
}

function start_server(callback){

    var http_app = express();
    var https_app = express();

    var ssl_options = {
        key : fs.readFileSync(root("zandbox/ssl/test.key"), 'utf8'),
        cert : fs.readFileSync(root("zandbox/ssl/test.cert"), 'utf8'),
        ca: []
    }

    add_handlers(http_app, "http");
    add_handlers(https_app, "https");

    http_server = http.createServer(http_app);
    https_server = https.createServer(ssl_options, https_app);

    https_server.listen(9998, function(){
        http_server.listen(9999, function(){
            callback();
        });
    });
};

function stop_server(callback){
    http_server.close(); 
    https_server.close(); 
    callback();
};

before(start_server);
after(stop_server);

test("get", function(done){
    _.http.get("http://localhost:9999/get", function(err, res, body){
        ok(!err);
        ok(res);
        eq(res.body, "0123");
        eq(res.status, 200);
        eq(body, "0123");
        done();
    });
});

test("get https", function(done){

    _.http.unsafe = true;
    _.http.get("https://localhost:9998/get", function(err, res, body){
        eq(err, null);
        ok(res);
        eq(res.body, "0123");
        eq(res.status, 200);
        eq(body, "0123");
        done();
    });
});

test("post", function(done){
    _.http.post("http://localhost:9999/post", "hello", function(err, res, body){
        eq(res.status, 202);
        eq(body, "good");
        done();
    });
});

test("post https", function(done){
    _.http.post("https://localhost:9998/post", "hello", function(err, res, body){
        eq(res.status, 202);
        eq(body, "good");
        done();
    });
});

test("post writer", function(done){
    var r = _.http.post("http://localhost:9999/post", function(err, res, body){
        eq(body, "good");
        eq(res.status, 202);
        done();
    });

    r.write('he');
    r.write('ll');
    r.write('o');

    r.end();
});


