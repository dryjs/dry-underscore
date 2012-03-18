var assert = require('assert');
var _ = require('../');

exports.testWalk = function(){

    var o = {
        "a" : "a",
        "b" : { "c" : "c", "d" : { "e" : "e" } },
        "f" : "f"
    };
    
    var expectedKeyOrder = ['a', 'b', 'c', 'd', 'e', 'f'];
    var actualKeyOrder = [];
    
    var expectedValueOrder = ['a', { "c" : "c", "d" : { "e" : "e" } }, "c", { "e" : "e" }, "e", "f"];
    var actualValueOrder = [];
    
    _.walk(o, function(val, key, o){
        actualKeyOrder.push(key);
        actualValueOrder.push(val);
    });

    assert.eql(actualKeyOrder, expectedKeyOrder);
    assert.eql(actualValueOrder, expectedValueOrder);
};

exports.testSubstitute = function(){
    var start = {
        "a" : "a",
        "b" : { "c" : "c", "d" : { "e" : "e" } },
        "f" : "f",
        "z" : "z"
    };
    
    var end = {
        "a" : "A",
        "b" : { 'B' : { "D" : "D"}},
        "f" : "C",
        "z" : "z"
    }
    
    _.substitute(start, function(val, key){
        if(key === 'a'){
            return("A");
        }else if(key === 'b'){
            return({'B' : {'D' : 'd'}});
        }else if(key === 'D'){
            return('D');
        }else if(key === 'f'){
            return('C');
        }
    });

    assert.eql(start, end);
}