
exports.mixin = function(_){
    _.date = function(ts){
        if(_.isNumber(ts)){
            return(new Date(ts));
        }else{
            return(new Date());
        }
    };

    _.timestamp = function(d){
        if(_.isNumber(d)){ return(_.timestamp() + d); }

        if(d === undefined){ d = _.date(); }
        return(d.getTime());
    };

    _.lc = function(s){
        return(s.toLowerCase());
    };

    _.isoDate = function(d){ 
        if(d === undefined){ d = _.date(); }
        return(_.moment(d).format("YYYY-MM-DD"));
    };

    _.ms = function(n){
        if(n === undefined){ return(0); }
        else{ return(n); }
    };
    _.ms.second = function(n){
        if(n === undefined){ n = 1; }
        return(n * _.ms(1000));
    };
    _.ms.minute = function(n){ 
        if(n === undefined){ n = 1; }
        return(n * _.ms.second(60));
    };
    _.ms.hour = function(n){ 
        if(n === undefined){ n = 1; }
        return(n * _.ms.minute(60));
    };
    _.ms.day = function(n){ 
        if(n === undefined){ n = 1; }
        return(n * _.ms.hour(24));
    };
    _.ms.week = function(n){ 
        if(n === undefined){ n = 1; }
        return(n * _.ms.day(7));
    };

    _.minutes = function(n){
        if(n === undefined){ return(0); }
        else{ return(n); }
    }
    _.minutes.hour = function(n){ 
        if(n === undefined){ n = 1; }
        return(n * _.minutes(60));
    };
    _.minutes.day = function(n){ 
        if(n === undefined){ n = 1; }
        return(n * _.minutes.hour(24));
    };
    _.minutes.week = function(n){ 
        if(n === undefined){ n = 1; }
        return(n * _.minutes.day(7));
    };
    _.minutes.timeString = function(min){
        var hours = Math.floor(min / 60);          
        var minutes = min % 60;
        var amPm = "AM";
        if(hours >= 12){ amPm = "PM"; }
        if(hours > 12){
            hours -= 12;
        }
        if(minutes < 10){
            minutes = "0" + minutes;
        }

        return(hours + ":" + minutes + " " + amPm);
    };

    var oldMax = _.max;
    _.max = function(a, b){
        if(_.isNumber(a) && _.isNumber(b)){
            if(a > b){ return(a); }
            else{ return(b); }
        }else{ return(oldMax.apply(_, arguments)); }
    };

    var oldMin = _.min;
    _.min = function(a, b){
        if(_.isNumber(a) && _.isNumber(b)){
            if(a < b){ return(a); }
            else{ return(b); }
        }else{ return(oldMin.apply(_, arguments)); }
    };
 
    _.concat = function(){ return(Array.prototype.concat.apply([], arguments)); };
    _.fatal = function(){ throw(new Error("Fatal Error: " + _.format.apply(null, arguments))); };

    _.jsonClone = function(o){ 
        return(_.parse(_.stringify(o)));
    };

    _.regex = function(str){ return(new RegExp(str)); };

    _.onceEvery = function(val, mod, hit, miss){
        if((val % mod) === 0 && hit){ hit(); }
        else if(miss){ miss(); }
    };

    _.render = function(templateName){
        return(function(template, hash){
            var f = null;
            if(_.isString(template)){
                f = _.hb.compile(template);
                if(!templateName){ templateName = template; }
                _.render.templates[templateName] = f;
            }else if(_.isObject(template)){
                hash = template;
                template = null;
                if(templateName){ f = _.render.templates[templateName]; }
            }
            if(!f){ _.fatal("no template found. template: " + template + " templateName: " + templateName); }

            if(hash){ return(f(hash)); }
            else{ return(f); }
        });
    };
    
    _.render.templates = {};

    _.mixin({
        noop: function(){},
        byteUnits : function(val){
            var unit = "B";
            if(val > 1024){
                val /= 1024;
                unit = "KB"
            }
            if(val > 1024){
                val /= 1024;
                unit = "MB"
            }
            if(val > 1024){
                val /= 1024;
                unit = "GB"
            }
            if(val > 1024){
                val /= 1024;
                unit = "TB"
            }
            return(val + " " + unit);
        },
        stringify : function(){ return(JSON.stringify.apply(null, arguments)); },
        parse : function(){ return(JSON.parse.apply(null, arguments)); },
        call: function(callback){
            if(!_.isFunction(callback)){ return(false); }
            if(arguments.length > 1){
                var args = _.toArray(arguments);
                args.shift();
                callback.apply(null, args);
                return(true);
            }else{ callback(); return(true); }
        },
        get: function(obj, key, defaultValue){
            if(_.isFunction(obj)){ return(obj()); }
            if(key === undefined){ return(obj); }
            if(defaultValue !== undefined){
                if(!obj[key]){
                    obj[key] = defaultValue;
                    return(obj[key]);
                }else{
                    return(obj[key]);
                }
            }
            if(obj[key] !== undefined){
                if(_.isFunction(obj[key])){ return(obj[key]()); }
                else{ return(obj[key]); }
            }else{
                for (var prop in obj){
                    if(_.has(obj, prop) && prop.toLowerCase() === key.toLowerCase()){
                        return obj[prop];
                    }
                }
                return undefined;
            }
        },
        time: function(str, log){
            if(str === undefined){ return(new Date().getTime()); }

            if(!_.time.hash){ _.time.hash = {}; }
            var time = new Date().getTime();
            if(_.time.hash[str]){
                var t2 = _.time.hash[str];
                _.time.hash[str] = undefined;
                var val = time - t2;
                if(log){ _.log(str + ":", val + "ms"); }
                return(val);
            }else{ _.time.hash[str] = time; }
        },
        isEmptyObjectWithNoPrototype : function(o){
            if(!_.isObject(o)){ return(false); }
            var isEmpty = true;
            for(key in o){
                isEmpty = false;
                break;
            }
            return(isEmpty);
        },
        isObject : function(o){ return(o !== null && typeof(o) === 'object' && !_.isArray(o)); },
        stripLineBreaks : function(str) { return(str.replace(/[\r\n]/gi ,"")); },
        trimAndStripQuotes: function(str){
            str = _.trim(str);
            if(str[0] === "'" || str[0] === '"'){
                str = str.substr(1, str.length-1);
            }
            if(str[str.length-1] === "'" || str[str.length-1] === '"'){
                str = str.substr(0, str.length-1);
            }
            return(str);
        },
        uiLock : function(f){
            var running = false;
            var eventLock = function(e){
                if(running){ return e.preventDefault(); }
                else{ 
                    running = true;
                    f.call(this, e, function(){ running = false; }); 
                }
            };
            return(eventLock);
        },
        asyncLock : function(f, lockTest, lockModify, lockRelease){
            var running = false;

            function lock(){
                var args = _.toArray(arguments);

                if(lockTest){
                    var userTest = lockTest;
                    var testArgs = _.toArray(arguments);
                    lockTest = function(){ 
                        var testArgsCopy = _.toArray(testArgs);
                        testArgsCopy.unshift(running);
                        return(userTest.apply(null, testArgsCopy)); 
                    };
                }else{
                    lockTest = function(){ return(running); }; 
                }

                lockModify = lockModify || function(){ running = true; }
                lockRelease = lockRelease || function(){ running = false; };                

                if(lockTest()){ return; }
                lockModify(); 
                args.push(lockRelease);
                f.apply(this, args);
            }

            return(lock);

        },
        lock : function(f){
            var running = false;

            function lock(){
                if(running){ return; }

                running = true;
                f.apply(null, arguments);
                running = false;
            }

            return(lock);
        },
        addProperties : function(o, propArray, val){
            _.each(propArray, function(prop){ o[prop] = val; });
            return(o);
        },
        walk : function(o, iterator, context){
            _.each(o, function(val, key, o){
                iterator.call(context, val, key, o);
                if(val && typeof(val) === 'object'){
                    _.walk(val, iterator, context);
                }
            });
        },
        substitute : function(o, replacer, context){
            _.each(o, function(val, key, o){
                var newVal = replacer.call(context, val, key, o);
                if(newVal !== undefined){
                    o[key] = newVal;
                    val = newVal;
                }
                if(val && typeof(val) === 'object'){
                    _.substitute(val, replacer, context);
                }
            });
        },
        isIterable : function(o){ return(_.isArray(o) || _.isObject(o)); },
        eachAsync : function(o, iterator, complete, context){
            if(complete && !_.isFunction(complete)){
                context = complete;
                complete = null;
            }

            var keys = _.keys(o);

            var callComplete = function(){ _.nextTick(complete) };
            if(!complete){ callComplete = function(){}; }

            (function doWork(i){
                if(i >= keys.length){ callComplete(); }
                else{
                    function callIterator(){ iterator.call(context, o[keys[i]], keys[i], function(){ doWork(i+1); }, callComplete); }

                    if(((i + 1) % 30) === 0){ process.nextTick(callIterator); }
                    else{ callIterator(); }
                }
            })(0);
        },
        find : function(col, target, insensitive){
            if(!insensitive && _.isArray(col)){
                return(_.indexOf(col, target));
            }
        },
        exists : function(col, target, insensitive){
            if(insensitive){
                return(_.any(col, function(a){ return(a.toLowerCase() === target.toLowerCase()); }));
            }else{
                return(_.any(col, function(a){ return(a === target); }));
            }
        },
        join_path: function(){
            var a = _.toArray(arguments);

            var result = [];
            var startSlash = false;  
            var endSlash = false;

            if(a.length > 0 && a[0].length > 0 && a[0][0] === "/"){ startSlash = true; }
            if(a.length > 0 && a[a.length-1].length > 0 && a[a.length-1][a[a.length-1].length-1] === "/"){ endSlash = true; }

            _.each(a, function(part){ 
                var sp = part.split('/'); 
                sp = _.filter(sp, function(a){ return(a != ""); });
                _.each(sp, function(unit){ result.push(unit); });
            });

            result = result.join('/');

            if(startSlash){ result = "/" + result; }
            if(endSlash){ result += "/"; }

            return(result);
        },
        removeElements: function(array, from, to) {
            var rest = array.slice((to || from) + 1 || array.length);
            array.length = from < 0 ? array.length + from : from;
            return array.push.apply(array, rest);
        },
        fieldStack : function(obj){
            var workingStack = [];
            var resultStack = [];
            var currentItem = obj;

            if(_.isIterable(currentItem)){
                _.each(currentItem, function(val, key){
                    workingStack.push({ object: currentItem, fieldName: key });
                    resultStack.push({ object: currentItem, fieldName: key });
                });
            }

            var stackItem = workingStack.pop(); 

            while(stackItem){
                currentItem = stackItem.object[stackItem.fieldName];

                if(_.isIterable(currentItem)){
                    _.each(currentItem, function(val, key){
                        workingStack.push({ object: currentItem, fieldName: key });
                        resultStack.push({ object: currentItem, fieldName: key });
                    });
                }

                stackItem = workingStack.pop(); 
            } 

            return(resultStack);
        },
        unionize : function(){
            var args = arguments;
            return(function(){
                var uargs = arguments;
                _.each(args, function(f){
                    if(_.isFunction(f)){
                        f.apply(undefined, uargs);
                    }
                });
            });
        },
        trim : function trim(str) {
            if(String.prototype.trim){
                return(String.prototype.trim.call(str)); 
            }else{
                str = str.replace(/^\s\s*/, '');
                var ws = /\s/;
                var i = str.length;
                while (ws.test(str.charAt(--i)));
                return str.slice(0, i + 1);
            }
        },
        getterSetter : function (variableName){
            return(function(val){
                if(val === undefined){ return(this[variableName]); }
                else{
                    this[variableName] = val;
                    return(this);
                }
            });
        },
        // makeClass - By John Resig (MIT Licensed)
        makeClass : function (){
            return(function(args){
                if ( this instanceof arguments.callee ) {
                    if ( typeof this.init == "function" ){
                        this.init.apply( this, args.callee ? args : arguments );
                    }
                } else{
                    return new arguments.callee( arguments );
                }
            });
        },
        toNumber : function(n){
            n = n - 0; 
            if(isNaN(n)){ return(null); }
            else{ return(n); }
        },
        n : function(n){ return(_.toNumber(n)); },
        s : function(n){ return(n + ""); },
        formatNumber: function(nStr){
            nStr += '';
            var x = nStr.split('.');
            var x1 = x[0];
            var x2 = x.length > 1 ? '.' + x[1] : '';
            var rgx = /(\d+)(\d{3})/;
            while (rgx.test(x1)) {
                    x1 = x1.replace(rgx, '$1' + ',' + '$2');
            }
            return x1 + x2;
        },
        uuid : function(len, radix) {
            // ported by Tom Robison

            /*
               Based on Math.uuid.js 1.4 by Robert Kieffer

               ----
               Copyright (c) 2008, Robert Kieffer
               All rights reserved.

               Redistribution and use in source and binary forms, with or without
               modification, are permitted provided that the following conditions are met:

             * Redistributions of source code must retain the above copyright notice,
             this list of conditions and the following disclaimer.
             * Redistributions in binary form must reproduce the above copyright
             notice, this list of conditions and the following disclaimer in the
             documentation and/or other materials provided with the distribution.
             * Neither the name of Robert Kieffer nor the names of its contributors
             may be used to endorse or promote products derived from this software
             without specific prior written permission.
             THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
             AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
             IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
             ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
             LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
             CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
             SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
             INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
             CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
             ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
             POSSIBILITY OF SUCH DAMAGE.

            */



            /*
             * Generate a random uuid.
             *
             * USAGE: uuid.uuid(length, radix)
             * length - the desired number of characters
             * radix - the number of allowable values for each character.
             *
             * EXAMPLES:
             * // No arguments - returns RFC4122, version 4 ID
             * >>> Math.uuid()
             * "92329D39-6F5C-4520-ABFC-AAB64544E172"
             *
             * // One argument - returns ID of the specified length
             * >>> Math.uuid(15) // 15 character ID (default base=62)
             * "VcydxgltxrVZSTV"
             *
             * // Two arguments - returns ID of the specified length, and radix. (Radix must be <= 62)
             * >>> Math.uuid(8, 2) // 8 character ID (base=2)
             * "01001010"
             * >>> Math.uuid(8, 10) // 8 character ID (base=10)
             * "47473046"
             * >>> Math.uuid(8, 16) // 8 character ID (base=16)
             * "098F4D35"
             */

            var CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
            var chars = CHARS, uuid = [], rnd = Math.random;
            radix = radix || chars.length;

            if (len) {
                // Compact form
                for (var i = 0; i < len; i++)
                    uuid[i] = chars[0 | rnd()*radix];
            } else {
                // rfc4122, version 4 form
                var r;

                // rfc4122 requires these characters
                uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
                uuid[14] = '4';

                // Fill in random data. At i==19 set the high bits of clock sequence as
                // per rfc4122, sec. 4.1.5
                for (var i = 0; i < 36; i++) {
                    if (!uuid[i]) {
                        r = 0 | rnd()*16;
                        uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r & 0xf];
                    }
                }
            }

            return uuid.join('');
        },
        sha256: function (msg, utf8encode) {
            var Sha256 = {};  // Sha256 namespace

            Sha256.ROTR = function(n, x) { return (x >>> n) | (x << (32-n)); }
            Sha256.Sigma0 = function(x) { return Sha256.ROTR(2,  x) ^ Sha256.ROTR(13, x) ^ Sha256.ROTR(22, x); }
            Sha256.Sigma1 = function(x) { return Sha256.ROTR(6,  x) ^ Sha256.ROTR(11, x) ^ Sha256.ROTR(25, x); }
            Sha256.sigma0 = function(x) { return Sha256.ROTR(7,  x) ^ Sha256.ROTR(18, x) ^ (x>>>3);  }
            Sha256.sigma1 = function(x) { return Sha256.ROTR(17, x) ^ Sha256.ROTR(19, x) ^ (x>>>10); }
            Sha256.Ch = function(x, y, z)  { return (x & y) ^ (~x & z); }
            Sha256.Maj = function(x, y, z) { return (x & y) ^ (x & z) ^ (y & z); }
            
            //
            // hexadecimal representation of a number 
            //   (note toString(16) is implementation-dependant, and  
            //   in IE returns signed numbers when used on full words)
            //
            Sha256.toHexStr = function(n) {
              var s="", v;
              for (var i=7; i>=0; i--) { v = (n>>>(i*4)) & 0xf; s += v.toString(16); }
              return s;
            }
            
            
            /* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
            /*  Utf8 class: encode / decode between multi-byte Unicode characters and UTF-8 multiple          */
            /*              single-byte character encoding (c) Chris Veness 2002-2010                         */
            /* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
            
            var Utf8 = {};  // Utf8 namespace
            
            /**
             * Encode multi-byte Unicode string into utf-8 multiple single-byte characters 
             * (BMP / basic multilingual plane only)
             *
             * Chars in range U+0080 - U+07FF are encoded in 2 chars, U+0800 - U+FFFF in 3 chars
             *
             * @param {String} strUni Unicode string to be encoded as UTF-8
             * @returns {String} encoded string
             */
            Utf8.encode = function(strUni) {
              // use regular expressions & String.replace callback function for better efficiency 
              // than procedural approaches
              var strUtf = strUni.replace(
                  /[\u0080-\u07ff]/g,  // U+0080 - U+07FF => 2 bytes 110yyyyy, 10zzzzzz
                  function(c) { 
                    var cc = c.charCodeAt(0);
                    return String.fromCharCode(0xc0 | cc>>6, 0x80 | cc&0x3f); }
                );
              strUtf = strUtf.replace(
                  /[\u0800-\uffff]/g,  // U+0800 - U+FFFF => 3 bytes 1110xxxx, 10yyyyyy, 10zzzzzz
                  function(c) { 
                    var cc = c.charCodeAt(0); 
                    return String.fromCharCode(0xe0 | cc>>12, 0x80 | cc>>6&0x3F, 0x80 | cc&0x3f); }
                );
              return strUtf;
            }
            
            /**
             * Decode utf-8 encoded string back into multi-byte Unicode characters
             *
             * @param {String} strUtf UTF-8 string to be decoded back to Unicode
             * @returns {String} decoded string
             */
            Utf8.decode = function(strUtf) {
              // note: decode 3-byte chars first as decoded 2-byte strings could appear to be 3-byte char!
              var strUni = strUtf.replace(
                  /[\u00e0-\u00ef][\u0080-\u00bf][\u0080-\u00bf]/g,  // 3-byte chars
                  function(c) {  // (note parentheses for precence)
                    var cc = ((c.charCodeAt(0)&0x0f)<<12) | ((c.charCodeAt(1)&0x3f)<<6) | ( c.charCodeAt(2)&0x3f); 
                    return String.fromCharCode(cc); }
                );
              strUni = strUni.replace(
                  /[\u00c0-\u00df][\u0080-\u00bf]/g,                 // 2-byte chars
                  function(c) {  // (note parentheses for precence)
                    var cc = (c.charCodeAt(0)&0x1f)<<6 | c.charCodeAt(1)&0x3f;
                    return String.fromCharCode(cc); }
                );
              return strUni;
            }
            
            /* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

            utf8encode =  (typeof utf8encode == 'undefined') ? true : utf8encode;
            
            // convert string to UTF-8, as SHA only deals with byte-streams
            if (utf8encode) msg = Utf8.encode(msg);
            
            // constants [§4.2.2]
            var K = [0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
                     0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
                     0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
                     0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
                     0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
                     0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
                     0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
                     0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2];
            // initial hash value [§5.3.1]
            var H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];

            // PREPROCESSING 
         
            msg += String.fromCharCode(0x80);  // add trailing '1' bit (+ 0's padding) to string [§5.1.1]

            // convert string msg into 512-bit/16-integer blocks arrays of ints [§5.2.1]
            var l = msg.length/4 + 2;  // length (in 32-bit integers) of msg + 1 + appended length
            var N = Math.ceil(l/16);   // number of 16-integer-blocks required to hold 'l' ints
            var M = new Array(N);

            for (var i=0; i<N; i++) {
                M[i] = new Array(16);
                for (var j=0; j<16; j++) {  // encode 4 chars per integer, big-endian encoding
                    M[i][j] = (msg.charCodeAt(i*64+j*4)<<24) | (msg.charCodeAt(i*64+j*4+1)<<16) | 
                              (msg.charCodeAt(i*64+j*4+2)<<8) | (msg.charCodeAt(i*64+j*4+3));
                } // note running off the end of msg is ok 'cos bitwise ops on NaN return 0
            }
            // add length (in bits) into final pair of 32-bit integers (big-endian) [§5.1.1]
            // note: most significant word would be (len-1)*8 >>> 32, but since JS converts
            // bitwise-op args to 32 bits, we need to simulate this by arithmetic operators
            M[N-1][14] = ((msg.length-1)*8) / Math.pow(2, 32); M[N-1][14] = Math.floor(M[N-1][14])
            M[N-1][15] = ((msg.length-1)*8) & 0xffffffff;


            // HASH COMPUTATION [§6.1.2]

            var W = new Array(64); var a, b, c, d, e, f, g, h;
            for (var i=0; i<N; i++) {

                // 1 - prepare message schedule 'W'
                for (var t=0;  t<16; t++) W[t] = M[i][t];
                for (var t=16; t<64; t++) W[t] = (Sha256.sigma1(W[t-2]) + W[t-7] + Sha256.sigma0(W[t-15]) + W[t-16]) & 0xffffffff;

                // 2 - initialise working variables a, b, c, d, e, f, g, h with previous hash value
                a = H[0]; b = H[1]; c = H[2]; d = H[3]; e = H[4]; f = H[5]; g = H[6]; h = H[7];

                // 3 - main loop (note 'addition modulo 2^32')
                for (var t=0; t<64; t++) {
                    var T1 = h + Sha256.Sigma1(e) + Sha256.Ch(e, f, g) + K[t] + W[t];
                    var T2 = Sha256.Sigma0(a) + Sha256.Maj(a, b, c);
                    h = g;
                    g = f;
                    f = e;
                    e = (d + T1) & 0xffffffff;
                    d = c;
                    c = b;
                    b = a;
                    a = (T1 + T2) & 0xffffffff;
                }
                 // 4 - compute the new intermediate hash value (note 'addition modulo 2^32')
                H[0] = (H[0]+a) & 0xffffffff;
                H[1] = (H[1]+b) & 0xffffffff; 
                H[2] = (H[2]+c) & 0xffffffff; 
                H[3] = (H[3]+d) & 0xffffffff; 
                H[4] = (H[4]+e) & 0xffffffff;
                H[5] = (H[5]+f) & 0xffffffff;
                H[6] = (H[6]+g) & 0xffffffff; 
                H[7] = (H[7]+h) & 0xffffffff; 
            }

            return Sha256.toHexStr(H[0]) + Sha256.toHexStr(H[1]) + Sha256.toHexStr(H[2]) + Sha256.toHexStr(H[3]) + 
                   Sha256.toHexStr(H[4]) + Sha256.toHexStr(H[5]) + Sha256.toHexStr(H[6]) + Sha256.toHexStr(H[7]);
        }
    });

    // taken from the nodejs source
    _.format = (function(){
        var formatRegExp = /%[sdj%]/g;
        return(function(f) {
            if (!isString(f)) {
                var objects = [];
                for (var i = 0; i < arguments.length; i++) {
                    objects.push(inspect(arguments[i]));
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
                    str += ' ' + x;
                } else {
                    str += ' ' + inspect(x);
                }
            }
            return str;
        });

        /**
         * Echos the value of a value. Trys to print the value out
         * in the best way possible given the different types.
         *
         * @param {Object} obj The object to print out.
         * @param {Object} opts Optional options object that alters the output.
         */
        /* legacy: obj, showHidden, depth, colors*/
        function inspect(obj, opts) {
            // default options
            var ctx = {
                seen: [],
                stylize: stylizeNoColor
            };
            // legacy...
            if (arguments.length >= 3) ctx.depth = arguments[2];
            if (arguments.length >= 4) ctx.colors = arguments[3];
            if (isBoolean(opts)) {
                // legacy...
                ctx.showHidden = opts;
            } else if (opts) {
                // got an "options" object
                _extend(ctx, opts);
            }
            // set default options
            if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
            if (isUndefined(ctx.depth)) ctx.depth = 4;
            if (isUndefined(ctx.colors)) ctx.colors = false;
            if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
            if (ctx.colors) ctx.stylize = stylizeWithColor;
            return formatValue(ctx, obj, ctx.depth);
        }

        // http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
        inspect.colors = {
            'bold' : [1, 22],
            'italic' : [3, 23],
            'underline' : [4, 24],
            'inverse' : [7, 27],
            'white' : [37, 39],
            'grey' : [90, 39],
            'black' : [30, 39],
            'blue' : [34, 39],
            'cyan' : [36, 39],
            'green' : [32, 39],
            'magenta' : [35, 39],
            'red' : [31, 39],
            'yellow' : [33, 39]
        };

        // Don't use 'blue' not visible on cmd.exe
        inspect.styles = {
            'special': 'cyan',
            'number': 'yellow',
            'boolean': 'yellow',
            'undefined': 'grey',
            'null': 'bold',
            'string': 'green',
            'date': 'magenta',
            // "name": intentionally not styling
            'regexp': 'red'
        };


        function stylizeWithColor(str, styleType) {
            var style = inspect.styles[styleType];

            if (style) {
                return '\u001b[' + inspect.colors[style][0] + 'm' + str +
                    '\u001b[' + inspect.colors[style][1] + 'm';
            } else {
                return str;
            }
        }


        function stylizeNoColor(str, styleType) {
            return str;
        }


        function arrayToHash(array) {
            var hash = {};

            array.forEach(function(val, idx) {
                hash[val] = true;
            });

            return hash;
        }


        function formatValue(ctx, value, recurseTimes) {
            // Provide a hook for user-specified inspect functions.
            // Check that value is an object with an inspect function on it
            if (ctx.customInspect &&
                    value &&
                    isFunction(value.inspect) &&
                    // Filter out the util module, it's inspect function is special
                    value.inspect !== exports.inspect &&
                    // Also filter out any prototype objects using the circular check.
                    !(value.constructor && value.constructor.prototype === value)) {
                        var ret = value.inspect(recurseTimes, ctx);
                        if (!isString(ret)) {
                            ret = formatValue(ctx, ret, recurseTimes);
                        }
                        return ret;
                    }

            // Primitive types cannot have properties
            var primitive = formatPrimitive(ctx, value);
            if (primitive) {
                return primitive;
            }

            // Look up the keys of the object.
            var keys = Object.keys(value);
            var visibleKeys = arrayToHash(keys);

            if (ctx.showHidden) {
                keys = Object.getOwnPropertyNames(value);
            }

            // This could be a boxed primitive (new String(), etc.), check valueOf()
            // NOTE: Avoid calling `valueOf` on `Date` instance because it will return
            // a number which, when object has some additional user-stored `keys`,
            // will be printed out.
            var formatted;
            var raw = value;
            try {
                // the .valueOf() call can fail for a multitude of reasons
                if (!isDate(value))
                    raw = value.valueOf();
            } catch (e) {
                // ignore...
            }

            if (isString(raw)) {
                // for boxed Strings, we have to remove the 0-n indexed entries,
                // since they just noisey up the output and are redundant
                keys = keys.filter(function(key) {
                    return !(key >= 0 && key < raw.length);
                });
            }

            // Some type of object without properties can be shortcutted.
            if (keys.length === 0) {
                if (isFunction(value)) {
                    var name = value.name ? ': ' + value.name : '';
                    return ctx.stylize('[Function' + name + ']', 'special');
                }
                if (isRegExp(value)) {
                    return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
                }
                if (isDate(value)) {
                    return ctx.stylize(Date.prototype.toString.call(value), 'date');
                }
                if (isError(value)) {
                    return formatError(value);
                }
                // now check the `raw` value to handle boxed primitives
                if (isString(raw)) {
                    formatted = formatPrimitiveNoColor(ctx, raw);
                    return ctx.stylize('[String: ' + formatted + ']', 'string');
                }
                if (isNumber(raw)) {
                    formatted = formatPrimitiveNoColor(ctx, raw);
                    return ctx.stylize('[Number: ' + formatted + ']', 'number');
                }
                if (isBoolean(raw)) {
                    formatted = formatPrimitiveNoColor(ctx, raw);
                    return ctx.stylize('[Boolean: ' + formatted + ']', 'boolean');
                }
            }

            var base = '', array = false, braces = ['{', '}'];

            // Make Array say that they are Array
            if (isArray(value)) {
                array = true;
                braces = ['[', ']'];
            }

            // Make functions say that they are functions
            if (isFunction(value)) {
                var n = value.name ? ': ' + value.name : '';
                base = ' [Function' + n + ']';
            }

            // Make RegExps say that they are RegExps
            if (isRegExp(value)) {
                base = ' ' + RegExp.prototype.toString.call(value);
            }

            // Make dates with properties first say the date
            if (isDate(value)) {
                base = ' ' + Date.prototype.toUTCString.call(value);
            }

            // Make error with message first say the error
            if (isError(value)) {
                base = ' ' + formatError(value);
            }

            // Make boxed primitive Strings look like such
            if (isString(raw)) {
                formatted = formatPrimitiveNoColor(ctx, raw);
                base = ' ' + '[String: ' + formatted + ']';
            }

            // Make boxed primitive Numbers look like such
            if (isNumber(raw)) {
                formatted = formatPrimitiveNoColor(ctx, raw);
                base = ' ' + '[Number: ' + formatted + ']';
            }

            // Make boxed primitive Booleans look like such
            if (isBoolean(raw)) {
                formatted = formatPrimitiveNoColor(ctx, raw);
                base = ' ' + '[Boolean: ' + formatted + ']';
            }

            if (keys.length === 0 && (!array || value.length == 0)) {
                return braces[0] + base + braces[1];
            }

            if (recurseTimes < 0) {
                if (isRegExp(value)) {
                    return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
                } else {
                    return ctx.stylize('[Object]', 'special');
                }
            }

            ctx.seen.push(value);

            var output;
            if (array) {
                output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
            } else {
                output = keys.map(function(key) {
                    return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
                });
            }

            ctx.seen.pop();

            return reduceToSingleString(output, base, braces);
        }


        function formatPrimitive(ctx, value) {
            if (isUndefined(value))
                return ctx.stylize('undefined', 'undefined');
            if (isString(value)) {
                var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                    .replace(/'/g, "\\'")
                    .replace(/\\"/g, '"') + '\'';
                return ctx.stylize(simple, 'string');
            }
            if (isNumber(value)) {
                // Format -0 as '-0'. Strict equality won't distinguish 0 from -0,
                // so instead we use the fact that 1 / -0 < 0 whereas 1 / 0 > 0 .
                if (value === 0 && 1 / value < 0)
                    return ctx.stylize('-0', 'number');
                return ctx.stylize('' + value, 'number');
            }
            if (isBoolean(value))
                return ctx.stylize('' + value, 'boolean');
            // For some reason typeof null is "object", so special case here.
            if (isNull(value))
                return ctx.stylize('null', 'null');
        }


        function formatPrimitiveNoColor(ctx, value) {
            var stylize = ctx.stylize;
            ctx.stylize = stylizeNoColor;
            var str = formatPrimitive(ctx, value);
            ctx.stylize = stylize;
            return str;
        }


        function formatError(value) {
            return '[' + Error.prototype.toString.call(value) + ']';
        }


        function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
            var output = [];
            for (var i = 0, l = value.length; i < l; ++i) {
                if (hasOwnProperty(value, String(i))) {
                    output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
                                String(i), true));
                } else {
                    output.push('');
                }
            }
            keys.forEach(function(key) {
                if (!key.match(/^\d+$/)) {
                    output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
                            key, true));
                }
            });
            return output;
        }


        function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
            var name, str, desc;
            desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
            if (desc.get) {
                if (desc.set) {
                    str = ctx.stylize('[Getter/Setter]', 'special');
                } else {
                    str = ctx.stylize('[Getter]', 'special');
                }
            } else {
                if (desc.set) {
                    str = ctx.stylize('[Setter]', 'special');
                }
            }
            if (!hasOwnProperty(visibleKeys, key)) {
                name = '[' + key + ']';
            }
            if (!str) {
                if (ctx.seen.indexOf(desc.value) < 0) {
                    if (isNull(recurseTimes)) {
                        str = formatValue(ctx, desc.value, null);
                    } else {
                        str = formatValue(ctx, desc.value, recurseTimes - 1);
                    }
                    if (str.indexOf('\n') > -1) {
                        if (array) {
                            str = str.split('\n').map(function(line) {
                                return '  ' + line;
                            }).join('\n').substr(2);
                        } else {
                            str = '\n' + str.split('\n').map(function(line) {
                                return '   ' + line;
                            }).join('\n');
                        }
                    }
                } else {
                    str = ctx.stylize('[Circular]', 'special');
                }
            }
            if (isUndefined(name)) {
                if (array && key.match(/^\d+$/)) {
                    return str;
                }
                name = JSON.stringify('' + key);
                if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
                    name = name.substr(1, name.length - 2);
                    name = ctx.stylize(name, 'name');
                } else {
                    name = name.replace(/'/g, "\\'")
                        .replace(/\\"/g, '"')
                        .replace(/(^"|"$)/g, "'")
                        .replace(/\\\\/g, '\\');
                    name = ctx.stylize(name, 'string');
                }
            }

            return name + ': ' + str;
        }


        function reduceToSingleString(output, base, braces) {
            var length = output.reduce(function(prev, cur) {
                return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
            }, 0);

            if (length > 60) {
                return braces[0] +
                    (base === '' ? '' : base + '\n ') +
                    ' ' +
                    output.join(',\n  ') +
                    ' ' +
                    braces[1];
            }

            return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
        }


        // NOTE: These type checking functions intentionally don't use `instanceof`
        // because it is fragile and can be easily faked with `Object.create()`.
        function isArray(ar) {
            return Array.isArray(ar);
        }

        function isBoolean(arg) {
            return typeof arg === 'boolean';
        }

        function isNull(arg) {
            return arg === null;
        }

        function isNullOrUndefined(arg) {
            return arg == null;
        }

        function isNumber(arg) {
            return typeof arg === 'number';
        }

        function isString(arg) {
            return typeof arg === 'string';
        }

        function isSymbol(arg) {
            return typeof arg === 'symbol';
        }

        function isUndefined(arg) {
            return arg === void 0;
        }

        function isRegExp(re) {
            return isObject(re) && objectToString(re) === '[object RegExp]';
        }

        function isObject(arg) {
            return typeof arg === 'object' && arg !== null;
        }

        function isDate(d) {
            return isObject(d) && objectToString(d) === '[object Date]';
        }

        function isError(e) {
            return isObject(e) &&
                (objectToString(e) === '[object Error]' || e instanceof Error);
        }

        function isFunction(arg) {
            return typeof arg === 'function';
        }

        function isPrimitive(arg) {
            return arg === null ||
                typeof arg === 'boolean' ||
                typeof arg === 'number' ||
                typeof arg === 'string' ||
                typeof arg === 'symbol' ||  // ES6 symbol
                typeof arg === 'undefined';
        }

        function isBuffer(arg) {
            return arg instanceof Buffer;
        }

        function objectToString(o) {
            return Object.prototype.toString.call(o);
        }


        function pad(n) {
            return n < 10 ? '0' + n.toString(10) : n.toString(10);
        }


        var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
            'Oct', 'Nov', 'Dec'];

        // 26 Feb 16:19:34
        function timestamp() {
            var d = new Date();
            var time = [pad(d.getHours()),
                pad(d.getMinutes()),
                pad(d.getSeconds())].join(':');
            return [d.getDate(), months[d.getMonth()], time].join(' ');
        }


        // log is just a thin wrapper to console.log that prepends a timestamp
        /*
        exports.log = function() {
            console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
        };
        */

        var _extend = function(origin, add) {
            // Don't do anything if add isn't an object
            if (!add || !isObject(add)) return origin;

            var keys = Object.keys(add);
            var i = keys.length;
            while (i--) {
                origin[keys[i]] = add[keys[i]];
            }
            return origin;
        };

        function hasOwnProperty(obj, prop) {
            return Object.prototype.hasOwnProperty.call(obj, prop);
        }

    })();
};

















