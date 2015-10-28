var os = require("os-utils");

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
		that.callback('mem', {
			type: 'mem',
			timestamp: new Date().getTime(),
			total: os.totalmem(),
			free: os.freemem(),
			perFree: os.freememPercentage(),
			used: os.totalmem()-os.freemem()
		});
	}, 1000);
};

/**
 * @public
 */
mem.prototype.stop =  function() {
	clearInterval(this.interval);
};