/*global APP, JST*/

APP.Views = APP.Views || {};

(function () {
    'use strict';

    APP.Views.ModalInfoPopupView = APP.Views.ModalView.extend({

        el: "#modal-info-popup",
        template: JST['app/scripts/templates/misc/ModalInfoPopup.ejs'],

        /**
         * @override
         */
        initialize: function () {
            APP.bindAll(this);

            APP.Views.ModalView.prototype.initialize.apply(this, arguments);
        },
        render: function () {
            if(this.$el.is(':empty') && !this.isShown()) {
                this.$el.html(this.template());
                this.hide();
            }
            return this;
        },
        show: function (data) {
            this.fillContent(data);
            this.$el.modal("show");

            var hideTimeout = (data && data.timeout) || APP.Constants.ModalWindowTimeToClose;
            setTimeout(this.hide, hideTimeout);
        },
        hide: function () {
            if (this.$el.hasClass('in')) {
                this.$el.modal("hide");
            }
        },
        fillContent: function(data) {
            this.$el.removeClass("success_state");
            this.$el.removeClass("error_state");
            this.$el.removeClass("warning_state");
            this.$el.find("#info_popup_message").html(data.message);

            // if add new icons state refactor to switch
            if (data.icon === "success") {
                this.$el.addClass("success_state");
            } else if (data.icon === "warning") {
                this.$el.addClass("warning_state");
            } else {
                this.$el.addClass("error_state");
            }

        },
        isShown: function () {
            return this.$el.hasClass('in');
        }
    });

})();
