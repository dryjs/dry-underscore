
function library(_){

    _.diff.human = function(diff, lhs_name, rhs_name, joiner){
        if(!diff){ return []; }
        if(!_.isArray(diff)){ diff = [diff]; }

        lhs_name = lhs_name || "lhs";
        rhs_name = rhs_name || "rhs";
        joiner = joiner === undefined ? "\n" : joiner;

        var messages = [];

        function quote(v){ return(_.isString(v) ? '"' + v + '"' : v); }

        _.each(diff, function(d){
            var message = null;

            if(d.path){
                message = _.format(_.concat(lhs_name, d.path).join("."), ": ", quote(d.lhs), joiner);
                message += _.format(_.concat(rhs_name, d.path).join("."), ": ", quote(d.rhs));
            }else{
                message = _.format(lhs_name, ": ", quote(d.lhs), joiner);
                message += _.format(rhs_name, ": ", quote(d.rhs));
            }

            messages.push(message);
        });

        return(messages);
    };

    _.diff.library = library;

    return(_.diff);
}

module.exports = { library: library };

