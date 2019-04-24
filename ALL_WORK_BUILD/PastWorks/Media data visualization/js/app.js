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
        'threescene/GlobalScene'
    ],
    function(
        DataManager,
        EmotionSpeedometerChart,
        KeywordCloudChart,
        CollectingQuantityDisplayPanel,
        HotspotRankingList,
        GlobalScene
    ) {
        DataManager.startPoll();

        var esChart = new EmotionSpeedometerChart(document.getElementById('emotion-speedometer-svg'));
        var kcChart = new KeywordCloudChart(document.getElementById('keyword-cloud-svg'));
        var cqDisplayPanel = new CollectingQuantityDisplayPanel();
        var hpRankingList = new HotspotRankingList(document.getElementById('hotspot-ranking-list'));
        var glScene = new GlobalScene(document.getElementById('three-container'));

        esChart.setValue(DataManager.getNetizensEmotion());
        kcChart.setKeywords(DataManager.getKeywords());
        cqDisplayPanel.setCollectingQuantitys(DataManager.getCollectingQuantity());
        hpRankingList.setHotspots(DataManager.getHotspot());
        glScene.showHourlyNews(DataManager.getHourlyNews());

        $(DataManager).on('datachange', function() {
            esChart.setValue(DataManager.getNetizensEmotion());
            kcChart.setKeywords(DataManager.getKeywords());
            cqDisplayPanel.setCollectingQuantitys(DataManager.getCollectingQuantity());
            hpRankingList.setHotspots(DataManager.getHotspot());
            glScene.showHourlyNews(DataManager.getHourlyNews());
        });
    }
);
