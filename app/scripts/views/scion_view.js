(function () {
    'use strict';

    APP.Views.ScionView = Backbone.View.extend({
        el: "#scionMain",
        template: JST['app/scripts/templates/main-content.ejs'],
        initialize: function() {
            APP.bindAll(this);

            this.targetMap = {
                "map/*": [APP.Views.ScionMapView]
            };

            this.listenTo(APP, "app:user-refresh", this.showContent);
            //this.listenTo(APP, "app:user-logout", this.hideContent);
            this.listenTo(APP, "app:main-menu", this.showSubView);
        },
        render: function() {
            this.$el.html(this.template({}));
            return this;
        },
        showSubView: function(eventArgs) {
            var menuItem = eventArgs.item,
                subItem = eventArgs.subItem,
                targetItem = menuItem + "/" + subItem,
                targetViewDef,
                newViewArgs,
                newView;

            targetViewDef = this.targetMap[targetItem] || this.targetMap[menuItem + "/*"];

            if (! targetViewDef) {
                return this;
            }

            if (this.currentView) {
                APP.autoCleanupView({ view: this.currentView });
                this.currentView = null;
                this.$("#scionContent").html("<div></div>");
            }

            newViewArgs = _.extend({el: this.$("#scionContent >div")}, targetViewDef[1]);
            // Instantiate and call initialize
            newView = new targetViewDef[0](newViewArgs);
            newView.subID = eventArgs.subID;

            if (targetViewDef.length > 2) {
                _.extend(newView, targetViewDef[2]);
            }

            this.currentView = newView;
            newView.render();
            newView.onShow();
        },
        showContent: function() {
            if (APP.MODEL.SESSION.get("user_id")) {
                this.$("#scionContentAuth").css("display", "block");
                this.$("#scionContentNoAuth").css("display", "none");
            } else {
                this.$("#scionContentNoAuth").css("display", "block");
                this.$("#scionContentAuth").css("display", "none");
            }
        },
        hideContent: function() {
            console.log("HIDE scion");
            //$("body").addClass("is_login_page");
            this.$("#scionContentNoAuth").css("display", "block");
            this.$("#scionContentAuth").css("display", "none");
            if (this.currentView) {
                this.currentView.remove();
                this.currentView = null;
                this.$("#scionContent").html("<div></div>");
            }
        }
    });

})();
