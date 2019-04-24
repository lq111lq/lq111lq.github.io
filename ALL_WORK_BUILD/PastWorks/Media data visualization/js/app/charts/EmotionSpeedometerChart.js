define(function() {
    function EmotionSpeedometerChart(svgElement) {
        var self = this;
        this.lastValue = this.value = 0;

        var svg = d3.select(svgElement);
        var width = svgElement.clientWidth;
        var height = svgElement.clientHeight;

        var colors = d3.scale.linear().domain([0, 10, 20, 30, 40, 50, 60, 70, 80, 90]).range([
            '#144471',
            '#2caff0',
            '#51b7f0',
            '#7eb384',
            '#aea669',
            '#d3992d',
            '#e78d19',
            '#e77819',
            '#e85f1a',
            '#BF431B'
        ]);

        var text = svg.append('text').text('00')
            .attr('x', width / 2)
            .attr('y', height / 2) 
            .attr('dy', '25') 
            .attr('fill', '#e77018')
            .attr('text-anchor', 'middle')
            .style('font-size', '35px')
            .style('font-family', 'number')
            .style('letter-spacing', '3px');

        var scales = svg.append('g').classed('scales', true)
            .attr('transform', 'translate(' + width / 2 + ',' + (height / 2 + 5) + ')');

        var arrowPoint = svg.append('circle')
            .attr('r', 4)
            .attr('transform', 'translate(' + width / 2 + ',' + (height / 2 + 5) + ')');
        var arrowLine = svg.append('line')
            .attr('stroke-width', 4)
            .attr('transform', 'translate(' + width / 2 + ',' + (height / 2 + 5) + ')');

        function drawArrow(value) {
            var r = 70;
            var x1 = Math.cos((value * 3 + 135) / 180 * Math.PI) * r;
            var y1 = Math.sin((value * 3 + 135) / 180 * Math.PI) * r;

            var r = 37.5;
            var x2 = Math.cos((value * 3 + 135) / 180 * Math.PI) * r;
            var y2 = Math.sin((value * 3 + 135) / 180 * Math.PI) * r;

            arrowPoint
                .attr('cx', x1)
                .attr('cy', y1)
                .attr('fill', colors(value));

            arrowLine
                .attr('x1', x1)
                .attr('y1', y1)
                .attr('x2', x2)
                .attr('y2', y2)
                .attr('stroke', colors(value));
        }

        function drawScale() {
            for (var i = 0; i <= 9; i++) {
                var r = 100;
                var x = Math.cos((i * 30 + 135) / 180 * Math.PI) * r;
                var y = Math.sin((i * 30 + 135) / 180 * Math.PI) * r;

                var text = scales.append('text').text(i * 10);
                text.attr('x', x);
                text.attr('y', y);
                text.attr('fill', colors(i * 10));
                text.attr('text-anchor', 'middle')
                text.style('font-size', '10px');
            }
        };

        (function draw() {
            drawScale();
            drawArrow(self.value);
        })();

        function render() {
            text.transition().duration(5000).tween("text", function() {
                var i = d3.interpolateRound(self.lastValue, self.value);
                return function(t) {
                    var v = i(t);

                    drawArrow(v);

                    text.attr('fill', colors(v));
                    if (v < 10) {
                        v = '0' + v;
                    }
                    this.textContent = v;
                };
            });
        }

        this.setValue = function(value) {
            this.lastValue = this.value;
            this.value = value;
            render();
        }
    }
    return EmotionSpeedometerChart;
});
