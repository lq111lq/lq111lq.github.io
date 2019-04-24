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
