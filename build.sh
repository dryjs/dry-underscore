#!/bin/bash

echo "(function(){" > dryunderscore.js
cat ./deps/underscore/underscore.js >> dryunderscore.js
cat ./deps/underscore.string/dist/underscore.string.min.js >> dryunderscore.js
echo "(" >> dryunderscore.js
node -e "console.log(require('./lib/common.js').mixin.toString())" >> dryunderscore.js
echo ")(_);" >> dryunderscore.js
echo "})();" >> dryunderscore.js
