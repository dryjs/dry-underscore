
function library(_){

    var test = {};

    test.eq = function(actual, expected){
        var diff = _.diff(actual, expected);
        if(diff){
            var message = _.first(_.diff.human(diff, "actual", "expected", " not eq "))
            var err = new Error(message);
            err.actual = actual;
            err.expected = expected;
            throw(err);
        }
    };

    test.ok = function(val){
        if(!val){
            var err = new Error("false not ok");
            err.actual = true;
            err.expected = false;
            throw(err);
        }
    };

    test.throws = function(f){
        var threw = false;

        try{ f(); }
        catch(e){ threw = true; }

        if(!threw){
            throw(_.exception("NoThrow", "Expected function to throw an error, it didn't."));
        }
    };

    test.same = function(a, b){ 
        test.eq(_.difference(a, b), []);
        test.eq(_.difference(b, a), []);
    };

    test.library = library;

    return(test);
}

exports.library = library;
