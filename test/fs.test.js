
var path = require('path');
var assert = require('assert');
var fs = require('fs');

var _ = require('../');
var join = _.paths.join;
var eq = _.test.eq;
var ok = _.test.ok;

var testDir = path.normalize(__dirname + "/data/");

exports.testMTime = testMTime;

exports.testIsDirectory = testIsDirectory;
exports.testIsFile = testIsFile;
exports.testFileExists = testFileExists;
exports.testDirExists = testDirExists;
exports.testMoveFiles = testMoveFiles;
exports.testReadFile = testReadFile;
exports.testIsDirectoryEmpty = testIsDirectoryEmpty;
exports.testDirectoryContains = testDirectoryContains;
exports.testFindFileInParents = testFindFileInParents;
exports.testReadDir = testReadDir;
exports.testMakeRemoveTree = testMakeRemoveTree;
exports.testDirectories = testDirectories;
exports.testFiles = testFiles;
exports.walkTest = walkTest;
exports.findTest = findTest;

function testMTime(){
    _.fs.modificationTime(testDir + '/parent/parent.file', function(err, mtime){
        ok(!err);
        ok(mtime);
    });
}

function testIsDirectory(beforeExit){

    var called = 0;

    eq(_.fs.isDirectory.sync(join(testDir, 'parent')), true);
    eq(_.fs.isDirectory.sync(join(testDir, 'does-not-exist')), false);
    eq(_.fs.isDirectory.sync(join(testDir, 'parent/child/child.file')), false);

    _.fs.isDirectory(join(testDir, 'parent'), function(err, isDir){
        if(err){ throw(err); }
        eq(isDir, true);
        called++;
    })

    _.fs.isDirectory(join(testDir, 'parent/child/child.file'), function(err, isDir){
        if(err){ throw(err); }
        eq(isDir, false);
        called++;
    })
 
    _.fs.isDirectory(join(testDir, 'does-not-exist'), function(err, isDir){
        if(err){ throw(err); }
        eq(isDir, false);
        called++;
    })
 
    beforeExit(function(){ eq(called, 3); });
}

function testIsFile(beforeExit){

    var called = 0;

    eq(_.fs.isFile.sync(join(testDir, 'parent')), false);
    eq(_.fs.isFile.sync(join(testDir, 'does-not-exist')), false);
    eq(_.fs.isFile.sync(join(testDir, 'parent/child/child.file')), true);

    _.fs.isFile(join(testDir, 'parent'), function(err, isFile){
        if(err){ throw(err); }
        eq(isFile, false);
        called++;
    })

    _.fs.isFile(join(testDir, 'parent/child/child.file'), function(err, isFile){
        if(err){ throw(err); }
        eq(isFile, true);
        called++;
    })
 
    _.fs.isFile(join(testDir, 'does-not-exist'), function(err, isFile){
        if(err){ throw(err); }
        eq(isFile, false);
        called++;
    })
 
    beforeExit(function(){ eq(called, 3); });
}

function testMoveFiles(beforeExit){
    var n = 0;
    
    var fileArray = [testDir + 'mv1.txt', testDir + 'mv2.txt', testDir + 'mv3.txt'];
    
    var mvArray = [];
    for(var i = 0; i < fileArray.length; i++){
        fs.writeFileSync(fileArray[i], fileArray[i]);
        mvArray.push({src : fileArray[i], dest : testDir + 'mvtest/' + path.basename(fileArray[i])})
    }
    
    _.fs.moveFiles(mvArray, function(){
        for(i = 0; i < mvArray.length; i++){
            eq(false, _.fs.fileExists.sync(mvArray[i].src));
            eq(fileArray[i], _.fs.readFile.sync(mvArray[i].dest, true));
        }
        n++;
    });
    
    beforeExit(function(){ assert.equal(1, n); });
}

function testReadFile(beforeExit){

    var n = 0;
    
    eq("parent.file.text", _.fs.readFile.sync(testDir + "parent/parent.file"));
    
    try{
        eq("parent.file.text", _.fs.readFile.sync(testDir + "parent/parent.file.doesnotexist"));
    }catch(e){
        n++;
    }
    
    _.fs.readFile(testDir + "parent/parent.file", function(err, text){
        eq(err, null);
        eq("parent.file.text", text);
        n++;
    }, true);
    
    _.fs.readFile(testDir + "parent/parent.file.doesnotexist", function(err, text){
        ok(err);
        n++;
    }, true);
    
    beforeExit(function(){ assert.equal(3, n); });
}

function testIsDirectoryEmpty(beforeExit){

    _.fs.makeTree.sync(testDir + 'parent/empty/');

    var n = 0;
    
    eq(false, _.fs.isDirectoryEmpty.sync(testDir + "parent/"));
    
    eq(true, _.fs.isDirectoryEmpty.sync(testDir + "parent/empty/"));
    
    try{
        _.fs.isDirectoryEmpty.sync(testDir + "parent/empty/doesntexist");
    }catch(e){n++;}

    _.fs.isDirectoryEmpty(testDir + "parent/doesntexist", function(err, empty){
        ok(err);
        ok(!empty);
        n++;
    });
    
    _.fs.isDirectoryEmpty(testDir + "parent/", function(err, empty){
        eq(empty, false);
        n++;
    });
    
    _.fs.isDirectoryEmpty(testDir + "parent/empty/", function(err, empty){
        eq(empty, true);
        n++;
    });
    
    beforeExit(function(){ assert.equal(4, n); });
    
}

function testDirectoryContains(beforeExit){

    var n = 0;
    
    eq(_.fs.directoryContains.sync(testDir + "parent/", "parent.file"), true);
    eq(_.fs.directoryContains.sync(testDir + "parent/", "parent.file", false), true);
    eq(_.fs.directoryContains.sync(testDir + "parent/", "parent.file", true), true);
    eq(_.fs.directoryContains.sync(testDir + "parent/", "Parent.file", true), false);
    eq(_.fs.directoryContains.sync(testDir + "parent/", "Parent.file", false), true);
    eq(_.fs.directoryContains.sync(testDir + "parent/", "parent.file.doesnotexist"), false);
    eq(_.fs.directoryContains.sync(testDir + "parent/", "parent.file.doesnotexist", false), false);
    eq(_.fs.directoryContains.sync(testDir + "parent/", "parent.file.doesnotexist", true), false);
    eq(_.fs.directoryContains.sync(testDir + "parent/", "Parent.file.doesnotexist", true), false);
    eq(_.fs.directoryContains.sync(testDir + "parent/", "parent.file.doesnotexist", false), false);
    
    // --------------------------------------
    
    _.fs.directoryContains(testDir + "parent/", "parent.file", function(err, exists){
        ok(!err);
        eq(exists, true);
        n++;
    });
    
    _.fs.directoryContains(testDir + "parent/", "parent.file", false, function(err, exists){
        ok(!err);
        eq(exists, true);
        n++;
    });
    
    _.fs.directoryContains(testDir + "parent/", "parent.file", true, function(err, exists){
        ok(!err);
        eq(exists, true);
        n++;
    });
    
    _.fs.directoryContains(testDir + "parent/", "Parent.file", true, function(err, exists){
        ok(!err);
        eq(exists, false);
        n++;
    });
    
    _.fs.directoryContains(testDir + "parent/", "Parent.file", false, function(err, exists){
        ok(!err);
        eq(exists, true);
        n++;
    });
    
    _.fs.directoryContains(testDir + "parent/", "parent.file.doesnotexist", function(err, exists){
        eq(exists, false);
        ok(!err);
        n++;
    });
    
    _.fs.directoryContains(testDir + "parent/", "parent.file.doesnotexist", false, function(err, exists){
        eq(exists, false);
        ok(!err);
        n++;
    });
    
    _.fs.directoryContains(testDir + "parent/", "parent.file.doesnotexist", true, function(err, exists){
        eq(exists, false);
        ok(!err);
        n++;
    });
    
    _.fs.directoryContains(testDir + "parent/", "Parent.file.doesnotexist", true, function(err, exists){
        eq(exists, false);
        ok(!err);
        n++;
    });
    
    _.fs.directoryContains(testDir + "parent/", "parent.file.doesnotexist", false, function(err, exists){
        eq(exists, false);
        ok(!err);
        n++;
    });
    
    beforeExit(function(){ assert.equal(10, n); });
    
}

function testFindFileInParents(beforeExit){
    var n = 0;
        
    eq(testDir + "parent", _.fs.findFileInParents.sync(testDir + "parent/child/child.directory/", "parent.file"));
    
    eq("", _.fs.findFileInParents.sync(testDir + "parent/child/child.directory/", "parent.file.doesnotexist"));
        
    try{
        eq("", _.fs.findFileInParents.sync(testDir + "parent/child/child.directory/doesntexist/", "parent.file.doesnotexist"));
    }catch(e){
        n++;
    }
    
    _.fs.findFileInParents(testDir + "parent/child/child.directory/doesntexist/", "parent.file", function(err, path){
        ok(err);
        eq(undefined, path);
        n++;
    });
        
    _.fs.findFileInParents(testDir + "parent/child/child.directory/", "parent.file", function(err, path){
        ok(!err);
        eq(testDir + "parent/", path);
        n++;
    });
    
    _.fs.findFileInParents(testDir + "parent/child/child.directory/", "parent.file.doesnotexist", function(err, path){
        ok(!err);
        eq(path, "");
        n++;
    });
    
    beforeExit(function(){ assert.equal(4, n); });
}

function testFileExists(beforeExit){
    var n = 0;
    
    eq(true, _.fs.fileExists.sync(testDir + "parent/parent.file"));
    eq(false, _.fs.fileExists.sync(testDir + "parent"));
    eq(false, _.fs.fileExists.sync(testDir + "parent/parent.file.doesnotexist"));
    
    _.fs.fileExists(testDir + "parent/parent.file", function(err, exists){
        ok(!err);
        eq(true, exists);
        n++;
    });
    
    _.fs.fileExists(testDir + "parent", function(err, exists){
        ok(!err);
        eq(false, exists);
        n++;
    });

    
    _.fs.fileExists(testDir + "parent/parent.file.doesnotexist", function(err, exists){
        ok(!err);
        eq(false, exists);
        n++;
    });
    
    beforeExit(function(){ assert.equal(3, n); });
}


function testDirExists(beforeExit){

    var n = 0;

    eq(true, _.fs.directoryExists.sync(testDir + "parent"));
    eq(false, _.fs.directoryExists.sync(testDir + "parent/parent.file"));
    eq(false, _.fs.directoryExists.sync(testDir + "parent/parent.file.doesnotexist"));
    
    _.fs.directoryExists(testDir + "parent", function(err, exists){
        ok(!err);
        eq(true, exists);
        n++;
    });
    
    _.fs.directoryExists(testDir + "parent/parent.file", function(err, exists){
        ok(!err);
        eq(false, exists);
        n++;
    });
    
    _.fs.directoryExists(testDir + "parent/parent.file.doesnotexist", function(err, exists){
        ok(!err);
        eq(false, exists);
        n++;
    });
    
    beforeExit(function(){ assert.equal(3, n); });
}

function testReadDir(beforeExit){
    var n = 0;

    eq(['child', 'empty', 'parent.file'], _.fs.readDir.sync(testDir + "parent"));
    try{
        eq([], _.fs.readDir.sync(testDir + "parent/parent.file"));
    }catch(e){
        n++;
    }
    try{
        eq([], _.fs.readDir.sync(testDir + "parent/parent.file.doesnotexist"));
    }catch(e){
        n++;
    }
    
    _.fs.readDir(testDir + "parent", function(err, names){
        ok(!err);
        eq(['child', 'empty', 'parent.file'], names);
        n++;
    });
    
    _.fs.readDir(testDir + "parent/parent.file", function(err, names){
        ok(err);
        eq(undefined, names);
        n++;
    });
    
    _.fs.readDir(testDir + "parent/parent.file.doesnotexist", function(err, names){
        ok(err);
        eq(undefined, names);
        n++;
    });
    
    eq([],
        _.difference(
            [testDir + 'parent/' + 'parent.file', testDir + 'parent/' + 'child', testDir + 'parent/' + 'empty'], 
            _.fs.readDir.sync(testDir + "parent", { fullPath: true })
        )
    );
    try{
        eq([], _.fs.readDir.sync(testDir + "parent/parent.file", { fullPath: true }));
    }catch(e){
        n++;
    }
    try{
        eq([], _.fs.readDir.sync(testDir + "parent/parent.file.doesnotexist", { fullPath: true }));
    }catch(e){
        n++;
    }
    
    _.fs.readDir(testDir + "parent", { fullPath: true }, function(err, names){
        ok(!err);
        eq([], _.difference([testDir + 'parent/' + 'parent.file', testDir + 'parent/' + 'child', testDir + 'parent/' +'empty'], names));
        n++;
    });
    
    _.fs.readDir(testDir + "parent/parent.file", { fullPath: true }, function(err, names){
        ok(err);
        eq(undefined, names);
        n++;
    });
    
    _.fs.readDir(testDir + "parent/parent.file.doesnotexist", { fullPath: true }, function(err, names){
        ok(_.ecode.noEnt(err));
        eq(undefined, names);
        n++;
    });

    beforeExit(function(){ assert.equal(10, n); });

}

function testMakeRemoveTree(beforeExit){
    var n = 0;

    _.fs.removeTree.sync(testDir + 'sync');
    _.fs.removeTree.sync(testDir + 'async');
    n++;

    _.fs.makeTree.sync(testDir + 'sync/make/tree/');
    eq(true, _.fs.exists.sync(testDir + 'sync/make/tree/'));

    _.fs.removeTree.sync(testDir + 'sync');
    eq(false, _.fs.exists.sync(testDir + 'sync'));    

    _.fs.makeTree(testDir + 'async/make/tree/', function(err){
        eq(true, _.fs.exists.sync(testDir + 'async/make/tree'));
        ok(!err);
        _.fs.removeTree(testDir + 'async', function(err){
            ok(!err);
            eq(false, _.fs.exists.sync(testDir + 'async'));
            n++;
        });    
    });
    
    _.fs.makeTree(testDir + 'parent/child/', function(err){
        ok(!err);
        n++;
    });
    
    
    beforeExit(function(){ assert.equal(3, n); });
    
}

function testDirectories(beforeExit){
    var n = 0;

    eq([], _.difference([testDir + 'parent/' + 'child', testDir + 'parent/' + 'empty'], _.fs.directories.sync(testDir + "parent")));
    try{
        eq([], _.fs.directories.sync(testDir + "parent/parent.file"));
    }catch(e){
        n++;
    }
    try{
        eq([], _.fs.directories.sync(testDir + "parent/parent.file.doesnotexist"));
    }catch(e){
        n++;
    }
    
    _.fs.directories(testDir + "parent", function(err, names){
        ok(!err);
        eq([], _.difference([testDir + 'parent/' + 'child', testDir + 'parent/' + 'empty'], names));
        n++;
    });
    
    _.fs.directories(testDir + "parent/parent.file", function(err, names){
        ok(_.ecode.notDir(err));
        eq(undefined, names);
        n++;
    });
    
    _.fs.directories(testDir + "parent/parent.file.doesnotexist", function(err, names){
        ok(_.ecode.noEnt(err));
        eq(undefined, names);
        n++;
    });
    
    
    eq(['child', 'empty'], _.fs.directories.sync(testDir + "parent", false));
    try{
        eq([], _.fs.directories.sync(testDir + "parent/parent.file", false));
    }catch(e){
        n++;
    }
    try{
        eq([], _.fs.directories.sync(testDir + "parent/parent.file.doesnotexist", false));
    }catch(e){
        n++;
    }
    
    _.fs.directories(testDir + "parent", function(err, names){
        ok(!err);
        eq(['child', 'empty'], names);
        n++;
    }, false);
    
    _.fs.directories(testDir + "parent/parent.file", function(err, names){
        ok(_.ecode.notDir(err));
        eq(undefined, names);
        n++;
    }, false);
    
    _.fs.directories(testDir + "parent/parent.file.doesnotexist", function(err, names){
        ok(_.ecode.noEnt(err));
        eq(undefined, names);
        n++;
    }, false);
 
    beforeExit(function(){ assert.equal(10, n); });
}

function testFiles(beforeExit){
    var n = 0;

    eq([testDir + 'parent/parent.file'], _.fs.files.sync(testDir + "parent"));
    
    try{
        eq([], _.fs.files.sync(testDir + "parent/parent.file"));
    }catch(e){
        n++;
    }
    try{
        eq([], _.fs.files.sync(testDir + "parent/parent.file.doesnotexist"));
    }catch(e){
        n++;
    }
    
    _.fs.files(testDir + "parent", function(err, names){
        ok(!err);
        eq([testDir + 'parent/parent.file'], names);
        n++;
    });
    
    _.fs.files(testDir + "parent/parent.file", function(err, names){
        ok(_.ecode.notDir(err));
        eq(undefined, names);
        n++;
    });
    
    _.fs.files(testDir + "parent/parent.file.doesnotexist", function(err, names){
        ok(_.ecode.noEnt(err));
        eq(undefined, names);
        n++;
    });
 
    eq(['parent.file'], _.fs.files.sync(testDir + "parent", false));
    try{
        eq([], _.fs.files.sync(testDir + "parent/parent.file", false));
    }catch(e){
        n++;
    }
    try{
        eq([], _.fs.files.sync(testDir + "parent/parent.file.doesnotexist", false));
    }catch(e){
        n++;
    }
    
    _.fs.files(testDir + "parent", function(err, names){
        ok(!err);
        eq(['parent.file'], names);
        n++;
    }, false);
    
    _.fs.files(testDir + "parent/parent.file", function(err, names){
        ok(_.ecode.notDir(err));
        eq(undefined, names);
        n++;
    }, false);
    
    _.fs.files(testDir + "parent/parent.file.doesnotexist", function(err, names){
        ok(_.ecode.noEnt(err));
        eq(undefined, names);
        n++;
    }, false);
    
    beforeExit(function(){ assert.equal(10, n); });
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

    var expectedPaths = _.map(relativePaths, function(val){ return(_.paths.normalize(testDir + val)); });
    var foundPaths = []; 

    _.fs.walk.sync(testDir, function onFile(fileName, filePath){
        //console.log("file name: '" + fileName + "'");
        //console.log("file path: '" + filePath + "'");
        if(fileName == "mv1.txt" || fileName == "mv2.txt" || fileName == "mv3.txt"){ return(false); }
        foundPaths.push(filePath);
    }, function onDir(dirName, dirPath){
        if(dirName == "mvtest" || dirName == "async"){ return(false); }
        //console.log("dir name: '" + dirName + "'");
        //console.log("dir path: '" + dirPath + "'");
        foundPaths.push(dirPath);
    });

    _.each(expectedPaths, function(val){
        eq([val], _.filter(foundPaths, function(found){ return(found === val); }));
        foundPaths = _.reject(foundPaths, function(found){ return(found === val); });
    });

    eq(foundPaths.length, 0);


    //_.time('fs.walk');
    _.fs.walk(testDir, function onFile(fileName, filePath, next){
        //console.log("file name: '" + fileName + "'");
        //console.log("file path: '" + filePath + "'");
        if(fileName == "mv1.txt" || fileName == "mv2.txt" || fileName == "mv3.txt"){ return next(false); }
        foundPaths.push(filePath);
        next();
    }, function onDir(dirName, dirPath, next){
        if(dirName == "mvtest" || dirName == "async"){ return next(false); }
        //console.log("dir name: '" + dirName + "'");
        //console.log("dir path: '" + dirPath + "'");
        foundPaths.push(dirPath);
        next();
    }, function(err){
        if(err){ throw(err); }
        n++;

        //console.log("fs.walk: ", _.time('fs.walk'), "ms");
        _.each(expectedPaths, function(val){
            eq([val], _.filter(foundPaths, function(found){ return(found === val); }));
            foundPaths = _.reject(foundPaths, function(found){ return(found === val); });
        });
        eq(foundPaths.length, 0);
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

    var expectedPaths = _.map(relativePaths, function(val){ return(_.paths.normalize(testDir + val)); });
    var foundPaths = []; 

    var foundPaths = _.fs.find.sync(testDir, "*.file");

    _.each(expectedPaths, function(val){
        eq([val], _.filter(foundPaths, function(found){ return(found === val); }));
        foundPaths = _.reject(foundPaths, function(found){ return(found === val); });
    });

    assert.equal(foundPaths.length, 0);

    foundPaths = _.fs.find.sync(testDir, { pattern: "*.file", prune: function(dirName){ return(dirName === 'child'); } });

    var prunedExpected = [_.paths.normalize(testDir + './parent/parent.file')];

    _.each(prunedExpected, function(val){
        eq([val], _.filter(foundPaths, function(found){ return(found === val); }));
        foundPaths = _.reject(foundPaths, function(found){ return(found === val); });
    });

    assert.equal(foundPaths.length, 0);


    //_.time('fs.find');
    _.fs.find(testDir, "*.file", function(err, foundFiles){
        n++;

        //console.log("fs.find: ", _.time('fs.find'), "ms");

        _.each(expectedPaths, function(val){
            eq([val], _.filter(foundFiles, function(found){ return(found === val); }));
            foundFiles = _.reject(foundFiles, function(found){ return(found === val); });
        });

        assert.equal(foundFiles.length, 0);
    });

    beforeExit(function(){ assert.equal(1, n); });
}


