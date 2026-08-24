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
    timeout: 5000,
    class_name: '4K电影&最新资源&喜剧电影&剧集&系列合集&漫威合集&柯南剧场版',
    class_url: 'dianying&zuixin&xiju&zuixin-juji&xiliehj&manwei&mztkn',
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
    limit: 6,
    推荐: 'article.posts-item;.item-title&&Text;img&&data-src;;a&&href',
    一级: 'article.posts-item;.item-title&&Text;img&&data-src;;a&&href',
    二级: {
        title: "h1.site-name&&Text",
        img: ".book-cover img&&data-src",
        desc: ".content&&Text",
        content: ".content&&Text",
        tabs: `js: pdfh = jsp.pdfh;
        pdfa = jsp.pdfa;
        pd = jsp.pd;
TABS=[]
let d = pdfa(html, '.site-go a');
let listurl = [];
d.forEach(function(it) {
	let burl = pdfh(it, 'a&&href');
	if (burl && (burl.includes("quark.cn") || burl.includes("aliyundrive.com") || burl.includes("alipan.com") || burl.includes("115.com") || burl.includes("baidu.com"))){
		if (!listurl.includes(burl)) listurl.push(burl);
	}
});
if (listurl.length){
	initPan();
	let alistVod = panDetailContent(vod ,listurl);
	TABS = alistVod.tabs
	LISTS = alistVod.lists
	detailError = alistVod.error
}
`,
lists: `js:`,
}, 搜索: 'article.posts-item;.item-title&&Text;img&&data-src;;a&&href',
}
