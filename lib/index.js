
var _ = require('../deps/underscore');
_.str = require('../deps/underscore.string');

require('./common.js').mixin(_);
require('./server.js').mixin(_);

// var timer = _.time("support_underscores");
// _.support_underscores(_);
// timer();

module.exports = _;

