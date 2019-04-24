define(function() {
    function HotspotRankingList(listElemen) {
        var list = d3.select(listElemen);
        this.setHotspots = function(hps) {
            var updata = list.selectAll('li').data(hps,function(d,i){return d});
            var enter = updata.enter();
            var exit = updata.exit();

            exit.remove();
            enter.append('li').text(function(d, i) {
                return (i + 1) + '，' + d;
            });
            updata.text(function(d, i) {
                return (i + 1) + '，' + d;
            }).order();
        }
    }
    return HotspotRankingList;
});
