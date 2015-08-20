"use strict";

var _ = require('../');

var root = _.path.fun(__dirname);

var eq = _.test.eq;
var ok = _.test.ok;

suite('request');

var test_server = require('../test_server/server.tjs');

before(test_server.start_server);
after(test_server.stop_server);

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

test("get with data", function(done){
    _.http.get("http://localhost:9999/query", { one: "one", "two": "two" }, function(err, res, body){
        ok(!err);
        ok(res);
        eq(body, '{"one":"one","two":"two"}');
        eq(res.body, '{"one":"one","two":"two"}');
        eq(res.status, 200);
        done();
    });
});

test("get with empty data", function(done){
    _.http.get("http://localhost:9999/query", {}, function(err, res, body){
        ok(!err);
        ok(res);
        eq(body, "{}");
        eq(res.body, "{}");
        eq(res.status, 200);
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

test("get headers", function(done){
    _.http.get({ url: "http://localhost:9999/headers", headers: { "test_header": "test_header_value" } }, function(err, res, body){
        ok(!err);
        ok(res);
        ok(body);
        var headers = _.parse(body);
        eq(headers.test_header, "test_header_value");
        // we should run the test below but it turns out node.js changes the case of the headers to lowercase
        // so we can't actually test that we're preserving the headers, which is shitty. 
        // Because we need to preserve the case
        // eq(headers.Cased_header, "Cased_value");
        done();
    });
});

test("post headers", function(done){
    _.http.post({ url: "http://localhost:9999/headers", headers: { "test_header": "test_header_value" } }, "hello", function(err, res, body){
        ok(!err);
        ok(res);
        ok(body);
        var headers = _.parse(body);
        eq(headers.test_header, "test_header_value");
        done();
    });
});

