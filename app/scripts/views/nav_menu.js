(function () {
    'use strict';

    APP.Views.NavUserMenuView = Backbone.View.extend({

        el: "#navUser",
        template: JST['app/scripts/templates/nav-menu/nav-user-menu.ejs'],
        current_user_id: "",
        events: {
            'click .change-password' : 'changePassword',
            'click .login>a' : 'openLoginModal',
            'click .register>a' : 'openRegisterModal'
        },

        initialize: function () {
            APP.bindAll(this);
            this.listenTo(this.model, "change", this.render);
        },
        render: function () {
            this.$el.html(this.template(this.model.toJSON()));
            var user_id = this.model.get("user_id") || "";
            if (this.current_user_id !== user_id) {

                this.current_user_id = user_id;
                APP.refresh_home();  // NOTE: User change navigation
            }
            return this;
        },
        update_badges: function () {
            var notif_count = 0;

            this.$("#navUserBadge").html(notif_count || "");
        },
        changePassword: function () {
            var passwordModel = new APP.Models.ModalPasswordMenageModel({user_id: this.model.get('user_id')});

            this.changePass = new APP.Views.ModalChangePasswordView({model: passwordModel}).render();
        },
        openLoginModal: function () {
            var passwordModel = APP.MODEL.MODAL_LOGIN;

            this.modalLogin = new APP.Views.ModalLoginView({model: passwordModel});
        },
        openRegisterModal: function () {
            var passwordModel = APP.MODEL.MODAL_REGISTER;

            this.modalRegister = new APP.Views.ModalRegisterView({model: passwordModel});
        }
    });

})();
