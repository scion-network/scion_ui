(function () {
    'use strict';

    APP.Views.ScionMapView = Backbone.View.extend({
        events: {
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

        showInstrumentMarkers: function () {
            var self = this;
            this.removeInstrumentMarkers();
            APP.COLL.INSTRUMENTS.each(function (item) {
                var latlng = item.getLocation();
                if (latlng) {
                    APP.MapData.InstrumentMarkers[item.id] = new google.maps.Marker({
                        position: latlng,
                        map: this.mapView.map,
                        title: item.get("name"),
                        icon: {
                            url: APP.Constants.IconSprite,
                            size: new google.maps.Size(48, 48),
                            origin: new google.maps.Point(480, 480),
                            anchor: new google.maps.Point(24, 24)
                        }
                    });
                    APP.MapData.InstrumentMarkers[item.id].addListener('click', function() {
                        //console.log("click", item.id);
                        self.showSideBar();
                        self.tabs.details.showInstrument(item);
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

        // ----- Cleanup -----

        onRemove: function () {
            APP.VIEW.MAP_VIEW = null;
            this.$el.html("");
            APP.map = null;
            this.initMapData();
        }

    });

})();
