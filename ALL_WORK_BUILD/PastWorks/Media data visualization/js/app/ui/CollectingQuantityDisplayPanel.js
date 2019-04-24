define(function() {
    function CollectingQuantityDisplayPanel() {
        var totalQuantitySpan = d3.select('#quantity-total').text(0);
        var weiboQuantitySpan = d3.select('#quantity-weibo').text(0);
        var weixinQuantitySpan = d3.select('#quantity-weixin').text(0);
        var chuantongQuantitySpan = d3.select('#quantity-chuantong').text(0);
        var todayQuantitySpan = d3.select('#quantity-today').text(0);

        this.lastCollectingQuantitys = this.collectingQuantitys = {
            weibo: 0,
            weixin: 0,
            chuantong: 0,
            total: 0,
            today: 0
        };

        this.setCollectingQuantitys = function(cqs) {
            var lcqs = this.lastCollectingQuantitys = this.collectingQuantitys;
            this.collectingQuantitys = cqs;

            totalQuantitySpan.transition().duration(1000).tween("text", function() {
                var i0 = d3.interpolateRound(lcqs.total, cqs.total);
                var i1 = d3.interpolateRound(lcqs.weibo, cqs.weibo);
                var i2 = d3.interpolateRound(lcqs.weixin, cqs.weixin);
                var i3 = d3.interpolateRound(lcqs.chuantong, cqs.chuantong);
                var i4 = d3.interpolateRound(lcqs.today, cqs.today);
                return function(t) {
                    totalQuantitySpan.text( i0(t) );
                    weiboQuantitySpan.text( i1(t) );
                    weixinQuantitySpan.text( i2(t) );
                    chuantongQuantitySpan.text( i3(t) );
                    todayQuantitySpan.text( i4(t) );
                };
            });
        }
    }
    return CollectingQuantityDisplayPanel;
})
