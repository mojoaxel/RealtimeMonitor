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

function loadPlugins(settings, socket_callback) {
	var plugins = [];
	
	settings.get('plugins').forEach(function(pluginSettings) {
		var pluginFile = pluginSettings[0];
		var pluginOptions = pluginSettings[1];
		
		var PLUGIN = require(pluginFile);
		var plugin = new PLUGIN(Object.assign({
			settings,
			callback: socket_callback
		}, pluginOptions));
		plugins.push(plugin);
	});

	return plugins;
}

var plugins = loadPlugins(settings, socket_callback);

var user_count = 0;
var isRunning = false;
app.io.sockets.on('connection', function(socket) {

	user_count++;
	console.log("user connected: user_count=", user_count);
	app.io.broadcast('usercount_update', user_count);

	if (!isRunning) {
		plugins.forEach(function(plugin) {
			plugin.start();
		});
		isRunning = true;
	}

	socket.on('disconnect', function() {
		user_count--;
		console.log("user connected: user_count=", user_count);

		app.io.broadcast('usercount_update', user_count);

		if (isRunning) {
			plugins.forEach(function(plugin) {
				plugin.stop();
			});
			isRunning = false;
		}
	});
});

app.use('/node_modules',  express.static(path.join(__dirname, '/node_modules')));
app.use('/static', express.static(path.join(__dirname, '/static')));

app.get('/', function(req, res) {
	console.log("request");
	res.sendfile(__dirname + '/static/client.html');
});

app.listen(settings.get('port'), function() {
	console.log("listening port ", settings.get('port'));
});

