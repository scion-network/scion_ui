(function () {
    'use strict';

    APP.Views.MapView = Backbone.View.extend({
        el: "#map-container",
        events: {
        },
        map: null,

        // ----- Initialization-----

        initialize: function () {
            APP.bindAll(this);
            this.initMapOptions();
            this.initMap();
        },
        initMapOptions: function () {
            this.mapCenter =  new google.maps.LatLng(39.828127, -98.579404);  // USA center
            this.mapOptions = {
                mapTypeId: google.maps.MapTypeId.SATELLITE,
                center: this.mapCenter,
                zoom: 3,
                scaleControl: true,
                panControl: false,
                zoomControl: true,
                mapTypeControl: false,
                streetViewControl: false,
                overviewMapControl: false,
                disableDoubleClickZoom: true
            };
        },
        initMap: function () {
            this.map = new google.maps.Map(this.el, this.mapOptions);
            APP.trigger('map:initialized');
            google.maps.event.addListener(this.map, 'bounds_changed', _.bind(_.throttle(this.onPageResizeHandler, 1000), this));
            google.maps.event.addListener(this.map, 'zoom_changed', _.bind(_.throttle(this.onPageResizeHandler, 1000), this));
        },
        render: function () {
            this.onPageResizeHandler();
            return this;
        },
        onPageResizeHandler: function () {
            this.setMapContainerHeight();
            google.maps.event.trigger(this.map, 'resize');
        },
        setMapContainerHeight: function () {
            var windowHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight,
                mapHeight = windowHeight - APP.Constants.AppHeaderHeight;

            this.$el.height(mapHeight);
            localStorage.setItem("Map Height", mapHeight);
            APP.trigger("map:resize", mapHeight);
        },
    });

})();
