class SearchRenderUtil {
    juicer
    $
    JsonResultUtil
    kkpager
    TplUtil

    constructor(juicer, jQuery, JsonResultUtil, kkpager,TplUtil) {
        this.juicer = juicer
        this.$ = jQuery
        this.JsonResultUtil = JsonResultUtil;
        this.kkpager = kkpager;
        this.TplUtil=TplUtil
        juicer.register('jsonF', JSON.stringify);
    }


    renderPage(json, page, pageContentId, callback) {
        var kkpageObj = null;
        var page = page || 1
        var totalPages = Math.floor(json.totalPages || 1)
        var totalNum = Math.floor(json.totalItems)
        if (totalPages >= 1) {
            kkpageObj = new this.kkpager(pageContentId, 10).generPageHtml({
                pno: page,
                //总页码
                total: totalPages,
                //总数据条数
                totalRecords: totalNum,
                mode: 'click',
                click: function (n) {
                    this.selectPage(n);
                    try {
                        callback(n)
                    }
                    catch (e) {
                    }
                    return false;
                }
            });
            var body = this.$("body");
            var top = body.scrollTop()
            if (top != 0) {
                body.animate({scrollTop: 0}, '300');
            }
        }
        if (totalPages > 1) {
            this.$("#" + pageContentId).show();
        } else {
            this.$("#" + pageContentId).hide();
        }
        return kkpageObj;
    };

    render({json, params, jout, pageId, pageFunctin, cacheAll, cacheKey, uuid}, isCache = true) {
        var juicer = this.juicer
        var $ = this.$
        var totalPages = json.totalPages || 0
        var html = "";
        var cache = cacheAll[cacheKey] = cacheAll[cacheKey] || {};
        let renderToPage = function (html) {
            cache.html = html
            cache.ltime = new Date().getTime();
            if (jout) {
                jout.html(html);

            }
        };
        var tplUtil = new this.TplUtil();
        if (totalPages >= 1 && json.totalItems > 0) {
            if (isCache) {
                cache.json = json;
            }
            var page = json.page;
            //重新渲染分页
            this.renderPage(json, page, pageId, pageFunctin)
            //搜索结果 ===================
            var rows = new this.JsonResultUtil().parseItems(json, params.idg);

            tplUtil.getTplsByRows(rows).done(function () {
                for (var i = 0, len = rows.length; i < len; i++) {
                    var row = rows[i]
                    var tpl = tplUtil.getRenderTpl(row["tplid"]);
                    html += juicer(tpl, {row: row, p: params})
                }
                renderToPage(html);
            })
        } else {
            html = juicer(tplUtil.getRenderTpl("noresult"), {queryWithXss: this.filterQueryXss(params)})
            renderToPage(html);
        }
        return html;
    }

    filterQueryXss(params: any) {
        return params.query.replace(/</gi, "&lt;").replace(/>/gi, "&gt;");

    }
}