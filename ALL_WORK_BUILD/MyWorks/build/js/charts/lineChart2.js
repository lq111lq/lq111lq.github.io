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
