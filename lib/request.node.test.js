"use strict";

var _ = require('dry-underscore');

var express = require('express');

var eq = _.test.eq;
var ok = _.test.ok;

suite('request');

var server = null;

function start_server(callback){

    var app = express();

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

    server = app.listen(9999);

    callback();
};

function stop_server(callback){
    server.close(); 
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

test("post", function(done){
    _.http.post("http://localhost:9999/post", "hello", function(err, res, body){
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


