String.prototype.width = function(font) {
    var f = font || '12px arial',
        o = $('<div>' + this + '</div>')
        .css({ 'position': 'absolute', 'float': 'left', 'white-space': 'nowrap', 'visibility': 'hidden', 'font': f })
        .appendTo($('body')),
        w = o.width();

    o.remove();
    return w;
}
var Chart = (function() {
    var Chart = {};

    var svg = d3.select('svg')
    var defs = svg.append('defs');
    var axisG = svg.append('g');
    var mainG = svg.append('g');
    var subAxisG = mainG.append('g');
    var circleG = mainG.append('g');

    var axisHeight = 52;
    var subAxisHeigth = 30;
    var subAxisPadding = 5;

    var topNewsWidth = 450;
    var topNewsHeight = 200;
    var topNewsPadding = 200;
    var topNewsTopPadding = 0;

    var reverse;
    var dayScale;
    var hourScale;
    var s;
    var colors = d3.scale.category20b();

    var width;
    var height;
    var startTime;
    var endTime;
    var selectedTime = d3.time.day.offset(new Date(), -1);

    var data = [];
    var offextX = 0;
    var lineCount = 0;
    var oneLineCounts = 0;
    var topsCount = 0;

    var clipPath = defs.append('clipPath').attr('id', 'clip').append('rect');

    Chart.setSize = function() {
        width = window.innerWidth;
        height = window.innerHeight;
        svg.attr('width', width).attr('height', height);
    }

    Chart.setSelectedTime = function(time) {
        selectedTime = time;
    }

    Chart.setMidDate = function(midDay) {
        startTime = d3.time.day.offset(midDay, -5.5);
        endTime = d3.time.day.offset(midDay, +5.5);
        DB.getData(midDay, function(d) {
            data = d;
        });
        Chart.render();
    }

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

        s = d3.time.scale()
            .domain([startTime, endTime])
            .range([0, width * 11]);

        clipPath
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', width * 100)
            .attr('height', height - axisHeight);
        oneLineCounts = 3;
        lineCount = 3;

        if (width < 1525) {
            oneLineCounts = 2;
        }

        if (width < 1085) {
            oneLineCounts = 1;
        }

        if (height < 785) {
            lineCount = 2;
        }

        if (height < 550) {
            lineCount = 1;
        }

        topNewsPadding = (width - oneLineCounts * topNewsWidth) * 0.4;
        var padding = (width - 2 * topNewsPadding) / oneLineCounts - topNewsWidth;
        topNewsTopPadding = (height -axisHeight -subAxisHeigth - lineCount * topNewsHeight - (lineCount - 1) * padding) * 0.5;
        topsCount = oneLineCounts * lineCount;

        mainG.style('clip-path', 'url(#clip)');
        renderAxis();
        renderSubAxisG();
        renderCircles();
        if (immediate) {
            renserTops();
        } else {
            d3.timer(function() {
                renserTops();
                return true;
            }, 3000);
        }
    }

    function renderAxis() {
        axisG.selectAll('*').remove();

        axisG.attr('transform', 'translate(0,' + (height - axisHeight) + ')');

        axisG.append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', width)
            .attr('height', axisHeight)
            .attr('fill', '#000000');

        axisG.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + 2 + ")")
            .call(d3.svg.axis()
                .scale(dayScale)
                .orient("bottom")
                .tickSize(12, 12)
                .tickPadding(9)
                .tickFormat(d3.time.format("%Y-%m-%d"))
            );

        axisG.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + (axisHeight - 2) + ")")
            .call(d3.svg.axis()
                .scale(hourScale)
                .ticks(12 * 24)
                .orient("top")
                .tickFormat('')
            );

        axisG.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + (axisHeight - 2) + ")")
            .call(d3.svg.axis()
                .scale(hourScale)
                .ticks(12)
                .orient("top")
                .tickSize(12, 12)
                .tickFormat('')
            );

        var drag = d3.behavior.drag()
            .origin(function(d) {
                return {
                    x: d[0],
                    y: 0
                }
            })
            .on("drag", dragged)
            .on("dragend", dragend);

        offextX = width * (selectedTime.getTime() - startTime.getTime()) / (24 * 3600 * 1000);
        mainG.attr('transform', 'translate(' + (-offextX) + ',0)');

        axisG.append('rect')
            .datum([dayScale(selectedTime), 0])
            .attr('x', dayScale(selectedTime))
            .attr('y', 0)
            .attr('width', width * 0.095 - 4)
            .attr('height', axisHeight + 4)
            .attr('rx', 6)
            .attr('fill', 'rgba(0,255,255,0.15)')
            .attr('stroke-width', 3)
            .attr('stroke', 'rgba(0,255,255,0.5)')
            .call(drag);

        function dragged(d) {
            d[0] = d3.event.x, d[1] = 0;
            d[0] = Math.min(d[0], width * 10 / 11);
            d[0] = Math.max(d[0], 0);
            d3.select(this).attr('x', d[0]);
            var date = new Date(reverse(d[0]));
            offextX = width * (date.getTime() - startTime.getTime()) / (24 * 3600 * 1000);
            mainG.attr('transform', 'translate(' + (-offextX) + ',0)');
            selectedTime = date;
        }

        function dragend(d) {
            renserTops();
        }
    }

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
    }

    function renderCircles() {
        var update = circleG.selectAll('circle')
            .data(data, function(d) {
                return d.id
            });
        var enter = update.enter();
        var exit = update.exit();
        exit.remove();
        enter.append('circle')
            .attr('id', function(d, i) {
                return d.id;
            })
            .attr('cx', function(d, i) {
                var x = s(new Date(d.time));
                return x;
            })
            .attr('cy', height - subAxisHeigth)
            .attr('r', 0)
            .attr('json', function(d, i) {
                return new Date(d.time).getHours() + new Date(d.time).getMinutes();
            });
        //.attr('filter', 'url(#blur-1)');

        update
            .attr('cx', function(d, i) {
                var x = s(new Date(d.time));
                return x;
            })
            .attr('fill', function(d, i) {
                var c = d3.rgb(colors(d.type));
                return 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',0.3)';
            })
            .transition()
            .duration(1000)
            .delay(1000)
            .attr('cy', function(d, i) {
                return (1 - (d.time % (1000 * 3600 * 2)) / (1000 * 3600 * 2)) * (height - subAxisHeigth);
            })
            .attr('r', function(d, i) {
                return d.hot;
            });
    }

    function renserTops() {

        var parseTime = d3.time.format("%Y-%m-%d-%H").parse;
        var startTime = d3.time.day.offset(selectedTime, 0);
        var endTime = d3.time.day.offset(selectedTime, +1);
        var topData = data.filter(function(d) {
            return d.time > startTime.getTime() && d.time < endTime.getTime();
        }).sort(function(a, b) {
            return b.hot - a.hot;
        }).filter(function(d, i) {
            return i < topsCount;
        })
        console.log(topData);

        var update = d3.select('body').selectAll('div.top-news').data(topData, function(d, i) {
            return d.id
        });
        var enter = update.enter();
        var exit = update.exit();

        exit
            .style('background-color', function(d, i) {
                var c = d3.rgb(colors(d.type));
                return 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',0.3)';
            })
            .classed('hidden', true)
            .transition()
            .duration(1000)
            .style('width', function(d, i) {
                return d.hot * 2 + 'px';
            })
            .style('height', function(d, i) {
                return d.hot * 2 + 'px';
            })
            .style('border-radius', function(d, i) {
                return d.hot + 'px';
            })
            .style('left', function(d, i) {
                var x = s(new Date(d.time));
                return (x - offextX - d.hot) + 'px';
            })
            .style('top', function(d, i) {
                return (-d.hot) + (1 - (d.time % (1000 * 3600 * 2)) / (1000 * 3600 * 2)) * (height - subAxisHeigth) + 'px';
            })
            .each(function(d, i) {
                d3.select('#' + d.id).attr('fill', function() {
                    var c = d3.rgb(colors(d.type));
                    return 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',0.3)';
                });
            })
            .remove();
        enter
            .append('div')
            .classed('top-news', true)
            .classed('hidden', true)
            .each(function(d, i) {
                var textContainer = d3.select(this).append('div').classed('text-container', true);
                if (d.imgUrl) {
                    var container = d3.select(this).append('div').classed('img-container', true)[0][0];
                    $('<img>').attr('src', d.imgUrl).on('load', function() {
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
                textContainer.append('div').classed('title', true).append('a').style('width', d.title.width('900 20px Simsun') + 10 + 'px').attr('href', d.href).attr('target', '_blank').text(d.title);
                textContainer.append('p').classed('digest', true).text(d.digest);
                var time = textContainer.append('div').classed('time', true);
                time.append('span').text(
                    new Date(d.time).getFullYear() + '年' +
                    (new Date(d.time).getMonth() + 1) + '月' +
                    new Date(d.time).getDate() + '日' +
                    new Date(d.time).getHours() + ':' +
                    new Date(d.time).getMinutes()
                );
                time
                    .append('span')
                    .style('float', 'right')
                    .text(
                        '热度值:' + Math.floor(d.hot)
                    );
            })
            .style('width', function(d, i) {
                return d.hot * 2 + 'px';
            })
            .style('height', function(d, i) {
                return d.hot * 2 + 'px';
            })
            .style('border-radius', function(d, i) {
                return d.hot + 'px';
            })
            .style('left', function(d, i) {
                var x = s(new Date(d.time));
                return (x - offextX - d.hot) + 'px';
            })
            .style('top', function(d, i) {
                return (-d.hot) + (1 - (d.time % (1000 * 3600 * 2)) / (1000 * 3600 * 2)) * (height - subAxisHeigth) + 'px';
            })
            .style('background-color', function(d, i) {
                var c = d3.rgb(colors(d.type));
                return 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',0.3)';
            })
            .each(function(d, i) {
                d3.select('#' + d.id).attr('fill', 'rgba(' + 255 + ',' + 255 + ',' + 255 + ',0.5)')
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

    Chart.setSize();
    window.addEventListener('resize', function() {
        Chart.setSize();
        Chart.render(true);
    })
    return Chart;
})();

var parseTime = d3.time.format("%Y-%m-%d-%H").parse;
var currDate = new Date();
var today = parseTime(currDate.getFullYear() + '-' + (currDate.getMonth() + 1) + '-' + currDate.getDate() + '-0');
var midDate = d3.time.day.offset(today, -4);

Chart.setMidDate(midDate);

$('.button-1').click(function() {
    midDate = d3.time.day.offset(midDate, -10);
    Chart.setSelectedTime(midDate);
    Chart.setMidDate(midDate);
});

$('.button-2').click(function() {
    midDate = d3.time.day.offset(midDate, 10);
    Chart.setSelectedTime(midDate);
    Chart.setMidDate(midDate);
});

var p = 0;
window.setInterval(function() {
    if (p >= 100) {
        p = -100;
    }
    p++

    $('.title').each(function(a, b, c) {
        var w = $(this).width();
        var ww = $('a', this).width();
        $(this).scrollLeft((ww - w) * p * 0.01);
    })
}, 100)
