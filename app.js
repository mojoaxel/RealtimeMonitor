var path = require('path');
var express = require('express.io');
var app = express().http().io();

var settings = require('nconf');
settings.argv().env().file({ file: './settings.json' });

var user_count = 0;

var VnStat = require('./VnStat.js'); 
var vnstat = new VnStat({
	socket: app.io,
	settings: settings
});

app.io.sockets.on('connection', function(socket) {
	
	user_count++;
	console.log("user connected: user_count=", user_count);
	app.io.broadcast('usercount_update', user_count);
	vnstat.start();
	
	socket.on('disconnect', function() {
		user_count--;
		console.log("user connected: user_count=", user_count);
		app.io.broadcast('usercount_update', user_count);
		vnstat.stop();
	});
});

app.io.on('connect', function() {
	console.log('connect');
});

app.use('/static', express.static(path.join(__dirname, '/bower_components')));

app.get('/', function(req, res) {
	res.sendfile(__dirname + '/client.html');
});

app.listen(settings.get('port'));