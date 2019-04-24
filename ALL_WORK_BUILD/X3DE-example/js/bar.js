(function() {

	function renderChart() {
		var selector = "#scene-3 .bar-group";

		function r() {
			return ~~750 * Math.random() + 250;
		}

		var series = [{
			name: '蒸发量',
			data: [r(), r(), r(), r(), r(), r(), r(), r(), r(), r(), r(), r()]
		}, {
			name: '降水量',
			type: 'bar',
			data: [r(), r(), r(), r(), r(), r(), r(), r(), r(), r(), r(), r()]
		}, {
			name: '挥发量',
			type: 'bar',
			data: [r(), r(), r(), r(), r(), r(), r(), r(), r(), r(), r(), r()]
		}];

		var maxValue = 0;
		var minValue = Infinity;

		var length = 40;
		var width = 20;
		var innerPadding = 5;
		var outerPadding = 25;
		var gap = 15;

		var seriesLength = series.length;
		var offsetII = seriesLength * width + (seriesLength - 1) * innerPadding + outerPadding;
		var offsetI = width + innerPadding;
		var sumWidth = (series[0].data.length) * offsetII - outerPadding - width;

		var xAxis = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

		var xScale = d3.scale.linear()
			.domain([0, xAxis.length - 1])
			.range([-sumWidth / 2 + ((seriesLength - 1) * width + (seriesLength - 1) * innerPadding) / 2, sumWidth / 2 - +((seriesLength - 1) * width + (seriesLength - 1) * innerPadding) / 2]);

		series.forEach(function(serie, i) {
			serie.data.forEach(function(d, ii) {
				if(d > maxValue) {
					maxValue = d;
				}
				if(d < minValue) {
					minValue = d;
				}
			});
		});

		var heightScale = d3.scale.linear()
			.domain([0, maxValue])
			.range([0, 200]);
		var ticks = heightScale.ticks(5);
		var colors = d3.scale.category20();
		var lineColors = d3.scale.linear()
			.domain([0, maxValue])
			.range(['#000000', '#ff8888']);

		//渲染Bar
		series.forEach(function(serie, i) {
			var update = d3.select(selector).selectAll('x-cube.bar-' + i).data(serie.data);
			var enter = update.enter();
			var exit = update.exit();

			exit.remove();
			enter.append('x-cube').classed('bar-' + i, true)
				.each(function(d, ii) {

					var x = ii * offsetII + i * offsetI - sumWidth / 2;
					var y = 0;
					var z = 0;

					d3.select(this).attr({
						shadow: true,
						material: 'ShininessPhongMaterial',
						position: x + ' ' + (y + gap) + ' ' + z,
						scale: width + ' ' + 10 + ' ' + length,
						color: colors(serie.name)
					});
				});
			update.each(function(d, ii) {

				var x = ii * offsetII + i * offsetI - sumWidth / 2;
				var y = 0;
				var z = 0;

				d3.select(this).transition().duration(3000)
					.attr({
						position: x + ' ' + (y + gap + heightScale(d) / 2) + ' ' + z,
						scale: width + ' ' + (heightScale(d)) + ' ' + length,
					});
			});
		});

		// 渲染Y轴 tick line

		var update = d3.select(selector).selectAll('x-line.tick').data(ticks);
		var enter = update.enter();
		var exit = update.exit();

		exit.remove();

		enter.append('x-line').classed('tick', true).each(function(d) {
			var x0 = -sumWidth / 2 - width;
			var y0 = heightScale(d) + gap;
			var z0 = -30;

			var x1 = sumWidth / 2;
			var y1 = heightScale(d) + gap;
			var z1 = -30;

			d3.select(this).attr({
				points: x0 + ' ' + y0 + ' ' + z0 + '  ' + x1 + ' ' + y1 + ' ' + z1,
				color: lineColors(d) + ' ' + lineColors(d)
			});
		});

		update.each(function(d) {
			var x0 = -sumWidth / 2 - width;
			var y0 = heightScale(d) + gap;
			var z0 = -30;

			var x1 = sumWidth / 2;
			var y1 = heightScale(d) + gap;
			var z1 = -30;

			d3.select(this).transition().duration(3000)
				.attr({
					points: x0 + ' ' + y0 + ' ' + z0 + '  ' + x1 + ' ' + y1 + ' ' + z1,
					color: lineColors(d) + ' ' + lineColors(d)
				});
		});

		//x轴 tick text
		var update = d3.select(selector).selectAll('x-canvas-plane.tickx').data(xAxis);
		var enter = update.enter();
		var exit = update.exit();

		exit.remove();
		enter.append('x-canvas-plane').classed('tickx', true)
			.each(function(d, ii) {
				d3.select(this).attr({
					width: 640,
					height: 640,
					position: xScale(ii) + ' 10 50',
					rotation: '-90 0 -45',
					scale: '0.05 0.05 0.05'
				});
				this.clear();
				var ctx = this.getContext('2d');

				ctx.font = "400px Arial";
				ctx.fillStyle = '#000000';
				ctx.textAlign = "center";
				ctx.textBaseline = "middle";
				ctx.fillText(d, 320, 320);

				this.update();
			});

		//y轴 tick text
		var update = d3.select(selector).selectAll('x-canvas-plane.tickY').data(ticks);
		var enter = update.enter();
		var exit = update.exit();

		exit.remove();
		enter.append('x-canvas-plane').classed('tickY', true)
			.each(function(d, ii) {
				d3.select(this).attr({
					width: 640,
					height: 640,
					position: (-sumWidth / 2 - width - 15) + ' ' + (heightScale(d) + gap) + ' -30',
					rotation: '0 0 0',
					scale: '0.03 0.03 0.03'
				});

				this.clear();
				var ctx = this.getContext('2d');

				ctx.font = "400px Arial";
				ctx.fillStyle = lineColors(d);
				ctx.textAlign = "center";
				ctx.textBaseline = "middle";
				ctx.fillText(d, 320, 320);

				this.update();
			});

		update.each(function(d, ii) {
			d3.select(this).transition().duration(3000).attr({
				position: (-sumWidth / 2 - width - 15) + ' ' + (heightScale(d) + gap) + ' -30',
			});

			this.clear();
			var ctx = this.getContext('2d');

			ctx.font = "400px Arial";
			ctx.fillStyle = lineColors(d);
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillText(d, 320, 320);

			this.update();
		});

		//渲染legend

		var update = d3.select(selector).selectAll('x-canvas-plane.legend').data(series);
		var enter = update.enter();
		var exit = update.exit();

		exit.remove();

		enter.append('x-canvas-plane').classed('legend', true)
			.each(function(d, ii) {
				d3.select(this).attr({
					width: 640,
					height: 640,
					position: xScale(ii) + ' ' + (heightScale(maxValue) + gap + 35) + ' -30',
					rotation: '0 0 0',
					scale: '0.1 0.1 0.1'
				});

				this.clear();
				var ctx = this.getContext('2d');

				ctx.font = "900 200px Arial";
				ctx.fillStyle = colors(d.name);
				ctx.textAlign = "center";
				ctx.textBaseline = "middle";
				ctx.fillText(d.name, 320, 320);
				ctx.strokeText(d.name, 320, 320);

				this.update();
			});
	}
	renderChart();
	window.setInterval(renderChart, 2000);
})();