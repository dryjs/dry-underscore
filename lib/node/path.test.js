"use strict";

var _ = require('../../');

var root = _.path.fun(__dirname);

var eq = _.test.eq;
var ok = _.test.ok;

suite('path');

test('resolve', function(){
    eq(_.path.resolve('/foo/bar', './baz'), '/foo/bar/baz');
});

test('prepend', function(){
    eq("a/b", _.path.prepend('a', "/b"));
    eq("/a/b", _.path.prepend('/a', "b"));
    eq(["/a/a", "/a/b", "/a/c"], _.path.prepend("/a", ['a', 'b', 'c']));
});

test('pop', function(){
    eq("/a/b/c", _.path.pop("/a/b/c/d/"));
    eq("/a/b/c", _.path.pop("/a/b/c/d"));
    eq("/", _.path.pop("/a"));
    eq("", _.path.pop("a"));
});

test('slash', function(){
    eq("", _.path.slash(""));
    eq("/hello/", _.path.slash("/hello"));
    eq("/hello/", _.path.slash("/hello/"));
    eq("/test/test/", _.path.slash("/test/test"));

    eq("", _.path.unslash(""));
    eq("/hello", _.path.unslash("/hello"));
    eq("/hello", _.path.unslash("/hello/"));
    eq("/test/test", _.path.unslash("/test/test/"));
});

test('file', function(){
    eq(_.path.file('/a/b/c/file', 'newName'), '/a/b/c/newName');
    eq(_.path.file('a', 'newName'), 'newName');
});

test('name', function(){
    eq(_.path.name('/a/b/c/file'), 'file');
    eq(_.path.name('/a/b/c/file.tar.gz'), 'file.tar');
    eq(_.path.name('/a/b/c/file.zip'), 'file');
    eq(_.path.name('file.tjs'), 'file');
    eq(_.path.name('file'), 'file');
});

test('dir', function(){
    eq(_.path.dir('/a/b/c/file'), '/a/b/c');
    eq(_.path.dir('/a/b/c/'), '/a/b/c');
    eq(_.path.dir('a'), '.');
    eq(_.path.dir('a/'), 'a');
    eq(_.path.dir('/a'), '/');
});

test('hide', function(){
    eq(_.path.hide('a/b/c/d.ext'), 'a/b/c/.d.ext');
    eq(_.path.hide('d.ext'), '.d.ext');
});

test('hidden', function(){
    ok(!_.path.hidden("/test.js/test.js/asdf.js"));
    ok(_.path.hidden("/test.js/test.js/.asdf.js"));
    ok(!_.path.hidden("/test.js/.test.js/asdf.js"));
    ok(_.path.hidden("/test.js/.test.js/.asdf.js"));
    ok(!_.path.hidden("asdf.js"));
    ok(_.path.hidden(".asdf.js"));
});


test('extension', function(){
    eq(_.path.extension('a/b/c/d.ext', 'js'), 'a/b/c/d.js');
    eq(_.path.extension('d.ext', 'js'), 'd.js');

    eq(_.path.extension('a/b/c/d.ext'), 'ext');
    eq(_.path.extension('d.ext'), 'ext');

    ok(_.path.extension.is('a/b/c/d.ext', 'ext'));
    ok(_.path.extension.is('d.ext', 'ext'));
    ok(_.path.extension('d', 'ext'), 'd.ext');
    ok(_.path.extension('d', ''), 'd');
    ok(_.path.extension('d.ext', ''), 'd');
});

test('glob', function(){

    ok(!_.glob.matchFile("/test.js/test.js/.asdf.js", "*.js"));
    ok(_.glob.matchFile("/test.js/test.js/.asdf.js", "*.js", true));
    ok(_.glob.matchFile("/test.js/test.js/asdf.js", "*.js"));
    ok(!_.glob.matchFile("/test.js/test.js/asdf.ms", "*.js"));

    ok(_.glob.matchPath("/test.js/test.ms/asdf.js", "**/*.ms/*"));
    ok(_.glob.matchPath("/test.js/test.js/asdf.ms", "**/*.ms"));
    ok(_.glob.matchPath("/test/test/asdf.ms", "**/*.ms"));
    ok(!_.glob.matchPath("/test/test/asdf.ms", "*.ds"));

    ok(_.glob.matchPath("/test/test/!asdf.js", "**/!*.js"));
    ok(_.glob.matchPath("/test/test/asdf.ms", "**/as*"));

    ok(_.glob.matchFile("/test/test/!asdf.js", "!*.js"));
    ok(_.glob.matchFile("/test/test/asdf.ms", "as*"));
    ok(_.glob.matchFile("/test/test/asdf.ms", "as*.ms"));
    ok(!_.glob.matchFile("/test/test/adf.ms", "as*.ms"));
});

test('fun', function(){

    var root = _.path.fun("root");

    eq(root(), "root");

    var child = _.path.fun(root, "child");

    eq(child(), "root/child");

    var caught = 0;
    try{
        var bad = _.path.fun(0);
    }catch(e){
        eq(e.code, "BadRoot");
        caught++;
    }

    eq(caught, 1);
});


test('object', function(){

    function test(p){

        eq(p.root("root", true), undefined);

        p.child = p.fun(p.root, "child");
        p.grandchild = p.fun(p.child, "grandchild");

        eq(p.root(), "root");
        eq(p.root("child"), "root/child");
        eq(p.child(), "root/child");
        eq(p.child("grandchild"), "root/child/grandchild");
        eq(p.grandchild(), "root/child/grandchild");
        eq(p.grandchild("greatgrandchild"), "root/child/grandchild/greatgrandchild");

        p.root("newroot", true);

        eq(p.root(), "newroot");
        eq(p.root("child"), "newroot/child");
        eq(p.child(), "newroot/child");
        eq(p.child("grandchild"), "newroot/child/grandchild");
        eq(p.grandchild(), "newroot/child/grandchild");
        eq(p.grandchild("greatgrandchild"), "newroot/child/grandchild/greatgrandchild");

    }

    function Paths(){ }
    _.path.mixin(Paths.prototype);
    test(_.path)
    test(_.path.make());
    test((new Paths).path);

});
