
(function () {
    'use strict';

    APP.Views.MapInfoDetailsView = Backbone.View.extend({
        events: {
            'click #map-details-chart-check-rt': 'checkRealTime'
        },

        el: "#map-info-details-content",

        template: JST['app/scripts/templates/map/map-info-details.ejs'],
        templateInstDetails: JST['app/scripts/templates/map/details-instrument.ejs'],

        initialize: function () {
            APP.bindAll(this);
            this.chartTimer = null;
        },

        render: function () {
            this.$el.html(this.template());
            return this;
        },
        showTab: function () {
        },
        showInstrument: function (item) {
            console.log("Instrument", item, $("#map-info-details"));
            $("#map-info-details").html(this.templateInstDetails(item.toJSON()));

            this.showChart(item);
        },
        showChart: function (item) {
            var self = this;
            $.ajax({
                type: 'POST',
                url: APP.svc_url("scion_management", "get_asset_data"),
                data: APP.svc_args({
                    asset_id: item.id,
                    data_filter: {max_rows: 10000}
                }),
                success: function (response) {
                    var result = response.result;
                    self.updateChart(item, result);
                }
            });
        },
        updateChart: function (item, result) {
            var seriesData = [];

            _.forEach(result.data, function(obj, name) {
                seriesData.push({name: name, data: obj});
            });
            $("#map-details-chart").highcharts({
                chart: {
                    type: 'line',
                    zoomType: 'x'
                },
                title: {
                    text: null
                },
                xAxis: {
                    type: 'datetime',
                    title: {text: "Time"},
                    tickPixelInterval: 120,
                    dateTimeLabelFormats: {
                        millisecond: '%H:%M:%S.%L<br>%e-%b-%Y',
                        second: '%H:%M:%S<br>%e-%b-%Y',
                        minute: '%H:%M:%S<br>%e-%b-%Y',
                        hour: '%H:%M<br>%e-%b-%Y',
                        day: '%e-%b-%Y',
                        week: '%e-%b-%Y',
                        month: '%b-%Y',
                        year: '%Y'
                    }

                },
                yAxis: {
                    title: null,
                },
                exporting: {
                    enabled: true
                },
                credits: false,
                series: seriesData
            });
            var chart = $("#map-details-chart").highcharts();
            APP.chart = chart;
            this.chart = chart;
        },
        checkRealTime: function (item) {
            var $check = $(item.currentTarget),
                self = this;
            if ($check[0].checked) {
                self.updateRealTime($check);
                this.chartTimer = setInterval(function () {
                    self.updateRealTime($check);
                }, 5000);
            } else {
                if (this.chartTimer) {
                    clearInterval(this.chartTimer);
                    this.chartTimer = null;
                }
            }
        },
        updateRealTime: function ($check) {
            var lastTime = this.chart.series[0].data[this.chart.series[0].data.length-1].x,
                doReplace = this.chart.series[0].data.length > 200,
                self = this;
            $.ajax({
                type: 'POST',
                url: APP.svc_url("scion_management", "get_asset_data"),
                data: APP.svc_args({
                    asset_id: $check.data("aid"),
                    data_filter: {start_time: lastTime, start_time_include: false, max_rows: 10000}
                }),
                success: function (response) {
                    var result = response.result;
                    _.forEach(result.data, function(obj, name) {
                        if (! obj.length) return;
                        _.forEach(self.chart.series, function(serobj) {
                            if (serobj.name !== name) return;
                            _.forEach(obj, function(val) {
                                serobj.addPoint(val, false, doReplace);
                            });
                            self.chart.redraw();
                        });
                    });
                }
            });

        },

    });

})();