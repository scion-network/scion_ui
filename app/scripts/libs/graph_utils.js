(function () {
    'use strict';
    
    APP.GraphLib.getGraphStyle = function (ds_schema) {
        if (ds_schema === undefined || ds_schema.attributes === undefined) {
            return "";
        }
        var dsAttrs = ds_schema.attributes;
        return dsAttrs.graph ? (dsAttrs.graph.style || "") : ""
    };

    APP.GraphLib.datetimeFormats = function () {
        return {
            millisecond: '%H:%M:%S.%L<br>%e-%b-%y',
            second: '%H:%M:%S<br>%e-%b-%y',
            minute: '%H:%M:%S<br>%e-%b-%y',
            hour: '%H:%M<br>%e-%b-%y',
            day: '%e-%b-%Y',
            week: '%e-%b-%Y',
            month: '%b-%Y',
            year: '%Y'
        };
    };

    APP.GraphLib.getSeriesLastTime = function (chart) {
        var series = chart.series,
            series0 = series[0],
            lastTime;
        if (! series0.xData.length) {
            return 0;
        }
        lastTime = series0.xData[series0.xData.length-1];
        return lastTime;
    };
    
})();
