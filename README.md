*dry: underscore library*

**Introduction**
This is a heavily augmented version of underscore.
It is the core library that is in heavy use in the dry framework. It has a server side version, and a client side version.
Certain libraries don't exist both places because it wouldn't make sense, or the core functionality isn't supported by browsers: ```_.fs``` for example.
If a library exists on the client side, the semantics are exactly the same as the server side version. Most of the time it's the exact same code,
sometimes, like ```_.http``` the semantics are the same, but the underlying library is different. This lets us write code that works both places more easily.

*_.http (http request)*

**Introduction**

Basically I hate all the other http request libraries I've seen. I really just want strings in, strings out. I hate content type parsers. They always cause problems.

This \*will\* work on both the server and client sides, with the exact same api. We don't deliver the body in pieces, we deliver it in one chunk.

```
_.http.get("http://www.google.com", function(err, res, body){
    ok(res.body === body);
});
```

```
_.http.post("http://www.google.com", "some data", function(err, res, body){
    ok(res.body === body);
});
```

```
var writer = _.http.post("http://www.google.com", function(err, res, body){
    ok(res.body === body);
});

writer.write("some");
writer.write("data");

writer.end();
```

**License**

See the LICENSE file in the root of the repo for license information.

