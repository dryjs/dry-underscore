"use strict";

exports.library = function library(_){


    // TODO: add transports, parents
    /*
    measurer.prototype.transport = function(measurement){
        var self = this;

        _.each(this.transportsSync(), function(transport){ transport.call(self, measurement); });
        _.nextTick(function(){ _.each(self.transportsAsync(), function(transport){ transport.call(self, measurement); }); });

        if(this.parent()){ this.parent().transport(measurement); }
    };
    */

    function timer(options){
        if(_.isFunction(options)){ options = { out: options }; }
        options = options || {};

        this._out = options.out || _.stderr;
        this._times = {};
    }

    timer.prototype.time = function(event_category, event_name){
        var self = this;

        if(!event_name){ 
            event_name = event_category;
            event_category = "uncategorized";

            if(event_name){
                var event_split = event_name.split(".");
                if(event_split.length > 1){
                    event_category = event_split[0];
                    event_name = event_split[1];
                }
            }
        }

        var start_time = (new Date()).valueOf();
        var elapsed_time = null;

        return(function(log_str){
            if(elapsed_time === null){

                var end_time = (new Date()).valueOf();
                elapsed_time = end_time - start_time;

                if(event_category && event_name){
                    if(!self._times[event_category]){ self._times[event_category] = {}; }
                    if(!self._times[event_category][event_name]){ self._times[event_category][event_name] = []; }
                    self._times[event_category][event_name].push(elapsed_time);
                };
            }

            if(log_str){ self._out(log_str + ": ", elapsed_time + "ms"); }

            return(elapsed_time);
        });
    }

    timer.prototype.last = function(category_name){
        var last = {};
        if(!this._times[category_name]){ return last; }

        _.each(this._times[category_name], function(times, key){
            last[key] = _.last(times);
        });

        return(last);
    };

    timer.prototype.print_last = function(category_name){
        var self = this;
        _.each(self.last(category_name), function(time, key){
            self._out(key + ": " + time + "ms");
        });
    };

    timer.prototype.times = function(event_category, event_name){

        if(!event_category){ return(this._times); }

        var event_split = event_category.split(".");
        if(event_split.length > 1){
            event_category = event_split[0];
            event_name = event_split[1];
        }

        else if(!this._times[event_category]){ return({}); }

        if(!event_name){ return(this._times[event_category]); }
        else if(!this._times[event_category][event_name]){ return([]); }

        return(this._times[event_category][event_name]);
    };

    timer.prototype.make = function(options){ return(new timer(options)); };

    timer.prototype.library = library;
    timer.prototype.class = timer;

    return(new timer());
};

