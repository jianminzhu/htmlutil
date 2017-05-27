//闭包执行一个立即定义的匿名函数
!function (factory) {
    // Support three module loading scenarios
    if (typeof require === 'function' && typeof exports === 'object' && typeof module === 'object') {
        // [1] CommonJS/Node.js
        // [1] 支持在module.exports.abc,或者直接exports.abc
        var target = module['exports'] || exports; // module.exports is for Node.js
        factory(target);
    } else if (typeof define === 'function' && define['amd']) {
        // [2] AMD anonymous module
        // [2] AMD 规范
        //define(['exports'],function(exports){
        //    exports.abc = function(){}
        //});
        define(['exports'], factory);
    } else {
        // [3] No module loader (plain <script> tag) - put directly in global namespace
        factory(window['kui_ext_binderutil'] = {});
    }
}(function (my) {
    class BinderUtil {
        kendo
        $
        uuid

        constructor(kendo, jquery, uuid = Math.random()) {
            this.kendo = kendo;
            this.$ = jquery
            this.uuid = "" + uuid;
        }

        addPropForKuiBind(jit, bindConf, keys, model) {
            var keys = keys || this.getKeys(bindConf);
            console.log(keys);
            keys.forEach(function (key) {
                if (key != "sel") {
                    if (jit.attr(key) == undefined) {
                        jit.attr(key, bindConf[key])

                    }
                }
            })
        }

        bindModel(srcObj, bindConfArr = []) {
            var model = this.kendo.observable(srcObj);
            var v = this;
            var $ = v.$;
            var kendo = v.kendo;
            // {sel:"eeeee","data-text-field":"name","data-value-field":"id" ,"data-auto-bind": false ,"data-value-primitive":"true","data-bind":"value: selectedProductId, source: products['test'] "}
            try {
                bindConfArr.forEach(function (bindConf) {
                    try {
                        var keys = v.getKeys(bindConf);
                        $(bindConf.sel).each(function () {
                            var jit = $(this)
                            var isbind_by__kui_ext_binderutil = jit.attr("data-isbind_by__kui_ext_binderutil") || false;
                            if (!isbind_by__kui_ext_binderutil) {
                                v.addPropForKuiBind(jit, bindConf, keys, model)
                                kendo.bind(jit, model);
                                jit.attr("data-isbind_by__kui_ext_binderutil", true)
                            } else {
                                console.log("has bind")
                            }
                        })
                    } catch (e) {
                        alert(e)
                        alert(e)
                    }
                })
            } catch (e) {
                console.log(e, "error forEach")
            }
            return model;
        };

        getKeys(bindConf) {
            var keys = []
            for (var key in bindConf) {
                if (key != "sel") {
                    keys.push(key);
                }
            }
            return keys;
        }

        getParams(model, keys = "query,lastQuery", isEncodeURI = false) {
            var params = {};
            var keyArr = (keys || "").split(",")
            for (var i = 0; i < keyArr.length; i++) {
                var key = keyArr[i];
                try {
                    var mval = model[key]
                    if (typeof mval == "string" && isEncodeURI) {
                        mval = encodeURIComponent(mval);
                    }
                    params[key] = mval;
                } catch (e) {
                    //TODO 增加日志
                }
            }
            return params;
        }
    }
    var my = typeof my !== 'undefined' ? my : {};
    my.genBindUtil = function (kendo, jquery, uuid) {
        return new BinderUtil(kendo, jquery, uuid);
    }
});