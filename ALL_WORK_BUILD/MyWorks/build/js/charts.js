var charts = (function(charts) {
    charts.barChart1 = function() {
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
            title: '',
            subTitle: '',
            width: 600,
            height: 300,
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

            _yDef0 = _options.seriesDefs.filter(function(d) {
                return d.type === 'y+';
            })[0];
            _yDef1 = _options.seriesDefs.filter(function(d) {
                return d.type === 'y-';
            })[0];

            var max = 0;
            var min = 0;
            var total = 0;
            for (var i = 0; i < _options.data.length; i++) {
                var subData = _options.data[i];
                total += _yDef0.accessor(subData);
                if (total > max) {
                    max = total;
                }
                total -= _yDef1.accessor(subData);
                if (total < min) {
                    min = total;
                }
            }

            var dValue = (max - min);
            var exponent = Math.floor(Math.log(dValue) / Math.log(10));
            var niceDValue = Math.pow(10, exponent);

            var original = niceDValue;
            while (niceDValue < dValue) {
                niceDValue += original;
            }

            var dial = niceDValue / (_options.ticksCount - 1)

            var niceMax = Math.ceil(max / dial) * dial;
            var niceMin = Math.floor(min / dial) * dial;

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

            var defs = _options.seriesDefs.filter(function(d) {
                return d.type === 'y+' || d.type === 'y-'
            });

            var updata = graphics.selectAll('rect').data(defs);
            var enter = updata.enter();
            var exit = updata.exit();

            exit.remove();
            enter
                .append('rect');
            updata
                .style('fill', function(d, i) {
                    return getColor(defs)(i);
                })
                .attr('x', function(d, i) {
                    return i * 100 + 20;
                })
                .attr('y', 8)
                .attr('width', 25)
                .attr('height', 16)
                .attr('rx', '2');

            updata = graphics.selectAll('text').data(defs);
            enter = updata.enter();
            exit = updata.exit();

            exit.remove();
            enter
                .append('text');
            updata
                .style('fill', function(d, i) {
                    return getColor(defs)(i);
                })
                .attr('x', function(d, i) {
                    return i * 100 + 50;
                })
                .attr('y', 20)
                .text(function(d, i) {
                    return d.displayName;
                });

            graphics.attr('transform', 'translate(' + (_options.width - 100 * defs.length) / 2 + ',' + 0 + ')');
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
                    return d + _yDef0.unit;
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
                    return d.date;
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
                .rangeBands([0, quadrantWidth()]);

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
                    var xScaleInner = d3.scale.ordinal()
                        .domain([0, 1])
                        .rangeRoundBands([0, xScale.rangeBand()], 0.15, 0.15);

                    total += _yDef0.accessor(data);
                    var updata = d3.select(this).selectAll('rect.bar-1').data([data]);
                    var enter = updata.enter();
                    var exit = updata.exit();

                    exit.remove();
                    enter
                        .append('rect')
                        .classed('bar-1', true)
                        .style('fill', getColor()(0))
                        .attr('rx', 5)
                        .attr('x', xScaleInner(0))
                        .attr('y', _yScale(0))
                        .attr('width', xScaleInner.rangeBand())
                        .attr('height', 0);
                    updata
                        .transition()
                        .delay(_options.delay)
                        .duration(_options.duration)
                        .attr('x', xScaleInner(0))
                        .attr('y', _yScale(total))
                        .attr('width', xScaleInner.rangeBand())
                        .attr('height', _yScale(0) - _yScale(_yDef0.accessor(data)));

                    var updata = d3.select(this).selectAll('text.text-1').data([data]);
                    var enter = updata.enter();
                    var exit = updata.exit();

                    exit.remove();
                    enter
                        .append('text')
                        .classed('text-1', true)
                        .style('fill', getColor()(0))
                        .attr('text-anchor', 'middle')
                        .attr('x', xScaleInner(0) + xScaleInner.rangeBand() / 2)
                        .attr('y', _yScale(0) - 5)
                        .text('0');
                    updata
                        .text('+'+_yDef0.accessor(data))
                        .transition()
                        .delay(_options.delay)
                        .duration(_options.duration)
                        .attr('x', xScaleInner(0) + xScaleInner.rangeBand() / 2)
                        .attr('y', _yScale(total) - 5);

                    var updata = d3.select(this).selectAll('rect.bar-2').data([data]);
                    var enter = updata.enter();
                    var exit = updata.exit();

                    exit.remove();
                    enter
                        .append('rect')
                        .classed('bar-2', true)
                        .style('fill', getColor()(1))
                        .attr('rx', 5)
                        .attr('x', xScaleInner(1))
                        .attr('y', _yScale(1))
                        .attr('width', xScaleInner.rangeBand())
                        .attr('height', 0);
                    updata
                        .transition()
                        .delay(_options.delay)
                        .duration(_options.duration)
                        .attr('x', xScaleInner(1))
                        .attr('y', _yScale(total))
                        .attr('width', xScaleInner.rangeBand())
                        .attr('height', _yScale(0) - _yScale(_yDef1.accessor(data)));

                    total -= _yDef1.accessor(data);
                    var updata = d3.select(this).selectAll('text.text-2').data([data]);
                    var enter = updata.enter();
                    var exit = updata.exit();

                    exit.remove();
                    enter
                        .append('text')
                        .classed('text-2', true)
                        .style('fill', getColor()(1))
                        .attr('text-anchor', 'middle')
                        .attr('x', xScaleInner(1) + xScaleInner.rangeBand() / 2)
                        .attr('y', _yScale(0) + 15)
                        .text('0');
                    updata
                        .text('-'+_yDef1.accessor(data))
                        .transition()
                        .delay(_options.delay)
                        .duration(_options.duration)
                        .attr('x', xScaleInner(1) + xScaleInner.rangeBand() / 2)
                        .attr('y', _yScale(total) + 15);

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
var charts = (function(charts) {
    charts.barChart2 = function() {
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
            title: '',
            subTitle: '',
            width: 600,
            height: 300,
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

            _yDef0 = _options.seriesDefs.filter(function(d) {
                return d.type === 'y+';
            })[0];
            _yDef1 = _options.seriesDefs.filter(function(d) {
                return d.type === 'y-';
            })[0];

            var max = 0;
            var min = 0;
            for (var i = 0; i < _options.data.length; i++) {
                var subData = _options.data[i];
                var subMax = Math.max(_yDef0.accessor(subData), _yDef1.accessor(subData));
                if (subMax >= max) {
                    max = subMax;
                }
            }

            var dValue = (max - min);
            var exponent = Math.floor(Math.log(dValue) / Math.log(10));
            var niceDValue = Math.pow(10, exponent);

            var original = niceDValue;
            while (niceDValue < dValue) {
                niceDValue += original;
            }

            var dial = niceDValue / (_options.ticksCount - 1)

            var niceMax = Math.ceil(max / dial) * dial;
            var niceMin = 0;

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

            var defs = _options.seriesDefs.filter(function(d) {
                return d.type === 'y+' || d.type === 'y-'
            });

            var updata = graphics.selectAll('rect').data(defs);
            var enter = updata.enter();
            var exit = updata.exit();

            exit.remove();
            enter
                .append('rect');
            updata
                .style('fill', function(d, i) {
                    return getColor(defs)(i);
                })
                .attr('x', function(d, i) {
                    return i * 100 + 20;
                })
                .attr('y', 8)
                .attr('width', 25)
                .attr('height', 16)
                .attr('rx', '2');

            updata = graphics.selectAll('text').data(defs);
            enter = updata.enter();
            exit = updata.exit();

            exit.remove();
            enter
                .append('text');
            updata
                .style('fill', function(d, i) {
                    return getColor(defs)(i);
                })
                .attr('x', function(d, i) {
                    return i * 100 + 50;
                })
                .attr('y', 20)
                .text(function(d, i) {
                    return d.displayName;
                });

            graphics.attr('transform', 'translate(' + (_options.width - 100 * defs.length) / 2 + ',' + 0 + ')');
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
                    return d + _yDef0.unit;
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
                    return d.date;
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
                .rangeBands([0, quadrantWidth()]);

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
                    var xScaleInner = d3.scale.ordinal()
                        .domain([0, 1])
                        .rangeRoundBands([0, xScale.rangeBand()], 0.15, 0.15);

                    var updata = d3.select(this).selectAll('rect.bar-1').data([data]);
                    var enter = updata.enter();
                    var exit = updata.exit();

                    exit.remove();
                    enter
                        .append('rect')
                        .classed('bar-1', true)
                        .style('fill', getColor()(0))
                        .attr('rx', 5)
                        .attr('x', xScaleInner(0))
                        .attr('y', _yScale(0))
                        .attr('width', xScaleInner.rangeBand())
                        .attr('height', 0);
                    updata
                        .transition()
                        .delay(_options.delay)
                        .duration(_options.duration)
                        .attr('x', xScaleInner(0))
                        .attr('y', _yScale(_yDef0.accessor(data)))
                        .attr('width', xScaleInner.rangeBand())
                        .attr('height', _yScale(0) - _yScale(_yDef0.accessor(data)));

                    var updata = d3.select(this).selectAll('text.text-1').data([data]);
                    var enter = updata.enter();
                    var exit = updata.exit();

                    exit.remove();
                    enter
                        .append('text')
                        .classed('text-1', true)
                        .style('fill', getColor()(0))
                        .attr('text-anchor', 'middle')
                        .attr('x', xScaleInner(0) + xScaleInner.rangeBand() / 2)
                        .attr('y', _yScale(0) - 5)
                        .text('0');
                    updata
                        .text('+' + _yDef0.accessor(data))
                        .transition()
                        .delay(_options.delay)
                        .duration(_options.duration)
                        .attr('x', xScaleInner(0) + xScaleInner.rangeBand() / 2)
                        .attr('y', _yScale(_yDef0.accessor(data)) - 5);

                    var updata = d3.select(this).selectAll('rect.bar-2').data([data]);
                    var enter = updata.enter();
                    var exit = updata.exit();

                    exit.remove();
                    enter
                        .append('rect')
                        .classed('bar-2', true)
                        .style('fill', getColor()(1))
                        .attr('rx', 5)
                        .attr('x', xScaleInner(1))
                        .attr('y', _yScale(0))
                        .attr('width', xScaleInner.rangeBand())
                        .attr('height', 0);
                    updata
                        .transition()
                        .delay(_options.delay)
                        .duration(_options.duration)
                        .attr('x', xScaleInner(1))
                        .attr('y', _yScale(_yDef1.accessor(data)))
                        .attr('width', xScaleInner.rangeBand())
                        .attr('height', _yScale(0) - _yScale(_yDef1.accessor(data)));

                    var updata = d3.select(this).selectAll('text.text-2').data([data]);
                    var enter = updata.enter();
                    var exit = updata.exit();

                    exit.remove();
                    enter
                        .append('text')
                        .classed('text-2', true)
                        .style('fill', getColor()(1))
                        .attr('text-anchor', 'middle')
                        .attr('x', xScaleInner(1) + xScaleInner.rangeBand() / 2)
                        .attr('y', _yScale(0) - 5)
                        .text('0');
                    updata
                        .text('-' + _yDef1.accessor(data))
                        .transition()
                        .delay(_options.delay)
                        .duration(_options.duration)
                        .attr('x', xScaleInner(1) + xScaleInner.rangeBand() / 2)
                        .attr('y', _yScale(_yDef1.accessor(data)) - 5);

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
var charts = (function(charts) {
    charts.clusterChart1 = function() {
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

            var cluster = d3.layout.cluster()
                .size([quadrantHeight(), quadrantWidth()]);

            var diagonal = d3.svg.diagonal()
                .projection(function(d) {
                    return [d.y, d.x];
                });

            var data = $.extend(true, {}, _options.data);
            var nodes = cluster.nodes(data);
            var links = cluster.links(nodes);

            var link = graphics.selectAll('.link')
                .data(links)
                .enter()
                .append('path')
                .attr('class', 'link')
                .attr('d', diagonal)
                .style('fill', 'none')
                .style('stroke-width', '1.5px')
                .style('stroke', function(d, i) {
                    return getColor()(d.target.depth);
                });

            var node = graphics.selectAll('.node')
                .data(nodes)
                .enter()
                .append('g')
                .attr('class', 'node')
                .attr('transform', function(d) {
                    return 'translate(' + d.y + ',' + d.x + ')';
                });

            node.append('circle')
                .attr('r', 4.5)
                .style('fill', '#FFF')
                .style('stroke-width', '1.5px')
                .style('stroke', function(d, i) {
                    return getColor()(d.depth);
                });

            node.append('text')
                .attr('dx', function(d) {
                    if (!d.parent) {
                        return -8;
                    }
                    if (!d.children) {
                        return 8;
                    }
                    return 0;
                })
                .attr('dy', function(d) {
                    if (!d.parent) {
                        return 4;
                    }
                    if (!d.children) {
                        return 4;
                    }
                    return -10;
                })
                .style('text-anchor', function(d) {
                    if (!d.parent) {
                        return 'end';
                    }
                    if (!d.children) {
                        return 'start';
                    }
                    return 'middle';
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
var charts = (function(charts) {
    charts.lineChart = function() {
        var _Chart = {};

        var _svg = null;

        var _xScale = null;
        var _yScale = null;

        var _tickCount = null;
        var _tooltip = null;
        var _gridsData = null;

        var _options = {};

        _options.container = null;

        _options.width = 600;
        _options.height = 300;
        _options.margins = {
            top: 50,
            left: 50,
            right: 30,
            bottom: 30
        };

        _options.delay = 500;
        _options.duration = 1000;

        _options.colors = d3.scale.category10();

        _options.title = '';

        _options.valueDefs = [];
        _options.data = null;
        _options.quantifier = '';

        _options.getDefs = function() {
            return _options.valueDefs;
        };

        _Chart.setOption = function(name, value) {
            _options[name] = value;
        };
        _Chart.getOption = function() {
            return _options;
        };

        _Chart.render = function() {
            _options.width = $(_options.container).innerWidth() - 30;

            var maxValues = [];
            var minValues = [];

            for (var i = 0, defs = _options.getDefs(), length = defs.length; i < length; i++) {
                var def = defs[i];
                var extent = d3.extent(_options.data, def.accessor);
                maxValues.push(extent[1]);
                minValues.push(extent[0]);
            }

            var dial = 5;

            var max = d3.max(maxValues);
            var min = d3.min(minValues);

            if (max - min > 20) {
                dial = 10;
            }

            var max = Math.ceil(max / dial) * dial;
            var min = Math.floor(min / dial) * dial;

            _tickCount = (max - min) / dial;

            _yScale = d3.scale.linear()
                .domain([min, max])
                .range([quadrantHeight(), 0]);

            _xScale = d3.scale.linear()
                .domain([0, 6])
                .range([0, quadrantWidth()]);

            _gridsData = [];
            for (var i = 0; i < _tickCount; i++) {
                for (var j = 0; j < 6; j++) {
                    var grid = {};
                    grid.x = j;
                    grid.y = (i + 1) * dial + min;
                    grid.dial = dial;
                    if (i % 2 === 0) {
                        grid.color = "#F3F3F3";
                    } else {
                        grid.color = "#F8F8F8";
                    }
                    _gridsData.push(grid);
                }
            }

            if (!_svg) {
                _svg = d3.select(_options.container).append('svg');
            }
            _svg.attr('height', _options.height)
                .attr('width', _options.width);

            if (!_tooltip) {
                _tooltip = d3.select('body').append('div');
                _tooltip.attr('class', 'tooltip')
                    .style('display', 'none');
            }

            renderDefs();
            renderTitle();
            renderCategory();
            renderGrids();
            renderYAxis();
            renderBody();
            renderLegend();
        };

        function renderDefs() {
            var svgDefs = _svg.select('defs');
            if (svgDefs.empty()) {
                svgDefs = _svg.append('defs');
                for (var i = 0, defs = _options.getDefs(), length = defs.length; i < length; i++) {
                    var def = defs[i];
                    svgDefs.append('marker')
                        .attr('id', 'arrow-' + def.name)
                        .attr('markerUnits', 'strokeWidth')
                        .attr('markerWidth', '6')
                        .attr('markerHeight', '6')
                        .attr('viewBox', '0 0 6 6')
                        .attr('refX', '3')
                        .attr('refY', '3')
                        .attr('orient', 'auto')
                        .append('path')
                        .attr('d', 'M1,1 L5,3 L1,5 L1,3 L1,1')
                        .style('fill', _options.colors(i));
                }

            }
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
                    return d
                })
                .style('font-size', '18px')
                .attr('x', 0)
                .attr('y', 15);

            var updata = graphics.selectAll('text.subTitle').data([_options.subTitle]);
            var enter = updata.enter();
            var exit = updata.exit();

            exit
                .remove();
            enter
                .append('text')
                .classed('subTitle', true)
                .text(function(d, i) {
                    return d
                })
                .style('font-size', '12px')
                .attr('x', 0)
                .attr('y', 35);
        }

        function renderGrids() {
            var graphics = _svg.select('g.grids');
            if (graphics.empty()) {
                graphics = _svg.append('g').classed('grids', true);
            }

            graphics.attr('transform', 'translate(' + xStart() + ',' + yStart() + ')');

            var updata = graphics.selectAll('rect.grid').data(_gridsData);
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
                    return _xScale(d.x);
                })
                .attr('y', function(d, i) {
                    return _yScale(d.y);
                })
                .attr('width', function(d, i) {
                    return _xScale(1);
                })
                .attr('height', function(d, i) {
                    return _yScale(0) - _yScale(d.dial);
                });
            updata
                .transition()
                .delay(_options.delay)
                .attr('x', function(d, i) {
                    return _xScale(d.x);
                })
                .attr('y', function(d, i) {
                    return _yScale(d.y);
                })
                .attr('fill', function(d, i) {
                    return d.color;
                })
                .attr('width', function(d, i) {
                    return _xScale(1);
                })
                .attr('height', function(d, i) {
                    return _yScale(0) - _yScale(d.dial);
                });
        }

        function renderYAxis() {
            var graphics = _svg.select('g.YAxis');
            if (graphics.empty()) {
                graphics = _svg.append('g').classed('YAxis', true);
            }
            graphics.attr('transform', 'translate(' + xStart() + ',' + yStart() + ')');

            var yAxis = d3.svg.axis()
                .scale(_yScale)
                .ticks(_tickCount)
                .tickFormat(function(d) {
                    return d + _options.quantifier;
                })
                .orient('left');

            graphics.call(yAxis);

            var axis0 = graphics.select('line.axis0');
            if (axis0.empty()) {
                axis0 = graphics.append('line').classed('axis0', true);
            }
            axis0
                .attr('x1', 0)
                .attr('x2', quadrantWidth())
                .attr('y1', _yScale(0))
                .attr('y2', _yScale(0));
        }

        function renderCategory() {
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
                    return _xScale(i);
                })
                .attr('y', quadrantHeight() + 20)
                .text(function(d, i) {
                    return d.name
                })
        }

        function renderLegend() {
            var graphics = _svg.select('g.legends');
            if (graphics.empty()) {
                graphics = _svg.append('g').classed('legends', true);
            }

            var defs = _options.getDefs()

            var updata = graphics.selectAll('line').data(defs);
            var enter = updata.enter();
            var exit = updata.exit();

            exit.remove();
            enter
                .append('line');
            updata
                .style('stroke', function(d, i) {
                    return _options.colors(i)
                })
                .attr('x1', function(d, i) {
                    return i * 150;
                })
                .attr('x2', function(d, i) {
                    return i * 150 + 50;
                })
                .attr('y1', 16)
                .attr('y2', 16);

            var updata = graphics.selectAll('text').data(defs);
            var enter = updata.enter();
            var exit = updata.exit();

            exit.remove();
            enter
                .append('text');
            updata
                .style('fill', function(d, i) {
                    return _options.colors(i)
                })
                .attr('x', function(d, i) {
                    return i * 150 + 60;
                })
                .attr('y', 20)
                .text(function(d, i) {
                    return d.displayName;
                });

            graphics.attr('transform', 'translate(' + (quadrantWidth() / 2 - 150 * (defs.length - 1)) + ',' + 0 + ')');
        }

        function renderBody() {
            var graphics = _svg.select('g.body');
            if (graphics.empty()) {
                graphics = _svg.append('g').classed('body', true);
            }

            graphics.attr('transform', 'translate(' + xStart() + ',' + yStart() + ')');
            drawSubline(graphics);
            drawPath(graphics);
            drawCircle(graphics);
            drawMeanLine(graphics);
            drawMeanText(graphics);
        }

        function drawSubline(graphics) {
            var width = _xScale(1) - _xScale(0);
            var updata = graphics.selectAll('g.subline').data(_options.data);
            var enter = updata.enter();
            var exit = updata.exit();

            exit
                .remove();
            enter
                .append('g')
                .classed('subline', true)
                .each(function() {
                    d3.select(this)
                        .append('rect')
                        .attr('x', 0)
                        .attr('y', 0)
                        .attr('width', width)
                        .attr('height', quadrantHeight());

                    d3.select(this)
                        .append('line')
                        .attr('x1', width / 2)
                        .attr('x2', width / 2)
                        .attr('y1', 0)
                        .attr('y2', quadrantHeight());
                })
                .on('mouseover', function(d, i) {
                    d3.select(this).classed('active', true);
                    var html = '';
                    html += d.name + '<br>';
                    for (var i = 0, defs = _options.getDefs(), length = defs.length; i < length; i++) {
                        var def = defs[i];
                        html += def.displayName + '：' + d3.round(def.accessor(d)) + _options.quantifier + '<br>';
                    }
                    showToolTip(html);
                })
                .on('mousemove', moveToolTip)
                .on('mouseout', function() {
                    d3.select(this).classed('active', false);
                    hiddenToolTip();
                });
            updata.attr('transform', function(d, i) {
                return 'translate(' + (_xScale(i) - width / 2) + ',' + 0 + ')';
            });
        }

        function drawPath(graphics) {
            for (var i = 0, defs = _options.getDefs(), length = defs.length; i < length; i++) {
                var def = defs[i];

                var line0 = d3.svg.line()
                    .interpolate('cardinal')
                    .x(function(d, i) {
                        return _xScale(i);
                    })
                    .y(function(d) {
                        return _yScale(0);
                    });

                var line = d3.svg.line()
                    .interpolate('cardinal')
                    .x(function(d, i) {
                        return _xScale(i);
                    })
                    .y(function(d) {
                        return _yScale(def.accessor(d));
                    });

                var updata = graphics.selectAll('path.' + def.name + '.line').data([_options.data]);
                var enter = updata.enter();
                var exit = updata.exit();

                exit.remove();

                enter
                    .append('path')
                    .classed(def.name, true)
                    .classed('line', true)
                    .style('stroke', _options.colors(i))
                    .attr('d', function(d) {
                        return line0.tension(0.5)(d);
                    })
                    .on('mouseover', (function(def) {
                        return function(d, i) {
                            d3.selectAll('circle.point.' + def.name).classed('active', true);
                            d3.select(this).classed('active', true);
                            var html = '';
                            html += def.displayName + '：';
                            var values = d.map(def.accessor);
                            for (var j = 0, length = values.length; j < length; j++) {
                                if (j != length) {
                                    html += values[j] + _options.quantifier + ',';
                                } else {
                                    html += values[j] + _options.quantifier + '。';
                                }
                            }
                            showToolTip(html);
                        }
                    })(def))
                    .on('mousemove', moveToolTip)
                    .on('mouseout', function() {
                        d3.selectAll('circle.point').classed('active', false);
                        d3.select(this).classed('active', false);
                        hiddenToolTip();
                    });
                updata
                    .transition()
                    .delay(_options.delay)
                    .duration(_options.duration)
                    .attr('d', function(d) {
                        return line.tension(0.5)(d);
                    });
            }
        }

        function drawCircle(graphics) {
            for (var i = 0, defs = _options.getDefs(), length = defs.length; i < length; i++) {
                var def = defs[i];

                var updata = graphics.selectAll('circle.point.' + def.name).data(_options.data);
                var enter = updata.enter();
                var exit = updata.exit();

                exit.remove();
                enter
                    .append('circle')
                    .classed(def.name, true)
                    .classed('point', true)
                    .style('stroke', _options.colors(i))
                    .attr('cx', function(d, i) {
                        return _xScale(i);
                    })
                    .attr('cy', function(d) {
                        return _yScale(0);
                    })
                    .attr('r', 4.5)
                    .on('mouseover', (function(def) {
                        return function(d, i) {
                            d3.selectAll('path.line.' + def.name).classed('active', true);
                            d3.selectAll('circle.point.' + def.name).classed('active', true);
                            var html = '';
                            html += def.displayName + '：';
                            var values = _options.data.map(def.accessor);
                            for (var j = 0, length = values.length; j < length; j++) {
                                if (j != length) {
                                    html += values[j] + _options.quantifier + ',';
                                } else {
                                    html += values[j] + _options.quantifier + '。';
                                }
                            }
                            showToolTip(html);
                        }
                    })(def))
                    .on('mousemove', moveToolTip)
                    .on('mouseout', function() {
                        d3.selectAll('path.line').classed('active', false);
                        d3.selectAll('circle.point').classed('active', false);
                        hiddenToolTip();
                    });;
                updata
                    .transition()
                    .delay(_options.delay)
                    .duration(_options.duration)
                    .attr('cx', function(d, i) {
                        return _xScale(i);
                    })
                    .attr('cy', function(d) {
                        return _yScale(def.accessor(d));
                    });
            }
        }

        function drawMeanLine(graphics) {
            for (var i = 0, defs = _options.getDefs(), length = defs.length; i < length; i++) {
                var def = defs[i];
                var updata = graphics.selectAll('line.' + def.name + '.meanLine').data([_options.data]);
                var enter = updata.enter();
                var exit = updata.exit();

                exit
                    .remove();
                enter
                    .append('line')
                    .classed(def.name, true)
                    .classed('meanLine', true)
                    .style('stroke', _options.colors(i))
                    .style('marker-end', 'url(#' + 'arrow-' + def.name + ')')
                    .style('display', 'none')
                    .attr('x1', _xScale(0))
                    .attr('x2', _xScale(0))
                    .attr('y1', function(d, i) {
                        return _yScale(d3.mean(d, def.accessor));

                    })
                    .attr('y2', function(d, i) {
                        return _yScale(d3.mean(d, def.accessor));
                    })
                    .on('mouseover', (function(def) {
                        return function(d, i) {
                            d3.select(this).classed('active', true);

                            var html = '';
                            html += def.displayName + '<br>';
                            html += '平均值：' + d3.round(d3.mean(d, def.accessor), 2) + _options.quantifier + '<br>';
                            showToolTip(html);
                        }
                    })(def))
                    .on('mousemove', moveToolTip)
                    .on('mouseout', function() {
                        d3.select(this).classed('active', false);
                        hiddenToolTip();
                    });
                updata
                    .transition()
                    .delay(_options.duration + _options.delay)
                    .style('display', null)
                    .duration(_options.duration)
                    .attr('x2', quadrantWidth())
                    .attr('y1', function(d, i) {
                        return _yScale(d3.mean(d, def.accessor));

                    })
                    .attr('y2', function(d, i) {
                        return _yScale(d3.mean(d, def.accessor));
                    });
            }
        }

        function drawMeanText(graphics) {
            for (var i = 0, defs = _options.getDefs(), length = defs.length; i < length; i++) {
                var def = defs[i];

                var updata = graphics.selectAll('text.' + def.name + '.mean').data([_options.data]);
                var enter = updata.enter();
                var exit = updata.exit();
                exit
                    .remove();
                enter
                    .append('text')
                    .classed(def.name, true)
                    .classed('mean', true)
                    .style('fill', _options.colors(i))
                    .text(function(d, i) {
                        return d3.round(d3.mean(d, def.accessor), 2);
                    })
                    .style('display', 'none')
                    .style('font-size', '12px')
                    .attr('dx', '5px')
                    .attr('dy', '5px')
                    .attr('x', _xScale(0))
                    .attr('y', function(d, i) {
                        return _yScale(d3.mean(d, def.accessor));

                    });
                updata
                    .transition()
                    .delay(_options.duration + _options.delay)
                    .style('display', null)
                    .duration(_options.duration)
                    .attr('x', quadrantWidth())
                    .attr('y', function(d, i) {
                        return _yScale(d3.mean(d, def.accessor));
                    });
            }
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

        function xStart() {
            return _options.margins.left;
        }

        function yStart() {
            return _options.margins.top;
        }

        function xEnd() {
            return _options.width - _options.margins.right;
        }

        function yEnd() {
            return _options.height - _options.margins.bottom;
        }

        function quadrantWidth() {
            return _options.width - _options.margins.left - _options.margins.right;
        }

        function quadrantHeight() {
            return _options.height - _options.margins.top - _options.margins.bottom;
        }

        return _Chart;
    };
    return charts;
})(charts || {});
var charts = (function(charts) {
    charts.lineChart2 = function() {
        var _Chart = {};

        var _svg = null;
        var _tooltip = null;

        var _xScale = null;
        var _yScale = null;
        var _yAxis = null;

        var _tickValues = null;
        var _options = {};
        var _defult = {
            container: '',
            title: '',
            subTitle: '',
            width: 600,
            height: 300,
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

            var maxValues = [];
            var minValues = [];

            for (var i = 0, defs = _options.seriesDefs, length = defs.length; i < length; i++) {
                var def = defs[i];
                var extent = d3.extent(_options.data, def.accessor);
                maxValues.push(extent[1]);
                minValues.push(extent[0]);
            }

            var max = d3.max(maxValues);

            var exponent = Math.floor(Math.log(max) / Math.log(10));
            var top = Math.pow(10, exponent);

            var originalTop = top;
            while (top < max) {
                top += originalTop;
            }

            _tickValues = [];
            for (i = 0; i < _options.ticksCount; i++) {
                _tickValues.push((i * top) / (_options.ticksCount - 1));
            }

            _yScale = d3.scale.linear()
                .domain([0, top])
                .range([quadrantHeight(), 0]);

            _xScale = d3.scale.linear()
                .domain([0, 6])
                .range([0, quadrantWidth()]);

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
            renderCategory();
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

            var defs = _options.seriesDefs;

            var updata = graphics.selectAll('rect').data(defs);
            var enter = updata.enter();
            var exit = updata.exit();

            exit.remove();
            enter
                .append('rect');
            updata
                .style('fill', function(d, i) {
                    return getColor(defs)(i);
                })
                .attr('x', function(d, i) {
                    return i * 100 + 20;
                })
                .attr('y', 8)
                .attr('width', 25)
                .attr('height', 16)
                .attr('rx', '2');

            updata = graphics.selectAll('text').data(defs);
            enter = updata.enter();
            exit = updata.exit();

            exit.remove();
            enter
                .append('text');
            updata
                .style('fill', function(d, i) {
                    return getColor(defs)(i);
                })
                .attr('x', function(d, i) {
                    return i * 100 + 60;
                })
                .attr('y', 20)
                .text(function(d, i) {
                    return d.displayName;
                });

            graphics.attr('transform', 'translate(' + (_options.width - 100 * defs.length )/2 + ',' + 0 + ')');
        }

        function renderYAxis() {
            var graphics = _svg.select('g.YAxis');
            if (graphics.empty()) {
                graphics = _svg.append('g').classed('YAxis', true);
            }
            graphics.attr('transform', 'translate(' + xStart() + ',' + yStart() + ')');

            _yAxis = d3.svg.axis()
                .scale(_yScale)
                .tickValues(_tickValues)
                .tickSize(getTheme().axis.size[0], getTheme().axis.size[1])
                .tickPadding(getTheme().axis.padding)
                .tickFormat(function(d) {
                    return d + _options.quantifier;
                })
                .orient('left');

            graphics.call(_yAxis);

            var axis0 = graphics.select('line.axis0');
            if (axis0.empty()) {
                axis0 = graphics.append('line').classed('domain', true);
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

        function renderCategory() {
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
                    return _xScale(i);
                })
                .attr('y', quadrantHeight() + 20)
                .text(function(d, i) {
                    return d.date;
                })
        }

        function renderGrids() {
            var gridsData = [];
            var dial = _tickValues[1] - _tickValues[0];
            for (var i = 0; i < _options.ticksCount - 1; i++) {
                for (var j = 0; j < 6; j++) {
                    var grid = {};
                    grid.x = j;
                    grid.y = (i + 1) * dial;
                    grid.dial = dial;
                    if (i % 2 === 0) {
                        grid.color = "#F3F3F3";
                    } else {
                        grid.color = "#F8F8F8";
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
                    return _xScale(d.x);
                })
                .attr('y', function(d, i) {
                    return _yScale(d.y);
                })
                .attr('width', function(d, i) {
                    return _xScale(1);
                })
                .attr('height', function(d, i) {
                    return _yScale(0) - _yScale(d.dial);
                });
            updata
                .transition()
                .delay(_options.delay)
                .attr('x', function(d, i) {
                    return _xScale(d.x);
                })
                .attr('y', function(d, i) {
                    return _yScale(d.y);
                })
                .attr('fill', function(d, i) {
                    return d.color;
                })
                .attr('width', function(d, i) {
                    return _xScale(1);
                })
                .attr('height', function(d, i) {
                    return _yScale(0) - _yScale(d.dial);
                });
        }

        function renderBody() {
            var graphics = _svg.select('g.body');
            if (graphics.empty()) {
                graphics = _svg.append('g').classed('body', true);
            }

            graphics.attr('transform', 'translate(' + xStart() + ',' + yStart() + ')');
            drawLine(graphics);
            drawArea(graphics);
            drawCircle(graphics);
            drawBoostLine(graphics);
        }

        function drawArea(graphics) {

            var area0 = d3.svg.area()
                .interpolate('monotone')
                .x(function(d, i) {
                    return _xScale(i);
                })
                .y0(quadrantHeight())
                .y1(function(d) {
                    return _yScale(0);
                });

            var area1 = d3.svg.area()
                .interpolate('monotone')
                .x(function(d, i) {
                    return _xScale(i);
                })
                .y0(quadrantHeight())
                .y1(function(d) {
                    return _yScale(def.accessor(d));
                });

            for (var i = 0, defs = _options.seriesDefs, length = defs.length; i < length; i++) {
                var def = defs[i];

                var updata = graphics.selectAll('path.' + def.name + '.area').data([_options.data]);
                var enter = updata.enter();
                var exit = updata.exit();

                exit.remove();

                enter
                    .append('path')
                    .classed(def.name, true)
                    .classed('area', true)
                    .style('fill', rgba(getColor(def)(i), 0.15))
                    .attr('d', function(d) {
                        return area0.tension(0.5)(d);
                    });
                updata
                    .transition()
                    .delay(_options.delay)
                    .duration(_options.duration)
                    .attr('d', function(d) {
                        return area1.tension(0.5)(d);
                    });
            }
        }

        function drawLine(graphics) {

            var line0 = d3.svg.line()
                .interpolate('monotone')
                .x(function(d, i) {
                    return _xScale(i);
                })
                .y(function(d) {
                    return _yScale(0);
                });

            var line1 = d3.svg.line()
                .interpolate('monotone')
                .x(function(d, i) {
                    return _xScale(i);
                })
                .y(function(d) {
                    return _yScale(def.accessor(d));
                });

            for (var i = 0, defs = _options.seriesDefs, length = defs.length; i < length; i++) {
                var def = defs[i];

                var updata = graphics.selectAll('path.' + def.name + '.line').data([_options.data]);
                var enter = updata.enter();
                var exit = updata.exit();

                exit.remove();

                enter
                    .append('path')
                    .classed(def.name, true)
                    .classed('line', true)
                    .style('stroke', getColor(def)(i))
                    .style('stroke-width', '2px')
                    .style('fill', 'none')
                    .attr('d', function(d) {
                        return line0.tension(0.5)(d);
                    });
                updata
                    .transition()
                    .delay(_options.delay)
                    .duration(_options.duration)
                    .attr('d', function(d) {
                        return line1.tension(0.5)(d);
                    });
            }
        }

        function drawCircle(graphics) {
            for (var i = 0, defs = _options.seriesDefs, length = defs.length; i < length; i++) {
                var def = defs[i];

                var updata = graphics.selectAll('circle.point.' + def.name).data(_options.data);
                var enter = updata.enter();
                var exit = updata.exit();

                exit.remove();
                enter
                    .append('circle')
                    .classed(def.name, true)
                    .classed('point', true)
                    .style('stroke', getColor(def)(i))
                    .style('stroke-width', '2px')
                    .style('fill', '#FFF')
                    .attr('cx', function(d, i) {
                        return _xScale(i);
                    })
                    .attr('cy', function(d) {
                        return _yScale(0);
                    })
                    .attr('r', 4.5);
                updata
                    .transition()
                    .delay(_options.delay)
                    .duration(_options.duration)
                    .attr('cx', function(d, i) {
                        return _xScale(i);
                    })
                    .attr('cy', function(d) {
                        return _yScale(def.accessor(d));
                    });
            }
        }

        function drawBoostLine(graphics) {
            var width = _xScale(1) - _xScale(0);
            var updata = graphics.selectAll('g.boostLine').data(_options.data);
            var enter = updata.enter();
            var exit = updata.exit();

            exit
                .remove();
            enter
                .append('g')
                .classed('boostLine', true)
                .each(function() {
                    d3.select(this)
                        .append('rect')
                        .style('fill', 'rgba(255, 255, 255, 0)')
                        .attr('x', 0)
                        .attr('y', 0)
                        .attr('width', width)
                        .attr('height', quadrantHeight());

                    d3.select(this)
                        .append('line')
                        .style('stroke', '#008ACD')
                        .style('stroke-width', '3px')
                        .style('stroke-opacity', '0.5')
                        .style('display', 'none')
                        .attr('x1', width / 2)
                        .attr('x2', width / 2)
                        .attr('y1', 0)
                        .attr('y2', quadrantHeight());
                })
                .on('mouseover', function(d, i) {
                    d3.select(this).select('line').style('display', null);
                    var html = '';
                    html += d.date + '<br>';
                    for (var i = 0, defs = _options.seriesDefs, length = defs.length; i < length; i++) {
                        var def = defs[i];
                        html += def.displayName + '：' + d3.round(def.accessor(d)) + _options.quantifier + '<br>';
                    }
                    showToolTip(html);
                })
                .on('mousemove', moveToolTip)
                .on('mouseout', function() {
                    d3.select(this).select('line').style('display', 'none');
                    hiddenToolTip();
                });
            updata.attr('transform', function(d, i) {
                return 'translate(' + (_xScale(i) - width / 2) + ',' + 0 + ')';
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
var charts = (function(charts) {
    charts.lineChart3 = function() {
        var _Chart = {};

        var _svg = null;
        var _tooltip = null;

        var _xScale = null;
        var _yScale = null;
        var _yAxis = null;

        var _tickValues = null;
        var _options = {};
        var _defult = {
            container: '',
            title: '',
            subTitle: '',
            width: 600,
            height: 300,
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

            var maxValues = [];

            for (var i = 0; i < _options.data.length; i++) {
                maxValues[i] = 0;
                for (var j = 0, defs = _options.seriesDefs, length = defs.length; j < length; j++) {
                    var def = defs[j];
                    var value = def.accessor(_options.data[i]);
                    maxValues[i] += value;
                }
            }

            var max = d3.max(maxValues);

            var exponent = Math.floor(Math.log(max) / Math.log(10));
            var top = Math.pow(10, exponent);

            var originalTop = top;
            while (top < max) {
                top += originalTop;
            }

            _tickValues = [];
            for (i = 0; i < _options.ticksCount; i++) {
                _tickValues.push((i * top) / (_options.ticksCount - 1));
            }

            _yScale = d3.scale.linear()
                .domain([0, top])
                .range([quadrantHeight(), 0]);

            _xScale = d3.scale.linear()
                .domain([0, _options.data.length - 1])
                .range([0, quadrantWidth()]);

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
            renderCategory();
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

            var defs = _options.seriesDefs;

            var updata = graphics.selectAll('rect').data(defs);
            var enter = updata.enter();
            var exit = updata.exit();

            exit.remove();
            enter
                .append('rect');
            updata
                .style('fill', function(d, i) {
                    return getColor(defs)(i);
                })
                .attr('x', function(d, i) {
                    return i * 100 + 20;
                })
                .attr('y', 8)
                .attr('width', 25)
                .attr('height', 16)
                .attr('rx', '2');

            updata = graphics.selectAll('text').data(defs);
            enter = updata.enter();
            exit = updata.exit();

            exit.remove();
            enter
                .append('text');
            updata
                .style('fill', function(d, i) {
                    return getColor(defs)(i);
                })
                .attr('x', function(d, i) {
                    return i * 100 + 50;
                })
                .attr('y', 20)
                .text(function(d, i) {
                    return d.displayName;
                });

            graphics.attr('transform', 'translate(' + (_options.width - 100 * defs.length)/2 + ',' + 0 + ')');
        }

        function renderYAxis() {
            var graphics = _svg.select('g.YAxis');
            if (graphics.empty()) {
                graphics = _svg.append('g').classed('YAxis', true);
            }
            graphics.attr('transform', 'translate(' + xStart() + ',' + yStart() + ')');

            _yAxis = d3.svg.axis()
                .scale(_yScale)
                .tickValues(_tickValues)
                .tickSize(getTheme().axis.size[0], getTheme().axis.size[1])
                .tickPadding(getTheme().axis.padding)
                .tickFormat(function(d) {
                    return d + _options.quantifier;
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

        function renderCategory() {
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
                    return _xScale(i);
                })
                .attr('y', quadrantHeight() + 20)
                .text(function(d, i) {
                    return d.date;
                });
        }

        function renderGrids() {
            var gridsData = [];
            var dial = _tickValues[1] - _tickValues[0];
            for (var i = 0; i < _options.ticksCount - 1; i++) {
                for (var j = 0; j < 6; j++) {
                    var grid = {};
                    grid.x = j;
                    grid.y = (i + 1) * dial;
                    grid.dial = dial;
                    if (i % 2 === 0) {
                        grid.color = "#F3F3F3";
                    } else {
                        grid.color = "#F8F8F8";
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
                    return _xScale(d.x);
                })
                .attr('y', function(d, i) {
                    return _yScale(d.y);
                })
                .attr('width', function(d, i) {
                    return _xScale(1);
                })
                .attr('height', function(d, i) {
                    return _yScale(0) - _yScale(d.dial);
                });
            updata
                .transition()
                .delay(_options.delay)
                .attr('x', function(d, i) {
                    return _xScale(d.x);
                })
                .attr('y', function(d, i) {
                    return _yScale(d.y);
                })
                .attr('fill', function(d, i) {
                    return d.color;
                })
                .attr('width', function(d, i) {
                    return _xScale(1);
                })
                .attr('height', function(d, i) {
                    return _yScale(0) - _yScale(d.dial);
                });
        }

        function renderBody() {
            var graphics = _svg.select('g.body');
            if (graphics.empty()) {
                graphics = _svg.append('g').classed('body', true);
            }

            graphics.attr('transform', 'translate(' + xStart() + ',' + yStart() + ')');
            drawLine(graphics);
            drawArea(graphics);
            drawCircle(graphics);
            drawBoostLine(graphics);
        }

        function drawArea(graphics) {
            var offect = _options.data.map(function() {
                return 0;
            });

            var area0 = d3.svg.area()
                .interpolate('monotone')
                .x(function(d, i) {
                    return _xScale(i);
                })
                .y0(quadrantHeight())
                .y1(function(d) {
                    return _yScale(0);
                });

            var area1 = d3.svg.area()
                .interpolate('monotone')
                .x(function(d, i) {
                    return _xScale(i);
                })
                .y0(quadrantHeight())
                .y1(function(d, i) {
                    return _yScale(def.accessor(d) + offect[i]);
                });

            for (var i = 0, defs = _options.seriesDefs, length = defs.length; i < length; i++) {
                var def = defs[i];

                var updata = graphics.selectAll('path.' + def.name + '.area').data([_options.data]);
                var enter = updata.enter();
                var exit = updata.exit();

                exit.remove();

                enter
                    .append('path')
                    .classed(def.name, true)
                    .classed('area', true)
                    .style('fill', rgba(getColor(def)(i), 0.3))
                    .attr('d', function(d) {
                        return area0.tension(0.5)(d);
                    });
                updata
                    .transition()
                    .delay(_options.delay)
                    .duration(_options.duration)
                    .attr('d', function(d) {
                        return area1.tension(0.5)(d);
                    });
                _options.data.forEach(function(d, i) {
                    offect[i] += def.accessor(d);
                });
            }
            graphics.selectAll('path.area').sort(function() {
                return true;
            });
        }

        function drawLine(graphics) {

            var offect = _options.data.map(function() {
                return 0;
            });

            var line0 = d3.svg.line()
                .interpolate('monotone')
                .x(function(d, i) {
                    return _xScale(i);
                })
                .y(function(d, i) {
                    return _yScale(0);
                });

            var line1 = d3.svg.line()
                .interpolate('monotone')
                .x(function(d, i) {
                    return _xScale(i);
                })
                .y(function(d, i) {
                    return _yScale(def.accessor(d) + offect[i]);
                });

            for (var i = 0, defs = _options.seriesDefs, length = defs.length; i < length; i++) {
                var def = defs[i];

                var updata = graphics.selectAll('path.' + def.name + '.line').data([_options.data]);
                var enter = updata.enter();
                var exit = updata.exit();

                exit.remove();

                enter
                    .append('path')
                    .classed(def.name, true)
                    .classed('line', true)
                    .style('stroke', getColor(def)(i))
                    .style('stroke-width', '2px')
                    .style('fill', 'none')
                    .attr('d', function(d) {
                        return line0.tension(0.5)(d);
                    });
                updata
                    .transition()
                    .delay(_options.delay)
                    .duration(_options.duration)
                    .attr('d', function(d) {
                        return line1.tension(0.5)(d);
                    });
                _options.data.forEach(function(d, i) {
                    offect[i] += def.accessor(d);
                });
            }
        }

        function drawCircle(graphics) {
            var offect = _options.data.map(function() {
                return 0;
            });
            for (var i = 0, defs = _options.seriesDefs, length = defs.length; i < length; i++) {
                var def = defs[i];

                var updata = graphics.selectAll('circle.point.' + def.name).data(_options.data);
                var enter = updata.enter();
                var exit = updata.exit();

                exit.remove();
                enter
                    .append('circle')
                    .classed(def.name, true)
                    .classed('point', true)
                    .style('stroke', getColor(def)(i))
                    .style('stroke-width', '2px')
                    .style('fill', '#FFF')
                    .attr('cx', function(d, i) {
                        return _xScale(i);
                    })
                    .attr('cy', function(d) {
                        return _yScale(0);
                    })
                    .attr('r', 4.5);
                updata
                    .transition()
                    .delay(_options.delay)
                    .duration(_options.duration)
                    .attr('cx', function(d, i) {
                        return _xScale(i);
                    })
                    .attr('cy', function(d, i) {
                        return _yScale(def.accessor(d) + offect[i]);
                    });
                _options.data.forEach(function(d, i) {
                    offect[i] += def.accessor(d);
                });
            }
        }

        function drawBoostLine(graphics) {
            var width = _xScale(1) - _xScale(0);
            var updata = graphics.selectAll('g.boostLine').data(_options.data);
            var enter = updata.enter();
            var exit = updata.exit();

            exit
                .remove();
            enter
                .append('g')
                .classed('boostLine', true)
                .each(function() {
                    d3.select(this)
                        .append('rect')
                        .style('fill', 'rgba(255, 255, 255, 0)')
                        .attr('x', 0)
                        .attr('y', 0)
                        .attr('width', width)
                        .attr('height', quadrantHeight());

                    d3.select(this)
                        .append('line')
                        .style('stroke', '#008ACD')
                        .style('stroke-width', '3px')
                        .style('stroke-opacity', '0.5')
                        .style('display', 'none')
                        .attr('x1', width / 2)
                        .attr('x2', width / 2)
                        .attr('y1', 0)
                        .attr('y2', quadrantHeight());
                })
                .on('mouseover', function(d, i) {
                    d3.select(this).select('line').style('display', null);
                    var html = '';
                    html += d.date + '<br>';
                    var total = 0;
                    for (var i = 0, defs = _options.seriesDefs, length = defs.length; i < length; i++) {
                        var def = defs[i];
                        html += def.displayName + '：' + d3.round(def.accessor(d)) + _options.quantifier + '<br>';
                        total += d3.round(def.accessor(d));
                    }
                    html += '总计：' + total + _options.quantifier + '<br>';
                    showToolTip(html);
                })
                .on('mousemove', moveToolTip)
                .on('mouseout', function() {
                    d3.select(this).select('line').style('display', 'none');
                    hiddenToolTip();
                });
            updata.attr('transform', function(d, i) {
                return 'translate(' + (_xScale(i) - width / 2) + ',' + 0 + ')';
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
var charts = (function(charts) {
    charts.lineChart4 = function() {
        var _Chart = {};

        var _svg = null;
        var _tooltip = null;

        var _yDefs = null;
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
            title: '',
            subTitle: '',
            width: 600,
            height: 300,
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


            _xScale = d3.scale.linear()
                .domain([0, 6])
                .range([0, quadrantWidth()]);

            _tooltip = d3.select('.tooltip');
            if (_tooltip.empty()) {
                _tooltip = d3.select('body').append('div');
                _tooltip.attr('class', 'tooltip')
                    .style('display', 'none');
            }

            yScaleCalculate();
            xScaleCalculate();

            renderTitle();
            renderGrids();
            renderYAxis();
            renderXAxis();
            renderBody();
        };

        function yScaleCalculate() {
            var maxValues = [];
            var minValues = [];

            _yDefs = _options.seriesDefs.filter(function(d) {
                return d.type === 'y';
            });
            for (var i = 0, length = _yDefs.length; i < length; i++) {
                var def = _yDefs[i];
                var extent = d3.extent(_options.data, def.accessor);
                maxValues.push(extent[1]);
                minValues.push(extent[0]);
            }

            var max = d3.max(maxValues);

            var exponent = Math.floor(Math.log(max) / Math.log(10));
            var top = Math.pow(10, exponent);

            var originalTop = top;
            while (top < max) {
                top += originalTop;
            }

            _yAxisTickValues = [];
            for (i = 0; i < _options.ticksCount; i++) {
                _yAxisTickValues.push((i * top) / (_options.ticksCount - 1));
            }

            _yScale = d3.scale.linear()
                .domain([0, top])
                .range([quadrantHeight(), 0]);
        }

        function xScaleCalculate() {
            var maxValues = [];
            var minValues = [];

            _xDefs = _options.seriesDefs.filter(function(d) {
                return d.type === 'x';
            });
            for (var i = 0, length = _xDefs.length; i < length; i++) {
                var def = _xDefs[i];
                var extent = d3.extent(_options.data, def.accessor);
                maxValues.push(extent[1]);
                minValues.push(extent[0]);
            }

            var max = d3.max(maxValues);
            var min = d3.min(minValues);

            _xAxisTickValues = _options.data.map(_xDefs[0].accessor)
            _xAxisTickValues.sort(function(d1, d2) {
                return d1 > d2
            });

            _xScale = d3.scale.linear()
                .domain([min, max])
                .range([0, quadrantWidth()]);
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
                    return d + _yDefs[0].unit;
                })
                .orient('left');

            graphics.call(_yAxis);

            graphics.selectAll('.domain')
                .style('stroke', getTheme().axis.color)
                .style('stroke-width', getTheme().axis.width)
                .style('fill', 'none');
        }

        function renderXAxis() {
            var graphics = _svg.select('g.XAxis');
            if (graphics.empty()) {
                graphics = _svg.append('g').classed('XAxis', true);
            }
            graphics.attr('transform', 'translate(' + xStart() + ',' + yEnd() + ')');

            _xAxis = d3.svg.axis()
                .scale(_xScale)
                .tickValues(_xAxisTickValues)
                .tickSize(getTheme().axis.size[0], getTheme().axis.size[1])
                .tickPadding(getTheme().axis.padding)
                .tickFormat(function(d) {
                    return d + _xDefs[0].unit;
                })
                .orient('bottom');

            graphics.call(_xAxis);

            graphics.selectAll('.domain')
                .style('stroke', getTheme().axis.color)
                .style('stroke-width', getTheme().axis.width)
                .style('fill', 'none');
        }

        function renderGrids() {
            var gridsData = [];
            _yAxisTickValues;
            _xAxisTickValues;
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
            drawLine(graphics);
            drawCircle(graphics);
        }

        function drawLine(graphics) {

            var line0 = d3.svg.line()
                .interpolate('monotone')
                .x(function(d, i) {
                    return _xScale(_xDefs[0].accessor(d));
                })
                .y(function(d) {
                    return _yScale(0);
                });

            var line1 = d3.svg.line()
                .interpolate('monotone')
                .x(function(d, i) {
                    return _xScale(_xDefs[0].accessor(d));
                })
                .y(function(d) {
                    return _yScale(def.accessor(d));
                });

            for (var i = 0, defs = _yDefs, length = defs.length; i < length; i++) {
                var def = defs[i];

                var updata = graphics.selectAll('path.' + def.name + '.line').data([_options.data]);
                var enter = updata.enter();
                var exit = updata.exit();

                exit.remove();

                enter
                    .append('path')
                    .classed(def.name, true)
                    .classed('line', true)
                    .style('stroke', getColor(def)(i))
                    .style('stroke-width', '2px')
                    .style('fill', 'none')
                    .attr('d', function(d) {
                        return line0.tension(0.5)(d);
                    });
                updata
                    .transition()
                    .delay(_options.delay)
                    .duration(_options.duration)
                    .attr('d', function(d) {
                        return line1.tension(0.5)(d);
                    });
            }
        }

        function drawCircle(graphics) {
            var rDef = _options.seriesDefs.filter(function(d){
                return d.type === 'r';
            })[0];
            for (var i = 0, defs = _yDefs, length = defs.length; i < length; i++) {
                var def = defs[i];

                var updata = graphics.selectAll('circle.point.' + def.name).data(_options.data);
                var enter = updata.enter();
                var exit = updata.exit();

                exit.remove();
                enter
                    .append('circle')
                    .classed(def.name, true)
                    .classed('point', true)
                    .style('stroke', getColor(def)(i))
                    .style('stroke-width', '2px')
                    .style('fill', '#FFF')
                    .attr('cx', function(d, i) {
                        return _xScale(_xDefs[0].accessor(d));
                    })
                    .attr('cy', function(d) {
                        return _yScale(0);
                    })
                    .attr('r', function(d){
                        return Math.min(rDef.accessor(d)/25 + 3,10);
                    });
                updata
                    .transition()
                    .delay(_options.delay)
                    .duration(_options.duration)
                    .attr('cx', function(d, i) {
                        return _xScale(_xDefs[0].accessor(d));
                    })
                    .attr('cy', function(d) {
                        return _yScale(def.accessor(d));
                    })
                    .attr('r', function(d){
                        return Math.min(rDef.accessor(d)/25 + 3,10);
                    });
            }
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
var charts = (function(charts) {
    charts.packChart1 = function() {
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
            height: 500,
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

            var pack = d3.layout.pack()
                .size([quadrantWidth(), quadrantHeight()])
                .radius(29)
                .padding(0);

            var data = $.extend(true, {}, _options.data);
            var nodes = pack.nodes(data);
            var links = pack.links(nodes);

            graphics.selectAll("circle")
                .data(nodes.sort(function(d1, d2) {
                    return d1.depth > d2.depth;
                }))
                .enter()
                .append("circle")
                .attr("fill", function(d, i) {
                    return getColor()(d.depth);
                })
                .attr("cx", function(d) {
                    return d.x;
                })
                .attr("cy", function(d) {
                    return d.y;
                })
                .attr("r", function(d) {
                    return d.r;
                })
                .on("mouseover", function(d, i) {
                    d3.select(this)
                        .attr("fill", d3.rgb(getColor()(d.depth)).darker());
                })
                .on("mouseout", function(d, i) {
                    d3.select(this)
                        .attr("fill", getColor()(d.depth));
                });

            graphics.selectAll("text")
                .data(nodes)
                .enter()
                .append("text")
                .attr('text-anchor', 'middle')
                .attr("font-size", "10px")
                .attr("fill", "white")
                .attr("fill-opacity", function(d) {
                    if (!d.children || d.children.length === 0)
                        return "1";
                    else
                        return "0";
                })
                .attr("x", function(d) {
                    return d.x;
                })
                .attr("y", function(d) {
                    return d.y;
                })
                .attr("dy", 1)
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
var charts = (function(charts) {
    charts.pieChart1 = function() {
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
            renderLegend();
            renderBody();
            renderDateSeletor();
            startInterval();
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

        function renderBody() {
            var graphics = _svg.select('g.body');
            if (graphics.empty()) {
                graphics = _svg.append('g').classed('body', true);
            }

            graphics.attr('transform', 'translate(' + (xStart() + quadrantWidth() / 2) + ',' + (yStart() + quadrantHeight() / 2) + ')');

            var pie = d3.layout.pie()
                .sort(function(d, i) {
                    return -i;
                })
                .value(function(d) {
                    return d.value;
                });

            var subData = _options.data[selectIndex];
            var data = [];
            data.push({
                name: 'chrome',
                value: subData.chrome
            });
            data.push({
                name: 'firefox',
                value: subData.firefox
            });
            data.push({
                name: 'safari',
                value: subData.safari
            });
            data.push({
                name: 'ie9',
                value: subData.ie9
            });
            data.push({
                name: 'ie8',
                value: subData.ie8
            });
            var pieData = pie(data);

            var arc = d3.svg.arc()
                .outerRadius(125)
                .innerRadius(0)
                .padAngle(0);

            var updata = graphics.selectAll('path').data(pieData);
            var enter = updata.enter();
            var exit = updata.exit();

            exit.remove();
            enter
                .append('path');
            updata
                .style('fill', function(d, i) {
                    return getColor()(i)
                })
                .transition()
                .attrTween('d', function(dd) {
                    var currentArc = this.__current__; // <-C

                    if (!currentArc)
                        currentArc = {
                            startAngle: 0,
                            endAngle: 0
                        };

                    var interpolate = d3.interpolate(
                        currentArc, dd);

                    this.__current__ = interpolate(1); //<-D

                    return function(t) {
                        return arc(interpolate(t));
                    };
                });

            var updata = graphics.selectAll('text').data(pieData);
            var enter = updata.enter();
            var exit = updata.exit();

            exit.remove();
            enter
                .append('text');
            updata
                .transition()
                .attr('transform', function(d) {
                    var postion = arc.centroid(d);
                    var postion = [postion[0] * 2.5, postion[1] * 2.5]
                    return 'translate(' + postion + ')';
                })
                .attr('text-anchor', 'middle')
                .text(function(d, i) {
                    return d.data.name
                })
                .attr('fill', function(d, i) {
                    return getColor()(i);
                });
        }

        function renderDateSeletor() {
            var scale = d3.scale.ordinal()
                .domain(_options.data.map(function(d, i) {
                    return i;
                }))
                .rangeBands([0, quadrantWidth()], 1, 0.5);
            var range = quadrantWidth() / _options.data.length;
            range = range / 2;
            var graphics = _svg.select('g.dateSeletor');
            if (graphics.empty()) {
                graphics = _svg.append('g').classed('dateSeletor', true);
                graphics
                    .style('cursor', 'pointer')
                    .on('click', function(d, i) {
                        var bdRect = this.getBoundingClientRect()
                        var offect = d3.event.clientX - bdRect.x;
                        var result = 0;
                        for (var i = 0, length = _options.data.length; i < length; i++) {
                            var value = scale(i);
                            if (offect < value + range && offect > value - range) {
                                result = i;
                                break;
                            }
                        };

                        if (result !== selectIndex) {
                            selectIndex = result;
                            _Chart.render();
                        }

                    });
            }

            graphics.attr('transform', 'translate(' + xStart() + ',' + yEnd() + ')');

            if (graphics.selectAll('rect.bg').empty()) {
                graphics
                    .append('rect')
                    .classed('bg', true)
                    .style('stroke', 'none')
                    .style('stroke-width', 0)
                    .style('fill', 'rgba(255, 255, 255, 0)')
                    .attr('x', 0)
                    .attr('y', -5)
                    .attr('width', quadrantWidth())
                    .attr('height', 30);
            }
            if (graphics.selectAll('line.base').empty()) {
                graphics
                    .append('line')
                    .classed('base', true)
                    .style('stroke', getTheme().axis.color)
                    .style('stroke-width', 1)
                    .style('stroke-dasharray', '5,5')
                    .attr('x1', 0)
                    .attr('y1', 0)
                    .attr('x2', quadrantWidth())
                    .attr('y2', 0);
            }
            var updata = graphics.selectAll('g.subItem').data(_options.data);
            var enter = updata.enter();
            var exit = updata.exit();

            exit.remove();
            enter
                .append('g')
                .classed('subItem', true);
            updata
                .attr('transform', function(d, i) {
                    return 'translate(' + scale(i) + ',0)';
                })
                .each(function(d, i) {
                    d3.select(this).selectAll('circle').remove();
                    d3.select(this).selectAll('text').remove();

                    var circle = d3.select(this)
                        .append('circle')
                        .attr('cx', 0)
                        .attr('cy', 0)
                        .attr('r', 3)
                        .style('fill', '#FFF')
                        .style('stroke', getTheme().axis.color)
                        .style('stroke-width', 1);
                    if (selectIndex === i) {
                        circle.style('fill', getTheme().axis.color);
                    }

                    var text = d3.select(this)
                        .append('text')
                        .attr('text-anchor', 'middle')
                        .attr('x', 0)
                        .attr('y', 20)
                        .style('fill', '#000')
                        .text(d.date);

                    if (selectIndex === i) {
                        text.style('fill', getTheme().axis.color);
                    }
                });

        }

        var started = false;

        function startInterval() {
            if (!started) {
                console.log('start');
                var interval = null;

                function fn() {
                    if (d3.select(_options.container).empty()) {
                        console.log('end');
                        clearInterval(interval);
                    } else {
                        selectIndex += 1;
                        if (selectIndex >= _options.data.length) {
                            selectIndex = 0;
                        }
                        _Chart.render();
                    }
                }

                interval = setInterval(fn, 1000);
                started = true;
            }
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
var charts = (function(charts) {
    charts.pieChart2 = function() {
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
            renderLegend();
            renderBody();
        };

        function renderTitle() {
            var graphics = _svg.select('g.title');
            if (graphics.empty()) {
                graphics = _svg.append('g').classed('title', true);
            }

            graphics.attr('transform', 'translate(' + _options.width / 2 + ',' + (_options.height / 2 - 20) + ')');

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
                .attr('text-anchor', 'middle')
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
                .attr('text-anchor', 'middle')
                .attr('x', 0)
                .attr('y', 35);
        }

        function renderLegend() {
            var graphics = _svg.select('g.legends');
            if (graphics.empty()) {
                graphics = _svg.append('g').classed('legends', true);
            }

            var updata = graphics.selectAll('rect').data(_options.data.sort(function(d1, d2) {
                return d1.value > d2.value;
            }));
            var enter = updata.enter();
            var exit = updata.exit();

            exit.remove();
            enter
                .append('rect');
            updata
                .style('fill', function(d, i) {
                    return getColor()(i);
                })
                .attr('x', 20)
                .attr('y', function(d, i) {
                    return 8 - 25 * i
                })
                .attr('width', 25)
                .attr('height', 16)
                .attr('rx', '2');

            updata = graphics.selectAll('text').data(_options.data.sort(function(d1, d2) {
                return d1.value > d2.value;
            }));
            enter = updata.enter();
            exit = updata.exit();

            exit.remove();
            enter
                .append('text');
            updata
                .style('fill', function(d, i) {
                    return getColor()(i);
                })
                .attr('x', 50)
                .attr('y', function(d, i) {
                    return 20 - 25 * i
                })
                .text(function(d, i) {
                    return d.value + '%的人表示' + d.name;
                });

            graphics.attr('transform', 'translate(' + _options.width / 2 + ',' + (_options.height / 2 - 105) + ')');
        }

        function renderBody() {
            var graphics = _svg.select('g.body');
            if (graphics.empty()) {
                graphics = _svg.append('g').classed('body', true);
            }

            graphics.attr('transform', 'translate(' + _options.width / 2 + ',' + _options.height / 2 + ')');

            var pie = d3.layout.pie()
                .sort(function(d, i) {
                    return -i;
                })
                .value(function(d) {
                    return d.value;
                });

            var pieData = pie(_options.data.sort(function(d1, d2) {
                return d1.value > d2.value;
            }));
            pieData.forEach(function(d) {
                var endAngle = d.endAngle;
                var startAngle = d.startAngle;
                d.startAngle = Math.PI * 2;
                d.endAngle = Math.PI * 2 - (endAngle - startAngle);
            });
            console.log(pieData);

            var updata = graphics.selectAll('path').data(pieData);
            var enter = updata.enter();
            var exit = updata.exit();

            exit.remove();
            enter
                .append('path');
            updata
                .style('fill', function(d, i) {
                    return getColor()(i)
                })
                .transition()
                .attrTween('d', function(dd, i) {
                    var currentArc = this.__current__; // <-C

                    var arc = d3.svg.arc()
                        .outerRadius(100 + 26 * i)
                        .innerRadius(75 + 26 * i)
                        .padAngle(0);

                    if (!currentArc)
                        currentArc = {
                            startAngle: Math.PI * 2,
                            endAngle: Math.PI * 2
                        };

                    var interpolate = d3.interpolate(dd, currentArc);

                    this.__current__ = interpolate(1); //<-D

                    return function(t) {
                        return arc(interpolate(1 - t));
                    };
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
var charts = (function(charts) {
    charts.scatterChart1 = function() {
        var _Chart = {};
        var _svg = null;

        var _xScale = null;
        var _yScale = null;

        var _yTickCount = null;
        var _tooltip = null;

        var _options = {};

        _options.container = null;

        _options.width = 600;
        _options.height = 400;
        _options.margins = {
            top: 50,
            left: 50,
            right: 25,
            bottom: 25
        };

        _options.delay = 500;
        _options.duration = 1000;
        _options.colors = d3.scale.category20();
        _options.title = '';
        _options.data = null;
        _options.xQuantifier = null;
        _options.yQuantifier = null;
        _options.xAccessor = null;
        _options.yAccessor = null;

        _options.xMin = 140
        _options.xMax = 200;
        _options.xTickValues = [140, 150, 160, 170, 180, 190, 200];

        _options.yMin = 40
        _options.yMax = 120;
        _options.yTickValues = [40, 60, 80, 100, 120];

        var _symbolTypes = d3.scale.ordinal()
            .range(["circle", "circle"]);
        var _gridsData = null;

        _Chart.setOption = function(name, value) {
            _options[name] = value;
        };
        _Chart.getOption = function() {
            return _options;
        }

        _Chart.render = function() {
            _options.width = $(_options.container).innerWidth() - 30;


            _xScale = d3.scale.linear()
                .domain([_options.xMin, _options.xMax])
                .range([0, quadrantWidth()]);

            _yScale = d3.scale.linear()
                .domain([_options.yMin, _options.yMax])
                .range([quadrantHeight(), 0]);

            _gridsData = [];

            var xStep = _xScale(_options.xTickValues[1]) - _xScale(_options.xTickValues[0]);
            var yStep = _yScale(_options.yTickValues[0]) - _yScale(_options.yTickValues[1]);
            for (var i = 0; i < _options.xTickValues.length - 1; i++) {
                for (var j = 1; j < _options.yTickValues.length; j++) {
                    var grid = {};
                    grid.x = _xScale(_options.xTickValues[i]);
                    grid.y = _yScale(_options.yTickValues[j]);
                    grid.width = xStep;
                    grid.height = yStep;
                    if (i % 2 === 0) {
                        if (j % 2 === 0) {
                            grid.color = "#F1F1F1";
                        } else {
                            grid.color = "#F8F8F8";
                        }
                    } else {
                        if (j % 2 === 0) {
                            grid.color = "#F6F6F6";
                        } else {
                            grid.color = "#F4F4F4";
                        }
                    }
                    _gridsData.push(grid);
                }
            }

            if (!_svg) {
                _svg = d3.select(_options.container).append('svg');
            }
            _svg.attr('height', _options.height)
                .attr('width', _options.width);

            if (!_tooltip) {
                _tooltip = d3.select('body').append('div');
                _tooltip.attr('class', 'tooltip')
                    .style('display', 'none');
            }

            renderTitle();
            renderXAxis();
            renderYAxis();
            renderGrids();
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
                    return d
                })
                .style('font-size', '18px')
                .attr('x', 0)
                .attr('y', 15);

            var updata = graphics.selectAll('text.subTitle').data([_options.subTitle]);
            var enter = updata.enter();
            var exit = updata.exit();

            exit
                .remove();
            enter
                .append('text')
                .classed('subTitle', true)
                .text(function(d, i) {
                    return d
                })
                .style('font-size', '12px')
                .attr('x', 0)
                .attr('y', 35);
        }

        function renderXAxis() {
            var graphics = _svg.select('g.XAxis');
            if (graphics.empty()) {
                graphics = _svg.append('g').classed('XAxis', true);
            }
            graphics.attr('transform', 'translate(' + xStart() + ',' + yEnd() + ')');

            var yAxis = d3.svg.axis()
                .scale(_xScale)
                .innerTickSize(0)
                .outerTickSize(0)
                .tickPadding(15)
                .tickValues(_options.xTickValues)
                .tickFormat(function(d) {
                    return d + _options.xQuantifier;
                })
                .orient('bottom');

            graphics.call(yAxis);
        }

        function renderYAxis() {
            var graphics = _svg.select('g.YAxis');
            if (graphics.empty()) {
                graphics = _svg.append('g').classed('YAxis', true);
            }
            graphics.attr('transform', 'translate(' + xStart() + ',' + yStart() + ')');

            var yAxis = d3.svg.axis()
                .scale(_yScale)
                .innerTickSize(0)
                .outerTickSize(0)
                .tickPadding(15)
                .tickValues(_options.yTickValues)
                .tickFormat(function(d) {
                    return d + _options.yQuantifier;
                })
                .orient('left');

            graphics.call(yAxis);
        }

        function rgba(d3Color) {
            return 'rgba(' + d3Color.r + ',' + d3Color.g + ',' + d3Color.b + ',' + '0.5)';
        }

        function renderGrids() {
            var graphics = _svg.select('g.grids');
            if (graphics.empty()) {
                graphics = _svg.append('g').classed('grids', true);
            }

            graphics.attr('transform', 'translate(' + xStart() + ',' + yStart() + ')');

            var updata = graphics.selectAll('rect.grid').data(_gridsData);
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
                    return d.x
                })
                .attr('y', function(d, i) {
                    return d.y
                })
                .attr('width', function(d, i) {
                    return d.width;
                })
                .attr('height', function(d, i) {
                    return d.height;
                });
            updata
                .transition()
                .attr('fill', function(d, i) {
                    return d.color;
                })
                .attr('x', function(d, i) {
                    return d.x
                })
                .attr('y', function(d, i) {
                    return d.y
                })
                .attr('width', function(d, i) {
                    return d.width;
                })
                .attr('height', function(d, i) {
                    return d.height;
                });
        }

        function renderBody() {
            var graphics = _svg.select('g.body');
            if (graphics.empty()) {
                graphics = _svg.append('g').classed('body', true);
            }
            graphics.attr('transform', 'translate(' + xStart() + ',' + yStart() + ')');
            drawSymbol(graphics);
            // drawMeanLine(graphics, 'all', _options.data, _options.yAccessor);
        }

        function drawSymbol(graphics) {
            var updata = graphics.selectAll('path.symbol').data(_options.data);
            var enter = updata.enter();
            var exit = updata.exit();

            exit.remove();
            enter
                .append('path')
                .classed('symbol', true)
                .attr('transform', function(d) {
                    return "translate(" + _xScale(140) + "," + _yScale(40) + ")";
                });
            updata
                .attr('fill', function(d, i) {
                    var d3Color = d3.rgb(_options.colors(d.sex));
                    return rgba(d3Color);
                })
                .transition()
                .delay(_options.delay)
                .duration(_options.duration)
                .attr('transform', function(d) {
                    return "translate(" + _xScale(_options.xAccessor(d)) + "," + _yScale(_options.yAccessor(d)) + ")";
                })
                .each(function(d, i) {
                    d3.select(this)
                        .attr('d', d3.svg.symbol().type(_symbolTypes(d.sex)));
                });
        }

        function drawMeanLine(graphics, name, data, accessor) {
            var updata = graphics.selectAll('line.' + name + '.meanLine').data([data]);
            var enter = updata.enter();
            var exit = updata.exit();

            exit
                .remove();
            enter
                .append('line')
                .classed(name, true)
                .classed('meanLine', true)
                .style('stroke', _options.colors(0))
                .style('marker-end', 'url(#' + 'arrow-' + name + ')')
                .style('display', 'none')
                .attr('x1', _xScale(140))
                .attr('x2', _xScale(140))
                .attr('y1', function(d, i) {
                    return _yScale(d3.mean(d, accessor));

                })
                .attr('y2', function(d, i) {
                    return _yScale(d3.mean(d, accessor));
                });
            updata
                .transition()
                .delay(_options.duration + _options.delay)
                .style('display', null)
                .duration(_options.duration)
                .attr('x2', quadrantWidth())
                .attr('y1', function(d, i) {
                    return _yScale(d3.mean(d, accessor));

                })
                .attr('y2', function(d, i) {
                    return _yScale(d3.mean(d, accessor));
                });
        }

        function showToolTip(html) {
            _tooltip.html(html)
                .style('left', (d3.event.pheightX) + 'px')
                .style('top', (d3.event.pheightY + 20) + 'px')
                .style('display', 'block');
        }

        function moveToolTip() {
            _tooltip
                .style('left', (d3.event.pheightX) + 'px')
                .style('top', (d3.event.pheightY + 20) + 'px')
        }

        function hiddenToolTip() {
            _tooltip
                .style('display', 'none');
        }

        function xStart() {
            return _options.margins.left;
        }

        function yStart() {
            return _options.margins.top;
        }

        function xEnd() {
            return _options.width - _options.margins.right;
        }

        function yEnd() {
            return _options.height - _options.margins.bottom;
        }

        function quadrantWidth() {
            return _options.width - _options.margins.left - _options.margins.right;
        }

        function quadrantHeight() {
            return _options.height - _options.margins.top - _options.margins.bottom;
        }

        return _Chart;
    };
    return charts;
})(charts || {});
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
var charts = (function(charts) {
    charts.themes = {};

    charts.themes.default = {
        colors: [
            '#2ec7c9', '#b6a2de', '#5ab1ef', '#ffb980', '#d87a80',
            '#8d98b3', '#e5cf0d', '#97b552', '#95706d', '#dc69aa',
            '#07a2a4', '#9a7fd1', '#588dd5', '#f5994e', '#c05050',
            '#59678c', '#c9ab00', '#7eb00a', '#6f5553', '#c14089'
        ],
        title: {
            color: '#008acd'
        },
        subTitle: {
            color: '#666'
        },
        axis: {
            size: [0, 0],
            padding: 10,
            color: '#008ACD',
            width: '2px'
        }
    };

    charts.getTheme = function(name) {
        return charts.themes.default;
    };
    return charts;
})(charts || {});
var charts = (function(charts) {
    function threeChart1() {
        var _Chart = {};

        var _svg = null;
        var _tooltip = null;

        var _xScale = null;
        var _yScale = null;
        var _yAxis = null;

        var _tickValues = null;
        var _options = {};
        var _defult = {
            container: '',
            title: '',
            subTitle: '',
            width: 800,
            height: 450,
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
            if (!_svg) {
                _svg = d3.select(_options.container).append('svg');
            }
            _svg.attr('height', _options.height)
                .attr('width', _options.width);

            var maxValues = [];

            for (var i = 0; i < _options.data.length; i++) {
                maxValues[i] = 0;
                for (var j = 0, defs = _options.seriesDefs, length = defs.length; j < length; j++) {
                    var def = defs[j];
                    var value = def.accessor(_options.data[i]);
                    maxValues[i] += value;
                }
            }

            var max = d3.max(maxValues);

            var exponent = Math.floor(Math.log(max) / Math.log(10));
            var top = Math.pow(10, exponent);

            var originalTop = top;
            while (top < max) {
                top += originalTop;
            }

            _tickValues = [];
            for (i = 0; i < _options.ticksCount; i++) {
                _tickValues.push((i * top) / (_options.ticksCount - 1));
            }

            _yScale = d3.scale.linear()
                .domain([0, top])
                .range([quadrantHeight(), 0]);

            _xScale = d3.scale.linear()
                .domain([0, _options.data.length - 1])
                .range([0, quadrantWidth()]);

            renderTitle();
            renderLegend();
            renderGrids();
            renderYAxis();
            renderCategory();
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
                .style('fill', '#FFF')
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
                .style('fill', '#FFF')
                .attr('x', 0)
                .attr('y', 35);
        }

        function renderLegend() {
            var graphics = _svg.select('g.legends');
            if (graphics.empty()) {
                graphics = _svg.append('g').classed('legends', true);
            }

            var defs = _options.seriesDefs;

            var updata = graphics.selectAll('rect').data(defs);
            var enter = updata.enter();
            var exit = updata.exit();

            exit.remove();
            enter
                .append('rect');
            updata
                .style('fill', function(d, i) {
                    return getColor(defs)(i);
                })
                .attr('x', function(d, i) {
                    return i * 100 + 20;
                })
                .attr('y', 8)
                .attr('width', 25)
                .attr('height', 16)
                .attr('rx', '2');

            updata = graphics.selectAll('text').data(defs);
            enter = updata.enter();
            exit = updata.exit();

            exit.remove();
            enter
                .append('text');
            updata
                .style('fill', function(d, i) {
                    return getColor(defs)(i);
                })
                .attr('x', function(d, i) {
                    return i * 100 + 50;
                })
                .attr('y', 20)
                .text(function(d, i) {
                    return d.displayName;
                });

            graphics.attr('transform', 'translate(' + (_options.width - 100 * defs.length) / 2 + ',' + 0 + ')');
        }

        function renderYAxis() {
            var graphics = _svg.select('g.YAxis');
            if (graphics.empty()) {
                graphics = _svg.append('g').classed('YAxis', true);
            }
            graphics.attr('transform', 'translate(' + xStart() + ',' + yStart() + ')');

            _yAxis = d3.svg.axis()
                .scale(_yScale)
                .tickValues(_tickValues)
                .tickSize(getTheme().axis.size[0], getTheme().axis.size[1])
                .tickPadding(getTheme().axis.padding)
                .tickFormat(function(d) {
                    return d + _options.quantifier;
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
            graphics.selectAll('text')
                .style('fill', '#FFF');
        }

        function renderCategory() {
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
                    return _xScale(i);
                })
                .attr('y', quadrantHeight() + 20)
                .text(function(d, i) {
                    return d.date;
                });
            graphics.selectAll('text')
                .style('fill', '#FFF');
        }

        function renderGrids() {
            var gridsData = [];
            var dial = _tickValues[1] - _tickValues[0];
            for (var i = 0; i < _options.ticksCount - 1; i++) {
                for (var j = 0; j < 6; j++) {
                    var grid = {};
                    grid.x = j;
                    grid.y = (i + 1) * dial;
                    grid.dial = dial;
                    if (i % 2 === 0) {
                        grid.color = "rgba(38,93,135,.75)";
                    } else {
                        grid.color = "rgba(58,113,155,.75)";
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
                    return _xScale(d.x);
                })
                .attr('y', function(d, i) {
                    return _yScale(d.y);
                })
                .attr('width', function(d, i) {
                    return _xScale(1);
                })
                .attr('height', function(d, i) {
                    return _yScale(0) - _yScale(d.dial);
                });
            updata
                .transition()
                .delay(_options.delay)
                .attr('x', function(d, i) {
                    return _xScale(d.x);
                })
                .attr('y', function(d, i) {
                    return _yScale(d.y);
                })
                .attr('fill', function(d, i) {
                    return d.color;
                })
                .attr('width', function(d, i) {
                    return _xScale(1);
                })
                .attr('height', function(d, i) {
                    return _yScale(0) - _yScale(d.dial);
                });
        }

        function renderBody() {
            var graphics = _svg.select('g.body');
            if (graphics.empty()) {
                graphics = _svg.append('g').classed('body', true);
            }

            graphics.attr('transform', 'translate(' + xStart() + ',' + yStart() + ')');
            drawLine(graphics);
            drawArea(graphics);
            drawCircle(graphics);
        }

        function drawArea(graphics) {
            var offect = _options.data.map(function() {
                return 0;
            });

            var area0 = d3.svg.area()
                .interpolate('monotone')
                .x(function(d, i) {
                    return _xScale(i);
                })
                .y0(quadrantHeight())
                .y1(function(d) {
                    return _yScale(0);
                });

            var area1 = d3.svg.area()
                .interpolate('monotone')
                .x(function(d, i) {
                    return _xScale(i);
                })
                .y0(quadrantHeight())
                .y1(function(d, i) {
                    return _yScale(def.accessor(d) + offect[i]);
                });

            for (var i = 0, defs = _options.seriesDefs, length = defs.length; i < length; i++) {
                var def = defs[i];

                var updata = graphics.selectAll('path.' + def.name + '.area').data([_options.data]);
                var enter = updata.enter();
                var exit = updata.exit();

                exit.remove();

                enter
                    .append('path')
                    .classed(def.name, true)
                    .classed('area', true)
                    .style('fill', rgba(getColor(def)(i), 0.3))
                    .attr('d', function(d) {
                        return area0.tension(0.5)(d);
                    });
                updata
                    .transition()
                    .delay(_options.delay)
                    .duration(_options.duration)
                    .attr('d', function(d) {
                        return area1.tension(0.5)(d);
                    });
                _options.data.forEach(function(d, i) {
                    offect[i] += def.accessor(d);
                });
            }
            graphics.selectAll('path.area').sort(function() {
                return true;
            });
        }

        function drawLine(graphics) {

            var offect = _options.data.map(function() {
                return 0;
            });

            var line0 = d3.svg.line()
                .interpolate('monotone')
                .x(function(d, i) {
                    return _xScale(i);
                })
                .y(function(d, i) {
                    return _yScale(0);
                });

            var line1 = d3.svg.line()
                .interpolate('monotone')
                .x(function(d, i) {
                    return _xScale(i);
                })
                .y(function(d, i) {
                    return _yScale(def.accessor(d) + offect[i]);
                });

            for (var i = 0, defs = _options.seriesDefs, length = defs.length; i < length; i++) {
                var def = defs[i];

                var updata = graphics.selectAll('path.' + def.name + '.line').data([_options.data]);
                var enter = updata.enter();
                var exit = updata.exit();

                exit.remove();

                enter
                    .append('path')
                    .classed(def.name, true)
                    .classed('line', true)
                    .style('stroke', getColor(def)(i))
                    .style('stroke-width', '2px')
                    .style('fill', 'none')
                    .attr('d', function(d) {
                        return line0.tension(0.5)(d);
                    });
                updata
                    .transition()
                    .delay(_options.delay)
                    .duration(_options.duration)
                    .attr('d', function(d) {
                        return line1.tension(0.5)(d);
                    });
                _options.data.forEach(function(d, i) {
                    offect[i] += def.accessor(d);
                });
            }
        }

        function drawCircle(graphics) {
            var offect = _options.data.map(function() {
                return 0;
            });
            for (var i = 0, defs = _options.seriesDefs, length = defs.length; i < length; i++) {
                var def = defs[i];

                var updata = graphics.selectAll('circle.point.' + def.name).data(_options.data);
                var enter = updata.enter();
                var exit = updata.exit();

                exit.remove();
                enter
                    .append('circle')
                    .classed(def.name, true)
                    .classed('point', true)
                    .style('stroke', getColor(def)(i))
                    .style('stroke-width', '2px')
                    .style('fill', '#FFF')
                    .attr('cx', function(d, i) {
                        return _xScale(i);
                    })
                    .attr('cy', function(d) {
                        return _yScale(0);
                    })
                    .attr('r', 4.5);
                updata
                    .transition()
                    .delay(_options.delay)
                    .duration(_options.duration)
                    .attr('cx', function(d, i) {
                        return _xScale(i);
                    })
                    .attr('cy', function(d, i) {
                        return _yScale(def.accessor(d) + offect[i]);
                    });
                _options.data.forEach(function(d, i) {
                    offect[i] += def.accessor(d);
                });
            }
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
    charts.threeChartCollection1 = function(topData, containerId) {
        var collection = {};
        var $container = $('#' + containerId);
        $container.css('backgroundColor', '#000')

        function generateOptions(data, containerId, index) {
            var def0 = {
                name: 'email',
                displayName: '邮件营销',
                accessor: function(d) {
                    return d.email;
                }
            };
            var def1 = {
                name: 'ad',
                displayName: '联盟广告',
                accessor: function(d) {
                    return d.ad;
                }
            };
            var def2 = {
                name: 'video',
                displayName: '视频广告',
                accessor: function(d) {
                    return d.video;
                }
            };
            var def3 = {
                name: 'access',
                displayName: '直接访问',
                accessor: function(d) {
                    return d.access;
                }
            };
            var def4 = {
                name: 'se',
                displayName: '搜索引擎',
                accessor: function(d) {
                    return d.se;
                }
            };
            var options = {
                container: '#' + containerId,
                title: '网络营销',
                subTitle: '第' + (index + 1) + '周',
                marginsTop: 50,
                marginsLeft: 50,
                marginsRight: 50,
                marginsBottom: 50,
                seriesDefs: [def0, def1, def2, def3, def4],
                data: data
            };
            return options;
        }

        var charts = [];

        $container.height(500);

        var width = $container.width(),
            height = $container.height();

        var renderer = new THREE.CSS3DRenderer();
        renderer.setSize(width, height);
        renderer.domElement.style.position = 'absolute';
        $container.append(renderer.domElement);

        var camera = new THREE.PerspectiveCamera(40, width / height, 1, 10000);
        camera.position.z = 4000;
        camera.setLens(30);

        var scene = new THREE.Scene();
        scene.add(camera);

        var controls = new THREE.TrackballControls(camera, renderer.domElement);
        controls.rotateSpeed = 0.1;
        controls.minDistance = 100;
        controls.maxDistance = 6000;
        controls.addEventListener('change', render);

        for (var i = 0; i < topData.length; i++) {
            var containerId = 'chart-' + i;

            var $chart = $('<div class="widget-body" style="padding: 15px;">');
            $chart.attr('id', containerId);
            $chart.css({
                margin: '30px',
                padding: '30px',
                border: '1px solid rgb(204, 204, 204)',
                backgroundColor: 'rgba(48,103,145,.75)',
                borderRadius: '8px',
                border: '2px solid rgba(127,255,255,0.25)'

            });

            $chart.appendTo($container);

            var object = new THREE.CSS3DObject($chart.get(0));
            scene.add(object);

            var helix = new THREE.Object3D();
            vector = new THREE.Vector3();
            phi = i * Math.PI / 6;
            helix.position.x = 2500 * Math.sin(phi);
            // helix.position.y = -(i * 8) + 500;
            helix.position.z = 2500 * Math.cos(phi);
            vector.x = helix.position.x * 2;
            vector.y = helix.position.y;
            vector.z = helix.position.z * 2;
            helix.lookAt(vector);

            object.position.copy(helix.position);
            object.rotation.copy(helix.rotation);

            var data = topData[i];
            var options = generateOptions(data, containerId, i);

            var threeChart = threeChart1();
            threeChart.setOptions(options);
            charts.push(threeChart);
        }

        function render() {
            console.log('render');
            renderer.render(scene, camera);
        }

        function animate() {
            requestAnimationFrame(animate);
            controls.update();
        }

        render();
        animate();

        collection.render = function() {
            console.log('render');
            for (var i = 0; i < charts.length; i++) {
                charts[i].render();
            }
        };
        return collection;
    };
    return charts;
})(charts || {});
var charts = (function(charts) {
    charts.treeChart1 = function() {
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

            var cluster = d3.layout.tree()
                .size([quadrantHeight(), quadrantWidth()])
                .separation(function separation(a, b) {
                    return a.parent == b.parent ? 1 : 2;
                });

            var diagonal = d3.svg.diagonal()
                .projection(function(d) {
                    return [d.y, d.x];
                });

            var data = $.extend(true, {}, _options.data);
            var nodes = cluster.nodes(data);
            var links = cluster.links(nodes);

            var link = graphics.selectAll('.link')
                .data(links)
                .enter()
                .append('path')
                .attr('class', 'link')
                .attr('d', diagonal)
                .style('fill', 'none')
                .style('stroke-width', '1.5px')
                .style('stroke', function(d, i) {
                    return getColor()(d.target.depth);
                });

            var node = graphics.selectAll('.node')
                .data(nodes)
                .enter()
                .append('g')
                .attr('class', 'node')
                .attr('transform', function(d) {
                    return 'translate(' + d.y + ',' + d.x + ')';
                });

            node.append('circle')
                .attr('r', 4.5)
                .style('fill', '#FFF')
                .style('stroke-width', '1.5px')
                .style('stroke', function(d, i) {
                    return getColor()(d.depth);
                });

            node.append('text')
                .attr('dx', function(d) {
                    if (!d.parent) {
                        return -8;
                    }
                    if (!d.children) {
                        return 8;
                    }
                    return 0;
                })
                .attr('dy', function(d) {
                    if (!d.parent) {
                        return 4;
                    }
                    if (!d.children) {
                        return 4;
                    }
                    return -10;
                })
                .style('text-anchor', function(d) {
                    if (!d.parent) {
                        return 'end';
                    }
                    if (!d.children) {
                        return 'start';
                    }
                    return 'middle';
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
