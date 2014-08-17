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

echo "(function(){"
cat ./deps/handlebars/dist/handlebars.min.js
echo "_.hb = Handlebars;" 
echo "delete this.Handlebars;" 
echo "})();"

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

echo "_.ns = (" 
node -e "console.log(require('./lib/ns.js').mixin.toString())" 
echo ")(_);" 

echo "_.hook = (" 
node -e "console.log(require('./lib/hook.js').mixin.toString())" 
echo ")(_);" 

echo "_.eventEmitter = (" 
node -e "console.log(require('./lib/eventEmitter.js').mixin.toString())" 
echo ")(_);" 
echo "_.events = {};" 
echo "_.eventEmitter(_.events);" 

echo "_.measurer = (" 
node -e "console.log(require('./lib/measurer.js').mixin.toString())" 
echo ")(_);" 
 
echo "})();" 
