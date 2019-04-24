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
