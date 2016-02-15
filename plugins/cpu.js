var os = require("os-utils");

var cpu = module.exports = function(options) {
	this.init(options || {});
};

/**
 * @public
 */
cpu.prototype.init = function (options) {
	options = options || {};

	this.settings = options.settings;
	this.callback = options.callback;
};

/**
 * @public
 */
cpu.prototype.start = function() {
	var that = this;
	this.interval = setInterval(function(){
		os.cpuUsage(function(load) {
			that.callback('cpu', {
				type: 'cpu',
				timestamp: new Date().getTime(),
				load: load
			});
		});
	}, 500);
};

/**
 * @public
 */
cpu.prototype.stop =  function() {
	clearInterval(this.interval);
};
