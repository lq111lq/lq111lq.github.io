define(function() {
    var DataManager = {};
    DataManager.pollIntervalTime = 60 * 1000;

    var collectingQuantity = {};
    collectingQuantity.weibo = 0;
    collectingQuantity.weixin = 0;
    collectingQuantity.chuantong = 0;
    collectingQuantity.total = 0;
    collectingQuantity.today = 0;

    var hotspot = [];
    var keywords = [];
    var netizensEmotion = 0;

    var hourlyNewsList = [];
    var hourlyNews = null;

    DataManager.getCollectingQuantity = function() {
        var result = {};

        return collectingQuantity;
    }

    DataManager.getNetizensEmotion = function() {
        return netizensEmotion;
    };

    DataManager.getKeywords = function() {
        return keywords;
    };

    DataManager.getHotspot = function() {
        return hotspot;
    };

    DataManager.getHourlyNews = function() {
        return hourlyNews;
    };

    function getDataFromDB() {
        var url = 'http://119.254.86.249:9797/monitor/count';
        d3.json(url, function(error, data) {
            if (error) console.error(error);
            collectingQuantity.weibo = data.weibo;
            collectingQuantity.weixin = data.weixin;
            collectingQuantity.chuantong = data.chuantong;
            collectingQuantity.total = data.weibo + data.weixin + data.chuantong;
            $(DataManager).trigger('datachange.collectingQuantity');
        });
    };

    function getDataFromDBLong() {
        var url = 'http://119.254.86.249:9797/monitor/emotion';
        d3.json(url, function(error, data) {
            if (error) console.error(error);
            netizensEmotion = data.value;
            $(DataManager).trigger('datachange.emotion');
        });

        var url = 'http://119.254.86.249:9797/monitor/hot';
        d3.json(url, function(error, data) {
            if (error) console.error(error);
            hotspot = data;
            $(DataManager).trigger('datachange.hotspot');
        });

        var url = 'http://119.254.86.249:9797/monitor/keywords';
        d3.json(url, function(error, data) {
            if (error) console.error(error);
            keywords = data;
            $(DataManager).trigger('datachange.keywords');
        });

        var url = 'http://119.254.86.249:9797/monitor/news';
        var format = d3.time.format("%Y-%m-%d");
        d3.json(url, function(error, data) {
            if (error) console.error(error);
            hourlyNewsList = data.map(function(d) {
                d.title = d.title||'最新微博';
                d.title = d.title.slice(0,12);
                d.content = d.content;
                d.author = d.sitename; 
                d.local = d.local || { name: '北京', log: 116, lat: 40 };
                d.time = format(new Date(d.time));
                return d;
            });
        });
    };

    DataManager.startPoll = function() {
        getDataFromDB();
        getDataFromDBLong();
        var counter = { value: 0 };
        var colors = [
            ['rgba(255,255,255,0.5)', 'rgba(255,255,255,1)'],
            ['rgba(0,255,235,0.5)', 'rgba(0,255,235,1)'],
            ['rgba(0,255,105,0.5)', 'rgba(0,255,105,1)']
        ];
        new TWEEN.Tween(counter)
            .to({ value: 100 }, DataManager.pollIntervalTime)
            .repeat(Infinity)
            .onUpdate(function() {
                $('.progress-inner').css('background-color', colors[~~(counter.value * 3 / 100)]);
                $('.progress-inner').css('border-right-color', colors[~~(counter.value * 3 / 100)]);
                $('.progress-inner').css('width', counter.value * 3 % 100 + '%');
            })
            .start();
        window.setInterval(getDataFromDB, DataManager.pollIntervalTime / 3);

        window.setInterval(getDataFromDBLong, DataManager.pollIntervalTime);

        window.setInterval(function() {
            var newNews = hourlyNewsList.pop();
            if (newNews) {
                hourlyNews = newNews;
                $(DataManager).trigger('datachange.news');
            }
        }, DataManager.pollIntervalTime / 5);
    }
    return DataManager;
});
