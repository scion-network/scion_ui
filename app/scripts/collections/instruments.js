(function () {
    'use strict';

    APP.Collections.Instruments = Backbone.Collection.extend({
        model: APP.Models.Instrument,
        url: APP.svc_url("scion_management", "find_instruments"),
        initialize: function() {
            _.bindAll(this, "refreshColl");
        },
        parse: function(resp){
            return resp.result;
        },
        refreshColl: function() {
            return this.fetch();
        }
    });

})();
