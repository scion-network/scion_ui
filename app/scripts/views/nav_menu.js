(function () {
    'use strict';

    APP.Views.NavUserMenuView = Backbone.View.extend({

        el: "#navUser",
        template: JST['app/scripts/templates/nav-menu/nav-user-menu.ejs'],
        current_user_id: "",
        events: {
            'click #navUserSettings' : 'accountSettings',
            'click #navUserChangePassword' : 'changePassword',
            'click .login>a#menuSignIn' : 'openLoginModal',
            'click .login>a#menuSignUp' : 'openRegisterModal'
        },

        initialize: function () {
            APP.bindAll(this);
            this.listenTo(this.model, "change", this.render);
            this.listenTo(APP, "app:user-refresh", this.render);
        },
        render: function () {
            this.$el.html(this.template(this.model.toJSON()));
            var user_id = this.model.get("user_id") || "";
            if (this.current_user_id !== user_id) {

                this.current_user_id = user_id;
                //APP.refresh_home();  // NOTE: User change navigation
            }
            return this;
        },
        update_badges: function () {
            var notif_count = 0;

            this.$("#navUserBadge").html(notif_count || "");
        },
        accountSettings: function (evt) {
            evt.preventDefault();
            this.modalDialog = new APP.Views.ModalUserAccountView().render();
            this.modalDialog.showModal();
        },
        changePassword: function (evt) {
            evt.preventDefault();
            this.modalDialog = new APP.Views.ModalNewPasswordView().render();
            this.modalDialog.showModal();
        },
        openLoginModal: function (evt) {
            evt.preventDefault();
            this.modalDialog = new APP.Views.ModalLoginView().render();
            this.modalDialog.showModal();
        },
        openRegisterModal: function (evt) {
            evt.preventDefault();
            this.modalDialog = new APP.Views.ModalRegisterView().render();
            this.modalDialog.showModal();
        }
    });

})();
