var charts = (function(charts) {
    charts.partitionChart1 = function() {
        var _Chart = {};

        var _svg = null;
        var _tooltip = null;

        var _yDef0 = null;
        var _yDef1 = null;
        var _xDefs = null;
        var _xScale = null;
        var _yScale = null;
        var _yAxisTickValues = [-100, -50, 0, 50, 100];
        var _xAxisTickValues = [-100, -50, 0, 50, 100];
        var _yAxis = null;
        var _xAxis = null;


        var _options = {};
        var _defult = {
            container: '',
            title: '',
            subTitle: '',
            width: 600,
            height: 400,
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

            graphics.attr('transform', 'translate(' + xStart() + ',' + yStart() + ')');

            var partition = d3.layout.partition()
                .size([quadrantWidth(),quadrantHeight()])
                .value(function(d) {
                    return d.name.length;
                });

            var data = $.extend(true, {}, _options.data);
            var nodes = partition.nodes(data);
            var links = partition.links(nodes);

            var rects = graphics.selectAll("g")
                .data(nodes)
                .enter().append("g");

            rects.append("rect")
                .attr("x", function(d) {
                    return d.x;
                })
                .attr("y", function(d) {
                    return d.y;
                })
                .attr("width", function(d) {
                    return d.dx;
                })
                .attr("height", function(d) {
                    return d.dy;
                })
                .style("stroke", "#fff")
                .style("fill", function(d) {
                    return getColor()((d.children ? d : d.parent).name);
                })
                .on("mouseover", function(d) {
                    d3.select(this)
                        .style("fill", d3.rgb(getColor()(d.depth)).darker());
                })
                .on("mouseout", function(d) {
                    d3.select(this)
                        .transition()
                        .duration(200)
                        .style("fill", function(d) {
                            return getColor()((d.children ? d : d.parent).name);
                        });
                });

            rects.append("text")
                .attr("class", "node_text")
                .attr('text-anchor', 'middle')
                .attr("transform", function(d, i) {
                    return "translate(" + (d.x + d.dx/2) + "," + (d.y + d.dy/2) + ")";
                })
                .text(function(d, i) {
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
