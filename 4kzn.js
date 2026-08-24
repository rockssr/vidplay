var rule = {
    title: '4K指南',
    host: 'https://4kzn.cc',
    homeUrl: '/',
    url: '/books/fyclass/page/fypage',
    filter_url: '{{fl.class}}',
    filter: {},
    searchUrl: '/?s=**',
    searchable: 2,
    quickSearch: 1,
    filterable: 0,
    headers: {
        'User-Agent': 'MOBILE_UA',
        'Cookie': ''
    },
    timeout: 10000,
    class_name: '4K电影&最新资源&剧情电影&喜剧电影&历史电影&传记电影&剧集&漫威合集&柯南剧场版',
    class_url: 'dianying&zuixin&juqing&xiju&lishi&zhuanji&zuixin-juji&manwei&mztkn',
    play_parse: true,
    play_json: [{
        re: '*',
        json: {
            parse: 0,
            jx: 0
        }
    }],
	lazy:`js:
	input = panPlay(input,playObj.flag)
	`,
    推荐: 'article.book-item;.item-title&&Text;img&&data-src;;a&&href',
    一级: 'article.book-item;.item-title&&Text;img&&data-src;;a&&href',
    二级: {
        title: "h1.site-name&&Text",
        img: ".book-cover img&&data-src",
        desc: ".content&&Text",
        content: ".content&&Text",
        tabs: `js: pdfh = jsp.pdfh;
pdfa = jsp.pdfa;
pd = jsp.pd;
TABS=[];
LISTS=[];
let d = pdfa(html, '.site-go a');
if(!d || d.length==0){ d = pdfa(html, 'a'); }
let listurl = [];
log("4kzn下载按钮数:" + d.length);
d.forEach(function(it) {
    let burl = pdfh(it, 'a&&href');
    if(!burl) return;
    if(burl.indexOf("pan.quark.cn")>-1 || burl.indexOf("pan.baidu.com")>-1 || burl.indexOf("pan.xunlei.com")>-1 || burl.indexOf("aliyundrive.com")>-1 || burl.indexOf("alipan.com")>-1 || burl.indexOf("115.com")>-1 || burl.indexOf("guangyapan.com")>-1 || burl.indexOf("drive.uc.cn")>-1){
        if(!listurl.includes(burl)){
            listurl.push(burl);
            log("4kzn捕获网盘:" + burl);
        }
    }
});
log("4kzn共捕获网盘链接数:" + listurl.length);
if (listurl.length){
    initPan();
    log("4kzn调用panDetailContent, vod:" + (vod?vod.name:"null"));
    let alistVod = panDetailContent(vod ,listurl);
    log("4kzn解析结果 tabs:" + JSON.stringify(alistVod.tabs) + " lists数:" + (alistVod.lists?alistVod.lists.length:0) + " error:" + (alistVod.error?alistVod.error:"无"));
    TABS = alistVod.tabs
    LISTS = alistVod.lists
    detailError = alistVod.error
}else{
    detailError = "4kzn未找到网盘链接";
    log("4kzn未找到任何网盘链接");
}
`,
lists: `js:`,
},
    搜索: 'article.book-item;.item-title&&Text;img&&data-src;;a&&href',
}
