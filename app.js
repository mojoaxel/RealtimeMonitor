var _ = require('lodash');
var path = require('path');
var os = require("os");
var express = require('express.io');
var app = express().http().io();

var settings = require('nconf');
settings.argv().env().file({ file: './settings.json' });

var socket_callback = function(type, data) {
	app.io.broadcast(type, data);
};

var VNSTAT = require('./plugins/vnstat.js');
var vnstat = new VNSTAT({
	settings: settings,
	callback: socket_callback
});

var CPU = require('./plugins/cpu.js');
var cpu = new CPU({
	settings: settings,
	callback: socket_callback
});

var MEM = require('./plugins/mem.js');
var mem = new MEM({
	settings: settings,
	callback: socket_callback
});

var user_count = 0;
var isRunning = false;
app.io.sockets.on('connection', function(socket) {

	user_count++;
	console.log("user connected: user_count=", user_count);
	app.io.broadcast('usercount_update', user_count);

	if (!isRunning) {
		vnstat.start();
		cpu.start();
		mem.start();
		isRunning = true;
	}

	socket.on('disconnect', function() {
		user_count--;
		console.log("user connected: user_count=", user_count);

		app.io.broadcast('usercount_update', user_count);

		if (isRunning) {
			vnstat.stop();
			cpu.stop();
			mem.stop();
			isRunning = false;
		}
	});
});


app.use('/vendor',  express.static(path.join(__dirname, '/node_modules')));
app.use('/static', express.static(path.join(__dirname, '/static')));

app.get('/', function(req, res) {
	console.log("request");
	res.sendfile(__dirname + '/static/client.html');
});

app.listen(settings.get('port'), function() {
	console.log("listening port ", settings.get('port'));
});

