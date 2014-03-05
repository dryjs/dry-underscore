#!/bin/bash

echo "(function(){"
cat ./deps/underscore/underscore.js

echo "(function(){"
cat ./deps/superagent/superagent.js 
echo "})();" 
echo "_.request = superagent;" 
echo "delete this.superagent;" 

cat ./deps/moment/min/moment.min.js 
echo "_.moment = moment;" 
echo "delete this.moment;" 

#cat ./deps/underscore.string/dist/underscore.string.min.js 
echo "(" 
node -e "console.log(require('./lib/common.js').mixin.toString())" 
echo ")(_);" 
echo "_.dry = (" 
node -e "console.log(require('./lib/dry.js').mixin.toString())" 
echo ")(_);" 
#echo "_.mixin(_.string.exports());" 
echo "_.log = (" 
node -e "console.log(require('./lib/log.js').mixin.toString())" 
echo ")(_);" 
echo "(" 
node -e "console.log(require('./lib/client.js').mixin.toString())" 
echo ")(_);" 
echo "_.eventEmitter = (" 
node -e "console.log(require('./lib/eventEmitter.js').mixin.toString())" 
echo ")(_);" 
echo "_.events = {};" 
echo "_.eventEmitter(_.events);" 
echo "})();" 
