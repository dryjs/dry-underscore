# A modified version Node's 'fs' module

**moveFiles** `fs.moveFiles(list, function)`

Move a list of files, given their source and destination paths. The `list` argument is a list of path objects that contain 'src' and 'dest' properties. The function iterates over the list and uses the **moveFile** function (aka: fs.rename) to move each file from it's source to the destination. The `function` argument is a callback function that is called on error or when all files have successfully been moved.

```javascript
var filePaths = [ { src: "foo/f1.js"
                  , dest: "bar/f1.js"
                  }
                , { src: "foo/f2.js"
                  , dest: "bar/f2.js"
                  }
                ]
fs.moveFiles(filePaths, function(){});
=> moves files f1.js and f2.js from foo/ to bar/
```
