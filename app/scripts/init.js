$(document).ready(function () {
    'use strict';
    APP.init();

    function setTimeoutOptions() {
        if (APP.MODEL.SESSION.is_logged_in()) {
            var timeoutCallback = function() {
                APP.ROUTER.navigate('logout', {trigger: true});
                APP.trigger("app:session-expired");
            };

            localStorage.setItem("refresh_count", 0);

            if (APP.session_timer) {
                clearTimeout(APP.session_timer);
            }
            if (APP.MODEL.SESSION.get("valid_until")) {
                // TODO: Where to get accurate token validity from without refreshing session?
                var validUntil = APP.MODEL.SESSION.get("valid_until") * 1000;
                var newTO = Math.max(validUntil - new Date().getTime(), APP.Constants.SessionInterval);
                APP.session_timer = setTimeout(timeoutCallback, newTO);
            }
        }
    }

    $(window).off('resize');
    $(window).on('resize', function () {
        APP.trigger("app:resize");
    });

    $(document).ajaxError(function(event, jqxhr) {
        var refresh_count;
        if (jqxhr.status === 401) {
            APP.doUserClearSession();
            return;
        }

        if (jqxhr.status === 500) {
            refresh_count = parseInt(localStorage.getItem("refresh_count"));

            if (isNaN(refresh_count)) {
                refresh_count = 0;
            }

            if (refresh_count > 5) {
                clearTimeout(APP.refresh_timer);
                APP.doUserClearSession();
                return;
            }

            APP.refresh_timer = setTimeout(function() {
                refresh_count += 1;
                localStorage.setItem("refresh_count", refresh_count);
                APP.fetchSession();
            }, APP.Constants.ErrorUpdateInterval);
        }

        setTimeoutOptions();
    });

    $(document).ajaxSuccess(function() {
        setTimeoutOptions();
    });

    Highcharts.setOptions({
        global: {
            useUTC: false
        }
    });

});

$.fn.serializeObject = function() {
    var o = Object.create(null),
        elementMapper = function(element) {
            element.name = $.camelCase(element.name);
            return element;
        },
        appendToResult = function(i, element) {
            var node = o[element.name];

            if ('undefined' != typeof node && node !== null) {
                o[element.name] = node.push ? node.push(element.value) : [node, element.value];
            } else {
                o[element.name] = element.value;
            }
        };

    $.each($.map(this.serializeArray(), elementMapper), appendToResult);
    return o;
};