#!/bin/bash

echo "(function(){" > dry.underscore.js
cat ./deps/underscore/underscore.js >> dry.underscore.js
cat ./deps/superagent/superagent.js >> dry.underscore.js
#cat ./deps/underscore.string/dist/underscore.string.min.js >> dry.underscore.js
echo "(" >> dry.underscore.js
node -e "console.log(require('./lib/common.js').mixin.toString())" >> dry.underscore.js
echo ")(_);" >> dry.underscore.js
echo "_.dry = (" >> dry.underscore.js
node -e "console.log(require('./lib/dry.js').mixin.toString())" >> dry.underscore.js
echo ")(_);" >> dry.underscore.js
#echo "_.mixin(_.string.exports());" >> dry.underscore.js
echo "_.log = (" >> dry.underscore.js
node -e "console.log(require('./lib/log.js').mixin.toString())" >> dry.underscore.js
echo ")(_);" >> dry.underscore.js
echo "(" >> dry.underscore.js
node -e "console.log(require('./lib/client.js').mixin.toString())" >> dry.underscore.js
echo ")(_);" >> dry.underscore.js
echo "_.eventEmitter = (" >> dry.underscore.js
node -e "console.log(require('./lib/eventEmitter.js').mixin.toString())" >> dry.underscore.js
echo ")(_);" >> dry.underscore.js
echo "_.events = {};" >> dry.underscore.js
echo "_.eventEmitter(_.events);" >> dry.underscore.js
echo "})();" >> dry.underscore.js
