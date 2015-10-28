$(document).ready(function() {
	var settings = {
		scrollSpeed: 100
	};
	
	var activityTimer;
	
	var chartsData = {};
	
	function pulse() {
		$('#pulse').addClass('active');
		window.clearTimeout(activityTimer);
		activityTimer = setTimeout(function() {
			$('#pulse').removeClass('active');
		}, 2000);
	};
	
	io = io.connect();
	
	io.on('error', function(err) {
		alert("Error: " + err.code + ': ' + err.signal);
	});
	
	io.on('connect_failed', function(){
		alert('Connection Failed');
	});
	
	io.on('usercount_update', function(user_count){
		$('#user_count').text(user_count);
	});
	
	io.on('connect', function(){
		console.log('socket connected');
	});
	
	io.on('disconnect', function () {
		console.log('socket disconnected');
		
		$('#pulse').removeClass('active');
		
		$.map(chartsData, function(iface) {
			iface.chart.stop();
			iface.$chart.addClass('offline');
		});
	});
	
	io.on('initialize', function(data) {
		$('header h1').text(data.hostname);
		$('main').empty();
		
		function createCPUChart(type, unit) {
			chartsData[type] = {
				data: new TimeSeries()
			};
			
			if (!chartsData[type].chart) {
				chartsData[type].chart = new SmoothieChart({
					millisPerPixel: settings.scrollSpeed,
					minValue: 0,
					//maxValue: 100,
					grid: { 
						strokeStyle: 'rgba(255,255,0,0.3)'
					},
					labels: {
						fillStyle: 'rgba(255,255,0,1)',
						fontSize: 12,
						precision: 2
					}
				});
			}
			
			if (!chartsData[type].$chart) {
				var $chart = $(
					'<section class="smoothieGraph ' + type + '">' +
					'	<h2 class="' + type + ' interface">' + type + '</h2> ' +
					'	<small class="' + type + ' caption"><span class="value">-</span> <span class="unit">'+unit+'</span></small>' +
					'	<canvas id="' + type + '" class="graph" width="400" height="200"></canvas>' +
					'</section>');
				
				chartsData[type].$chart = $chart.find('canvas');
				$('main').append($chart);
			}
			
			var options = { strokeStyle: 'rgba(255, 255, 0, 1)', fillStyle: 'rgba(255, 255, 0, 0.1)', lineWidth: 2 };
			
			chartsData[type].chart.addTimeSeries(chartsData[type].data, options);
			
			chartsData[type].chart.streamTo(chartsData[type].$chart.get(0), settings.scrollSpeed*15 );
		}
		
		// CPU chart
		createCPUChart('cpu', "%");
		
		
		
		function createMemChart(type, unit) {
			chartsData[type] = {
				data: new TimeSeries()
			};
			
			if (!chartsData[type].chart) {
				chartsData[type].chart = new SmoothieChart({
					millisPerPixel: settings.scrollSpeed,
					minValue: 0,
					maxValue: 100,
					grid: { 
						strokeStyle: 'rgba(255,0,0,0.3)'
					},
					labels: {
						fillStyle: 'rgba(255,0,0,1)',
						fontSize: 12,
						precision: 2
					}
				});
			}
			
			if (!chartsData[type].$chart) {
				var $chart = $(
					'<section class="smoothieGraph ' + type + '">' +
					'	<h2 class="' + type + ' interface">' + type + '</h2> ' +
					'	<small class="' + type + ' caption"><span class="value">-</span> <span class="unit">'+unit+'</span></small>' +
					'	<canvas id="' + type + '" class="graph" width="400" height="200"></canvas>' +
					'</section>');
				
				chartsData[type].$chart = $chart.find('canvas');
				$('main').append($chart);
			}
			
			var options = { strokeStyle: 'rgba(255,0,0, 1)', fillStyle: 'rgba(255,0,0, 0.2)', lineWidth: 2 };
			
			chartsData[type].chart.addTimeSeries(chartsData[type].data, options);
			
			chartsData[type].chart.streamTo(chartsData[type].$chart.get(0), settings.scrollSpeed*15 );
		}
		
		// CPU chart
		createMemChart('mem', "%");
		
		
		function createIFaceChart(type, unit) {
			chartsData[type] = {
				rx: new TimeSeries(),
				tx: new TimeSeries()
			};
			
			if (!chartsData[type].chart) {
				chartsData[type].chart = new SmoothieChart({
					millisPerPixel: settings.scrollSpeed,
					minValue: 0,
					grid: { 
						strokeStyle: 'rgba(0,255,0,0.3)'
					},
					labels: {
						fillStyle: 'rgba(0,255,0,1)',
						fontSize: 12,
						precision: 2
					}
				});
			}
			
			if (!chartsData[type].$chart) {
				var $chart = $(
					'<section class="smoothieGraph">' +
					'	<h2 class="' + type + ' interface">' + type + '</h2> ' +
					'	<small class="' + type + ' caption"><span class="value">-</span> <span class="unit">'+unit+'</span></small>' +
					'	<canvas id="' + type + '" class="graph" width="400" height="200"></canvas>' +
					'</section>');
				
				chartsData[type].$chart = $chart.find('canvas');
				$('main').append($chart);
			}
			
			var optionsRx = { strokeStyle: 'rgba(0, 0, 255, 1)', fillStyle: 'rgba(0, 0, 255, 0.4)', lineWidth: 2 };
			var optionsTx = { strokeStyle: 'rgba(0, 255, 0, 1)', fillStyle: 'rgba(0, 255, 0, 0.2)', lineWidth: 2 };
			
			chartsData[type].chart.addTimeSeries(chartsData[type].rx, optionsRx);
			chartsData[type].chart.addTimeSeries(chartsData[type].tx, optionsTx);
			
			chartsData[type].chart.streamTo(chartsData[type].$chart.get(0), settings.scrollSpeed*15 );
		}
		
		// IFaces charts
		var ifaces = data.ifaces;
		ifaces.forEach(function(iface) {
			createIFaceChart(iface, "Mbit/s");
		});
		
		updateWidth();
	});
	
	io.on('cpu', function(data) {
		pulse();
		
		chartsData[data.type].data.append(data.timestamp, data.load);
		
		$('.'+data.type+'.caption .value').html(
			'<span class="load">load:' + parseFloat(data.load).toFixed(2) + '</span> '
		);
	});
	
	io.on('mem', function(data) {
		pulse();
		
		var perUsed = (1-data.perFree)*100;
		chartsData[data.type].data.append(data.timestamp, perUsed);
		
		$('.'+data.type+'.caption .value').html(
			'<span class="used">used:' + parseFloat(perUsed).toFixed(2) + '</span> '
		);
	});
	
	io.on('iface', function(data) {
		pulse();
		
		var rx = data.rx/(1000*1024);
		var tx = data.tx/(1000*1024);
		
		chartsData[data.type].rx.append(data.timestamp, rx);
		chartsData[data.type].tx.append(data.timestamp, tx);
		
		$('.'+data.type+'.caption .value').html(
			'<span class="rx">rx:' + parseFloat(rx).toFixed(2) + '</span> ' +
			'<span class="tx">tx:' + parseFloat(tx).toFixed(2) + '</span>'
		);
	});
	
	function updateWidth() {
		console.log("updateWidth");
		var $body = $('body');
		var bodyWidth = $body.innerWidth();
		var scrollWidth = 6;
		
		$.map(chartsData, function(iface) {
			iface.$chart.attr('width', bodyWidth-scrollWidth);
			if (iface.chart) {
				SmoothieChart.prototype.resize.call(iface.chart);
			}
		}, this);
		
		var bodyHeight = $body.innerHeight();
		var headerHeight = $('header').innerHeight();
		var footerHeight = $('footer').innerHeight();
		var borderHeight = 2;
		
		$('main').height(bodyHeight-headerHeight-footerHeight-(2*borderHeight));
	}
	$(window).resize(updateWidth);
});