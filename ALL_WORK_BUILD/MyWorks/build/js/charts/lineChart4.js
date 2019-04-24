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
