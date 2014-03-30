

exports.mixin = function(_){

    var html = {};

    function replaceEscapes(str){
        if(_.isString(str)){
            str = str.replace(/&quot;/gi, "___qt___");
            str = str.replace(/&lt;/gi, "___lt___");
            str = str.replace(/&gt;/gi, "___gt___");
            str = str.replace(/&amp;/gi, "___amp___");
            str = str.replace(/&nbsp;/gi, "___nbsp___");
        }
        return(str);
    }

    function unreplaceEscapes(str){
        if(_.isString(str)){
            str = str.replace(/___qt___/gi, "&quot;");
            str = str.replace(/___lt___/gi, "&lt;");
            str = str.replace(/___gt___/gi, "&gt;");
            str = str.replace(/___amp___/gi, "&amp;");
            str = str.replace(/___nbsp___/gi, "&nbsp;");
        }
        return(str);
    }

    html.escape = function(str){
        if(_.isString(str)){
            str = replaceEscapes(str);
            str = str.replace(/&/gi, "&amp;");
            str = str.replace(/"/gi, "&quot;");
            str = str.replace(/</gi, "&lt;");
            str = str.replace(/>/gi, "&gt;");
            str = unreplaceEscapes(str);
        }
        return(str);
    };

    html.unescape = function(str){
        if(_.isString(str)){
            str = str.replace(/&quot;/gi, "\"");
            str = str.replace(/&lt;/gi, "<");
            str = str.replace(/&gt;/gi, ">");
            str = str.replace(/&amp;/gi, "&");
        }
        return(str);
    };

    html.removeNbsp = function(buffer){
        if(_.isString(buffer)){ buffer = buffer.replace(/&nbsp;/gi, " "); }
        return(buffer);
    };

    html.parseStyleAttribute = function(attr){
        
        attr = _.trim(attr);
        var split = attr.split(";");
        var parsed = {};

        _.each(split, function(val){
            if(val !== ""){
                var cssSplit = val.split(':');
                parsed[_.trim(cssSplit[0])] = _.trim(cssSplit[1]);
            }
        });

        return(parsed);
    };

    html.strip = function(str){

        var text = "";

        str = html.toXml(str);
        str = replaceEscapes(str);
        str = html.unescape(str);

        html.parser(str, {
            start: function( tag, attrs, unary ) { },
            end: function( tag ) { },
            chars: function( chars ) {
                text += " " +  _.trim(html.escape(chars));
            },
            comment: function( chars ) {}
        });

        text = unreplaceEscapes(text);
        text = _.trim(text);
        return(text);
    };

    html.textHook = function(str, len, elements){
        len = len || 140;
        elements = elements || {};

        var result = "";
        var hitElement = false;
        var hitText = false;

        str = html.toXml(str);
        str = replaceEscapes(str);
        str = html.unescape(str);

        html.parser(str, {
            start: function(tag, attrs, unary ) { 
                tag = tag.toLowerCase();
                if(elements[tag] && !hitElement){
                    result += '<' + tag;
                    for(var i = 0; i < attrs.length; i++){ result += " " + attrs[i].name.toLowerCase() + "=\"" + attrs[i].value + "\""; }
                    result += '>';
                }else{ result += " "; }
            },
            end: function(tag) {
                tag = tag.toLowerCase();
                if(elements[tag] && !hitElement){ hitElement = true; result += '</' + tag + '>'; }
            },
            chars: function(text) {
                if(!hitText){
                    hitText = true;
                    text = html.escape(text);
                    if(text.length < len){ result += text; }
                    else{ result += text.substr(0, len) + "..."; }
                }
            },
            comment: function(text) {}
        });

        result = unreplaceEscapes(result);
        return(result);
    };

    html.style = function(str, elements){

        function runStyle(str){

            var result = "";

            function start(tag, attrs) {
                tag = tag.toLowerCase();
                result += '<' + tag;

                var addedStyle = false;
                _.each(attrs, function(attr, i){
                    if(attr.name.toLowerCase() === 'style' && elements[tag]){ 
                        addedStyle = true;
                        attr.value += " " + elements[tag];
                    }
                    result += " " + attr.name + "=\"" + attr.value + "\"";
                });

                if(!addedStyle && elements[tag]){
                    result += " style=\"" + elements[tag] + "\"";
                }

                result += '>';
            }

            function end(tag) {
                tag = tag.toLowerCase();
                result += '</' + tag + '>';
            }

            function chars(text) { 
                result += html.escape(text);
            }

            html.parseXml(str, {
                startElement: start,
                endElement: end,
                characters: chars, 
                comment: function(text) { result += text; }
            });

            return(result);
        }
        
        str = replaceEscapes(str);
        str = html.unescape(str);

        str = runStyle(str);

        str = html.toXml(str);        

        str = unreplaceEscapes(str);

        return(str);
    };

    html.secure = function(str, whitelist, escapeBlackListedTags){

        function runSecure(str){

            var result = "";

            function start(tag, attrs) {
                tag = tag.toLowerCase();

                if(!whitelist[tag]){
                    if(escapeBlackListedTags){ result += html.escape('<' + tag + '>'); }
                    return; 
                }

                result += '<' + tag;

                _.each(attrs, function(attr, i){
                    attr.name = attr.name.toLowerCase();
                    var whiteAttr = whitelist[tag].attrs[attr.name];

                    if(attr.name === 'style' && _.isObject(whiteAttr)){
                        var styleParsed = html.parseStyleAttribute(attr.value);
                        var safeStyle = 'style="';

                        _.each(styleParsed, function(val, key){
                            key = key.toLowerCase();
                            if(!whiteAttr[key]){ return; }

                            if(_.isBoolean(whiteAttr[key])){
                                if(whiteAttr[key]){ safeStyle += key + ":" + val + ";"; }
                            }else if(_.isString(whiteAttr[key])){
                                if(val === whiteAttr[key]){ 
                                    safeStyle += key + ":" + val + ";";
                                }
                            }else if(_.isArray(whiteAttr[key])){
                                if(_.contains(whiteAttr[key], val)){
                                    safeStyle += key + ":" + val + ";";
                                }
                            }
                        });

                        safeStyle += '"';

                        result += " " + safeStyle;
                    }else if(whiteAttr && _.isBoolean(whiteAttr)){
                        result += " " + attr.name + "=\"" + attr.value + "\"";
                    }else if(whiteAttr && _.isObject(whiteAttr) === 'object'){
                        if(whiteAttr[attr.value]){
                            result += " " + attr.name + "=\"" + attr.value + "\"";
                        }
                    }
                });

                result += '>';
            }

            function end( tag ) {
                tag = tag.toLowerCase();

                if(whitelist[tag.toLowerCase()]){
                    result += '</' + tag + '>';
                }else if(escapeBlackListedTags){
                    result += html.escape('</' + tag + '>');
                }
            }

            function chars( text ) {
                result += html.escape(text);
            }

            html.parseXml(str, {
                startElement: start,
                endElement: end,
                characters: chars, 
                comment: function( text ) {/*result += text;*/}
            });

            return(result);
        }
        
        str = replaceEscapes(str);
        str = html.unescape(str);

        str = runSecure(str);

        str = html.toXml(str);        

        str = unreplaceEscapes(str);

        return(str);   
    };
        
    html.secure.user = function(str, escapeBlackListedTags){

        var whitelist = {
            //'div' : {attrs: { 'style' : {"text-align" : ["center", "left", "right", "justify"] } } },
            'span' : {attrs: { 'style' : {"text-decoration" : "underline"} } },
            'img' : {attrs : { 'src' : true } },
            'video' : {attrs : { 'youtubeid' : true } },
            'b' : {attrs : {}},
            'i' : {attrs : {}},
            'strong' : {attrs : {}},
            'em' : {attrs : {}},
            'br' : {attrs : {}},
            'ul' : {attrs : {}},
            'ol' : {attrs : {}},
            'li' : {attrs : {}},
            //'p' : {attrs : {}}
            /* 'a' : {attrs : { 'href' : true}} */
        };

        return(html.secure(str, whitelist, escapeBlackListedTags));
    };
 
    html.secure.admin = function(str, escapeBlackListedTags){

        var whitelist = {
            //'div' : {attrs: { 'style' : {"text-align" : ["center", "left", "right", "justify"] } } },
            'section' : {attrs: { "class" : true } },
            'span' : {attrs: { 'style' : {"text-decoration" : "underline", "font-size" : true } } },
            'b' : {attrs : {}},
            'i' : {attrs : {}},
            'strong' : {attrs: { 'style' : {"text-decoration" : "underline", "font-size" : true } } },
            'em' : {attrs : {}},
            'br' : {attrs : {}},
            'ul' : {attrs : {}},
            'ol' : {attrs : {}},
            'li' : {attrs : {}},
            //'p' : {attrs : {}},
            'img' : {attrs : { 'style' : { "width" : true, "height" : true, "display" : "block"}, 'align' : true, 'src' : true, 'alt' : true, 'title' : true } },
            'video' : {attrs : { 'youtubeid' : true } },
            'a' : {attrs : { 'href' : true, 'target' : {"_blank" : true } }} 
        };

        return(html.secure(str, whitelist, escapeBlackListedTags));
    };

    html.toXml = function(str) {
        var results = "";

        html.parser(str, {
            start: function( tag, attrs, unary ) {
                results += "<" + tag;

                for ( var i = 0; i < attrs.length; i++ ){
                    results += " " + attrs[i].name + '="' + attrs[i].escaped + '"';
                }

                results += (unary ? "/" : "") + ">";
            },
            end: function( tag ) {
                results += "</" + tag + ">";
            },
            chars: function( text ) {
                results += text;
            },
            comment: function( text ) {
                results += "<!--" + text + "-->";
            }
        });

        return results;
    };


    html.parser = (function(){
        // Regular Expressions for parsing tags and attributes
	var startTag = /^<([-A-Za-z0-9_]+)((?:\s+[a-zA-Z_:][-a-zA-Z0-9_:.]+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)>/;
	var endTag = /^<\/([-A-Za-z0-9_]+)[^>]*>/;
	var attr = /([a-zA-Z_:][-a-zA-Z0-9_:.]+)(?:\s*=\s*(?:(?:"((?:\\.|[^"])*)")|(?:'((?:\\.|[^'])*)')|([^>\s]+)))?/g;

	// Empty Elements - HTML 5
	var empty = makeMap("area,base,basefont,br,col,frame,hr,img,input,isindex,link,meta,param,embed");

	// Block Elements - HTML 5
	var block = makeMap("address,article,applet,aside,audio,blockquote,button,canvas,center,dd,del,dir,div,dl,dt,fieldset,figcaption,figure,footer,form,frameset,h1,h2,h3,h4,h5,h6,header,hgroup,hr,iframe,ins,isindex,li,map,menu,noframes,noscript,object,ol,output,p,pre,section,script,table,tbody,td,tfoot,th,thead,tr,ul,video");

	// Inline Elements - HTML 5
	var inline = makeMap("a,abbr,acronym,applet,b,basefont,bdo,big,br,button,cite,code,del,dfn,em,font,i,iframe,img,input,ins,kbd,label,map,object,q,s,samp,script,select,small,span,strike,strong,sub,sup,textarea,tt,u,var");

	// Elements that you can, intentionally, leave open
	// (and which close themselves)
	var closeSelf = makeMap("colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr");

	// Attributes that have their values filled in disabled="disabled"
	var fillAttrs = makeMap("checked,compact,declare,defer,disabled,ismap,multiple,nohref,noresize,noshade,nowrap,readonly,selected");

	// Special Elements (can contain anything)
	var special = makeMap("script,style");

        var parser = function (html, handler) {
            var index, chars, match, stack = [], last = html;
            stack.last = function () {
                return this[this.length - 1];
            };

            while (html) {
                chars = true;

                // Make sure we're not in a script or style element
                if (!stack.last() || !special[stack.last()]) {

                    // Comment
                    if (html.indexOf("<!--") == 0) {
                        index = html.indexOf("-->");

                        if (index >= 0) {
                            if (handler.comment){
                                handler.comment(html.substring(4, index));
                            }
                            html = html.substring(index + 3);
                            chars = false;
                        }

                        // end tag
                    } else if (html.indexOf("</") == 0) {
                        match = html.match(endTag);

                        if (match) {
                            html = html.substring(match[0].length);
                            match[0].replace(endTag, parseEndTag);
                            chars = false;
                        }

                        // start tag
                    } else if (html.indexOf("<") == 0) {
                        match = html.match(startTag);

                        if (match) {
                            html = html.substring(match[0].length);
                            match[0].replace(startTag, parseStartTag);
                            chars = false;
                        }
                    }

                    if (chars) {
                        index = html.indexOf("<");

                        var text = index < 0 ? html : html.substring(0, index);
                        html = index < 0 ? "" : html.substring(index);

                        if (handler.chars){
                            handler.chars(text);
                        }
                    }

                } else {
                    html = html.replace(new RegExp("([\\s\\S]*?)<\/" + stack.last() + "[^>]*>"), function (all, text) {
                        text = text.replace(/<!--([\s\S]*?)-->|<!\[CDATA\[([\s\S]*?)]]>/g, "$1$2");
                        if (handler.chars){
                            handler.chars(text);
                        }

                        return "";
                    });

                    parseEndTag("", stack.last());
                }

                if (html == last){
                    throw({code: "parseError", message: "parse error: " + html });
                }
                last = html;
            }

            // Clean up any remaining tags
            parseEndTag();

            function parseStartTag(tag, tagName, rest, unary) {
                tagName = tagName.toLowerCase();

                if (block[tagName]) {
                    while (stack.last() && inline[stack.last()]) {
                        parseEndTag("", stack.last());
                    }
                }

                if (closeSelf[tagName] && stack.last() == tagName) {
                    parseEndTag("", tagName);
                }

                unary = empty[tagName] || !!unary;

                if (!unary){
                    stack.push(tagName);
                }

                if (handler.start) {
                    var attrs = [];

                    rest.replace(attr, function (match, name) {
                        var value = arguments[2] ? arguments[2] :
                        arguments[3] ? arguments[3] :
                        arguments[4] ? arguments[4] :
                        fillAttrs[name] ? name : "";

                    attrs.push({
                        name: name,
                        value: value,
                        escaped: value.replace(/(^|[^\\])"/g, '$1\\\"') //"
                            });
                        });

                    if (handler.start){
                        handler.start(tagName, attrs, unary);
                    }
                }
            }

            function parseEndTag(tag, tagName) {
                // If no tag name is provided, clean shop
                if (!tagName){
                    var pos = 0;

                    // Find the closest opened tag of the same type
                }else{
                    for (var pos = stack.length - 1; pos >= 0; pos--){
                        if (stack[pos] == tagName){
                            break;
                        }
                    }
                }

                if (pos >= 0) {
                    // Close all the open elements, up the stack
                    for (var i = stack.length - 1; i >= pos; i--){
                        if (handler.end){
                            handler.end(stack[i]);
                        }
                    }

                    // Remove the open elements from the stack
                    stack.length = pos;
                }
            }
        };
 
        function makeMap(str){
            var obj = {}, items = str.split(",");
            for ( var i = 0; i < items.length; i++ )
                obj[ items[i] ] = true;
            return obj;
        }


        return(parser);

    })();

    html.parseXml = (function(){

        function xmlParser() { }

        xmlParser.prototype = {

            handler:	null,

            // regexps

            startTagRe:	/^<([^>\s\/]+)((\s+[^=>\s]+(\s*=\s*((\"[^"]*\")|(\'[^']*\')|[^>\s]+))?)*)\s*\/?\s*>/m,
            endTagRe:	/^<\/([^>\s]+)[^>]*>/m,
            attrRe:		/([^=\s]+)(\s*=\s*((\"([^"]*)\")|(\'([^']*)\')|[^>\s]+))?/gm,

            parse: function (s, oHandler)
            {
                if (oHandler){
                    this.contentHandler = oHandler;
                }

                var i = 0;
                var res, lc, lm, rc, index;
                var treatAsChars = false;
                var oThis = this;
                while (s.length > 0)
                {
                    // Comment
                    if (s.substring(0, 4) == "<!--")
                    {
                        index = s.indexOf("-->");
                        if (index != -1)
                        {
                            this.contentHandler.comment(s.substring(4, index));
                            s = s.substring(index + 3);
                            treatAsChars = false;
                        }
                        else
                        {
                            treatAsChars = true;
                        }
                    }

                    // end tag
                    else if (s.substring(0, 2) == "</")
                    {
                        if (this.endTagRe.test(s))
                        {
                            lc = RegExp.leftContext;
                            lm = RegExp.lastMatch;
                            rc = RegExp.rightContext;

                            lm.replace(this.endTagRe, function (){
                                return oThis.parseEndTag.apply(oThis, arguments);
                            });

                            s = rc;
                            treatAsChars = false;
                        }
                        else
                        {
                            treatAsChars = true;
                        }
                    }
                    // start tag
                    else if (s.charAt(0) == "<")
                    {
                        if (this.startTagRe.test(s))
                        {
                            lc = RegExp.leftContext;
                            lm = RegExp.lastMatch;
                            rc = RegExp.rightContext;

                            lm.replace(this.startTagRe, function (){
                                return oThis.parseStartTag.apply(oThis, arguments);
                            });

                            s = rc;
                            treatAsChars = false;
                        }
                        else
                        {
                            treatAsChars = true;
                        }
                    }

                    if (treatAsChars)
                    {
                        index = s.indexOf("<");
                        if (index == -1)
                        {
                            this.contentHandler.characters(s);
                            s = "";
                        }
                        else
                        {
                            this.contentHandler.characters(s.substring(0, index));
                            s = s.substring(index);
                        }
                    }

                    treatAsChars = true;
                }
            },

            parseStartTag:	function (sTag, sTagName, sRest)
            {
                var attrs = this.parseAttributes(sTagName, sRest);
                this.contentHandler.startElement(sTagName, attrs);
            },

            parseEndTag:	function (sTag, sTagName)
            {
                this.contentHandler.endElement(sTagName);
            },

            parseAttributes:	function (sTagName, s)
            {
                var oThis = this;
                var attrs = [];
                s.replace(this.attrRe, function (a0, a1, a2, a3, a4, a5, a6) {
                    attrs.push(oThis.parseAttribute(sTagName, a0, a1, a2, a3, a4, a5, a6));
                });
                return attrs;
            },

            parseAttribute: function (sTagName, sAttribute, sName)
            {
                var value = "";
                if (arguments[7])
                    value = arguments[8];
                else if (arguments[5])
                    value = arguments[6];
                else if (arguments[3])
                    value = arguments[4];

                var empty = !value && !arguments[3];
                return {name: sName, value: empty ? null : value};
            }
        };
        var parser = new xmlParser();
        // bind parse, hide object
        var f = function(){ return(parser.parse.apply(parser, arguments)); }
        return(f);
    })();

    return(html);
};

