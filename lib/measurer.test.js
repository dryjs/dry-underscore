
var _ = require('../');
var eq = _.test.eq;
var ok = _.test.ok;

function Measurer(){};
_.measurer.make(Measurer.prototype);

function test_measurer(measurer, cb){

    measurer.measure("timeout", "one");
    setTimeout(function(){ 
        ok(_.within(measurer.measure("timeout", "one").duration, 80, 10));
        measurer.measure("timeout", "two");
        setTimeout(function(){ 
            ok(_.within(measurer.measure("timeout", "two").duration, 100, 10));
            var token = measurer.measure("token", "one")
            setTimeout(function(){ 
                ok(_.within(measurer.measure(token).duration, 120, 10));
                var tokenTwo = measurer.measure();
                setTimeout(function(){ 
                    ok(_.within(measurer.measure(tokenTwo).duration, 200, 10));
                    cb();
                }, 200);
            }, 120);
        }, 100);
    }, 80);

    /*
    setTimeout(function(){
        // _.stderr(measurer.measurements());
        // measurer.displayLast("timeout", _.stderr);
    }, 200);
    */
}

test("measurer", function(done){
    test_measurer(_.measurer, function(){
        test_measurer(_.measurer.make({}), function(){
            test_measurer((new Measurer()).measurer, function(){
                 done();
            });
        });
    });
});
     
