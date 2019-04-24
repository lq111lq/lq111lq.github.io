define(function() {
    var DataManager = {};
    DataManager.pollIntervalTime = 5000;

    DataManager.getCollectingQuantity = function() {
        var result = {};

        result.weibo = Math.random() * 100000 + 100000;
        result.weixin = Math.random() * 200000 + 100000;
        result.chuantong = Math.random() * 500000 + 300000;

        result.total = result.weibo + result.weixin + result.chuantong;
        result.today = Math.random() * 5000 + 5000;
        console.log(JSON.stringify(result));
        return result;
    }

    DataManager.getNetizensEmotion = function() {
        var result = Math.floor(Math.random() * 90);
        return result;
    };

    DataManager.getKeywords = function() {
        var keywords = ['谈心', '3268次', '遛螃哥', '杜汶泽', '瘦身', '安倍', '名字被写错', '金色', 'iPhone', '受欢迎', '王菲', '离婚', '后全面复出', '朱莉', '还有3年生命', '五姐妹', '集体自杀', '上海地铁', '进食罚500', '美女', '怒抽', '猥琐男', '怒吼', '马英九', '台风“天兔”', '民政部', '回应以房养老', '王菲李亚鹏过中秋', '高档餐厅中秋宴遇冷', '举报富人名人超生', '连战赴湖北谒祖', '无准生证看病被拒', '小孩打110要吃的', '最美抗癌女孩', '离世', '幼童', '被母亲抛下楼', '青年划船赏月落水', '超级玛丽之父病逝', '上海拟禁地铁进食', '大长今 甄嬛传', '领导亲属', '插手工程', '中石油管道', '收归国有', '北京', '2万套限价房', '黄金大米', '试验致歉', '政府大楼', '开鲜奶店', '霍思燕', '生子', '中秋最圆月亮', '初中生发帖', '被刑拘', 'iOS7发布', '大同负债超百亿', '安阳袭警', '500岁美洲龟', '北京房价', '一年涨20%', '歼15最大挂弹起降', '调休挪假'];
        var result = keywords.filter(function() {
            return true;
        }).map(function(d) {
            return {
                text: d,
                hot: Math.random() * 20 + 5,
                type: ~~(Math.random() * 3)
            }
        });
        console.log(JSON.stringify(result));
        return result;
    };

    DataManager.getHotspot = function() {
        var Hotspot = ['对WiFi过敏的“电磁波过敏症', '民警牺牲438名', '全班唯一女生过生', '杜海涛骂人不认错', '主播混入女生宿舍'];
        Hotspot.sort(function() {
            return Math.random() > 0.5
        });
        console.log(JSON.stringify(Hotspot));
        return Hotspot;
    };

    DataManager.getHourlyNews = function() {
        var result = [];
        var contents = [
            '中新网4月6日电 据国家食品药品监督管理总局网站消息,国家食品药品监督管理总局新闻发言人再谈冒牌乳粉案时表示,我们支持消费者向冒牌产品的生产经营者依法索赔。',
            '习近平同志在党的新闻舆论工作座谈会上的重要讲话,科学回答了党的新闻舆论工作中一系列重大理论和实践问题,是对马克思主义新闻观在新的时代条件下的丰富和发展。',
            '记者近日在采访中发现，一些农村地区占用耕地建坟现象有所抬头，有村民甚至需要“绕坟播种”。虽然各级民政部门多措并举治理“坟占地”，却屡禁不止。辽宁省社科院研究员张思宁认为，解决“坟占地”顽疾需要疏堵结合，在加强对非法占地行为监管的同时，必须加快推进基层公益性公墓建设，健全农村殡葬服务体系，做到疏堵结合，方为治本之策。',
            '人口是优势还是劣势？大城市严控规模引争议',
            '湖南衡阳雷政富案始末：4省数十官员被色诱敲诈',
            '女孩酒店内遭袭 如家否认花钱删帖',
            '专家称中国楼市存在局部泡沫 大多数城市可控',
            '500项油气管线隐患年内解决 高校危化品全市监管',
            '中兴管理层大变动：创业团队退出 少壮派全面接管'
        ];
        var locals = [
            { name: '北京', log: 116, lat: 37 },
            { name: '上海', log: 121, lat: 31 },
            { name: '香港', log: 114, lat: 22 },
            { name: '广州', log: 113, lat: 23 },
            { name: '杭州', log: 120, lat: 30 },
            { name: '乌鲁木齐', log: 87, lat: 43 }
        ];


        var news = {
            content: contents[~~(Math.random() * contents.length)],
            local: locals[~~(Math.random() * locals.length)]
        };

        return news;
    };
    var interval = null;
    DataManager.startPoll = function() {
        interval = window.setInterval(
            function() {
                $(DataManager).trigger('datachange');
            },
            DataManager.pollIntervalTime
        );
    }

    return DataManager;
});
