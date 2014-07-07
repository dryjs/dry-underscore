var tame = require('tamejs').runtime;
var __tame_defer_cb = null;
var __tame_fn_0 = function (__tame_k) {
    tame.setActiveCb (__tame_defer_cb);
    var _ = require ( '../' ) ;
    var eq = _ . test . eq ;
    var ok = _ . test . ok ;
    
    var root = _ . path . fun ( _ . path . normalize ( __dirname + "/builder-data/" ) ) ;
    
    exports . testCache = testCache ;
    function testCache (beforeExit) {
        var __tame_defer_cb = tame.findDeferCb ([beforeExit]);
        tame.setActiveCb (__tame_defer_cb);
        var __tame_this = this;
        var __tame_arguments = arguments;
        var __tame_fn_11 = function (__tame_k) {
            tame.setActiveCb (__tame_defer_cb);
            var calls = 0 ;
            var expectedCalls = 0 ;
            
            var result = null ;
            function thrw (x) {
                _ . p ( x . stack ) ; throw ( x ) ;
            }
            var __tame_fn_1 = function (__tame_k) {
                tame.setActiveCb (__tame_defer_cb);
                var __tame_fn_2 = function (__tame_k) {
                    tame.setActiveCb (__tame_defer_cb);
                    var __tame_defers = new tame.Deferrals (__tame_k);
                    var __tame_fn_3 = function (__tame_k) {
                        tame.setActiveCb (__tame_defer_cb);
                        _ . fs . mkdir ( root ( ) , _ . plumb (
                        __tame_defers.defer ( { 
                            func_name : "testCache",
                            parent_cb : __tame_defer_cb,
                            line : 19,
                            file : "./test/builder.test.tjs"
                        } )
                        , thrw ) ) ;
                        tame.callChain([__tame_k]);
                        tame.setActiveCb (null);
                    };
                    __tame_fn_3(tame.end);
                    __tame_defers._fulfill();
                    tame.setActiveCb (null);
                };
                var __tame_fn_4 = function (__tame_k) {
                    tame.setActiveCb (__tame_defer_cb);
                    var __tame_defers = new tame.Deferrals (__tame_k);
                    var __tame_fn_5 = function (__tame_k) {
                        tame.setActiveCb (__tame_defer_cb);
                        _ . fs . removeTree ( root ( ) , _ . plumb (
                        __tame_defers.defer ( { 
                            func_name : "testCache",
                            parent_cb : __tame_defer_cb,
                            line : 20,
                            file : "./test/builder.test.tjs"
                        } )
                        , thrw ) ) ;
                        tame.callChain([__tame_k]);
                        tame.setActiveCb (null);
                    };
                    __tame_fn_5(tame.end);
                    __tame_defers._fulfill();
                    tame.setActiveCb (null);
                };
                var __tame_fn_6 = function (__tame_k) {
                    tame.setActiveCb (__tame_defer_cb);
                    var __tame_defers = new tame.Deferrals (__tame_k);
                    var __tame_fn_7 = function (__tame_k) {
                        tame.setActiveCb (__tame_defer_cb);
                        _ . fs . mkdir ( root ( ) , _ . plumb (
                        __tame_defers.defer ( { 
                            func_name : "testCache",
                            parent_cb : __tame_defer_cb,
                            line : 21,
                            file : "./test/builder.test.tjs"
                        } )
                        , thrw ) ) ;
                        tame.callChain([__tame_k]);
                        tame.setActiveCb (null);
                    };
                    __tame_fn_7(tame.end);
                    __tame_defers._fulfill();
                    tame.setActiveCb (null);
                };
                var __tame_fn_8 = function (__tame_k) {
                    tame.setActiveCb (__tame_defer_cb);
                    var __tame_defers = new tame.Deferrals (__tame_k);
                    var __tame_fn_9 = function (__tame_k) {
                        tame.setActiveCb (__tame_defer_cb);
                        _ . fs . exists ( root ( "cache" ) , _ . plumb (
                        __tame_defers.defer ( { 
                            assign_fn : 
                                function () {
                                    result = arguments[0];
                                }
                                ,
                            func_name : "testCache",
                            parent_cb : __tame_defer_cb,
                            line : 22,
                            file : "./test/builder.test.tjs"
                        } )
                        , thrw ) ) ;
                        tame.callChain([__tame_k]);
                        tame.setActiveCb (null);
                    };
                    __tame_fn_9(tame.end);
                    __tame_defers._fulfill();
                    tame.setActiveCb (null);
                };
                var __tame_fn_10 = function (__tame_k) {
                    tame.setActiveCb (__tame_defer_cb);
                    ok ( ! result ) ;
                    
                    var b = _ . builder ( {
                    cache : root ( "cache" ) ,
                    clean : true
                    } ) ;
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    beforeExit (
                    function  () {
                        eq ( calls , expectedCalls ) ;
                    }
                    ) ;
                    tame.callChain([__tame_k]);
                    tame.setActiveCb (null);
                };
                tame.callChain([__tame_fn_2, __tame_fn_4, __tame_fn_6, __tame_fn_8, __tame_fn_10, __tame_k]);
                tame.setActiveCb (null);
            };
            tame.callChain([__tame_fn_1, __tame_k]);
            tame.setActiveCb (null);
        };
        tame.callChain([__tame_fn_11, __tame_k]);
        tame.setActiveCb (null);
    }
    tame.callChain([__tame_k]);
    tame.setActiveCb (null);
};
__tame_fn_0 (tame.end);