
exports.mixin = function(_){

    _.stdout = function(){
        var entry = _.format.apply(null, arguments);
        process.stdout.write(entry);
        process.stdout.write("\n");
    };
    _.stderr = function(){
        var entry = _.format.apply(null, arguments);
        process.stderr.write(entry);
        process.stderr.write("\n");
    };
    _.p = _.stderr;

    _.stdout.write = function(){
        var entry = _.format.apply(null, arguments);
        process.stdout.write(entry);
    };

    _.stderr.write = function(){
        var entry = _.format.apply(null, arguments);
        process.stderr.write(entry);
    };

    _.getch = function(callback, keyOnReturn){

        var wasRaw = process.stdin.isRaw;

        var keypress = require('keypress');

        // make `process.stdin` begin emitting "keypress" events
        keypress(process.stdin);

        process.stdin.once('keypress', function (ch, key) {
            process.stdin.setRawMode(wasRaw);
            process.stdin.pause();

            if(keyOnReturn && key.name == 'return'){
                callback(keyOnReturn, key);
            }else{ callback(ch, key); }
        });

        process.stdin.setRawMode(true);
        process.stdin.resume();
    };

    _.keyprompt = function(prompt, callback, defaultChoice, writer){
        writer = writer || _.stderr;
        writer.write(prompt);
        _.getch(function(ch, key){
            writer.write(ch + "\n");
            callback(ch, key);
        }, defaultChoice);
    };

};
