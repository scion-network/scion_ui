
(function () {
    'use strict';

    APP.Views.MapInfoDetailsView = Backbone.View.extend({
        events: {
            'click i.icon_button.icon-zoom': 'selectZoom',
            'click i.fa_icon_button.icon-zoom': 'selectZoom',
            'click a.inst-download-ds': 'downloadData',
            'click a.agent-control': 'agentControl'
        },

        el: "#map-info-details-content",

        template: JST['app/scripts/templates/map/map-info-details.ejs'],
        templateInstDetails: JST['app/scripts/templates/map/details-instrument.ejs'],
        templateDatasetDetails: JST['app/scripts/templates/map/details-dataset.ejs'],

        initialize: function () {
            APP.bindAll(this);
            this.currentItem = null;
            this.listenTo(APP.COLL.INSTRUMENTS, "reset sync", this.onRefreshInstruments);
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
                    data_filter: {max_rows: 5000, get_info: true}
                }),
                success: function (response) {
                    var result = response.result;
                    self.updateChart(item, result);
                    self.updateDataset(item, result);
                }
            });
        },
        updateChart: function (item, result) {
            var varNames = _.keys(result.data).sort(),
                seriesData = [],
                yAxisDef,
                graphStyle = APP.GraphLib.getGraphStyle(result.schema),
                chartsObj = {
                    chart: {
                        type: 'line',
                        zoomType: 'x'
                    },
                    title: { text: null },
                    xAxis: {
                        type: 'datetime',
                        title: {text: null},    // "Time"
                        tickPixelInterval: 120,
                        dateTimeLabelFormats: APP.GraphLib.datetimeFormats()
                    },
                    exporting: { enabled: false },
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
                            align: 'left',
                            x: 0
                        },
                        title: { text: name },
                        offset: 0,
                        height: '25%',
                        top: '' + (yAxisDef.length * 33) + '%' });
                });
                _.extend(chartsObj, { legend: { enabled: false } } );
                // console.log("SEISMIC", seriesData, yAxisDef);
            } else {
                _.forEach(result.data, function(obj, name) {
                    seriesData.push({name: name, data: obj});
                });
                yAxisDef = { title: null };
                // console.log("DEFAULT", seriesData, yAxisDef);
            }

            _.extend(chartsObj, { yAxis: yAxisDef, series: seriesData} );

            //$("#map-details-chart").highcharts('StockChart', chartsObj);
            $("#map-details-chart").highcharts(chartsObj);

            var chart = $("#map-details-chart").highcharts();
            APP.chart = chart;
            this.chart = chart;
        },
        updateDataset: function (item, ds_info) {
            $("#map-details-dataset").html(this.templateDatasetDetails(ds_info));
        },
        selectZoom: function () {
            var graphModel = new Backbone.Model({instrumentId: this.currentItem.id, instrument: this.currentItem}),
                graphView = new APP.Views.ModalGraphView({model: graphModel});
            graphView.render();
            graphView.showModalStatic();
        },
        downloadData: function (evt) {
            evt.preventDefault();
            var dsId = $(evt.currentTarget).data("dsid");
            var paramStr = "?";
            paramStr += "asset_id=" + dsId;
            paramStr += "&authtoken=Bearer_" + localStorage.getItem("access_token");

            window.location.href = APP.svc_url("scion_management", "download_asset_data") + paramStr;
        },
        agentControl: function (evt) {
            evt.preventDefault();
            var instId = this.currentItem.id, self = this;
            if (this.currentItem.get("addl").agent_active) {
                $.ajax({
                    type: 'POST',
                    url: APP.svc_url("scion_management", "stop_agent"),
                    data: APP.svc_args({
                        asset_id: instId
                    }),
                    success: function (response) {
                        var infoPopup = new APP.Views.ModalInfoPopupView().render();
                        infoPopup.show({icon: 'success', message: 'Agent was successfully stopped.'});
                        APP.COLL.INSTRUMENTS.refreshColl();
                    },
                    error: function (response) {
                        var infoPopup = new APP.Views.ModalInfoPopupView().render();
                        infoPopup.show({icon: 'error', message: 'Agent could not be stopped !'});
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
                        var infoPopup = new APP.Views.ModalInfoPopupView().render();
                        infoPopup.show({icon: 'success', message: 'Agent was successfully started.'});
                        APP.COLL.INSTRUMENTS.refreshColl();
                    },
                    error: function (response) {
                        var infoPopup = new APP.Views.ModalInfoPopupView().render();
                        infoPopup.show({icon: 'error', message: 'Agent could not be started !'});
                    }
                });
            }
        },
        onRefreshInstruments: function () {
            var instId = this.currentItem && this.currentItem.id;
            if (instId) {
                this.currentItem = APP.COLL.INSTRUMENTS.get(instId);

                $("#map-info-details").html(this.templateInstDetails(this.currentItem.toJSON()));
                this.showChart(this.currentItem);
            }
        }
    });

})();