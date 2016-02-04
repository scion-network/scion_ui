(function () {
    'use strict';

    APP.Collections.Instruments = Backbone.Collection.extend({
        model: APP.Models.Instrument,
        url: APP.svc_url("scion_management", "find_instruments"),
        initialize: function() {
            _.bindAll(this, "refresh_coll");
        },
        parse: function(resp){
            return resp.result;
        },
        refresh_coll: function() {
            this.fetch();
        }
    });

})();
