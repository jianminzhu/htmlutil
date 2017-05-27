class JsonResultUtil {
    constructor(juicer) {
        /* juicer.register('vrid', function (obj, type) {
         return " id=sogou_vr_" + (obj.classid || "") + "_" + type + "_" + (obj.auto_id || "") + " ";
         });
         juicer.register('red', function (obj, type) {
         if(obj.indexOf("<")>-1){
         obj=$("<div>"+obj+"</div>").text();
         }
         return obj.replace(/\ue40a/gi, "<em><!--red_beg-->").replace(/\ue40b/gi, "<!--red_end--></em>");
         });*/
    }

    needShowFileIcon={ "DOC":true
        ,"PDF":true
        ,"PPT":true
        ,"XLS":true
        ,"RTF":true
        ,"TXT":true
    }
    sub  (str,n){
        var r=/[^\x00-\xff]/g;
        if(str.replace(r,"mm").length<=n){return str;}
        var m=Math.floor(n/2);
        for(var i=m;i<str.length;i++){
            if(str.substr(0,i).replace(r,"mm").length>=n){
                return str.substr(0,i)+"...";
            }
        }
        return str;
    }

    xml2obj(xml,isDebug) {
        if (xml) {
            var doc = this.parseXML(xml);
            var gt = this.gt;
            var tagtext = this.tagtext;
            if (doc && gt(doc, 'display')) {
                var tplid = gt(doc, 'tplid');
                var news = this.gt(doc, 'display');
                var obj = {};
                obj["url"] = tagtext(gt(news, 'url'));
                obj["showurl"] = tagtext(gt(news, 'showurl'));
                obj["title"] = this.sub(tagtext(gt(news, 'title')),50);
                obj["image"] = tagtext(gt(news, 'image'));
                // if(obj.image=="/0"){
                //     obj.image_change="/wechat/images/account/def.png";
                // }else{
                //     obj.image_change="http://img01.sogoucdn.com/net/a/04/link?appid=100520031&url="+obj.image;
                // }
                obj["content"] = tagtext(gt(news, 'content'));
                obj["docid"] = tagtext(gt(news, 'docid'));
                obj["date"] = tagtext(gt(doc, 'date'));
                obj["smallicon_title"] = this.tagattr(gt(doc, 'smallicon'), "title");
                obj["_needShowFileIcon"] = this.needShowFileIcon[obj["smallicon_title"]]||false;
                obj["____isDebug____"]=isDebug||false;
                if(isDebug){
                    obj["____xml____"] = xml;
                }
                return obj;
            }
        }
    }


    parseXML(data) {
        var xml;
        if (window.DOMParser) { // Standard
            var tmp = new DOMParser();
            xml = tmp.parseFromString(data, "text/xml");
        } else { // IE
            xml = new ActiveXObject("Microsoft.XMLDOM");
            xml.async = "false";
            xml.loadXML(data);
        }
        return xml.documentElement;
    }

    gt(e, n) {
        var a = e.getElementsByTagName(n);
        if (a && a.length > 0) {
            return a[0];
        }
        return null;
    }

    tagtext(obj) {
        if (!obj || obj.firstChild == null)
            return "";
        return obj.firstChild.nodeValue;
    }

    tagattr(obj, attrName) {
        if (obj) {
            try {
                var attributes = obj.attributes
                for (var key in attributes) {
                    var it = attributes[key]
                    if (it.nodeName == attrName) {
                        return it.nodeValue
                    }
                }
            } catch (e) {
            }
        }
        return "";
    }

    dealHtmlTagGtLt(text) {
        return (text || "" ).replace(/</gi, "&lt;").replace(/>/gi, "&gt;");
    };

    dealEm(str){
      var  str= str.replace(/\ue40a/gi, "<em>").replace(/\ue40b/gi, "</em>");
        var lenStart =str.split("<em>").length-1
        var lenEnd =str.split("</em>").length-1
        if(lenStart!=lenEnd){
            str+="</em>"
        }
        return str;
    }
    parseItems(data,isDebug) {
        var items = (data || {}).items || [];
        var arr = [];
        for (var i = 0; i < items.length; i++) {
            let row = this.xml2obj(items[i],isDebug);
            row["title"] = this.dealHtmlTagGtLt(row["title"])
            row["content"] = this.dealHtmlTagGtLt(row["content"])
            row["date"] = this.dealHtmlTagGtLt(row["date"])
            row["title"] =this.dealEm( row["title"])
            /*if( row["title"].indexOf("第二章")!=-1){
                alert(row["title"])
            }*/
            row["content"] = this.dealEm(row["content"] );
            arr.push(row);
        }
        return arr;
    }

    len(str) {
        if (str)
            return str.replace(/<.*?>/g, "").replace(/[^\x00-\xff]/g, "rr").replace(/&nbsp;/g, " ").length;
        return 0;
    }

    cutLength(str, maxLen, appended, appendLength) {
        appended = appended || "...";
        appendLength = appendLength || 2;
        str = str.replace(/<!.*?>/g, "");
        var len = this.len;
        if (len(str) > maxLen) {
            do {
                str = str.substring(0, str.length - 1);
            } while (str && (len(str) + appendLength > maxLen));
            if (str.lastIndexOf("</") != str.lastIndexOf("<")) {
                str = str.substring(0, str.lastIndexOf("<")) + str.substring(str.lastIndexOf(">") + 1);
            }
            return str + appended;
        }
        return str;
    }


    /* authname(auth_id) {
     if (auth_id == '1') {
     return '腾讯';
     } else if (auth_id == '2') {
     return '微信';
     } else if (auth_id == '4') {
     return '新浪';
     } else {
     return '微信';
     }
     }*/

    /*vrTimeHandle552(time) {
     if (time) {
     var d_minutes , d_hours, d_days;
     var timeNow = parseInt(new Date().getTime() / 1000);
     var d;
     d = timeNow - time;
     d_days = parseInt(d / 86400);
     d_hours = parseInt(d / 3600);
     d_minutes = parseInt(d / 60);
     if (d_days > 0 && d_days < 4) {
     return d_days + "天前";
     } else if (d_days <= 0 && d_hours > 0) {
     return d_hours + "小时前";
     } else if (d_hours <= 0 && d_minutes > 0) {
     return d_minutes + "分钟前";
     } else {
     var s = new Date(time * 1000);
     // s.getFullYear()+"年";
     return s.getFullYear()+"-"+(s.getMonth()+1)+"-"+s.getDate();
     }
     } else {
     return '';
     }
     }*/

    /* changeDataAndJuiceItem(juicer, items, page, tpltype, callback) {
     var cutLength = this.cutLength;
     var vrTimeHandle552 = this.vrTimeHandle552;
     var authname = this.authname;
     var list = [];
     var weixin_gen_html_auto_id = page * 10;
     for (var i = 0; i < items.length; i++) {//显示长字符截取，时间处理
     var obj = items[i];
     if (callback) {
     try {
     callback(obj, this)
     } catch (e) {
     }
     } else {
     obj.summary_changed = cutLength(obj.summary, 40, '...', 3);
     obj.sourcename_cut = cutLength(obj.sourcename, 16, '...', 3);
     obj.lastModified_changed = vrTimeHandle552(obj.lastModified);
     obj.auto_id = weixin_gen_html_auto_id++;
     obj.isShowName = false;
     if (obj.auth) {
     obj.auth_id__ = authname(obj.auth_id) + "认证：";
     }
     }
     list.push(obj);
     }
     return juicer(this.tpls[tpltype], {list: list, page: page});
     }
     tpls = {
     wgzh: ['<ul class="account_box_lst">{@each list as obj }'
     , '<li ${obj|vrid,"box"}>'
     , '    <a href="${obj.encGzhUrl}" data-encqrcodeurl="${obj.encQrcodeUrl}" class="account_box" uigs_exp_id="" ${obj|vrid,"link"}>'
     , '        <div class="pos-fx" id="account_share_new"></div>'
     , '        <div class="account_thumb" style="overflow:hidden;">'
     , '            <img src="${obj.image_change}" onload="vrImgHandle552(this,80,80)" onerror="imgErr(this.parentNode)" style="border: none; visibility: visible;" >'
     , '            <div class="account_thumb_bg"></div>'
     , '            <i class="ico_v2"></i>'
     , '        </div>'
     , '        <dl class="account_info_lst">'
     , '            <dd class="account_info_lit lst_wechat_txt">$${obj.name|red}</dd>'
     , '            <dt>微信号：</dt>'
     , '            <dd class="lst_wechat_txt">${obj.weixinhao}&nbsp;</dd>'
     , '            <dt>功能介绍：</dt>'
     , '            <dd ${obj|vrid,"summary"} class="lst_wechat_txt2" >$${obj.summary_changed|red}</dd>'
     , '            <dt>${obj.auth_id__}</dt>'
     , '            <dd class="lst_wechat_txt">${obj.auth }&nbsp; </dd>'
     , '        </dl>'
     , '    </a>'
     , '</li>'
     , '{@/each}</ul>'
     ].join("\n")
     , warticle: ['{@each list as obj }'
     , '<li ${obj|vrid,"box"} d="${obj.docid}">'
     , '    <a class="news_lst_tab2"'
     , '       href="${obj.encArticleUrl}"'
     , '       uigs_exp_id="" ${obj|vrid,"link"}>'
     , '        <div class="news_lst_thumb2">'
     , '            <img style="visibility: visible; height: 74px; margin-left: -18.5px;"'
     , '                 onload="vrImgFitLoad552(this,&quot;fit&quot;,74,74)" onerror="imgErr(this.parentNode)"'
     , '                 src="http://img01.sogoucdn.com/net/a/04/link?appid=100520077&url=${obj.imglink}">'
     , '        </div>'
     , '        <div class="news_txt_box2">'
     , '            <p>$${obj.title|red}</p>'
     , '            <p class="news_lst_txt3" style="display:none;"></p>'
     , '        </div>'
     , '        <div class="news_lst_info2" t="${obj.lastModified}">'
     , '            <span target="_blank" class="wx-name" i="${obj.openid}" style="display:none" title="${obj.sourcename}"'
     , '                  i="${obj.openid}">${obj.sourcename_cut}</span><span class="time">${obj.lastModified_changed}</span>'
     , '        </div>'
     , '    </a>'
     , '</li>'
     , '{@/each}'
     ].join("\n")
     , waparticle: ['<ul class="news_lst2">{@each list as obj }'
     , '<li ${obj|vrid,"box"} d="${obj.docid}">'
     ,'    <a class="news_lst_tab2"'
     ,'       href="${obj.encArticleUrl}"  '
     ,'       uigs_exp_id=""  ${obj|vrid,"link"}>'
     ,'        <div class="news_lst_thumb2">'
     ,'            <img style="visibility: visible; height: 74px; margin-left: -4px;"'
     ,'                 onload="vrImgFitLoad552(this,&quot;fit&quot;,74,74)" onerror="imgErr(this.parentNode)"'
     ,'                 src="http://img01.sogoucdn.com/net/a/04/link?appid=100520077&url=${obj.imglink}">'
     ,'        </div>'
     ,'        <div class="news_txt_box2">'
     ,'            <p >$${obj.title|red}</p>'
     ,'            <p class="news_lst_txt3" style="display:none;"></p>'
     ,'        </div>'
     ,'        <div class="news_lst_info2">'
     ,'          <div class="news_lst_info2-v1">'
     ,'              <span class="s1 wx-name" i="${obj.openid}"  title="${obj.sourcename}">${obj.sourcename}</span>'
     ,'               <span class="s2">${obj.lastModified_changed}</span>'
     ,'          </div>'
     ,'        </div>'
     ,'    </a>'
     ,'    <div class="function_bar"><a href="javascript:void(0)" class="btn_favorites"></a><a href="javascript:void(0)" class="btn_share"></a></div>'
     ,'</li>'
     , '{@/each}<ul>'
     ].join("\n")
     }
     */
}