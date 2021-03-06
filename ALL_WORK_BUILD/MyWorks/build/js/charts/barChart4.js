var charts = (function(charts) {
    charts.barChart4 = function() {
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
            marginsTop: 50,
            marginsLeft: 50,
            marginsRight: 50,
            marginsBottom: 50,
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

            yScaleCalculate();

            renderTitle();
            renderLegend();
            renderGrids();
            renderYAxis();
            renderCategory();
            renderBody();
        };

        function yScaleCalculate() {
            var maxValues = [];
            var minValues = [];

            var max = 0;
            var min = 0;
            var niceMin = 0;
            var niceMax = 0;

            for (var i = 0; i < _options.data.length; i++) {
                var subData = _options.data[i];
                maxValues.push(subData.acutal + subData.forecast)
            }
            max = d3.max(maxValues);
            max = 200;
            var dValue = (max - min);
            var exponent = Math.floor(Math.log(dValue) / Math.log(10));
            var niceDValue = Math.pow(10, exponent);

            var original = niceDValue;
            while (niceDValue < dValue) {
                niceDValue += original;
            }

            var dial = niceDValue / (_options.ticksCount - 1)

            niceMax = Math.ceil(max / dial) * dial;

            _yAxisTickValues = [];

            for (var i = 0; true; i++) {
                var value = niceMin + dial * i;
                if (value > niceMax) {
                    break;
                }
                _yAxisTickValues.push(value);
            }

            _yScale = d3.scale.linear()
                .domain([niceMin, niceMax])
                .range([quadrantHeight(), 0]);
        }

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
                axis0 = graphics.append('line').classed('domain', true).classed('axis0', true);
            }
            axis0
                .attr('x1', 0)
                .attr('x2', quadrantWidth())
                .attr('y1', _yScale(0))
                .attr('y2', _yScale(0));

            graphics.selectAll('.domain')
                .style('stroke', getTheme().axis.color)
                .style('stroke-width', getTheme().axis.width)
                .style('fill', 'none');

        }

        function renderGrids() {
            var gridsData = [];
            for (var i = 1; i < _yAxisTickValues.length; i++) {
                for (var j = 0; j < _options.data.length; j++) {
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
                    return quadrantHeight() - (d.y * quadrantHeight()) / (_yAxisTickValues.length - 1);
                })
                .attr('width', function(d, i) {
                    return quadrantWidth() / _options.data.length;
                })
                .attr('height', function(d, i) {
                    return quadrantHeight() / (_yAxisTickValues.length - 1);
                });
            updata
                .transition()
                .delay(_options.delay)
                .attr('x', function(d, i) {
                    return (d.x * quadrantWidth()) / _options.data.length;
                })
                .attr('y', function(d, i) {
                    return quadrantHeight() - (d.y * quadrantHeight()) / (_yAxisTickValues.length - 1);
                })
                .attr('fill', function(d, i) {
                    return d.color;
                })
                .attr('width', function(d, i) {
                    return quadrantWidth() / _options.data.length;
                })
                .attr('height', function(d, i) {
                    return quadrantHeight() / (_yAxisTickValues.length - 1);
                });
        }

        function renderCategory() {
            var xScale = d3.scale.ordinal()
                .domain(_options.data.map(function(d, i) {
                    return i
                }))
                .rangeBands([0, quadrantWidth()], 1, 0.5);
            var graphics = _svg.select('g.categorys');
            if (graphics.empty()) {
                graphics = _svg.append('g').classed('categorys', true);
            }

            graphics.attr('transform', 'translate(' + xStart() + ',' + yStart() + ')');

            var updata = graphics.selectAll('text.category').data(_options.data);
            var enter = updata.enter();
            var exit = updata.exit();

            exit.remove();
            enter
                .append('text')
                .classed('category', true)
                .attr('text-anchor', 'middle')
                .attr('x', function(d, i) {
                    return xScale(i);
                })
                .attr('y', quadrantHeight() + 20)
                .text(function(d, i) {
                    return d.name;
                });
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
            var xScale = d3.scale.ordinal()
                .domain(_options.data.map(function(d, i) {
                    return i
                }))
                .rangeBands([0, quadrantWidth()], 0.4, 0.2);

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
                    return 'translate(' + xScale(i) + ',' + 0 + ')';
                })
                .each(function(data, i) {
                    var updata = d3.select(this).selectAll('rect.total').data([data.acutal + data.forecast]);
                    var enter = updata.enter();
                    var exit = updata.exit();

                    exit.remove();
                    enter
                        .append('rect')
                        .classed('total', true)
                        .attr('x', 1.5)
                        .attr('y', function(d, i) {
                            return _yScale(0) - 1.5;
                        })
                        .attr('width', xScale.rangeBand() - 1.5)
                        .attr('height', function(d, i) {
                            return quadrantHeight() - _yScale(0) - 1.5;
                        })
                        .style('stroke', '#FF6347')
                        .style('stroke-width', '6')
                        .style('fill', '#FFFFFF');
                    updata
                        .transition()
                        .delay(_options.delay)
                        .duration(_options.duration)
                        .attr('y', function(d, i) {
                            return _yScale(d) - 1.5;
                        })
                        .attr('width', xScale.rangeBand() - 1.5)
                        .attr('height', function(d, i) {
                            return quadrantHeight() - _yScale(d) - 1.5;
                        });

                    var updata = d3.select(this).selectAll('text.total').data([data.acutal + data.forecast]);
                    var enter = updata.enter();
                    var exit = updata.exit();

                    exit.remove();
                    enter
                        .append('text')
                        .classed('total', true)
                        .text(function(d, i) {
                            return d;
                        })
                        .attr('text-anchor', 'middle')
                        .attr('x', xScale.rangeBand() / 2)
                        .attr('y', _yScale(0) - 20)
                        .attr('fill', '#FF6347');
                    updata
                        .text(function(d, i) {
                            return d;
                        })
                        .transition()
                        .delay(_options.delay)
                        .duration(_options.duration)
                        .attr('x', xScale.rangeBand() / 2)
                        .attr('y', function(d, i) {
                            return _yScale(d) - 20;
                        });

                    var updata = d3.select(this).selectAll('rect.acutal').data([data.acutal]);
                    var enter = updata.enter();
                    var exit = updata.exit();

                    exit.remove();
                    enter
                        .append('rect')
                        .classed('acutal', true)
                        .attr('x', 3)
                        .attr('y', function(d, i) {
                            return _yScale(0);
                        })
                        .attr('width', xScale.rangeBand() - 3)
                        .attr('height', function(d, i) {
                            return quadrantHeight() - _yScale(0);
                        })
                        .style('fill', '#FF6347');
                    updata
                        .transition()
                        .delay(_options.delay+_options.duration)
                        .duration(_options.duration)
                        .attr('y', function(d, i) {
                            return _yScale(d);
                        })
                        .attr('width', xScale.rangeBand() - 3)
                        .attr('height', function(d, i) {
                            return quadrantHeight() - _yScale(d);
                        });

                    var updata = d3.select(this).selectAll('text.acutal').data([data.acutal]);
                    var enter = updata.enter();
                    var exit = updata.exit();

                    exit.remove();
                    enter
                        .append('text')
                        .classed('acutal', true)
                        .text(function(d, i) {
                            return d;
                        })
                        .attr('text-anchor', 'middle')
                        .attr('x', xScale.rangeBand() / 2)
                        .attr('y', _yScale(0) + 30)
                        .attr('fill', '#FFFFFF');
                    updata
                        .text(function(d, i) {
                            return d;
                        })
                        .transition()
                        .delay(_options.delay + _options.duration)
                        .duration(_options.duration)
                        .attr('x', xScale.rangeBand() / 2)
                        .attr('y', function(d, i) {
                            return _yScale(d) + 30;
                        });
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
