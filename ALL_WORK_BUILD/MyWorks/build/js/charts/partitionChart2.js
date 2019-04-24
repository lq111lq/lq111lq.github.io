var charts = (function(charts) {
    charts.partitionChart2 = function() {
        var _Chart = {};

        var _svg = null;
        var _tooltip = null;

        var _yDef0 = null;
        var _yDef1 = null;
        var _xDefs = null;
        var _xScale = null;
        var _yScale = null;
        var _yAxis = null;
        var _xAxis = null;


        var _options = {};
        var _defult = {
            container: '',
            title: '',
            subTitle: '',
            width: 600,
            height: 600,
            marginsTop: 50,
            marginsLeft: 100,
            marginsRight: 100,
            marginsBottom: 25,
            containerPaddingLeft: 15,
            containerPaddingRight: 15,
            theme: '',
            delay: 500,
            duration: 1000,
            seriesDefs: [],
            data: {},
            quantifier: '',
            ticksCount: 5
        };

        var selectIndex = 0;

        _Chart.setOptions = function(options) {
            _options = {};
            $.extend(_options, _defult, options);
        };

        _Chart.render = function() {
            _options.width = $(_options.container).innerWidth() - _options.containerPaddingLeft - _options.containerPaddingRight;
            if (!_svg) {
                _svg = d3.select(_options.container).append('svg');
            }
            _svg.attr('height', _options.height)
                .attr('width', _options.width);

            _tooltip = d3.select('.tooltip');
            if (_tooltip.empty()) {
                _tooltip = d3.select('body').append('div');
                _tooltip.attr('class', 'tooltip')
                    .style('display', 'none');
            }

            renderTitle();
            renderBody();
        };

        function renderTitle() {
            var graphics = _svg.select('g.title');
            if (graphics.empty()) {
                graphics = _svg.append('g').classed('title', true);
            }

            graphics.attr('transform', 'translate(' + 0 + ',' + 0 + ')');

            var updata = graphics.selectAll('text.title').data([_options.title]);
            var enter = updata.enter();
            var exit = updata.exit();

            exit
                .remove();
            enter
                .append('text')
                .classed('title', true)
                .text(function(d, i) {
                    return d;
                })
                .style('font-size', '18px')
                .style('fill', getTheme().title.color)
                .attr('x', 0)
                .attr('y', 15);

            updata = graphics.selectAll('text.subTitle').data([_options.subTitle]);
            enter = updata.enter();
            exit = updata.exit();

            exit
                .remove();
            enter
                .append('text')
                .classed('subTitle', true)
                .text(function(d, i) {
                    return d;
                })
                .style('font-size', '12px')
                .style('fill', getTheme().subTitle.color)
                .attr('x', 0)
                .attr('y', 35);
        }

        function renderBody() {
            var graphics = _svg.select('g.body');
            if (graphics.empty()) {
                graphics = _svg.append('g').classed('body', true);
            }

            graphics.attr('transform', 'translate(' + _options.width/2 + ',' + _options.height/2 + ')');

            var radius =  Math.min(quadrantHeight(), quadrantWidth()) / 2;
            var partition = d3.layout.partition()
                .size([2 * Math.PI, radius * radius])
                .value(function(d) {
                    return d.name.length;
                });

            var arc = d3.svg.arc()
                .startAngle(function(d) {
                    return d.x;
                })
                .endAngle(function(d) {
                    return d.x + d.dx;
                })
                .innerRadius(function(d) {
                    return Math.sqrt(d.y);
                })
                .outerRadius(function(d) {
                    return Math.sqrt(d.y + d.dy);
                });

            var data = $.extend(true, {}, _options.data);
            var nodes = partition.nodes(data);
            var links = partition.links(nodes);

            var arcs = graphics.selectAll("g")
                .data(nodes)
                .enter().append("g");

            arcs.append("path")
                .attr("display", function(d) {
                    return d.depth ? null : "none";
                })
                .attr("d", arc)
                .style("stroke", "#fff")
                .style("fill", function(d) {
                    return getColor()((d.children ? d : d.parent).name);
                })
                .on("mouseover", function(d) {
                    d3.select(this)
                        .style("fill", "yellow");
                })
                .on("mouseout", function(d) {
                    d3.select(this)
                        .transition()
                        .duration(200)
                        .style("fill", function(d) {
                            return getColor()((d.children ? d : d.parent).name);
                        });
                });


            arcs.append("text")
                .style("font-size", "12px")
                .style("font-family", "simsun")
                .attr("text-anchor", "middle")
                .attr("transform", function(d, i) {
                    //第一个元素（最中间的），只平移不旋转
                    if (i == 0)
                        return "translate(" + arc.centroid(d) + ")";

                    //其他的元素，既平移也旋转
                    var r = 0;
                    if ((d.x + d.dx / 2) / Math.PI * 180 < 180) // 0 - 180 度以内的
                        r = 180 * ((d.x + d.dx / 2 - Math.PI / 2) / Math.PI) + 90;
                    else // 180 - 360 度以内的
                        r = 180 * ((d.x + d.dx / 2 + Math.PI / 2) / Math.PI) - 90;

                    //既平移也旋转
                    return "translate(" + arc.centroid(d) + ")" +
                        "rotate(" + r + ")";
                })
                .text(function(d) {
                    return d.name;
                });
        }

        function rgba(colorStr, p) {
            var d3Color = d3.rgb(colorStr);
            return 'rgba(' + d3Color.r + ',' + d3Color.g + ',' + d3Color.b + ',' + p + ')';
        }

        function getTheme() {
            return charts.getTheme(_options.theme);
        }

        var color = null;

        function getColor() {
            if (!color) {
                var colors = getTheme().colors;
                color = d3.scale.ordinal().range(colors);
            }
            return color;
        }

        function xStart() {
            return _options.marginsLeft;
        }

        function yStart() {
            return _options.marginsTop;
        }

        function xEnd() {
            return _options.width - _options.marginsRight;
        }

        function yEnd() {
            return _options.height - _options.marginsBottom;
        }

        function quadrantWidth() {
            return _options.width - _options.marginsLeft - _options.marginsRight;
        }

        function quadrantHeight() {
            return _options.height - _options.marginsTop - _options.marginsBottom;
        }
        return _Chart;
    };
    return charts;
})(charts || {});
