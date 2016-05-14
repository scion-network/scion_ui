(function () {
    'use strict';

    APP.Views.ModalGraphView = APP.Views.ModalView.extend({
        events: {
            "click #graphOK": "graphClose",
            "click #graphCancel": "graphClose",
            'click #modal-graph-chart-check-rt': 'checkRealTime',
        },

        el: "#modal-dynamic",

        template: JST['app/scripts/templates/map/modal-graph.ejs'],

        initialize: function () {
            APP.bindAll(this);
            this.$el.on("show.bs.modal", this.onShowModal);
            this.$el.on("hide.bs.modal", this.onHideModal);
            APP.Views.ModalView.prototype.initialize.apply(this, arguments);
            this.chartTimer = null;
        },

        render: function () {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        },
        onShowModal: function () {
            this.showChart();
        },
        onHideModal: function () {
            if (this.chartTimer) {
                clearInterval(this.chartTimer);
                this.chartTimer = null;
            }
        },
        graphClose: function () {
            this.closeModal();
        },
        showChart: function () {
            var self = this;
            $.ajax({
                type: 'POST',
                url: APP.svc_url("scion_management", "get_asset_data"),
                data: APP.svc_args({
                    asset_id: this.model.get("instrumentId"),
                    data_filter: {max_rows: 10000}
                }),
                success: function (response) {
                    var result = response.result;
                    self.updateChart(result);
                }
            });
        },
        updateChart: function (result) {
            var seriesData = [];

            _.forEach(result.data, function(obj, name) {
                seriesData.push({name: name, data: obj});
            });
            this.$("#modal-graph-chart").highcharts({
                chart: {
                    type: 'line',
                    width: 800,
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
            var chart = this.$("#modal-graph-chart").highcharts();
            this.chart = chart;
        },
        checkRealTime: function (evt) {
            var $check = $(evt.currentTarget),
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
            console.log("uRT");
            var lastTime = this.chart.series[0].data[this.chart.series[0].data.length-1].x,
                doReplace = this.chart.series[0].data.length > 10000,
                self = this;
            $.ajax({
                type: 'POST',
                url: APP.svc_url("scion_management", "get_asset_data"),
                data: APP.svc_args({
                    asset_id: this.model.get("instrumentId"),
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
