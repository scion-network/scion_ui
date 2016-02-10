
(function () {
    'use strict';

    APP.Views.MapInfoDetailsView = Backbone.View.extend({
        events: {
        },

        el: "#map-info-details-content",

        template: JST['app/scripts/templates/map/map-info-details.ejs'],
        templateInstDetails: JST['app/scripts/templates/map/details-instrument.ejs'],

        initialize: function () {
            APP.bindAll(this);
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
                    'asset_id': item.id
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
            var chart = $("#map-details-chart").highcharts({
                chart: {
                    type: 'line'
                },
                title: {
                    text: null
                },
                xAxis: {
                    type: 'datetime',
                    title: {text: "Time"},
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
                credits: false,
                series: seriesData
            });
            this.chart = chart;
        },

    });

})();