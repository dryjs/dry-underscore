
var _ = require('./common.index.js');

require('../lib/client/client.js').mixin(_);
_.http = require('../lib/client/http.js').library(_);

// timer requires _.stderr to be defined for defaults
_.timer = require('../lib/timer.js').library(_);

module.exports = _;
