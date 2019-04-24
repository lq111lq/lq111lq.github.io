define(function() {
    function KeywordCloudChart(svgElement) {
        var self = this;
        var width = svgElement.clientWidth;
        var height = svgElement.clientHeight;

        var svg = d3.select(svgElement);
        var g = svg.append('g').attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')')

        var fill = d3.scale.category20();

        this.keywords = []
        this.setKeywords = function(keywords) {
            this.keywords = keywords;
            var max = d3.max(this.keywords, function(d) {
                return d.hot
            });
            var min = d3.min(this.keywords, function(d) {
                return d.hot
            });
            var scale = d3.scale.linear().domain([min, max]).range([5, 50]);
            var layout = d3.layout.cloud()
                .size([width, height - 50])
                .words(this.keywords.sort(function(a,b){
                    return b.hot < a.hot;
                }))
                .padding(5)
                .rotate(function() {
                    return ~~(Math.random() * 2) * 90;
                })
                .font('myFont')
                .fontSize(function(d) {
                    return scale(d.hot);
                })
                .on('end', draw);

            layout.start();

            function draw(words) {
                var update = g.selectAll('text').data(words, function(d) {
                    return d.text });
                var enter = update.enter();
                var exit = update.exit();

                exit.remove();

                enter.append('text')
                    .style('font-size', '0px')
                    .style('font-family', 'myFont')
                    .style('fill', function(d, i) {
                        return fill(d.type);
                    })
                    .attr('text-anchor', 'middle')
                    .attr('transform', 'translate(0,0) rotate(0)')
                    .text(function(d) {
                        return d.text;
                    });
                update
                    .transition()
                    .duration(1000)
                    .style('font-size', function(d) {
                        return scale(d.hot) + 'px';
                    })
                    .attr('transform', function(d) {
                        return 'translate(' + [d.x, d.y] + ')';
                        /*rotate(' + d.rotate + ')'*/
                        ;
                    })
                    .style('writing-mode', function(d) {
                        if (d.rotate > 0) return 'tb';
                        return null;
                    })
            }
        };

        var labels = ['微博', '微信', '传统媒体'];
        labels.forEach(function(d, i) {
            svg
                .append('rect')
                .attr('x', i * 150 + 100)
                .attr('y', height - 15)
                .attr('width', 25)
                .attr('height', 14)
                .attr('fill', fill(i));
            svg
                .append('text')
                .attr('x', i * 150 + 135)
                .attr('y', height - 3)
                .attr('fill', fill(i))
                .text(d);
        });
    }
    return KeywordCloudChart;
});
