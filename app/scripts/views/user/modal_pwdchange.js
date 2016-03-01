/*global APP, JST, _*/

APP.Views = APP.Views || {};

(function () {
    'use strict';

    APP.Views.ModalNewPasswordView = APP.Views.ModalView.extend({

        el: "#modal-user",
        template: JST['app/scripts/templates/user/modal-pwdchange.ejs'],
        events: {
            'click #submitForm': 'onSubmitForm'
        },

        /**
         * @override
         */
        initialize: function () {
            APP.bindAll(this);

            APP.Views.ModalView.prototype.initialize.apply(this, arguments);
        },

        render: function () {
            this.$el.html(this.template({}));
            return this;
        },

        onSubmitForm: function (e) {
            var self = this;

            e.preventDefault();
            if (this.isConfirmPasswordValid()) {
                var formData = this.$el.find('form').serializeObject();
                $.ajax({
                    type: 'POST',
                    url: APP.svc_url("scion_management", "change_password"),
                    data: APP.svc_args(formData),
                    success: this.submitSuccess,
                    error: this.submitError
                });
            } else {
                this.showAlert('.wrongConfirmationAlert');
            }
        },

        isConfirmPasswordValid: function () {
            var newPassword = this.$el.find('#newPassword').val(),
                confirmPassword = this.$el.find('#confirmPassword').val();

            return newPassword === confirmPassword;
        },

        submitSuccess: function () {
            this.showAlert('.successAlert');
            _.delay(_.bind(this.redirectPage, this), 5000);
        },

        submitError: function () {
            this.showAlert('.bedRequestAlert');
        },

        redirectPage: function() {
            XUI.ROUTER.navigate('logout', {trigger: true});
        }
    });

})();
