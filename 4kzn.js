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
    timeout: 8000,
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
        tabs: `js:
pdfh=jsp.pdfh;pdfa=jsp.pdfa;pd=jsp.pd;
TABS=[];LISTS=[];
let listurl=[];
let allATags=pdfa(html,'a');
allATags.forEach(function(a){
    let href=pd(a,'a&&href',HOST);
    if(href && (href.indexOf("pan.quark.cn")>-1 || href.indexOf("aliyundrive.com")>-1 || href.indexOf("alipan.com")>-1 || href.indexOf("115.com")>-1 || href.indexOf("pan.baidu.com")>-1 || href.indexOf("drive.uc.cn")>-1)){
        if(!listurl.includes(href)){
            listurl.push(href);
            log("4kzn捕获网盘链接："+href);
        }
    }
});
if(listurl.length){
    initPan();
    let alistVod=panDetailContent(vod,listurl);
    TABS=alistVod.tabs;
    LISTS=alistVod.lists;
    detailError=alistVod.error;
}else{
    log("4kzn未找到任何网盘链接");
}
`,
lists: `js:`,
},
    搜索: 'article.book-item;.item-title&&Text;img&&data-src;;a&&href',
}
