
# A modified version Node's 'fs' module

**moveFile** `fs.moveFile(oldPath, newPath, callback)`

* `oldPath` String
* `newPath` String
* `callback` Function

Move a file, given its source and destination path. The callback is called on error or when the file has successfully been moved. No arguments other than a possible exception are given to the completion callback.

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

* `list` Array, of the form: [ { src: String, dest: String }, ... ]
* `callback` Function

Move a list of files, given their source and destination paths. The `list` argument is a list of path objects that contain 'src' and 'dest' properties. The `callback` is called on error or when all files have successfully been moved. The files are moved sequentially, if there is an error, the process is halted and the error is returned, all files before the one that caused the error will be moved.

```javascript
// moves files f1.js and f2.js from foo/ to bar/

var filePaths = [ { src: "foo/f1.js", dest: "bar/f1.js" },
                  { src: "foo/f2.js", dest: "bar/f2.js" } ]

fs.moveFiles(filePaths, function(err){
    if(err){ throw(err); }
});
```

**writeFile** `fs.writeFile(filename, data, [options], callback)`

* `filename` String
* `data` String or Buffer
* `options` Object
  * `encoding` String or Null, default = 'utf8'
  * `mode` Number, default = 438 (aka 0666 in Octal)
  * `flag` String, default = 'w'
* `callback` Function

Asynchronously writes data to a file, replacing the file if it already exists. The `data` can be a string or a buffer. The `encoding` option is ignored if `data` is a buffer.

```javascript
// write 'Hello Dry' to a file

fs.writeFile('hello.txt', 'Hello Dry', function(err) {
  if (err) { throw(err); }
  console.log('file has been saved');
});
```

**writeFile.sync** `fs.writeFile.sync(filename, data, [options])`

Synchronous version of `fs.writeFile`

**readFile** `fs.readFile(filePath, callback)`

* `filePath` String
* `callback` Function

Asynchronously reads the contents of a file into memory. The callback function is passed two arguments, `err` (null if no error), and `data` (contents of the file). Encoding is set to 'utf8'.

```javascript
// reads log file into memory and prints contents to the console

fs.readFile('log.txt', function(err, data) {
  if (err) { throw(err); }
  console.log(data);
});
```

**readFile.sync** `fs.readFile.sync(filePath)`

Synchronous version of `fs.readFile`

**readJsonFile** `fs.readJsonFile(path, callback)`

* `path` String
* `callback` Function

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

**evalFile** `fs.evalFile(path, callback)`

* `path` String
* `callback` Function

Asynchronously evaluate the contents a file. The callback function takes 2 parameters: `err` (can be null) and `data` ('utf8' encoded data). The callback is called on an error or after the file has been read and evaluated.

```javascript
// four.js
console.log(2 + 2);

// outputs the following: 
// 4
// console.log(2 + 2);
fs.evalFile('four.js', function(err, data) {
  if (err) { throw err; }
  console.log(data);
});
```

**evalFile.sync** `fs.evalFile.sync(path)`

Synchronous version of `fs.evalFile`


**renderFile** `fs.renderFile(path, hash, callback)`

* `path` String
* `hash` Object
* `callback` Function

Asynchronously renders a template file, at `path`, with data from a given `hash` file (set of key value pairs). The `callback` is called on error or after the `hash` values have been applied to the template. The `callback` function takes two arguments: `err` (can be null) and `result`, the result of rendering the template at the `path` location with the `hash`.

```javascript
// person.hbs
<p>{{greeting}}, {{name}}</p>

// outputs '<p>Hello, Joe</p>'
var data = { name: 'Joe', greeting: 'Hello' }
fs.renderFile(path, data, function(err, result) {
  if (err) { throw err; }
  console.log(result);
});
```

**isDirectoryEmpty** `fs.isDirectoryEmpty(path, [ignore], callback)`

* `path` String
* `ignore` Array (optional)
* `callback` Function

Asynchronously check contents of a directory to see if it is empty and returns a boolean, `true` or `false`. The optional `ignore` argument is a list of files to ignore, an array of strings. If any of the files in the ignore list are present, and the directory contains no other files, the function will return `true`. The `callback` takes two arguments: `err` (can be null), and `result` (a boolean, `true` or `false`).  

