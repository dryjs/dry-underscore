
var _ = require('../');

var eq = _.test.eq;
var ok = _.test.ok;

suite('waiter');

function sync(i, callback, err){
    if(err){ return callback(err); }
    else{ return callback(null, i, "a", i) }
}

function async(i, callback, err){
    _.nextTick(function(){
        if(err){ return callback(err); }
        else{ return callback(null, i, "a", i) }
    });
}

function value(i, err){ 
    if(err){ return([err]); }
    else{ return([null, i, "a", i]); }
}

function smart_value(i){ 
    return([i, "a", i]); 
}

test('raw', function(callback){

    function test(maker, callback){
        var w = _.waiter().raw();

        _.for(10, function(i){ maker(i, w.callback({ num: i*2, str: "extra" })); });

        var expected_results = [];
        var expected_context = [];
        _.for(10, function(i){ 
            expected_results.push(value(i));
            expected_context.push({ num: i*2, str: "extra" });
        });

        w.wait(function(results, context){ 
            eq(results, expected_results);
            eq(context, expected_context);
            _.each(results, function(v, i){ eq(w.results(i), v); });
            _.each(context, function(v, i){ eq(w.context(i), v); });
            callback();
        });
    }

    test(sync, function(){ test(async, callback); });
});

test('all_errors', function(callback){
    var w = _.waiter();

    var error = _.error("some_error");
    _.for(10, function(i){ async(i, w.callback("some_context"), error); });

    var expected_errors = [];
    var expected_results = [];
    var expected_context = [];

    _.for(10, function(i){ 
        expected_errors.push(error);
        expected_results.push([]);
        expected_context.push("some_context");
    });

    w.wait(function(errors, results, context){ 
        eq(errors, expected_errors);
        eq(results, expected_results);
        eq(context, expected_context);
        _.each(errors, function(v, i){ eq(w.errors(i), v); });
        _.each(results, function(v, i){ eq(w.results(i), v); });
        _.each(context, function(v, i){ eq(w.context(i), v); });
        callback();
    });
});

test('some_errors', function(callback){
    var w = _.waiter();

    var error = _.error("some_error");
    _.for(10, function(i){ async(i, w.callback("some_context"), i == 2 ? error : null); });

    var expected_errors = [];
    var expected_results = [];
    var expected_context = [];

    _.for(10, function(i){ 
        if(i === 2){
            expected_errors.push(error);
            expected_results.push([]);
        }else{
            expected_errors.push(null);
            expected_results.push(smart_value(i));
        }
        expected_context.push("some_context");
    });

    w.wait(function(errors, results, context){ 
        eq(errors, expected_errors);
        eq(results, expected_results);
        eq(context, expected_context);
        _.each(errors, function(v, i){ eq(w.errors(i), v); });
        _.each(results, function(v, i){ eq(w.results(i), v); });
        _.each(context, function(v, i){ eq(w.context(i), v); });
        callback();
    });
});

/*
test('bind', function(callback){

    function test(maker){
        var w = _.waiter();

        var error = _.error("some_error");
        _.for(10, function(i){ async(i, w.callback("some_context"), i == 2 ? error : null); });

        var expected_errors = [];
        var expected_results = [];
        var expected_context = [];

        _.for(10, function(i){ 
            if(i === 2){
                expected_errors.push(error);
                expected_results.push([]);
            }else{
                expected_errors.push(null);
                expected_results.push(smart_value(i));
            }
            expected_context.push("some_context");
        });

        var errors = [];
        var results = [];
        var context = [];

        w.bind(function(err, context, str_one, i, str_two){ 
            errors.push(err);
            context.push(context);
            results.push([str_one, i, str_two]);

            callback();
        }, function(){
            eq(errors, expected_errors);
            eq(results, expected_results);
            eq(context, expected_context);

            _.each(errors, function(v, i){ eq(w.errors(i), v); });
            _.each(results, function(v, i){ eq(w.results(i), v); });
            _.each(context, function(v, i){ eq(w.context(i), v); });

            callback();
        });
    }

    test(sync, function(){ test(async, callback); });
});
*/
