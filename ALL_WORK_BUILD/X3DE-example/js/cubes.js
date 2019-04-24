(function() {
	var l = 10;
	var s = 0.1;
	var data = [];
	for(var i = -20; i <= 20; i++) {
		for(var j = -20; j <= 20; j++) {
			data.push([i, j]);
		}
	}
	var update = d3.select('#scene-4').selectAll('x-cube').data(data);
	var enter = update.enter();
	var exit = update.exit();

	var lineColors = d3.scale.linear()
		.domain([0, Math.pow(20, 4) / 1500])
		.range(['#00ffff', '#ff4422']);

	enter.append('x-cube').each(function(d) {
		var h = 20 - (Math.abs(d[0]) + Math.abs(d[1]));
		var h = Math.pow(h, 4) / 1500;
		d3.select(this).attr({
			scale: l + ' ' + (l + h) + ' ' + l,
			color: lineColors(h),
			position: d[0] * (l + s) + ' ' + (l + h / 2) + ' ' + d[1] * (l + s),
			material: 'ShininessPhongMaterial'
		});
	});
})();