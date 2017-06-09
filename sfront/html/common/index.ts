(function (require, $, SearchRenderUtil, JsonResultUtil, kkpager, juicer, md5, store,TplUtil) {
    $(function () {

        /*顶部搜索框浮动 */
        var sg_css_top_float_isrun = false;
        try {
            $(".wrap").css({"margin-left": $(".header2").offset().left})
            window.onresize = function () {
                if (!sg_css_top_float_isrun) {
                    sg_css_top_float_isrun = true;
                    $(".wrap").css({"margin-left": $(".header2").offset().left})
                    setTimeout(function () {
                        sg_css_top_float_isrun = false;
                    }, 30)
                }
            }
        } catch (e) {
        }

        /*顶部搜索框浮动 end*/

        /*拦截表单submit事件*/
        $("body").on("submit", "form", function () {
            return false;
        })
        /*拦截表单submit事件-------end*/

        /*页面通用函数*/
        function parseURL(url) {
            /*解析url中的参数*/
            var a = document.createElement('a');
            a.href = url;
            return {
                source: url,
                protocol: a.protocol.replace(':', ''),
                host: a.hostname,
                port: a.port,
                query: a.search,
                params: (function () {
                    var ret = {}, seg = a.search.replace(/^\?/, '').split('&'), len = seg.length, i = 0, s;
                    for (; i < len; i++) {
                        if (!seg[i]) {
                            continue;
                        }
                        s = seg[i].split('=');
                        ret[s[0]] = s[1];
                    }
                    return ret;
                })(),
                file: (a.pathname.match(/\/([^\/?#]+)$/i) || [, ''])[1],
                hash: a.hash.replace('#', ''),
                path: a.pathname.replace(/^([^\/])/, '/$1'),
                relative: (a.href.match(/tps?:\/\/[^\/]+(.+)/) || [, ''])[1],
                segments: a.pathname.replace(/^\//, '').split('/')
            };
        }

        function scrollToTop() {
            /*滚动到页面顶部*/
            var body = this.$("body");
            var top = body.scrollTop()
            if (top != 0) {
                body.animate({scrollTop: 0}, '300');
            }
        }

        function blog(...a) {
            /*浏览器中打印日志，方便排查错误*/
            //$("#log") .prepend(JSON.stringify(arguments) + "<br/>")
        }

        function bypeLen(str) {
            /*按字节计算字符串长度*/
            if (!str) {
                return 0;
            }
            var a = 0;
            for (var i = 0; i < str.length; i++) {
                if (str.charCodeAt(i) > 255) {
                    a += 2;
                }
                else {
                    a++;
                }
            }
            return a;
        }

        function sub(str, len) {
            /*按字节长度截取字符串*/
            if (!str || !len) {
                return '';
            }
            var a = 0;
            var temp = '';
            for (var i = 0; i < str.length; i++) {
                if (str.charCodeAt(i) > 255) {
                    a += 2;
                }
                else {
                    a++;
                }
                if (a > len) {
                    return temp;
                }
                temp += str.charAt(i);
            }
            return str;
        }

        function parseParamsFromHash(cacheKey) {
            /*从cookie中取得缓存的查询参数组合*/
            var modelValFromHash = {}
            try {
                var jStr = store.get("ca_" + cacheKey) || "{}"
                eval("modelValFromHash=" + jStr);
                if (typeof modelValFromHash != "object") {
                    modelValFromHash = {}
                }
            } catch (e) {
            }
            return modelValFromHash
        }

        function sogou_params__deal__removeFileTypeInQuery(query) {
            /*移除查询参数中的filetype*/
            var sogou_results_filetypes = ["all", "doc", "pdf", "ppt", "xls", "rtf"];
            for (var i = 0; i < sogou_results_filetypes.length; i++) {
                query = query.replace(new RegExp("filetype:" + sogou_results_filetypes[i], "gi"), "");
            }
            return $.trim(query);
        };
        function sogou_params__deal__changeFiletypesToQuery(query, filetype) {
            /*重置查询参数中的filetype（先移除再重新添加）*/
            query = sogou_params__deal__removeFileTypeInQuery(query);
            var queryShow = query;
            if (filetype != "") {
                queryShow = "filetype:" + filetype + "  " + query
            }
            return {filetype, query, queryShow};
        }
        function jsonpApi(req) {
            /*ajax封装，方便后期统一处理*/
            return $.ajax(req);
        }
        function getUrlAndHashParams(){
            var urlParams = parseURL(window.location.href).params
            var hashParams = parseURL("?" + window.location.hash.substr(1)).params
            var urlQuery=urlParams["query"]||"";
            var needChagneUrl=false;
            if(urlQuery!=""&&urlQuery!=hashParams["query"]){
                hashParams["query"] = urlQuery;
                needChagneUrl=true
            }
            return {urlParams,hashParams,needChagneUrl}
        }
        /*页面通用函数-------end*/
        require(["kendo.binder.min", "../ext/kui.ext.bindutil" ], function (kendo, bindutil) {
            var sru = new SearchRenderUtil(juicer, $, JsonResultUtil, kkpager,TplUtil);
            var {urlParams, hashParams,needChagneUrl}=getUrlAndHashParams();
            var modelValFromHash = parseParamsFromHash(hashParams["ck"]);
            var bu = bindutil.genBindUtil(kendo, $, "test")
            /*统一使用kendoui给元素绑定事件*/
            var modelBinderConf =  [{sel: '[name=query]', "data-bind": "value: query,events:{keyup:eKeyupQuery,change:eChangeQuery}"}
                , {sel: '[name="filetype"]', "data-bind": "checked:filetype,events:{click:eClickFiletype}"}
                , {sel: '[data-sgp-inttime]', "data-bind": "events:{click:eClickInitTime}"}
                , {sel: '[name="search"]', "data-bind": " events:{click:search}"}
                , {sel: '[name="searchBySogou"]', "data-bind": " events:{click:searchBySogou}"}
                , {sel: '[data-sgps-codition]', "data-bind": "style: {display:isShowFilter}"}
                , {sel: '[data-sgps-inttime ]', "data-bind": "text:inittime_show"}
                , {sel: '[data-sgpo="sgp_cancle_timeCycle"]', "data-bind": "events:{click:eCleanInittime}"}
                , {sel: '[data-sgp-ranktype]', "data-bind": "events:{click:eClickRanktype}"}
                , {sel: 'a.qreset2', "data-bind": "events:{click:eClickQrest2}"}
            ]
            //当前页面用到的所有 全局性 变量
            var modelConst =  {
                paramProps: "query,sourceid,page,filetype,tsn,ranktype,cid,interation,ie",
                paramPropsForHashOrCache: "query,sourceid,page,filetype,idg,ranktype,cid,ie",
                pageId: "d_search_result_pager",
                queryLimitInfo: "小提示：搜狗最多支持40个汉字的查询,超出部分将被忽略",
                jpage: $("#d_search_result_pager"),
                jout: $("#d_search_result"),
                lastQuery: "",
                lastQueryCacheKey: "",
                queryResultCache: {},
                inittimemap: {
                    "inttime_all": {cn: "全部时间", tsn: 0}
                    , "inttime_day": {cn: "一天内", tsn: 1}
                    , "inttime_week": {cn: "一周内", tsn: 2}
                    , "inttime_month": {cn: "一月内", tsn: 3}
                    , "inttime_year": {cn: "一年内", tsn: 4}
                },
            }

            //当前页面用查询参数默认值
            let modelValDefault = {
                query: "",
                cid: 0,
                interation: sogou_interation,
                ie: "utf8",
                page: 1,
                filetype: "",
                ranktype: 0,
                idg: false,
                tsn: 0,
                sourceid: "inttime_all",
                inittime_show: "全部时间",
                isShowFilter: "none",
                queryLimitByteLen: 80,
            };

            //当前页面用到的所有事件及逻辑相关函数
            var cssClickDealFunction = {
                init(){
                    var v = this;
                    if (bypeLen(this.query) > 80) {
                        v.set("query", sub(this.query, 80))
                    }
                    v.changeRanktype(this.ranktype)
                    try {
                        v.changeFiletypes(v.filetype)
                    } catch (e) {
                        console.log(e, "eeeeeee")
                    }
                    v.changeTime(this.sourceid, false)
                    v.search()
                }, clean(){
                    this.set("query", "");
                    store.set("lastQuery", "")
                    store.set("lastQueryCacheKey", "")
                }, eClickQrest2(e){
                    this.clean()
                    $("a.qreset2").hide()
                }, eChangeQuery(e){
                    let jthis = $(e.target);
                    var query = jthis.val()
                    if (bypeLen(query) > this.queryLimitByteLen) {
                        let queryLimit80 = sub(query, this.queryLimitByteLen);
                        this.set("query", queryLimit80);
                        this.emsg(this.queryLimitInfo)
                    }
                },eKeyupQuery(e){
                    let jthis = $(e.target);
                    var query = jthis.val()
		     if (query != "") {
	                    if (bypeLen(query) > this.queryLimitByteLen) {
	                        let queryLimit80 = sub(query, this.queryLimitByteLen);
	                        this.set("query", queryLimit80);
	                        this.emsg(this.queryLimitInfo)
	                    }                  
                        $("a.qreset2").show()
                    } else {
		    	  this.emsg("")
                        $("a.qreset2").hide()
                    }
                    if (e.keyCode == 13) {
                        this.set("query", jthis.val())
                        this.search()
                    }
                },
                changeTime(inittime, isJustSearch = true){
                    var v = this
                    this.set("page", "1");
                    var isShowFilter = "none";
                    if (inittime != "inttime_all") {
                        isShowFilter = ""
                    }
                    this.set("isShowFilter", isShowFilter);
                    if (inittime != v.inittime) {
                        let inittimeMap = v.inittimemap[inittime];
                        this.set("sourceid", inittime);
                        this.set("tsn", inittimeMap.tsn);
                        //变更显示变化处理
                        //切换时间条件 选中样式
                        v.cssChangeForInitTime(inittime);
                        //显示或隐藏过滤条件显示
                        this.set("inittime_show", inittimeMap.cn);
                    }
                    if (isJustSearch) {
                        v.search()
                    }
                }, changeFiletypes(filetype){
                    var query = this.query
                    var filetype = filetype || ""
                    this.set("filetype", filetype);
                    let item = sogou_params__deal__changeFiletypesToQuery(query, filetype);
                    if ($.trim(item.query) != "") {
                        this.set("query", item["queryShow"])
                    }
                }, eClickFiletype(e){
                    var filetype = $(e.target).val()
                    this.changeFiletypes(filetype);
                    this.search()
                },
                changeRanktype: function (ranktype: any) {
                    this.set("page", 1)
                    this.set("ranktype", ranktype)
                    //事件: 【默认排序】【时间排序】 改变时样式变更
                    $("[data-sgp-ranktype]").each(function () {
                        let ja = $(this)
                        ja.removeClass("cur")
                    })
                    $("[data-sgp-ranktype='" + ranktype + "']").addClass("cur")
                }, eClickRanktype(e) {
                    //事件:【默认排序】【时间排序】点击事件
                    let jit = $(e.target);
                    var ranktype = jit.attr("data-sgp-ranktype")
                    if (!ranktype) {
                        ranktype = jit.closest("[data-sgp-ranktype]").attr("data-sgp-ranktype")
                    }
                    this.changeRanktype(ranktype);
                    this.search()
                }
                , eClickInitTime(e) {
                    //事件: 点击时间过滤条件
                    var jit = $(e.target).closest("li")
                    var inittime = jit.find("a").attr("data-sgp-inttime")
                    this.changeTime(inittime)
                }, cssChangeForInitTime(initTime) {
                    //事件:  时间过滤变更时 样式
                    $("[data-sgp-inttime]").each(function () {
                        $(this).removeClass("cur")
                    })
                    $("[data-sgp-inttime='" + initTime + "']").addClass("cur")
                }, eCleanInittime(isJustSearch = true) {
                    //事件: 点击清除时间过滤条件
                    this.changeTime("inttime_all", isJustSearch)
                }, getCacheKey() {
                    return md5(JSON.stringify($.param(bu.getParams(this, this.paramPropsForHashOrCache))));
                }, setHashWithParams(){
                    var cacheKey = this.getCacheKey()
                    let params = bu.getParams(this, this.paramPropsForHashOrCache);
                    store.set("ca_" + cacheKey, params)
                    let hp = hashParams = bu.getParams(params, "cid,query");
                    window.location.hash = this.toHash([["cid", hp.cid], ["query", hp.query],  ["ck", cacheKey]])
                    return cacheKey
                }, toHash(array2D = []){
                    var arr = [];
                    for (var i = 0; i < array2D.length; i++) {
                        var it = array2D[i];
                        it[1] = encodeURIComponent(it[1]);
                        arr.push(it.join("="))
                    }
                    return arr.join("&")
                }, getParams(){
                    var params = bu.getParams(this, this.paramProps)
                    if (bypeLen(params["query"]) > this.queryLimitByteLen) {
                        let queryLimit80 = sub(params["query"], this.queryLimitByteLen);
                        params["query"] = queryLimit80;
                        this.set("query", queryLimit80);
                        this.emsg(this.queryLimitInfo)
                    }
                    return params;
                }, searchBySogou(){
                    var url = "https://www.sogou.com/web?ie=utf8&";
                    if ($.trim(this.query || "") != "") {
                        url += "query=" + encodeURIComponent(this.query)
                    }
                    window.open(url);
                }, isQueryNotEmpty () {
                    return sogou_params__deal__removeFileTypeInQuery(this.query) != "";
                }, search() {
                    var v = this;
                    var jout = $("#d_search_result")
                    if (v.isQueryNotEmpty()) {
                        try {
                            //  blog(33)
                            var params = v.getParams();
                            v.cleanEmsg()
                            var query = params.query;
                            if (v.lastQuery != query) {
                                //  blog(44)
                                scrollToTop()
                                v.lastQuery = query
                                store.set("lastQuery", v.lastQuery)
                                v.eCleanInittime(false)
                                v.changeRanktype(0)
                                v.set("page", v.page || 1);
                                // this.set("inittime", "inttime_all");
                                params = this.getParams()
                            }

                            var cacheKey = this.getCacheKey();
                            var page = params.page
                            let cacheObj = v.queryResultCache[cacheKey] || {};
                            //  blog(v.lastQueryCacheKey,cacheKey)
                            if (v.lastQueryCacheKey != cacheKey) {
                                v.lastQueryCacheKey = cacheKey
                                v.setHashWithParams()
                                if (cacheObj.html) {
                                    jout.html(cacheObj.html);
                                    sru.renderPage($.extend({
                                        totalPage: 0,
                                        totaoItems: 0
                                    }, cacheObj.json), page, v.pageId, toPage)
                                } else {
                                    $("#" + v.pageId).hide()
                                    jout.html("")
                                    var lastQueryCacheKey = v.lastQueryCacheKey;
                                    (function (v, cacheKey, lastQueryCacheKey, page, params, jout) {
                                        v.serverSearch(page, params, jout, cacheKey, "test22").then(function () {

                                            //  blog(77)
                                            if ((v.queryResultCache[cacheKey] || {}).html) {
                                                v.lastQueryCacheKey = cacheKey
                                                store.set("lastQueryCacheKey", lastQueryCacheKey)
                                            }
                                        });
                                    })(v, cacheKey, lastQueryCacheKey, page, params, jout)

                                }
                            } else if (v.lastQueryCacheKey == cacheKey && !cacheObj.html) {
                                store.set("lastQueryCacheKey", v.lastQueryCacheKey);
                                (function (v, cacheKey, lastQueryCacheKey, page, params, jout) {
                                    v.serverSearch(page, params, jout, cacheKey, "test11").then(function () {
                                        //  blog(88)
                                        if ((v.queryResultCache[cacheKey] || {}).html) {
                                            v.lastQueryCacheKey = cacheKey
                                            store.set("lastQueryCacheKey", lastQueryCacheKey)
                                        }
                                    });
                                })(v, cacheKey, lastQueryCacheKey, page, params, jout)
                            }
                        } catch (e) {
                            //  blog( e.toString())
                        }
                    } else {
                        this.clean();
                        this.setHashWithParams()
                        this.emsg("请输入查询词，长度不超过40汉字", true, true)
                    }
                    //console.log("SG_LASTQUERY_CACHEKEY,cacheKey", SG_LASTQUERY_CACHEKEY, cacheKey)

                }, cleanEmsg(){
                    $(".emsg_box").hide()
                }, emsg(errorMsg, cleanHtml, hidePage){
                    var v = this;
                    if (cleanHtml) {
                        $("#d_search_result").html("");
                    }
                    if (hidePage) {
                        $("#" + this.pageId).hide();
                    }
                    try {
                        var jemsg=$(".emsg_box");
                        jemsg.html(errorMsg)
                        if(errorMsg!=""){
                            jemsg.show()
                        }else{
                            jemsg.hide()
                        }
                    } catch (e) {
                    }
                },
                serverSearch(page: any, params: {}, jout: any, paramMd5: any, uuid) {
                    var v = this
                    return jsonpApi({
                        //url: "http://10.136.115.203:9080/websearch/json_sogou.jsp",
                        //url: "http://10.134.16.25:8080/websearch/json_sogou.jsp",
			//url: "http://10.134.32.103:8080/websearch/json_sogou.jsp",
                        url: "/websearch/json_sogou.jsp",
                        dataType: "jsonp",
                        data: $.extend({page: page || 1}, params),
                        success(json) {
                            sru.render({
                                json,
                                params,
                                jout: jout,
                                pageId: v.pageId,
                                pageFunctin: toPage,
                                cacheAll: v.queryResultCache,
                                cacheKey: paramMd5
                                , uuid
                            })
                            return json
                        }, error(e) {
                            console.log("eeee", e)
                            sru.render({
                                json: {totalItems: 0},
                                params,
                                jout: jout,
                                pageId: v.pageId,
                                pageFunctin: toPage,
                                cacheAll: v.queryResultCache,
                                cacheKey: paramMd5
                                , uuid
                            }, false)
                        }
                    })
                }
            }

            /*//hash变更时的处理
            window.onhashchange = function() {
                 window.location.reload()
            }*/
            var obj = $.extend(modelConst, cssClickDealFunction, modelValDefault, modelValFromHash, {
                lastQuery: store.get("lastQuery"),
                lastQueryCacheKey: store.get("lastQueryCacheKey")
            }, hashParams, {query: decodeURIComponent(hashParams["query"] || "")})
            SG_PARAMS_MODEL = bu.bindModel(obj, modelBinderConf)
            SG_PARAMS_MODEL.init()
            function toPage(pno) {
                SG_PARAMS_MODEL.set("page", pno)
                SG_PARAMS_MODEL.search()
            }


        })
    })
})(require, $, SearchRenderUtil, JsonResultUtil, kkpager, juicer, md5, store,TplUtil)