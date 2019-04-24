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
