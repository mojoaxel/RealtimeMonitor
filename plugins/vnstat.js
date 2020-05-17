var _ = require('lodash-node');
var fs = require('fs');
var os = require("os");

var StringDecoder = require('string_decoder').StringDecoder;
var decoder = new StringDecoder('utf8');

var child_process = require('child_process');

var vnstat = module.exports = function(options) {
	this.init(options || {});
};

/**
 * @public
 */
vnstat.prototype.init = function (options) {
	options = options || {};

	this.ifaces = [];
	this._vnstat_process = {};

	//TODO error handling
	this.settings = options.settings;
	this.callback = options.callback;
	this.ifaceFilter = options.ifaceFilter || [];
};

/**
 * @private
 */
vnstat.prototype._startVnstat = function(iface) {
	var that = this;

	if (this._vnstat_process[iface]) {
		return false;
	}

	try {
	this._vnstat_process[iface] = child_process.spawn('vnstat', ['-i',iface, '--live','0']);
	} catch(err) {
		throw new Error('could not start "vnstat". Make sure it is installed.: ', err);
	}
	this._vnstat_process[iface].stdout.on('data', function(data) {
		var line = decoder.write(data);

		function getFactorByPrefix(symbol) {
			switch (symbol) {
				case 'T' : return 1000000000000;	//tera
				case 'G' : return 1000000000;		//giga
				case 'M' : return 1000000;			//mega
				case 'k' : return 1000;				//kilo
				case 'h' : return 100;				//hecto
				case 'da': return 10;				//deca
				case 'd' : return 0.1;				//deci
				case 'c' : return 0.01;				//centi
				case 'm' : return 0.001;			//milli
				case 'μ' : return 0.000001;			//micro
				case 'n' : return 0.000000001;		//nano
				case 'p' : return 0.000000000001;	//pico
				default  : return 1;
			}
		}

		//   rx:       16 kbit/s    15 p/s          tx:      304 kbit/s    33 p/s
		var regex_rx = /rx:(.*?)\s(\w?)bit\/s/;
		var regex_tx = /tx:(.*?)\s(\w?)bit\/s/;
		var result_rx = line.match(regex_rx);
		var result_tx = line.match(regex_tx);

		if (result_rx && result_tx) {
			var rx = parseInt(result_rx[1]) * getFactorByPrefix(result_rx[2]);
			var tx = parseInt(result_tx[1]) * getFactorByPrefix(result_tx[2]);

			that.callback('iface', {
				type: iface,
				timestamp: new Date().getTime(),
				rx: rx,
				tx: tx,
				unit: 'bit/s'
			});
		}

		return true;
	});
};

/**
 * @private
 */
vnstat.prototype._stopVnstat = function(iface) {
	if (this._vnstat_process[iface]) {
		this._vnstat_process[iface].kill('SIGINT');
		delete this._vnstat_process[iface];
		return true;
	}
	return false;
};

/**
 * @public
 */
vnstat.prototype.start = function() {
	this.ifaces = _.keys(os.networkInterfaces());
	this.ifaces = _.difference(this.ifaces, this.ifaceFilter) || [];

	this.callback('initialize', {
		hostname: os.hostname(),
		ifaces: this.ifaces
	});

	this.ifaces.forEach(function(iface) {
		this._startVnstat(iface);
	}, this);
};

/**
 * @public
 */
vnstat.prototype.stop =  function() {
	this.ifaces.forEach(function(iface) {
		this._stopVnstat(iface);
	}, this);
	this._vnstat_process = {};
};
