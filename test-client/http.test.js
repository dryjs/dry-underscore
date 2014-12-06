
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

test("echo", function(done){
    _.http.post("http://localhost:9999/echo", "hello", function(err, res, body){
        eq(res.status, 202);
        eq(body, "hello");
        done();
    });
});

test("post writer", function(done){
    var r = _.http.post("http://localhost:9999/echo", function(err, res, body){
        eq(body, "hello");
        eq(res.status, 202);
        done();
    });

    r.write('he');
    r.write('ll');
    r.write('o');

    r.end();
});


