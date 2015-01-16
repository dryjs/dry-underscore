# A modified version Node's 'fs' module

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
