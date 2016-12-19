var free = require('freem');
var _ = require('lodash');

var mem = module.exports = function(options) {
	this.init(options || {});
};

/**
 * @public
 */
mem.prototype.init = function (options) {
	options = options || {};

	this.settings = options.settings;
	this.callback = options.callback;
};

/**
 * @public
 */
mem.prototype.start = function() {
	var that = this;
	this.interval = setInterval(function(){
		free(function(err, list) {
			var mem = _.find(list, { "type": "Mem:"});
			
			that.callback('mem', {
				type: 'mem',
				timestamp: new Date().getTime(),
				total: mem.total,
				free: mem.free,
				perFree: mem.free/mem.total,
				used: mem.used
			});
		});


	}, 500);
};

/**
 * @public
 */
mem.prototype.stop =  function() {
	clearInterval(this.interval);
};
