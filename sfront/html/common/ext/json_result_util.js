var JsonResultUtil = (function () {
    function JsonResultUtil(juicer) {
        this.needShowFileIcon = { "DOC": true,
            "PDF": true,
            "PPT": true,
            "XLS": true,
            "RTF": true,
            "TXT": true
        };
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
    JsonResultUtil.prototype.sub = function (str, n) {
        var r = /[^\x00-\xff]/g;
        if (str.replace(r, "mm").length <= n) {
            return str;
        }
        var m = Math.floor(n / 2);
        for (var i = m; i < str.length; i++) {
            if (str.substr(0, i).replace(r, "mm").length >= n) {
                return str.substr(0, i) + "...";
            }
        }
        return str;
    };
    JsonResultUtil.prototype.xml2obj = function (xml, isDebug) {
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
                obj["title"] = this.sub(tagtext(gt(news, 'title')), 50);
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
                obj["_needShowFileIcon"] = this.needShowFileIcon[obj["smallicon_title"]] || false;
                obj["____isDebug____"] = isDebug || false;
                if (isDebug) {
                    obj["____xml____"] = xml;
                }
                return obj;
            }
        }
    };
    JsonResultUtil.prototype.parseXML = function (data) {
        var xml;
        if (window.DOMParser) {
            var tmp = new DOMParser();
            xml = tmp.parseFromString(data, "text/xml");
        }
        else {
            xml = new ActiveXObject("Microsoft.XMLDOM");
            xml.async = "false";
            xml.loadXML(data);
        }
        return xml.documentElement;
    };
    JsonResultUtil.prototype.gt = function (e, n) {
        var a = e.getElementsByTagName(n);
        if (a && a.length > 0) {
            return a[0];
        }
        return null;
    };
    JsonResultUtil.prototype.tagtext = function (obj) {
        if (!obj || obj.firstChild == null)
            return "";
        return obj.firstChild.nodeValue;
    };
    JsonResultUtil.prototype.tagattr = function (obj, attrName) {
        if (obj) {
            try {
                var attributes = obj.attributes;
                for (var key in attributes) {
                    var it = attributes[key];
                    if (it.nodeName == attrName) {
                        return it.nodeValue;
                    }
                }
            }
            catch (e) {
            }
        }
        return "";
    };
    JsonResultUtil.prototype.dealHtmlTagGtLt = function (text) {
        return (text || "").replace(/</gi, "&lt;").replace(/>/gi, "&gt;");
    };
    ;
    JsonResultUtil.prototype.dealEm = function (str) {
        var str = str.replace(/\ue40a/gi, "<em>").replace(/\ue40b/gi, "</em>");
        var lenStart = str.split("<em>").length - 1;
        var lenEnd = str.split("</em>").length - 1;
        if (lenStart != lenEnd) {
            str += "</em>";
        }
        return str;
    };
    JsonResultUtil.prototype.parseItems = function (data, isDebug) {
        var items = (data || {}).items || [];
        var arr = [];
        for (var i = 0; i < items.length; i++) {
            var row = this.xml2obj(items[i], isDebug);
            row["title"] = this.dealHtmlTagGtLt(row["title"]);
            row["content"] = this.dealHtmlTagGtLt(row["content"]);
            row["date"] = this.dealHtmlTagGtLt(row["date"]);
            row["title"] = this.dealEm(row["title"]);
            /*if( row["title"].indexOf("第二章")!=-1){
                alert(row["title"])
            }*/
            row["content"] = this.dealEm(row["content"]);
            arr.push(row);
        }
        return arr;
    };
    JsonResultUtil.prototype.len = function (str) {
        if (str)
            return str.replace(/<.*?>/g, "").replace(/[^\x00-\xff]/g, "rr").replace(/&nbsp;/g, " ").length;
        return 0;
    };
    JsonResultUtil.prototype.cutLength = function (str, maxLen, appended, appendLength) {
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
    };
    return JsonResultUtil;
}());
