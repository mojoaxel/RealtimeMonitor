var os = require("os");

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
		that.callback('cpu', {
			type: 'cpu',
			timestamp: new Date().getTime(),
			load: os.loadavg()[0]
		});
	}, 4500);
};

/**
 * @public
 */
CPU.prototype.stop =  function() {
	clearInterval(this.interval);
};