(function() {
	var selector = "#scene-5 .pie-group";
	var data = [];
	var pieData;
	var sum = 0;



	var colorsScale = d3.scale.category20();

	function renderArch() {
		var update = d3.select(selector).selectAll('x-arch-column').data(pieData, function(d, i) {
			return d.name;
		});
		var enter = update.enter();
		var exit = update.exit();
		/*<x-arch-column color="#FF0000" startangle="0" endangle="360" outerradius="120" innerradius="100" height="25" material="ShininessPhongMaterial"></x-arch-column>*/
		exit.remove();
		enter.append('x-arch-column')
			.attr({
				'shadow': true,
				'material': 'ShininessPhongMaterial',
				'startangle': function(d, i) {
					return 180 * d.startAngle / Math.PI;
				},
				'endangle': function(d, i) {
					return 180 * d.startAngle / Math.PI;
				},
				'outerradius': 185,
				'innerradius': 85,
				'height': 50,
				'color': function(d, i) {
					return colorsScale(d.name);
				}
			});
		update.transition().duration(1000)
			.attr({
				'startangle': function(d, i) {
					return 180 * d.startAngle / Math.PI;
				},
				'endangle': function(d, i) {
					return 180 * (d.endAngle - d.padAngle) / Math.PI;
				},
			});
	}

	function renderLine() {
		var update = d3.select(selector).selectAll('x-line').data(pieData, function(d, i) {
			return d.name;
		});
		var enter = update.enter();
		var exit = update.exit();

		exit.remove();
		enter.append('x-line').each(function(d) {
			var height = 65;
			var angle = (d.startAngle + d.endAngle - d.padAngle) / 2;
			var radius = 185 * 0.8 + 85 * 0.2;

			var color = colorsScale(d.name);

			var x0 = radius * Math.cos(angle);
			var y0 = height;
			var z0 = -radius * Math.sin(angle);

			var x1 = radius * Math.cos(angle);
			var y1 = height;
			var z1 = -radius * Math.sin(angle);

			var pointsStr = "" + x0 + ' ' + y0 + ' ' + z0 + '  ' + x1 + ' ' + y1 + ' ' + z1;
			var colorStr = color + " " + color;

			d3.select(this).attr('points', pointsStr).attr('color', colorStr);
		});
		update.each(function(d) {
			var height = 65;
			var angle = (d.startAngle + d.endAngle - d.padAngle) / 2;
			var radius = 185 * 0.8 + 85 * 0.2;

			var color = colorsScale(d.name);

			var x0 = radius * Math.cos(angle);
			var y0 = height;
			var z0 = -radius * Math.sin(angle);

			var x1 = 1.1 * 185 * Math.cos(angle);
			var y1 = height + 50;
			var z1 = -1.1 * 185 * Math.sin(angle);

			var pointsStr = "" + x0 + ' ' + y0 + ' ' + z0 + '  ' + x1 + ' ' + y1 + ' ' + z1;
			var colorStr = color + " " + color;

			d3.select(this).transition().duration(1000)
				.attr('points', pointsStr).attr('color', colorStr);
		});
	}

	/*<x-canvas-sprite width="100" height="100" rotation="0 0 0" material="ShininessPhongMaterial"></x-canvas-sprite>*/
	function renderCanvasSprite() {
		var update = d3.select(selector).selectAll('x-canvas-sprite').data(pieData, function(d, i) {
			return d.name;
		});
		var enter = update.enter();
		var exit = update.exit();

		enter.append('x-canvas-sprite');
		update.each(function(d) {
			var height = 65;
			var angle = (d.startAngle + d.endAngle - d.padAngle) / 2;
			var radius = 185 * 0.8 + 85 * 0.2;

			var x = 1.2 * 185 * Math.cos(angle);
			var y = height + 60;
			var z = -1.2 * 185 * Math.sin(angle);

			d3.select(this)
				.attr('width', '500')
				.attr('height', '100')
				.transition().duration(1000)
				.attr('position', x + ' ' + y + ' ' + z)
				.attr('scale', '0.5 0.5 0.5');

			this.clear();
			var ctx = this.getContext('2d');

			//					ctx.fillStyle = 'rgba(255,0,0,0.1)';
			//					ctx.fillRect(0,0,100,100);

			var color0 = colorsScale(d.name);
			var color1 = d3.rgb(color0).darker(1).toString();
			var color2 = d3.rgb(color0).toString();
			var color3 = d3.rgb(color0).brighter(1).toString();

			var gradient = ctx.createLinearGradient(0, 0, 500, 0);
			gradient.addColorStop('0', color1);
			gradient.addColorStop('0.5', color2);
			gradient.addColorStop('1.0', color3);
			// 用渐变填色

			ctx.font = "40px Arial";
			ctx.fillStyle = gradient;
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillText(d.name + ' ' + ~~(100 * d.value / sum) + '%', 250, 50);

			this.update();
		});
	}

	function renderChart() {
		data = [{
			value: ~~(Math.random() * 300) + 150,
			name: '谷歌'
		}, {
			value: ~~(Math.random() * 200) + 100,
			name: '遨游'
		}, {
			value: ~~(Math.random() * 200) + 150,
			name: '火狐'
		}, {
			value: ~~(Math.random() * 100) + 50,
			name: 'IE'
		}, {
			value: ~~(Math.random() * 150) + 25,
			name: '360浏览器'
		}]
		sum = 0;
		pieData = d3.layout.pie().value(function(d) {
				sum += d.value;
				return d.value;
			})
			.sort(function() {
				return false;
			})
			.startAngle(0 * Math.PI)
			.endAngle(Math.PI * 2)
			.padAngle(10 * Math.PI / 180)(data);
		pieData.forEach(function(d) {
			d.name = d.data.name;
		});
		renderArch();
		renderLine();
		renderCanvasSprite();
	}

	renderChart();
	window.setInterval(renderChart, 2000);
})();

(function() {
	var selector = "#scene-6 .pie-group";
	var data = [];
	var pieData;
	var sum = 0;



	var colorsScale = d3.scale.category20();

	function renderArch() {
		var update = d3.select(selector).selectAll('x-arch-column').data(pieData, function(d, i) {
			return d.name;
		});
		var enter = update.enter();
		var exit = update.exit();
		/*<x-arch-column color="#FF0000" startangle="0" endangle="360" outerradius="120" innerradius="100" height="25" material="ShininessPhongMaterial"></x-arch-column>*/
		exit.remove();
		enter.append('x-arch-column')
			.attr({
				'shadow': true,
				'material': 'ShininessPhongMaterial',
				'startangle': function(d, i) {
					return 180 * d.startAngle / Math.PI;
				},
				'endangle': function(d, i) {
					return 180 * d.startAngle / Math.PI;
				},
				'outerradius': 185,
				'innerradius': 85,
				'height': 50,
				'color': function(d, i) {
					return colorsScale(d.name);
				}
			});
		update.transition().duration(1000)
			.attr({
				'startangle': function(d, i) {
					return 180 * d.startAngle / Math.PI;
				},
				'endangle': function(d, i) {
					return 180 * (d.endAngle - d.padAngle) / Math.PI;
				},
			});
	}

	function renderLine() {
		var update = d3.select(selector).selectAll('x-line').data(pieData, function(d, i) {
			return d.name;
		});
		var enter = update.enter();
		var exit = update.exit();

		exit.remove();
		enter.append('x-line').each(function(d) {
			var height = 65;
			var angle = (d.startAngle + d.endAngle - d.padAngle) / 2;
			var radius = 185 * 0.8 + 85 * 0.2;

			var color = colorsScale(d.name);

			var x0 = radius * Math.cos(angle);
			var y0 = height;
			var z0 = -radius * Math.sin(angle);

			var x1 = radius * Math.cos(angle);
			var y1 = height;
			var z1 = -radius * Math.sin(angle);

			var pointsStr = "" + x0 + ' ' + y0 + ' ' + z0 + '  ' + x1 + ' ' + y1 + ' ' + z1;
			var colorStr = color + " " + color;

			d3.select(this).attr('points', pointsStr).attr('color', colorStr);
		});
		update.each(function(d) {
			var height = 65;
			var angle = (d.startAngle + d.endAngle - d.padAngle) / 2;
			var radius = 185 * 0.8 + 85 * 0.2;

			var color = colorsScale(d.name);

			var x0 = radius * Math.cos(angle);
			var y0 = height;
			var z0 = -radius * Math.sin(angle);

			var x1 = 1.1 * 185 * Math.cos(angle);
			var y1 = height + 50;
			var z1 = -1.1 * 185 * Math.sin(angle);

			var pointsStr = "" + x0 + ' ' + y0 + ' ' + z0 + '  ' + x1 + ' ' + y1 + ' ' + z1;
			var colorStr = color + " " + color;

			d3.select(this).transition().duration(1000)
				.attr('points', pointsStr).attr('color', colorStr);
		});
	}

	/*<x-canvas-sprite width="100" height="100" rotation="0 0 0" material="ShininessPhongMaterial"></x-canvas-sprite>*/
	function renderCanvasSprite() {
		var update = d3.select(selector).selectAll('x-canvas-sprite').data(pieData, function(d, i) {
			return d.name;
		});
		var enter = update.enter();
		var exit = update.exit();

		enter.append('x-canvas-sprite');
		update.each(function(d) {
			var height = 65;
			var angle = (d.startAngle + d.endAngle - d.padAngle) / 2;
			var radius = 185 * 0.8 + 85 * 0.2;

			var x = 1.2 * 185 * Math.cos(angle);
			var y = height + 60;
			var z = -1.2 * 185 * Math.sin(angle);

			d3.select(this)
				.attr('width', '500')
				.attr('height', '100')
				.transition().duration(1000)
				.attr('position', x + ' ' + y + ' ' + z)
				.attr('scale', '0.5 0.5 0.5');

			this.clear();
			var ctx = this.getContext('2d');

			//					ctx.fillStyle = 'rgba(255,0,0,0.1)';
			//					ctx.fillRect(0,0,100,100);

			var color0 = colorsScale(d.name);
			var color1 = d3.rgb(color0).darker(1).toString();
			var color2 = d3.rgb(color0).toString();
			var color3 = d3.rgb(color0).brighter(1).toString();

			var gradient = ctx.createLinearGradient(0, 0, 500, 0);
			gradient.addColorStop('0', color1);
			gradient.addColorStop('0.5', color2);
			gradient.addColorStop('1.0', color3);
			// 用渐变填色

			ctx.font = "40px Arial";
			ctx.fillStyle = gradient;
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillText(d.name + ' ' + ~~(100 * d.value / sum) + '%', 250, 50);

			this.update();
		});
	}

	function renderChart() {
		data = [{
			value: ~~(Math.random() * 300) + 150,
			name: '谷歌'
		}, {
			value: ~~(Math.random() * 200) + 100,
			name: '遨游'
		}, {
			value: ~~(Math.random() * 200) + 150,
			name: '火狐'
		}, {
			value: ~~(Math.random() * 100) + 50,
			name: 'IE'
		}, {
			value: ~~(Math.random() * 150) + 25,
			name: '360浏览器'
		}]
		sum = 0;
		pieData = d3.layout.pie().value(function(d) {
				sum += d.value;
				return d.value;
			})
			.sort(function() {
				return false;
			})
			.startAngle(0 * Math.PI)
			.endAngle(Math.PI * 2)
			.padAngle(10 * Math.PI / 180)(data);
		pieData.forEach(function(d) {
			d.name = d.data.name;
		});
		renderArch();
		renderLine();
		renderCanvasSprite();
	}

	renderChart();
	window.setInterval(renderChart, 2000);
})();

(function() {
	var selector = "#scene-7 .pie-group";
	var data = [];
	var pieData;
	var sum = 0;



	var colorsScale = d3.scale.category20();

	function renderArch() {
		var update = d3.select(selector).selectAll('x-arch-column').data(pieData, function(d, i) {
			return d.name;
		});
		var enter = update.enter();
		var exit = update.exit();
		/*<x-arch-column color="#FF0000" startangle="0" endangle="360" outerradius="120" innerradius="100" height="25" material="ShininessPhongMaterial"></x-arch-column>*/
		exit.remove();
		enter.append('x-arch-column')
			.attr({
				'shadow': true,
				'material': 'ShininessPhongMaterial',
				'startangle': function(d, i) {
					return 180 * d.startAngle / Math.PI;
				},
				'endangle': function(d, i) {
					return 180 * d.startAngle / Math.PI;
				},
				'outerradius': 185,
				'innerradius': 85,
				'height': 50,
				'color': function(d, i) {
					return colorsScale(d.name);
				}
			});
		update.transition().duration(1000)
			.attr({
				'startangle': function(d, i) {
					return 180 * d.startAngle / Math.PI;
				},
				'endangle': function(d, i) {
					return 180 * (d.endAngle - d.padAngle) / Math.PI;
				},
			});
	}

	function renderLine() {
		var update = d3.select(selector).selectAll('x-line').data(pieData, function(d, i) {
			return d.name;
		});
		var enter = update.enter();
		var exit = update.exit();

		exit.remove();
		enter.append('x-line').each(function(d) {
			var height = 65;
			var angle = (d.startAngle + d.endAngle - d.padAngle) / 2;
			var radius = 185 * 0.8 + 85 * 0.2;

			var color = colorsScale(d.name);

			var x0 = radius * Math.cos(angle);
			var y0 = height;
			var z0 = -radius * Math.sin(angle);

			var x1 = radius * Math.cos(angle);
			var y1 = height;
			var z1 = -radius * Math.sin(angle);

			var pointsStr = "" + x0 + ' ' + y0 + ' ' + z0 + '  ' + x1 + ' ' + y1 + ' ' + z1;
			var colorStr = color + " " + color;

			d3.select(this).attr('points', pointsStr).attr('color', colorStr);
		});
		update.each(function(d) {
			var height = 65;
			var angle = (d.startAngle + d.endAngle - d.padAngle) / 2;
			var radius = 185 * 0.8 + 85 * 0.2;

			var color = colorsScale(d.name);

			var x0 = radius * Math.cos(angle);
			var y0 = height;
			var z0 = -radius * Math.sin(angle);

			var x1 = 1.1 * 185 * Math.cos(angle);
			var y1 = height + 50;
			var z1 = -1.1 * 185 * Math.sin(angle);

			var pointsStr = "" + x0 + ' ' + y0 + ' ' + z0 + '  ' + x1 + ' ' + y1 + ' ' + z1;
			var colorStr = color + " " + color;

			d3.select(this).transition().duration(1000)
				.attr('points', pointsStr).attr('color', colorStr);
		});
	}

	/*<x-canvas-sprite width="100" height="100" rotation="0 0 0" material="ShininessPhongMaterial"></x-canvas-sprite>*/
	function renderCanvasSprite() {
		var update = d3.select(selector).selectAll('x-canvas-sprite').data(pieData, function(d, i) {
			return d.name;
		});
		var enter = update.enter();
		var exit = update.exit();

		enter.append('x-canvas-sprite');
		update.each(function(d) {
			var height = 65;
			var angle = (d.startAngle + d.endAngle - d.padAngle) / 2;
			var radius = 185 * 0.8 + 85 * 0.2;

			var x = 1.2 * 185 * Math.cos(angle);
			var y = height + 60;
			var z = -1.2 * 185 * Math.sin(angle);

			d3.select(this)
				.attr('width', '500')
				.attr('height', '100')
				.transition().duration(1000)
				.attr('position', x + ' ' + y + ' ' + z)
				.attr('scale', '0.5 0.5 0.5');

			this.clear();
			var ctx = this.getContext('2d');

			//					ctx.fillStyle = 'rgba(255,0,0,0.1)';
			//					ctx.fillRect(0,0,100,100);

			var color0 = colorsScale(d.name);
			var color1 = d3.rgb(color0).darker(1).toString();
			var color2 = d3.rgb(color0).toString();
			var color3 = d3.rgb(color0).brighter(1).toString();

			var gradient = ctx.createLinearGradient(0, 0, 500, 0);
			gradient.addColorStop('0', color1);
			gradient.addColorStop('0.5', color2);
			gradient.addColorStop('1.0', color3);
			// 用渐变填色

			ctx.font = "40px Arial";
			ctx.fillStyle = gradient;
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillText(d.name + ' ' + ~~(100 * d.value / sum) + '%', 250, 50);

			this.update();
		});
	}

	function renderChart() {
		data = [{
			value: ~~(Math.random() * 300) + 150,
			name: '谷歌'
		}, {
			value: ~~(Math.random() * 200) + 100,
			name: '遨游'
		}, {
			value: ~~(Math.random() * 200) + 150,
			name: '火狐'
		}, {
			value: ~~(Math.random() * 100) + 50,
			name: 'IE'
		}, {
			value: ~~(Math.random() * 150) + 25,
			name: '360浏览器'
		}]
		sum = 0;
		pieData = d3.layout.pie().value(function(d) {
				sum += d.value;
				return d.value;
			})
			.sort(function() {
				return false;
			})
			.startAngle(0 * Math.PI)
			.endAngle(Math.PI * 2)
			.padAngle(10 * Math.PI / 180)(data);
		pieData.forEach(function(d) {
			d.name = d.data.name;
		});
		renderArch();
		renderLine();
		renderCanvasSprite();
	}

	renderChart();
	window.setInterval(renderChart, 2000);
})();

(function() {
	var selector = "#scene-8 .pie-group";
	var data = [];
	var pieData;
	var sum = 0;



	var colorsScale = d3.scale.category20();

	function renderArch() {
		var update = d3.select(selector).selectAll('x-arch-column').data(pieData, function(d, i) {
			return d.name;
		});
		var enter = update.enter();
		var exit = update.exit();
		/*<x-arch-column color="#FF0000" startangle="0" endangle="360" outerradius="120" innerradius="100" height="25" material="ShininessPhongMaterial"></x-arch-column>*/
		exit.remove();
		enter.append('x-arch-column')
			.attr({
				'shadow': true,
				'material': 'ShininessPhongMaterial',
				'startangle': function(d, i) {
					return 180 * d.startAngle / Math.PI;
				},
				'endangle': function(d, i) {
					return 180 * d.startAngle / Math.PI;
				},
				'outerradius': 185,
				'innerradius': 85,
				'height': 50,
				'color': function(d, i) {
					return colorsScale(d.name);
				}
			});
		update.transition().duration(1000)
			.attr({
				'startangle': function(d, i) {
					return 180 * d.startAngle / Math.PI;
				},
				'endangle': function(d, i) {
					return 180 * (d.endAngle - d.padAngle) / Math.PI;
				},
			});
	}

	function renderLine() {
		var update = d3.select(selector).selectAll('x-line').data(pieData, function(d, i) {
			return d.name;
		});
		var enter = update.enter();
		var exit = update.exit();

		exit.remove();
		enter.append('x-line').each(function(d) {
			var height = 65;
			var angle = (d.startAngle + d.endAngle - d.padAngle) / 2;
			var radius = 185 * 0.8 + 85 * 0.2;

			var color = colorsScale(d.name);

			var x0 = radius * Math.cos(angle);
			var y0 = height;
			var z0 = -radius * Math.sin(angle);

			var x1 = radius * Math.cos(angle);
			var y1 = height;
			var z1 = -radius * Math.sin(angle);

			var pointsStr = "" + x0 + ' ' + y0 + ' ' + z0 + '  ' + x1 + ' ' + y1 + ' ' + z1;
			var colorStr = color + " " + color;

			d3.select(this).attr('points', pointsStr).attr('color', colorStr);
		});
		update.each(function(d) {
			var height = 65;
			var angle = (d.startAngle + d.endAngle - d.padAngle) / 2;
			var radius = 185 * 0.8 + 85 * 0.2;

			var color = colorsScale(d.name);

			var x0 = radius * Math.cos(angle);
			var y0 = height;
			var z0 = -radius * Math.sin(angle);

			var x1 = 1.1 * 185 * Math.cos(angle);
			var y1 = height + 50;
			var z1 = -1.1 * 185 * Math.sin(angle);

			var pointsStr = "" + x0 + ' ' + y0 + ' ' + z0 + '  ' + x1 + ' ' + y1 + ' ' + z1;
			var colorStr = color + " " + color;

			d3.select(this).transition().duration(1000)
				.attr('points', pointsStr).attr('color', colorStr);
		});
	}

	/*<x-canvas-sprite width="100" height="100" rotation="0 0 0" material="ShininessPhongMaterial"></x-canvas-sprite>*/
	function renderCanvasSprite() {
		var update = d3.select(selector).selectAll('x-canvas-sprite').data(pieData, function(d, i) {
			return d.name;
		});
		var enter = update.enter();
		var exit = update.exit();

		enter.append('x-canvas-sprite');
		update.each(function(d) {
			var height = 65;
			var angle = (d.startAngle + d.endAngle - d.padAngle) / 2;
			var radius = 185 * 0.8 + 85 * 0.2;

			var x = 1.2 * 185 * Math.cos(angle);
			var y = height + 60;
			var z = -1.2 * 185 * Math.sin(angle);

			d3.select(this)
				.attr('width', '500')
				.attr('height', '100')
				.transition().duration(1000)
				.attr('position', x + ' ' + y + ' ' + z)
				.attr('scale', '0.5 0.5 0.5');

			this.clear();
			var ctx = this.getContext('2d');

			//					ctx.fillStyle = 'rgba(255,0,0,0.1)';
			//					ctx.fillRect(0,0,100,100);

			var color0 = colorsScale(d.name);
			var color1 = d3.rgb(color0).darker(1).toString();
			var color2 = d3.rgb(color0).toString();
			var color3 = d3.rgb(color0).brighter(1).toString();

			var gradient = ctx.createLinearGradient(0, 0, 500, 0);
			gradient.addColorStop('0', color1);
			gradient.addColorStop('0.5', color2);
			gradient.addColorStop('1.0', color3);
			// 用渐变填色

			ctx.font = "40px Arial";
			ctx.fillStyle = gradient;
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillText(d.name + ' ' + ~~(100 * d.value / sum) + '%', 250, 50);

			this.update();
		});
	}

	function renderChart() {
		data = [{
			value: ~~(Math.random() * 300) + 150,
			name: '谷歌'
		}, {
			value: ~~(Math.random() * 200) + 100,
			name: '遨游'
		}, {
			value: ~~(Math.random() * 200) + 150,
			name: '火狐'
		}, {
			value: ~~(Math.random() * 100) + 50,
			name: 'IE'
		}, {
			value: ~~(Math.random() * 150) + 25,
			name: '360浏览器'
		}]
		sum = 0;
		pieData = d3.layout.pie().value(function(d) {
				sum += d.value;
				return d.value;
			})
			.sort(function() {
				return false;
			})
			.startAngle(0 * Math.PI)
			.endAngle(Math.PI * 2)
			.padAngle(10 * Math.PI / 180)(data);
		pieData.forEach(function(d) {
			d.name = d.data.name;
		});
		renderArch();
		renderLine();
		renderCanvasSprite();
	}

	renderChart();
	window.setInterval(renderChart, 2000);
})();

(function() {
	var selector = "#scene-9 .pie-group";
	var data = [];
	var pieData;
	var sum = 0;



	var colorsScale = d3.scale.category20();

	function renderArch() {
		var update = d3.select(selector).selectAll('x-arch-column').data(pieData, function(d, i) {
			return d.name;
		});
		var enter = update.enter();
		var exit = update.exit();
		/*<x-arch-column color="#FF0000" startangle="0" endangle="360" outerradius="120" innerradius="100" height="25" material="ShininessPhongMaterial"></x-arch-column>*/
		exit.remove();
		enter.append('x-arch-column')
			.attr({
				'shadow': true,
				'material': 'ShininessPhongMaterial',
				'startangle': function(d, i) {
					return 180 * d.startAngle / Math.PI;
				},
				'endangle': function(d, i) {
					return 180 * d.startAngle / Math.PI;
				},
				'outerradius': 185,
				'innerradius': 85,
				'height': 50,
				'color': function(d, i) {
					return colorsScale(d.name);
				}
			});
		update.transition().duration(1000)
			.attr({
				'startangle': function(d, i) {
					return 180 * d.startAngle / Math.PI;
				},
				'endangle': function(d, i) {
					return 180 * (d.endAngle - d.padAngle) / Math.PI;
				},
			});
	}

	function renderLine() {
		var update = d3.select(selector).selectAll('x-line').data(pieData, function(d, i) {
			return d.name;
		});
		var enter = update.enter();
		var exit = update.exit();

		exit.remove();
		enter.append('x-line').each(function(d) {
			var height = 65;
			var angle = (d.startAngle + d.endAngle - d.padAngle) / 2;
			var radius = 185 * 0.8 + 85 * 0.2;

			var color = colorsScale(d.name);

			var x0 = radius * Math.cos(angle);
			var y0 = height;
			var z0 = -radius * Math.sin(angle);

			var x1 = radius * Math.cos(angle);
			var y1 = height;
			var z1 = -radius * Math.sin(angle);

			var pointsStr = "" + x0 + ' ' + y0 + ' ' + z0 + '  ' + x1 + ' ' + y1 + ' ' + z1;
			var colorStr = color + " " + color;

			d3.select(this).attr('points', pointsStr).attr('color', colorStr);
		});
		update.each(function(d) {
			var height = 65;
			var angle = (d.startAngle + d.endAngle - d.padAngle) / 2;
			var radius = 185 * 0.8 + 85 * 0.2;

			var color = colorsScale(d.name);

			var x0 = radius * Math.cos(angle);
			var y0 = height;
			var z0 = -radius * Math.sin(angle);

			var x1 = 1.1 * 185 * Math.cos(angle);
			var y1 = height + 50;
			var z1 = -1.1 * 185 * Math.sin(angle);

			var pointsStr = "" + x0 + ' ' + y0 + ' ' + z0 + '  ' + x1 + ' ' + y1 + ' ' + z1;
			var colorStr = color + " " + color;

			d3.select(this).transition().duration(1000)
				.attr('points', pointsStr).attr('color', colorStr);
		});
	}

	/*<x-canvas-sprite width="100" height="100" rotation="0 0 0" material="ShininessPhongMaterial"></x-canvas-sprite>*/
	function renderCanvasSprite() {
		var update = d3.select(selector).selectAll('x-canvas-sprite').data(pieData, function(d, i) {
			return d.name;
		});
		var enter = update.enter();
		var exit = update.exit();

		enter.append('x-canvas-sprite');
		update.each(function(d) {
			var height = 65;
			var angle = (d.startAngle + d.endAngle - d.padAngle) / 2;
			var radius = 185 * 0.8 + 85 * 0.2;

			var x = 1.2 * 185 * Math.cos(angle);
			var y = height + 60;
			var z = -1.2 * 185 * Math.sin(angle);

			d3.select(this)
				.attr('width', '500')
				.attr('height', '100')
				.transition().duration(1000)
				.attr('position', x + ' ' + y + ' ' + z)
				.attr('scale', '0.5 0.5 0.5');

			this.clear();
			var ctx = this.getContext('2d');

			//					ctx.fillStyle = 'rgba(255,0,0,0.1)';
			//					ctx.fillRect(0,0,100,100);

			var color0 = colorsScale(d.name);
			var color1 = d3.rgb(color0).darker(1).toString();
			var color2 = d3.rgb(color0).toString();
			var color3 = d3.rgb(color0).brighter(1).toString();

			var gradient = ctx.createLinearGradient(0, 0, 500, 0);
			gradient.addColorStop('0', color1);
			gradient.addColorStop('0.5', color2);
			gradient.addColorStop('1.0', color3);
			// 用渐变填色

			ctx.font = "40px Arial";
			ctx.fillStyle = gradient;
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillText(d.name + ' ' + ~~(100 * d.value / sum) + '%', 250, 50);

			this.update();
		});
	}

	function renderChart() {
		data = [{
			value: ~~(Math.random() * 300) + 150,
			name: '谷歌'
		}, {
			value: ~~(Math.random() * 200) + 100,
			name: '遨游'
		}, {
			value: ~~(Math.random() * 200) + 150,
			name: '火狐'
		}, {
			value: ~~(Math.random() * 100) + 50,
			name: 'IE'
		}, {
			value: ~~(Math.random() * 150) + 25,
			name: '360浏览器'
		}]
		sum = 0;
		pieData = d3.layout.pie().value(function(d) {
				sum += d.value;
				return d.value;
			})
			.sort(function() {
				return false;
			})
			.startAngle(0 * Math.PI)
			.endAngle(Math.PI * 2)
			.padAngle(10 * Math.PI / 180)(data);
		pieData.forEach(function(d) {
			d.name = d.data.name;
		});
		renderArch();
		renderLine();
		renderCanvasSprite();
	}

	renderChart();
	window.setInterval(renderChart, 2000);
})();

(function() {
	var selector = "#scene-10 .pie-group";
	var data = [];
	var pieData;
	var sum = 0;



	var colorsScale = d3.scale.category20();

	function renderArch() {
		var update = d3.select(selector).selectAll('x-arch-column').data(pieData, function(d, i) {
			return d.name;
		});
		var enter = update.enter();
		var exit = update.exit();
		/*<x-arch-column color="#FF0000" startangle="0" endangle="360" outerradius="120" innerradius="100" height="25" material="ShininessPhongMaterial"></x-arch-column>*/
		exit.remove();
		enter.append('x-arch-column')
			.attr({
				'shadow': true,
				'material': 'ShininessPhongMaterial',
				'startangle': function(d, i) {
					return 180 * d.startAngle / Math.PI;
				},
				'endangle': function(d, i) {
					return 180 * d.startAngle / Math.PI;
				},
				'outerradius': 185,
				'innerradius': 85,
				'height': 50,
				'color': function(d, i) {
					return colorsScale(d.name);
				}
			});
		update.transition().duration(1000)
			.attr({
				'startangle': function(d, i) {
					return 180 * d.startAngle / Math.PI;
				},
				'endangle': function(d, i) {
					return 180 * (d.endAngle - d.padAngle) / Math.PI;
				},
			});
	}

	function renderLine() {
		var update = d3.select(selector).selectAll('x-line').data(pieData, function(d, i) {
			return d.name;
		});
		var enter = update.enter();
		var exit = update.exit();

		exit.remove();
		enter.append('x-line').each(function(d) {
			var height = 65;
			var angle = (d.startAngle + d.endAngle - d.padAngle) / 2;
			var radius = 185 * 0.8 + 85 * 0.2;

			var color = colorsScale(d.name);

			var x0 = radius * Math.cos(angle);
			var y0 = height;
			var z0 = -radius * Math.sin(angle);

			var x1 = radius * Math.cos(angle);
			var y1 = height;
			var z1 = -radius * Math.sin(angle);

			var pointsStr = "" + x0 + ' ' + y0 + ' ' + z0 + '  ' + x1 + ' ' + y1 + ' ' + z1;
			var colorStr = color + " " + color;

			d3.select(this).attr('points', pointsStr).attr('color', colorStr);
		});
		update.each(function(d) {
			var height = 65;
			var angle = (d.startAngle + d.endAngle - d.padAngle) / 2;
			var radius = 185 * 0.8 + 85 * 0.2;

			var color = colorsScale(d.name);

			var x0 = radius * Math.cos(angle);
			var y0 = height;
			var z0 = -radius * Math.sin(angle);

			var x1 = 1.1 * 185 * Math.cos(angle);
			var y1 = height + 50;
			var z1 = -1.1 * 185 * Math.sin(angle);

			var pointsStr = "" + x0 + ' ' + y0 + ' ' + z0 + '  ' + x1 + ' ' + y1 + ' ' + z1;
			var colorStr = color + " " + color;

			d3.select(this).transition().duration(1000)
				.attr('points', pointsStr).attr('color', colorStr);
		});
	}

	/*<x-canvas-sprite width="100" height="100" rotation="0 0 0" material="ShininessPhongMaterial"></x-canvas-sprite>*/
	function renderCanvasSprite() {
		var update = d3.select(selector).selectAll('x-canvas-sprite').data(pieData, function(d, i) {
			return d.name;
		});
		var enter = update.enter();
		var exit = update.exit();

		enter.append('x-canvas-sprite');
		update.each(function(d) {
			var height = 65;
			var angle = (d.startAngle + d.endAngle - d.padAngle) / 2;
			var radius = 185 * 0.8 + 85 * 0.2;

			var x = 1.2 * 185 * Math.cos(angle);
			var y = height + 60;
			var z = -1.2 * 185 * Math.sin(angle);

			d3.select(this)
				.attr('width', '500')
				.attr('height', '100')
				.transition().duration(1000)
				.attr('position', x + ' ' + y + ' ' + z)
				.attr('scale', '0.5 0.5 0.5');

			this.clear();
			var ctx = this.getContext('2d');

			//					ctx.fillStyle = 'rgba(255,0,0,0.1)';
			//					ctx.fillRect(0,0,100,100);

			var color0 = colorsScale(d.name);
			var color1 = d3.rgb(color0).darker(1).toString();
			var color2 = d3.rgb(color0).toString();
			var color3 = d3.rgb(color0).brighter(1).toString();

			var gradient = ctx.createLinearGradient(0, 0, 500, 0);
			gradient.addColorStop('0', color1);
			gradient.addColorStop('0.5', color2);
			gradient.addColorStop('1.0', color3);
			// 用渐变填色

			ctx.font = "40px Arial";
			ctx.fillStyle = gradient;
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillText(d.name + ' ' + ~~(100 * d.value / sum) + '%', 250, 50);

			this.update();
		});
	}

	function renderChart() {
		data = [{
			value: ~~(Math.random() * 300) + 150,
			name: '谷歌'
		}, {
			value: ~~(Math.random() * 200) + 100,
			name: '遨游'
		}, {
			value: ~~(Math.random() * 200) + 150,
			name: '火狐'
		}, {
			value: ~~(Math.random() * 100) + 50,
			name: 'IE'
		}, {
			value: ~~(Math.random() * 150) + 25,
			name: '360浏览器'
		}]
		sum = 0;
		pieData = d3.layout.pie().value(function(d) {
				sum += d.value;
				return d.value;
			})
			.sort(function() {
				return false;
			})
			.startAngle(0 * Math.PI)
			.endAngle(Math.PI * 2)
			.padAngle(10 * Math.PI / 180)(data);
		pieData.forEach(function(d) {
			d.name = d.data.name;
		});
		renderArch();
		renderLine();
		renderCanvasSprite();
	}

	renderChart();
	window.setInterval(renderChart, 2000);
})();