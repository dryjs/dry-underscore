var tame = require('tamejs').runtime;
var __tame_defer_cb = null;
var __tame_fn_0 = function (__tame_k) {
    tame.setActiveCb (__tame_defer_cb);
    var path = require ( 'path' ) ;
    var assert = require ( 'assert' ) ;
    var fs = require ( 'fs' ) ;
    
    var _ = require ( '../' ) ;
    var join = _ . path . join ;
    var eq = _ . test . eq ;
    var ok = _ . test . ok ;
    
    var testDir = path . normalize ( __dirname + "/fs-data/" ) ;
    var moduleData = _ . path . fun ( _ . path . normalize ( __dirname + "/module-data/" ) ) ;
    
    exports . testMTime = testMTime ;
    
    exports . testIsDirectory = testIsDirectory ;
    exports . testIsFile = testIsFile ;
    exports . testFileExists = testFileExists ;
    exports . testDirExists = testDirExists ;
    exports . testMoveFiles = testMoveFiles ;
    exports . testReadFile = testReadFile ;
    exports . testIsDirectoryEmpty = testIsDirectoryEmpty ;
    exports . testDirectoryContains = testDirectoryContains ;
    exports . testFindInParents = testFindInParents ;
    exports . testReadDir = testReadDir ;
    exports . testMakeRmdir = testMakeRmdir ;
    exports . testDirectories = testDirectories ;
    exports . testFiles = testFiles ;
    exports . walkTest = walkTest ;
    exports . findTest = findTest ;
    exports . testFetchModule = testFetchModule ;
    exports . testFetchModules = testFetchModules ;
    function testMTime () {
        _ . fs . modificationTime ( testDir + '/parent/parent.file' ,
        function  (err, mtime) {
            ok ( ! err ) ;
            ok ( mtime ) ;
        }
        ) ;
    }
    function testIsDirectory (beforeExit) {
        var called = 0 ;
        
        eq ( _ . fs . isDirectory . sync ( join ( testDir , 'parent' ) ) , true ) ;
        eq ( _ . fs . isDirectory . sync ( join ( testDir , 'does-not-exist' ) ) , false ) ;
        eq ( _ . fs . isDirectory . sync ( join ( testDir , 'parent/child/child.file' ) ) , false ) ;
        
        _ . fs . isDirectory ( join ( testDir , 'parent' ) ,
        function  (err, isDir) {
            if (err) {
                throw ( err ) ;
            } else {
            }
            eq ( isDir , true ) ;
            called ++ ;
        }
        )
        
        _ . fs . isDirectory ( join ( testDir , 'parent/child/child.file' ) ,
        function  (err, isDir) {
            if (err) {
                throw ( err ) ;
            } else {
            }
            eq ( isDir , false ) ;
            called ++ ;
        }
        )
        
        _ . fs . isDirectory ( join ( testDir , 'does-not-exist' ) ,
        function  (err, isDir) {
            if (err) {
                throw ( err ) ;
            } else {
            }
            eq ( isDir , false ) ;
            called ++ ;
        }
        )
        
        beforeExit (
        function  () {
            eq ( called , 3 ) ;
        }
        ) ;
    }
    function testIsFile (beforeExit) {
        var called = 0 ;
        
        eq ( _ . fs . isFile . sync ( join ( testDir , 'parent' ) ) , false ) ;
        eq ( _ . fs . isFile . sync ( join ( testDir , 'does-not-exist' ) ) , false ) ;
        eq ( _ . fs . isFile . sync ( join ( testDir , 'parent/child/child.file' ) ) , true ) ;
        
        _ . fs . isFile ( join ( testDir , 'parent' ) ,
        function  (err, isFile) {
            if (err) {
                throw ( err ) ;
            } else {
            }
            eq ( isFile , false ) ;
            called ++ ;
        }
        )
        
        _ . fs . isFile ( join ( testDir , 'parent/child/child.file' ) ,
        function  (err, isFile) {
            if (err) {
                throw ( err ) ;
            } else {
            }
            eq ( isFile , true ) ;
            called ++ ;
        }
        )
        
        _ . fs . isFile ( join ( testDir , 'does-not-exist' ) ,
        function  (err, isFile) {
            if (err) {
                throw ( err ) ;
            } else {
            }
            eq ( isFile , false ) ;
            called ++ ;
        }
        )
        
        beforeExit (
        function  () {
            eq ( called , 3 ) ;
        }
        ) ;
    }
    function testMoveFiles (beforeExit) {
        var n = 0 ;
        
        var fileArray = [ testDir + 'mv1.txt' , testDir + 'mv2.txt' , testDir + 'mv3.txt' ] ;
        
        var mvArray = [ ] ;
         for (var i = 0 ; i < fileArray . length ; i ++) {
            fs . writeFileSync ( fileArray [ i ] , fileArray [ i ] ) ;
            mvArray . push ( { src : fileArray [ i ] , dest : testDir + 'mvtest/' + path . basename ( fileArray [ i ] ) } ) ;
        }
        _ . fs . moveFiles ( mvArray ,
        function  () {
             for (i = 0 ; i < mvArray . length ; i ++) {
                eq ( false , _ . fs . fileExists . sync ( mvArray [ i ] . src ) ) ;
                eq ( fileArray [ i ] , _ . fs . readFile . sync ( mvArray [ i ] . dest , true ) ) ;
            }
            n ++ ;
        }
        ) ;
        
        beforeExit (
        function  () {
            assert . equal ( 1 , n ) ;
        }
        ) ;
    }
    function testReadFile (beforeExit) {
        var n = 0 ;
        
        eq ( "parent.file.text" , _ . fs . readFile . sync ( testDir + "parent/parent.file" ) ) ;
        try {
            eq ( "parent.file.text" , _ . fs . readFile . sync ( testDir + "parent/parent.file.doesnotexist" ) ) ;
        }
        catch (e) {
            n ++ ;
        }
        _ . fs . readFile ( testDir + "parent/parent.file" ,
        function  (err, text) {
            eq ( err , null ) ;
            eq ( "parent.file.text" , text ) ;
            n ++ ;
        }
        , true ) ;
        
        _ . fs . readFile ( testDir + "parent/parent.file.doesnotexist" ,
        function  (err, text) {
            ok ( err ) ;
            n ++ ;
        }
        , true ) ;
        
        beforeExit (
        function  () {
            assert . equal ( 3 , n ) ;
        }
        ) ;
    }
    function testIsDirectoryEmpty (beforeExit) {
        _ . fs . mkdir . sync ( testDir + 'parent/empty/' ) ;
        
        var n = 0 ;
        
        eq ( false , _ . fs . isDirectoryEmpty . sync ( testDir + "parent/" ) ) ;
        
        eq ( true , _ . fs . isDirectoryEmpty . sync ( testDir + "parent/empty/" ) ) ;
        try {
            _ . fs . isDirectoryEmpty . sync ( testDir + "parent/empty/doesntexist" ) ;
        }
        catch (e) {
            n ++ ;
        }
        _ . fs . isDirectoryEmpty ( testDir + "parent/doesntexist" ,
        function  (err, empty) {
            ok ( err ) ;
            ok ( ! empty ) ;
            n ++ ;
        }
        ) ;
        
        _ . fs . isDirectoryEmpty ( testDir + "parent/" ,
        function  (err, empty) {
            eq ( empty , false ) ;
            n ++ ;
        }
        ) ;
        
        _ . fs . isDirectoryEmpty ( testDir + "parent/empty/" ,
        function  (err, empty) {
            eq ( empty , true ) ;
            n ++ ;
        }
        ) ;
        
        beforeExit (
        function  () {
            assert . equal ( 4 , n ) ;
        }
        ) ;
    }
    function testDirectoryContains (beforeExit) {
        var n = 0 ;
        
        eq ( _ . fs . directoryContains . sync ( testDir + "parent/" , "parent.file" ) , true ) ;
        eq ( _ . fs . directoryContains . sync ( testDir + "parent/" , "parent.file" , false ) , true ) ;
        eq ( _ . fs . directoryContains . sync ( testDir + "parent/" , "parent.file" , true ) , true ) ;
        eq ( _ . fs . directoryContains . sync ( testDir + "parent/" , "Parent.file" , true ) , false ) ;
        eq ( _ . fs . directoryContains . sync ( testDir + "parent/" , "Parent.file" , false ) , true ) ;
        eq ( _ . fs . directoryContains . sync ( testDir + "parent/" , "parent.file.doesnotexist" ) , false ) ;
        eq ( _ . fs . directoryContains . sync ( testDir + "parent/" , "parent.file.doesnotexist" , false ) , false ) ;
        eq ( _ . fs . directoryContains . sync ( testDir + "parent/" , "parent.file.doesnotexist" , true ) , false ) ;
        eq ( _ . fs . directoryContains . sync ( testDir + "parent/" , "Parent.file.doesnotexist" , true ) , false ) ;
        eq ( _ . fs . directoryContains . sync ( testDir + "parent/" , "parent.file.doesnotexist" , false ) , false ) ;
        
        
        
        _ . fs . directoryContains ( testDir + "parent/" , "parent.file" ,
        function  (err, exists) {
            ok ( ! err ) ;
            eq ( exists , true ) ;
            n ++ ;
        }
        ) ;
        
        _ . fs . directoryContains ( testDir + "parent/" , "parent.file" , false ,
        function  (err, exists) {
            ok ( ! err ) ;
            eq ( exists , true ) ;
            n ++ ;
        }
        ) ;
        
        _ . fs . directoryContains ( testDir + "parent/" , "parent.file" , true ,
        function  (err, exists) {
            ok ( ! err ) ;
            eq ( exists , true ) ;
            n ++ ;
        }
        ) ;
        
        _ . fs . directoryContains ( testDir + "parent/" , "Parent.file" , true ,
        function  (err, exists) {
            ok ( ! err ) ;
            eq ( exists , false ) ;
            n ++ ;
        }
        ) ;
        
        _ . fs . directoryContains ( testDir + "parent/" , "Parent.file" , false ,
        function  (err, exists) {
            ok ( ! err ) ;
            eq ( exists , true ) ;
            n ++ ;
        }
        ) ;
        
        _ . fs . directoryContains ( testDir + "parent/" , "parent.file.doesnotexist" ,
        function  (err, exists) {
            eq ( exists , false ) ;
            ok ( ! err ) ;
            n ++ ;
        }
        ) ;
        
        _ . fs . directoryContains ( testDir + "parent/" , "parent.file.doesnotexist" , false ,
        function  (err, exists) {
            eq ( exists , false ) ;
            ok ( ! err ) ;
            n ++ ;
        }
        ) ;
        
        _ . fs . directoryContains ( testDir + "parent/" , "parent.file.doesnotexist" , true ,
        function  (err, exists) {
            eq ( exists , false ) ;
            ok ( ! err ) ;
            n ++ ;
        }
        ) ;
        
        _ . fs . directoryContains ( testDir + "parent/" , "Parent.file.doesnotexist" , true ,
        function  (err, exists) {
            eq ( exists , false ) ;
            ok ( ! err ) ;
            n ++ ;
        }
        ) ;
        
        _ . fs . directoryContains ( testDir + "parent/" , "parent.file.doesnotexist" , false ,
        function  (err, exists) {
            eq ( exists , false ) ;
            ok ( ! err ) ;
            n ++ ;
        }
        ) ;
        
        beforeExit (
        function  () {
            assert . equal ( 10 , n ) ;
        }
        ) ;
    }
    function testFindInParents (beforeExit) {
        var n = 0 ;
        
        eq ( testDir + "parent" , _ . fs . findInParents . sync ( testDir + "parent/child/child.directory/" , "parent.file" ) ) ;
        eq ( testDir + "parent" , _ . fs . findInParents . sync ( testDir + "parent/child/child.directory/" , "child" ) ) ;
        
        eq ( "" , _ . fs . findInParents . sync ( testDir + "parent/child/child.directory/" , "parent.file.doesnotexist" ) ) ;
        try {
            eq ( "" , _ . fs . findInParents . sync ( testDir + "parent/child/child.directory/doesntexist/" , "parent.file.doesnotexist" ) ) ;
        }
        catch (e) {
            n ++ ;
        }
        _ . fs . findInParents ( testDir + "parent/child/child.directory/doesntexist/" , "parent.file" ,
        function  (err, path) {
            ok ( err ) ;
            eq ( undefined , path ) ;
            n ++ ;
        }
        ) ;
        
        _ . fs . findInParents ( testDir + "parent/child/child.directory/" , "parent.file" ,
        function  (err, path) {
            ok ( ! err ) ;
            eq ( testDir + "parent/" , path ) ;
            n ++ ;
        }
        ) ;
        
        _ . fs . findInParents ( testDir + "parent/child/child.directory/" , "child" ,
        function  (err, path) {
            ok ( ! err ) ;
            eq ( testDir + "parent/" , path ) ;
            n ++ ;
        }
        ) ;
        
        _ . fs . findInParents ( testDir + "parent/child/child.directory/" , "parent.file.doesnotexist" ,
        function  (err, path) {
            ok ( ! err ) ;
            eq ( path , "" ) ;
            n ++ ;
        }
        ) ;
        
        beforeExit (
        function  () {
            assert . equal ( 5 , n ) ;
        }
        ) ;
    }
    function testFileExists (beforeExit) {
        var n = 0 ;
        
        eq ( true , _ . fs . fileExists . sync ( testDir + "parent/parent.file" ) ) ;
        eq ( false , _ . fs . fileExists . sync ( testDir + "parent" ) ) ;
        eq ( false , _ . fs . fileExists . sync ( testDir + "parent/parent.file.doesnotexist" ) ) ;
        
        _ . fs . fileExists ( testDir + "parent/parent.file" ,
        function  (err, exists) {
            ok ( ! err ) ;
            eq ( true , exists ) ;
            n ++ ;
        }
        ) ;
        
        _ . fs . fileExists ( testDir + "parent" ,
        function  (err, exists) {
            ok ( ! err ) ;
            eq ( false , exists ) ;
            n ++ ;
        }
        ) ;
        
        
        _ . fs . fileExists ( testDir + "parent/parent.file.doesnotexist" ,
        function  (err, exists) {
            ok ( ! err ) ;
            eq ( false , exists ) ;
            n ++ ;
        }
        ) ;
        
        beforeExit (
        function  () {
            assert . equal ( 3 , n ) ;
        }
        ) ;
    }
    function testDirExists (beforeExit) {
        var n = 0 ;
        
        eq ( true , _ . fs . directoryExists . sync ( testDir + "parent" ) ) ;
        eq ( false , _ . fs . directoryExists . sync ( testDir + "parent/parent.file" ) ) ;
        eq ( false , _ . fs . directoryExists . sync ( testDir + "parent/parent.file.doesnotexist" ) ) ;
        
        _ . fs . directoryExists ( testDir + "parent" ,
        function  (err, exists) {
            ok ( ! err ) ;
            eq ( true , exists ) ;
            n ++ ;
        }
        ) ;
        
        _ . fs . directoryExists ( testDir + "parent/parent.file" ,
        function  (err, exists) {
            ok ( ! err ) ;
            eq ( false , exists ) ;
            n ++ ;
        }
        ) ;
        
        _ . fs . directoryExists ( testDir + "parent/parent.file.doesnotexist" ,
        function  (err, exists) {
            ok ( ! err ) ;
            eq ( false , exists ) ;
            n ++ ;
        }
        ) ;
        
        beforeExit (
        function  () {
            assert . equal ( 3 , n ) ;
        }
        ) ;
    }
    function testReadDir (beforeExit) {
        var n = 0 ;
        
        eq ( [ 'child' , 'empty' , 'parent.file' ] , _ . fs . readDir . sync ( testDir + "parent" ) ) ;
        try {
            eq ( [ ] , _ . fs . readDir . sync ( testDir + "parent/parent.file" ) ) ;
        }
        catch (e) {
            n ++ ;
        }
        try {
            eq ( [ ] , _ . fs . readDir . sync ( testDir + "parent/parent.file.doesnotexist" ) ) ;
        }
        catch (e) {
            n ++ ;
        }
        _ . fs . readDir ( testDir + "parent" ,
        function  (err, names) {
            ok ( ! err ) ;
            eq ( [ 'child' , 'empty' , 'parent.file' ] , names ) ;
            n ++ ;
        }
        ) ;
        
        _ . fs . readDir ( testDir + "parent/parent.file" ,
        function  (err, names) {
            ok ( err ) ;
            eq ( undefined , names ) ;
            n ++ ;
        }
        ) ;
        
        _ . fs . readDir ( testDir + "parent/parent.file.doesnotexist" ,
        function  (err, names) {
            ok ( err ) ;
            eq ( undefined , names ) ;
            n ++ ;
        }
        ) ;
        
        eq ( [ ] ,
        _ . difference (
        [ testDir + 'parent/' + 'parent.file' , testDir + 'parent/' + 'child' , testDir + 'parent/' + 'empty' ] ,
        _ . fs . readDir . sync ( testDir + "parent" , { fullPath : true } )
        )
        ) ;
        try {
            eq ( [ ] , _ . fs . readDir . sync ( testDir + "parent/parent.file" , { fullPath : true } ) ) ;
        }
        catch (e) {
            n ++ ;
        }
        try {
            eq ( [ ] , _ . fs . readDir . sync ( testDir + "parent/parent.file.doesnotexist" , { fullPath : true } ) ) ;
        }
        catch (e) {
            n ++ ;
        }
        _ . fs . readDir ( testDir + "parent" , { fullPath : true } ,
        function  (err, names) {
            ok ( ! err ) ;
            eq ( [ ] , _ . difference ( [ testDir + 'parent/' + 'parent.file' , testDir + 'parent/' + 'child' , testDir + 'parent/' + 'empty' ] , names ) ) ;
            n ++ ;
        }
        ) ;
        
        _ . fs . readDir ( testDir + "parent/parent.file" , { fullPath : true } ,
        function  (err, names) {
            ok ( err ) ;
            eq ( undefined , names ) ;
            n ++ ;
        }
        ) ;
        
        _ . fs . readDir ( testDir + "parent/parent.file.doesnotexist" , { fullPath : true } ,
        function  (err, names) {
            ok ( _ . code . noent ( err ) ) ;
            eq ( undefined , names ) ;
            n ++ ;
        }
        ) ;
        
        beforeExit (
        function  () {
            assert . equal ( 10 , n ) ;
        }
        ) ;
    }
    function testMakeRmdir (beforeExit) {
        var n = 0 ;
        
        _ . fs . rmdir . sync ( testDir + 'sync' ) ;
        _ . fs . rmdir . sync ( testDir + 'async' ) ;
        n ++ ;
        
        _ . fs . mkdir . sync ( testDir + 'sync/make/tree/' ) ;
        eq ( true , _ . fs . exists . sync ( testDir + 'sync/make/tree/' ) ) ;
        
        _ . fs . rmdir . sync ( testDir + 'sync' ) ;
        eq ( false , _ . fs . exists . sync ( testDir + 'sync' ) ) ;
        
        _ . fs . mkdir ( testDir + 'async/make/tree/' ,
        function  (err) {
            eq ( true , _ . fs . exists . sync ( testDir + 'async/make/tree' ) ) ;
            ok ( ! err ) ;
            _ . fs . rmdir ( testDir + 'async' ,
            function  (err) {
                ok ( ! err ) ;
                eq ( false , _ . fs . exists . sync ( testDir + 'async' ) ) ;
                n ++ ;
            }
            ) ;
        }
        ) ;
        
        _ . fs . mkdir ( testDir + 'parent/child/' ,
        function  (err) {
            ok ( ! err ) ;
            n ++ ;
        }
        ) ;
        
        
        beforeExit (
        function  () {
            assert . equal ( 3 , n ) ;
        }
        ) ;
    }
    function testDirectories (beforeExit) {
        var n = 0 ;
        
        eq ( [ ] , _ . difference ( [ testDir + 'parent/' + 'child' , testDir + 'parent/' + 'empty' ] , _ . fs . directories . sync ( testDir + "parent" ) ) ) ;
        try {
            eq ( [ ] , _ . fs . directories . sync ( testDir + "parent/parent.file" ) ) ;
        }
        catch (e) {
            n ++ ;
        }
        try {
            eq ( [ ] , _ . fs . directories . sync ( testDir + "parent/parent.file.doesnotexist" ) ) ;
        }
        catch (e) {
            n ++ ;
        }
        _ . fs . directories ( testDir + "parent" ,
        function  (err, names) {
            ok ( ! err ) ;
            eq ( [ ] , _ . difference ( [ testDir + 'parent/' + 'child' , testDir + 'parent/' + 'empty' ] , names ) ) ;
            n ++ ;
        }
        ) ;
        
        _ . fs . directories ( testDir + "parent/parent.file" ,
        function  (err, names) {
            ok ( _ . code . notdir ( err ) ) ;
            eq ( undefined , names ) ;
            n ++ ;
        }
        ) ;
        
        _ . fs . directories ( testDir + "parent/parent.file.doesnotexist" ,
        function  (err, names) {
            ok ( _ . code . noent ( err ) ) ;
            eq ( undefined , names ) ;
            n ++ ;
        }
        ) ;
        
        
        eq ( [ 'child' , 'empty' ] , _ . fs . directories . sync ( testDir + "parent" , false ) ) ;
        try {
            eq ( [ ] , _ . fs . directories . sync ( testDir + "parent/parent.file" , false ) ) ;
        }
        catch (e) {
            n ++ ;
        }
        try {
            eq ( [ ] , _ . fs . directories . sync ( testDir + "parent/parent.file.doesnotexist" , false ) ) ;
        }
        catch (e) {
            n ++ ;
        }
        _ . fs . directories ( testDir + "parent" ,
        function  (err, names) {
            ok ( ! err ) ;
            eq ( [ 'child' , 'empty' ] , names ) ;
            n ++ ;
        }
        , false ) ;
        
        _ . fs . directories ( testDir + "parent/parent.file" ,
        function  (err, names) {
            ok ( _ . code . notdir ( err ) ) ;
            eq ( undefined , names ) ;
            n ++ ;
        }
        , false ) ;
        
        _ . fs . directories ( testDir + "parent/parent.file.doesnotexist" ,
        function  (err, names) {
            ok ( _ . code . noent ( err ) ) ;
            eq ( undefined , names ) ;
            n ++ ;
        }
        , false ) ;
        
        beforeExit (
        function  () {
            assert . equal ( 10 , n ) ;
        }
        ) ;
    }
    function testFiles (beforeExit) {
        var n = 0 ;
        
        eq ( [ testDir + 'parent/parent.file' ] , _ . fs . files . sync ( testDir + "parent" ) ) ;
        try {
            eq ( [ ] , _ . fs . files . sync ( testDir + "parent/parent.file" ) ) ;
        }
        catch (e) {
            n ++ ;
        }
        try {
            eq ( [ ] , _ . fs . files . sync ( testDir + "parent/parent.file.doesnotexist" ) ) ;
        }
        catch (e) {
            n ++ ;
        }
        _ . fs . files ( testDir + "parent" ,
        function  (err, names) {
            ok ( ! err ) ;
            eq ( [ testDir + 'parent/parent.file' ] , names ) ;
            n ++ ;
        }
        ) ;
        
        _ . fs . files ( testDir + "parent/parent.file" ,
        function  (err, names) {
            ok ( _ . code . notdir ( err ) ) ;
            eq ( undefined , names ) ;
            n ++ ;
        }
        ) ;
        
        _ . fs . files ( testDir + "parent/parent.file.doesnotexist" ,
        function  (err, names) {
            ok ( _ . code . noent ( err ) ) ;
            eq ( undefined , names ) ;
            n ++ ;
        }
        ) ;
        
        eq ( [ 'parent.file' ] , _ . fs . files . sync ( testDir + "parent" , false ) ) ;
        try {
            eq ( [ ] , _ . fs . files . sync ( testDir + "parent/parent.file" , false ) ) ;
        }
        catch (e) {
            n ++ ;
        }
        try {
            eq ( [ ] , _ . fs . files . sync ( testDir + "parent/parent.file.doesnotexist" , false ) ) ;
        }
        catch (e) {
            n ++ ;
        }
        _ . fs . files ( testDir + "parent" ,
        function  (err, names) {
            ok ( ! err ) ;
            eq ( [ 'parent.file' ] , names ) ;
            n ++ ;
        }
        , false ) ;
        
        _ . fs . files ( testDir + "parent/parent.file" ,
        function  (err, names) {
            ok ( _ . code . notdir ( err ) ) ;
            eq ( undefined , names ) ;
            n ++ ;
        }
        , false ) ;
        
        _ . fs . files ( testDir + "parent/parent.file.doesnotexist" ,
        function  (err, names) {
            ok ( _ . code . noent ( err ) ) ;
            eq ( undefined , names ) ;
            n ++ ;
        }
        , false ) ;
        
        beforeExit (
        function  () {
            assert . equal ( 10 , n ) ;
        }
        ) ;
    }
    function walkTest (beforeExit) {
        var n = 0 ;
        
        var relativePaths = [
        './parent' ,
        './parent/child' ,
        './parent/child/child.directory' ,
        './parent/child/child.directory/child.directory.file' ,
        './parent/child/child.directory/parent' ,
        './parent/child/child.directory/parent/.keep' ,
        './parent/child/child.file' ,
        './parent/empty' ,
        './parent/parent.file'
        ] ;
        
        var expectedPaths = _ . map ( relativePaths ,
        function  (val) {
            return ( _ . path . normalize ( testDir + val ) );
        }
        ) ;
        var foundPaths = [ ] ;
        
        _ . fs . walk . sync ( testDir ,
        function onFile (fileName, filePath) {
            if (fileName == "mv1.txt" || fileName == "mv2.txt" || fileName == "mv3.txt") {
                return ( false );
            } else {
            }
            foundPaths . push ( filePath ) ;
        }
        ,
        function onDir (dirName, dirPath) {
            if (dirName == "mvtest" || dirName == "async") {
                return ( false );
            } else {
            }
            foundPaths . push ( dirPath ) ;
        }
        ) ;
        
        _ . each ( expectedPaths ,
        function  (val) {
            eq ( [ val ] , _ . filter ( foundPaths ,
            function  (found) {
                return ( found === val );
            }
            ) ) ;
            foundPaths = _ . reject ( foundPaths ,
            function  (found) {
                return ( found === val );
            }
            ) ;
        }
        ) ;
        
        eq ( foundPaths . length , 0 ) ;
        
        
        
        _ . fs . walk ( testDir ,
        function onFile (fileName, filePath, next) {
            if (fileName == "mv1.txt" || fileName == "mv2.txt" || fileName == "mv3.txt") {
                return next ( false );
            } else {
            }
            foundPaths . push ( filePath ) ;
            next ( ) ;
        }
        ,
        function onDir (dirName, dirPath, next) {
            if (dirName == "mvtest" || dirName == "async") {
                return next ( false );
            } else {
            }
            foundPaths . push ( dirPath ) ;
            next ( ) ;
        }
        ,
        function  (err) {
            if (err) {
                throw ( err ) ;
            } else {
            }
            n ++ ;
            
            
            _ . each ( expectedPaths ,
            function  (val) {
                eq ( [ val ] , _ . filter ( foundPaths ,
                function  (found) {
                    return ( found === val );
                }
                ) ) ;
                foundPaths = _ . reject ( foundPaths ,
                function  (found) {
                    return ( found === val );
                }
                ) ;
            }
            ) ;
            eq ( foundPaths . length , 0 ) ;
        }
        ) ;
        
        beforeExit (
        function  () {
            assert . equal ( 1 , n ) ;
        }
        ) ;
    }
    function findTest (beforeExit) {
        var n = 0 ;
        
        var relativePaths = [
        
        
        
        './parent/child/child.directory/child.directory.file' ,
        
        
        './parent/child/child.file' ,
        
        './parent/parent.file'
        ] ;
        
        var expectedPaths = _ . map ( relativePaths ,
        function  (val) {
            return ( _ . path . normalize ( testDir + val ) );
        }
        ) ;
        var foundPaths = [ ] ;
        
        var foundPaths = _ . fs . find . sync ( testDir , "*.file" ) ;
        
        _ . each ( expectedPaths ,
        function  (val) {
            eq ( [ val ] , _ . filter ( foundPaths ,
            function  (found) {
                return ( found === val );
            }
            ) ) ;
            foundPaths = _ . reject ( foundPaths ,
            function  (found) {
                return ( found === val );
            }
            ) ;
        }
        ) ;
        
        assert . equal ( foundPaths . length , 0 ) ;
        
        foundPaths = _ . fs . find . sync ( testDir , { pattern : "*.file" , prune :
        function  (dirName) {
            return ( dirName === 'child' );
        }
        } ) ;
        
        var prunedExpected = [ _ . path . normalize ( testDir + './parent/parent.file' ) ] ;
        
        _ . each ( prunedExpected ,
        function  (val) {
            eq ( [ val ] , _ . filter ( foundPaths ,
            function  (found) {
                return ( found === val );
            }
            ) ) ;
            foundPaths = _ . reject ( foundPaths ,
            function  (found) {
                return ( found === val );
            }
            ) ;
        }
        ) ;
        
        assert . equal ( foundPaths . length , 0 ) ;
        
        
        
        _ . fs . find ( testDir , "*.file" ,
        function  (err, foundFiles) {
            n ++ ;
            
            
            
            _ . each ( expectedPaths ,
            function  (val) {
                eq ( [ val ] , _ . filter ( foundFiles ,
                function  (found) {
                    return ( found === val );
                }
                ) ) ;
                foundFiles = _ . reject ( foundFiles ,
                function  (found) {
                    return ( found === val );
                }
                ) ;
            }
            ) ;
            
            assert . equal ( foundFiles . length , 0 ) ;
        }
        ) ;
        
        beforeExit (
        function  () {
            assert . equal ( 1 , n ) ;
        }
        ) ;
    }
    function testFetchModule (done) {
        var __tame_defer_cb = tame.findDeferCb ([done]);
        tame.setActiveCb (__tame_defer_cb);
        var __tame_this = this;
        var __tame_arguments = arguments;
        var __tame_fn_37 = function (__tame_k) {
            tame.setActiveCb (__tame_defer_cb);
            var calls = 0 ;
            var expectedCalls = 1 ;
            
            done (
            function  () {
                eq ( calls , expectedCalls ) ;
            }
            ) ;
            
            var err = null ;
            var mod = null ;
            var __tame_fn_1 = function (__tame_k) {
                tame.setActiveCb (__tame_defer_cb);
                var __tame_fn_2 = function (__tame_k) {
                    tame.setActiveCb (__tame_defer_cb);
                    var __tame_defers = new tame.Deferrals (__tame_k);
                    var __tame_fn_3 = function (__tame_k) {
                        tame.setActiveCb (__tame_defer_cb);
                        _ . fs . module ( moduleData ( "not-there" , "not-there.tjs" ) ,
                        __tame_defers.defer ( { 
                            assign_fn : 
                                function () {
                                    err = arguments[0];
                                    mod = arguments[1];
                                }
                                ,
                            func_name : "testFetchModule",
                            parent_cb : __tame_defer_cb,
                            line : 763,
                            file : "./test/fs.test.tjs"
                        } )
                        ) ;
                        tame.callChain([__tame_k]);
                        tame.setActiveCb (null);
                    };
                    __tame_fn_3(tame.end);
                    __tame_defers._fulfill();
                    tame.setActiveCb (null);
                };
                var __tame_fn_36 = function (__tame_k) {
                    tame.setActiveCb (__tame_defer_cb);
                    eq ( err , null ) ;
                    eq ( mod , null ) ;
                    var __tame_fn_4 = function (__tame_k) {
                        tame.setActiveCb (__tame_defer_cb);
                        var __tame_fn_5 = function (__tame_k) {
                            tame.setActiveCb (__tame_defer_cb);
                            var __tame_defers = new tame.Deferrals (__tame_k);
                            var __tame_fn_6 = function (__tame_k) {
                                tame.setActiveCb (__tame_defer_cb);
                                _ . fs . module ( moduleData ( "bad" , "bad-global.tjs" ) ,
                                __tame_defers.defer ( { 
                                    assign_fn : 
                                        function () {
                                            err = arguments[0];
                                            mod = arguments[1];
                                        }
                                        ,
                                    func_name : "testFetchModule",
                                    parent_cb : __tame_defer_cb,
                                    line : 767,
                                    file : "./test/fs.test.tjs"
                                } )
                                ) ;
                                tame.callChain([__tame_k]);
                                tame.setActiveCb (null);
                            };
                            __tame_fn_6(tame.end);
                            __tame_defers._fulfill();
                            tame.setActiveCb (null);
                        };
                        var __tame_fn_35 = function (__tame_k) {
                            tame.setActiveCb (__tame_defer_cb);
                            ok ( err ) ;
                            eq ( mod , undefined ) ;
                            var __tame_fn_7 = function (__tame_k) {
                                tame.setActiveCb (__tame_defer_cb);
                                var __tame_fn_8 = function (__tame_k) {
                                    tame.setActiveCb (__tame_defer_cb);
                                    var __tame_defers = new tame.Deferrals (__tame_k);
                                    var __tame_fn_9 = function (__tame_k) {
                                        tame.setActiveCb (__tame_defer_cb);
                                        _ . fs . module ( moduleData ( "bad" , "bad-relative.tjs" ) ,
                                        __tame_defers.defer ( { 
                                            assign_fn : 
                                                function () {
                                                    err = arguments[0];
                                                    mod = arguments[1];
                                                }
                                                ,
                                            func_name : "testFetchModule",
                                            parent_cb : __tame_defer_cb,
                                            line : 771,
                                            file : "./test/fs.test.tjs"
                                        } )
                                        ) ;
                                        tame.callChain([__tame_k]);
                                        tame.setActiveCb (null);
                                    };
                                    __tame_fn_9(tame.end);
                                    __tame_defers._fulfill();
                                    tame.setActiveCb (null);
                                };
                                var __tame_fn_34 = function (__tame_k) {
                                    tame.setActiveCb (__tame_defer_cb);
                                    ok ( err ) ;
                                    eq ( mod , undefined ) ;
                                    var __tame_fn_10 = function (__tame_k) {
                                        tame.setActiveCb (__tame_defer_cb);
                                        var __tame_fn_11 = function (__tame_k) {
                                            tame.setActiveCb (__tame_defer_cb);
                                            var __tame_defers = new tame.Deferrals (__tame_k);
                                            var __tame_fn_12 = function (__tame_k) {
                                                tame.setActiveCb (__tame_defer_cb);
                                                _ . fs . module ( moduleData ( "bad" , "bad-abs.tjs" ) ,
                                                __tame_defers.defer ( { 
                                                    assign_fn : 
                                                        function () {
                                                            err = arguments[0];
                                                            mod = arguments[1];
                                                        }
                                                        ,
                                                    func_name : "testFetchModule",
                                                    parent_cb : __tame_defer_cb,
                                                    line : 775,
                                                    file : "./test/fs.test.tjs"
                                                } )
                                                ) ;
                                                tame.callChain([__tame_k]);
                                                tame.setActiveCb (null);
                                            };
                                            __tame_fn_12(tame.end);
                                            __tame_defers._fulfill();
                                            tame.setActiveCb (null);
                                        };
                                        var __tame_fn_33 = function (__tame_k) {
                                            tame.setActiveCb (__tame_defer_cb);
                                            ok ( err ) ;
                                            eq ( mod , undefined ) ;
                                            var __tame_fn_13 = function (__tame_k) {
                                                tame.setActiveCb (__tame_defer_cb);
                                                var __tame_fn_14 = function (__tame_k) {
                                                    tame.setActiveCb (__tame_defer_cb);
                                                    var __tame_defers = new tame.Deferrals (__tame_k);
                                                    var __tame_fn_15 = function (__tame_k) {
                                                        tame.setActiveCb (__tame_defer_cb);
                                                        _ . fs . module ( moduleData ( "bad" ) ,
                                                        __tame_defers.defer ( { 
                                                            assign_fn : 
                                                                function () {
                                                                    err = arguments[0];
                                                                    mod = arguments[1];
                                                                }
                                                                ,
                                                            func_name : "testFetchModule",
                                                            parent_cb : __tame_defer_cb,
                                                            line : 779,
                                                            file : "./test/fs.test.tjs"
                                                        } )
                                                        ) ;
                                                        tame.callChain([__tame_k]);
                                                        tame.setActiveCb (null);
                                                    };
                                                    __tame_fn_15(tame.end);
                                                    __tame_defers._fulfill();
                                                    tame.setActiveCb (null);
                                                };
                                                var __tame_fn_32 = function (__tame_k) {
                                                    tame.setActiveCb (__tame_defer_cb);
                                                    eq ( err , null ) ;
                                                    eq ( mod , null ) ;
                                                    var __tame_fn_16 = function (__tame_k) {
                                                        tame.setActiveCb (__tame_defer_cb);
                                                        var __tame_fn_17 = function (__tame_k) {
                                                            tame.setActiveCb (__tame_defer_cb);
                                                            var __tame_defers = new tame.Deferrals (__tame_k);
                                                            var __tame_fn_18 = function (__tame_k) {
                                                                tame.setActiveCb (__tame_defer_cb);
                                                                _ . fs . module ( moduleData ( "badpath" ) ,
                                                                __tame_defers.defer ( { 
                                                                    assign_fn : 
                                                                        function () {
                                                                            err = arguments[0];
                                                                            mod = arguments[1];
                                                                        }
                                                                        ,
                                                                    func_name : "testFetchModule",
                                                                    parent_cb : __tame_defer_cb,
                                                                    line : 783,
                                                                    file : "./test/fs.test.tjs"
                                                                } )
                                                                ) ;
                                                                tame.callChain([__tame_k]);
                                                                tame.setActiveCb (null);
                                                            };
                                                            __tame_fn_18(tame.end);
                                                            __tame_defers._fulfill();
                                                            tame.setActiveCb (null);
                                                        };
                                                        var __tame_fn_31 = function (__tame_k) {
                                                            tame.setActiveCb (__tame_defer_cb);
                                                            eq ( err , null ) ;
                                                            eq ( mod , null ) ;
                                                            var __tame_fn_19 = function (__tame_k) {
                                                                tame.setActiveCb (__tame_defer_cb);
                                                                var __tame_fn_20 = function (__tame_k) {
                                                                    tame.setActiveCb (__tame_defer_cb);
                                                                    var __tame_defers = new tame.Deferrals (__tame_k);
                                                                    var __tame_fn_21 = function (__tame_k) {
                                                                        tame.setActiveCb (__tame_defer_cb);
                                                                        _ . fs . module ( "badpath" ,
                                                                        __tame_defers.defer ( { 
                                                                            assign_fn : 
                                                                                function () {
                                                                                    err = arguments[0];
                                                                                    mod = arguments[1];
                                                                                }
                                                                                ,
                                                                            func_name : "testFetchModule",
                                                                            parent_cb : __tame_defer_cb,
                                                                            line : 787,
                                                                            file : "./test/fs.test.tjs"
                                                                        } )
                                                                        ) ;
                                                                        tame.callChain([__tame_k]);
                                                                        tame.setActiveCb (null);
                                                                    };
                                                                    __tame_fn_21(tame.end);
                                                                    __tame_defers._fulfill();
                                                                    tame.setActiveCb (null);
                                                                };
                                                                var __tame_fn_30 = function (__tame_k) {
                                                                    tame.setActiveCb (__tame_defer_cb);
                                                                    eq ( err , null ) ;
                                                                    eq ( mod , null ) ;
                                                                    var __tame_fn_22 = function (__tame_k) {
                                                                        tame.setActiveCb (__tame_defer_cb);
                                                                        var __tame_fn_23 = function (__tame_k) {
                                                                            tame.setActiveCb (__tame_defer_cb);
                                                                            var __tame_defers = new tame.Deferrals (__tame_k);
                                                                            var __tame_fn_24 = function (__tame_k) {
                                                                                tame.setActiveCb (__tame_defer_cb);
                                                                                _ . fs . module ( moduleData ( "good" , "one.tjs" ) ,
                                                                                __tame_defers.defer ( { 
                                                                                    assign_fn : 
                                                                                        function () {
                                                                                            err = arguments[0];
                                                                                            mod = arguments[1];
                                                                                        }
                                                                                        ,
                                                                                    func_name : "testFetchModule",
                                                                                    parent_cb : __tame_defer_cb,
                                                                                    line : 791,
                                                                                    file : "./test/fs.test.tjs"
                                                                                } )
                                                                                ) ;
                                                                                tame.callChain([__tame_k]);
                                                                                tame.setActiveCb (null);
                                                                            };
                                                                            __tame_fn_24(tame.end);
                                                                            __tame_defers._fulfill();
                                                                            tame.setActiveCb (null);
                                                                        };
                                                                        var __tame_fn_29 = function (__tame_k) {
                                                                            tame.setActiveCb (__tame_defer_cb);
                                                                            eq ( err , null ) ;
                                                                            eq ( mod , { one : 'one' } ) ;
                                                                            var __tame_fn_25 = function (__tame_k) {
                                                                                tame.setActiveCb (__tame_defer_cb);
                                                                                var __tame_fn_26 = function (__tame_k) {
                                                                                    tame.setActiveCb (__tame_defer_cb);
                                                                                    var __tame_defers = new tame.Deferrals (__tame_k);
                                                                                    var __tame_fn_27 = function (__tame_k) {
                                                                                        tame.setActiveCb (__tame_defer_cb);
                                                                                        _ . fs . module ( moduleData ( "good" , "two.js" ) ,
                                                                                        __tame_defers.defer ( { 
                                                                                            assign_fn : 
                                                                                                function () {
                                                                                                    err = arguments[0];
                                                                                                    mod = arguments[1];
                                                                                                }
                                                                                                ,
                                                                                            func_name : "testFetchModule",
                                                                                            parent_cb : __tame_defer_cb,
                                                                                            line : 795,
                                                                                            file : "./test/fs.test.tjs"
                                                                                        } )
                                                                                        ) ;
                                                                                        tame.callChain([__tame_k]);
                                                                                        tame.setActiveCb (null);
                                                                                    };
                                                                                    __tame_fn_27(tame.end);
                                                                                    __tame_defers._fulfill();
                                                                                    tame.setActiveCb (null);
                                                                                };
                                                                                var __tame_fn_28 = function (__tame_k) {
                                                                                    tame.setActiveCb (__tame_defer_cb);
                                                                                    eq ( err , null ) ;
                                                                                    eq ( mod , { two : 'two' } ) ;
                                                                                    
                                                                                    calls ++ ;
                                                                                    tame.callChain([__tame_k]);
                                                                                    tame.setActiveCb (null);
                                                                                };
                                                                                tame.callChain([__tame_fn_26, __tame_fn_28, __tame_k]);
                                                                                tame.setActiveCb (null);
                                                                            };
                                                                            tame.callChain([__tame_fn_25, __tame_k]);
                                                                            tame.setActiveCb (null);
                                                                        };
                                                                        tame.callChain([__tame_fn_23, __tame_fn_29, __tame_k]);
                                                                        tame.setActiveCb (null);
                                                                    };
                                                                    tame.callChain([__tame_fn_22, __tame_k]);
                                                                    tame.setActiveCb (null);
                                                                };
                                                                tame.callChain([__tame_fn_20, __tame_fn_30, __tame_k]);
                                                                tame.setActiveCb (null);
                                                            };
                                                            tame.callChain([__tame_fn_19, __tame_k]);
                                                            tame.setActiveCb (null);
                                                        };
                                                        tame.callChain([__tame_fn_17, __tame_fn_31, __tame_k]);
                                                        tame.setActiveCb (null);
                                                    };
                                                    tame.callChain([__tame_fn_16, __tame_k]);
                                                    tame.setActiveCb (null);
                                                };
                                                tame.callChain([__tame_fn_14, __tame_fn_32, __tame_k]);
                                                tame.setActiveCb (null);
                                            };
                                            tame.callChain([__tame_fn_13, __tame_k]);
                                            tame.setActiveCb (null);
                                        };
                                        tame.callChain([__tame_fn_11, __tame_fn_33, __tame_k]);
                                        tame.setActiveCb (null);
                                    };
                                    tame.callChain([__tame_fn_10, __tame_k]);
                                    tame.setActiveCb (null);
                                };
                                tame.callChain([__tame_fn_8, __tame_fn_34, __tame_k]);
                                tame.setActiveCb (null);
                            };
                            tame.callChain([__tame_fn_7, __tame_k]);
                            tame.setActiveCb (null);
                        };
                        tame.callChain([__tame_fn_5, __tame_fn_35, __tame_k]);
                        tame.setActiveCb (null);
                    };
                    tame.callChain([__tame_fn_4, __tame_k]);
                    tame.setActiveCb (null);
                };
                tame.callChain([__tame_fn_2, __tame_fn_36, __tame_k]);
                tame.setActiveCb (null);
            };
            tame.callChain([__tame_fn_1, __tame_k]);
            tame.setActiveCb (null);
        };
        tame.callChain([__tame_fn_37, __tame_k]);
        tame.setActiveCb (null);
    }
    function testFetchModules (done) {
        var __tame_defer_cb = tame.findDeferCb ([done]);
        tame.setActiveCb (__tame_defer_cb);
        var __tame_this = this;
        var __tame_arguments = arguments;
        var __tame_fn_46 = function (__tame_k) {
            tame.setActiveCb (__tame_defer_cb);
            var calls = 0 ;
            var expectedCalls = 1 ;
            
            done (
            function  () {
                eq ( calls , expectedCalls ) ;
            }
            ) ;
            
            var err = null ;
            var mods = null ;
            var __tame_fn_38 = function (__tame_k) {
                tame.setActiveCb (__tame_defer_cb);
                var __tame_fn_39 = function (__tame_k) {
                    tame.setActiveCb (__tame_defer_cb);
                    var __tame_defers = new tame.Deferrals (__tame_k);
                    var __tame_fn_40 = function (__tame_k) {
                        tame.setActiveCb (__tame_defer_cb);
                        _ . fs . modules ( moduleData ( "good" ) ,
                        __tame_defers.defer ( { 
                            assign_fn : 
                                function () {
                                    err = arguments[0];
                                    mods = arguments[1];
                                }
                                ,
                            func_name : "testFetchModules",
                            parent_cb : __tame_defer_cb,
                            line : 812,
                            file : "./test/fs.test.tjs"
                        } )
                        , [ 'js' , 'tjs' ] ) ;
                        tame.callChain([__tame_k]);
                        tame.setActiveCb (null);
                    };
                    __tame_fn_40(tame.end);
                    __tame_defers._fulfill();
                    tame.setActiveCb (null);
                };
                var __tame_fn_45 = function (__tame_k) {
                    tame.setActiveCb (__tame_defer_cb);
                    eq ( err , null ) ;
                    eq ( mods . length , 2 ) ;
                    mods = _ . map ( mods ,
                    function  (m) {
                        return ( m . module );
                    }
                    ) ;
                    var __tame_fn_41 = function (__tame_k) {
                        tame.setActiveCb (__tame_defer_cb);
                        var __tame_fn_42 = function (__tame_k) {
                            tame.setActiveCb (__tame_defer_cb);
                            var __tame_fn_43 = function (__tame_k) {
                                tame.setActiveCb (__tame_defer_cb);
                                var temp = mods [ 0 ] ;
                                mods [ 0 ] = mods [ 1 ] ;
                                mods [ 1 ] = temp ;
                                tame.callChain([__tame_k]);
                                tame.setActiveCb (null);
                            };
                            if (! mods [ 0 ] . one) {
                                tame.callChain([__tame_fn_43, __tame_k]);
                            } else {
                                tame.callChain([__tame_k]);
                            }
                            tame.setActiveCb (null);
                        };
                        var __tame_fn_44 = function (__tame_k) {
                            tame.setActiveCb (__tame_defer_cb);
                            eq ( mods , [ { one : 'one' } , { two : 'two' } ] ) ;
                            
                            calls ++ ;
                            tame.callChain([__tame_k]);
                            tame.setActiveCb (null);
                        };
                        tame.callChain([__tame_fn_42, __tame_fn_44, __tame_k]);
                        tame.setActiveCb (null);
                    };
                    tame.callChain([__tame_fn_41, __tame_k]);
                    tame.setActiveCb (null);
                };
                tame.callChain([__tame_fn_39, __tame_fn_45, __tame_k]);
                tame.setActiveCb (null);
            };
            tame.callChain([__tame_fn_38, __tame_k]);
            tame.setActiveCb (null);
        };
        tame.callChain([__tame_fn_46, __tame_k]);
        tame.setActiveCb (null);
    }
    tame.callChain([__tame_k]);
    tame.setActiveCb (null);
};
__tame_fn_0 (tame.end);