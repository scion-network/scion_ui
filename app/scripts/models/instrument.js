(function () {
    'use strict';

    APP.Models.Instrument = Backbone.Model.extend({
        defaults: {
        },
        idAttribute: "_id",
        getLocation: function () {
            var locObj = this.get("location");
            if (locObj) {
                return {lat: locObj.latitude, lng: locObj.longitude};
            }
        }
    });

})();
