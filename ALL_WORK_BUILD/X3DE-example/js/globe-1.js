(function() {
	var data = [{
		name: '北京',
		lat: 39.5,
		log: 116.3,
		population: '2152'
	}, {
		name: '上海',
		lat: 31.2,
		log: 120.8,
		population: '2426'
	}, {
		name: '广州',
		lat: 23.11,
		log: 113.27,
		population: '1350'
	}, {
		name: '新加坡',
		lat: 1.3,
		log: 103.8,
		population: '553'
	}, {
		name: '雅加达',
		lat: -6.2,
		log: 106.8,
		population: '850'
	}, {
		name: '悉尼',
		lat: -33.9,
		log: 156.8,
		population: '420'
	}, {
		name: '莫斯科',
		lat: 55.7,
		log: 37.4,
		population: '420'
	}, {
		name: '伦敦',
		lat: 51.5,
		log: 2.4,
		population: '420'
	}];

	var index = 0;
	var cLog = data[0].log;
	var cLat = data[0].lat;
	d3.select('#scene-5 x-group').datum({}).attr('rotation', (cLat) + ' ' + (-cLog) + ' 0')

	window.setInterval(function() {
		index++;
		if(index >= data.length) {
			index = 0;
		}

		var cLog = data[index].log;
		var cLat = data[index].lat;
		d3.select('#scene-5 x-group').transition().duration(3000).attr('rotation', (cLat) + ' ' + (-cLog) + ' 0');

		var update = d3.select('#scene-5 x-group').selectAll('x-canvas-sprite').data(data);

		update.each(function(d, i) {
			this.clear();
			if(Math.abs(d.log - cLog) + Math.abs(d.lat - cLat) > 60) {
				console.log(Math.abs(d.log - cLog) + Math.abs(d.lat - cLat));
				this.update();
				return;
			}

			var ctx = this.getContext('2d');

			ctx.beginPath();
			ctx.strokeStyle = '#ffffff';
			ctx.arc(500, 125, 25, 0, 2 * Math.PI);

			if(d.log < cLog) {
				ctx.moveTo(475, 125);
				ctx.lineTo(0, 125);

				ctx.fillStyle = '#ffffff';
				ctx.font = '900 30px Arial';

				ctx.textAlign = 'start';

				ctx.textBaseline = 'bottom';
				ctx.fillText(d.name, 0, 125 - 5);

				ctx.textBaseline = 'top';
				ctx.fillText('人口:' + d.population + '万', 0, 125 + 5);

				ctx.stroke();
			} else {

				ctx.moveTo(525, 125);
				ctx.lineTo(1000, 125);

				ctx.fillStyle = '#ffffff';
				ctx.font = '900 30px Arial';

				ctx.textAlign = 'end';

				ctx.textBaseline = 'bottom';
				ctx.fillText(d.name, 1000, 125 - 5);

				ctx.textBaseline = 'top';
				ctx.fillText('人口:' + d.population + '万', 1000, 125 + 5);

				ctx.stroke();
			}

			this.update();
		});
	}, 5 * 1000);

	var update = d3.select('#scene-5 x-group').selectAll('x-canvas-sprite').data(data);
	var enter = update.enter();
	var exit = update.exit();

	exit.remove();
	enter.append('x-canvas-sprite').each(function(d, i) {
		var r = 51;
		var x = 0;
		var y = 0;
		var z = 0;

		var lat = d.lat;

		var log = d.log;

		var y = Math.sin(lat / 180 * Math.PI) * r;
		var r0 = Math.cos(lat / 180 * Math.PI) * r;

		var x = Math.sin(log / 180 * Math.PI) * r0;
		var z = Math.cos(log / 180 * Math.PI) * r0;

		d3.select(this).attr({
			'position': x + ' ' + y + ' ' + z,
			'width': '1000',
			'height': 250,
			'scale': '0.05 0.05 0.05'
		});
	});
	update.each(function(d, i) {

		this.clear();
		if(Math.abs(d.log - cLog) + Math.abs(d.lat - cLat) > 60) {
			console.log(Math.abs(d.log - cLog) + Math.abs(d.lat - cLat));
			this.update();
			return;
		}

		var ctx = this.getContext('2d');

		ctx.beginPath();
		ctx.strokeStyle = '#ffffff'
		ctx.arc(500, 125, 25, 0, 2 * Math.PI);

		if(d.log < cLog) {
			ctx.moveTo(475, 125);
			ctx.lineTo(0, 125);

			ctx.fillStyle = '#ffffff';
			ctx.font = '900 30px Arial';

			ctx.textAlign = 'start';

			ctx.textBaseline = 'bottom';
			ctx.fillText(d.name, 0, 125 - 5);

			ctx.textBaseline = 'top';
			ctx.fillText('人口:' + d.population + '万', 0, 125 + 5);

			ctx.stroke();
		} else {

			ctx.moveTo(525, 125);
			ctx.lineTo(1000, 125);

			ctx.fillStyle = '#ffffff';
			ctx.font = '900 30px Arial';

			ctx.textAlign = 'end';

			ctx.textBaseline = 'bottom';
			ctx.fillText(d.name, 1000, 125 - 5);

			ctx.textBaseline = 'top';
			ctx.fillText('人口:' + d.population + '万', 1000, 125 + 5);

			ctx.stroke();
		}

		this.update();
	});
})();