(function () {
    'use strict';

    APP.Views.RootView = Backbone.View.extend({

        el: 'body',
        render: function() {
            var self = this;
            // Global views
            this.viewsMap = {
                navUserMenu: new APP.Views.NavUserMenuView({model: APP.MODEL.SESSION}),
                scion: new APP.Views.ScionView()
            };

            _.each(_.keys(this.viewsMap), function (key) {
                self.viewsMap[key].render();
            });

            return this;
        }
    });

})();
