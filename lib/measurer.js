"use strict";

exports.mixin = function(_){

var measurer = function(f, parent){

    if(f === undefined){ f = {}; }
    
    f.measureParent = function(){ return(parent); };

    f.measureTransport = function(measurement){
        var self = this;

        _.each(this.measureTransportsSync(), function(transport){ transport.call(self, measurement); });
        _.nextTick(function(){ _.each(self.measureTransportsAsync(), function(transport){ transport.call(self, measurement); }); });

        if(this.measureParent()){ this.measureParent().measureTransport(measurement); }
    };

    f.measureTransportsSync = function(){ return(_.get(this, "_measurementTransportsSync", [])); };
    f.measureTransportsAsync = function(){ return(_.get(this, "_measurementTransportsAsync", [])); };

    f._measurementTransportsAsync = [];

    f._measurementTransportsSync = [function(measurement){
        var measurements = _.get(this, "_measurements", {});
        var category = _.get(measurements, measurement.category, {});
        var measurements = _.get(category, measurement.name, {});
        if(measurements[measurement.duration] === undefined){
            measurements[measurement.duration] = 0;
        }
        measurements[measurement.duration]++;
        measurements.last = measurement.duration;
    }];

    f.measure = function(categoryName, measurementName){
        var self = this;

        if(measurementName !== undefined || _.isObject(categoryName)){ 
            var stopped = this.measureStop(categoryName, measurementName);
            if(stopped){ return(stopped); }
            else{ return(this.measureStart(categoryName, measurementName)); }
        }else if(categoryName === undefined){
            return({
                start: _.bind(self.measureStart, self),
                stop: _.bind(self.measureStop, self),
                get: _.bind(self.measureGet, self),
                last: _.bind(self.measureLast, self),
                display: _.bind(self.measureDisplay, self),
            });
        }else{
            return({
                start: _.bind(self.measureStart, self, categoryName),
                stop: _.bind(self.measureStop, self, categoryName),
                get: _.bind(self.measureGet, self, categoryName),
                last: _.bind(self.measureLast, self, categoryName),
                display: _.bind(self.measureDisplay, self, categoryName),
            });
        }
    };

    f.measureStart = function(categoryName, measurementName){
        var pendingMeasurements = _.get(this, "_pendingMeasurements", {});
        var category = _.get(pendingMeasurements, categoryName, {});
        var measurements = _.get(category, measurementName, {});
        var newMeasurement = { type: 'measurement', category: categoryName, name: measurementName, token: _.uuid() };
        newMeasurement.start = _.timestamp();

        measurements[newMeasurement.token] = newMeasurement;
            
        return(newMeasurement);
    };

    f.measureStop = function(categoryName, measurementName){
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
        }else if(_.keys(measurements).length === 1){
            measurement = measurements[_.keys(measurements)[0]];
        }

        if(measurement){
            measurement.end = end;
            measurement.duration = measurement.end - measurement.start;

            self.measureTransport(measurement);
        }

        return(measurement);
    };

    f.measureGet = function(categoryName, measurementName){
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

    f.measureLast = function(categoryName, measurementName){
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


    f.measureDisplay = function(measurements, writer){
        _.each(measurements, function(measurement, name){
            writer(name + ": " + measurement + "ms");
        });
    };

    return(f);
};

return(measurer);

};

