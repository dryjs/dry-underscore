
var _ = require('../deps/underscore/underscore.js');
_.str = require('../deps/underscore.string/dist/underscore.string.min.js');


require('../lib/lodash.js').mixin(_);
require('../lib/common.js').mixin(_);

// log needs to go first 
_.log = require('../lib/log.js').mixin(_);

_.uuid = require('../lib/uuid.js').library(_);
_.sha256 = require('../lib/sha256.js').library(_);
_.inspect = require('../lib/inspect.js').library(_);
_.format = require('../lib/format.js').library(_);
_.gis = require('../lib/gis.js').library(_);
_.test = require('../lib/test.js').library(_);
_.string_builder = require('../lib/string_builder.js').library(_);
_.url = require('../lib/url.js').library(_);
_.querystring = require('../lib/querystring.js').library(_);
_.http_base = require('../lib/http_base.js').library(_);
_.mock = require('../lib/mock.js').mixin(_);
_.html = require('../lib/html.js').mixin(_);
_.ns = require('../lib/ns.js').mixin(_);
_.moment = require('moment-timezone');
require("../deps/moment-duration-format.js").library(_.moment);
_.eventEmitter = require('../lib/eventEmitter.js').mixin(_);
_.event_emitter = _.eventEmitter;
_.events = {};
_.eventEmitter(_.events);
_.fchain = require('../lib/fchain.js').mixin(_);
_.hook = require('../lib/hook.js').mixin(_);
_.hooks = {};
_.hook(_.hooks);
_.pipeline = require('../lib/pipeline.js').mixin(_);
_.waiter = require('../lib/waiter.js').mixin(_);
_.diff = require('deep-diff').diff;
require('../lib/diff.js').library(_);


// _.p("is_node: ", is_node);
// _.p("is_react_native: ", is_react_native);

// var timer = _.time("support_underscores");
// _.support_underscores(_);
// timer();

module.exports = _;

