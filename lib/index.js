
var _ = require('../deps/underscore');
_.str = require('../deps/underscore.string');

require('./common.js').mixin(_);
require('./server.js').mixin(_);

// _.time("support_underscores");
// _.support_underscores(_);
// _.time("support_underscores", true);

module.exports = _;

