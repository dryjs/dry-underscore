"use strict";

exports.mixin = function(_){

    // TODO: I need to refactor this, make it better.

    function measurer(options){

        options = options || {};

        this._parent = options.parent || null;
        this._transportsAsync = [];
        this._transportsSync = [this.runningTotalTransport];
    }

    measurer.prototype.parent = function(){ return(this._parent); };

    measurer.prototype.runningTotalTransport = function(measurement){
        var measurements = _.get(this, "_measurements", {});
        var category = _.get(measurements, measurement.category, {});
        var measurements = _.get(category, measurement.name, {});
        if(measurements[measurement.duration] === undefined){
            measurements[measurement.duration] = 0;
        }
        measurements[measurement.duration]++;
        measurements.last = measurement.duration;
    };

    measurer.prototype.transport = function(measurement){
        var self = this;

        _.each(this.transportsSync(), function(transport){ transport.call(self, measurement); });
        _.nextTick(function(){ _.each(self.transportsAsync(), function(transport){ transport.call(self, measurement); }); });

        if(this.parent()){ this.parent().transport(measurement); }
    };

    measurer.prototype.transportsSync = function(){ return(_.get(this, "_transportsSync", [])); };
    measurer.prototype.transportsAsync = function(){ return(_.get(this, "_transportsAsync", [])); };

    measurer.prototype.measure = function(categoryName, measurementName){
        var self = this;

        if(_.undef(categoryName) && _.undef(measurementName)){
            categoryName = "default";
            measurementName = _.uuid();
        }

        if(measurementName !== undefined || _.isObject(categoryName)){ 
            var stopped = self.stop(categoryName, measurementName);
            if(stopped){ return(stopped); }
            else{ return(self.start(categoryName, measurementName)); }
        }
    };
     
    measurer.prototype.child = function(options){
        return(new measurer(_.defaults(options, { parent: this })));
    };

    measurer.prototype.start = function(categoryName, measurementName){
        var pendingMeasurements = _.get(this, "_pendingMeasurements", {});
        var category = _.get(pendingMeasurements, categoryName, {});
        var measurements = _.get(category, measurementName, {});
        var newMeasurement = { type: 'measurement', category: categoryName, name: measurementName, token: _.uuid() };
        newMeasurement.start = _.timestamp();

        measurements[newMeasurement.token] = newMeasurement;
            
        return(newMeasurement);
    };

    measurer.prototype.stop = function(categoryName, measurementName){
        var self = this;
        var end = _.timestamp();
        var token = "";

        if(_.isObject(categoryName) && categoryName.type === 'measurement'){
            var tokenObj = categoryName;
            categoryName = tokenObj.category;
            measurementName = tokenObj.name;
            token = tokenObj.token;
        }

        var pendingMeasurements = _.get(this, "_pendingMeasurements", {});
        var category = _.get(pendingMeasurements, categoryName, {});
        var measurements = _.get(category, measurementName, {});
        
        var measurement = null;

        if(token){
            measurement = measurements[token];
            delete measurements[token];
        }else if(_.keys(measurements).length === 1){
            measurement = measurements[_.keys(measurements)[0]];
            delete measurements[_.keys(measurements)[0]];
        }

        // if(!measurement){ throw(_.exception("NoMeasurement", "No measurement found to stop.")); }

        if(measurement){
            measurement.end = end;
            measurement.duration = measurement.end - measurement.start;

            self.transport(measurement);

            return(measurement);

        }else{ return(null); }

    };

    measurer.prototype.measurements = function(categoryName, measurementName){
        var measurements = _.get(this, "_measurements", {})
        
        if(!categoryName){
            return(measurements);
        }else if(!measurementName){
            return(_.get(measurements, categoryName));
        }else{
            var category = _.get(measurements, categoryName);
            if(category){ return(_.get(category, measurementName)); }
            else{ return(undefined); }
        }
    };

    measurer.prototype.last = function(categoryName, measurementName){
        var measurements = _.get(this, "_measurements", {})
        var category = _.get(measurements, categoryName);
        
        if(!measurementName){
            var result = {};
            _.each(category, function(measurements, measurementName){
                result[measurementName] = measurements.last;
            });
            return(result);
        }else{
            if(category){ return(_.get(category, measurementName).last); }
            else{ return(undefined); }
        }
    };

    measurer.prototype.displayLast = function(categoryName, writer){
        writer = writer || _.stderr;
        var measurements = this.last(categoryName);

        var sorted = _.map(measurements, function(value, name){
            return({ value: value, name: name});
        });

        // sorted.sort(function(a, b){ return(a.value - b.value); });

        _.each(sorted, function(measurement){
            writer(measurement.name + ": " + measurement.value + "ms");
        });
    };

    measurer.prototype.make = function(root, options){
        root = root || {};

        root.measurer = new measurer(options);

        return(root.measurer);
    }

    return(new measurer());
};

