
var path = require('path');
var assert = require('assert');
var fs = require('fs');

var _ = require('../');

var eq = _.test.eq;
var ok = _.test.ok;

exports.testPop = testPop;
exports.testPrepend = testPrepend;
exports.testSlash = testSlash;
exports.testFile = testFile;
exports.testDir = testDir;
exports.testHide = testHide;
exports.testHidden = testHidden;
exports.testExtension = testExtension;
exports.testGlob = testGlob;

exports.testFun = testFun;
exports.testObject = testObject;

function testPrepend(){
    eq("a/b", _.paths.prepend('a', "/b"));
    eq("/a/b", _.paths.prepend('/a', "b"));
    eq(["/a/a", "/a/b", "/a/c"], _.paths.prepend("/a", ['a', 'b', 'c']));
}

function testPop(){
    eq("/a/b/c", _.paths.pop("/a/b/c/d/"));
    eq("/a/b/c", _.paths.pop("/a/b/c/d"));
    eq("/", _.paths.pop("/a"));
    eq("", _.paths.pop("a"));
}

function testSlash(){
    eq("", _.paths.slash(""));
    eq("/hello/", _.paths.slash("/hello"));
    eq("/hello/", _.paths.slash("/hello/"));
    eq("/test/test/", _.paths.slash("/test/test"));

    eq("", _.paths.unslash(""));
    eq("/hello", _.paths.unslash("/hello"));
    eq("/hello", _.paths.unslash("/hello/"));
    eq("/test/test", _.paths.unslash("/test/test/"));
}

function testFile(){
    eq(_.paths.file('/a/b/c/file', 'newName'), '/a/b/c/newName');
    eq(_.paths.file('a', 'newName'), 'newName');
}

function testDir(){
    eq(_.paths.dir('/a/b/c/file'), '/a/b/c');
    eq(_.paths.dir('/a/b/c/'), '/a/b/c');
    eq(_.paths.dir('a'), '.');
    eq(_.paths.dir('a/'), 'a');
    eq(_.paths.dir('/a'), '/');
}

function testHide(){
    eq(_.paths.hide('a/b/c/d.ext'), 'a/b/c/.d.ext');
    eq(_.paths.hide('d.ext'), '.d.ext');
}

function testHidden(){
    ok(!_.paths.hidden("/test.js/test.js/asdf.js"));
    ok(_.paths.hidden("/test.js/test.js/.asdf.js"));
    ok(!_.paths.hidden("/test.js/.test.js/asdf.js"));
    ok(_.paths.hidden("/test.js/.test.js/.asdf.js"));
    ok(!_.paths.hidden("asdf.js"));
    ok(_.paths.hidden(".asdf.js"));
}


function testExtension(){
    eq(_.paths.extension('a/b/c/d.ext', 'js'), 'a/b/c/d.js');
    eq(_.paths.extension('d.ext', 'js'), 'd.js');

    eq(_.paths.extension('a/b/c/d.ext'), 'ext');
    eq(_.paths.extension('d.ext'), 'ext');

    ok(_.paths.extension.is('a/b/c/d.ext', 'ext'));
    ok(_.paths.extension('d.ext', 'ext'));
}

function testGlob(){

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
};

function testFun(){

    var root = _.paths.fun("root");

    eq(root(), "root");

    var child = _.paths.fun(root, "child");

    eq(child(), "root/child");

    var caught = 0;
    try{
        var bad = _.paths.fun(0);
    }catch(e){
        eq(e.code, "BadRoot");
        caught++;
    }

    eq(caught, 1);
}


function testObject(){

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
    _.paths.mixin(Paths.prototype);
    test(_.paths)
    test(_.paths.make());
    test((new Paths).paths);

}
