/*global APP, Backbone, JST*/

APP.Views = APP.Views || {};

(function () {
    'use strict';

    APP.Views.ModalRegisterView = APP.Views.ModalView.extend({

        el: "#modal-user",
        template: JST['app/scripts/templates/user/modal-register.ejs'],
        events: {
            'click #submit_register': 'submitRegister',
            'keyup input:password': 'onChangePassword'
        },
        initialize: function () {
            APP.bindAll(this);
            this.$el.on("show.bs.modal", this.onShowModal);
            this.$el.on("hidden.bs.modal", this.onHideModal);
        },
        render: function () {
            this.$el.html(this.template({}));
            return this;
        },
        onShowModal: function () {
        },
        onHideModal: function () {
            this.clearTemplate();
        },
        submitRegister: function (evt) {
            var self = this;
            evt.preventDefault();
            if (this.validateForm()) {
                this.$el.find('.alert-danger').addClass('hidden');
                if (this.confirm_password()) {
                    var formData = this.$el.find('form').serializeObject();
                    $.ajax({
                        type: 'POST',
                        url: APP.svc_url("scion_management", "register_user"),
                        data: APP.svc_args(formData),
                        success: function () {
                            self.closeModal();
                            var loginData = {username: formData.email, password: formData.password};
                            APP.doUserLogin(loginData);
                        },
                        error: function (response) {
                            self.registerError(response);
                        }
                    });
                    
                    this.$el.find('.alert-danger').addClass('hidden');
                }
            } else {
                this.$el.find('.alert-danger').addClass('hidden');
                this.$el.find('.main').removeClass('hidden');
                this.onChangePassword();
            }
        },
        validateForm: function () {
            return true;
        },
        confirm_password: function () {
            var $password = this.$el.find("#registerPassword").val(),
                $confirmPassword = this.$el.find("#confirmPassword").val();

            if (this.$el.find('.k-invalid').length === 0 ) {
                if ($password !== $confirmPassword || $password.length < 3) {
                    this.$el.find('.alert-danger').addClass('hidden');
                    this.$el.find('.not-match').removeClass('hidden');
                    this.$el.find("input:password").addClass('error-confirm');
                    return false;
                } else {
                    this.$el.find('.not-match').addClass('hidden');
                    this.$el.find("input:password").removeClass('error-confirm');
                    return true;
                }
            } else {
                this.$el.find('.main').removeClass('hidden');
            }
        },
        onChangePassword: function () {
            var $password = this.$el.find("#registerPassword").val(),
                $confirmPassword = this.$el.find("#confirmPassword").val();

            if ($password !== $confirmPassword || $password.length < 3) {
                this.$el.find("input:password").addClass('error-confirm');
            } else {
                this.$el.find("input:password").removeClass('error-confirm');
            }
        },
        registerError: function (messageText) {
            if (messageText.error.message === 'Argument email invalid') {
                messageText.error.message = 'Please enter a valid email address'
            }
            if (messageText.error.message === 'Username (email) already taken') {
                messageText.error.message = 'The email address is already in use'
            }
            this.$el.find('.alert-danger').addClass('hidden');
            this.$el.find('.server').removeClass('hidden').find('span').text(messageText.error.message);
        },
    });

})();
