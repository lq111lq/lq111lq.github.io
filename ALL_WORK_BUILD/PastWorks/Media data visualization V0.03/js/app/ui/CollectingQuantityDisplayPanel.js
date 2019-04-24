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

        function format(s, n) {
            n = n > 0 && n <= 20 ? n : 2;
            s = parseFloat((s + "").replace(/[^\d\.-]/g, "")).toFixed(n) + "";
            var l = s.split(".")[0].split("").reverse(),
                r = s.split(".")[1];
            t = "";
            for (i = 0; i < l.length; i++) {
                t += l[i] + ((i + 1) % 3 == 0 && (i + 1) != l.length ? "," : "");
            }
            return t.split("").reverse().join("");
        }

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
                    totalQuantitySpan.text( format( i0(t),3 ) );
                    weiboQuantitySpan.text( format( i1(t),3 ) );
                    weixinQuantitySpan.text( format( i2(t),3 ) );
                    chuantongQuantitySpan.text( format( i3(t),3 ) );
                    todayQuantitySpan.text( format( i4(t),3 ) );
                };
            });
        }
    }
    return CollectingQuantityDisplayPanel;
})
