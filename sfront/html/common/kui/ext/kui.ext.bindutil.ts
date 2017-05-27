!function (factory) {
    if (typeof require === 'function' && typeof exports === 'object' && typeof module === 'object') {
        var target = module['exports'] || exports;
        factory(target);
    } else if (typeof define === 'function' && define['amd']) {
        define(['exports'], factory);
    } else {
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
            for(var i=0;i<keys.length;i++){
                var key = keys[i];
                if (key != "sel") {
                    if (jit.attr(key) == undefined) {
                        jit.attr(key, bindConf[key])
                    }
                }
            }
        }

        bindModel(srcObj, bindConfArr = []) {
            var model = this.kendo.observable(srcObj);
            var v = this;
            var $ = v.$;
            var kendo = v.kendo;
            //示例 {sel:"eeeee","data-text-field":"name","data-value-field":"id" ,"data-auto-bind": false ,"data-value-primitive":"true","data-bind":"value: selectedProductId, source: products['test'] "}
            try {
                for(var i=0;i<bindConfArr.length;i++){
                    var bindConf=bindConfArr[i]
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
                }
            } catch (e) {
                console.log(e+ "error forEach")
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