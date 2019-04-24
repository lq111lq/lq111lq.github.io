define(function() {
    function HotspotRankingList(listElemen) {
        var list = d3.select(listElemen);
        this.setHotspots = function(hps) {
            var updata = list.selectAll('div.hotspot').data(hps, function(d, i) {
                return d
            });
            var enter = updata.enter();
            var exit = updata.exit();

            exit.transition()
                .duration(1000).style('top', function(d, i) {
                    return 250 + 'px';
                })
                .each(function(){
                   var $text = $(this).find('.hotspot-title-text'); 
                   $text.finish();
                })
                .remove();
            enter.append('div').classed('hotspot', true).each(function(d, i) {
                d3.select(this)
                    .append('div').classed('hotspot-ranking', true).text('0' + (i + 1));
                d3.select(this)
                    .append('div').classed('hotspot-title', true)
                    .append('div').classed('hotspot-title-text', true).text(d);
                var $text = $(this).find('.hotspot-title-text');
                var containerWidth = $text.width();
                var textWidth = $text[0].scrollWidth;
                if (containerWidth < textWidth) {
                    window.setTimeout(function() {
                        var cb = arguments.callee;
                        $text.css('left', '0px');
                        $text.delay(10000).animate({ left: textWidth - containerWidth + 250 + 'px' }, {
                            step: function(now, fx) {
                                $(this).css('transform', 'translate(-' + now + 'px,0px)');
                            },
                            duration: 5000,
                            easing: 'linear',
                            complete: function() {
                                $text.css('left', containerWidth + 'px');
                                $text.animate({ left: '0px' }, {
                                    step: function(now, fx) {
                                        $(this).css('transform', 'translate(' + now + 'px,0px)');
                                    },
                                    duration: 5000,
                                    easing: 'linear',
                                    complete: cb
                                });
                            }
                        });
                    }, 7500 * i);
                }

            }).style('left', function(d, i) {
                return 1920 + 'px';
            });
            updata
                .each(function(d, i) {
                    d3.select(this).select('div.hotspot-ranking').text('0' + (i + 1));
                })
                .transition()
                .duration(1000).style('left', function(d, i) {
                    return i * 250 + 'px';
                });
        }
    }
    return HotspotRankingList;
});
