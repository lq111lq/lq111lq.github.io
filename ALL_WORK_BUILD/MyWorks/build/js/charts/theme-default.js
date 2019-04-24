var charts = (function(charts) {
    charts.themes = {};

    charts.themes.default = {
        colors: [
            '#2ec7c9', '#b6a2de', '#5ab1ef', '#ffb980', '#d87a80',
            '#8d98b3', '#e5cf0d', '#97b552', '#95706d', '#dc69aa',
            '#07a2a4', '#9a7fd1', '#588dd5', '#f5994e', '#c05050',
            '#59678c', '#c9ab00', '#7eb00a', '#6f5553', '#c14089'
        ],
        title: {
            color: '#008acd'
        },
        subTitle: {
            color: '#666'
        },
        axis: {
            size: [0, 0],
            padding: 10,
            color: '#008ACD',
            width: '2px'
        }
    };

    charts.getTheme = function(name) {
        return charts.themes.default;
    };
    return charts;
})(charts || {});
