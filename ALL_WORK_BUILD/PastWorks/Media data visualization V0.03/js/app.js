requirejs.config({
    baseUrl: 'js/app',
});

require(
    [
        'data/DataManager',
        'charts/EmotionSpeedometerChart',
        'charts/KeywordCloudChart',
        'ui/CollectingQuantityDisplayPanel',
        'ui/HotspotRankingList',
        'threescene/Resources',
        'threescene/GlobalScene'
    ],
    function(
        DataManager,
        EmotionSpeedometerChart,
        KeywordCloudChart,
        CollectingQuantityDisplayPanel,
        HotspotRankingList,
        Resources,
        GlobalScene
    ) {
        window.setInterval(function(argument) {
            var str = '';
            var date = new Date();

            var month = date.getMonth() + 1;
            str += date.getFullYear() + '年';
            str += date.getMonth() + 1 + '月';
            str += date.getDate() + '日 ';

            str += date.getHours() + ':';
            if (date.getMinutes() < 10) {
                str += '0' + date.getMinutes() + ':';
            } else {
                str += date.getMinutes() + ':';
            }
            if (date.getSeconds() < 10) {
                str += '0' + date.getSeconds();
            } else {
                str += date.getSeconds();
            }

            $('.timer').text(str);
        }, 1000);

        // var t = true;
        // var p = 0;
        // window.setInterval(function() {
        //     p = p + 0.5;
        //     if (p > 100) {
        //         p = 0;
        //         t = !t;
        //     }
        //     $('.hotspot-title-text').each(function() {
        //         var containerWidth = $(this).width();
        //         var textWidth = $(this)[0].scrollWidth;
        //         if (containerWidth < textWidth) {
        //             if (t) {
        //                 $(this).css('transform', 'translate(-' + (textWidth - containerWidth + 250) * (p / 100) + 'px,0px)');
        //             } else {
        //                 $(this).css('transform', 'translate(' + (textWidth) * (1 - (p / 100)) + 'px,0px)');
        //             }
        //         }
        //     });
        // }, 33);

        function update() {
            TWEEN.update();
            requestAnimationFrame(update);
        }
        update();

        var esChart = new EmotionSpeedometerChart(document.getElementById('emotion-speedometer-svg'));
        var cqDisplayPanel = new CollectingQuantityDisplayPanel();
        var kcChart = new KeywordCloudChart(document.getElementById('keyword-cloud-svg'));
        var hpRankingList = new HotspotRankingList(document.getElementById('hotspot-ranking-list'));

        $(DataManager).on('datachange.emotion', function() {
            esChart.setValue(DataManager.getNetizensEmotion());
        });

        $(DataManager).on('datachange.collectingQuantity', function() {
            cqDisplayPanel.setCollectingQuantitys(DataManager.getCollectingQuantity());
        });

        $(DataManager).on('datachange.keywords', function() {
            kcChart.setKeywords(DataManager.getKeywords());
        });

        $(DataManager).on('datachange.hotspot', function() {
            hpRankingList.setHotspots(DataManager.getHotspot());
        });

        Resources.ready(function() {
            var glScene = new GlobalScene(document.getElementById('three-container'));
            $(DataManager).on('datachange.news', function() {
                glScene.showHourlyNews(DataManager.getHourlyNews());
            });
        })
        DataManager.startPoll();
    }
);
