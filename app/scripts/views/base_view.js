/*global APP, Backbone, _*/

APP.View = APP.View || {};

(function () {
    'use strict';

    APP.View = Backbone.View.extend({
        /**
         * @constructor
         * @param options {Object} initialization options
         */
        initialize : function (options) {
            _.extend(this, options);
        }
    });

})();
