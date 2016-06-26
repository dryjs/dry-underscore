"use strict";

require('tamejs').register();

var _ = require('./common.index.js');

require('../lib/node/io.js').mixin(_);
require('../lib/node/render.tjs').mixin(_);
require('../lib/node/node.js').mixin(_);

_.hb = require('handlebars');

_.http = require('../lib/node/http.js').library(_);

_.tls = require('../lib/node/tls.js').library(_);
_.glob = require('../lib/node/glob.js').mixin(_);
_.path = require('../lib/node/path.js').mixin(_);
_.fs = require('../lib/node/fs.tjs').fs(_);
_.npm = require('../lib/node/npm.tjs').npm(_);
_.source = require('../lib/node/source.tjs').source(_);
_.middleware = require('../lib/node/middleware.js').middleware(_);
_.builder = require('../lib/node/builder.tjs').mixin(_);


// timer requires _.stderr to be defined for defaults
_.timer = require('../lib/timer.js').library(_);

module.exports = _;
