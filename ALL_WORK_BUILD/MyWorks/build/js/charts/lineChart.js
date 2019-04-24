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
