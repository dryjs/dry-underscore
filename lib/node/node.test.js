"use strict";

var _ = require('../../');

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

    var la_tz = "America/Los_Angeles";
    var ny_tz = "America/New_York";

    var now_la = _.moment.tz(la_tz);
    var now_la_iso_date = now_la.format("YYYY-MM-DD");
    eq(now_la_iso_date, _.iso_date(la_tz));

    var other_tz = la_tz;
    var current_tz = _.moment.tz.guess();

    if(current_tz === la_tz){ other_tz = ny_tz; }

    var date = "2016-01-02";

    var wrong = _.moment(date, "YYYY-MM-DD").tz(other_tz);
    var right = _.moment.tz(date, "YYYY-MM-DD", other_tz);

    ok(_.iso_date(date).tz(other_tz).isSame(wrong));
    ok(!_.iso_date(date).tz(other_tz).isSame(right));
    ok(_.iso_date(date, other_tz).isSame(right));
    ok(!_.iso_date(date, other_tz).isSame(wrong));

    var tonga_tz = "Pacific/Tongatapu";
    var samoa_tz = "Pacific/Samoa";

    _.p("tonga date: ", _.iso_date(tonga_tz));
    _.p("tonga time: ", _.moment.tz(tonga_tz).format());
    _.p("samoa date: ", _.iso_date(samoa_tz));
    _.p("samoa time: ", _.moment.tz(samoa_tz).format());
    _.p(_.iso_date(tonga_tz) + " !== " + _.iso_date(samoa_tz));

    ok(_.iso_date(tonga_tz) !== _.iso_date(samoa_tz));

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

