var tame = require('tamejs').runtime;
var __tame_defer_cb = null;
var __tame_fn_0 = function (__tame_k) {
    tame.setActiveCb (__tame_defer_cb);
    var _ = require ( '../' ) ;
    var eq = _ . test . eq ;
    var ok = _ . test . ok ;
    
    exports . testTame =
    function  (beforeExit) {
        var __tame_defer_cb = tame.findDeferCb ([beforeExit]);
        tame.setActiveCb (__tame_defer_cb);
        var __tame_this = this;
        var __tame_arguments = arguments;
        var __tame_fn_11 = function (__tame_k) {
            tame.setActiveCb (__tame_defer_cb);
            var called = 0 ;
            var __tame_fn_1 = function (__tame_k) {
                tame.setActiveCb (__tame_defer_cb);
                var __tame_fn_2 = function (__tame_k) {
                    tame.setActiveCb (__tame_defer_cb);
                    var __tame_defers = new tame.Deferrals (__tame_k);
                    var __tame_fn_3 = function (__tame_k) {
                        tame.setActiveCb (__tame_defer_cb);
                        _ . each ( [ 1 , 2 , 3 ] ,
                        function  () {
                            (
                            function  (cb) {
                                var __tame_defer_cb = tame.findDeferCb ([cb]);
                                tame.setActiveCb (__tame_defer_cb);
                                var __tame_this = this;
                                var __tame_arguments = arguments;
                                var __tame_fn_4 = function (__tame_k) {
                                    tame.setActiveCb (__tame_defer_cb);
                                    var __tame_fn_5 = function (__tame_k) {
                                        tame.setActiveCb (__tame_defer_cb);
                                        var __tame_defers = new tame.Deferrals (__tame_k);
                                        var __tame_fn_6 = function (__tame_k) {
                                            tame.setActiveCb (__tame_defer_cb);
                                            setTimeout (
                                            __tame_defers.defer ( { 
                                                parent_cb : __tame_defer_cb,
                                                line : 12,
                                                file : "./test/async.test.tjs"
                                            } )
                                            , 10 ) ;
                                            tame.callChain([__tame_k]);
                                            tame.setActiveCb (null);
                                        };
                                        __tame_fn_6(tame.end);
                                        __tame_defers._fulfill();
                                        tame.setActiveCb (null);
                                    };
                                    var __tame_fn_7 = function (__tame_k) {
                                        tame.setActiveCb (__tame_defer_cb);
                                        called ++ ;
                                        cb ( ) ;
                                        tame.callChain([__tame_k]);
                                        tame.setActiveCb (null);
                                    };
                                    tame.callChain([__tame_fn_5, __tame_fn_7, __tame_k]);
                                    tame.setActiveCb (null);
                                };
                                tame.callChain([__tame_fn_4, __tame_k]);
                                tame.setActiveCb (null);
                            }
                            ) (
                            __tame_defers.defer ( { 
                                parent_cb : __tame_defer_cb,
                                line : 15,
                                file : "./test/async.test.tjs"
                            } )
                            ) ;
                        }
                        ) ;
                        tame.callChain([__tame_k]);
                        tame.setActiveCb (null);
                    };
                    __tame_fn_3(tame.end);
                    __tame_defers._fulfill();
                    tame.setActiveCb (null);
                };
                var __tame_fn_8 = function (__tame_k) {
                    tame.setActiveCb (__tame_defer_cb);
                    var __tame_defers = new tame.Deferrals (__tame_k);
                    var __tame_fn_9 = function (__tame_k) {
                        tame.setActiveCb (__tame_defer_cb);
                        _ . each ( [ 1 , 2 , 3 ] ,
                        function  () {
                            setTimeout (
                            __tame_defers.defer ( { 
                                parent_cb : __tame_defer_cb,
                                line : 21,
                                file : "./test/async.test.tjs"
                            } )
                            , 10 ) ;
                            called ++ ;
                        }
                        ) ;
                        tame.callChain([__tame_k]);
                        tame.setActiveCb (null);
                    };
                    __tame_fn_9(tame.end);
                    __tame_defers._fulfill();
                    tame.setActiveCb (null);
                };
                var __tame_fn_10 = function (__tame_k) {
                    tame.setActiveCb (__tame_defer_cb);
                    beforeExit (
                    function  () {
                        eq ( called , 6 ) ;
                    }
                    ) ;
                    tame.callChain([__tame_k]);
                    tame.setActiveCb (null);
                };
                tame.callChain([__tame_fn_2, __tame_fn_8, __tame_fn_10, __tame_k]);
                tame.setActiveCb (null);
            };
            tame.callChain([__tame_fn_1, __tame_k]);
            tame.setActiveCb (null);
        };
        tame.callChain([__tame_fn_11, __tame_k]);
        tame.setActiveCb (null);
    }
    ;
    
    exports . testFilterAsyncTame =
    function  (beforeExit) {
        var __tame_defer_cb = tame.findDeferCb ([beforeExit]);
        tame.setActiveCb (__tame_defer_cb);
        var __tame_this = this;
        var __tame_arguments = arguments;
        var __tame_fn_20 = function (__tame_k) {
            tame.setActiveCb (__tame_defer_cb);
            var called = 0 ;
            
            var a = [ 1 , 2 , 3 , 4 , 5 , 6 ] ;
            var __tame_fn_12 = function (__tame_k) {
                tame.setActiveCb (__tame_defer_cb);
                var result;
                var __tame_fn_13 = function (__tame_k) {
                    tame.setActiveCb (__tame_defer_cb);
                    var __tame_defers = new tame.Deferrals (__tame_k);
                    var __tame_fn_14 = function (__tame_k) {
                        tame.setActiveCb (__tame_defer_cb);
                        _ . filter . async ( a ,
                        function  (val, i, next) {
                            var __tame_defer_cb = tame.findDeferCb ([val, i, next]);
                            tame.setActiveCb (__tame_defer_cb);
                            var __tame_this = this;
                            var __tame_arguments = arguments;
                            var __tame_fn_15 = function (__tame_k) {
                                tame.setActiveCb (__tame_defer_cb);
                                var __tame_fn_16 = function (__tame_k) {
                                    tame.setActiveCb (__tame_defer_cb);
                                    var __tame_defers = new tame.Deferrals (__tame_k);
                                    var __tame_fn_17 = function (__tame_k) {
                                        tame.setActiveCb (__tame_defer_cb);
                                        _ . nextTick (
                                        __tame_defers.defer ( { 
                                            parent_cb : __tame_defer_cb,
                                            line : 37,
                                            file : "./test/async.test.tjs"
                                        } )
                                        ) ;
                                        tame.callChain([__tame_k]);
                                        tame.setActiveCb (null);
                                    };
                                    __tame_fn_17(tame.end);
                                    __tame_defers._fulfill();
                                    tame.setActiveCb (null);
                                };
                                var __tame_fn_18 = function (__tame_k) {
                                    tame.setActiveCb (__tame_defer_cb);
                                    next ( val < 4 ) ;
                                    called ++ ;
                                    tame.callChain([__tame_k]);
                                    tame.setActiveCb (null);
                                };
                                tame.callChain([__tame_fn_16, __tame_fn_18, __tame_k]);
                                tame.setActiveCb (null);
                            };
                            tame.callChain([__tame_fn_15, __tame_k]);
                            tame.setActiveCb (null);
                        }
                        ,
                        __tame_defers.defer ( { 
                            assign_fn : 
                                function () {
                                    result = arguments[0];
                                }
                                ,
                            parent_cb : __tame_defer_cb,
                            line : 40,
                            file : "./test/async.test.tjs"
                        } )
                        ) ;
                        tame.callChain([__tame_k]);
                        tame.setActiveCb (null);
                    };
                    __tame_fn_14(tame.end);
                    __tame_defers._fulfill();
                    tame.setActiveCb (null);
                };
                var __tame_fn_19 = function (__tame_k) {
                    tame.setActiveCb (__tame_defer_cb);
                    _ . test . eq ( result , [ 1 , 2 , 3 ] ) ;
                    
                    beforeExit (
                    function  () {
                        eq ( called , 6 ) ;
                    }
                    ) ;
                    tame.callChain([__tame_k]);
                    tame.setActiveCb (null);
                };
                tame.callChain([__tame_fn_13, __tame_fn_19, __tame_k]);
                tame.setActiveCb (null);
            };
            tame.callChain([__tame_fn_12, __tame_k]);
            tame.setActiveCb (null);
        };
        tame.callChain([__tame_fn_20, __tame_k]);
        tame.setActiveCb (null);
    }
    ;
    tame.callChain([__tame_k]);
    tame.setActiveCb (null);
};
__tame_fn_0 (tame.end);