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
