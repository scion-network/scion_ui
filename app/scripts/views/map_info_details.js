
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
        },

    });

})();