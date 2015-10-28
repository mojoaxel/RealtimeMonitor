var _ = require('lodash-node');
var path = require('path');
var os = require("os");
var express = require('express.io');
var app = express().http().io();

var settings = require('nconf');
settings.argv().env().file({ file: './settings.json' });

var socket_callback = function(type, data) {
	app.io.broadcast(type, data);
};

var VnStat = require('./VnStat.js'); 
var vnstat = new VnStat({
	settings: settings,
	callback: socket_callback
});

var CPU = require('./CPU.js'); 
var cpu = new CPU({
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
		isRunning = true;
	}
	
	socket.on('disconnect', function() {
		user_count--;
		console.log("user connected: user_count=", user_count);
		
		app.io.broadcast('usercount_update', user_count);
		
		if (isRunning) {
			vnstat.stop();
			cpu.stop();
			isRunning = false;
		}
	});
});

app.use('/bower',  express.static(path.join(__dirname, '/bower_components')));
app.use('/static', express.static(path.join(__dirname, '/static')));

app.get('/', function(req, res) {
	res.sendfile(__dirname + '/client.html');
});

app.listen(settings.get('port'));
