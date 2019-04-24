define(function() {
    function EmotionSpeedometerChart(svgElement) {
        var self = this;

        var svg = d3.select(svgElement);
        var width = svgElement.clientWidth;
        var height = svgElement.clientHeight;

        var colors = d3.scale.linear().domain([0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]).range([
            '#144471',
            '#2caff0',
            '#51b7f0',
            '#7eb384',
            '#aea669',
            '#d3992d',
            '#e78d19',
            '#e77819',
            '#e85f1a',
            '#BF431B',
            '#AF2E04',
        ]);

        var scaleData = [];
        for (var i = 0; i <= 100; i++) {
            scaleData.push(i);
        }
        var updata = svg.selectAll('rect.bg').data(scaleData);
        var enter = updata.enter();

        enter.append('rect')
            .classed('bg', true)
            .attr('x', function(d) {
                return d * 4;
            })
            .attr('y', 20)
            .attr('width', 2)
            .attr('height', 20)
            .attr('fill', function(d) {
                return '#666666';
            });

        this.setValue = function(value) {
            var data = [];
            for (var i = 0; i <= ~~value; i++) {
                data.push(i);
            }
            var updata = svg.selectAll('rect.scale').data(data);
            var enter = updata.enter();
            var exit = updata.exit();

            exit.remove();
            enter.append('rect').classed('scale', true)
                .attr('x', function(d) { return d * 4; })
                .attr('y', 20)
                .attr('width', 2)
                .attr('height', 20);
            updata.attr('fill', function(d) {
                return colors(d);
            });
        }
    }
    return EmotionSpeedometerChart;
});
