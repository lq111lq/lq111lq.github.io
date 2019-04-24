var timeLineApp = (function(timeLineApp) {
    var width;
    var height;

    var UI, Chart;
    var filterProvince = null;
    var filterType = null;

    var hotScale;
    var reverse;
    var dayScale;
    var hourScale;
    var fullScale;
    var data = [];

    var lineCount = 3;
    var oneLineCounts = 3;
    var topsCount = 9;

    var topNewsWidth = 360;
    var topNewsHeight = 150;
    var topNewsPadding = 200;
    var topNewsTopPadding = 0;

    var axisHeight = 52;
    var subAxisHeigth = 30;
    var subAxisPadding = 5;

    var selectedTime = d3.time.day.offset(new Date(), -1);

    function filter(d) {
        if (filterProvince && d.province != filterProvince) {
            return false;
        }
        if (filterType && d.type != filterType) {
            return false;
        }
        return true;
    }

    function reverseFilter(d) {
        return !filter(d);
    }

    var category = ['#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5', '#393b79', '#5254a3', '#6b6ecf', '#9c9ede', '#637939', '#8ca252', '#b5cf6b', '#cedb9c', '#8c6d31', '#bd9e39', '#e7ba52', '#e7cb94', '#843c39', '#ad494a', '#d6616b', '#e7969c', '#7b4173', '#a55194', '#ce6dbd', '#de9ed6', '#3182bd', '#6baed6', '#9ecae1', '#c6dbef', '#e6550d', '#fd8d3c', '#fdae6b', '#fdd0a2', '#31a354', '#74c476', '#a1d99b', '#c7e9c0', '#756bb1', '#9e9ac8', '#bcbddc', '#dadaeb', '#636363', '#969696', '#bdbdbd', '#d9d9d9'];

    var provincesColors = d3.scale.ordinal().range(category);
    var typeColors = d3.scale.category10();
    UI = timeLineApp.UI = (function() {
        var UI = {};
        $('.close').click(function() {
            UI.renderTops(0);
        })
        UI.renderTops = function(sd) {
            var topData = [];
            if (sd === 0) {
                topsCount = 0;
            } else {
                if (sd) {
                    topData = [sd]
                    oneLineCounts = 1;
                    lineCount = 1;
                    topNewsPadding = (width - oneLineCounts * topNewsWidth) * 0.4;
                    var padding = (width - 2 * topNewsPadding) / oneLineCounts - topNewsWidth;
                    topNewsTopPadding = (height - axisHeight - lineCount * topNewsHeight - (lineCount - 1) * padding) * 0.5;
                    topsCount = oneLineCounts * lineCount;
                } else {
                    oneLineCounts = 3;
                    lineCount = 3;

                    if (width < 1150) {
                        oneLineCounts = 2;
                    }

                    if (width < 900) {
                        oneLineCounts = 1;
                    }

                    if (height < 650) {
                        lineCount = 2;
                    }

                    if (height < 450) {
                        lineCount = 1;
                    }

                    topNewsPadding = (width - oneLineCounts * topNewsWidth) * 0.4;
                    var padding = (width - 2 * topNewsPadding) / oneLineCounts - topNewsWidth;
                    topNewsTopPadding = (height - axisHeight - lineCount * topNewsHeight - (lineCount - 1) * padding) * 0.5;
                    topsCount = oneLineCounts * lineCount;



                    var parseTime = d3.time.format("%Y-%m-%d-%H").parse;
                    var startTime = d3.time.day.offset(selectedTime, 0);
                    var endTime = d3.time.day.offset(selectedTime, +1);

                    topData = data.filter(function(d) {
                        return d.time > startTime.getTime() && d.time < endTime.getTime();
                    }).sort(function(a, b) {
                        return b.hot - a.hot;
                    }).filter(function(d, i) {
                        return i < topsCount;
                    })
                }

            }

            console.log(topData);

            if (topData.length) {
                $('.close').show()
                $('.close').css('right', (topNewsPadding - 50) + 'px');
                $('.close').css('top', topNewsTopPadding + 'px');
            } else {
                $('.close').hide()
            }
            var update = d3.select('body').selectAll('div.top-news').data(topData, function(d, i) {
                return d.id
            });
            var enter = update.enter();
            var exit = update.exit();

            exit
                .style('background-color', function(d, i) {
                    var c = d3.rgb(typeColors(d.type));
                    return 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',0.3)';
                })
                .classed('hidden', true)
                .transition()
                .duration(1000)
                .style('width', function(d, i) {
                    return hotScale(d.hot) * 2 + 'px';
                })
                .style('height', function(d, i) {
                    return hotScale(d.hot) * 2 + 'px';
                })
                .style('border-radius', function(d, i) {
                    return hotScale(d.hot) + 'px';
                })
                .style('left', function(d, i) {
                    var x = fullScale(new Date(d.time));
                    return (x - offextX - hotScale(d.hot)) + 'px';
                })
                .style('top', function(d, i) {
                    return (-hotScale(d.hot)) + (1 - (d.time % (1000 * 3600 * 2)) / (1000 * 3600 * 2)) * (height - subAxisHeigth) + 'px';
                })
                .each(function(d, i) {
                    d3.select('#' + d.id).select('circle').attr('fill', function() {
                        var c = d3.rgb(typeColors(d.type));
                        return 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',0.5)';
                    });
                })
                .remove();
            enter
                .append('div')
                .classed('top-news', true)
                .classed('hidden', true)
                .each(function(d, i) {
                    d3.select(this).on('click', function() {
                        window.open(d.href, '_blank');
                    })
                    var textContainer = d3.select(this).append('div').classed('text-container', true);
                    if (d.imgSrc) {
                        var container = d3.select(this).append('div').classed('img-container', true)[0][0];
                        $('<img>').attr('src', d.imgSrc).on('load', function() {
                                $(this).appendTo(container);
                                var cw = topNewsWidth * 0.39;
                                var ch = topNewsHeight;
                                var w = this.width;
                                var h = this.height;
                                if (w / h < cw / ch) {
                                    // 垂直
                                    $(this).css('width', '100%');
                                    $(this).css('height', null);
                                    var direction = 'Top';
                                    (function() {
                                        var css = { 'scrollTop': (h - ch) + 'px' };
                                        if (direction === 'Top') {
                                            direction = 'Down';
                                            css.scrollTop = (h - ch) + 'px';
                                        } else {
                                            direction = 'Top';
                                            css.scrollTop = '0px';
                                        }
                                        $(container).animate(css, 10000, arguments.callee);
                                    })();
                                } else {
                                    // 水平
                                    $(this).css('width', null);
                                    $(this).css('height', '100%');
                                    var direction = 'left';
                                    (function() {
                                        var css = { 'scrollLeft': (w - cw) + 'px' };
                                        if (direction === 'right') {
                                            direction = 'left';
                                            css.scrollLeft = '0px';
                                        } else {
                                            direction = 'right';
                                            css.scrollLeft = (w - cw) + 'px';
                                        }
                                        $(container).animate(css, 10000, arguments.callee);
                                    })();
                                }
                            })
                            .on('error', function() {
                                textContainer.style('width', '100%');
                            })
                    } else {
                        textContainer.style('width', '100%');
                    }
                    //textContainer.append('div').classed('title', true).append('a').style('width', d.title.width('900 20px Simsun') + 10 + 'px').attr('href', d.href).attr('target', '_blank').text(d.title);
                    textContainer.append('p').classed('digest', true).text(d.digest);
                    var time = textContainer.append('div').classed('time', true);
                    var date = new Date(d.time).getDate();
                    if (date < 10) date = '0' + date;
                    var hours = new Date(d.time).getHours();
                    if (hours < 10) hours = '0' + hours;
                    var minutes = new Date(d.time).getMinutes();
                    if (minutes < 10) minutes = '0' + minutes;
                    time.append('span').text(
                        new Date(d.time).getFullYear() + '.' +
                        (new Date(d.time).getMonth() + 1) + '.' +
                        date + ' ' +
                        hours + ':' +
                        minutes
                    );
                    time
                        .append('span')
                        .style('float', 'right')
                        .text(
                            '热度:' + Math.floor(d.hot)
                        );
                })
                .style('width', function(d, i) {
                    return hotScale(d.hot) * 2 + 'px';
                })
                .style('height', function(d, i) {
                    return hotScale(d.hot) * 2 + 'px';
                })
                .style('border-radius', function(d, i) {
                    return hotScale(d.hot) + 'px';
                })
                .style('left', function(d, i) {
                    var x = fullScale(new Date(d.time));
                    return (x - offextX - hotScale(d.hot)) + 'px';
                })
                .style('top', function(d, i) {
                    return (-hotScale(d.hot)) + (1 - (d.time % (1000 * 3600 * 2)) / (1000 * 3600 * 2)) * (height - subAxisHeigth) + 'px';
                })
                .style('background-color', function(d, i) {
                    var c = d3.rgb(typeColors(d.type));
                    return 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',0.3)';
                })
                .each(function(d, i) {
                    d3.select('#' + d.id).select('circle').attr('fill', 'rgba(' + 255 + ',' + 255 + ',' + 255 + ',0.5)')
                });

            update
                .transition()
                .duration(1000)
                .style('width', topNewsWidth + 'px')
                .style('height', topNewsHeight + 'px')
                .style('left', function(d, i) {
                    return topNewsPadding + ((width - 2 * topNewsPadding) / oneLineCounts - topNewsWidth) / 2 + i % oneLineCounts * ((width - 2 * topNewsPadding) / oneLineCounts) + 'px';
                })
                .style('top', function(d, i) {
                    return topNewsTopPadding + Math.floor(i / oneLineCounts) * (topNewsHeight + ((width - 2 * topNewsPadding) / oneLineCounts - topNewsWidth)) + 'px';
                })
                .style('border-radius', '5px')
                .style('background-color', function(d, i) {
                    return 'rgba(255, 255, 255, 0.8)';
                })
                .transition()
                .delay(1000)
                .duration(0)
                .attr('class', 'top-news');
        }
        var Grid = function() {
            var TYPE = { lg: 0, md: 1, sm: 2, xs: 3, }
            var type = 'lg'; //md sm xs
        }
        var provinces = ['北京', '天津', '河北', '山东', '山西', '内蒙古', '黑龙江', '吉林', '辽宁', '河南', '湖南', '湖北', '广东', '广西', '海南', '上海', '江苏', '浙江', '安徽', '福建', '江西', '陕西', '甘肃', '青海', '宁夏', '新疆', '重庆', '四川', '贵州', '云南', '西藏', '香港', '澳门', '台湾'];
        var types = ['社会', '法制', '政府', '税务', '娱乐', '环保', '军事', '房地产', '能源', '保险'];
        d3.select('.ol-0')
            .selectAll('li')
            .data(provinces)
            .enter()
            .append('li')
            .append('div')
            .text(function(d) {
                return d;
            })
            .style('border-color', function(d) {
                return provincesColors(d)
            })
            .style('background-color', function(d) {
                var color = d3.rgb(provincesColors(d));
                return 'rgba(' + color.r + ',' + color.g + ',' + color.b + ',0.1)';
            })
            .on('mousedown', function(d) {
                d3.select(this).classed('mousedown', true);
            })
            .on('mouseup', function(d) {
                d3.select(this).classed('mousedown', false);
            })
            .on('click', function(d) {
                if (!d3.select(this).classed('selected')) {
                    d3.select('.ol-0 li div.selected').classed('selected', false);
                    d3.select(this).classed('selected', true);
                    filterProvince = d;
                } else {
                    d3.select(this).classed('selected', false);
                    filterProvince = null;
                }
                Chart.updateCircles();
            });

        d3.select('.ol-1')
            .selectAll('li')
            .data(types)
            .enter()
            .append('li')
            .append('div')
            .text(function(d) {
                return d;
            })
            .style('border-color', function(d) {
                return typeColors(d)
            })
            .style('background-color', function(d) {
                var color = d3.rgb(typeColors(d));
                return 'rgba(' + color.r + ',' + color.g + ',' + color.b + ',0.1)';
            })
            .on('mousedown', function(d) {
                d3.select(this).classed('mousedown', true);
            })
            .on('mouseup', function(d) {
                d3.select(this).classed('mousedown', false);
            })
            .on('click', function(d) {
                if (!d3.select(this).classed('selected')) {
                    d3.select('.ol-1 li div.selected').classed('selected', false);
                    d3.select(this).classed('selected', true);
                    filterType = d;
                } else {
                    d3.select(this).classed('selected', false);
                    filterType = null;
                }
                Chart.updateCircles();
            });

        $('.left-button').css('line-height', $('.left-button').height() + 'px');
        $('.ui .sidebar .left-button').click(function() {
            if (!$('.ui .sidebar').hasClass('showen')) {
                $('.ui .sidebar').removeClass('hidden').addClass('showen');
                $('.left-button').text('>');
            } else {
                $('.ui .sidebar').removeClass('showen').addClass('hidden');
                $('.left-button').text('<');
            }
            UI.renderTops(0);
        });

        $('.button-1').click(function() {
            $('.button-1').addClass('is-active');
            $('.button-2').removeClass('is-active');
            $('.main-inner').addClass('show-0').removeClass('show-1');
        });

        $('.button-2').click(function() {
            $('.button-2').addClass('is-active');
            $('.button-1').removeClass('is-active');
            $('.main-inner').addClass('show-1').removeClass('show-0');
        });
        return UI;
    })();
    Chart = timeLineApp.Chart = (function() {
        var Chart = {};

        var svg = d3.select('svg')
        var defs = svg.append('defs');
        var axisG = svg.append('g');
        var mainG = svg.append('g').style('clip-path', 'url(#clip)');
        var previousTxt = mainG.append('text').text('前10天');
        var nextTxt = mainG.append('text').text('后10天');
        var subAxisG = mainG.append('g');
        var circleG = mainG.append('g');
        var clipPath = defs.append('clipPath').attr('id', 'clip').append('rect');

        var startTime;
        var endTime;

        Chart.setSize = function() {
            width = window.innerWidth;
            height = window.innerHeight;
            svg.attr('width', width).attr('height', height);
        };
        Chart.setSize();

        Chart.setSelectedTime = function(time) {
            selectedTime = time;
        };

        Chart.setMidDate = function(midDay) {
            startTime = d3.time.day.offset(midDay, -5.5);
            endTime = d3.time.day.offset(midDay, +5.5);
            if (
                selectedTime.getTime() > d3.time.day.offset(midDay, 5).getTime() ||
                selectedTime.getTime() < d3.time.day.offset(midDay, -5).getTime()
            ) {
                selectedTime = midDay;
            }

            Chart.render(false);
            data = [];
            var circlesEue = getCirclesEUE(data);
            circlesEue.exit();
            DB.getData(midDay, function(d) {
                data = d;
                Chart.render(false);
                var circlesEue = getCirclesEUE(data);
                circlesEue.enter();
                circlesEue.update();
                UI.renderTops();
            });

        };

        Chart.nextMidDate = function() {
            midDate = d3.time.day.offset(midDate, 10);
            Chart.setMidDate(midDate);
        };
        Chart.previousMidDate = function() {
            midDate = d3.time.day.offset(midDate, -10);
            Chart.setMidDate(midDate);
        };
        Chart.render = function(immediate) {
            reverse = d3.time.scale()
                .range([startTime, endTime])
                .domain([0, width]);

            dayScale = d3.time.scale()
                .domain([startTime, endTime])
                .range([0, width]);

            hourScale = d3.time.scale()
                .domain([startTime, endTime])
                .range([0, width]);

            fullScale = d3.time.scale()
                .domain([startTime, endTime])
                .range([0, width * 11]);

            hotScale = d3.scale.linear()
                .domain([0, d3.max(data, function(d) {
                    return d.hot
                })])
                .range([30, 100]);

            clipPath
                .attr('x', 0)
                .attr('y', 0)
                .attr('width', width * 12)
                .attr('height', height - axisHeight)
                .attr('transform', 'translate(' + (-width * 0.5) + ',0)');

            offextX = fullScale(selectedTime);
            mainG.attr('transform', 'translate(' + (-offextX) + ',0)');

            previousTxt
                .attr('x', -width * 0.25)
                .attr('y', (height - axisHeight - subAxisHeigth) * 0.5)
                .attr('text-anchor', 'middle')
                .attr('fill', '#888')
                .style('font', '100px sans-serif')
                .attr('dy', '50')

            nextTxt
                .attr('x', width * 11.25)
                .attr('y', (height - axisHeight - subAxisHeigth) * 0.5)
                .attr('text-anchor', 'middle')
                .attr('fill', '#888')
                .style('font', '100px sans-serif')
                .attr('dy', '50')

            renderAxis();
            renderSubAxisG();
            updateCircles();
        };

        function renderAxis() {
            axisG.selectAll('*').remove();

            axisG.attr('transform', 'translate(0,' + (height - axisHeight) + ')');

            axisG.append('rect')
                .attr('x', 0)
                .attr('y', 0)
                .attr('width', width)
                .attr('height', axisHeight)
                .attr('fill', '#000000');

            axisG.append('g')
                .attr('class', 'axis axis--x')
                .attr('transform', 'translate(0,' + 2 + ')')
                .call(d3.svg.axis()
                    .scale(dayScale)
                    .orient('bottom')
                    .tickSize(12, 12)
                    .tickPadding(9)
                    .tickFormat(d3.time.format('%Y-%m-%d'))
                );

            axisG.append('g')
                .attr('class', 'axis axis--x')
                .attr('transform', 'translate(0,' + (axisHeight - 2) + ')')
                .call(d3.svg.axis()
                    .scale(hourScale)
                    .ticks(12 * 24)
                    .orient('top')
                    .tickFormat('')
                );

            axisG.append('g')
                .attr('class', 'axis axis--x')
                .attr('transform', 'translate(0,' + (axisHeight - 2) + ')')
                .call(d3.svg.axis()
                    .scale(hourScale)
                    .ticks(12)
                    .orient('top')
                    .tickSize(12, 12)
                    .tickFormat('')
                );

            axisG.append('rect')
                .datum([dayScale(selectedTime), 0])
                .attr('x', dayScale(selectedTime))
                .attr('y', 0)
                .attr('width', width / 11)
                .attr('height', axisHeight + 3)
                .attr('rx', 6)
                .attr('fill', 'rgba(0,255,255,0.15)')
                .attr('stroke-width', 3)
                .attr('stroke', 'rgba(0,255,255,0.5)')
                .call(selectTimeRectDrag());
        };

        function renderSubAxisG() {
            subAxisG.selectAll('*').remove();

            var p = 2;
            var outerW = width / 12;
            var innerW = outerW - p;

            var count = 0;
            for (var i = startTime.getTime(); i < endTime.getTime(); i += 3600 * 1000 * 2) {
                var date = new Date(i);
                var h = date.getHours();
                var d = date.getDate();

                if (count % 2) {
                    subAxisG.append('rect')
                        .attr('x', outerW * count)
                        .attr('y', 0)
                        .attr('width', outerW)
                        .attr('height', height - axisHeight)
                        .attr('fill', 'rgba(25,25,25,0.25)');
                    //.attr('filter', 'url(#blur)');
                } else {
                    subAxisG.append('rect')
                        .attr('x', outerW * count)
                        .attr('y', 0)
                        .attr('width', outerW)
                        .attr('height', height - axisHeight)
                        .attr('fill', 'rgba(50,50,50,0.25)');
                    //.attr('filter', 'url(#blur)');
                }

                var text = '';
                if (h != 0) {
                    text = h + ':00 - ' + (h + 2) + ':00';
                } else {
                    text = d + 'day';
                }

                subAxisG.append('rect')
                    .attr('x', outerW * count + p / 2)
                    .attr('y', height - axisHeight - subAxisHeigth - subAxisPadding)
                    .attr('width', innerW)
                    .attr('height', subAxisHeigth)
                    .attr('fill', 'rgba(222,222,222,0.1)');
                subAxisG.append('text')
                    .attr('x', outerW * count + outerW / 2)
                    .attr('y', height - axisHeight - subAxisHeigth / 2 - subAxisPadding + 5)
                    .attr('text-anchor', 'middle')
                    .attr('fill', '#FFF')
                    // .attr('stroke','#FFF')
                    .text(text);
                count++;
            }
        };

        function updateCircles() {
            var eue = getCirclesEUE(data);
            eue.reUpdateFn();
        }

        Chart.updateCircles = updateCircles;

        function getCirclesEUE(data) {
            var update = circleG.selectAll('g')
                .data(data, function(d) {
                    return d.id
                });
            var enter = update.enter();
            var exit = update.exit();
            var cd = circleDrag();

            function exitFn() {
                exit.each(function() {
                    window.clearInterval(this._interval)
                }).remove();
            }

            function enterFn() {
                enter.append('g').attr('id', function(d, i) {
                        d.x = d.ox = fullScale(new Date(d.time));
                        d.y = d.oy = (1 - (d.time % (1000 * 3600 * 2)) / (1000 * 3600 * 2)) * (height - axisHeight - subAxisHeigth);
                        return d.id;
                    })
                    .attr('transform', function(d) {
                        return 'translate(' + d.x + ',' + (height - subAxisHeigth) + ')'
                    })
                    .each(function(d, i) {
                        var c = d3.rgb(typeColors(d.type));
                        var rgba = 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',0.5)';
                        var r = hotScale(d.hot)
                        var tr = r / 3;
                        var strArr = (d.keyword||'').split(';');
                        d3.select(this)
                            .append('circle')
                            .attr('cx', 0)
                            .attr('cy', 0)
                            .attr('r', r)
                            .attr('fill', rgba);
                        if (strArr.length) {
                            var text = d3.select(this)
                                .append('text')
                                //.attr('stroke', provincesColors(d.province))
                                .attr('fill', provincesColors(d.province))
                                .style('font-size', tr + 'px')
                                .attr('dy', tr / 3)
                                .attr('text-anchor', 'middle')
                                .text(strArr[Math.floor(Math.random() * strArr.length)]);
                        }

                        // this._interval = window.setInterval(function() {
                        //     text.text(strArr[Math.floor(Math.random() * strArr.length)]);
                        // }, 1000 + 3000 * Math.random())
                    })
                    .on('mouseover', function(d, i) {
                        var c = d3.rgb(typeColors(d.type));
                        var rgba = 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',1)';
                        d3.select(this).select('circle').attr('fill', rgba)
                    })
                    .on('mouseout', function(d, i) {
                        var c = d3.rgb(typeColors(d.type));
                        var rgba = 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',0.5)';
                        d3.select(this).select('circle').attr('fill', rgba)
                    })
                    .call(cd);
            }

            function updateFn() {
                update
                    .each(function(d, i) {
                        d3.select(this).select('circle')
                            .transition()
                            .duration(1000)
                            .attr('r', hotScale(d.hot));
                    })
                    .transition()
                    .duration(1000)
                    .attr('transform', function(d) {
                        return 'translate(' + d.x + ',' + d.y + ')'
                    })
            }

            function reUpdateFn() {
                update
                    .attr('id', function(d, i) {
                        d.x = d.ox = fullScale(new Date(d.time));
                        d.y = d.oy = (1 - (d.time % (1000 * 3600 * 2)) / (1000 * 3600 * 2)) * (height - axisHeight - subAxisHeigth);
                        return d.id;
                    })
                    .each(function(d, i) {
                        d3.select(this).select('circle').transition()
                            .duration(1000)
                            .attr('r', hotScale(d.hot)).attr('stroke', 'none');
                    })
                    .attr('transform', function(d) {
                        d.x = d.ox = fullScale(new Date(d.time));
                        d.y = d.oy = (1 - (d.time % (1000 * 3600 * 2)) / (1000 * 3600 * 2)) * (height - axisHeight - subAxisHeigth);
                        return 'translate(' + d.x + ',' + d.y + ')'
                    });
                update.filter(filter).style('display', null);
                update.filter(reverseFilter).style('display', 'none');
            }

            return {
                enter: enterFn,
                exit: exitFn,
                update: updateFn,
                reUpdateFn: reUpdateFn
            }
        }

        //交互
        function selectTimeRectDrag() {
            var threshold = 0.3;
            var drag = d3.behavior.drag()
                .origin(function(d) {
                    return {
                        x: d[0],
                        y: 0
                    }
                })
                .on('drag', dragged)
                .on('dragend', dragend);

            function dragged(d) {
                d[0] = d3.event.x, d[1] = 0;
                d[0] = Math.min(d[0], width * 10 / 11);
                d[0] = Math.max(d[0], -width * 0 / 11);
                d3.select(this).attr('x', d[0]);
                var date = new Date(reverse(d[0]));
                offextX = fullScale(date);
                mainG.attr('transform', 'translate(' + (-offextX) + ',0)');
                selectedTime = date;
            }

            function dragend(d) {
                if (d[0] < 0) {
                    if (d[0] < -width * threshold / 11) {
                        Chart.previousMidDate();
                    }
                    d[0] = 0;
                }
                if (d[0] > width * 10 / 11) {
                    if (d[0] > width * (10 + threshold) / 11) {
                        Chart.nextMidDate();
                    }
                    d[0] = width * 10 / 11;
                }
                d3.select(this).attr('x', d[0]);
                var date = new Date(reverse(d[0]));
                offextX = fullScale(date);
                mainG.attr('transform', 'translate(' + (-offextX) + ',0)');
                UI.renderTops()
            }
            return drag;
        };

        function circleDrag() {
            var drag = d3.behavior.drag()
                .origin(function(d) {
                    return {
                        x: d.x,
                        y: d.y
                    }
                })
                .on('drag', dragged)
                .on('dragstart', dragstart)
                .on('dragend', dragend);

            function dragged(d) {
                d.x = d3.event.x, d.y = d3.event.y;
                d3.select(this).attr('transform', 'translate(' + d.x + ',' + d.y + ')');
            }

            function dragstart(d) {
                d.dsx = d.x;
                d.dsy = d.y;
            }

            function dragend(d) {
                if (Math.abs(d.x - d.dsx) + Math.abs(d.y - d.dsy) < 10) {
                    d.x = d.dsx;
                    d.y = d.dsy;
                    d3.select(this).attr('transform', 'translate(' + d.x + ',' + d.y + ')');
                    circleClickHandler(d);
                } else {
                    d3.select(this)
                        .classed('drag', true)
                        .on('dblclick', function() {
                            d.x = d.ox;
                            d.y = d.oy;
                            d3.select(this)
                                .transition()
                                .duration(1000)
                                .attr('transform', 'translate(' + d.x + ',' + d.y + ')')
                                .select('circle')
                                .attr('stroke', 'none');
                        })
                        .select('circle')
                        .attr('stroke', '#FFF');
                }
            }
            return drag;
        }

        function circleClickHandler(d) {
            console.log(d);
            UI.renderTops(d);
        }
        return Chart;
    })();

    var parseTime = d3.time.format('%Y-%m-%d-%H').parse;
    var currDate = new Date();
    var today = parseTime(currDate.getFullYear() + '-' + (currDate.getMonth() + 1) + '-' + currDate.getDate() + '-0');
    var midDate = d3.time.day.offset(today, -4);

    Chart.setMidDate(midDate);

    window.addEventListener('resize', function() {
        width = window.innerWidth;
        height = window.innerHeight;
        $('.left-button').css('line-height', $('.left-button').height() + 'px');
        Chart.setSize();
        Chart.render(true);
        UI.renderTops();
    })

})(timeLineApp || {})
