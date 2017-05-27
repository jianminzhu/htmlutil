$(function () {
    console.log("start")

    function parseURL(url) {
        var a = document.createElement('a');
        a.href = url;
        return {
            source: url,
            protocol: a.protocol.replace(':', ''),
            host: a.hostname,
            port: a.port,
            query: a.search,
            params: (function () {
                var ret = {},
                    seg = a.search.replace(/^\?/, '').split('&'),
                    len = seg.length, i = 0, s;
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

    function hasExtName(file){
        var lastPoint=file.lastIndexOf(".")
        if( file.indexOf(".")!=-1){
            return true;
        }
        return false;

    }
    $("body").on("click", '[name="b_change" ]', function () {
        var curlcmdArr = $('[name="curlcmd"]').val().split("\n")
        //TODO change to -o
        var curlcmdOutArr=[]
        var dirArr=[]
        curlcmdArr.forEach(function (row, index) {
            var rowSplitArr=row.split(" ")
            rowSplitArr.forEach(function (it:string, index) {
                if(it.substr(1,4)=="http"){
                    var p = parseURL(it)
                    var file=p.file.replace(/%22/gi,"")
                    var path=p.path.replace(/%22|https:\/\/|http:\/\//gi,"").substr(1)
                    var hasExt = hasExtName(file);
                    var mkdir ="mkdir -p "+(hasExt?path.substr(0,path.length-file.length):path)
                    dirArr.push(mkdir)
                    var outFile=path
                    if(!hasExt){
                        outFile=path+"/"+"_.html"
                    }
                    curlcmdOutArr.push(`curl -o "${outFile}" ${it} `)
                }
            })
        })

        $('[name="curlcmdout"]').val(dirArr.join("\n")+"\n\n\n"+ curlcmdOutArr.join("\n"))
    })
})

