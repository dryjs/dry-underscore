
function library(_){

    var gis = {};

    var rad = function(x) {
      return x * Math.PI / 180;
    };

    gis.point = function(p){
        if(!p){ return(null); }
        var lon = (p.lon !== undefined ? p.lon : p.lng);
        var lat = p.lat;
        if(_.isFunction(lon)){ lon = _.bind(lon, p)(); }
        if(_.isFunction(lat)){ lat = _.bind(lat, p)(); }
        lat = _.n(lat);
        lon = _.n(lon);
        if(lat === null || lon === null){ return(null); }
        else{ return({ lat: lat, lon: lon }); }
    };
    
    // returns the distance in meters

    gis.distance = function(p1, p2, R) {
      R = R || 6378137; // Earth's mean radius in meters

      p1 = gis.point(p1);
      p2 = gis.point(p2);

      if(!p1 || !p2){ return(null); }

      var dLat = rad(p2.lat - p1.lat);
      var dLong = rad(p2.lon - p1.lon);
      var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(rad(p1.lat)) * Math.cos(rad(p2.lat)) *
        Math.sin(dLong / 2) * Math.sin(dLong / 2);
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      var d = R * c;
      return d; 
    };

    gis.library = library;

    return(gis);
}

exports.library = library;
