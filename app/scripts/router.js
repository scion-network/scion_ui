(function () {
    'use strict';

    APP.Router = Backbone.Router.extend({

        routes: {
            "": "home",
            "logout": "logout",
            "map/:subItem(/:subID)": "menuLink"
        },

        home: function () {
            this.navigate(APP.Constants.DefaultRoute, {trigger: true});
        },
        logout: function() {
            APP.doUserLogout();
        },
        menuLink: function(subItem, subID) {
            var target = Backbone.history.fragment,
                item = target.substring(0, target.indexOf("/")),
                event_args = {item: item, subItem: subItem, subID: subID, target: target};

            APP.showHome();
            APP.trigger("app:main-menu app:main-menu:" + item + " app:main-menu:" + item + "/" + subItem, event_args);
        },
    });

})();
