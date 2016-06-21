
(function () {
    'use strict';

    APP.Views.MapInfoDetailsView = Backbone.View.extend({
        events: {
            'click i.icon_button.icon-zoom': 'selectZoom',
            'click a.inst-download-ds': 'downloadData',
            'click a.agent-control': 'agentControl'
        },

        el: "#map-info-details-content",

        template: JST['app/scripts/templates/map/map-info-details.ejs'],
        templateInstDetails: JST['app/scripts/templates/map/details-instrument.ejs'],

        initialize: function () {
            APP.bindAll(this);
            this.currentItem = null;
        },

        render: function () {
            this.$el.html(this.template());
            return this;
        },
        showTab: function () {
        },
        showInstrument: function (item) {
            $("#map-info-details").html(this.templateInstDetails(item.toJSON()));
            this.currentItem = item;

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
        selectZoom: function () {
            var graphModel = new Backbone.Model({instrumentId: this.currentItem.id, instrument: this.currentItem}),
                graphView = new APP.Views.ModalGraphView({model: graphModel});
            graphView.render();
            graphView.showModal();
        },
        downloadData: function (evt) {
            evt.preventDefault();
            console.log("DOWNLOAD");
        },
        agentControl: function (evt) {
            evt.preventDefault();
            var instId = this.currentItem.id;
            if (this.currentItem.get("addl").agent_active) {
                $.ajax({
                    type: 'POST',
                    url: APP.svc_url("scion_management", "stop_agent"),
                    data: APP.svc_args({
                        asset_id: instId
                    }),
                    success: function (response) {
                        console.log("AGENT STOP SUCCESS");
                    },
                    error: function (response) {
                        console.log("AGENT STOP ERROR");
                    }
                });
            } else {
                $.ajax({
                    type: 'POST',
                    url: APP.svc_url("scion_management", "start_agent"),
                    data: APP.svc_args({
                        asset_id: instId
                    }),
                    success: function (response) {
                        console.log("AGENT START SUCCESS");
                    },
                    error: function (response) {
                        console.log("AGENT START ERROR");
                    }
                });
            }
        }
    });

})();