"use strict";

var _ = require('../');

var eq = _.test.eq;
var ok = _.test.ok;

suite('gis');

test("point", function(){
    var f = _.gis.point;

    function pt(lat, lon){ return({ lat: lat, lon: lon }); }

    eq(f(), null);
    eq(f(null), null);
    eq(f({}), null);

    var a = { lat: _.r("_lat"), lon: _.r("_lon"), _lat: "-1.5", _lon: "2.5" };
    eq(f(a), pt(-1.5, 2.5));

    a = { latitude: _.r("_lat"), longitude: _.r("_lon"), _lat: "-1.5", _lon: "2.5" };
    eq(f(a), pt(-1.5, 2.5));

    a = { lat: _.r("_lat"), lng: _.r("_y"), _lat: "-1.5", _y: "2.5" };
    eq(f(a), pt(-1.5, 2.5));

    a = { lat: 2, lng: "z" };
    eq(f(a), null);

    a = { lat: 2, lon: "z" };
    eq(f(a), null);

    a = { lat: 2, lon: "-2" };
    eq(f(a), pt(2, -2));
});

test("distance", function(){
    eq(_.gis.distance({ lat: 0, lon: 0 }, { lat: 1, lon: 1}), 157425.537108412);
    eq(_.gis.distance({ lat: 0, lon: 0 }, { lat: 0, lon: 0}), 0);
});
