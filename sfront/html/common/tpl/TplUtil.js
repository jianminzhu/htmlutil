var SG_EDU_CACHED_TPL = {};
var TplUtil = (function () {
    function TplUtil() {
        this.root = "/common/tpl/";
        //模板版本号
        this.tplVersion = {
            "100": "1.03",
            "nomal": "1.3",
            "noresult": "1.3"
        };
        //模板映射
        this.tplMap = {
            "100": "nomal",
            "503": "nomal"
        };
    }
    TplUtil.prototype.getUrl = function (tplid) {
        return this.root + tplid + ".js?v=" + (this.tplVersion[tplid] || "1.0");
    };
    TplUtil.prototype.getRenderTpl = function (tplid) {
        return SG_EDU_CACHED_TPL[tplid] || SG_EDU_CACHED_TPL["nomal"]; //`<!-- ${tplid } tpl not found --->`
    };
    TplUtil.prototype.isNotCached = function (tplid) {
        return !SG_EDU_CACHED_TPL[tplid];
    };
    TplUtil.prototype.mapTplid = function (tplid) {
        return this.tplMap[tplid] || tplid;
    };
    /*过滤重复的*/
    TplUtil.prototype.filterByMaping = function (tplidsArr) {
        var tplidArrReal = [];
        for (var i = 0; i < tplidsArr.length; i++) {
            var tplid = this.mapTplid($.trim("" + (tplidsArr[i] || "")));
            if (tplid != "" && $.inArray(tplid, tplidArrReal) == -1) {
                tplidArrReal.push(tplid);
            }
        }
        this.addCommon(tplidArrReal);
        return tplidArrReal;
    };
    TplUtil.prototype.addCommon = function (tplidsArr) {
        tplidsArr.push("nomal");
        tplidsArr.push("noresult");
    };
    TplUtil.prototype.cacheTpls = function (tplIdsArr) {
        var dtd = $.Deferred(); // 新建一个deferred对象
        var v = this;
        var tplidArrReal = this.filterByMaping(tplIdsArr);
        var tplAjaxArr = [];
        for (var i = 0; i < tplidArrReal.length; i++) {
            var tplid = tplidArrReal[i];
            if (v.isNotCached(tplid)) {
                var url = v.getUrl(tplid);
                tplAjaxArr.push('$.ajax({dataType: "script",cache: true,url: "' + url + '"})');
            }
        }
        if (tplAjaxArr.length > 0) {
            var evalStr = '$.when(' + tplAjaxArr.join(",") + ')';
            var apermise = eval(evalStr);
            apermise.then(function () {
                dtd.resolve();
            }).fail(function (er) {
                //处理这个失败主要是为了防止因个别模版确失而造成页面不能渲染
                console.log("error in load tpl", er);
                dtd.resolve();
                //TODO  上报缺失了那个模板文件
            });
        }
        else {
            dtd.resolve();
            console.log("using cached");
        }
        return dtd;
    };
    TplUtil.prototype.getTplByIds = function (tplIds) {
        return this.cacheTpls(tplIds.split(","));
    };
    TplUtil.prototype.getTplsByRows = function (rows) {
        var tplIdsArr = [];
        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            tplIdsArr.push($.trim(row.tplid || ""));
        }
        return this.cacheTpls(tplIdsArr);
    };
    return TplUtil;
}());
