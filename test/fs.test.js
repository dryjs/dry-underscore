
var path = require('path');
var assert = require('assert');
var fs = require('fs');

var _ = require('../');

exports.testGetFileText = testGetFileText;
exports.testDirectoryContains = testGetFileTextOrEmptyString;
exports.testDirectoryIsEmpty = testDirectoryIsEmpty;
exports.testDirectoryContains = testDirectoryContains;
exports.testFindFileInParents = testFindFileInParents;
exports.testFindDirectoryInChildren = testFindDirectoryInChildren;
exports.testFileExists = testFileExists;
exports.testDirExists = testDirExists;
exports.testGetFileAndFolderNames = testGetFileAndFolderNames;
exports.testGetFilesAndFolders = testGetFilesAndFolders;
exports.testMakeRemoveTree = testMakeRemoveTree;
exports.testGetDirectories = testGetDirectories;
exports.testGetDirectoryNames = testGetDirectoryNames;
exports.testGetFileNames = testGetFileNames;
exports.testGetFiles = testGetFiles;
exports.testAddSlash = testAddSlash;
exports.testRemoveSlash = testRemoveSlash;
exports.testGetFileName = testGetFileName;
exports.testMoveFiles = testMoveFiles;
exports.testMTime = testMTime;
exports.globTest = globTest;
exports.hiddenTest = hiddenTest;
exports.walkTest = walkTest;
exports.findTest = findTest;
exports.pathTest = pathTest;

function pathTest(){
    assert.eql(_.fs.path.changeFile('/a/b/c/file', 'newName'), '/a/b/c/newName');
    assert.eql(_.fs.path.changeFile('a', 'newName'), 'newName');

    assert.eql(_.fs.path.changeExtension('a/b/c/d.ext', 'js'), 'a/b/c/d.js');
    assert.eql(_.fs.path.changeExtension('d.ext', 'js'), 'd.js');

    assert.eql(_.fs.path.hideFile('a/b/c/d.ext'), 'a/b/c/.d.ext');
    assert.eql(_.fs.path.hideFile('d.ext'), '.d.ext');
}

function hiddenTest(){
    assert.ok(!_.fs.isHidden("/test.js/test.js/asdf.js"));
    assert.ok(_.fs.isHidden("/test.js/test.js/.asdf.js"));
    assert.ok(!_.fs.isHidden("/test.js/.test.js/asdf.js"));
    assert.ok(_.fs.isHidden("/test.js/.test.js/.asdf.js"));
    assert.ok(!_.fs.isHidden("asdf.js"));
    assert.ok(_.fs.isHidden(".asdf.js"));
}

function globTest(){

    assert.ok(!_.fs.glob.matchFile("/test.js/test.js/.asdf.js", "*.js"));
    assert.ok(_.fs.glob.matchFile("/test.js/test.js/.asdf.js", "*.js", true));
    assert.ok(_.fs.glob.matchFile("/test.js/test.js/asdf.js", "*.js"));
    assert.ok(!_.fs.glob.matchFile("/test.js/test.js/asdf.ms", "*.js"));

    assert.ok(_.fs.glob.matchPath("/test.js/test.ms/asdf.js", "**/*.ms/*"));
    assert.ok(_.fs.glob.matchPath("/test.js/test.js/asdf.ms", "**/*.ms"));
    assert.ok(_.fs.glob.matchPath("/test/test/asdf.ms", "**/*.ms"));
    assert.ok(!_.fs.glob.matchPath("/test/test/asdf.ms", "*.ds"));

    assert.ok(_.fs.glob.matchPath("/test/test/!asdf.js", "**/!*.js"));
    assert.ok(_.fs.glob.matchPath("/test/test/asdf.ms", "**/as*"));

    assert.ok(_.fs.glob.matchFile("/test/test/!asdf.js", "!*.js"));
    assert.ok(_.fs.glob.matchFile("/test/test/asdf.ms", "as*"));
    assert.ok(_.fs.glob.matchFile("/test/test/asdf.ms", "as*.ms"));
    assert.ok(!_.fs.glob.matchFile("/test/test/adf.ms", "as*.ms"));
};


var testDir = path.normalize(__dirname + "/data/");

function testMTime(){
    _.fs.modificationTime(testDir + '/parent/parent.file', function(mtime){
        console.log(mtime);
    });
}

function testMoveFiles(beforeExit){
    var n = 0;
    
    var fileArray = [testDir + 'mv1.txt', testDir + 'mv2.txt', testDir + 'mv3.txt'];
    
    var mvArray = [];
    for(var i = 0; i < fileArray.length; i++){
        fs.writeFileSync(fileArray[i], fileArray[i]);
        mvArray.push({Src : fileArray[i], Dest : testDir + 'mvtest/' + path.basename(fileArray[i])})
    }
    
    _.fs.moveFiles(mvArray, function(){
        for(i = 0; i < mvArray.length; i++){
            assert.strictEqual(false, _.fs.fileExists(mvArray[i].Src));
            assert.strictEqual(fileArray[i], _.fs.getFileText(mvArray[i].Dest, true));
        }

        n++;
    });
    
    beforeExit(function(){ assert.equal(1, n); });
}

function testGetFileText(beforeExit){

    var n = 0;
    
    assert.strictEqual("parent.file.text", _.fs.getFileText(testDir + "parent/parent.file", true));
    
    try{
        assert.strictEqual("parent.file.text", _.fs.getFileText(testDir + "parent/parent.file.doesnotexist", true));
    }catch(e){
        n++;
    }
    
    _.fs.getFileText(testDir + "parent/parent.file", function(text){
        assert.strictEqual("parent.file.text", text);
        n++;
    }, true);
    
    _.fs.getFileText(testDir + "parent/parent.file.doesnotexist", function(text){
        assert.strictEqual(text, null);
        n++;
    }, true);
    
    beforeExit(function(){ assert.equal(3, n); });
}

function testGetFileTextOrEmptyString(beforeExit){
    
    var n = 0;
    
    assert.strictEqual("parent.file.text", _.fs.getFileText(testDir + "parent/parent.file"));
    
    assert.strictEqual("", _.fs.getFileText(testDir + "parent/parent.file.doesnotexist"));
    
    _.fs.getFileText(testDir + "parent/parent.file", function(text){
        assert.strictEqual("parent.file.text", text);
        n++;
    });
    
    _.fs.getFileText(testDir + "parent/parent.file.doesnotexist", function(text){
        assert.strictEqual(text, "");
        n++;
    });
    
    beforeExit(function(){ assert.equal(2, n); });
}

function testDirectoryIsEmpty(beforeExit){

    _.fs.makeTree(testDir + 'parent/empty/');

    var n = 0;
    
    assert.strictEqual(false, _.fs.directoryIsEmpty(testDir + "parent/"));
    
    assert.strictEqual(true, _.fs.directoryIsEmpty(testDir + "parent/empty/"));
    
    try{
        _.fs.directoryIsEmpty(testDir + "parent/empty/doesntexist");
    }catch(e){n++;}

    _.fs.directoryIsEmpty(testDir + "parent/doesntexist", function(empty){
        assert.strictEqual(empty, true);
        n++;
    });

    
    _.fs.directoryIsEmpty(testDir + "parent/", function(empty){
        assert.strictEqual(empty, false);
        n++;
    });
    
    _.fs.directoryIsEmpty(testDir + "parent/empty/", function(empty){
        assert.strictEqual(empty, true);
        n++;
    });
    
    beforeExit(function(){ assert.equal(4, n); });
    
}

function testDirectoryContains(beforeExit){

    var n = 0;
    
    
    assert.strictEqual(_.fs.directoryContains(testDir + "parent/", "parent.file"), true);
    assert.strictEqual(_.fs.directoryContains(testDir + "parent/", "parent.file", false), true);
    assert.strictEqual(_.fs.directoryContains(testDir + "parent/", "parent.file", true), true);
    assert.strictEqual(_.fs.directoryContains(testDir + "parent/", "Parent.file", true), false);
    assert.strictEqual(_.fs.directoryContains(testDir + "parent/", "Parent.file", false), true);
    assert.strictEqual(_.fs.directoryContains(testDir + "parent/", "parent.file.doesnotexist"), false);
    assert.strictEqual(_.fs.directoryContains(testDir + "parent/", "parent.file.doesnotexist", false), false);
    assert.strictEqual(_.fs.directoryContains(testDir + "parent/", "parent.file.doesnotexist", true), false);
    assert.strictEqual(_.fs.directoryContains(testDir + "parent/", "Parent.file.doesnotexist", true), false);
    assert.strictEqual(_.fs.directoryContains(testDir + "parent/", "parent.file.doesnotexist", false), false);
    
    // --------------------------------------
    
    _.fs.directoryContains(testDir + "parent/", "parent.file", function(exists){
        assert.strictEqual(exists, true);
        n++;
    });
    
    _.fs.directoryContains(testDir + "parent/", "parent.file", false, function(exists){
        assert.strictEqual(exists, true);
        n++;
    });
    
    _.fs.directoryContains(testDir + "parent/", "parent.file", true, function(exists){
        assert.strictEqual(exists, true);
        n++;
    });
    
    _.fs.directoryContains(testDir + "parent/", "Parent.file", true, function(exists){
        assert.strictEqual(exists, false);
        n++;
    });
    
    _.fs.directoryContains(testDir + "parent/", "Parent.file", false, function(exists){
        assert.strictEqual(exists, true);
        n++;
    });
    
    _.fs.directoryContains(testDir + "parent/", "parent.file.doesnotexist", function(exists){
        assert.strictEqual(exists, false);
        n++;
    });
    
    _.fs.directoryContains(testDir + "parent/", "parent.file.doesnotexist", false, function(exists){
        assert.strictEqual(exists, false);
        n++;
    });
    
    _.fs.directoryContains(testDir + "parent/", "parent.file.doesnotexist", true, function(exists){
        assert.strictEqual(exists, false);
        n++;
    });
    
    _.fs.directoryContains(testDir + "parent/", "Parent.file.doesnotexist", true, function(exists){
        assert.strictEqual(exists, false);
        n++;
    });
    
    _.fs.directoryContains(testDir + "parent/", "parent.file.doesnotexist", false, function(exists){
        assert.strictEqual(exists, false);
        n++;
    });
    
    beforeExit(function(){ assert.equal(10, n); });
    
}

function testFindFileInParents(beforeExit){
    var n = 0;
        
    assert.strictEqual(testDir + "parent", _.fs.findFileInParents(testDir + "parent/child/child.directory/", "parent.file"));
    
    assert.strictEqual("", _.fs.findFileInParents(testDir + "parent/child/child.directory/", "parent.file.doesnotexist"));
        
    try{
        assert.strictEqual("", _.fs.findFileInParents(testDir + "parent/child/child.directory/doesntexist/", "parent.file.doesnotexist"));
    }catch(e){
        n++;
    }
    
    _.fs.findFileInParents(testDir + "parent/child/child.directory/doesntexist/", "parent.file", function(path){
        assert.strictEqual(testDir + "parent/", path);
        n++;
    });
        
    _.fs.findFileInParents(testDir + "parent/child/child.directory/", "parent.file", function(path){
        assert.strictEqual(testDir + "parent/", path);
        n++;
    });
    
    _.fs.findFileInParents(testDir + "parent/child/child.directory/", "parent.file.doesnotexist", function(path){
        assert.strictEqual(path, "");
        n++;
    });
    
    beforeExit(function(){ assert.equal(4, n); });
}

function testFindDirectoryInChildren(beforeExit){

    var n = 0;
    
    assert.deepEqual([testDir + "parent", testDir + "parent/child/child.directory/parent"], _.fs.findDirectoryInChildren(testDir, "parent"));
    
    _.fs.findDirectoryInChildren(testDir, "parent", function(dirs){
        assert.deepEqual([testDir + "parent", testDir + "parent/child/child.directory/parent"], dirs);
        n++;
    });
    
    assert.deepEqual([], _.fs.findDirectoryInChildren(testDir, "doesnotexist"));
    
    _.fs.findDirectoryInChildren(testDir, "doesnotexist", function(dirs){
        assert.deepEqual([], dirs);
        n++;
    });
        
    beforeExit(function(){ assert.equal(2, n); });
    
}

function testFileExists(beforeExit){
    var n = 0;
    
    assert.strictEqual(true, _.fs.fileExists(testDir + "parent/parent.file"));
    assert.strictEqual(false, _.fs.fileExists(testDir + "parent"));
    
    assert.strictEqual(false, _.fs.fileExists(testDir + "parent/parent.file.doesnotexist"));
    
    _.fs.fileExists(testDir + "parent/parent.file", function(exists){
        assert.strictEqual(true, exists);
        n++;
    });
    
    _.fs.fileExists(testDir + "parent", function(exists){
        assert.strictEqual(false, exists);
        n++;
    });

    
    _.fs.fileExists(testDir + "parent/parent.file.doesnotexist", function(exists){
        assert.strictEqual(false, exists);
        n++;
    });
    
    beforeExit(function(){ assert.equal(3, n); });
}


function testDirExists(beforeExit){

    var n = 0;

    assert.strictEqual(true, _.fs.directoryExists(testDir + "parent"));
    assert.strictEqual(false, _.fs.directoryExists(testDir + "parent/parent.file"));
    assert.strictEqual(false, _.fs.directoryExists(testDir + "parent/parent.file.doesnotexist"));
    
    _.fs.directoryExists(testDir + "parent", function(exists){
        assert.strictEqual(true, exists);
        n++;
    });
    
    _.fs.directoryExists(testDir + "parent/parent.file", function(exists){
        assert.strictEqual(false, exists);
        n++;
    });
    
    _.fs.directoryExists(testDir + "parent/parent.file.doesnotexist", function(exists){
        assert.strictEqual(false, exists);
        n++;
    });
    
    beforeExit(function(){ assert.equal(3, n); });
}

function testGetFileAndFolderNames(beforeExit){
    var n = 0;

    assert.deepEqual(['child', 'empty', 'parent.file'], _.fs.getFileAndFolderNames(testDir + "parent"));
    try{
        assert.deepEqual([], _.fs.getFileAndFolderNames(testDir + "parent/parent.file"));
    }catch(e){
        n++;
    }
    try{
        assert.deepEqual([], _.fs.getFileAndFolderNames(testDir + "parent/parent.file.doesnotexist"));
    }catch(e){
        n++;
    }
    
    _.fs.getFileAndFolderNames(testDir + "parent", function(names){
        assert.deepEqual(['child', 'empty', 'parent.file'], names);
        n++;
    });
    
    _.fs.getFileAndFolderNames(testDir + "parent/parent.file", function(names){
        assert.deepEqual([], names);
        n++;
    });
    
    _.fs.getFileAndFolderNames(testDir + "parent/parent.file.doesnotexist", function(names){
        assert.deepEqual([], names);
        n++;
    });
    
    beforeExit(function(){ assert.equal(5, n); });

}

function testGetFilesAndFolders(beforeExit){
    var n = 0;

    assert.deepEqual([testDir + 'parent/' + 'parent.file', testDir + 'parent/' + 'child', testDir + 'parent/' +'empty'], _.fs.getFilesAndFolders(testDir + "parent"));
    try{
        assert.deepEqual([], _.fs.getFilesAndFolders(testDir + "parent/parent.file"));
    }catch(e){
        n++;
    }
    try{
        assert.deepEqual([], _.fs.getFilesAndFolders(testDir + "parent/parent.file.doesnotexist"));
    }catch(e){
        n++;
    }
    
    _.fs.getFilesAndFolders(testDir + "parent", function(names){
        assert.deepEqual([testDir + 'parent/' + 'parent.file', testDir + 'parent/' + 'child', testDir + 'parent/' +'empty'], names);
        n++;
    });
    
    _.fs.getFilesAndFolders(testDir + "parent/parent.file", function(names){
        assert.deepEqual([], names);
        n++;
    });
    
    _.fs.getFilesAndFolders(testDir + "parent/parent.file.doesnotexist", function(names){
        assert.deepEqual([], names);
        n++;
    });
    
    beforeExit(function(){ assert.equal(5, n); });
}

function testMakeRemoveTree(beforeExit){
    var n = 0;

    _.fs.removeTree(testDir + 'sync');
    _.fs.removeTree(testDir + 'async');
    n++;

    _.fs.makeTree(testDir + 'sync/make/tree/');
    assert.strictEqual(true, _.fs.exists(testDir + 'sync/make/tree/'));

    _.fs.removeTree(testDir + 'sync');
    assert.strictEqual(false, _.fs.exists(testDir + 'sync'));    

    _.fs.makeTree(testDir + 'async/make/tree/', function(){
        _.fs.removeTree(testDir + 'async', function(){
            assert.strictEqual(false, _.fs.exists(testDir + 'async'));
            n++;
        });    
    });
    
    _.fs.makeTree(testDir + 'parent/child/', function(){
        n++;
    });
    
    
    beforeExit(function(){ assert.equal(3, n); });
    
}

function testGetDirectories(beforeExit){
    var n = 0;

    assert.deepEqual([testDir + 'parent/' + 'child', testDir + 'parent/' + 'empty'], _.fs.getDirectories(testDir + "parent"));
    try{
        assert.deepEqual([], _.fs.getDirectories(testDir + "parent/parent.file"));
    }catch(e){
        n++;
    }
    try{
        assert.deepEqual([], _.fs.getDirectories(testDir + "parent/parent.file.doesnotexist"));
    }catch(e){
        n++;
    }
    
    _.fs.getDirectories(testDir + "parent", function(names){
        assert.deepEqual([testDir + 'parent/' + 'child', testDir + 'parent/' + 'empty'], names);
        n++;
    });
    
    _.fs.getDirectories(testDir + "parent/parent.file", function(names){
        assert.deepEqual([], names);
        n++;
    });
    
    _.fs.getDirectories(testDir + "parent/parent.file.doesnotexist", function(names){
        assert.deepEqual([], names);
        n++;
    });
    
    beforeExit(function(){ assert.equal(5, n); });
}

function testGetDirectoryNames(beforeExit){
    var n = 0;
    
    assert.deepEqual(['child', 'empty'], _.fs.getDirectoryNames(testDir + "parent"));
    try{
        assert.deepEqual([], _.fs.getDirectoryNames(testDir + "parent/parent.file"));
    }catch(e){
        n++;
    }
    try{
        assert.deepEqual([], _.fs.getDirectoryNames(testDir + "parent/parent.file.doesnotexist"));
    }catch(e){
        n++;
    }
    
    _.fs.getDirectoryNames(testDir + "parent", function(names){
        assert.deepEqual(['child', 'empty'], names);
        n++;
    });
    
    _.fs.getDirectoryNames(testDir + "parent/parent.file", function(names){
        assert.deepEqual([], names);
        n++;
    });
    
    _.fs.getDirectoryNames(testDir + "parent/parent.file.doesnotexist", function(names){
        assert.deepEqual([], names);
        n++;
    });
    
    beforeExit(function(){ assert.equal(5, n); });
}

function testGetFileNames(beforeExit){
    var n = 0;

    assert.deepEqual(['parent.file'], _.fs.getFileNames(testDir + "parent"));
    try{
        assert.deepEqual([], _.fs.getFileNames(testDir + "parent/parent.file"));
    }catch(e){
        n++;
    }
    try{
        assert.deepEqual([], _.fs.getFileNames(testDir + "parent/parent.file.doesnotexist"));
    }catch(e){
        n++;
    }
    
    _.fs.getFileNames(testDir + "parent", function(names){
        assert.deepEqual(['parent.file'], names);
        n++;
    });
    
    _.fs.getFileNames(testDir + "parent/parent.file", function(names){
        assert.deepEqual([], names);
        n++;
    });
    
    _.fs.getFileNames(testDir + "parent/parent.file.doesnotexist", function(names){
        assert.deepEqual([], names);
        n++;
    });
    
    beforeExit(function(){ assert.equal(5, n); });
}

function testGetFiles(beforeExit){
    
    var n = 0;

    assert.deepEqual([testDir + 'parent/parent.file'], _.fs.getFiles(testDir + "parent"));
    
    try{
        assert.deepEqual([], _.fs.getFiles(testDir + "parent/parent.file"));
    }catch(e){
        n++;
    }
    try{
        assert.deepEqual([], _.fs.getFiles(testDir + "parent/parent.file.doesnotexist"));
    }catch(e){
        n++;
    }
    
    _.fs.getFiles(testDir + "parent", function(names){
        assert.deepEqual([testDir + 'parent/parent.file'], names);
        n++;
    });
    
    _.fs.getFiles(testDir + "parent/parent.file", function(names){
        assert.deepEqual([], names);
        n++;
    });
    
    _.fs.getFiles(testDir + "parent/parent.file.doesnotexist", function(names){
        assert.deepEqual([], names);
        n++;
    });
    
    beforeExit(function(){ assert.equal(5, n); });
    
}

function walkTest(beforeExit){

    /*
    ./parent
    ./parent/child
    ./parent/child/child.directory
    ./parent/child/child.directory/child.directory.file
    ./parent/child/child.directory/parent
    ./parent/child/child.directory/parent/.keep
    ./parent/child/child.file
    ./parent/empty
    ./parent/parent.file
    */
    
    var n = 0;

    var relativePaths = [
        './parent',
        './parent/child',
        './parent/child/child.directory',
        './parent/child/child.directory/child.directory.file',
        './parent/child/child.directory/parent',
        './parent/child/child.directory/parent/.keep',
        './parent/child/child.file',
        './parent/empty',
        './parent/parent.file'
    ];

    var expectedPaths = _.map(relativePaths, function(val){ return(_.fs.path.normalize(testDir + val)); });
    var foundPaths = []; 

    _.fs.walk(testDir, function onFile(fileName, filePath){
        //console.log("file name: '" + fileName + "'");
        //console.log("file path: '" + filePath + "'");
        foundPaths.push(filePath);
    }, function onDir(dirName, dirPath){
        if(dirName == "mvtest" || dirName == "async"){ return(false); }
        //console.log("dir name: '" + dirName + "'");
        //console.log("dir path: '" + dirPath + "'");
        foundPaths.push(dirPath);
    });

    _.each(expectedPaths, function(val){
        assert.deepEqual([val], _.filter(foundPaths, function(found){ return(found === val); }));
        foundPaths = _.reject(foundPaths, function(found){ return(found === val); });
    });

    assert.equal(foundPaths.length, 0);


    //_.time('fs.walk');
    _.fs.walk(testDir, function onFile(fileName, filePath, next){
        //console.log("file name: '" + fileName + "'");
        //console.log("file path: '" + filePath + "'");
        foundPaths.push(filePath);
        next();
    }, function onDir(dirName, dirPath, next){
        if(dirName == "mvtest" || dirName == "async"){ return next(false); }
        //console.log("dir name: '" + dirName + "'");
        //console.log("dir path: '" + dirPath + "'");
        foundPaths.push(dirPath);
        next();
    }, function(){
        n++;

        //console.log("fs.walk: ", _.time('fs.walk'), "ms");
        _.each(expectedPaths, function(val){
            assert.deepEqual([val], _.filter(foundPaths, function(found){ return(found === val); }));
            foundPaths = _.reject(foundPaths, function(found){ return(found === val); });
        });

        assert.equal(foundPaths.length, 0);
    });

    beforeExit(function(){ assert.equal(1, n); });
}

function findTest(beforeExit){

    /*
    ./parent
    ./parent/child
    ./parent/child/child.directory
    ./parent/child/child.directory/child.directory.file
    ./parent/child/child.directory/parent
    ./parent/child/child.directory/parent/.keep
    ./parent/child/child.file
    ./parent/empty
    ./parent/parent.file
    */
    
    var n = 0;

    var relativePaths = [
        //'./parent',
        //'./parent/child',
        //'./parent/child/child.directory',
        './parent/child/child.directory/child.directory.file',
        //'./parent/child/child.directory/parent',
        //'./parent/child/child.directory/parent/.keep',
        './parent/child/child.file',
        //'./parent/empty',
        './parent/parent.file'
    ];

    var expectedPaths = _.map(relativePaths, function(val){ return(_.fs.path.normalize(testDir + val)); });
    var foundPaths = []; 

    var foundPaths = _.fs.find(testDir, "*.file");

    _.each(expectedPaths, function(val){
        assert.deepEqual([val], _.filter(foundPaths, function(found){ return(found === val); }));
        foundPaths = _.reject(foundPaths, function(found){ return(found === val); });
    });

    assert.equal(foundPaths.length, 0);

    foundPaths = _.fs.find(testDir, { pattern: "*.file", prune: function(dirName){ return(dirName === 'child'); } });

    var prunedExpected = [_.fs.path.normalize(testDir + './parent/parent.file')];

    _.each(prunedExpected, function(val){
        assert.deepEqual([val], _.filter(foundPaths, function(found){ return(found === val); }));
        foundPaths = _.reject(foundPaths, function(found){ return(found === val); });
    });

    assert.equal(foundPaths.length, 0);


    //_.time('fs.find');
    _.fs.find(testDir, "*.file", function(foundFiles){
        n++;

        //console.log("fs.find: ", _.time('fs.find'), "ms");

        _.each(expectedPaths, function(val){
            assert.deepEqual([val], _.filter(foundFiles, function(found){ return(found === val); }));
            foundFiles = _.reject(foundFiles, function(found){ return(found === val); });
        });

        assert.equal(foundFiles.length, 0);
    });

    beforeExit(function(){ assert.equal(1, n); });
}

function testAddSlash(){
    assert.strictEqual("", _.fs.addSlash(""));
    assert.strictEqual("/hello/", _.fs.addSlash("/hello"));
    assert.strictEqual("/hello/", _.fs.addSlash("/hello/"));
    assert.strictEqual("/test/test/", _.fs.addSlash("/test/test"));
}

function testRemoveSlash(){
    assert.strictEqual("", _.fs.removeSlash(""));
    assert.strictEqual("/hello", _.fs.removeSlash("/hello"));
    assert.strictEqual("/hello", _.fs.removeSlash("/hello/"));
    assert.strictEqual("/test/test", _.fs.removeSlash("/test/test/"));
}

function testGetFileName(){
    assert.strictEqual("", _.fs.getFileName("/dir/dir/dir/"));
    assert.strictEqual("test", _.fs.getFileName("/dir/dir/dir/test"));
    assert.strictEqual("", _.fs.getFileName(""));
}

