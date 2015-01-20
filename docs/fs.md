# A modified version Node's 'fs' module

**moveFile** `fs.moveFile(oldPath, newPath, callback)`

Move a file, given its source and destination path. The callback is called on error or when the file has successfully been moved.

```javascript
// move file f1.js from foo/ to bar/

fs.moveFile("foo/f1.js", "bar/f1.js", function(err) {
  if (err) { throw(err); }
});
```

**moveFile.sync** `fs.moveFile.sync(oldPath, newPath)`

Move a file synchronously, given its source and destination path.

```javascript
// move file f1.js from foo/ to bar/

fs.moveFile.sync("foo/f1.js", "bar/f1.js");
```

**moveFiles** `fs.moveFiles(list, callback)`

Move a list of files, given their source and destination paths. The `list` argument is a list of path objects that contain 'src' and 'dest' properties. The `callback` is called on error or when all files have successfully been moved. The files are moved sequentially, if there is an error, the process is halted and the error is returned, all files before the one that caused the error will be moved.

```javascript
// moves files f1.js and f2.js from foo/ to bar/

var filePaths = [ { src: "foo/f1.js", dest: "bar/f1.js" },
                  { src: "foo/f2.js", dest: "bar/f2.js" } ]

fs.moveFiles(filePaths, function(err){
    if(err){ throw(err); }
});
```

**readJsonFile** `fs.readJsonFile(path, callback)`

Read and parse a JSON file into memory given a file path (as a string). The callback function takes 2 parameters: `err` (can be null) and a `result` (JSON object). The callback is called on error or after the file has been read and parsed.

```javascript
// baz.json
{ foo: "bar" }

// logs the string: '{ foo: "bar" }'
var cb = function (err, result) { 
  if(err) { throw(err); }
  console.log(result); 
};
fs.readJsonFile('baz.json', cb);
```

