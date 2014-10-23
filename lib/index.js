
var _ = require('../deps/underscore');
_.str = require('../deps/underscore.string');
_.mixin(_.str.exports());

require('./common.js').mixin(_);
require('./server.js').mixin(_);

module.exports = _;

