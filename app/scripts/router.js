(function () {
    'use strict';

    APP.Router = Backbone.Router.extend({

        routes: {
            "": "home",
            "logout": "logout",
            "map/:subItem(/:subID)": "menu_link"
        },

        home: function () {
           APP.show_home();
        },
        logout: function() {
          $.ajax({
               url: "auth/git-logout/",
               success: function() {
                  APP.do_user_logout();
               }
           });
        },
        menu_link: function(subItem, subID) {
            var target = Backbone.history.fragment,
                item = target.substring(0, target.indexOf("/")),
                event_args = {item: item, subItem: subItem, subID: subID, target: target};

            APP.show_home();
            APP.trigger("app:main-menu app:main-menu:" + item+" app:main-menu:" + item + "/" + subItem, event_args);
        },
        passwordReset: function(username, token) {
            APP.reset_password_home(username, token);
        }
    });

})();
