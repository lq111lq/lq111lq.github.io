angular.module("angularApp", ['ngRoute', 'ngSanitize']);

angular.module("angularApp").config(['$routeProvider', 'navServiceProvider', function($routeProvider, navServiceProvider) {
    var navItems = navServiceProvider.array;
    for (var i = 0, length = navItems.length; i < length; i++) {
        var item = navItems[i];
        if (item.url && item.templateUrl) {
            $routeProvider
                .when('/' + item.url, {
                    templateUrl: item.templateUrl
                });
        }
        if (item.subItems) {
            for (var j = 0, subLength = item.subItems.length; j < subLength; j++) {
                var subItem = item.subItems[j];
                if (subItem.url && subItem.templateUrl) {
                    $routeProvider
                        .when('/' + subItem.url, {
                            templateUrl: subItem.templateUrl
                        });
                }
            }
        }
    }

    $routeProvider
        .when('/', {
            redirectTo: '/preview'
        });
    $routeProvider.otherwise({
        templateUrl: 'partials/404.html',
        controller: null
    });
}]);
angular.module("angularApp")
    .service('alertService', ['$interval', function($interval) {
        var self = this;
        var levelNames = ['info', 'success', 'warning', 'danger'];
        this.AlertItem = function(html, life, level,nameSpace) {
            this.html = html;
            this.life = life || 10;
            this.level = level || 0;
            this.nameSpace = nameSpace;
            this.getLevelName = function() {
                return levelNames[this.level] || levelNames[0];
            };
        };
        this.ConfirmItem = function(html, life, level, fn1, fn2,nameSpace) {
            this.html = html;
            this.life = life || 10;
            this.level = level || 0;
            this.nameSpace = nameSpace;
            this.getLevelName = function() {
                return levelNames[this.level] || levelNames[0];
            };
            this.submit = function() {
                if (fn1 instanceof Function) {
                    fn1();
                }
                this.life = 0;
            };
            this.cancel = function() {
                if (fn2 instanceof Function) {
                    fn2();
                }
                this.life = 0;
            };
        };
        this.alertItems = [
            // new this.ConfirmItem('<strong>Well done!</strong> XHN!', 10, 1, function() {
            //     alert('ok');
            // }, function() {
            //     alert('cancel');
            // }),
            // new this.ConfirmItem('<strong>Well done!</strong> XHN!', -1, 2, function() {
            //     alert('ok');
            // }, function() {
            //     alert('cancel');
            // }),
            // new this.AlertItem('<strong>Well done!</strong>LQ!', -1, 2),
            // new this.AlertItem('<strong>Well done!</strong>XXX!', 10, 3),
            // new this.AlertItem('<strong>Well done!</strong>XXX!', 10, 0)
        ];
        this.getActivityAItems = function(nameSpace) {
            return this.alertItems.filter(function(d) {
                return d.life && d.nameSpace === nameSpace;
            });
        };
        this.alert = function(html,life,level,nameSpace){
            var item = new this.AlertItem(html,life,level,nameSpace);
            this.alertItems.push(item);
        };
        $interval(function() {
            self.alertItems.filter(function(d) {
                return d.life;
            }).forEach(function(d) {
                d.life -= 1;
                if (d instanceof self.ConfirmItem && d.life === 0) {
                    d.cancel();
                }
            });
        }, 1000);
    }]);
angular.module("angularApp")
    .service('editFormModalService', function() {
        var editFormModal = {};

        editFormModal.title = '标题';
        editFormModal.isShow = false;
        editFormModal.inputs = null;
        editFormModal.fn1 = null;
        editFormModal.fn2 = null;
        editFormModal.show = function(title, inputs,fn1,fn2) {
            editFormModal.isShow = true;
            editFormModal.title = title;
            editFormModal.inputs = inputs;
            editFormModal.fn1 = fn1;
            editFormModal.fn2 = fn2;
        };

        return editFormModal;
    });
function navItem(name, url, templateUrl, icon) {
    var object = {};
    object.name = name;
    object.url = url;
    object.templateUrl = templateUrl;
    object.icon = icon || 'icon-list';
    object.addSubItem = function(subItem) {
        if (!object.subItems) {
            object.subItems = [];
        }
        object.subItems.push(subItem);
        return object;
    };
    return object;
}

angular.module("angularApp").provider('navService', function() {
    var array = this.array = [];
    array.push(
        navItem('预览', 'preview', 'partials/preview.html', 'icon-th-large')
    );
    // array.push(
    //     navItem('我的简历', 'panel', 'partials/panel.html')
    // );
    array.push(
        navItem('D3.js', 'D3', 'partials/preview.html', 'icon-random')
        .addSubItem(navItem('折线图', 'd3-line-chart', 'partials/d3-line-chart.html'))
        .addSubItem(navItem('柱形图', 'd3-bar-chart', 'partials/d3-bar-chart.html'))
        .addSubItem(navItem('散点图', 'd3-scatter-chart', 'partials/d3-scatter-chart.html'))
        .addSubItem(navItem('饼图', 'd3-pie-chart', 'partials/d3-pie-chart.html'))
        .addSubItem(navItem('其他', 'd3-other-chart', 'partials/d3-other-chart.html'))
    );

    array.push(
        navItem('CSS3RENDER', 'CSS3RENDER', 'partials/three-chart.html', 'icon-signal')
//      .addSubItem(navItem('CSS3render', 'three-chart', 'partials/three-chart.html'))
    );
    array.push(
        navItem('THREE.JS', 'THREE.JS', 'partials/preview-3d.html', 'icon-rss')
    );
    // array.push(navItem('折线图','d3-line-chart', 'partials/d3-line-chart.html','icon-random'));
    // array.push(navItem('柱形图','d3-bar-chart', 'partials/d3-bar-chart.html','icon-signal'));
    // array.push(navItem('散点图','d3-scatter-chart', 'partials/d3-scatter-chart.html','icon-circle'));
    // array.push(navItem('饼图','d3-pie-chart', 'partials/d3-pie-chart.html','icon-rss'));
    // array.push(navItem('其他','d3-other-chart', 'partials/d3-other-chart.html','icon-sitemap'));
    // array.push(navItem('其他作品','other','partials/other.html','icon-hand-right'));
    this.$get = function() {
        return array;
    };
});
angular.module("angularApp")
    .directive('alert', ['alertService', function(alertService) {
        return {
            restrict: 'A',
            replace: true,
            template: '<div>' +
                '   <div class="alert alert-{{alertItem.getLevelName()}}" ng-repeat="alertItem in getActivityAItems()">' +
                '       <button type="button" class="close" ng-click="alertItem.life=0"><span>&times;</span></button>' +
                '       <p>' +
                '           <span ng-bind-html="alertItem.html"></span>' +
                '       </p>' +
                '       <p ng-if="isConfirmItem(alertItem)">' +
                '           <button type="button" class="btn btn-danger" ng-click="alertItem.submit()">确定</button>' +
                '           <button type="button" class="btn btn-default" ng-click="alertItem.cancel()">取消' +
                '               <spna ng-if="alertItem.life>=0">({{alertItem.life-1}}s)' +
                '           </button>' +
                '       </p>' +
                '   </div>' +
                '</div>',
            scope: {
                nameSpace: '@nameSpace'
            },
            link: function(scope) {
                scope.alertService = alertService;
                scope.getActivityAItems = function() {
                    var items = alertService.getActivityAItems(scope.nameSpace);
                    return items;
                };
                scope.isConfirmItem = function(alertItem) {
                    return alertItem instanceof alertService.ConfirmItem;
                };
            }
        };
    }]);
angular.module('angularApp')
    .controller('editFormModalController', ['$scope', 'editFormModalService', function($scope, editFormModalService) {
        $scope.isShow = function() {
            return editFormModalService.isShow;
        };
        $scope.getTitle = function() {
            return editFormModalService.title;
        };
        $scope.getErrorInfo = function(ngModelCtlr) {
            if (ngModelCtlr) {
                return ngModelCtlr.$invalid && ngModelCtlr.$dirty;
            }
        };
        $scope.cancel = function() {
            editFormModalService.isShow = false;
            if (editFormModalService.fn2 instanceof Function) {
                editFormModalService.fn2();
            }
        };
        $scope.confirm = function() {
            if (editFormModalService.fn1 instanceof Function) {
                var result = {};
                for (var i = 0, length = editFormModalService.inputs.length; i < length; i++) {
                    var input = editFormModalService.inputs[i];
                    result[input.id] = input.value;
                }
                editFormModalService.fn1(result);
            }

            editFormModalService.isShow = false;
        };
        $scope.getInputs = function() {
            return editFormModalService.inputs;
        };
    }]);
angular.module('angularApp').controller('navController', ['$scope', '$location', 'navService', function($scope, $location, navService) {
    $scope.navService = navService;

    $scope.currentNavItem = null;
    $scope.currentSubNavItem = null;

    $scope.navItemClass = function(navItem) {
        var cssClass = {
            active: false,
            open: false
        };
        if (navItem == $scope.currentNavItem) {
            if ((!navItem.subItems) || (navItem.subItems && navItem.subItems.length === 0)) {
                cssClass.active = true;
            } else {
                cssClass.open = true;
            }
        }
        return cssClass;
    };

    $scope.navSubItemClass = function(navSubItem) {
        var cssClass = {
            active: false
        };
        if (navSubItem == $scope.currentSubNavItem) {
            cssClass.active = true;
        }
        return cssClass;
    };

    $scope.navItemClickHandler = function(navItem) {
        // if ($scope.currentNavItem == navItem) {
        //     $scope.currentNavItem = null;
        // } else {
        //     $scope.currentNavItem = navItem;
        // }
        $scope.currentNavItem = navItem;
        $scope.currentSubNavItem = null;
        if (navItem.url) {
            $location.path('/' + navItem.url);
        }
    };
    $scope.navSubItemClickHandler = function(navSubItem) {
        $scope.currentSubNavItem = navSubItem;
        if (navSubItem.url) {
            $location.path('/' + navSubItem.url);
        }
    };
}]);
angular.module('angularApp')
    .controller('d3BarChartPageCtrl-1', ['$scope', 'alertService', 'editFormModalService', function($scope, alertService, editFormModalService) {
        var date = ['10月1日', '10月2日', '10月3日', '10月4日', '10月5日', '10月6日', '10月7日', '10月8日', '10月9日', '10月10日'];
        var data = [];
        for (var i = 0; i < 10; i++) {
            var record = {};
            record.date = date[i];
            record.income = Math.floor(Math.random() * 50 + 100 + 25 * i);
            record.expend = Math.floor(Math.random() * 200 + 50);
            data.push(record);
        }
        $scope.data = data;
        $scope.selectedRecord = null;
        $scope.selectRecord = function(record) {
            $scope.selectedRecord = record;
        };
        $scope.editRecord = function() {
            if (!$scope.selectedRecord) {
                alertService.alert('<strong>请选择一行数据</strong>', 10, 2);
            } else {
                var inputs = [{
                    id: 'date',
                    name: '日期',
                    placeholder: '请输入日期',
                    errInfo: '请输入日期',
                    readonly: true,
                    value: $scope.selectedRecord.name
                }, {
                    id: 'income',
                    name: '收入',
                    placeholder: '收入',
                    errInfo: '有效值0~9999',
                    required: true,
                    pattern: /^0*([0-9]{0,4})?$/,
                    value: $scope.selectedRecord.income,
                    unit: '元'
                }, {
                    id: 'expend',
                    name: '支出',
                    placeholder: '支出',
                    errInfo: '有效值0~9999',
                    required: true,
                    pattern: /^0*([0-9]{0,4})?$/,
                    value: $scope.selectedRecord.expend,
                    unit: '元'
                }];
                editFormModalService.show('编辑数据', inputs, function(d) {
                    $scope.selectedRecord.income = Number(d.income);
                    $scope.selectedRecord.expend = Number(d.expend);
                });
            }
        };

        var barChart1 = charts.barChart1();
        var def0 = {
            name: 'date',
            type: 'x',
            unit: '',
            displayName: '日期',
            accessor: function(d) {
                return d.date;
            }
        };
        var def1 = {
            name: 'income',
            type: 'y+',
            displayName: '收入',
            unit: '元',
            accessor: function(d) {
                return d.income;
            }
        };
        var def2 = {
            name: 'expend',
            type: 'y-',
            displayName: '支出',
            accessor: function(d) {
                return d.expend;
            }
        };
        var options = {
            container: '#bar-chart-1',
            title: '收入&支出',
            subTitle: '随机生成的数据',
            marginsTop: 55,
            marginsLeft: 75,
            marginsRight: 75,
            marginsBottom: 25,
            seriesDefs: [def0, def1, def2],
            data: $scope.data
        };

        $scope.$watch('data', function() {
            barChart1.setOptions(options);
            barChart1.render();
        }, true);
    }])
    .controller('d3BarChartPageCtrl-2', ['$scope', 'alertService', 'editFormModalService', function($scope, alertService, editFormModalService) {
        var date = ['10月1日', '10月2日', '10月3日', '10月4日', '10月5日', '10月6日', '10月7日', '10月8日', '10月9日', '10月10日'];
        var data = [];
        for (var i = 0; i < 10; i++) {
            var record = {};
            record.date = date[i];
            record.income = Math.floor(Math.random() * 50 + 100 + 25 * i);
            record.expend = Math.floor(Math.random() * 200 + 50);
            data.push(record);
        }
        $scope.data = data;
        $scope.selectedRecord = null;
        $scope.selectRecord = function(record) {
            $scope.selectedRecord = record;
        };
        $scope.editRecord = function() {
            if (!$scope.selectedRecord) {
                alertService.alert('<strong>请选择一行数据</strong>', 10, 2);
            } else {
                var inputs = [{
                    id: 'date',
                    name: '日期',
                    placeholder: '请输入日期',
                    errInfo: '请输入日期',
                    readonly: true,
                    value: $scope.selectedRecord.name
                }, {
                    id: 'income',
                    name: '收入',
                    placeholder: '收入',
                    errInfo: '有效值0~9999',
                    required: true,
                    pattern: /^0*([0-9]{0,4})?$/,
                    value: $scope.selectedRecord.income,
                    unit: '元'
                }, {
                    id: 'expend',
                    name: '支出',
                    placeholder: '支出',
                    errInfo: '有效值0~9999',
                    required: true,
                    pattern: /^0*([0-9]{0,4})?$/,
                    value: $scope.selectedRecord.expend,
                    unit: '元'
                }];
                editFormModalService.show('编辑数据', inputs, function(d) {
                    $scope.selectedRecord.income = Number(d.income);
                    $scope.selectedRecord.expend = Number(d.expend);
                });
            }
        };

        var barChart2 = charts.barChart2();
        var def0 = {
            name: 'date',
            type: 'x',
            unit: '',
            displayName: '日期',
            accessor: function(d) {
                return d.date;
            }
        };
        var def1 = {
            name: 'income',
            type: 'y+',
            displayName: '收入',
            unit: '元',
            accessor: function(d) {
                return d.income;
            }
        };
        var def2 = {
            name: 'expend',
            type: 'y-',
            displayName: '支出',
            accessor: function(d) {
                return d.expend;
            }
        };
        var options = {
            container: '#bar-chart-2',
            title: '收入&支出',
            subTitle: '随机生成的数据',
            marginsTop: 55,
            marginsLeft: 75,
            marginsRight: 75,
            marginsBottom: 25,
            seriesDefs: [def0, def1, def2],
            data: $scope.data
        };

        $scope.$watch('data', function() {
            barChart2.setOptions(options);
            barChart2.render();
        }, true);
    }])
    .controller('d3BarChartPageCtrl-3', ['$scope', 'alertService', 'editFormModalService', function($scope, alertService, editFormModalService) {
        var sites = ['重庆', '天津', '上海', '北京'];
        var data = [];
        for (var i = 0; i < sites.length; i++) {
            var record = {};
            record.site = sites[i];
            record.gml = Math.floor(Math.random()*10)*10 + 10;
            record.pyp = Math.floor(Math.random()*10)*10 + 10;
            record.wtc = Math.floor(Math.random()*10)*10 + 10;
            record.ztw = Math.floor(Math.random()*10)*10 + 10;
            data.push(record);
        }
        $scope.data = data;
        $scope.selectedRecord = null;
        $scope.selectRecord = function(record) {
            $scope.selectedRecord = record;
        };
        $scope.editRecord = function() {
            if (!$scope.selectedRecord) {
                alertService.alert('<strong>请选择一行数据</strong>', 10, 2);
            } else {
                var inputs = [{
                    id: 'site',
                    name: '地点',
                    placeholder: '地点',
                    errInfo: '地点',
                    readonly: true,
                    value: $scope.selectedRecord.site
                }, {
                    id: 'gml',
                    name: 'gml',
                    placeholder: 'gml',
                    errInfo: '有效值0~100',
                    required: true,
                    pattern: /^0*(100|[0-9]{1,2})?$/,
                    value: $scope.selectedRecord.gml,
                    unit: '%'
                }, {
                    id: 'pyp',
                    name: 'pyp',
                    placeholder: 'pyp',
                    errInfo: '有效值0~100',
                    required: true,
                    pattern: /^0*(100|[0-9]{1,2})?$/,
                    value: $scope.selectedRecord.pyp,
                    unit: '%'
                }, {
                    id: 'wtc',
                    name: 'wtc',
                    placeholder: 'wtc',
                    errInfo: '有效值0~100',
                    required: true,
                    pattern: /^0*(100|[0-9]{1,2})?$/,
                    value: $scope.selectedRecord.wtc,
                    unit: '%'
                }, {
                    id: 'ztw',
                    name: 'ztw',
                    placeholder: 'ztw',
                    errInfo: '有效值0~100',
                    required: true,
                    pattern: /^0*(100|[0-9]{1,2})?$/,
                    value: $scope.selectedRecord.ztw,
                    unit: '%'
                }];
                editFormModalService.show('编辑数据', inputs, function(d) {
                    $scope.selectedRecord.gml = Number(d.gml);
                    $scope.selectedRecord.pyp = Number(d.pyp);
                    $scope.selectedRecord.wtc = Number(d.wtc);
                    $scope.selectedRecord.ztw = Number(d.ztw);
                });
            }
        };

        var barChart3 = charts.barChart3();
        var options = {
            container: '#bar-chart-3',
            data: $scope.data
        };

        $scope.$watch('data', function() {
            barChart3.setOptions(options);
            barChart3.render();
        }, true);
    }])
    .controller('d3BarChartPageCtrl-4', ['$scope', 'alertService', 'editFormModalService', function($scope, alertService, editFormModalService) {
        var names = ['Cosco','CMA','APL','OOCL','Wanhai','Zim'];
        var data = [];
        for (var i = 0; i < names.length; i++) {
            var record = {};
            record.name = names[i];
            var total = Math.floor(Math.random()*5)+6;
            var v1 = Math.floor(Math.random()*total);
            var v2 = total - v1;
            record.acutal = v1*10;
            record.forecast = v2*10;
            data.push(record);
        }
        $scope.data = data;
        $scope.selectedRecord = null;
        $scope.selectRecord = function(record) {
            $scope.selectedRecord = record;
        };
        $scope.editRecord = function() {
            if (!$scope.selectedRecord) {
                alertService.alert('<strong>请选择一行数据</strong>', 10, 2);
            } else {
                var inputs = [{
                    id: 'name',
                    name: 'name',
                    placeholder: 'name',
                    errInfo: 'name',
                    readonly: true,
                    value: $scope.selectedRecord.name
                }, {
                    id: 'acutal',
                    name: 'acutal',
                    placeholder: 'acutal',
                    errInfo: '有效值0~100',
                    required: true,
                    pattern: /^0*(100|[0-9]{1,2})?$/,
                    value: $scope.selectedRecord.acutal
                }, {
                    id: 'forecast',
                    name: 'forecast',
                    placeholder: 'forecast',
                    errInfo: '有效值0~100',
                    required: true,
                    pattern: /^0*(100|[0-9]{1,2})?$/,
                    value: $scope.selectedRecord.forecast
                }];
                editFormModalService.show('编辑数据', inputs, function(d) {
                    $scope.selectedRecord.acutal = Number(d.acutal);
                    $scope.selectedRecord.forecast = Number(d.forecast);
                });
            }
        };

        var barChart4 = charts.barChart4();
        var options = {
            container: '#bar-chart-4',
            title: '温度计式图表',
            subTitle: '随机生成的数据',
            categorys: ['Cosco','CMA','APL','OOCL','Wanhai','Zim'],
            legends: ['Acutal','Forecast'],
            data: $scope.data
        };

        $scope.$watch('data', function() {
            barChart4.setOptions(options);
            barChart4.render();
        }, true);
    }]);
angular.module('angularApp')
    .controller('d3LineChartPageCtrl', ['$scope', 'alertService', 'editFormModalService', function($scope, alertService, editFormModalService) {
        var date = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
        var data = [];
        for (var i = 0; i < 7; i++) {
            var record = {};
            record.name = date[i];
            record.htemp = Math.floor(Math.random() * 5 + 5);
            record.ltemp = record.htemp - Math.floor(Math.random() * 5 + 5);
            data.push(record);
        }
        $scope.data = data;
        $scope.selectedRecord = null;
        $scope.selectRecord = function(record) {
            $scope.selectedRecord = record;
        };
        $scope.editRecord = function() {
            if (!$scope.selectedRecord) {
                alertService.alert('<strong>请选择一行数据</strong>', 10, 2);
            } else {
                var inputs = [{
                    id: 'date',
                    name: '日期',
                    placeholder: '请输入日期',
                    errInfo: '请输入日期',
                    readonly: true,
                    value: $scope.selectedRecord.name
                }, {
                    id: 'htemp',
                    name: '最高气温',
                    placeholder: '请输入最高气温',
                    errInfo: '请输入最高气温',
                    required: true,
                    pattern: /^-?0*([1-9]|[1-3][0-9])?$/,
                    value: $scope.selectedRecord.htemp
                }, {
                    id: 'ltemp',
                    name: '最低气温',
                    placeholder: '请输最低气温',
                    errInfo: '请输最低气温',
                    required: true,
                    pattern: /^-?0*([1-9]|[1-3][0-9])?$/,
                    value: $scope.selectedRecord.ltemp
                }];
                editFormModalService.show('编辑数据', inputs, function(d) {
                    $scope.selectedRecord.htemp = Number(d.htemp);
                    $scope.selectedRecord.ltemp = Number(d.ltemp);
                });
            }
        };

        var lineChart = charts.lineChart();

        lineChart.setOption('container', '#chart');
        lineChart.setOption('title', '未来一周气温变化');
        lineChart.setOption('subTitle', '随机生成的测试数据');
        lineChart.setOption('quantifier', '℃');
        lineChart.setOption('colors', function(i) {
            var colors = ['#2EC7C9', '#AA98D0'];
            return colors[i];
        });
        var def0 = {
            name: 'htemp',
            displayName: '最高气温',
            accessor: function(d) {
                return d.htemp;
            }
        };
        var def1 = {
            name: 'ltemp',
            displayName: '最低气温',
            accessor: function(d) {
                return d.ltemp;
            }
        };

        var valueDefs = lineChart.getOption().valueDefs;
        valueDefs.push(def0);
        valueDefs.push(def1);

        $scope.$watch('data', function() {
            lineChart.setOption('data', $scope.data);
            lineChart.render();
        }, true);
    }])
    .controller('d3LineChartPageCtrl-2', ['$scope', 'alertService', 'editFormModalService', function($scope, alertService, editFormModalService) {
        var date = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
        var data = [];
        for (var i = 0; i < 7; i++) {
            var record = {};
            record.date = date[i];
            record.intention = Math.floor((Math.random() * 100 + 150) * (i + 1) + 100);
            record.order = Math.floor((Math.random() * 100 + 150) * Math.abs(i - 3.5) + 100);
            record.turnover = Math.floor((Math.random() * 100 + 150) * (7 - i) + 100);
            data.push(record);
        }
        $scope.data = data;
        $scope.selectedRecord = null;
        $scope.selectRecord = function(record) {
            $scope.selectedRecord = record;
        };
        $scope.editRecord = function() {
            if (!$scope.selectedRecord) {
                alertService.alert('<strong>请选择一行数据</strong>', 10, 2);
            } else {
                var inputs = [{
                    id: 'date',
                    name: '日期',
                    placeholder: '请输入日期',
                    errInfo: '请输入日期',
                    readonly: true,
                    value: $scope.selectedRecord.date
                }, {
                    id: 'intention',
                    name: '意向',
                    placeholder: '请输入意向数',
                    errInfo: '有效值0-9999',
                    required: true,
                    pattern: /^0*([0-9]{0,4})?$/,
                    value: $scope.selectedRecord.intention
                }, {
                    id: 'order',
                    name: '预定',
                    placeholder: '请输入意预定数',
                    errInfo: '有效值0-9999',
                    required: true,
                    pattern: /^0*([0-9]{0,4})?$/,
                    value: $scope.selectedRecord.order
                }, {
                    id: 'turnover',
                    name: '成交',
                    placeholder: '请输成交数',
                    errInfo: '有效值0-9999',
                    required: true,
                    pattern: /^0*([0-9]{0,4})?$/,
                    value: $scope.selectedRecord.turnover
                }];
                editFormModalService.show('编辑数据', inputs, function(d) {
                    $scope.selectedRecord.intention = Number(d.intention);
                    $scope.selectedRecord.order = Number(d.order);
                    $scope.selectedRecord.turnover = Number(d.turnover);
                });
            }
        };

        var lineChart2 = charts.lineChart2();
        var def0 = {
            name: 'intention',
            displayName: '意向',
            accessor: function(d) {
                return d.intention;
            }
        };
        var def1 = {
            name: 'order',
            displayName: '预定',
            accessor: function(d) {
                return d.order;
            }
        };
        var def2 = {
            name: 'turnover',
            displayName: '成交',
            accessor: function(d) {
                return d.turnover;
            }
        };

        var options = {
            container: '#line-chart-2',
            title: '销售情况',
            subTitle: '随机生成的测试数据',
            marginsTop: 50,
            marginsLeft: 50,
            marginsRight: 50,
            marginsBottom: 50,
            seriesDefs: [def0, def1, def2],
            data: $scope.data
        };


        $scope.$watch('data', function() {
            lineChart2.setOptions(options);
            lineChart2.render();
        }, true);
    }])
    .controller('d3LineChartPageCtrl-3', ['$scope', 'alertService', 'editFormModalService', function($scope, alertService, editFormModalService) {
        var date = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
        var data = [];
        for (var i = 0; i < 7; i++) {
            var record = {};
            record.date = date[i];
            record.email = Math.floor((Math.random() * 100 + 150) * (i + 1) + 100);
            record.ad = Math.floor((Math.random() * 100 + 150) * Math.abs(i - 3.5) + 100);
            record.video = Math.floor((Math.random() * 100 + 150) * (7 - i) + 100);
            record.access = Math.floor((Math.random() * 100 + 150) * Math.abs(i - 3.5) + 100);
            record.se = Math.floor((Math.random() * 100 + 150) * (7 - i) + 100);
            data.push(record);
        }
        $scope.data = data;
        $scope.selectedRecord = null;
        $scope.selectRecord = function(record) {
            $scope.selectedRecord = record;
        };
        $scope.editRecord = function() {
            if (!$scope.selectedRecord) {
                alertService.alert('<strong>请选择一行数据</strong>', 10, 2);
            } else {
                var inputs = [{
                    id: 'date',
                    name: '日期',
                    placeholder: '请输入日期',
                    errInfo: '请输入日期',
                    readonly: true,
                    value: $scope.selectedRecord.date
                }, {
                    id: 'email',
                    name: '邮件营销',
                    placeholder: '请输入意向数',
                    errInfo: '有效值0-9999',
                    required: true,
                    pattern: /^0*([0-9]{0,4})?$/,
                    value: $scope.selectedRecord.email
                }, {
                    id: 'ad',
                    name: '联盟广告',
                    placeholder: '请输入意预定数',
                    errInfo: '有效值0-9999',
                    required: true,
                    pattern: /^0*([0-9]{0,4})?$/,
                    value: $scope.selectedRecord.ad
                }, {
                    id: 'video',
                    name: '视频广告',
                    placeholder: '请输成交数',
                    errInfo: '有效值0-9999',
                    required: true,
                    pattern: /^0*([0-9]{0,4})?$/,
                    value: $scope.selectedRecord.video
                }, {
                    id: 'access',
                    name: '直接访问',
                    placeholder: '请输入意预定数',
                    errInfo: '有效值0-9999',
                    required: true,
                    pattern: /^0*([0-9]{0,4})?$/,
                    value: $scope.selectedRecord.access
                }, {
                    id: 'se',
                    name: '搜索引擎',
                    placeholder: '请输成交数',
                    errInfo: '有效值0-9999',
                    required: true,
                    pattern: /^0*([0-9]{0,4})?$/,
                    value: $scope.selectedRecord.se
                }];
                editFormModalService.show('编辑数据', inputs, function(d) {
                    $scope.selectedRecord.email = Number(d.email);
                    $scope.selectedRecord.ad = Number(d.ad);
                    $scope.selectedRecord.video = Number(d.video);
                    $scope.selectedRecord.access = Number(d.access);
                    $scope.selectedRecord.se = Number(d.se);
                });
            }
        };

        var lineChart3 = charts.lineChart3();
        var def0 = {
            name: 'email',
            displayName: '邮件营销',
            accessor: function(d) {
                return d.email;
            }
        };
        var def1 = {
            name: 'ad',
            displayName: '联盟广告',
            accessor: function(d) {
                return d.ad;
            }
        };
        var def2 = {
            name: 'video',
            displayName: '视频广告',
            accessor: function(d) {
                return d.video;
            }
        };
        var def3 = {
            name: 'access',
            displayName: '直接访问',
            accessor: function(d) {
                return d.access;
            }
        };
        var def4 = {
            name: 'se',
            displayName: '搜索引擎',
            accessor: function(d) {
                return d.se;
            }
        };
        var options = {
            container: '#line-chart-3',
            title: '网络营销',
            subTitle: '随机生成的测试数据',
            marginsTop: 50,
            marginsLeft: 50,
            marginsRight: 50,
            marginsBottom: 50,
            seriesDefs: [def0, def1, def2, def3, def4],
            data: $scope.data
        };


        $scope.$watch('data', function() {
            lineChart3.setOptions(options);
            lineChart3.render();
        }, true);
    }])
    .controller('d3LineChartPageCtrl-4', ['$scope', 'alertService', 'editFormModalService', function($scope, alertService, editFormModalService) {
        var data = [{
            elevation: 10,
            temperature: 10,
            animal: 34,
            plant: 135
        },{
            elevation: 20,
            temperature: 13,
            animal: 40,
            plant: 110
        },{
            elevation: 30,
            temperature: 15,
            animal: 22,
            plant: 70
        },{
            elevation: 40,
            temperature: 10,
            animal: 10,
            plant: 50
        },{
            elevation: 50,
            temperature: 8,
            animal: 15,
            plant: 40
        },{
            elevation: 60,
            temperature: 6,
            animal: 3,
            plant: 30
        }];
        $scope.data = data;
        $scope.selectRecord = function(record) {
            $scope.selectedRecord = record;
        };
        $scope.editRecord = function() {
            if (!$scope.selectedRecord) {
                alertService.alert('<strong>请选择一行数据</strong>', 10, 2);
            } else {
                var inputs = [{
                    id: 'elevation',
                    name: '海拔高度',
                    placeholder: '请输海拔',
                    errInfo: '请输入海拔高度',
                    readonly: true,
                    value: $scope.selectedRecord.elevation,
                    unit:"km"
                },{
                    id: 'temperature',
                    name: '平均气温',
                    placeholder: '请输入平均气温',
                    errInfo: '有效值-39℃ - 39℃',
                    required: true,
                    pattern: /^-?0*([1-9]|[1-3][0-9])?$/,
                    value: $scope.selectedRecord.temperature,
                    unit:"℃"
                },{
                    id: 'animal',
                    name: '动物种类',
                    placeholder: '动物种类',
                    errInfo: '有效值0-9999',
                    required: true,
                    pattern: /^0*([0-9]{0,4})?$/,
                    value: $scope.selectedRecord.animal,
                    unit:"种"
                },{
                    id: 'plant',
                    name: '植物总类',
                    placeholder: '植物总类',
                    errInfo: '有效值0-9999',
                    required: true,
                    pattern: /^0*([0-9]{0,4})?$/,
                    value: $scope.selectedRecord.plant,
                    unit:"种"
                }];
                editFormModalService.show('编辑数据', inputs, function(d) {
                    $scope.selectedRecord.elevation = Number(d.elevation);
                    $scope.selectedRecord.temperature = Number(d.temperature);
                    $scope.selectedRecord.animal = Number(d.animal);
                    $scope.selectedRecord.plant = Number(d.plant);
                });
            }
        };

        var lineChart4 = charts.lineChart4();
        var def0 = {
            name: 'elevation',
            type: 'x',
            unit: 'km',
            displayName: '海拔高度',
            accessor: function(d) {
                return d.elevation;
            }
        };
        var def1 = {
            name: 'temperature',
            type: 'y',
            displayName: '平均温度',
            unit: '℃',
            accessor: function(d) {
                return d.temperature;
            }
        };
        var def2 = {
            name: 'biology',
            type: 'r',
            displayName: '生物种类',
            accessor: function(d) {
                return d.animal + d.plant;
            }
        };
        var options = {
            container: '#line-chart-4',
            title: '海拔&温度&物种数量',
            subTitle: '虚拟的数据',
            marginsTop: 50,
            marginsLeft: 50,
            marginsRight: 50,
            marginsBottom: 50,
            seriesDefs: [def0, def1, def2],
            data: $scope.data
        };

        $scope.$watch('data', function() {
            lineChart4.setOptions(options);
            lineChart4.render();
        }, true);
    }]);
angular.module('angularApp')
    .controller('d3OtherChartPageCtrl-1', ['$scope', 'alertService', 'editFormModalService', function($scope, alertService, editFormModalService) {
        var clusterChart1 = charts.clusterChart1();
        var treeChart1 = charts.treeChart1();
        var packChart1 = charts.packChart1();
        var partitionChart1 = charts.partitionChart1();
        var partitionChart2 = charts.partitionChart2();

        var data1 = {
            name: '咖啡属',
            children: [{
                name: '红咖啡种',
                children: [{
                    name: '阿卡比卡种',
                    children: [{
                        name: '普通种'
                    }, {
                        name: '埃塞俄比亚种'
                    }, {
                        name: '波旁皇族种'
                    }]
                }, {
                    name: '甘佛拉种',
                    children: [{
                        name: '柯尼鲁尼斯种'
                    }, {
                        name: '瓜果尼种'
                    }, {
                        name: '罗布斯塔种'
                    }]
                }, {
                    name: '刚果种'
                }]
            }, {
                name: '粗咖啡种',
                children: [{
                    name: '利比里亚种'
                }, {
                    name: '埃萨尔萨种'
                }]
            }, {
                name: '莫桑比咖啡种',
                children: [{
                    name: '雷西莫纳种'
                }, {
                    name: '桑瓦特里种'
                }]
            }, {
                name: '米兰咖啡种',
                children: [{
                    name: '狭叶咖啡种'
                }]
            }, {
                name: '矮子咖啡种',
                children: [{
                    name: '蒙大拿种'
                }]
            }]
        }
        $scope.data1 = data1;

        var options1 = {
            container: '#other-chart-1',
            title: '咖啡树种类',
            subTitle: '集群图',
            data: $scope.data1
        };

        var options2 = {
            container: '#other-chart-2',
            title: '咖啡树种类',
            subTitle: '树状图',
            data: $scope.data1
        };

        var options3 = {
            container: '#other-chart-3',
            title: '咖啡树种类',
            subTitle: '包图',
            data: $scope.data1
        };

        var options4 = {
            container: '#other-chart-4',
            title: '咖啡树种类',
            subTitle: '分区图',
            data: $scope.data1
        };

        var options5 = {
            container: '#other-chart-5',
            title: '咖啡树种类',
            subTitle: '分区图',
            data: $scope.data1
        };

        $scope.$watch('data1', function() {
            clusterChart1.setOptions(options1);
            clusterChart1.render();

            treeChart1.setOptions(options2);
            treeChart1.render();

            packChart1.setOptions(options3);
            packChart1.render();

            partitionChart1.setOptions(options4);
            partitionChart1.render();

            partitionChart2.setOptions(options5);
            partitionChart2.render();
        }, true);
    }]);
angular.module('angularApp')
    .controller('d3PieChartPageCtrl-1', ['$scope', 'alertService', 'editFormModalService', function($scope, alertService, editFormModalService) {
        var data = [];
        data.push({
            date: '2005',
            chrome: '25',
            firefox: '50',
            safari: '50',
            ie9: '225',
            ie8: '250'
        });
        data.push({
            date: '2006',
            chrome: '50',
            firefox: '100',
            safari: '50',
            ie9: '250',
            ie8: '150'
        });
        data.push({
            date: '2007',
            chrome: '75',
            firefox: '150',
            safari: '75',
            ie9: '200',
            ie8: '100'
        });
        data.push({
            date: '2008',
            chrome: '100',
            firefox: '100',
            safari: '100',
            ie9: '200',
            ie8: '100'
        });
        data.push({
            date: '2009',
            chrome: '125',
            firefox: '150',
            safari: '125',
            ie9: '100',
            ie8: '100'
        });
        data.push({
            date: '2010',
            chrome: '150',
            firefox: '175',
            safari: '150',
            ie9: '75',
            ie8: '50'
        });
        $scope.data = data;
        $scope.selectedRecord = null;
        $scope.selectRecord = function(record) {
            $scope.selectedRecord = record;
        };
        $scope.editRecord = function() {
            if (!$scope.selectedRecord) {
                alertService.alert('<strong>请选择一行数据</strong>', 10, 2);
            } else {
                var inputs = [{
                    id: 'date',
                    name: '日期',
                    placeholder: '请输入日期',
                    errInfo: '请输入日期',
                    readonly: true,
                    value: $scope.selectedRecord.date
                }, {
                    id: 'chrome',
                    name: 'chrome',
                    placeholder: 'chrome',
                    errInfo: '有效值0~100',
                    required: true,
                    pattern: /^0*([0-9]{0,4})?$/,
                    value: $scope.selectedRecord.chrome
                }, {
                    id: 'firefox',
                    name: 'firefox',
                    placeholder: 'firefox',
                    errInfo: '有效值0~100',
                    required: true,
                    pattern: /^0*([0-9]{0,4})?$/,
                    value: $scope.selectedRecord.firefox
                }, {
                    id: 'safari',
                    name: 'safari',
                    placeholder: 'safari',
                    errInfo: '有效值0~100',
                    required: true,
                    pattern: /^0*([0-9]{0,4})?$/,
                    value: $scope.selectedRecord.safari
                }, {
                    id: 'ie9',
                    name: 'ie9',
                    placeholder: 'ie9',
                    errInfo: '有效值0~100',
                    required: true,
                    pattern: /^0*([0-9]{0,4})?$/,
                    value: $scope.selectedRecord.ie9
                }, {
                    id: 'ie8',
                    name: 'ie8',
                    placeholder: 'ie8',
                    errInfo: '有效值0~100',
                    required: true,
                    pattern: /^0*([0-9]{0,4})?$/,
                    value: $scope.selectedRecord.ie8
                }];
                editFormModalService.show('编辑数据', inputs, function(d) {
                    $scope.selectedRecord.chrome = Number(d.chrome);
                    $scope.selectedRecord.firefox = Number(d.firefox);
                    $scope.selectedRecord.safari = Number(d.safari);
                    $scope.selectedRecord.ie9 = Number(d.ie9);
                    $scope.selectedRecord.ie8 = Number(d.ie8);
                });
            }
        };

        var pieChart1 = charts.pieChart1();
        var options = {
            container: '#pie-chart-1',
            title: '浏览器占有率变化',
            subTitle: '随机生成的数据',
            legends: ['Chrome', 'Firefox', 'Safari', 'IE9+', 'IE8-'],
            data: $scope.data
        };

        $scope.$watch('data', function() {
            pieChart1.setOptions(options);
            pieChart1.render();
        }, true);
    }])
    .controller('d3PieChartPageCtrl-2', ['$scope', 'alertService', 'editFormModalService', function($scope, alertService, editFormModalService) {
        $scope.data = [{
            name: '过得不错',
            value: 68
        },{
            name: '生活压力大',
            value: 29
        },{
            name: '“我姓曾”',
            value: 3
        }];
        var pieChart2 = charts.pieChart2();
        var options = {
            container: '#pie-chart-2',
            title: '你幸福吗?',
            subTitle: '虚拟的的数据',
            legends: ['Chrome', 'Firefox', 'Safari', 'IE9+', 'IE8-'],
            data: $scope.data
        };

        $scope.$watch('data', function() {
            pieChart2.setOptions(options);
            pieChart2.render();
        }, true);
    }]);
angular.module('angularApp')
    .controller('d3ScatterChartPageCtrl-1', ['$scope', 'alertService', 'editFormModalService', function($scope, alertService, editFormModalService) {
        function generateRecord() {

            function randomHeight(sex) {
                var mean = sex ? 165 : 175;
                var d = sex ? 5 : 10;
                var fn = d3.random.normal(mean, d)
                var result = fn();
                if (result > 199) {
                    result = 199;
                }
                if (result < 141) {
                    result = 141;
                }
                result = d3.round(result, 2);
                return result;
            };

            function randomWeight(height, sex) {
                var fn = d3.random.normal(1.1 - 0.1 * sex, 0.1)

                var result = (height - 100) * fn();
                if (sex) {
                    result = result - 3;
                }
                if (result > 119) {
                    result = 119;
                }
                if (result < 41) {
                    result = 41;
                }
                result = d3.round(result, 2);
                return result;
            };

            var record = {};
            // record.id = UUID.generate();
            // record.name = RNanme.generate();
            record.sex = Math.floor(Math.random() * 2);
            record.height = randomHeight(record.sex);
            record.weight = randomWeight(record.height, record.sex);
            return record;
        }

        function generateData() {
            var data = [];
            for (var i = 0; i < 500; i++) {
                data.push(generateRecord());
            }
            return data;
        }
        $scope.data = generateData();
        $scope.refresh = function() {
            $scope.data = generateData();
            console.log($scope.data);
        }

        var scatterChart1 = charts.scatterChart1();

        scatterChart1.setOption('container', '#scatter-chart-1');
        scatterChart1.setOption('title', '男性女性身高体重分布');
        scatterChart1.setOption('subTitle', '随机生成的测试数据');
        scatterChart1.setOption('xQuantifier', 'cm');
        scatterChart1.setOption('yQuantifier', 'kg');

        scatterChart1.setOption('colors', function(i) {
            var colors = ['#2EC7C9', '#AA98D0'];
            return colors[i];
        })

        scatterChart1.setOption('xAccessor', function(d, i) {
            return d.height;
        });

        scatterChart1.setOption('yAccessor', function(d, i) {
            return d.weight;
        });

        $scope.$watch('data', function() {
            scatterChart1.setOption('data', $scope.data);
            scatterChart1.render();
        }, true);
    }])
    .controller('d3ScatterChartPageCtrl-2', ['$scope', 'alertService', 'editFormModalService', function($scope, alertService, editFormModalService) {
        function generateData() {
            var data = [];
            for (var i = 0; i < 500; i++) {
                var obj = {};
                obj.x = Math.floor(Math.random() * 201) - 100;
                obj.y = Math.floor(Math.random() * 201) - 100;
                obj.r = Math.floor(Math.random() * 10) + 5;
                obj.t = Math.floor(Math.random() * 2);
                data.push(obj);
            }
            return data;
        }
        $scope.data = generateData();
        $scope.refresh = function() {
            $scope.data = generateData();
            console.log($scope.data);
        }

        var scatterChart2 = charts.scatterChart2();

        $scope.$watch('data', function() {
            var options = {
                container: '#scatter-chart-2',
                title: '气泡图',
                subTitle: '随机生成的数据',
                data: $scope.data
            };
            scatterChart2.setOptions(options);
            scatterChart2.render();
        }, true);
    }]);
angular.module('angularApp')
    .controller('threeChartPageCtrl-1', ['$scope', 'alertService', 'editFormModalService', function($scope, alertService, editFormModalService) {
        function generateSubData() {
            var date = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
            var data = [];
            for (var i = 0; i < 7; i++) {
                var record = {};
                record.date = date[i];
                record.email = Math.floor((Math.random() * 100 + 150) * (i + 1) + 100);
                record.ad = Math.floor((Math.random() * 100 + 150) * Math.abs(i - 3.5) + 100);
                record.video = Math.floor((Math.random() * 100 + 150) * (7 - i) + 100);
                record.access = Math.floor((Math.random() * 100 + 150) * Math.abs(i - 3.5) + 100);
                record.se = Math.floor((Math.random() * 100 + 150) * (7 - i) + 100);
                data.push(record);
            }
            return data;
        }

        var topData = [];
        for (var i = 0; i < 12; i++) {
            var subData = generateSubData();
            subData.generateIndex = i;
            topData.push(subData);
        }

        $scope.topData = topData;
        $scope.data = topData[0];
        $scope.selectedRecord = null;
        $scope.selectRecord = function(record) {
            $scope.selectedRecord = record;
        };
        $scope.editRecord = function() {
            if (!$scope.selectedRecord) {
                alertService.alert('<strong>请选择一行数据</strong>', 10, 2);
            } else {
                var inputs = [{
                    id: 'date',
                    name: '日期',
                    placeholder: '请输入日期',
                    errInfo: '请输入日期',
                    readonly: true,
                    value: $scope.selectedRecord.date
                }, {
                    id: 'email',
                    name: '邮件营销',
                    placeholder: '请输入意向数',
                    errInfo: '有效值0-9999',
                    required: true,
                    pattern: /^0*([0-9]{0,4})?$/,
                    value: $scope.selectedRecord.email
                }, {
                    id: 'ad',
                    name: '联盟广告',
                    placeholder: '请输入意预定数',
                    errInfo: '有效值0-9999',
                    required: true,
                    pattern: /^0*([0-9]{0,4})?$/,
                    value: $scope.selectedRecord.ad
                }, {
                    id: 'video',
                    name: '视频广告',
                    placeholder: '请输成交数',
                    errInfo: '有效值0-9999',
                    required: true,
                    pattern: /^0*([0-9]{0,4})?$/,
                    value: $scope.selectedRecord.video
                }, {
                    id: 'access',
                    name: '直接访问',
                    placeholder: '请输入意预定数',
                    errInfo: '有效值0-9999',
                    required: true,
                    pattern: /^0*([0-9]{0,4})?$/,
                    value: $scope.selectedRecord.access
                }, {
                    id: 'se',
                    name: '搜索引擎',
                    placeholder: '请输成交数',
                    errInfo: '有效值0-9999',
                    required: true,
                    pattern: /^0*([0-9]{0,4})?$/,
                    value: $scope.selectedRecord.se
                }];
                editFormModalService.show('编辑数据', inputs, function(d) {
                    $scope.selectedRecord.email = Number(d.email);
                    $scope.selectedRecord.ad = Number(d.ad);
                    $scope.selectedRecord.video = Number(d.video);
                    $scope.selectedRecord.access = Number(d.access);
                    $scope.selectedRecord.se = Number(d.se);
                });
            }
        };

        var collection = charts.threeChartCollection1($scope.topData,'three-chart-1');
        $scope.$watch('topData', function() {
            collection.render();
        }, true);
    }]);
