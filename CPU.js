var os = require("os-utils");

var CPU = module.exports = function(options) {
	this.init(options || {});
};

/**
 * @public
 */
CPU.prototype.init = function (options) {
	options = options || {};
	
	this.settings = options.settings;
	this.callback = options.callback;
};

/**
 * @public
 */
CPU.prototype.start = function() {
	var that = this;
	this.interval = setInterval(function(){
		os.cpuUsage(function(load) {
			that.callback('cpu', {
				type: 'cpu',
				timestamp: new Date().getTime(),
				load: load
			});
		});
	}, 1000);
};

/**
 * @public
 */
CPU.prototype.stop =  function() {
	clearInterval(this.interval);
};