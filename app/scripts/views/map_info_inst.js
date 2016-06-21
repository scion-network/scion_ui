
(function () {
    'use strict';

    APP.Views.MapInfoInstrumentsView = Backbone.View.extend({
        events: {
            "click a.inst-list-el": "selectInst"
        },

        el: "#map-info-inst-content",

        template: JST['app/scripts/templates/map/map-info-inst.ejs'],
        templateInstList: JST['app/scripts/templates/map/map-info-inst-list.ejs'],

        initialize: function () {
            APP.bindAll(this);
            this.listenTo(APP, "app-view:resize", this.setPanelHeight);
            this.currentItem = null;
        },

        render: function () {
            this.$el.html(this.template());
            return this;
        },
        showTab: function () {
            this.refreshInstList();
        },
        refreshInstList: function () {
            var instGroups,
                instList = APP.COLL.INSTRUMENTS.toJSON();
            instGroups = _.groupBy(instList, function (item) {
                return item["model_info"]["model_group"] || "Default";
            });
            this.$el.find("#map-inst-list").html(this.templateInstList({instruments: instList, instGroups: instGroups}));
            this.$el.find('#map-inst-list ul.collapse').on('shown.bs.collapse', function () {
                $(this).parent().find("i.indicator").removeClass("fa-chevron-right").addClass("fa-chevron-down");
            });
            this.$el.find('#map-inst-list ul.collapse').on('hidden.bs.collapse', function () {
                $(this).parent().find("i.indicator").removeClass("fa-chevron-down").addClass("fa-chevron-right");
            });
        },
        selectInst: function (evt) {
            evt.preventDefault();
            var selItem = evt.currentTarget,
                instId = $(selItem).data("inst-id"),
                inst = APP.COLL.INSTRUMENTS.get(instId);
            APP.VIEW.MAP_VIEW.tabs.details.showInstrument(inst);
            APP.VIEW.MAP_VIEW.showActiveTab("details");
        },
        setPanelHeight: function () {
            var panelHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
            panelHeight -= 165;
            this.$el.find("#map-inst-list").height(panelHeight);
        }
    });

})();