#!/bin/bash

echo "(function(){" > dry.underscore.js
cat ./deps/underscore/underscore.js >> dry.underscore.js
cat ./deps/underscore.string/dist/underscore.string.min.js >> dry.underscore.js
echo "(" >> dry.underscore.js
node -e "console.log(require('./lib/common.js').mixin.toString())" >> dry.underscore.js
echo ")(_);" >> dry.underscore.js
echo "_.mixin(_.string.exports());" >> dry.underscore.js
echo "})();" >> dry.underscore.js