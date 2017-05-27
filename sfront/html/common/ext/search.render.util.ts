class SearchRenderUtil {
    juicer
    $
    JsonResultUtil
    kkpager

    constructor(juicer, jQuery, JsonResultUtil, kkpager) {
        this.juicer = juicer
        this.$ = jQuery
        this.JsonResultUtil = JsonResultUtil;
        this.kkpager = kkpager;
        juicer.register('jsonF', JSON.stringify);
    }

    tpls = {
        noresult: [
            ' <div class="vrTips" id="noresult_part1_container"><p class="icon_noRes"> 抱歉，没有找到与<span style="font-family:宋体">“</span>'
            , '    <em>$${queryWithXss}</em> <span style="font-family:宋体">”</span>相关的内容。 </p>'
            , '    <h3 class="p14" id="noresult_part3_container">建议您:</h3>'
            , '    <ol class="noResList">'
            , '        <li>请检查您输入的关键词是否有错误;</li>'
            , '        <li>换另一个相似的词，或常见的词试试;</li>'
            , '    </ol>'
            , '</div>',
        ], nomal: [
            '<div class="rb"><h3 class="pt">{@if row.____isDebug____==true}<div>${row.____xml____}</div>{@/if}'
            , '    {@if  row._needShowFileIcon }<img class="hb1" src="../../common/images/ui/${row.smallicon_title}.gif" alt="${row.smallicon_title}" title="${row.smallicon_title}"/>{@/if}'
            , '           <a class="dttl" target="_blank" href="${row.url}" >$${row.title}</a>'
            , '     {@if  row._needShowFileIcon }<a target="_blank"  href="${row.url}"><img width="41" title="下载" src="../../common/images/cloud/dldoc.gif" height="15" class="dldoc" alt="下载"></a>{@/if}'
            , '</h3>'
            , '    <div class="ft">$${row.content}'
            , '    </div>'
            , '    <div class="fb"><cite>${row.showurl}&nbsp;-&nbsp;${row.date}</cite></div>'
            , '</div>'
        ], vr: []
    }

    renderPage(json, page, pageContentId, callback) {
        var kkpageObj = null;
        var page = page || 1
        var totalPages = Math.floor(json.totalPages||1)
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

        if(totalPages>1){
            this.$("#" + pageContentId).show();
        } else {
            this.$("#" + pageContentId).hide();
        }
        return kkpageObj;
    };

    render({json, params, jout, pageId, pageFunctin, cacheAll, cacheKey,uuid}, isCache = true) {
        var juicer = this.juicer
        var $ = this.$
        var totalPages = json.totalPages || 0
        var html = "";
        var jpage = $("#" + pageId);
        var cache = cacheAll[cacheKey] = cacheAll[cacheKey] || {};
        if (totalPages >= 1 && json.totalItems > 0) {
            if (isCache) {
                cache.json = json;
            }
            var page = json.page;
            //重新渲染分页
            this.renderPage(json, page, pageId, pageFunctin)
            //渲染搜素搜索结果 ===================
            var arr = new this.JsonResultUtil().parseItems(json, params.idg);

            var tpl = "nomal";
            var juicer_tmp = [
                '{@each  rows as row,index}'
                , this.tpls[tpl].join("")
                , '{@/each}'
            ]
            html = juicer(juicer_tmp.join(""), {rows: arr, p: params})
        } else {
            html = juicer(this.tpls["noresult"].join(""), {queryWithXss: this.filterQueryXss(params)})
        }
        cache.html = html
        cache.ltime = new Date().getTime();
        if (jout) {  
            jout.html(html);

        }
        return html;
    }

    filterQueryXss(params: any) {
        return params.query.replace(/</gi, "&lt;").replace(/>/gi, "&gt;");

    }
}