(function () {
    'use strict';

    window.APP = {
        // Prototype objects (i.e. classes)
        Models: {},
        Collections: {},
        Views: {},
        Routers: {},
        // Instance objects
        MODEL: {},
        COLL: {},
        ROUTER: {},
        VIEW: {},
        // Constants
        Constants: {},
        // Library
        MapAPI: {}
    };

    APP.init =  function () {
        'use strict';
        // Called before document is ready and before any model, collection or view is added.

        // This object is the main app event hub
        _.extend(this, Backbone.Events);

        //this.on("all", function(eventName) {  // Enable for events debugging
        //    console.trace('APP EVENT ' + eventName + ' was triggered!');
        //});

        // URL Router
        APP.ROUTER = new APP.Router();
        APP.MODEL.SESSION = new APP.Models.Session();

        // Globally managed collections and models
        APP.COLL.INSTRUMENTS = new APP.Collections.Instruments();

        // Get current user session (from previous login and cookie) - sync call
        if (APP.token_is_valid()) {
            // Start data loading - user is logged in
            APP.setup_ajax_token();
            APP.fetch_session();
        } else {
            APP.MODEL.SESSION.fetch();
        }

        this.fetch_collections();

        // Root view, instantiating all other nested views
        APP.VIEW.ROOT = new APP.Views.RootView().render();

        if (!Backbone.History.started) {
            // Call after every route and view has been set up
            Backbone.history.start();
        }

        if (!Backbone.history.fragment) {
            APP.ROUTER.navigate("#map/main", {trigger: true});
        }

        return APP.ROUTER;
    };

    APP.fetch_session = function() {
        'use strict';
        APP.MODEL.SESSION.fetch({
            success: function() {
               APP.do_user_refresh();
            }
        });
    };

    APP.show_home = function () {
        'use strict';
        APP.VIEW.ROOT.viewsMap.scion.render();
        //APP.ROUTER.navigate("#map/main");
    };

    APP.fetch_collections = function () {
        'use strict';
        APP.COLL.INSTRUMENTS.refresh_coll();
    };

    APP.do_user_refresh = function () {
        'use strict';
        // Performs all actions after user login or page reload with session
        var username = APP.MODEL.SESSION.get("username");

        APP.trigger("app:user-refresh");

        // Set default route if none set
        if (!Backbone.history.fragment) {
            APP.ROUTER.navigate("#map/main");
        }

        APP.trigger("app:user-refreshed");
    };

    APP.do_user_login = function (data, successCallback, errorCallback) {
        'use strict';

        var loginData = data.newUser ? {client_id: "scion_ui", grant_type: "password", username: data.email, password: data.password} :
            _.extend({client_id: "scion_ui", grant_type: "password"}, data);
        $.ajax({
            type: 'POST',
            url: '/oauth/token',
            data: loginData,
            success: function(data) {
                localStorage.setItem("access_token", data.access_token);
                APP.setup_ajax_token();
                successCallback();
                APP.ROUTER.navigate("#");
            },
            error: errorCallback
        });
    };

    APP.do_user_logout = function () {
        'use strict';
        APP.MODEL.SESSION.clear({ silent: true });

        localStorage.removeItem("layers_status");
        clearTimeout(APP.session_timer);

        APP.trigger("app:user-logout");

        APP.ROUTER.navigate("#");
        localStorage.removeItem("access_token");
    };

    APP.setup_ajax_token = function() {
        'use strict';
        $.ajaxSetup({
            beforeSend: APP.svc_auth
        });
    };

    APP.token_is_valid = function() {
        'use strict';
        var access_token = localStorage.getItem("access_token");

        return (typeof access_token !== "undefined" && access_token !== null);
    };

    APP.svc_auth = function(xhr) {
        'use strict';
        if (APP.token_is_valid()) {
            xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem("access_token"));
        } else {
            APP.do_user_logout();
        }
    };

    APP.svc_url = function (svc_name, svc_op) {
        'use strict';
        return "service/request/" + svc_name + "/" + svc_op;
    };

    APP.svc_args = function (arg_obj) {
        'use strict';
        // Prepares service arguments
        arg_obj = arg_obj || {};

        var pure_args = _.omit(arg_obj, function (value) {
            return _.isNull(value) || _.isUndefined(value);
        });

        var payload_obj = { params: pure_args };

        return { data: JSON.stringify(payload_obj) };
    };

    APP.bindAll = function (obj, level) {
        'use strict';
        // Binds this value for all functions of the object's prototype to object value
        var objFuncs = [obj];
        level = level || 1;
        var pObj = obj;
        for (var l = 0; l < level; l++) {
            pObj = Object.getPrototypeOf(pObj);
            var objProps = Object.getOwnPropertyNames(pObj);
            var numProps = objProps.length;
            for (var i = 0; i < numProps; i++) {
                var pn = objProps[i];
                if (pn !== 'constructor' && pn !== 'initialize' && typeof obj[pn] === 'function') {
                    objFuncs.push(pn);
                }
            }
        }

        if (objFuncs.length > 1) {
            _.bindAll.apply(this, objFuncs);
        }
    };

    APP.cleanupView = function (options) {
        'use strict';
        var view = options.view,
            parent = options.parent,
            viewAttr = options.viewAttr,
            clearAttrs = options.clearAttrs;
        if (!view && parent && viewAttr) {
            view = parent[viewAttr];
        }
        if (view && view instanceof Backbone.View) {
            if (view.onRemove) {
                view.onRemove();
            }
            APP.destroyBackboneView(view);

            if (parent && viewAttr) {
                parent[viewAttr] = null;
            }
        }
        if (parent && clearAttrs) {
            clearAttrs.forEach(function (attr) {
                if (parent[attr]) {
                    parent[attr] = null;
                }
            });
        }
    };

    APP.destroyBackboneView = function (view) {
        'use strict';
        if (view && view instanceof Backbone.View) {
            // Make sure to completely clean the view
            // http://stackoverflow.com/questions/6569704/destroy-or-remove-a-view-in-backbone-js
            view.undelegateEvents();
            view.$el.removeData().unbind();
            view.remove();
            Backbone.View.prototype.remove.call(view);
            view.unbind();
        }
    };

    APP.autoCleanupView = function (options) {
        'use strict';
        var view = options.view,
            ignoreViews = options.ignoreViews || [view],
            childOnly = !!options.childOnly;
        function zapView (v) {
            if (!_.contains(ignoreViews, v)) {
                ignoreViews.push(v);
                APP.autoCleanupView({ view: v, ignoreViews: ignoreViews });
            }
        }
        if (view) {
            if (!childOnly && view.onRemove) {
                view.onRemove();
            }
            _.keys(view).forEach(function (propName) {
                var prop = view[propName];
                if (_.isObject(prop)) {
                    if (prop instanceof Backbone.View) {
                        zapView(prop);
                        view[propName] = null;
                    } else {
                        _.values(prop).forEach(function (prop1) {
                            if (_.isObject(prop1) && prop1 instanceof Backbone.View) {
                                zapView(prop1);
                            }
                        });
                    }
                } else if (_.isArray(prop)) {
                    prop.forEach(function (prop1) {
                        if (_.isObject(prop1) && prop1 instanceof Backbone.View) {
                            zapView(prop1);
                        }
                    });
                }
            });
            if (!childOnly) {
                APP.destroyBackboneView(view);
            }
        }
    };
})();
