
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

    test.throws = function(f, filter, filter_message){
        var threw = false;

        filter = filter || function(){ return(true); };

        try{ f(); }
        catch(e){ 
            threw = true;

            if(_.isString(filter)){
                var filter_string = filter;
                filter = function(err){ return(_.code(err, filter_string)); }
                filter_message = filter_message || "Function threw an error, but the code was unexpected. actual code: " + _.code(e) + " expected code: " + filter_string;
            }

            if(!filter(e)){ 
                throw(_.exception("wrong_code", filter_message || "Function threw an error, but the code was unexpected. actual code: " + _.code(e)));
            }
        }

        if(!threw){
            throw(_.exception("no_throw", "Expected function to throw an error, it didn't."));
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
