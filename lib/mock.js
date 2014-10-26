
function mixin(_){

    var eq = _.test.eq;
    var ok = _.test.ok;

    function mock_object(functions){
        var self = this;

        this.functions = {};

        _.each(functions, function(val, key){
            self.functions[key] = _.extend({
                actual_call: false
            }, val);
        });

        _.each(self.functions, function(info, name){
            self.mock_function(name, info);
         });
    }

    mock_object.prototype.mock_function = function(name, info){
       this[name] = function(){
            info.actual_call = true;
            info.actual_args = _.a(arguments);

            if(info.expected_call !== undefined){
                try{
                    eq(info.expected_call, info.actual_call);
                }catch(e){
                    throw(_.exception("UnexpectedCall", "Function: " + name + " was called, when you said it shouldn't be."));
                }
            }

            if(info.expected_args){
                _.each(info.expected_args, function(arg, i){

                    try{
                        eq(arg, info.actual_args[i]);
                    }catch(e){
                        var ex = _.exception("UnexpectedArgument", "Unexpected argument to function: " + name + ". actual: " + _.stringify(arg) + " expected: " + _.stringify(actual_args[i]))
                        ex.actual = e.actual;
                        ex.expected = e.expected;
                        throw(ex);
                    }
                });
            }

            if(info.callback){
                var callback = _.a(arguments).pop();
                if(!_.isFunction(callback)){
                    throw(_.exception("NoCallback", "Function: " + name + " wasn't passed a callback as the last argument. args: " + _.stringify(info.actual_args)));
                }
                callback.apply(null, info.callback);
            }else if(info.delegate){
                return(info.delegate.apply(null, _.a(arguments)));
            }
        };
    };

    mock_object.prototype.check = function(){
        _.each(this.functions, function(f, name){
            if(f.expected_call !== undefined && f.expected_call !== f.actual_call){
                if(!f.expected_call){
                    throw(_.exception("UnexpectedCall", "Function: " + name + " was called, when you said it shouldn't be."));
                }else{
                    throw(_.exception("ExpectedCall", "Function: " + name + " wasn't called, when you said it should be."));
                }
            }
        });
    };


    function req_mock_object(body, strict){
        this.body = body;
        this.strict = false;
    }

    req_mock_object.prototype.param = function(key){
        if(this.strict){
            ok(this.body[key] !== undefined);
        }
        return(this.body[key]);
    };


    function mock(functions, properties){
        return(new mock_object(functions, properties));
    }

    mock.req = function(body){
        return(new req_mock_object(body));
    };

    return(mock);
}

exports.mixin = mixin;
