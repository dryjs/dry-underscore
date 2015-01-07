
var ok = _.test.ok;
var eq = _.test.eq;

suite('http');

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

test("echo", function(done){
    _.http.post("http://localhost:9999/post", "hello", function(err, res, body){
        eq(res.status, 202);
        eq(body, "good");
        done();
    });
});

test("get headers", function(done){
    _.http.get({ url: "http://localhost:9999/headers", headers: { "test_header": "test_header_value" } }, function(err, res, body){
        ok(!err);
        ok(res);
        ok(body);
        var headers = _.parse(body);
        eq(headers.test_header, "test_header_value");
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

