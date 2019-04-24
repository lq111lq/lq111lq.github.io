var DB = (function() {
    DB = {};
    //date 获取指定日期date前后5天（共十天）的数据
    //并用取到的数据调用 函数cb
    DB.getData = function(date, cb) {
        $('.loading').show();
        var thisTime = d3.time.day.offset(date, 4);

        var month = (thisTime.getMonth() + 1);
        if (month < 10) {
            month = '0' + month;
        }

        var url = "http://119.254.86.249:9696/hotservice/getTodayHot?date=" + thisTime.getFullYear() + "." + month + "." + thisTime.getDate();
        d3.json(url, function(error, data) {
            if (error) throw error;
            $('.loading').hide();
            data.forEach(function(d, i) {
                d.id = "ID-" + i++;
                d.type = Math.random() * 10;
            })
            cb(data);
        });
    }
    return DB;
})();
