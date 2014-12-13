

function library(_){

    var lib = {};

    function string_builder_class(){
        this._str = "";
        this._indent = 0;
    };

    string_builder_class.prototype.addLine = function(){
        this.add(this._indent, " ");
        this._str += _.toArray(arguments).join("") + "\n";
    };
    string_builder_class.prototype.add_line = string_builder_class.prototype.addLine;

    string_builder_class.prototype.add = function(num){
        var args = _.toArray(arguments);
        if(_.isNumber(num)){
            args.shift();
        }else{
            num = 1;
        }

        for(var i = 0; i < num; i++){
            this._str += args.join("");
        }
    }

    string_builder_class.prototype.in = function(num){ this._indent += num; };

    string_builder_class.prototype.out = function(num){ this._indent -= num; };

    string_builder_class.prototype.string = function(){ return(this._str); };

    function string_builder(){ return new string_builder_class(); }

    string_builder.library = library;
    string_builder.class = string_builder_class;

    return(string_builder);
};

exports.library = library;

