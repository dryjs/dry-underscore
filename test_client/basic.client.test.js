
var ok = _.test.ok;
var eq = _.test.eq;

suite('basic');

test("moment", function(){
    ok(_.moment().format("YYYY-MM-DD"));
    eq(_.iso_date(), _.moment().format("YYYY-MM-DD"));
    eq(_.iso_date(_.iso_date(_.moment().format("YYYY-MM-DD"))), _.moment().format("YYYY-MM-DD"));
    eq(_.moment.duration(123, "minutes").format("h:mm:ss"), "2:03:00");
});

test("str", function(){
    eq(_.str.capitalize("hello"), "Hello");
});
 
 
