var charts = (function(charts) {
    charts.scatterChart2 = function() {
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
            title: '气泡图',
            subTitle: '随机生成的数据',
            width: 600,
            height: 400,
            marginsTop: 50,
            marginsLeft: 50,
            marginsRight: 25,
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
            // renderLegend();
            renderGrids();
            renderYAxis();
            renderXAxis();
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

        function renderLegend() {
            var graphics = _svg.select('g.legends');
            if (graphics.empty()) {
                graphics = _svg.append('g').classed('legends', true);
            }

            var legends = _options.legends;

            var updata = graphics.selectAll('rect').data(legends);
            var enter = updata.enter();
            var exit = updata.exit();

            exit.remove();
            enter
                .append('rect');
            updata
                .style('stroke', '#FF6347')
                .style('stroke-width', '4')
                .style('fill', function(d, i) {
                    if (i) {
                        return '#FFFFFF';
                    } else {
                        return '#FF6347';
                    }
                })
                .attr('x', function(d, i) {
                    return i * 100 + 20;
                })
                .attr('y', 8)
                .attr('width', 23)
                .attr('height', 14)
                .attr('rx', '2');

            updata = graphics.selectAll('text').data(legends);
            enter = updata.enter();
            exit = updata.exit();

            exit.remove();
            enter
                .append('text');
            updata
                .style('fill', '#000')
                .attr('x', function(d, i) {
                    return i * 100 + 50;
                })
                .attr('y', 20)
                .text(function(d, i) {
                    return d;
                });

            graphics.attr('transform', 'translate(' + (_options.width - 100 * legends.length) / 2 + ',' + 0 + ')');
        }

        function renderYAxis() {
            var graphics = _svg.select('g.YAxis');
            if (graphics.empty()) {
                graphics = _svg.append('g').classed('YAxis', true);
            }
            graphics.attr('transform', 'translate(' + xStart() + ',' + yStart() + ')');

            _yScale = d3.scale.linear()
                .domain([_yAxisTickValues[0], _yAxisTickValues[_yAxisTickValues.length - 1]])
                .range([quadrantHeight(), 0]);

            _yAxis = d3.svg.axis()
                .scale(_yScale)
                .tickValues(_yAxisTickValues)
                .tickSize(getTheme().axis.size[0], getTheme().axis.size[1])
                .tickPadding(getTheme().axis.padding)
                .tickFormat(function(d) {
                    return d;
                })
                .orient('left');

            graphics.call(_yAxis);

            var axis0 = graphics.select('line.axis0');
            if (axis0.empty()) {
                axis0 = graphics.append('line').classed('axis0', true);
            }
            axis0
                .attr('x1', 0)
                .attr('x2', quadrantWidth())
                .attr('y1', _yScale(0))
                .attr('y2', _yScale(0))
                .style('stroke', getTheme().axis.color)
                .style('stroke-width', getTheme().axis.width)
                .style('fill', 'none');;

            graphics.selectAll('.domain')
                .style('stroke', 'none')
                .style('stroke-width', 0)
                .style('fill', 'none');

        }

        function renderXAxis() {
            var graphics = _svg.select('g.XAxis');
            if (graphics.empty()) {
                graphics = _svg.append('g').classed('XAxis', true);
            }
            graphics.attr('transform', 'translate(' + xStart() + ',' + yEnd() + ')');

            _xScale = d3.scale.linear()
                .domain([_xAxisTickValues[0], _xAxisTickValues[_xAxisTickValues.length - 1]])
                .range([0, quadrantWidth()]);

            _xAxis = d3.svg.axis()
                .scale(_xScale)
                .tickValues(_xAxisTickValues)
                .tickSize(getTheme().axis.size[0], getTheme().axis.size[1])
                .tickPadding(getTheme().axis.padding)
                .tickFormat(function(d) {
                    return d;
                })
                .orient('bottom');

            graphics.call(_xAxis);

            var axis0 = graphics.select('line.axis0');
            if (axis0.empty()) {
                axis0 = graphics.append('line').classed('axis0', true);
            }
            axis0
                .attr('x1', _xScale(0))
                .attr('x2', _xScale(0))
                .attr('y1', 0)
                .attr('y2', -quadrantHeight())
                .style('stroke', getTheme().axis.color)
                .style('stroke-width', getTheme().axis.width)
                .style('fill', 'none');;

            graphics.selectAll('.domain')
                .style('stroke', 'none')
                .style('stroke-width', 0)
                .style('fill', 'none');

        }

        function renderGrids() {
            var gridsData = [];
            for (var i = 1; i < _yAxisTickValues.length; i++) {
                for (var j = 0; j < _xAxisTickValues.length - 1; j++) {
                    var grid = {};
                    grid.x = j;
                    grid.y = i;
                    if (i % 2 === 0) {
                        if (j % 2 == 0) {
                            grid.color = "#F5F5F5";
                        } else {
                            grid.color = "#F9F9F9";
                        }
                    } else {
                        if (j % 2 == 0) {
                            grid.color = "#F7F7F7";
                        } else {
                            grid.color = "#F3F3F3";
                        }
                    }
                    gridsData.push(grid);
                }
            }

            var graphics = _svg.select('g.grids');
            if (graphics.empty()) {
                graphics = _svg.append('g').classed('grids', true);
            }

            graphics.attr('transform', 'translate(' + xStart() + ',' + yStart() + ')');

            var updata = graphics.selectAll('rect.grid').data(gridsData);
            var enter = updata.enter();
            var exit = updata.exit();

            exit
                .remove();
            enter
                .append('rect')
                .classed('grid', true)
                .attr('stroke', '#EEEEEE')
                .attr('stroke-width', 1)
                .attr('fill', function(d, i) {
                    return d.color;
                })
                .attr('x', function(d, i) {
                    return (d.x * quadrantWidth()) / (_xAxisTickValues.length - 1);
                })
                .attr('y', function(d, i) {
                    return quadrantHeight() - (d.y * quadrantHeight()) / (_yAxisTickValues.length - 1);
                })
                .attr('width', function(d, i) {
                    return quadrantWidth() / (_xAxisTickValues.length - 1);
                })
                .attr('height', function(d, i) {
                    return quadrantHeight() / (_yAxisTickValues.length - 1);
                });
            updata
                .transition()
                .delay(_options.delay)
                .attr('x', function(d, i) {
                    return (d.x * quadrantWidth()) / (_xAxisTickValues.length - 1);
                })
                .attr('y', function(d, i) {
                    return quadrantHeight() - (d.y * quadrantHeight()) / (_yAxisTickValues.length - 1);
                })
                .attr('fill', function(d, i) {
                    return d.color;
                })
                .attr('width', function(d, i) {
                    return quadrantWidth() / (_xAxisTickValues.length - 1);
                })
                .attr('height', function(d, i) {
                    return quadrantHeight() / (_yAxisTickValues.length - 1);
                });
        }



        function renderBody() {
            var graphics = _svg.select('g.body');
            if (graphics.empty()) {
                graphics = _svg.append('g').classed('body', true);
            }

            graphics.attr('transform', 'translate(' + xStart() + ',' + yStart() + ')');
            drawCircle(graphics);
        }

        function drawCircle(graphics) {
            var updata = graphics.selectAll('circle').data(_options.data);
            var enter = updata.enter();
            var exit = updata.exit();

            exit.remove();
            enter
                .append('circle')
                .attr('cx', function(d, i) {
                    return _xScale(0);
                })
                .attr('cy', function(d, i) {
                    return _yScale(0);
                })
                .attr('r', function(d, i) {
                    return d.r;
                })
                .attr('fill', function(d, i) {
                    return rgba(getColor()(d.t), 0.15);
                });
            updata
                .attr('fill', function(d, i) {
                    return rgba(getColor()(d.t), 0.15);
                })
                .transition()
                .delay(_options.delay)
                .duration(_options.duration)
                .attr('cx', function(d, i) {
                    return _xScale(d.x);
                })
                .attr('cy', function(d, i) {
                    return _yScale(d.y);
                })
                .attr('r', function(d, i) {
                    return d.r;
                });
        }

        function showToolTip(html) {
            _tooltip.html(html)
                .style('left', (d3.event.pageX) + 'px')
                .style('top', (d3.event.pageY + 20) + 'px')
                .style('display', 'block');
        }

        function moveToolTip() {
            _tooltip
                .style('left', (d3.event.pageX) + 'px')
                .style('top', (d3.event.pageY + 20) + 'px')
        }

        function hiddenToolTip() {
            _tooltip
                .style('display', 'none');
        }

        function rgba(colorStr, p) {
            var d3Color = d3.rgb(colorStr);
            return 'rgba(' + d3Color.r + ',' + d3Color.g + ',' + d3Color.b + ',' + p + ')';
        }

        function getTheme() {
            return charts.getTheme(_options.theme);
        }

        function getColor() {
            var colors = getTheme().colors;
            return d3.scale.ordinal()
                .domain(colors.map(function(d, i) {
                    return i;
                }))
                .range(colors);
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
