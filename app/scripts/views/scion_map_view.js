(function () {
    'use strict';

    APP.Views.ScionMapView = Backbone.View.extend({
        events: {
            'click .list_tab_item': 'setActiveTab',
            'click #tab-map': 'hideSideBar',
            'click #tab-map-list': 'showSideBar',
            'click .close-list': 'hideSideBar',
        },
        template: JST['app/scripts/templates/map/main-map.ejs'],
        firstLoad: true,

        // ----- Initialization-----

        initialize: function () {
            APP.bindAll(this);
            APP.VIEW.MAP_VIEW = this;
            this.initMapData();   // Init state object (not model) for map related data

            this.listenTo(APP.COLL.INSTRUMENTS, 'sync reset', this.showInstrumentMarkers);

            this.listenTo(APP, "map:initialized", this.onMapInitialized);
        },
        initMapData: function () {
            APP.MapData = APP.MapData || {};
            APP.MapData.Map = null;
            APP.MapData.MapBounds = null;

            APP.MapData.InstrumentMarkers = {};
            APP.MapData.InstGroupColors = {};
        },
        render: function () {
            this.$el.html(this.template({details: !!this.subID, subID: this.subID}));
            this.renderSideBar();

            return this;
        },
        onShow: function () {
            this.initMap();
        },

        // ----- Map -----

        initMap: function () {
            var self = this;
            this.mapView = new APP.Views.MapView();
            this.mapView.render();
            google.maps.event.trigger(this.mapView.map, 'resize');

            //google.maps.event.addDomListener(APP.MapData.Map, 'click', this.mapBackgroundClick);
            //google.maps.event.trigger(APP.MapData.Map, 'resize');
        },
        onMapInitialized: function () {
        },
        setMapBounds: function (refresh) {
            if (this.firstLoad) {
                if (APP.MapData.MapBounds.isEmpty()) {
                    var usaBounds = new google.maps.LatLngBounds(
                        new google.maps.LatLng(46, -124),  // Smaller box than US
                        new google.maps.LatLng(27, -66)
                    );
                    APP.MapAPI.mapFitBounds(APP.MapData.Map, usaBounds);
                } else {
                    APP.MapAPI.mapFitBounds(APP.MapData.Map, APP.MapData.MapBounds);
                    this.firstLoad = false;
                }
            } else if (refresh && !APP.MapData.MapBounds.isEmpty()) {
                APP.MapAPI.mapFitBounds(this.mapView.map, APP.MapData.MapBounds);
            }
        },

        // ----- Instruments -----

        getIconFromFont: function (glyph, color) {
            // http://stackoverflow.com/questions/16375077/using-icon-fonts-as-markers-in-google-maps-v3
            // Note that rendering a FontAwesome glyph does not work initially before font loaded
            var canvas, ctx;
            canvas = document.createElement('canvas');
            canvas.width = canvas.height = 30;
            ctx = canvas.getContext('2d');
            //ctx.fillRect(0, 0, canvas.width, canvas.height);
            if (color) {
                //ctx.strokeStyle = color;
                ctx.fillStyle = color;
            }
            ctx.font = '40px sans-serif';
            // ctx.font = '40px FontAwesome';
            ctx.fillText(glyph, 0, 30);
            return canvas.toDataURL();
        },
        showInstrumentMarkers: function () {
            var self = this,
                instGroups = _.groupBy(APP.COLL.INSTRUMENTS.toJSON(), function (item) {
                    return item["model_info"]["model_group"] || "Default";
                }),
                colorPalette = APP.MapAPI.generateColorPalette(_.size(instGroups)),
                colorPins = {};
            APP.MapData.InstGroupColors = {};
            _.forEach(_.keys(instGroups).sort(), function (grpName, idx) {
                APP.MapData.InstGroupColors[grpName] = colorPalette[idx];
                colorPins[grpName] = self.getIconFromFont("+", APP.MapAPI.rgbToColor(colorPalette[idx]))
            });
            this.removeInstrumentMarkers();
            APP.COLL.INSTRUMENTS.each(function (item) {
                var latlng = item.getLocation();
                if (latlng) {
                    APP.MapData.InstrumentMarkers[item.id] = new google.maps.Marker({
                        position: latlng,
                        map: this.mapView.map,
                        title: item.get("name"),
                        icon: {
                            url: colorPins[item.get("model_info")["model_group"] || "Default"],
                            size: new google.maps.Size(30, 30),
                            origin: new google.maps.Point(0, 0),
                            anchor: new google.maps.Point(15, 15)
                        }
                    });
                    APP.MapData.InstrumentMarkers[item.id].addListener('click', function() {
                        self.showSideBar();
                        self.tabs.details.showInstrument(item);
                        self.showActiveTab("details");
                    });
                }
            }, this);
        },
        removeInstrumentMarkers: function () {
            _.each(_.values(APP.MapData.InstrumentMarkers), function (item) {
                item.setMap(null);
            });
            APP.MapData.InstrumentMarkers = {};
        },

        // ----- Sidebar -----

        renderSideBar: function () {
            this.tabs = {};
            this.tabs.details = new APP.Views.MapInfoDetailsView().render();
            this.tabs.details.showTab();
            this.tabs.inst = new APP.Views.MapInfoInstrumentsView().render();
        },
        hideSideBar: function () {
            $(".map-navbar-tab").removeClass("active");
            $("#tab-map").addClass('active');
            $(".info_tabs").hide();
            $(".map_wrap, .map-menu").css('width', 100 + '%');
            APP.trigger("app-view:resize");
        },
        showSideBar: function () {
            $(".map-navbar-tab").removeClass("active");
            $("#tab-map-list").addClass('active');
            $(".info_tabs").show();
            $(".map_wrap, .map-menu").css('width', 75 + '%');
            APP.trigger("app-view:resize");
        },
        setActiveTab: function (event) {
            var curElement = this.$(event.currentTarget),
                tabToSelect = curElement.data("tab"),
                tabView = this.tabs[tabToSelect];

            if (!curElement.hasClass("active")) {
                curElement.addClass("active").siblings().removeClass("active");
                this.$("#map-info-" + tabToSelect + "-content").addClass("active").siblings().removeClass("active");
                tabView.showTab();
            }
        },
        showActiveTab: function (tabToSelect) {
            var curElement = this.$("div.list_tab_header").find("> span[data-tab='"+tabToSelect+"']"),
                tabView = this.tabs[tabToSelect];

            if (!curElement.hasClass("active")) {
                curElement.addClass("active").siblings().removeClass("active");
                this.$("#map-info-" + tabToSelect + "-content").addClass("active").siblings().removeClass("active");
                tabView.showTab();
            }
        },

        // ----- Cleanup -----

        onRemove: function () {
            APP.VIEW.MAP_VIEW = null;
            this.$el.html("");
            APP.map = null;
            this.initMapData();
        }

    });

})();
