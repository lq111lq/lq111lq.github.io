define(function() {
    function KeywordCloudChart(svgElement) {
        var self = this;
        var width = svgElement.clientWidth;
        var height = svgElement.clientHeight;

        var svg = d3.select(svgElement);
        var g = svg.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")

        var fill = d3.scale.category20();

        this.keywords = []
        this.setKeywords = function(keywords) {
            this.keywords = keywords;
            var layout = d3.layout.cloud()
                .size([width, height])
                .words(this.keywords)
                .padding(5)
                .rotate(function() {
                    return Math.random() * 180 - 90;
                })
                .font("myFont")
                .fontSize(function(d) {
                    return d.hot;
                })
                .on("end", draw);

            layout.start();

            function draw(words) {
                var update = g.selectAll("text").data(words,function(d){return d.text});
                var enter = update.enter();
                var exit = update.exit();

                exit.remove();

                enter.append("text")
                    .style("font-size", "0px")
                    .style("font-family", "myFont")
                    .style("fill", function(d, i) {
                        return fill(d.type);
                    })
                    .attr("text-anchor", "middle")
                    .attr("transform", "translate(0,0) rotate(0)")
                    .text(function(d) {
                        return d.text;
                    });
                update
                    .transition()
                    .duration(1000)
                    .style("font-size", function(d) {
                        return d.hot + "px";
                    }).attr("transform", function(d) {
                        return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
                    })
            }
        };
    }
    return KeywordCloudChart;
});
