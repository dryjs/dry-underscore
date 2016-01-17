var tame = require('tamejs').runtime;
var __tame_defer_cb = null;
var __tame_fn_0 = function (__tame_k) {
    tame.setActiveCb (__tame_defer_cb);
    var _ = require ( '../' ) ;
    var eq = _ . test . eq ;
    var ok = _ . test . ok ;
    
    var root = _ . path . fun ( _ . path . normalize ( __dirname + "/builder-data/" ) ) ;
    
    exports . testBuilder = testBuilder ;
    exports . testStages = testStages ;
    exports . testError = testError ;
    function testBuilder (beforeExit) {
        var __tame_defer_cb = tame.findDeferCb ([beforeExit]);
        tame.setActiveCb (__tame_defer_cb);
        var __tame_this = this;
        var __tame_arguments = arguments;
        var __tame_fn_41 = function (__tame_k) {
            tame.setActiveCb (__tame_defer_cb);
            var calls = 0 ;
            var expectedCalls = 1 ;
            
            beforeExit (
            function  () {
                eq ( calls , expectedCalls ) ;
            }
            ) ;
            
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
                        _ . fs . rm ( root ( "cache" ) , _ . plumb (
                        __tame_defers.defer ( { 
                            func_name : "testBuilder",
                            parent_cb : __tame_defer_cb,
                            line : 23,
                            file : "./test/builder.test.tjs"
                        } )
                        , thrw , _ . code . noent ) ) ;
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
                        _ . fs . exists ( root ( "cache" ) , _ . plumb (
                        __tame_defers.defer ( { 
                            assign_fn : 
                                function () {
                                    result = arguments[0];
                                }
                                ,
                            func_name : "testBuilder",
                            parent_cb : __tame_defer_cb,
                            line : 24,
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
                var __tame_fn_40 = function (__tame_k) {
                    tame.setActiveCb (__tame_defer_cb);
                    ok ( ! result ) ;
                    
                    var b = _ . builder ( {
                    cache : root ( "cache" ) ,
                    clean : true
                    } ) ;
                    var __tame_fn_6 = function (__tame_k) {
                        tame.setActiveCb (__tame_defer_cb);
                        var __tame_fn_7 = function (__tame_k) {
                            tame.setActiveCb (__tame_defer_cb);
                            var __tame_defers = new tame.Deferrals (__tame_k);
                            var __tame_fn_8 = function (__tame_k) {
                                tame.setActiveCb (__tame_defer_cb);
                                b . load ( _ . plumb (
                                __tame_defers.defer ( { 
                                    func_name : "testBuilder",
                                    parent_cb : __tame_defer_cb,
                                    line : 32,
                                    file : "./test/builder.test.tjs"
                                } )
                                , thrw ) ) ;
                                tame.callChain([__tame_k]);
                                tame.setActiveCb (null);
                            };
                            __tame_fn_8(tame.end);
                            __tame_defers._fulfill();
                            tame.setActiveCb (null);
                        };
                        var __tame_fn_39 = function (__tame_k) {
                            tame.setActiveCb (__tame_defer_cb);
                            var err = null ;
                            var file = null ;
                            var __tame_fn_9 = function (__tame_k) {
                                tame.setActiveCb (__tame_defer_cb);
                                var __tame_fn_10 = function (__tame_k) {
                                    tame.setActiveCb (__tame_defer_cb);
                                    var __tame_defers = new tame.Deferrals (__tame_k);
                                    var __tame_fn_11 = function (__tame_k) {
                                        tame.setActiveCb (__tame_defer_cb);
                                        b . build ( root ( "not-there" ) ,
                                        function  (file, data, callback) {
                                            eq ( file , { path : root ( "not-there" ) , exists : false , created : false , dirty : true , removed : false } ) ;
                                            eq ( data , undefined ) ;
                                            callback ( null , "two" ) ;
                                        }
                                        ,
                                        __tame_defers.defer ( { 
                                            assign_fn : 
                                                function () {
                                                    err = arguments[0];
                                                    file = arguments[1];
                                                    result = arguments[2];
                                                }
                                                ,
                                            parent_cb : __tame_defer_cb,
                                            line : 42,
                                            file : "./test/builder.test.tjs"
                                        } )
                                        ) ;
                                        tame.callChain([__tame_k]);
                                        tame.setActiveCb (null);
                                    };
                                    __tame_fn_11(tame.end);
                                    __tame_defers._fulfill();
                                    tame.setActiveCb (null);
                                };
                                var __tame_fn_38 = function (__tame_k) {
                                    tame.setActiveCb (__tame_defer_cb);
                                    eq ( err , null ) ;
                                    eq ( file , { path : root ( "not-there" ) , exists : false , created : false , dirty : false , removed : false } ) ;
                                    eq ( result , undefined ) ;
                                    var __tame_fn_12 = function (__tame_k) {
                                        tame.setActiveCb (__tame_defer_cb);
                                        var __tame_fn_13 = function (__tame_k) {
                                            tame.setActiveCb (__tame_defer_cb);
                                            var __tame_defers = new tame.Deferrals (__tame_k);
                                            var __tame_fn_14 = function (__tame_k) {
                                                tame.setActiveCb (__tame_defer_cb);
                                                b . build ( root ( "test-error.txt" ) ,
                                                function  (file, data, callback) {
                                                    delete file . mtime ;
                                                    eq ( file , { path : root ( "test-error.txt" ) , exists : true , created : true , dirty : true , removed : false } ) ;
                                                    eq ( data , "" ) ;
                                                    callback ( { code : "ERROR" } ) ;
                                                }
                                                ,
                                                __tame_defers.defer ( { 
                                                    assign_fn : 
                                                        function () {
                                                            err = arguments[0];
                                                            file = arguments[1];
                                                            result = arguments[2];
                                                        }
                                                        ,
                                                    parent_cb : __tame_defer_cb,
                                                    line : 55,
                                                    file : "./test/builder.test.tjs"
                                                } )
                                                ) ;
                                                tame.callChain([__tame_k]);
                                                tame.setActiveCb (null);
                                            };
                                            __tame_fn_14(tame.end);
                                            __tame_defers._fulfill();
                                            tame.setActiveCb (null);
                                        };
                                        var __tame_fn_37 = function (__tame_k) {
                                            tame.setActiveCb (__tame_defer_cb);
                                            eq ( err , { code : "ERROR" } ) ;
                                            eq ( file , undefined ) ;
                                            eq ( result , undefined ) ;
                                            var __tame_fn_15 = function (__tame_k) {
                                                tame.setActiveCb (__tame_defer_cb);
                                                var __tame_fn_16 = function (__tame_k) {
                                                    tame.setActiveCb (__tame_defer_cb);
                                                    var __tame_defers = new tame.Deferrals (__tame_k);
                                                    var __tame_fn_17 = function (__tame_k) {
                                                        tame.setActiveCb (__tame_defer_cb);
                                                        b . build ( root ( "one.txt" ) ,
                                                        function  (file, data, callback) {
                                                            delete file . mtime ;
                                                            eq ( file , { path : root ( "one.txt" ) , exists : true , created : true , dirty : true , removed : false } ) ;
                                                            eq ( data , "one\n" ) ;
                                                            callback ( null , "two" ) ;
                                                        }
                                                        ,
                                                        __tame_defers.defer ( { 
                                                            assign_fn : 
                                                                function () {
                                                                    err = arguments[0];
                                                                    file = arguments[1];
                                                                    result = arguments[2];
                                                                }
                                                                ,
                                                            parent_cb : __tame_defer_cb,
                                                            line : 69,
                                                            file : "./test/builder.test.tjs"
                                                        } )
                                                        ) ;
                                                        tame.callChain([__tame_k]);
                                                        tame.setActiveCb (null);
                                                    };
                                                    __tame_fn_17(tame.end);
                                                    __tame_defers._fulfill();
                                                    tame.setActiveCb (null);
                                                };
                                                var __tame_fn_36 = function (__tame_k) {
                                                    tame.setActiveCb (__tame_defer_cb);
                                                    eq ( err , null ) ;
                                                    delete file . mtime ;
                                                    eq ( file , { path : root ( "one.txt" ) , exists : true , created : true , dirty : true , removed : false } ) ;
                                                    eq ( result , "two" ) ;
                                                    eq ( b . cache ( root ( "one.txt" ) ) , "two" ) ;
                                                    
                                                    b . finished ( ) ;
                                                    var __tame_fn_18 = function (__tame_k) {
                                                        tame.setActiveCb (__tame_defer_cb);
                                                        var __tame_fn_19 = function (__tame_k) {
                                                            tame.setActiveCb (__tame_defer_cb);
                                                            var __tame_defers = new tame.Deferrals (__tame_k);
                                                            var __tame_fn_20 = function (__tame_k) {
                                                                tame.setActiveCb (__tame_defer_cb);
                                                                b . build ( root ( "one.txt" ) ,
                                                                function  (file, data, callback) {
                                                                    _ . p ( "file: " , file ) ;
                                                                    _ . p ( "file   : " , file . mtime ) ;
                                                                    _ . p ( "builder: " , b . last ( ) ) ;
                                                                    _ . p ( "builder newer: " , file . mtime < b . last ( ) ) ;
                                                                    ok ( false ) ;
                                                                }
                                                                ,
                                                                __tame_defers.defer ( { 
                                                                    assign_fn : 
                                                                        function () {
                                                                            err = arguments[0];
                                                                            file = arguments[1];
                                                                            result = arguments[2];
                                                                        }
                                                                        ,
                                                                    parent_cb : __tame_defer_cb,
                                                                    line : 87,
                                                                    file : "./test/builder.test.tjs"
                                                                } )
                                                                ) ;
                                                                tame.callChain([__tame_k]);
                                                                tame.setActiveCb (null);
                                                            };
                                                            __tame_fn_20(tame.end);
                                                            __tame_defers._fulfill();
                                                            tame.setActiveCb (null);
                                                        };
                                                        var __tame_fn_35 = function (__tame_k) {
                                                            tame.setActiveCb (__tame_defer_cb);
                                                            eq ( err , null ) ;
                                                            delete file . mtime ;
                                                            eq ( file , { path : root ( "one.txt" ) , exists : true , created : false , dirty : false , removed : false } ) ;
                                                            eq ( result , "two" ) ;
                                                            var __tame_fn_21 = function (__tame_k) {
                                                                tame.setActiveCb (__tame_defer_cb);
                                                                var __tame_fn_22 = function (__tame_k) {
                                                                    tame.setActiveCb (__tame_defer_cb);
                                                                    var __tame_defers = new tame.Deferrals (__tame_k);
                                                                    var __tame_fn_23 = function (__tame_k) {
                                                                        tame.setActiveCb (__tame_defer_cb);
                                                                        b . save ( _ . plumb (
                                                                        __tame_defers.defer ( { 
                                                                            parent_cb : __tame_defer_cb,
                                                                            line : 95,
                                                                            file : "./test/builder.test.tjs"
                                                                        } )
                                                                        , thrw ) ) ;
                                                                        tame.callChain([__tame_k]);
                                                                        tame.setActiveCb (null);
                                                                    };
                                                                    __tame_fn_23(tame.end);
                                                                    __tame_defers._fulfill();
                                                                    tame.setActiveCb (null);
                                                                };
                                                                var __tame_fn_34 = function (__tame_k) {
                                                                    tame.setActiveCb (__tame_defer_cb);
                                                                    var ab = _ . builder ( {
                                                                    cache : root ( "cache" ) ,
                                                                    clean : false
                                                                    } ) ;
                                                                    var __tame_fn_24 = function (__tame_k) {
                                                                        tame.setActiveCb (__tame_defer_cb);
                                                                        var __tame_fn_25 = function (__tame_k) {
                                                                            tame.setActiveCb (__tame_defer_cb);
                                                                            var __tame_defers = new tame.Deferrals (__tame_k);
                                                                            var __tame_fn_26 = function (__tame_k) {
                                                                                tame.setActiveCb (__tame_defer_cb);
                                                                                ab . load ( _ . plumb (
                                                                                __tame_defers.defer ( { 
                                                                                    parent_cb : __tame_defer_cb,
                                                                                    line : 102,
                                                                                    file : "./test/builder.test.tjs"
                                                                                } )
                                                                                , thrw ) ) ;
                                                                                tame.callChain([__tame_k]);
                                                                                tame.setActiveCb (null);
                                                                            };
                                                                            __tame_fn_26(tame.end);
                                                                            __tame_defers._fulfill();
                                                                            tame.setActiveCb (null);
                                                                        };
                                                                        var __tame_fn_27 = function (__tame_k) {
                                                                            tame.setActiveCb (__tame_defer_cb);
                                                                            var __tame_defers = new tame.Deferrals (__tame_k);
                                                                            var __tame_fn_28 = function (__tame_k) {
                                                                                tame.setActiveCb (__tame_defer_cb);
                                                                                ab . build ( root ( "one.txt" ) ,
                                                                                function  (file, data, callback) {
                                                                                    ok ( false ) ;
                                                                                }
                                                                                ,
                                                                                __tame_defers.defer ( { 
                                                                                    assign_fn : 
                                                                                        function () {
                                                                                            err = arguments[0];
                                                                                            file = arguments[1];
                                                                                            result = arguments[2];
                                                                                        }
                                                                                        ,
                                                                                    parent_cb : __tame_defer_cb,
                                                                                    line : 107,
                                                                                    file : "./test/builder.test.tjs"
                                                                                } )
                                                                                ) ;
                                                                                tame.callChain([__tame_k]);
                                                                                tame.setActiveCb (null);
                                                                            };
                                                                            __tame_fn_28(tame.end);
                                                                            __tame_defers._fulfill();
                                                                            tame.setActiveCb (null);
                                                                        };
                                                                        var __tame_fn_33 = function (__tame_k) {
                                                                            tame.setActiveCb (__tame_defer_cb);
                                                                            eq ( err , null ) ;
                                                                            delete file . mtime ;
                                                                            eq ( file , { path : root ( "one.txt" ) , exists : true , created : false , dirty : false , removed : false } ) ;
                                                                            eq ( result , "two" ) ;
                                                                            var __tame_fn_29 = function (__tame_k) {
                                                                                tame.setActiveCb (__tame_defer_cb);
                                                                                var __tame_fn_30 = function (__tame_k) {
                                                                                    tame.setActiveCb (__tame_defer_cb);
                                                                                    var __tame_defers = new tame.Deferrals (__tame_k);
                                                                                    var __tame_fn_31 = function (__tame_k) {
                                                                                        tame.setActiveCb (__tame_defer_cb);
                                                                                        _ . fs . exists ( root ( "cache" ) , _ . plumb (
                                                                                        __tame_defers.defer ( { 
                                                                                            assign_fn : 
                                                                                                function () {
                                                                                                    result = arguments[0];
                                                                                                }
                                                                                                ,
                                                                                            parent_cb : __tame_defer_cb,
                                                                                            line : 115,
                                                                                            file : "./test/builder.test.tjs"
                                                                                        } )
                                                                                        , thrw ) ) ;
                                                                                        tame.callChain([__tame_k]);
                                                                                        tame.setActiveCb (null);
                                                                                    };
                                                                                    __tame_fn_31(tame.end);
                                                                                    __tame_defers._fulfill();
                                                                                    tame.setActiveCb (null);
                                                                                };
                                                                                var __tame_fn_32 = function (__tame_k) {
                                                                                    tame.setActiveCb (__tame_defer_cb);
                                                                                    ok ( result ) ;
                                                                                    
                                                                                    calls ++ ;
                                                                                    tame.callChain([__tame_k]);
                                                                                    tame.setActiveCb (null);
                                                                                };
                                                                                tame.callChain([__tame_fn_30, __tame_fn_32, __tame_k]);
                                                                                tame.setActiveCb (null);
                                                                            };
                                                                            tame.callChain([__tame_fn_29, __tame_k]);
                                                                            tame.setActiveCb (null);
                                                                        };
                                                                        tame.callChain([__tame_fn_25, __tame_fn_27, __tame_fn_33, __tame_k]);
                                                                        tame.setActiveCb (null);
                                                                    };
                                                                    tame.callChain([__tame_fn_24, __tame_k]);
                                                                    tame.setActiveCb (null);
                                                                };
                                                                tame.callChain([__tame_fn_22, __tame_fn_34, __tame_k]);
                                                                tame.setActiveCb (null);
                                                            };
                                                            tame.callChain([__tame_fn_21, __tame_k]);
                                                            tame.setActiveCb (null);
                                                        };
                                                        tame.callChain([__tame_fn_19, __tame_fn_35, __tame_k]);
                                                        tame.setActiveCb (null);
                                                    };
                                                    tame.callChain([__tame_fn_18, __tame_k]);
                                                    tame.setActiveCb (null);
                                                };
                                                tame.callChain([__tame_fn_16, __tame_fn_36, __tame_k]);
                                                tame.setActiveCb (null);
                                            };
                                            tame.callChain([__tame_fn_15, __tame_k]);
                                            tame.setActiveCb (null);
                                        };
                                        tame.callChain([__tame_fn_13, __tame_fn_37, __tame_k]);
                                        tame.setActiveCb (null);
                                    };
                                    tame.callChain([__tame_fn_12, __tame_k]);
                                    tame.setActiveCb (null);
                                };
                                tame.callChain([__tame_fn_10, __tame_fn_38, __tame_k]);
                                tame.setActiveCb (null);
                            };
                            tame.callChain([__tame_fn_9, __tame_k]);
                            tame.setActiveCb (null);
                        };
                        tame.callChain([__tame_fn_7, __tame_fn_39, __tame_k]);
                        tame.setActiveCb (null);
                    };
                    tame.callChain([__tame_fn_6, __tame_k]);
                    tame.setActiveCb (null);
                };
                tame.callChain([__tame_fn_2, __tame_fn_4, __tame_fn_40, __tame_k]);
                tame.setActiveCb (null);
            };
            tame.callChain([__tame_fn_1, __tame_k]);
            tame.setActiveCb (null);
        };
        tame.callChain([__tame_fn_41, __tame_k]);
        tame.setActiveCb (null);
    }
    function testStages (beforeExit) {
        var __tame_defer_cb = tame.findDeferCb ([beforeExit]);
        tame.setActiveCb (__tame_defer_cb);
        var __tame_this = this;
        var __tame_arguments = arguments;
        var __tame_fn_46 = function (__tame_k) {
            tame.setActiveCb (__tame_defer_cb);
            var calls = 0 ;
            var expectedCalls = 1 ;
            
            beforeExit (
            function  () {
                eq ( calls , expectedCalls ) ;
            }
            ) ;
            function thrw (x) {
                _ . p ( x . stack ) ; throw ( x ) ;
            }
            var b = _ . builder ( {
            clean : true
            } ) ;
            
            b . stages . before ( "build" , "prebuild" ) ;
            b . stages . after ( "build" , "postbuild" ) ;
            
            var prebuildHit = false ;
            b . stage ( "prebuild" ,
            function  (next, results) {
                results [ "prebuild-one" ] = true ;
                setTimeout ( next , 50 ) ;
                prebuildHit = true ;
            }
            ) ;
            
            b . stage ( "prebuild" ,
            function  (next, results) {
                results [ "prebuild-two" ] = true ;
                setTimeout ( next , 150 ) ;
                prebuildHit = true ;
            }
            ) ;
            
            b . stage ( "build" ,
            function  (next, results) {
                results [ "build-one" ] = true ;
                setTimeout ( next , 50 ) ;
                ok ( results [ "prebuild-one" ] ) ;
                ok ( results [ "prebuild-two" ] ) ;
            }
            ) ;
            
            b . stage ( "build" ,
            function  (next, results) {
                results [ "build-two" ] = true ;
                setTimeout ( next , 150 ) ;
                ok ( results [ "prebuild-one" ] ) ;
                ok ( results [ "prebuild-two" ] ) ;
            }
            ) ;
            
            b . stage ( "postbuild" ,
            function  (next, results) {
                results [ "postbuild-one" ] = true ;
                setTimeout ( next , 50 ) ;
                ok ( results [ "prebuild-one" ] ) ;
                ok ( results [ "prebuild-two" ] ) ;
                ok ( results [ "build-one" ] ) ;
                ok ( results [ "build-two" ] ) ;
            }
            ) ;
            
            b . stage ( "postbuild" ,
            function  (next, results) {
                results [ "postbuild-two" ] = true ;
                setTimeout ( next , 150 ) ;
                ok ( results [ "prebuild-one" ] ) ;
                ok ( results [ "prebuild-two" ] ) ;
                ok ( results [ "build-one" ] ) ;
                ok ( results [ "build-two" ] ) ;
            }
            ) ;
            
            var results = { } ;
            var __tame_fn_42 = function (__tame_k) {
                tame.setActiveCb (__tame_defer_cb);
                var __tame_fn_43 = function (__tame_k) {
                    tame.setActiveCb (__tame_defer_cb);
                    var __tame_defers = new tame.Deferrals (__tame_k);
                    var __tame_fn_44 = function (__tame_k) {
                        tame.setActiveCb (__tame_defer_cb);
                        b . run ( results , _ . plumb (
                        __tame_defers.defer ( { 
                            func_name : "testStages",
                            parent_cb : __tame_defer_cb,
                            line : 184,
                            file : "./test/builder.test.tjs"
                        } )
                        , thrw ) ) ;
                        tame.callChain([__tame_k]);
                        tame.setActiveCb (null);
                    };
                    __tame_fn_44(tame.end);
                    __tame_defers._fulfill();
                    tame.setActiveCb (null);
                };
                var __tame_fn_45 = function (__tame_k) {
                    tame.setActiveCb (__tame_defer_cb);
                    ok ( results [ "prebuild-one" ] ) ;
                    ok ( results [ "prebuild-two" ] ) ;
                    ok ( results [ "build-one" ] ) ;
                    ok ( results [ "build-two" ] ) ;
                    ok ( results [ "postbuild-one" ] ) ;
                    ok ( results [ "postbuild-two" ] ) ;
                    b . measurer . displayLast ( "builder" ) ;
                    
                    calls ++ ;
                    tame.callChain([__tame_k]);
                    tame.setActiveCb (null);
                };
                tame.callChain([__tame_fn_43, __tame_fn_45, __tame_k]);
                tame.setActiveCb (null);
            };
            tame.callChain([__tame_fn_42, __tame_k]);
            tame.setActiveCb (null);
        };
        tame.callChain([__tame_fn_46, __tame_k]);
        tame.setActiveCb (null);
    }
    function testError (beforeExit) {
        var __tame_defer_cb = tame.findDeferCb ([beforeExit]);
        tame.setActiveCb (__tame_defer_cb);
        var __tame_this = this;
        var __tame_arguments = arguments;
        var __tame_fn_51 = function (__tame_k) {
            tame.setActiveCb (__tame_defer_cb);
            var calls = 0 ;
            var expectedCalls = 1 ;
            
            beforeExit (
            function  () {
                eq ( calls , expectedCalls ) ;
            }
            ) ;
            function thrw (x) {
                _ . p ( x . stack ) ; throw ( x ) ;
            }
            var b = _ . builder ( {
            clean : true
            } ) ;
            
            b . stages . before ( "build" , "prebuild" ) ;
            b . stages . after ( "build" , "postbuild" ) ;
            
            var prebuildHit = false ;
            b . stage ( "prebuild" ,
            function  (next, results) {
                results [ "prebuild-one" ] = true ;
                setTimeout ( next , 50 ) ;
                prebuildHit = true ;
            }
            ) ;
            
            b . stage ( "prebuild" ,
            function  (next, results) {
                results [ "prebuild-two" ] = true ;
                setTimeout ( next , 150 ) ;
                prebuildHit = true ;
            }
            ) ;
            
            b . stage ( "build" ,
            function  (next, results) {
                results [ "build-one" ] = true ;
                setTimeout ( next , 50 ) ;
                ok ( results [ "prebuild-one" ] ) ;
                ok ( results [ "prebuild-two" ] ) ;
            }
            ) ;
            
            b . stage ( "build" ,
            function  (next, results) {
                results [ "build-two" ] = true ;
                ok ( results [ "prebuild-one" ] ) ;
                ok ( results [ "prebuild-two" ] ) ;
                setTimeout (
                function  () {
                    next ( _ . error ( "expected_error" , "Expected error." ) ) ;
                }
                , 150 ) ;
            }
            ) ;
            
            b . stage ( "postbuild" ,
            function  (next, results) {
                results [ "postbuild-one" ] = true ;
                setTimeout ( next , 50 ) ;
                ok ( results [ "prebuild-one" ] ) ;
                ok ( results [ "prebuild-two" ] ) ;
                ok ( results [ "build-one" ] ) ;
                ok ( results [ "build-two" ] ) ;
            }
            ) ;
            
            b . stage ( "postbuild" ,
            function  (next, results) {
                results [ "postbuild-two" ] = true ;
                setTimeout ( next , 150 ) ;
                ok ( results [ "prebuild-one" ] ) ;
                ok ( results [ "prebuild-two" ] ) ;
                ok ( results [ "build-one" ] ) ;
                ok ( results [ "build-two" ] ) ;
            }
            ) ;
            
            var results = { } ;
            var __tame_fn_47 = function (__tame_k) {
                tame.setActiveCb (__tame_defer_cb);
                var err, res;
                var __tame_fn_48 = function (__tame_k) {
                    tame.setActiveCb (__tame_defer_cb);
                    var __tame_defers = new tame.Deferrals (__tame_k);
                    var __tame_fn_49 = function (__tame_k) {
                        tame.setActiveCb (__tame_defer_cb);
                        b . run ( results ,
                        __tame_defers.defer ( { 
                            assign_fn : 
                                function () {
                                    err = arguments[0];
                                    res = arguments[1];
                                }
                                ,
                            func_name : "testError",
                            parent_cb : __tame_defer_cb,
                            line : 262,
                            file : "./test/builder.test.tjs"
                        } )
                        ) ;
                        tame.callChain([__tame_k]);
                        tame.setActiveCb (null);
                    };
                    __tame_fn_49(tame.end);
                    __tame_defers._fulfill();
                    tame.setActiveCb (null);
                };
                var __tame_fn_50 = function (__tame_k) {
                    tame.setActiveCb (__tame_defer_cb);
                    eq ( res , undefined ) ;
                    ok ( _ . code ( err , "expected_error" ) ) ;
                    
                    ok ( results [ "prebuild-one" ] ) ;
                    ok ( results [ "prebuild-two" ] ) ;
                    ok ( results [ "build-one" ] ) ;
                    ok ( results [ "build-two" ] ) ;
                    
                    calls ++ ;
                    tame.callChain([__tame_k]);
                    tame.setActiveCb (null);
                };
                tame.callChain([__tame_fn_48, __tame_fn_50, __tame_k]);
                tame.setActiveCb (null);
            };
            tame.callChain([__tame_fn_47, __tame_k]);
            tame.setActiveCb (null);
        };
        tame.callChain([__tame_fn_51, __tame_k]);
        tame.setActiveCb (null);
    }
    tame.callChain([__tame_k]);
    tame.setActiveCb (null);
};
__tame_fn_0 (tame.end);