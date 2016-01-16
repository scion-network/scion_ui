(function () {
    'use strict';

    APP.Models.Session = Backbone.Model.extend({

        defaults: {
            actor_id: "",
            user_id: "",
            full_name: "",
            is_logged_in: false,
            registration_enabled: true,
            version: {},
            // List of roles by org governance name
            roles: {},
            ui_mode: 'PRODUCTION',
            // UNIX ts (seconds)
            valid_until: 0
        },
        // config file should be used instead of this!
        url: document.location.protocol + '//' + document.location.host + '/auth/session',
        initialize: function () {
            APP.bindAll(this);
        },
        parse: function (resp) {
            return resp.result;
        },
        is_logged_in: function () {
            return this.get('is_logged_in');
        },
        is_valid: function () {
            return new Date(this.get('valid_until') * 1000) >= new Date();
        },
        clear: function() {
            Backbone.Model.prototype.clear.apply(this, arguments);
            return this.set(_.clone(this.defaults));
        }
    });
})();
