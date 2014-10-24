
function mixin(_){

    var eq = _.test.eq;
    var ok = _.test.ok;

    function mock_object(functions){
        var self = this;

        this.functions = {};

        _.each(functions, function(val, key){
            self.functions[key] = _.extend({
                called: false
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
                eq(info.expected_call, info.actual_call);
            }

            if(info.expected_args){
                _.each(info.expected_args, function(arg, i){
                    eq(arg, info.actual_args[i]);
                });
            }

            if(info.callback){
                var callback = _.a(arguments).pop();
                ok(_.isFunction(callback));
                callback.apply(null, info.callback);
            }else if(info.delegate){
                return(info.delegate.apply(null, _.a(arguments)));
            }
        };
    };

    mock_object.prototype.check = function(){
        _.each(this.functions, function(f){
            eq(f.expected_call, f.actual_call);
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
