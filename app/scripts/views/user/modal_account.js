/*global APP, Backbone, JST*/

APP.Views = APP.Views || {};

(function () {
    'use strict';

    APP.Views.ModalUserAccountView = APP.Views.ModalView.extend({

        el: "#modal-user",
        template: JST['app/scripts/templates/user/modal-account.ejs'],
        events: {
            'click #submit_settings': 'submitSettings',
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
        submitSettings: function (evt) {
            var self = this;
            evt.preventDefault();
        },
    });

})();
