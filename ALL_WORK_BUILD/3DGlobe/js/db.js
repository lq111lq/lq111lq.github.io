var DB = (function() {
    var DB = {};
    var repertorys = {};
    DB.repertorys = [
        { name: '北京', lat: 39, log: 116 },
        { name: '广州', lat: 23, log: 113 },
        { name: '上海', lat: 30, log: 121 }
    ];
    DB.citys = [
        { name: '莫斯科', lat: 39, log: 37.4 },
        { name: '柏林', lat: 52.3, log: 13.3 },
        { name: '伦敦', lat: 51.3, log: 0 },
        { name: '华盛顿', lat: 38, log: -77 },
        { name: '雅加达', lat: -6, log: 106.5 },
        { name: '里约热内卢', lat: -22, log: -43 },
        { name: '悉尼', lat: -33.5, log: 151 }
    ];
    DB.altCity = [{ name: '阿布扎比', lat: 24.27, log: 54.23 }, { name: '阿布贾', lat: 9.12, log: 7.11 }, { name: '阿卡普尔科', lat: 16.51, log: -99.56 }, { name: '阿克拉', lat: 5.33, log: 0.15 }, { name: '艾达克岛', lat: 51.52, log: 176.39 }, { name: '亚当斯敦', lat: -25.04, log: -130.05 }, { name: '亚的斯亚贝巴', lat: 9.03, log: 38.42 }, { name: '阿得莱德', lat: -34.56, log: 138.36 }, { name: '亚丁', lat: 12.5, log: 45 }, { name: '阿格拉', lat: 27.09, log: 78 }, { name: '阿瓜斯卡连特斯', lat: 21.51, log: -102.18 }, { name: '艾哈迈达巴德', lat: 23.03, log: 72.4 }, { name: '阿科隆', lat: 41.04, log: -81.31 }, { name: '吉萨', lat: 30.01, log: 31.12 }, { name: '奥尔巴尼', lat: 42.4, log: -73.47 }, { name: '阿尔布开克', lat: 35.07, log: -106.4 }, { name: '亚历山大', lat: 31.13, log: 29.55 }, { name: '阿尔及尔', lat: 36.42, log: 3.13 }, { name: '阿拉木图', lat: 43.19, log: 76.55 }, { name: '阿洛菲', lat: -19.03, log: -169.55 }, { name: '安汶', lat: -4.5, log: 128.1 }, { name: '安曼', lat: 31.57, log: 35.56 }, { name: '阿姆斯特丹', lat: 52.21, log: 4.52 }, { name: '阿纳德尔', lat: 64.4, log: 177.32 }, { name: '阿纳海姆', lat: 33.5, log: -117.52 }, { name: '安克雷奇', lat: 61.13, log: -149.52 }, { name: '安道尔', lat: 42.3, log: 1.31 }, { name: '安卡拉', lat: 40.02, log: 32.54 }, { name: '鞍山', lat: 41.05, log: 122.58 }, { name: '塔那那利佛', lat: -18.55, log: 47.31 }, { name: '阿皮亚', lat: -13.48, log: -171.45 }, { name: '阿克陶', lat: 44.31, log: 50.16 }, { name: '阿克托贝', lat: 50.17, log: 57.1 }, { name: '阿灵顿', lat: 32.41, log: -97.07 }, { name: '阿什哈巴德', lat: 37.58, log: -58.24 }, { name: '阿斯马拉', lat: 15.2, log: -38.58 }, { name: '阿斯塔纳', lat: 51.1, log: 71.3 }, { name: '亚松森', lat: -25.15, log: -57.4 }, { name: '雅典', lat: 38.02, log: 23.44 }, { name: '亚特兰大', lat: 33.46, log: -84.25 }, { name: '奥克兰', lat: -36.55, log: 174.45 }, { name: '奥克斯塔', lat: 44.19, log: -69.46 }, { name: '奥罗拉', lat: 39.42, log: -104.43 }, { name: '奥斯丁', lat: 30.17, log: -97.44 }, { name: '亚速尔群岛', lat: 38.3, log: -28 }, { name: '巴格达', lat: 33.14, log: 44.22 }, { name: '巴库', lat: 40.22, log: 49.53 }, { name: '巴厘巴板', lat: -1.15, log: 116.5 }, { name: '巴尔的摩', lat: 39.17, log: -76.37 }, { name: '巴马科', lat: 12.4, log: -7.59 }, { name: '斯里巴加湾港', lat: 4.56, log: 114.58 }, { name: '万隆', lat: -6.57, log: 107.34 }, { name: '班加罗尔', lat: 12.58, log: 77.34 }, { name: '曼谷', lat: 13.5, log: 100.29 }, { name: '班吉', lat: 4.23, log: 18.37 }, { name: '班珠尔', lat: 13.28, log: -16.39 }, { name: '包头', lat: 40.38, log: 109.59 }, { name: '巴塞罗那', lat: 41.18, log: 2.06 }, { name: '巴尔瑙尔', lat: 53.21, log: 83.47 }, { name: '巴塞尔', lat: 47.34, log: 7.36 }, { name: '巴士拉', lat: 30.3, log: 47.49 }, { name: '巴斯特尔', lat: 16.14, log: -61.32 }, { name: '巴斯特尔', lat: 17.18, log: -62.43 }, { name: '巴斯蒂亚', lat: 42.41, log: 9.26 }, { name: '巴吞鲁日', lat: 30.27, log: -91.08 }, { name: '贝鲁特', lat: 33.52, log: 35.3 }, { name: '贝尔法斯特', lat: 54.36, log: -5.57 }, { name: '贝尔格莱德', lat: 44.49, log: 20.28 }, { name: '贝尔莫潘', lat: 17.25, log: -88.46 }, { name: '伯尔尼', lat: 46.57, log: 7.26 }, { name: '伯利恒', lat: 31.42, log: 35.12 }, { name: '布巴内斯', lat: 20.15, log: 85.5 }, { name: '比林斯', lat: 45.47, log: -108.27 }, { name: '伯明翰', lat: 52.3, log: -1.55 }, { name: '伯明翰', lat: 33.3, log: -86.55 }, { name: '比什凯克', lat: 42.53, log: 74.46 }, { name: '俾斯麦酒', lat: 46.49, log: -100.47 }, { name: '比绍', lat: 11.52, log: -15.39 }, { name: '勃朗峰-萨伯隆', lat: 51.26, log: -57.08 }, { name: '波哥大', lat: 4.38, log: -74.05 }, { name: '博伊西', lat: 43.37, log: -116.13 }, { name: '波士顿', lat: 42.19, log: -71.05 }, { name: '布雷德斯', lat: 16.46, log: -62.12 }, { name: '布兰普顿', lat: 43.41, log: -79.46 }, { name: '巴西利亚', lat: -15.45, log: -47.57 }, { name: '布拉迪斯拉发', lat: 48.09, log: 17.07 }, { name: '布拉柴维尔', lat: -4.14, log: 15.14 }, { name: '布里奇顿', lat: 13.06, log: -59.37 }, { name: '布里斯班', lat: -27.28, log: 153.02 }, { name: '布鲁塞尔', lat: 50.51, log: 4.21 }, { name: '布加勒斯特', lat: 44.23, log: 26.1 }, { name: '布达佩斯', lat: 47.26, log: 19.15 }, { name: '布宜诺斯艾利斯', lat: -34.2, log: -58.3 }, { name: '布法罗', lat: 42.52, log: -78.55 }, { name: '布琼布拉', lat: -3.22, log: 29.21 }, { name: '开罗', lat: 30, log: 31.17 }, { name: '卡尔加里', lat: 51.05, log: -114.05 }, { name: '卡利', lat: 3.24, log: -76.3 }, { name: '堪培拉', lat: -35.18, log: 149.08 }, { name: '坎昆', lat: 21.1, log: -86.51 }, { name: '开普敦', lat: -33.55, log: 18.27 }, { name: '加拉加斯', lat: 10.3, log: -66.58 }, { name: '加地夫', lat: 51.28, log: -3.11 }, { name: '卡森城', lat: 39.1, log: -118.46 }, { name: '卡萨布兰卡', lat: 33.36, log: -7.37 }, { name: '卡斯特里', lat: 14.01, log: -60.59 }, { name: '卡宴', lat: 4.55, log: -52.18 }, { name: '宿务岛', lat: 10.17, log: 123.54 }, { name: '长春', lat: 43.5, log: 125.2 }, { name: '长沙', lat: 28.1, log: 113 }, { name: '查尔斯顿', lat: 38.23, log: -81.4 }, { name: '夏洛特', lat: 35.05, log: -80.5 }, { name: '夏洛特敦', lat: 46.14, log: -63.09 }, { name: '查塔姆岛', lat: -44, log: -176.35 }, { name: '车里雅宾斯克', lat: 55.1, log: 61.25 }, { name: '成都', lat: 30.37, log: 104.06 }, { name: '钦奈', lat: 13.05, log: 80.18 }, { name: '夏延文', lat: 41.08, log: -104.49 }, { name: '芝加哥', lat: 41.51, log: -87.41 }, { name: '奇瓦瓦', lat: 28.38, log: -106.05 }, { name: '基希讷乌', lat: 47, log: 28.5 }, { name: '吉大港', lat: 22.2, log: 91.48 }, { name: '乔巴山', lat: 48.04, log: 114.3 }, { name: '重庆', lat: 29.31, log: 106.35 }, { name: '基督城', lat: -43.32, log: 172.37 }, { name: '辛辛那提', lat: 39.1, log: -84.3 }, { name: '克利夫兰', lat: 41.3, log: -81.41 }, { name: '科伦坡', lat: 6.55, log: 79.52 }, { name: '哥伦比亚', lat: 34.01, log: -81 }, { name: '哥伦布', lat: 39.59, log: -82.59 }, { name: '科纳克里', lat: 9.3, log: -13.43 }, { name: '康科特', lat: 43.13, log: -71.32 }, { name: '哥本哈根', lat: 55.43, log: 12.34 }, { name: '科尔多瓦', lat: 37.53, log: -4.46 }, { name: '达喀尔', lat: 14.38, log: -17.27 }, { name: '大连', lat: 38.53, log: 121.37 }, { name: '达拉斯', lat: 32.47, log: -96.47 }, { name: '大马士革', lat: 33.3, log: 36.19 }, { name: '达累斯萨拉姆', lat: -6.51, log: 39.18 }, { name: '达尔文', lat: -12.28, log: 130.51 }, { name: '德令哈', lat: 28.4, log: 77.14 }, { name: '登巴萨', lat: -8.4, log: 115.14 }, { name: '丹佛', lat: 39.43, log: -104.59 }, { name: '得梅因', lat: 41.36, log: -93.38 }, { name: '底特律', lat: 42.23, log: -83.05 }, { name: '达卡', lat: 23.51, log: 90.24 }, { name: '帝力', lat: -8.35, log: 125.35 }, { name: '吉布提', lat: 12, log: 42.5 }, { name: '多多马', lat: -6.1, log: 35.4 }, { name: '多哈', lat: 25.15, log: 51.34 }, { name: '多佛尔', lat: 39.1, log: -75.32 }, { name: '迪拜', lat: 25.13, log: 55.17 }, { name: '都柏林', lat: 53.26, log: -6.15 }, { name: '德班', lat: -29.53, log: 31.03 }, { name: '杜尚别', lat: 38.38, log: 68.51 }, { name: '杜塞尔多夫', lat: 51.13, log: 6.47 }, { name: '复活节岛', lat: -27.05, log: -109.2 }, { name: '爱丁堡', lat: 55.57, log: -3.13 }, { name: '埃德蒙顿', lat: 53.34, log: -113.25 }, { name: '阿尤恩', lat: 27.09, log: -13.12 }, { name: '埃尔帕索', lat: 31.45, log: -106.29 }, { name: '英德', lat: -8.51, log: 121.4 }, { name: '伊斯法罕', lat: 32.42, log: 51.4 }, { name: '费尔班克斯', lat: 64.5, log: -147.43 }, { name: '费萨拉巴德', lat: 31.25, log: 73.09 }, { name: '费尔南多-迪诺罗尼亚', lat: -3.54, log: -32.25 }, { name: '福州', lat: 26.01, log: 119.2 }, { name: '法兰西堡', lat: 14.36, log: -61.05 }, { name: '福特沃斯', lat: 32.45, log: -97.2 }, { name: '法兰克福', lat: 38.12, log: -84.52 }, { name: '法兰克福', lat: 50.02, log: 8.34 }, { name: '费里敦', lat: 8.3, log: -13.17 }, { name: '弗雷斯诺', lat: 36.45, log: -119.45 }, { name: '福冈', lat: 33.39, log: 130.21 }, { name: '福纳佛提', lat: -8.31, log: 179.13 }, { name: '丰沙尔', lat: 32.38, log: -16.54 }, { name: '抚顺', lat: 41.51, log: 123.53 }, { name: '哈博罗内', lat: -24.45, log: 25.55 }, { name: '加拉帕戈斯群岛', lat: -0.54, log: -89.36 }, { name: '甘比尔群岛', lat: -23.08, log: -134.57 }, { name: '加蒂诺', lat: 45.29, log: -75.4 }, { name: '加沙', lat: 31.3, log: 34.28 }, { name: '格但斯克', lat: 54.22, log: 18.38 }, { name: '日内瓦', lat: 46.14, log: 6.04 }, { name: '乔治敦', lat: 6.46, log: -58.1 }, { name: '乔治敦', lat: 19.2, log: -81.23 }, { name: '直布罗陀', lat: 36.07, log: -5.22 }, { name: '格拉斯哥', lat: 55.52, log: -4.15 }, { name: '瓜达拉哈拉', lat: 20.4, log: -103.21 }, { name: '关岛', lat: 13.3, log: 144.4 }, { name: '危地马拉', lat: 14.38, log: -90.22 }, { name: '瓜亚基尔', lat: -2.13, log: -79.54 }, { name: '桂阳', lat: 26.35, log: 106.4 }, { name: '哈利法克斯', lat: 44.38, log: -63.35 }, { name: '汉堡', lat: 53.33, log: 10 }, { name: '汉密尔顿', lat: 32.18, log: -64.47 }, { name: '汉密尔顿', lat: 43.15, log: -79.51 }, { name: '杭州', lat: 30.1, log: 120.07 }, { name: '河内', lat: 21.01, log: 105.53 }, { name: '哈拉雷', lat: -17.49, log: 31.04 }, { name: '哈尔滨', lat: 45.45, log: 126.41 }, { name: '哈里斯堡', lat: 40.16, log: -76.53 }, { name: '哈特福德', lat: 41.46, log: -72.41 }, { name: '哈瓦那', lat: 23.08, log: -82.23 }, { name: '赫勒拿', lat: 46.35, log: -112.02 }, { name: '赫尔辛基', lat: 60.1, log: 24.53 }, { name: '广岛', lat: 34.23, log: 132.27 }, { name: '胡志明', lat: 10.46, log: 106.43 }, { name: '荷伯特', lat: -42.54, log: 147.18 }, { name: '香港', lat: 22.17, log: 114.08 }, { name: '霍尼亚拉', lat: -9.32, log: 160.12 }, { name: '檀香山', lat: 21.19, log: -157.5 }, { name: '休斯顿', lat: 29.45, log: -95.23 }, { name: '科布多', lat: 46.4, log: 90.45 }, { name: '海得拉巴', lat: 17.22, log: 78.26 }, { name: '仁川', lat: 37.3, log: 126.38 }, { name: '印第安纳波利斯', lat: 39.47, log: -86.08 }, { name: '印多尔', lat: 22.42, log: 75.54 }, { name: '伊卡瑞特', lat: 63.45, log: -68.3 }, { name: '伊斯兰堡', lat: 33.4, log: 73.08 }, { name: '伊斯坦布尔', lat: 41.02, log: 28.58 }, { name: '伊兹密尔', lat: 38.24, log: 27.09 }, { name: '杰克逊', lat: 32.2, log: -90.11 }, { name: '杰克逊维尔', lat: 30.2, log: -81.4 }, { name: '斋浦尔', lat: 26.53, log: 75.5 }, { name: '查亚普拉', lat: -2.28, log: 140.38 }, { name: '吉达', lat: 21.3, log: 39.1 }, { name: '杰斐逊城', lat: 38.34, log: -92.11 }, { name: '泽西城', lat: 40.42, log: -74.03 }, { name: '耶路撒冷', lat: 31.47, log: 35.13 }, { name: '吉林', lat: 43.53, log: 126.35 }, { name: '济南', lat: 36.5, log: 117 }, { name: '锦州', lat: 41.07, log: 121.06 }, { name: '约翰内斯堡', lat: -26.08, log: 27.54 }, { name: '朱诺', lat: 58.18, log: -134.25 }, { name: '喀布尔', lat: 34.3, log: 69.1 }, { name: '加里宁格勒', lat: 54.43, log: 20.3 }, { name: '堪察加', lat: 53.01, log: 158.39 }, { name: '坎帕拉', lat: 0.19, log: 32.35 }, { name: '尼日利亚卡诺', lat: 12, log: 8.31 }, { name: '坎普尔', lat: 26.27, log: 80.14 }, { name: '堪萨斯城', lat: 39.02, log: -94.33 }, { name: '高雄', lat: 23.03, log: 120.27 }, { name: '卡拉奇', lat: 24.51, log: 67.02 }, { name: '加德满都餐厅', lat: 27.42, log: 85.19 }, { name: '考纳斯', lat: 54.54, log: 23.54 }, { name: '川崎', lat: 35.32, log: 139.43 }, { name: '喀山', lat: 55.45, log: 49.1 }, { name: '喀士穆', lat: 15.34, log: 32.36 }, { name: '孔敬', lat: 16.25, log: 102.5 }, { name: '库尔纳', lat: 22.49, log: 89.34 }, { name: '基加利', lat: -1.59, log: 30.05 }, { name: '京斯敦', lat: -29.03, log: 167.58 }, { name: '京斯敦', lat: 17.58, log: -76.48 }, { name: '金斯敦', lat: 13.12, log: -61.14 }, { name: '金沙萨', lat: -4.18, log: 15.18 }, { name: '圣诞岛', lat: 1.52, log: -157.2 }, { name: '北九州', lat: 33.52, log: 130.49 }, { name: '诺克斯维尔', lat: 35.58, log: -83.56 }, { name: '神户', lat: 34.41, log: 135.1 }, { name: '加尔各答', lat: 22.34, log: 88.2 }, { name: '科罗尔', lat: 7.3, log: 134.3 }, { name: '九龙', lat: 22.2, log: 114.15 }, { name: '克拉科夫', lat: 50.03, log: 19.55 }, { name: '克拉斯诺亚尔斯克', lat: 56.05, log: 92.46 }, { name: '吉隆坡', lat: 3.08, log: 101.42 }, { name: '昆明', lat: 25.04, log: 102.41 }, { name: '古邦', lat: -10.23, log: 123.38 }, { name: '科威特省', lat: 29.2, log: 48 }, { name: '基辅', lat: 50.28, log: 30.29 }, { name: '京都', lat: 35, log: 135.45 }, { name: '拉柯鲁尼亚', lat: 43.22, log: -8.24 }, { name: '拉巴斯', lat: -16.3, log: -68.09 }, { name: '拉普拉塔', lat: -34.55, log: -57.57 }, { name: '拉各斯', lat: 6.35, log: 3.02 }, { name: '拉合尔', lat: 31.34, log: 74.22 }, { name: '兰州', lat: 36.01, log: 103.45 }, { name: '拉斯帕尔马斯', lat: 28.08, log: -15.27 }, { name: '拉斯维加斯', lat: 36.1, log: -115.1 }, { name: '洛桑', lat: 46.32, log: 6.39 }, { name: '拉瓦尔', lat: 45.35, log: -73.45 }, { name: '莱昂', lat: 21.1, log: -101.42 }, { name: '法耶特', lat: 38.02, log: -84.27 }, { name: '拉萨', lat: 29.41, log: 91.1 }, { name: '利伯维尔', lat: 0.3, log: 9.25 }, { name: '利隆圭', lat: -13.58, log: 33.49 }, { name: '利马', lat: -12.06, log: -76.55 }, { name: '林肯', lat: 40.49, log: -96.4 }, { name: '里斯本', lat: 38.42, log: -9.05 }, { name: '小石城', lat: 34.44, log: -92.19 }, { name: '利物浦', lat: 53.25, log: -3 }, { name: '卢布尔雅那', lat: 46.03, log: 14.31 }, { name: '罗兹', lat: 51.49, log: 19.28 }, { name: '洛美', lat: 6.1, log: 1.21 }, { name: '伦敦', lat: 51.3, log: -0.07 }, { name: '长滩', lat: 33.47, log: -118.09 }, { name: '隆格伊', lat: 45.32, log: -73.3 }, { name: '豪勋爵岛', lat: -33.3, log: 159 }, { name: '洛杉矶', lat: 34.05, log: -118.22 }, { name: '路易斯维尔', lat: 38.13, log: -85.48 }, { name: '罗安达', lat: -8.5, log: 13.2 }, { name: '卢本巴希', lat: -11.44, log: 27.29 }, { name: '勒克瑙', lat: 26.5, log: 80.54 }, { name: '鲁得希阿那', lat: 30.56, log: 75.52 }, { name: '洛阳', lat: 34.48, log: 112.25 }, { name: '卢萨卡', lat: -15.2, log: 28.14 }, { name: '卢森堡', lat: 49.37, log: 6.08 }, { name: '澳门', lat: 22.11, log: 113.33 }, { name: '麦迪逊', lat: 43.05, log: -89.23 }, { name: '马德里', lat: 40.26, log: -3.42 }, { name: '马杜赖', lat: 9.55, log: 78.07 }, { name: '马朱罗', lat: 7.09, log: 171.12 }, { name: '麦加', lat: 21.26, log: 39.49 }, { name: '马拉博', lat: 3.45, log: 8.48 }, { name: '马朗', lat: -7.59, log: 112.45 }, { name: '马累', lat: 4.1, log: 73.28 }, { name: '马穆楚', lat: -12.47, log: 45.14 }, { name: '美娜多', lat: 1.3, log: 124.58 }, { name: '马那瓜', lat: 12.06, log: -86.18 }, { name: '麦纳麦', lat: 26.12, log: 50.36 }, { name: '马瑙斯', lat: -3.06, log: -60 }, { name: '马尼拉', lat: 14.37, log: 121 }, { name: '马普托', lat: -25.58, log: 32.35 }, { name: '马德普拉塔', lat: -38, log: -57.32 }, { name: '马卡姆', lat: 43.49, log: -79.19 }, { name: '马塞卢', lat: -29.18, log: 27.28 }, { name: '马塔兰', lat: -8.36, log: 116.07 }, { name: '马萨特兰', lat: 23.13, log: -106.25 }, { name: '姆巴巴纳', lat: -26.19, log: 31.08 }, { name: '棉兰', lat: 3.35, log: 98.39 }, { name: '麦德林', lat: 6.15, log: -75.36 }, { name: '墨尔本', lat: -37.49, log: 144.58 }, { name: '孟菲斯', lat: 35.05, log: -90 }, { name: '门多萨', lat: -32.54, log: -68.5 }, { name: '梅里达', lat: 20.58, log: -89.37 }, { name: '梅萨', lat: 33.25, log: -111.44 }, { name: '墨西卡利', lat: 32.38, log: -115.27 }, { name: '墨西哥城', lat: 19.28, log: -99.09 }, { name: '迈阿密', lat: 25.47, log: -80.13 }, { name: '米德兰', lat: 32, log: -102.05 }, { name: '中途岛', lat: 28.13, log: -177.22 }, { name: '米兰', lat: 45.28, log: 9.1 }, { name: '密尔沃基雄鹿', lat: 43.03, log: -87.57 }, { name: '明尼阿波利斯', lat: 45, log: -93.15 }, { name: '明斯克', lat: 53.51, log: 27.3 }, { name: '米西索加', lat: 43.41, log: -79.36 }, { name: '莫比尔', lat: 30.4, log: -88.05 }, { name: '摩加迪沙', lat: 2.02, log: 45.21 }, { name: '摩纳哥', lat: 43.4, log: 7.25 }, { name: '蒙罗维亚', lat: 6.2, log: -10.46 }, { name: '蒙特雷', lat: 25.4, log: -100.2 }, { name: '蒙得维的亚', lat: -34.53, log: -56.11 }, { name: '蒙哥马利', lat: 32.22, log: -86.2 }, { name: '蒙彼利埃', lat: 44.16, log: -72.34 }, { name: '蒙特利尔', lat: 45.3, log: -73.35 }, { name: '莫罗尼', lat: -11.4, log: 43.19 }, { name: '孟买', lat: 18.56, log: 72.51 }, { name: '慕尼黑', lat: 48.08, log: 11.35 }, { name: '摩尔曼斯克', lat: 68.59, log: 33.08 }, { name: '马斯喀特', lat: 23.36, log: 58.37 }, { name: '名古屋', lat: 35.1, log: 136.55 }, { name: '那格浦尔', lat: 21.1, log: 79.12 }, { name: '内罗毕', lat: -1.17, log: 36.49 }, { name: '南昌', lat: 28.38, log: 115.56 }, { name: '那不勒斯', lat: 40.5, log: 14.14 }, { name: '纳什维尔', lat: 36.1, log: -86.46 }, { name: '拿骚', lat: 25.03, log: -77.2 }, { name: '恩贾梅纳', lat: 12.1, log: 14.59 }, { name: '内乌肯', lat: -38.57, log: -68.04 }, { name: '新德里', lat: 28.37, log: 77.13 }, { name: '新奥尔良', lat: 29.58, log: -90.05 }, { name: '纽约', lat: 40.44, log: -73.55 }, { name: '纽瓦克', lat: 40.43, log: -74.1 }, { name: '尼亚美', lat: 13.32, log: 2.05 }, { name: '尼斯', lat: 43.42, log: 7.16 }, { name: '尼科西亚', lat: 35.11, log: 33.23 }, { name: '下诺夫哥罗德', lat: 56.2, log: 44.01 }, { name: '诺姆', lat: 64.32, log: -165.24 }, { name: '诺福克', lat: 36.54, log: -76.18 }, { name: '努瓦克肖特', lat: 18.09, log: -15.58 }, { name: '努美阿', lat: -22.16, log: 166.27 }, { name: '诺夫哥罗德', lat: 58.3, log: 31.2 }, { name: '新西伯利亚', lat: 55.04, log: 82.55 }, { name: '努库阿洛法', lat: -21.07, log: -175.12 }, { name: '努克', lat: 64.1, log: -51.4 }, { name: '奥克兰', lat: 37.47, log: -122.13 }, { name: '敖德萨', lat: 46.3, log: 30.46 }, { name: '冈山', lat: 34.4, log: 133.54 }, { name: '俄克拉何马城', lat: 35.29, log: -97.32 }, { name: '鄂木斯克', lat: 55, log: 73.22 }, { name: '奥拉涅斯塔克', lat: 12.3, log: -69.58 }, { name: '奥兰多', lat: 28.3, log: -81.22 }, { name: '大阪', lat: 34.4, log: 135.3 }, { name: '奥斯陆', lat: 59.56, log: 10.41 }, { name: '渥太华', lat: 45.25, log: -75.43 }, { name: '瓦加杜古', lat: 12.2, log: -1.4 }, { name: '帕果帕果', lat: -14.16, log: -170.42 }, { name: '巨港', lat: -2.59, log: 104.5 }, { name: '波赫恩', lat: 6.55, log: 158.1 }, { name: '帕尔马', lat: 39.26, log: 2.39 }, { name: '巴拿马', lat: 8.57, log: -79.3 }, { name: '帕皮提', lat: -17.32, log: -149.34 }, { name: '帕拉马里博', lat: 5.52, log: -55.14 }, { name: '巴黎', lat: 48.51, log: 2.2 }, { name: '巴特那', lat: 25.37, log: 85.12 }, { name: '彭沙科拉', lat: 30.3, log: 87.12 }, { name: '彼尔姆', lat: 58.01, log: 56.1 }, { name: '珀斯', lat: -31.58, log: 115.49 }, { name: '白沙瓦', lat: 34.01, log: 71.4 }, { name: '费拉德尔菲亚', lat: 40, log: -75.09 }, { name: '金边', lat: 11.35, log: 104.55 }, { name: '菲尼克斯', lat: 33.3, log: -112.05 }, { name: '皮尔', lat: 44.22, log: -100.2 }, { name: '匹兹堡', lat: 40.26, log: -80 }, { name: '波德戈里察', lat: 42.27, log: 19.28 }, { name: '太子港', lat: 18.32, log: -72.2 }, { name: '法兰西港', lat: -49.21, log: 70.13 }, { name: '伊丽莎白港', lat: -33.57, log: 25.36 }, { name: '路易港', lat: -20.09, log: 57.29 }, { name: '莫尔兹比港', lat: -9.3, log: 147.07 }, { name: '西班牙港', lat: 10.38, log: -61.31 }, { name: '维拉港', lat: -17.44, log: 168.19 }, { name: '波特兰', lat: 45.31, log: -122.39 }, { name: '波尔图', lat: 41.09, log: -8.37 }, { name: '阿雷格里港', lat: -30.02, log: -51.14 }, { name: '波多诺伏', lat: 6.3, log: 2.47 }, { name: '波兹南', lat: 52.25, log: 16.53 }, { name: '布拉格', lat: 50.05, log: 14.25 }, { name: '普拉亚', lat: 14.55, log: -23.31 }, { name: '比勒陀利亚', lat: -25.43, log: 28.11 }, { name: '普里什蒂纳', lat: 42.39, log: 21.1 }, { name: '普罗维登斯', lat: 41.49, log: -71.25 }, { name: '浦那', lat: 18.34, log: 73.58 }, { name: '釜山', lat: 35.05, log: 129.02 }, { name: '平壤', lat: 39, log: 125.47 }, { name: '齐齐哈尔', lat: 47.23, log: 124 }, { name: '魁北克', lat: 46.5, log: -71.15 }, { name: '基多', lat: -0.14, log: -78.3 }, { name: '拉巴', lat: -8.27, log: 118.45 }, { name: '拉巴特', lat: 34.02, log: -6.51 }, { name: '瑞丽', lat: 35.47, log: -78.39 }, { name: '拉皮德城', lat: 44.05, log: -103.13 }, { name: '拉罗汤加岛', lat: -21.2, log: -160.16 }, { name: '拉瓦基', lat: -3.08, log: -171.05 }, { name: '累西腓', lat: -8.06, log: -34.53 }, { name: '里贾那', lat: 50.3, log: -104.38 }, { name: '雷克雅未克', lat: 64.09, log: -21.58 }, { name: '里士满', lat: 37.32, log: -77.28 }, { name: '里加', lat: 56.53, log: 24.05 }, { name: '里奥布兰科', lat: -9.59, log: -67.49 }, { name: '河滨市', lat: 33.56, log: -117.23 }, { name: '利雅得', lat: 24.39, log: 46.44 }, { name: '罗德城', lat: 18.3, log: -64.3 }, { name: '罗彻斯特', lat: 43.12, log: -77.37 }, { name: '罗马', lat: 41.52, log: 12.37 }, { name: '罗萨里奥', lat: -32.57, log: -60.4 }, { name: '罗索', lat: 15.18, log: -61.23 }, { name: '鹿特丹', lat: 51.55, log: 4.29 }, { name: '梁赞', lat: 54.37, log: 39.45 }, { name: '萨克拉门托', lat: 38.34, log: -121.28 }, { name: '圣蒂尼斯', lat: -20.52, log: 55.28 }, { name: '圣乔治', lat: 12.04, log: -61.44 }, { name: '圣赫利尔', lat: 49.11, log: -2.07 }, { name: '圣约翰', lat: 45.16, log: -66.03 }, { name: '圣约翰', lat: 17.07, log: -61.51 }, { name: '圣彼得堡', lat: 59.55, log: 30.25 }, { name: '塞班岛', lat: 15.12, log: 145.45 }, { name: '塞伦', lat: 44.56, log: -123.02 }, { name: '盐湖城', lat: 40.46, log: -111.52 }, { name: '萨尔塔', lat: -24.47, log: -65.24 }, { name: '萨尔瓦多', lat: -12.58, log: -38.29 }, { name: '萨尔茨保', lat: 47.54, log: 13.03 }, { name: '萨马拉', lat: 53.1, log: 50.15 }, { name: '圣安东尼奥', lat: 29.25, log: -98.3 }, { name: '圣博娜迪诺', lat: 34.06, log: -117.17 }, { name: '圣地亚哥', lat: 32.43, log: -117.09 }, { name: '旧金山', lat: 37.46, log: -122.26 }, { name: '圣何塞', lat: 9.59, log: -84.04 }, { name: '圣何塞', lat: 37.2, log: -121.53 }, { name: '圣胡安', lat: 18.29, log: -66.08 }, { name: '圣路易波托西', lat: 22.09, log: -100.59 }, { name: '圣马力诺', lat: 43.55, log: 12.28 }, { name: '圣萨尔瓦多', lat: 13.4, log: -89.1 }, { name: '萨那', lat: 15.23, log: 44.14 }, { name: '圣安那', lat: 14, log: -89.31 }, { name: '圣达菲', lat: 35.4, log: -105.57 }, { name: '圣地亚哥', lat: -33.26, log: -70.4 }, { name: '圣多明各', lat: 18.3, log: -69.57 }, { name: '圣保罗', lat: -23.34, log: -46.38 }, { name: '圣多美', lat: 0.2, log: 6.44 }, { name: '扎幌', lat: 43.05, log: 141.21 }, { name: '萨拉热窝', lat: 43.52, log: 18.26 }, { name: '萨斯卡通', lat: 52.1, log: -106.4 }, { name: '西雅图', lat: 47.38, log: -122.2 }, { name: '三宝垄', lat: -6.58, log: 110.29 }, { name: '仙台', lat: 38.16, log: 140.52 }, { name: '首尔', lat: 37.35, log: 127.03 }, { name: '深圳', lat: 22.39, log: 114.13 }, { name: '石家庄', lat: 38.04, log: 114.28 }, { name: '锡亚尔科特', lat: 32.29, log: 74.35 }, { name: '西安', lat: 34.16, log: 108.54 }, { name: '新加坡', lat: 1.22, log: 103.45 }, { name: '新卡拉雅', lat: -8.06, log: 115.07 }, { name: '苏福尔斯', lat: 43.34, log: -96.42 }, { name: '斯科普里', lat: 41.35, log: 21.3 }, { name: '索非亚', lat: 42.43, log: 23.2 }, { name: '圣约翰', lat: 47.34, log: -52.41 }, { name: '圣路易斯', lat: 38.4, log: -90.15 }, { name: '圣保罗', lat: 45, log: -93.1 }, { name: '圣彼得堡', lat: 27.45, log: -82.38 }, { name: '斯坦利', lat: -51.42, log: -57.52 }, { name: '斯德哥尔摩', lat: 59.23, log: 18 }, { name: '斯托克顿', lat: 37.58, log: -121.18 }, { name: '苏克雷', lat: -19.02, log: -65.16 }, { name: '苏腊巴亚', lat: -7.14, log: 112.45 }, { name: '苏腊卡尔塔', lat: -7.32, log: 110.5 }, { name: '苏拉特', lat: 21.1, log: 72.54 }, { name: '萨里', lat: 49.11, log: -122.51 }, { name: '苏瓦', lat: -18.08, log: 178.25 }, { name: '什切青', lat: 53.25, log: 14.32 }, { name: '大丘', lat: 35.52, log: 128.36 }, { name: '泰奥海伊', lat: -9, log: -139.3 }, { name: '台北', lat: 25.02, log: 121.38 }, { name: '太原', lat: 37.5, log: 112.3 }, { name: '塔林', lat: 59.22, log: 24.48 }, { name: '坦帕', lat: 27.58, log: -82.38 }, { name: '丹吉尔', lat: 35.48, log: -5.45 }, { name: '唐山', lat: 39.37, log: 118.05 }, { name: '塔拉瓦', lat: 1.25, log: 173 }, { name: '塔什干', lat: 41.16, log: 69.13 }, { name: '第比利斯', lat: 41.43, log: 44.48 }, { name: '特古西加尔巴', lat: 14.05, log: -87.14 }, { name: '德黑兰', lat: 35.45, log: 51.3 }, { name: '特拉维夫', lat: 32.05, log: 34.46 }, { name: '特尔纳特', lat: 0.48, log: 127.23 }, { name: '新村', lat: -10.3, log: 105.4 }, { name: '瓦利', lat: -18.13, log: -63.04 }, { name: '廷布', lat: -27.29, log: 89.4 }, { name: '特里凡得琅', lat: 8.3, log: 76.57 }, { name: '天津', lat: 39.08, log: 117.12 }, { name: '提华纳', lat: 32.32, log: -117.01 }, { name: '地拉那', lat: 41.2, log: 19.48 }, { name: '东京', lat: 35.41, log: 139.44 }, { name: '托莱多', lat: 41.4, log: -83.35 }, { name: '托皮卡', lat: 39.02, log: -95.41 }, { name: '多伦多', lat: 43.4, log: -79.22 }, { name: '托沙芬', lat: 62.01, log: -6.46 }, { name: '特伦顿', lat: 40.13, log: -74.46 }, { name: '的黎波里', lat: 32.58, log: 13.12 }, { name: '青岛', lat: 36.04, log: 120.22 }, { name: '图森', lat: 32.13, log: -110.58 }, { name: '图库曼', lat: -26.3, log: -65.2 }, { name: '突尼斯', lat: 36.47, log: 10.1 }, { name: '都灵', lat: 45.04, log: 7.4 }, { name: '秋明', lat: 57.09, log: 65.32 }, { name: '乌法', lat: 54.45, log: 55.58 }, { name: '乌兰巴托', lat: 47.55, log: 106.53 }, { name: '安那拉斯加', lat: 53.51, log: -166.43 }, { name: '巴罗达', lat: 22.19, log: 73.14 }, { name: '瓦杜兹', lat: 47.09, log: 9.31 }, { name: '瓦莱塔', lat: 35.53, log: 14.31 }, { name: '温哥华', lat: 49.13, log: -123.06 }, { name: '瓦腊纳西', lat: 25.2, log: 83 }, { name: '梵蒂冈城', lat: 41.54, log: 12.27 }, { name: '威尼斯', lat: 45.26, log: 12.2 }, { name: '韦拉克鲁斯', lat: 19.11, log: -96.1 }, { name: '维多利亚', lat: 48.25, log: -123.21 }, { name: '维多利亚', lat: -4.4, log: 55.28 }, { name: '维也纳', lat: 48.13, log: 16.22 }, { name: '万象', lat: 18.01, log: 102.48 }, { name: '维尔纽斯', lat: 54.4, log: 25.19 }, { name: '弗吉尼亚海滨市', lat: 36.44, log: -76.02 }, { name: '维萨卡帕特南', lat: 17.42, log: 83.24 }, { name: '符拉迪沃斯托克', lat: 43.09, log: 131.53 }, { name: '华沙', lat: 52.15, log: 21 }, { name: '惠灵顿', lat: -41.17, log: 174.47 }, { name: '怀特霍斯', lat: 60.41, log: -135.08 }, { name: '卫奇塔', lat: 37.43, log: -97.2 }, { name: '威廉斯塔德', lat: 12.12, log: -68.56 }, { name: '温得和克', lat: -22.34, log: 17.06 }, { name: '温泽', lat: 42.18, log: -83.01 }, { name: '温尼伯', lat: 49.53, log: -97.1 }, { name: '弗罗茨瓦夫', lat: 51.05, log: 17 }, { name: '武汉', lat: 30.35, log: 114.19 }, { name: '雅库茨克', lat: 62.1, log: 129.51 }, { name: '亚穆苏克罗', lat: 6.51, log: -5.18 }, { name: '仰光', lat: 16.46, log: 96.09 }, { name: '雅温得', lat: 3.51, log: 11.31 }, { name: '亚伦', lat: -0.32, log: 166.55 }, { name: '叶卡捷琳堡', lat: 56.52, log: 60.35 }, { name: '耶洛奈夫', lat: 62.3, log: -114.29 }, { name: '耶烈万', lat: 40.1, log: 44.31 }, { name: '横滨', lat: 35.27, log: 139.39 }, { name: '南萨哈林斯克', lat: 46.58, log: 142.44 }, { name: '萨格勒布', lat: 45.49, log: 15.58 }, { name: '郑州', lat: 34.35, log: 113.38 }, { name: '淄博', lat: 36.5, log: 118 }, { name: '苏黎世', lat: 47.22, log: 8.32 }];

    DB.deals = [
        { id: 'd1', r: '北京', c: '莫斯科' },
        { id: 'd2', r: '北京', c: '柏林' },
        { id: 'd3', r: '北京', c: '伦敦' },
        { id: 'd4', r: '上海', c: '华盛顿' },
        { id: 'd5', r: '上海', c: '雅加达' },
        { id: 'd6', r: '广州', c: '里约热内卢' },
        { id: 'd7', r: '广州', c: '悉尼' }
    ];

    return DB;
})();