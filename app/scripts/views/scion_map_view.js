(function () {
    'use strict';

    APP.Views.ScionMapView = Backbone.View.extend({
        events: {
        },
        template: JST['app/scripts/templates/map/main-map.ejs'],
        firstLoad: true,

        // ----- Initialization-----

        initialize: function () {
            APP.bindAll(this);
            this.initMapData();   // Init state object (not model) for map related data

            this.listenTo(APP, "map:initialized", this.onMapInitialized);
        },
        initMapData: function () {
            APP.MapData = APP.MapData || {};
            APP.MapData.Map = null;
            APP.MapData.MapBounds = null;
        },
        render: function () {
            this.$el.html(this.template({details: !!this.subID, subID: this.subID}));

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
    });

})();
