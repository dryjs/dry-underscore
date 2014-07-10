var tame = require('tamejs').runtime;
var __tame_defer_cb = null;
var __tame_fn_0 = function (__tame_k) {
    tame.setActiveCb (__tame_defer_cb);
    var _ = require ( '../' ) ;
    var eq = _ . test . eq ;
    var ok = _ . test . ok ;
    
    var root = _ . path . fun ( _ . path . normalize ( __dirname + "/build-data/" ) ) ;
    
    exports . testFetchModule = testFetchModule ;
    function testFetchModule (done) {
        var __tame_defer_cb = tame.findDeferCb ([done]);
        tame.setActiveCb (__tame_defer_cb);
        var __tame_this = this;
        var __tame_arguments = arguments;
        var __tame_fn_37 = function (__tame_k) {
            tame.setActiveCb (__tame_defer_cb);
            var calls = 0 ;
            var expectedCalls = 1 ;
            
            done (
            function  () {
                eq ( calls , expectedCalls ) ;
            }
            ) ;
            
            var err = null ;
            var mod = null ;
            var __tame_fn_1 = function (__tame_k) {
                tame.setActiveCb (__tame_defer_cb);
                var __tame_fn_2 = function (__tame_k) {
                    tame.setActiveCb (__tame_defer_cb);
                    var __tame_defers = new tame.Deferrals (__tame_k);
                    var __tame_fn_3 = function (__tame_k) {
                        tame.setActiveCb (__tame_defer_cb);
                        _ . build . fetchModule ( root ( "not-there" , "not-there.tjs" ) ,
                        __tame_defers.defer ( { 
                            assign_fn : 
                                function () {
                                    err = arguments[0];
                                    mod = arguments[1];
                                }
                                ,
                            func_name : "testFetchModule",
                            parent_cb : __tame_defer_cb,
                            line : 23,
                            file : "./test/build.test.tjs"
                        } )
                        ) ;
                        tame.callChain([__tame_k]);
                        tame.setActiveCb (null);
                    };
                    __tame_fn_3(tame.end);
                    __tame_defers._fulfill();
                    tame.setActiveCb (null);
                };
                var __tame_fn_36 = function (__tame_k) {
                    tame.setActiveCb (__tame_defer_cb);
                    eq ( err , null ) ;
                    eq ( mod , null ) ;
                    var __tame_fn_4 = function (__tame_k) {
                        tame.setActiveCb (__tame_defer_cb);
                        var __tame_fn_5 = function (__tame_k) {
                            tame.setActiveCb (__tame_defer_cb);
                            var __tame_defers = new tame.Deferrals (__tame_k);
                            var __tame_fn_6 = function (__tame_k) {
                                tame.setActiveCb (__tame_defer_cb);
                                _ . build . fetchModule ( root ( "bad" , "bad-global.tjs" ) ,
                                __tame_defers.defer ( { 
                                    assign_fn : 
                                        function () {
                                            err = arguments[0];
                                            mod = arguments[1];
                                        }
                                        ,
                                    func_name : "testFetchModule",
                                    parent_cb : __tame_defer_cb,
                                    line : 27,
                                    file : "./test/build.test.tjs"
                                } )
                                ) ;
                                tame.callChain([__tame_k]);
                                tame.setActiveCb (null);
                            };
                            __tame_fn_6(tame.end);
                            __tame_defers._fulfill();
                            tame.setActiveCb (null);
                        };
                        var __tame_fn_35 = function (__tame_k) {
                            tame.setActiveCb (__tame_defer_cb);
                            ok ( err ) ;
                            eq ( mod , undefined ) ;
                            var __tame_fn_7 = function (__tame_k) {
                                tame.setActiveCb (__tame_defer_cb);
                                var __tame_fn_8 = function (__tame_k) {
                                    tame.setActiveCb (__tame_defer_cb);
                                    var __tame_defers = new tame.Deferrals (__tame_k);
                                    var __tame_fn_9 = function (__tame_k) {
                                        tame.setActiveCb (__tame_defer_cb);
                                        _ . build . fetchModule ( root ( "bad" , "bad-relative.tjs" ) ,
                                        __tame_defers.defer ( { 
                                            assign_fn : 
                                                function () {
                                                    err = arguments[0];
                                                    mod = arguments[1];
                                                }
                                                ,
                                            func_name : "testFetchModule",
                                            parent_cb : __tame_defer_cb,
                                            line : 31,
                                            file : "./test/build.test.tjs"
                                        } )
                                        ) ;
                                        tame.callChain([__tame_k]);
                                        tame.setActiveCb (null);
                                    };
                                    __tame_fn_9(tame.end);
                                    __tame_defers._fulfill();
                                    tame.setActiveCb (null);
                                };
                                var __tame_fn_34 = function (__tame_k) {
                                    tame.setActiveCb (__tame_defer_cb);
                                    ok ( err ) ;
                                    eq ( mod , undefined ) ;
                                    var __tame_fn_10 = function (__tame_k) {
                                        tame.setActiveCb (__tame_defer_cb);
                                        var __tame_fn_11 = function (__tame_k) {
                                            tame.setActiveCb (__tame_defer_cb);
                                            var __tame_defers = new tame.Deferrals (__tame_k);
                                            var __tame_fn_12 = function (__tame_k) {
                                                tame.setActiveCb (__tame_defer_cb);
                                                _ . build . fetchModule ( root ( "bad" , "bad-abs.tjs" ) ,
                                                __tame_defers.defer ( { 
                                                    assign_fn : 
                                                        function () {
                                                            err = arguments[0];
                                                            mod = arguments[1];
                                                        }
                                                        ,
                                                    func_name : "testFetchModule",
                                                    parent_cb : __tame_defer_cb,
                                                    line : 35,
                                                    file : "./test/build.test.tjs"
                                                } )
                                                ) ;
                                                tame.callChain([__tame_k]);
                                                tame.setActiveCb (null);
                                            };
                                            __tame_fn_12(tame.end);
                                            __tame_defers._fulfill();
                                            tame.setActiveCb (null);
                                        };
                                        var __tame_fn_33 = function (__tame_k) {
                                            tame.setActiveCb (__tame_defer_cb);
                                            ok ( err ) ;
                                            eq ( mod , undefined ) ;
                                            var __tame_fn_13 = function (__tame_k) {
                                                tame.setActiveCb (__tame_defer_cb);
                                                var __tame_fn_14 = function (__tame_k) {
                                                    tame.setActiveCb (__tame_defer_cb);
                                                    var __tame_defers = new tame.Deferrals (__tame_k);
                                                    var __tame_fn_15 = function (__tame_k) {
                                                        tame.setActiveCb (__tame_defer_cb);
                                                        _ . build . fetchModule ( root ( "bad" ) ,
                                                        __tame_defers.defer ( { 
                                                            assign_fn : 
                                                                function () {
                                                                    err = arguments[0];
                                                                    mod = arguments[1];
                                                                }
                                                                ,
                                                            func_name : "testFetchModule",
                                                            parent_cb : __tame_defer_cb,
                                                            line : 39,
                                                            file : "./test/build.test.tjs"
                                                        } )
                                                        ) ;
                                                        tame.callChain([__tame_k]);
                                                        tame.setActiveCb (null);
                                                    };
                                                    __tame_fn_15(tame.end);
                                                    __tame_defers._fulfill();
                                                    tame.setActiveCb (null);
                                                };
                                                var __tame_fn_32 = function (__tame_k) {
                                                    tame.setActiveCb (__tame_defer_cb);
                                                    eq ( err , null ) ;
                                                    eq ( mod , null ) ;
                                                    var __tame_fn_16 = function (__tame_k) {
                                                        tame.setActiveCb (__tame_defer_cb);
                                                        var __tame_fn_17 = function (__tame_k) {
                                                            tame.setActiveCb (__tame_defer_cb);
                                                            var __tame_defers = new tame.Deferrals (__tame_k);
                                                            var __tame_fn_18 = function (__tame_k) {
                                                                tame.setActiveCb (__tame_defer_cb);
                                                                _ . build . fetchModule ( root ( "badpath" ) ,
                                                                __tame_defers.defer ( { 
                                                                    assign_fn : 
                                                                        function () {
                                                                            err = arguments[0];
                                                                            mod = arguments[1];
                                                                        }
                                                                        ,
                                                                    func_name : "testFetchModule",
                                                                    parent_cb : __tame_defer_cb,
                                                                    line : 43,
                                                                    file : "./test/build.test.tjs"
                                                                } )
                                                                ) ;
                                                                tame.callChain([__tame_k]);
                                                                tame.setActiveCb (null);
                                                            };
                                                            __tame_fn_18(tame.end);
                                                            __tame_defers._fulfill();
                                                            tame.setActiveCb (null);
                                                        };
                                                        var __tame_fn_31 = function (__tame_k) {
                                                            tame.setActiveCb (__tame_defer_cb);
                                                            eq ( err , null ) ;
                                                            eq ( mod , null ) ;
                                                            var __tame_fn_19 = function (__tame_k) {
                                                                tame.setActiveCb (__tame_defer_cb);
                                                                var __tame_fn_20 = function (__tame_k) {
                                                                    tame.setActiveCb (__tame_defer_cb);
                                                                    var __tame_defers = new tame.Deferrals (__tame_k);
                                                                    var __tame_fn_21 = function (__tame_k) {
                                                                        tame.setActiveCb (__tame_defer_cb);
                                                                        _ . build . fetchModule ( "badpath" ,
                                                                        __tame_defers.defer ( { 
                                                                            assign_fn : 
                                                                                function () {
                                                                                    err = arguments[0];
                                                                                    mod = arguments[1];
                                                                                }
                                                                                ,
                                                                            func_name : "testFetchModule",
                                                                            parent_cb : __tame_defer_cb,
                                                                            line : 47,
                                                                            file : "./test/build.test.tjs"
                                                                        } )
                                                                        ) ;
                                                                        tame.callChain([__tame_k]);
                                                                        tame.setActiveCb (null);
                                                                    };
                                                                    __tame_fn_21(tame.end);
                                                                    __tame_defers._fulfill();
                                                                    tame.setActiveCb (null);
                                                                };
                                                                var __tame_fn_30 = function (__tame_k) {
                                                                    tame.setActiveCb (__tame_defer_cb);
                                                                    eq ( err , null ) ;
                                                                    eq ( mod , null ) ;
                                                                    var __tame_fn_22 = function (__tame_k) {
                                                                        tame.setActiveCb (__tame_defer_cb);
                                                                        var __tame_fn_23 = function (__tame_k) {
                                                                            tame.setActiveCb (__tame_defer_cb);
                                                                            var __tame_defers = new tame.Deferrals (__tame_k);
                                                                            var __tame_fn_24 = function (__tame_k) {
                                                                                tame.setActiveCb (__tame_defer_cb);
                                                                                _ . build . fetchModule ( root ( "good" , "one.tjs" ) ,
                                                                                __tame_defers.defer ( { 
                                                                                    assign_fn : 
                                                                                        function () {
                                                                                            err = arguments[0];
                                                                                            mod = arguments[1];
                                                                                        }
                                                                                        ,
                                                                                    func_name : "testFetchModule",
                                                                                    parent_cb : __tame_defer_cb,
                                                                                    line : 51,
                                                                                    file : "./test/build.test.tjs"
                                                                                } )
                                                                                ) ;
                                                                                tame.callChain([__tame_k]);
                                                                                tame.setActiveCb (null);
                                                                            };
                                                                            __tame_fn_24(tame.end);
                                                                            __tame_defers._fulfill();
                                                                            tame.setActiveCb (null);
                                                                        };
                                                                        var __tame_fn_29 = function (__tame_k) {
                                                                            tame.setActiveCb (__tame_defer_cb);
                                                                            eq ( err , null ) ;
                                                                            eq ( mod , { one : 'one' } ) ;
                                                                            var __tame_fn_25 = function (__tame_k) {
                                                                                tame.setActiveCb (__tame_defer_cb);
                                                                                var __tame_fn_26 = function (__tame_k) {
                                                                                    tame.setActiveCb (__tame_defer_cb);
                                                                                    var __tame_defers = new tame.Deferrals (__tame_k);
                                                                                    var __tame_fn_27 = function (__tame_k) {
                                                                                        tame.setActiveCb (__tame_defer_cb);
                                                                                        _ . build . fetchModule ( root ( "good" , "two.js" ) ,
                                                                                        __tame_defers.defer ( { 
                                                                                            assign_fn : 
                                                                                                function () {
                                                                                                    err = arguments[0];
                                                                                                    mod = arguments[1];
                                                                                                }
                                                                                                ,
                                                                                            func_name : "testFetchModule",
                                                                                            parent_cb : __tame_defer_cb,
                                                                                            line : 55,
                                                                                            file : "./test/build.test.tjs"
                                                                                        } )
                                                                                        ) ;
                                                                                        tame.callChain([__tame_k]);
                                                                                        tame.setActiveCb (null);
                                                                                    };
                                                                                    __tame_fn_27(tame.end);
                                                                                    __tame_defers._fulfill();
                                                                                    tame.setActiveCb (null);
                                                                                };
                                                                                var __tame_fn_28 = function (__tame_k) {
                                                                                    tame.setActiveCb (__tame_defer_cb);
                                                                                    eq ( err , null ) ;
                                                                                    eq ( mod , { two : 'two' } ) ;
                                                                                    
                                                                                    calls ++ ;
                                                                                    tame.callChain([__tame_k]);
                                                                                    tame.setActiveCb (null);
                                                                                };
                                                                                tame.callChain([__tame_fn_26, __tame_fn_28, __tame_k]);
                                                                                tame.setActiveCb (null);
                                                                            };
                                                                            tame.callChain([__tame_fn_25, __tame_k]);
                                                                            tame.setActiveCb (null);
                                                                        };
                                                                        tame.callChain([__tame_fn_23, __tame_fn_29, __tame_k]);
                                                                        tame.setActiveCb (null);
                                                                    };
                                                                    tame.callChain([__tame_fn_22, __tame_k]);
                                                                    tame.setActiveCb (null);
                                                                };
                                                                tame.callChain([__tame_fn_20, __tame_fn_30, __tame_k]);
                                                                tame.setActiveCb (null);
                                                            };
                                                            tame.callChain([__tame_fn_19, __tame_k]);
                                                            tame.setActiveCb (null);
                                                        };
                                                        tame.callChain([__tame_fn_17, __tame_fn_31, __tame_k]);
                                                        tame.setActiveCb (null);
                                                    };
                                                    tame.callChain([__tame_fn_16, __tame_k]);
                                                    tame.setActiveCb (null);
                                                };
                                                tame.callChain([__tame_fn_14, __tame_fn_32, __tame_k]);
                                                tame.setActiveCb (null);
                                            };
                                            tame.callChain([__tame_fn_13, __tame_k]);
                                            tame.setActiveCb (null);
                                        };
                                        tame.callChain([__tame_fn_11, __tame_fn_33, __tame_k]);
                                        tame.setActiveCb (null);
                                    };
                                    tame.callChain([__tame_fn_10, __tame_k]);
                                    tame.setActiveCb (null);
                                };
                                tame.callChain([__tame_fn_8, __tame_fn_34, __tame_k]);
                                tame.setActiveCb (null);
                            };
                            tame.callChain([__tame_fn_7, __tame_k]);
                            tame.setActiveCb (null);
                        };
                        tame.callChain([__tame_fn_5, __tame_fn_35, __tame_k]);
                        tame.setActiveCb (null);
                    };
                    tame.callChain([__tame_fn_4, __tame_k]);
                    tame.setActiveCb (null);
                };
                tame.callChain([__tame_fn_2, __tame_fn_36, __tame_k]);
                tame.setActiveCb (null);
            };
            tame.callChain([__tame_fn_1, __tame_k]);
            tame.setActiveCb (null);
        };
        tame.callChain([__tame_fn_37, __tame_k]);
        tame.setActiveCb (null);
    }
    tame.callChain([__tame_k]);
    tame.setActiveCb (null);
};
__tame_fn_0 (tame.end);