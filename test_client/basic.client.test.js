
var ok = _.test.ok;
var eq = _.test.eq;

suite('basic');

test("moment", function(){
    ok(_.moment().format("YYYY-MM-DD"));
});
 
