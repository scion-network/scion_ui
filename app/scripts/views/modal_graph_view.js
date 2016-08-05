(function () {
    'use strict';

    APP.Views.ModalGraphView = APP.Views.ModalView.extend({
        events: {
            "click #graphOK": "graphClose",
            "click #graphCancel": "graphClose",
            'click #modal-graph-chart-check-rt': 'checkRealTime',
            'click #modal-graph-chart-check-decimate': 'showChart',
            'click #modal-graph-chart-check-recent': 'showChart',
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
            var self = this,
                decCheck = this.$("#modal-graph-chart-check-decimate")[0].checked,
                recCheck = this.$("#modal-graph-chart-check-recent")[0].checked,
                startTime = (recCheck) ? new Date().getTime() - 86400000 : 0;
            $.ajax({
                type: 'POST',
                url: APP.svc_url("scion_management", "get_asset_data"),
                data: APP.svc_args({
                    asset_id: this.model.get("instrumentId"),
                    data_filter: {max_rows: 10000, start_time: startTime, get_info: true,
                        decimate: !!decCheck, decimate_method: "mean"}
                }),
                success: function (response) {
                    var result = response.result;
                    self.updateChart(result);
                }
            });
        },
        updateChart: function (result) {
            var self = this,
                graphStyle = APP.GraphLib.getGraphStyle(result.schema),
                decCheck = this.$("#modal-graph-chart-check-decimate")[0].checked;

            function afterSetExtremesHandler (evt) {

                var chart = evt.target.chart,
                    inRange = 0;

                // TODO: Better to check data result for a decimation factor (e.g. there was a dec_factor > 1)
                if (! decCheck || chart.series[0].xData.length < 5000 || evt.trigger === undefined) return;

                // Count the number of data points in zoomed time range (TODO: Binary search)
                _.each(chart.series[0].xData, function (item) {
                    if (evt.min <= item && item <= evt.max) { inRange++; }
                });
                //console.log("ZOOM CHART. Visible points", inRange, "of", chart.series[0].xData.length);
                if (inRange < 800 || chart.series[0].xData[0] > Math.floor(evt.min) || chart.series[0].xData[chart.series[0].xData.length-1] < Math.floor(evt.max)) {
                    //console.log("Loading data...");
                    // Reload
                    chart.showLoading('Loading data from server...');
                    $.ajax({
                        type: 'POST',
                        url: APP.svc_url("scion_management", "get_asset_data"),
                        data: APP.svc_args({
                            asset_id: self.model.get("instrumentId"),
                            data_filter: {max_rows: 10000,
                                start_time: Math.floor(evt.min), end_time: Math.ceil(evt.max), get_info: true,
                                decimate: !!decCheck, decimate_method: "mean"}
                        }),
                        success: function (response) {
                            var result = response.result,
                                dataChanged = false;
                            _.forEach(result.data, function(obj, name) {
                                _.forEach(chart.series, function(serobj) {
                                    if (serobj.name === name && obj.length > 0) {
                                        serobj.setData(obj, false);
                                        dataChanged = true;
                                    }
                                });
                            });
                            chart.hideLoading();
                            if (dataChanged) {
                                chart.redraw();
                            }
                        }
                    });
                }
            }

            var varNames = _.keys(result.data).sort(),
                seriesData = [],
                yAxisDef,
                chartsObj = {
                    chart: {
                        type: 'line',
                        width: 800,
                        zoomType: 'x'
                    },
                    title: { text: null },
                    xAxis: {
                        type: 'datetime',
                        title: {text: null},    // "Time"
                        tickPixelInterval: 120,
                        events: {
                            afterSetExtremes: _.debounce(afterSetExtremesHandler, 500)
                        },
                        dateTimeLabelFormats: APP.GraphLib.datetimeFormats()
                    },
                    navigator : {
                        adaptToUpdatedData: false
                    },
                    rangeSelector : {
                        buttons: [{
                            type: 'hour',
                            count: 1,
                            text: '1h'
                        }, {
                            type: 'day',
                            count: 1,
                            text: '1d'
                        }, {
                            type: 'month',
                            count: 1,
                            text: '1m'
                        }, {
                            type: 'year',
                            count: 1,
                            text: '1y'
                        }, {
                            type: 'all',
                            text: 'All'
                        }],
                        inputEnabled: false, // it supports only days
                        selected : 4 // all
                    },
                    exporting: { enabled: true },
                    credits: false
                };

            if (graphStyle === "seismic") {
                yAxisDef = [];
                //_.forEach(result.data, function(obj, name) {
                _.forEach(varNames, function(name) {
                    var obj = result.data[name];
                    seriesData.push({name: name, type: 'line', data: obj, yAxis: yAxisDef.length});
                    yAxisDef.push({
                        labels: {
                            align: 'right',
                            x: 0
                        },
                        title: { text: name, opposite: false },
                        offset: 0,
                        height: '25%',
                        top: '' + (yAxisDef.length * 33) + '%' });
                });
            } else {
                _.forEach(result.data, function(obj, name) {
                    seriesData.push({name: name, data: obj});
                });
                yAxisDef = { title: null };
                _.extend(chartsObj, { legend: { enabled: true } } );
            }

            _.extend(chartsObj, { yAxis: yAxisDef, series: seriesData} );

            $("#modal-graph-chart").highcharts('StockChart', chartsObj);

            var chart = this.$("#modal-graph-chart").highcharts();
            this.chart = chart;
            this.datasetSchema = result.schema;
            this.datasetInfo = result.info;
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
            var lastTime = APP.GraphLib.getSeriesLastTime(this.chart),
                doReplace = this.chart.series[0].xData.length > 10000,
                decCheck = this.$("#modal-graph-chart-check-decimate")[0].checked,
                graphStyle = APP.GraphLib.getGraphStyle(this.datasetSchema),
                self = this;
            $.ajax({
                type: 'POST',
                url: APP.svc_url("scion_management", "get_asset_data"),
                data: APP.svc_args({
                    asset_id: this.model.get("instrumentId"),
                    data_filter: {start_time: lastTime, start_time_include: false, max_rows: 10000, get_info: true,
                        decimate: !!decCheck, decimate_method: "minmax"}
                }),
                success: function (response) {
                    var result = response.result,
                        needRedraw = false;
                    _.forEach(result.data, function(obj, name) {
                        if (! obj.length) return;
                        needRedraw = true;
                        _.forEach(self.chart.series, function(serobj) {
                            if (serobj.name !== name) return;
                            _.forEach(obj, function(val) {
                                serobj.addPoint(val, false, doReplace);
                            });
                        });
                    });
                    if (needRedraw) {
                        self.chart.redraw();
                    }
                }
            });

        },
    });

})();
