*dry: underscore library*

**Introduction**

This is a heavily augmented version of underscore.
It is the core library that is in heavy use in the dry framework. It has a server side version, and a client side version.
Certain libraries don't exist both places because it wouldn't make sense, or the core functionality isn't supported by browsers: ```_.fs``` for example.
If a library exists on the client side, the semantics are exactly the same as the server side version. Most of the time it's the exact same code,
sometimes, like ```_.http``` the semantics are the same, but the underlying library is different. This lets us write code that works both places more easily.

**Coding Style (coming soon)** 

We support both _.camelCaseFunctionNames and _.underscored_function_names, we prefer the latter: isIllicitIgloo vs. is_illicit_igloo, but we know we're the minority. We avoid the problem all together when possible, sometimes we can't, so we provide both, so we don't mess up your consistent style. We won't support _.PascalCase (ask me about it sometime), and we don't PascalCase our classes, because sometimes functions return classes, and the distinction doesn't matter.

**Testing**

We shoot for 100% coverage, we use tamejs in some of our code, so until we punchup a coverage tool that instruments properly, we're flying a little blind. We test the client side functions when they differ from the server side functions in phantomjs, and you can run the whole kit and kaboodle with ```./run-tests```.

*_.http (http request)*

**Introduction**

Basically I hate all the other http request libraries I've seen. I really just want strings in, strings out. I hate content type parsers. They always cause problems.

This works on both the server and client sides, with the exact same api. We don't deliver the body in pieces, we deliver it in one chunk.

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
