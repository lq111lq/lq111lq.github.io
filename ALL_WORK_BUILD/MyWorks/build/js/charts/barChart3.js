var charts = (function(charts) {
    charts.barChart3 = function() {
        var _Chart = {};

        var _svg = null;
        var _tooltip = null;

        var _yDef0 = null;
        var _yDef1 = null;
        var _xDefs = null;
        var _xScale = null;
        var _yScale = null;
        var _yAxisTickValues = null;
        var _xAxisTickValues = null;
        var _yAxis = null;
        var _xAxis = null;


        var _options = {};
        var _defult = {
            container: '',
            title: '多维条形图',
            subTitle: '随机生成的数据',
            width: 600,
            height: 400,
            marginsTop: 55,
            marginsLeft: 75,
            marginsRight: 75,
            marginsBottom: 25,
            containerPaddingLeft: 15,
            containerPaddingRight: 15,
            theme: '',
            delay: 500,
            duration: 1000,
            seriesDefs: [],
            data: {},
            legends: ['GML', 'PYP', 'WTC', 'ZTW'],
            categorys: ['重庆', '天津', '上海', '北京'],
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
            renderLegend();
            renderGrids();
            renderYAxis();
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
                .style('fill', function(d, i) {
                    return getColor()(i);
                })
                .attr('x', function(d, i) {
                    return i * 100 + 20;
                })
                .attr('y', 8)
                .attr('width', 25)
                .attr('height', 16)
                .attr('rx', '2');

            updata = graphics.selectAll('text').data(legends);
            enter = updata.enter();
            exit = updata.exit();

            exit.remove();
            enter
                .append('text');
            updata
                .style('fill', function(d, i) {
                    return getColor()(i);
                })
                .attr('x', function(d, i) {
                    return i * 100 + 50;
                })
                .attr('y', 20)
                .text(function(d, i) {
                    return d;
                });

            graphics.attr('transform', 'translate(' + (_options.width - 100 * legends.length) / 2 + ',' + 0 + ')');
        }

        function renderGrids() {
            var gridsData = [];
            var legends = _options.legends;
            var categorys = _options.categorys;
            var yLength = categorys.length;
            var xLength = legends.length;
            for (var i = 0; i < yLength; i++) {
                for (var j = 0; j < xLength; j++) {
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
                    return (d.x * quadrantWidth()) / _options.data.length;
                })
                .attr('y', function(d, i) {
                    return (d.y * quadrantHeight()) / yLength;
                })
                .attr('width', function(d, i) {
                    return quadrantWidth() / xLength;
                })
                .attr('height', function(d, i) {
                    return quadrantHeight() / yLength;
                });
            updata
                .transition()
                .delay(_options.delay)
                .attr('x', function(d, i) {
                    return (d.x * quadrantWidth()) / _options.data.length;
                })
                .attr('y', function(d, i) {
                    return (d.y * quadrantHeight()) / yLength;
                })
                .attr('fill', function(d, i) {
                    return d.color;
                })
                .attr('width', function(d, i) {
                    return quadrantWidth() / xLength;
                })
                .attr('height', function(d, i) {
                    return quadrantHeight() / yLength;
                });
        }

        function renderYAxis() {

            var yScale = d3.scale.ordinal()
                .domain(_options.categorys.map(function(d, i) {
                    return d;
                }))
                .rangeBands([0, quadrantHeight()], 1, 0.5);

            var graphics = _svg.select('g.YAxis');
            if (graphics.empty()) {
                graphics = _svg.append('g').classed('YAxis', true);
            }
            graphics.attr('transform', 'translate(' + xStart() + ',' + yStart() + ')');

            _yAxis = d3.svg.axis()
                .scale(yScale)
                .tickValues(_options.categorys)
                .tickSize(getTheme().axis.size[0], getTheme().axis.size[1])
                .tickPadding(getTheme().axis.padding)
                .tickFormat(function(d) {
                    return d;
                })
                .orient('left');

            graphics.call(_yAxis);

            var axis0 = graphics.select('line.axis0');
            if (axis0.empty()) {
                axis0 = graphics.append('line').classed('domain', true).classed('axis0', true);
            }
            axis0
                .attr('x1', 0)
                .attr('x2', quadrantWidth())
                .attr('y1', 0)
                .attr('y2', 0);

            graphics.selectAll('.domain')
                .style('stroke', getTheme().axis.color)
                .style('stroke-width', getTheme().axis.width)
                .style('fill', 'none');

        }

        function renderBody() {
            var graphics = _svg.select('g.body');
            if (graphics.empty()) {
                graphics = _svg.append('g').classed('body', true);
            }

            graphics.attr('transform', 'translate(' + xStart() + ',' + yStart() + ')');
            drawBarGroups(graphics);
        }

        function drawBarGroups(graphics) {
            var yScale = d3.scale.ordinal()
                .domain(_options.categorys.map(function(d, i) {
                    return i;
                }))
                .rangeBands([0, quadrantHeight()], 0.1, 0.05);
            var xScale = d3.scale.ordinal()
                .domain(_options.data.map(function(d, i) {
                    return i
                }))
                .rangeBands([0, quadrantWidth()], 0.0, 0.00);

            var updata = graphics.selectAll('g.bar-group').data(_options.data);
            var enter = updata.enter();
            var exit = updata.exit();

            var total = 0;
            exit.remove();
            enter
                .append('g')
                .classed('bar-group', true);
            updata
                .attr('transform', function(d, i) {
                    return 'translate(' + 0 + ',' + yScale(i) + ')';
                })
                .each(function(data, i) {
                    var subData = [data.gml, data.pyp, data.wtc, data.ztw]
                    var updata = d3.select(this).selectAll('rect').data(subData);
                    var enter = updata.enter();
                    var exit = updata.exit();

                    exit.remove();
                    enter
                        .append('rect')
                        .attr('x', function(d, i) {
                            return xScale(i);
                        })
                        .attr('y', 0)
                        .attr('height', yScale.rangeBand())
                        .attr('width', 0)
                        .attr('fill', function(d, i) {
                            return getColor()(i);
                        })
                        .attr('rx', 5);
                    updata
                        .transition()
                        .delay(_options.delay)
                        .duration(_options.duration)
                        .attr('x', function(d, i) {
                            return xScale(i);
                        })
                        .attr('y', 0)
                        .attr('height', yScale.rangeBand())
                        .attr('width', function(d, i) {
                            return (xScale.rangeBand() - 10) * 0.01 * d;
                        })
                        .attr('fill', function(d, i) {
                            return getColor()(i);
                        })
                        .attr('rx', 5);

                    var updata = d3.select(this).selectAll('text').data(subData);
                    var enter = updata.enter();
                    var exit = updata.exit();

                    exit.remove();
                    enter
                        .append('text')
                        .text(function(d,i){return d+'%'})
                        .attr('text-anchor', 'middle')
                        .attr('x', function(d, i) {
                            return xScale(i) + 10;
                        })
                        .attr('y', yScale.rangeBand()/2 + 5)
                        .attr('fill', function(d, i) {
                            return getColor()(i);
                        });
                    updata
                        .text(function(d,i){return d+'%'})
                        .transition()
                        .delay(_options.delay)
                        .duration(_options.duration)
                        .attr('x', function(d, i) {
                            return xScale(i) + (xScale.rangeBand() - 10) * 0.005 * d;
                        })
                        .attr('y', yScale.rangeBand()/2 + 5)
                        .attr('fill', '#FFFFFF');
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
