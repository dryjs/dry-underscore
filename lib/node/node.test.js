"use strict";

var _ = require('../');

var eq = _.test.eq;
var ok = _.test.ok;

suite('server');

test("iso_date", function(){
    var now = _.date();
    eq(_.iso_date(), _.iso_date(now));

    var d = _.moment("2015-02-12").toDate();
    eq(_.iso_date(_.iso_date(d)).valueOf(), d.valueOf());

    eq(_.iso_date("2015-02-22").minutes(), 0);
    eq(_.iso_date("2015-02-22").hours(), 0);
    eq(_.iso_date("2015-02-22").seconds(), 0);
    eq(_.iso_date("2015-02-22").milliseconds(), 0);

    eq(_.iso_date(" 2015-02-22"), null);
    eq(_.iso_date("use strict 2015-02-22"), null);

    eq(_.iso_date(""), null);
    eq(_.iso_date("blah"), null);
    eq(_.iso_date("2015-22-22"), null);

    var now_la = _.moment.tz("America/Los_Angeles");
    var now_la_iso_date = now_la.format("YYYY-MM-DD");
    eq(now_la_iso_date, _.iso_date("America/Los_Angeles"));

    _.p("tonga date: ", _.iso_date("Pacific/Tongatapu"));
    _.p("tonga time: ", _.moment.tz("Pacific/Tongatapu").format());
    _.p("samoa date: ", _.iso_date("Pacific/Samoa"));
    _.p("samoa time: ", _.moment.tz("Pacific/Samoa").format());
    _.p(_.iso_date("Pacific/Tongatapu") + " !== " + _.iso_date("Pacific/Samoa"));

    ok(_.iso_date("Pacific/Tongatapu") !== _.iso_date("Pacific/Samoa"))
});

test("code", function(){
    eq(false, _.code.noent(null));
    eq(false, _.code.notdir(null));
    eq(true, _.code.noent({code:"ENOENT"}));
    eq(true, _.code.noent({code:"MODULE_NOT_FOUND"}));
    eq(true, _.code.notdir({code:"ENOTDIR"}));
    eq(false, _.code.noent({code:"ENOTDIR"}));
    eq(false, _.type({code:"ENOTDIR"}, "error"));
    eq(false, _.type({code:"ENOTDIR"}, "exception"));
});

test("moment timezone", function(){

    ok(_.moment().tz("America/Los_Angeles")); 

    var now_la = _.moment.tz("America/Los_Angeles");
    var now_la_iso_date = now_la.format("YYYY-MM-DD");
    eq(now_la_iso_date, _.iso_date("America/Los_Angeles"));

    _.p("tonga date: ", _.iso_date("Pacific/Tongatapu"));
    _.p("tonga time: ", _.moment.tz("Pacific/Tongatapu").format());
    _.p("samoa date: ", _.iso_date("Pacific/Samoa"));
    _.p("samoa time: ", _.moment.tz("Pacific/Samoa").format());
    _.p(_.iso_date("Pacific/Tongatapu") + " !== " + _.iso_date("Pacific/Samoa"));

    ok(_.iso_date("Pacific/Tongatapu") !== _.iso_date("Pacific/Samoa"))
});

