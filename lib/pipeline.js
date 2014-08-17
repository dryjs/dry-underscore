"use strict";

exports.mixin = function(_){

    function pipeline(options){
        options = options || {};
        this.root = null;
        this.orphans = [];
        this.nodes = [];
    }

    var name =  _.property('name');

    pipeline.prototype.before = function(stageAfter, stageBefore){

        var before = this.findNode(stageBefore);
        var after = this.findNode(stageAfter);

        if(!before && !after){
            before = { name: stageBefore, prev: null, next: null };
            after = { name: stageAfter, prev: null, next: null };
            before.next = after;
            after.prev = before;
            this.nodes.push(before);
            this.nodes.push(after);
            if(this.root == null){ this.root = before; }
        }else if(!after){
            after = { name: stageAfter, prev: null, next: null };
            after.prev = before;
            after.next = before.next;
            before.next = after;
            if(after && after.next){ after.next.prev = after; }
            this.nodes.push(after);
        }else if(!before){
            before = { name: stageBefore, prev: null, next: null };
            before.next = after;
            before.prev = after.prev;
            after.prev = before;
            if(before && before.prev){ before.prev.next = before; }
            if(this.root === after){ this.root = before; }
            this.nodes.push(before);
        }else{
            if(before.next === null && after.prev === null){
                before.next = after;
                after.prev = before;
            }else if(before.next !== after || after.prev !== next){
                throw(_.error("BadStageLocation", 
                              "Something has gone awry. I know that's not helpful, but I have no idea what's going on. " +  
                              "You want: \n" + _.s(before) + "\n before: \n" + _.s(after)
                             )
                     );
            }
        }

    };

    pipeline.prototype.after = function(stageBefore, stageAfter){
        return this.before(stageAfter, stageBefore);
    };

    pipeline.prototype.findNode = function(name){
        return(_.find(this.nodes, function(n){ return(n.name === name); }));
    };

    pipeline.prototype.printNodes = function(){
        var self = this;
        _.each(this.nodes, function(n){ 
            var str = "";
            if(self.root === n){ str += "ROOT: "; }
            str += (n.prev ? n.prev.name : "null") + " <- " + n.name + " -> " + (n.next ? n.next.name : "null");
            _.stdout(str); 
        });
    };

    pipeline.prototype.order = function(){
        var order = [];

        var root = this.root;

        while(root){
            order.push(root.name);
            root = root.next;
        }

        // _.p(order);

        if(order.length !== this.nodes.length){
            throw(_.error("DanglingStep", "There are more pipeline nodes pending than there are conected. nodes: " +  _.s(_.pluck(this.nodes, "name")) + " connected: " + _.s(order))); 
        }

        return(order);
    };

    return(function(options){ return(new pipeline(options)); });
};




