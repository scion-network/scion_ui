/*global APP, JST, _*/

APP.Views = APP.Views || {};

(function () {
    'use strict';

    APP.Views.ModalLoginView = APP.Views.ModalView.extend({

        el: "#modal-user",
        template: JST['app/scripts/templates/user/modal-login.ejs'],

        events: {
            'submit #loginForm': 'onSubmitLogin',
            'keypress #loginPassword': 'onPwdKey',
            'click .forgot-username': 'onForgotUsername',
            'click .forgot-password': 'onForgotPassword'
        },

        /**
         * @override
         * */
        initialize: function () {
            APP.bindAll(this);
            this.$el.on("show.bs.modal", this.onShowModal);
            this.$el.on("hidden.bs.modal", this.onHideModal);

            APP.Views.ModalView.prototype.initialize.apply(this, arguments);
        },
        /**
         *@override
         */
        addLogoutEventListener: function () {},

        render: function () {
            this.$el.html(this.template({}));
            this.showHidePassword();
            return this;
        },
        onShowModal: function () {
        },
        onHideModal: function () {
            this.clearTemplate();
        },
        onPwdKey: function (event) {
            if (event && event.keyCode === 13) {
                this.onSubmitLogin(event);
            }
        },
        onSubmitLogin: function (e) {
            var self = this,
                formData = this.$el.find('form').serializeArray(),
                data = {};
            e.preventDefault();

            _.map(formData, function(n){
                data[n.name] = n.value;
            });

            APP.doUserLogin(data, function() {
                self.closeModal();
            }, function () {
                self.showAlert('.alert-danger');
            });
        },
        showHidePassword: function () {
            var pass = this.$el.find(".password");
            this.$el.find("#showHide").click(function () {
                if ($(pass).attr("type") === "password") {
                    $(pass).attr("type", "text");
                } else{
                    $(pass).attr("type", "password");
                }
            });
        },
        onForgotUsername: function () {
            this.closeModal();
        },
        onForgotPassword: function () {
            this.closeModal();
        }
    });

})();
