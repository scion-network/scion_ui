(function () {
    'use strict';

    APP.MapAPI.getBoundsZoomLevel = function (bounds, mapDim) {
        // Improvement to fitBounds, which sometimes applies too much padding:
        // http://stackoverflow.com/questions/6048975/google-maps-v3-how-to-calculate-the-zoom-level-for-a-given-bounds
        var WORLD_DIM = { height: 256, width: 256 };
        var ZOOM_MAX = 21;
    
        function latRad(lat) {
            var sin = Math.sin(lat * Math.PI / 180);
            var radX2 = Math.log((1 + sin) / (1 - sin)) / 2;
            return Math.max(Math.min(radX2, Math.PI), -Math.PI) / 2;
        }
    
        function zoom(mapPx, worldPx, fraction) {
            return Math.floor(Math.log(mapPx / worldPx / fraction) / Math.LN2);
        }
    
        var ne = bounds.getNorthEast();
        var sw = bounds.getSouthWest();
    
        var latFraction = (latRad(ne.lat()) - latRad(sw.lat())) / Math.PI;
    
        var lngDiff = ne.lng() - sw.lng();
        var lngFraction = ((lngDiff < 0) ? (lngDiff + 360) : lngDiff) / 360;
    
        var latZoom = zoom(mapDim.height, WORLD_DIM.height, latFraction);
        var lngZoom = zoom(mapDim.width, WORLD_DIM.width, lngFraction);
    
        return Math.min(latZoom, lngZoom, ZOOM_MAX);
    };
    
    APP.MapAPI.mapFitBounds = function (map, bounds) {
        var $mapDiv = $(map.getDiv()),
            mapDim = { height: $mapDiv.height(), width: $mapDiv.width()},
            optimalZoom, newCenter;
    
        newCenter = bounds.getCenter();
        optimalZoom = APP.MapAPI.getBoundsZoomLevel(bounds, mapDim);
        map.setOptions({center: newCenter, zoom: optimalZoom});
    };

    APP.MapAPI.generateColorPalette = function (total, satVal, lumVal) {
        // Creates a color palette with total number of colors, spread evenly across the color wheel.
        // http://stackoverflow.com/a/6823364
        var i = 360 / (total - 1); // distribute the colors evenly on the hue range
        satVal = satVal || 70; lumVal = lumVal || 90;
        var r = []; // hold the generated colors
        for (var x = 0; x < total; x++) {
            r.push(APP.MapAPI.hsvToRgb(i * x, satVal, lumVal));  // alternate saturation and value for even more contrast
        }
        return r;
    };
    
    APP.MapAPI.randomColor = function () {
        return '#' + (Math.random() * 0xFFFFFF << 0).toString(16);
    };
    
    /**
     * HSV to RGB color conversion. H runs from 0 to 360 degrees, S and V run from 0 to 100
     * Ported from the excellent java algorithm by Eugene Vishnevsky at:
     * http://www.cs.rit.edu/~ncs/color/t_convert.html
     */
    APP.MapAPI.hsvToRgb = function (h, s, v) {
        var r, g, b;
        var i;
        var f, p, q, t;
    
        // Make sure our arguments stay in-range
        h = Math.max(0, Math.min(360, h));
        s = Math.max(0, Math.min(100, s));
        v = Math.max(0, Math.min(100, v));
    
        // We accept saturation and value arguments from 0 to 100 because that's
        // how Photoshop represents those values. Internally, however, the
        // saturation and value are calculated from a range of 0 to 1. We make
        // That conversion here.
        s /= 100;
        v /= 100;
    
        if (s === 0) {
            // Achromatic (grey)
            r = g = b = v;
            return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
        }
    
        h /= 60; // sector 0 to 5
        i = Math.floor(h);
        f = h - i;
        p = v * (1 - s);
        q = v * (1 - s * f);
        t = v * (1 - s * (1 - f));
    
        switch (i) {
            case 0:
                r = v; g = t; b = p;
                break;
            case 1:
                r = q; g = v; b = p;
                break;
            case 2:
                r = p; g = v; b = t;
                break;
            case 3:
                r = p; g = q; b = v;
                break;
            case 4:
                r = t; g = p; b = v;
                break;
            default:
                r = v; g = p; b = q;
        }
    
        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    };
    
    APP.MapAPI.rgbToColor = function (rgb) {
        var rgbVal = rgb[2] | (rgb[1] << 8) | (rgb[0] << 16);
        return '#' + (0x1000000 + rgbVal).toString(16).slice(1);
    };
    
})();
