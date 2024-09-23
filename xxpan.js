var rule = {
    title:'小盘盘',
    host:'https://xpanpan.site',
    url:'/category/fyclass/page/fypage',
    detailUrl:'/fyid.html',
    searchUrl:'/page/fypage?s=**',
    searchable:1,
    filterable:1,
	headers:{
		'User-Agent': PC_UA,
		'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
		'Referer': ''
	},
    quickSearch:0,
    timeout:30000,
    class_name:'影视天地&动漫天地&阿里云盘&夸克网盘&移动云盘&百度网盘&迅雷云盘&UC网盘',
    class_url:'video-tv-list&cartoon-list&ali-yun-pan-list&kua-ke-wang-pan-list&zy&yi-dong-yun-pan-list&bai-du-wang-pan-list&xun-lei-yun-pan-list&uc-wang-pan-list',
    play_parse:true,
    lazy:`js:
    input = panPlay(input,playObj.flag)
    `,
    limit:5,
    推荐:'.content-area&&.bloglo-flex-row&&.col-md-12;.entry-title&&a&&title;;.entry-title&&.post-category&&a&&Text;.entry-title&&a&&href',
    一级:'.content-area&&.bloglo-flex-row&&.col-md-12;.entry-title&&a&&title;;.entry-title&&.post-category&&a&&Text;.entry-title&&a&&href',
    二级: {
        title: ".entry-content&&h6&&Text",
        img: "",
        desc: "",
        content: "",
        tabs: `js: pdfh = jsp.pdfh;
        pdfa = jsp.pdfa;
        pd = jsp.pd;
TABS=[]
let d = pdfa(html, 'div.entry-content ul li a');
let listurl = [];
d.forEach(function(it) {
	let burl = pdfh(it, 'a&&href');
	listurl.push(burl);
});
if (listurl.length){
	initPan();
	let alistVod = panDetailContent(vod ,listurl);
	TABS = alistVod.tabs
	LISTS = alistVod.lists
	detailError = alistVod.error
}
`,lists: `js:`,
}, 
 搜索:'.content-area&&.bloglo-flex-row&&.col-md-12;.entry-title&&a&&title;;.entry-title&&.post-category&&a&&Text;.entry-title&&a&&href',
}
