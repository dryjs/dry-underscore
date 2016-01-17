
function library(_){

    var test = {};

    test.eq = function(actual, expected){
        if(_.deep_equal(actual, expected)){
            return(true);
        }else{
            if(_.isString(actual) && _.isString(expected)){
                var err = new Error('"' + actual + '"' + " not eq " + '"' + expected + '"');
                err.actual = actual;
                err.expected = expected;
                throw(err);
            }else{
                var err = new Error(_.stringify(actual) + " not eq " + _.stringify(expected));
                err.actual = _.stringify(actual);
                err.expected = _.stringify(expected);
                throw(err);
            }
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
