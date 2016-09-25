
function library(_){

    function isString(arg) {
        return typeof arg === 'string';
    }
    function isObject(arg) {
        return typeof arg === 'object' && arg !== null;
    }
    function isNull(arg) {
        return arg === null;
    }


    // taken from the nodejs source
    var format = (function(){
        var formatRegExp = /%[sdj%]/g;
        var format_f = function(f) {
            if (!isString(f)) {
                var objects = [];
                for (var i = 0; i < arguments.length; i++) {
                    objects.push(_.inspect(arguments[i]));
                }
                return objects.join(' ');
            }

            var i = 1;
            var args = arguments;
            var len = args.length;
            var str = String(f).replace(formatRegExp, function(x) {
                if (x === '%%') return '%';
                if (i >= len) return x;
                switch (x) {
                    case '%s': return String(args[i++]);
                    case '%d': return Number(args[i++]);
                    case '%j':
                               try {
                                   return JSON.stringify(args[i++]);
                               } catch (_) {
                                   return '[Circular]';
                               }
                    default:
                               return x;
                }
            });
            for (var x = args[i]; i < len; x = args[++i]) {
                if (isNull(x) || !isObject(x)) {
                    str += '' + x;
                } else {
                    str += ' ' + _.inspect(x);
                }
            }
            return str;
        };

        return(format_f);
    })();


    format.phoneNumber = format.phone_number = function(number, locale){
        if(!_.isString(number)){ return(number); }
        var source = number;
        number = _.numbers(number);
        if(number.length === 10){
            return(number.substr(0, 3) + "-" + number.substr(3, 3) + "-" + number.substr(6, 4));
        }else if(number.length === 11){
            if(source[0] === "+"){
                return("+" + number.substr(0, 1) + " " + number.substr(1, 3) + "-" + number.substr(4, 3) + "-" + number.substr(7, 4));
            }else{
                return(number.substr(0, 1) + "-" + number.substr(1, 3) + "-" + number.substr(4, 3) + "-" + number.substr(7, 4));
            }
        }else if(number.length === 12 && number[0] === "+"){
            number = number.substr(1, number.length-1);
            return("+" + number.substr(0, 1) + " " + number.substr(1, 3) + "-" + number.substr(4, 3) + "-" + number.substr(7, 4));
        }else{ return(source); }
    }

    format.number = function(num, round, use_fixed){
        var options = {
            decimal: ".",
            order: ","
        }

        num = _.n(num);
        if(num === null){ return(null); }

        if(_.isObject(round)){
            options = _.extend(options, round);
        }else{
            if(use_fixed === false){
                options.max = _.n(round);
            }else{
                options.fixed = _.n(round);
            }
        }

        var decimal_count = _.decimal_count(num);

        if(options.fixed){ 
            decimal_count = options.fixed;
        }else if(options.max){
            decimal_count = _.min(decimal_count, options.max);
        }

        if(decimal_count < 0){ decimal_count = 0; }

        return(_.str.numberFormat(num, decimal_count, options.decimal, options.order));
    };

    format.library = library;

    return(format);
}

exports.library = library;
