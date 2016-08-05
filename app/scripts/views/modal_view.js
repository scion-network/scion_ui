/*global APP, _*/

APP.Views = APP.Views || {};

(function () {
    'use strict';

    APP.Views.ModalView = APP.View.extend({

        /**
         * @constructor
         * @param options {Object} initialization options
         */
        initialize: function(options) {
            _.extend(this, options);
            this.addEventsListeners();
        },

        /**
        * Add events listeners for model
        */
        addEventsListeners: function () {
            this.$el.on('shown.bs.modal', this.addLogoutEventListener.call(this));
            this.$el.on("hidden.bs.modal", _.bind(this.clearTemplate,this));
            $("body").on('focus', ':not(#' + this.$el.attr("id") + ' .modal-content)', _.bind(this.checkTabOutrun, this));
            $("body").unbind('keydown').bind('keydown', _.bind(this.checkKeyboardOutrun, this));
        },

        /**
         * Add listener for triggering logout event
         */
        addLogoutEventListener: function() {
            this.listenTo(APP, "app:user-logout", this.closeModal);
        },

        /**
         * Remove view template,
         * destroy model and unbind view's events
         */
        clearTemplate: function() {
            this.$el.empty();
            this.$el.off();
            this.stopListening();
        },

        /**
         * Close modal
         */
        closeModal: function() {
            this.$el.modal("hide");
        },

        /**
         * Show modal
         */
        showModal: function() {
            this.$el.modal("show");
        },

        showModalStatic: function() {
            this.$el.modal({
                show: true,
                backdrop: 'static',
                keyboard: false
            });
        },

        /**
         * Show modal message alerts.
         * Alert has to exist in modal template and has to be hide
         * @param selector {String} alert wrapper selector
         * @param delay {Boolean} make alert temporary
         */
        showAlert: function(selector, delay) {
            if (this.$el.find(selector + ':visible').length) {
                this.animateExistingAlert(selector);
            } else {
                this.animateHidingAlert(this.$el.find('.alert:visible'));
                this.$el.find(selector).show();
            }
            if(delay) {
                _.delay(this.animateHidingAlert, 3000, this.$el.find(selector));
            }
        },

        checkTabOutrun: function(e) {
            e.stopPropagation();
            if (_.isEqual($(e.currentTarget).closest("#" + this.$el.attr("id")).length, 0)) {
                this.$el.find("input:first").focus();
            }
        },

        checkKeyboardOutrun: function (event) {
            var doPrevent = false;
            if (event.keyCode === 8) {
                var currentTarget = event.srcElement || event.target;
                if ((currentTarget.tagName.toUpperCase() === 'INPUT' &&
                     (
                         currentTarget.type.toUpperCase() === 'TEXT' ||
                         currentTarget.type.toUpperCase() === 'PASSWORD' ||
                         currentTarget.type.toUpperCase() === 'FILE' ||
                         currentTarget.type.toUpperCase() === 'SEARCH' ||
                         currentTarget.type.toUpperCase() === 'EMAIL' ||
                         currentTarget.type.toUpperCase() === 'NUMBER' ||
                         currentTarget.type.toUpperCase() === 'DATE' )
                     ) ||
                     currentTarget.tagName.toUpperCase() === 'TEXTAREA') {
                    doPrevent = currentTarget.readOnly || currentTarget.disabled;
                }
                else {
                    doPrevent = true;
                }
            }

            if (doPrevent) {
                event.preventDefault();
            }
        },

        /**
         * Animate existing alert if message is the same
         * Set class with animation and remove it after 1200ms
         * @param selector {String} selector for animation
         */
        animateExistingAlert: function(selector) {
            var self = this;

            self.$el.find(selector + ':visible').addClass('alert-reminder');
            _.delay(function(){
                self.$el.find(selector).removeClass('alert-reminder');
            }, 1200);
        },

        /**
         * Animate alert when it's hiding
         */
        animateHidingAlert: function(selector) {
            selector.animate({
                opacity: 0
            }, 1000, function () {
                selector.css({
                    display: 'none',
                    opacity: 1
                });
            });
        },
        removeTags: function (data) {
            if(typeof data === 'string') {
                return data.replace(/(<)([^()A-Z]+)(>)/g, '');
            } else {
                return data;
            }
        }

    });

})();
