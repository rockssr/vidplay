// ============================================
// LIBVIO - https://www.libvio.pw
// 站点类型: MacCMS (stui 模板)
// 播放机制:
//   1) 在线源: 详情页播放面板 -> /w/{id}-{sid}-{nid}.html
//      播放页内嵌 var player_aaaa = { url: "真实mp4直链" }
//   2) 网盘源: 详情页 netdisk-panel -> 夸克/迅雷网盘直链
//      走 panPlay / panDetailContent 解析
// 分类URL: /type/{id}-{page}.html  (第1页 /type/{id}-1.html 有效)
// 详情URL: /detail/{id}.html
// 搜索API: /index.php/ajax/suggest?mid=1&wd=**&limit=50
// 注意: 站点有 CDN PoW 人机验证(WAF), 播放器实际能否抓取需实测
// ============================================
muban.首图2.二级.title = '.vod-info .title&&Text'
muban.首图2.二级.img = '.vod-poster__wrap .lazyload&&data-original'
muban.首图2.二级.desc = '.vod-info .vod-rating .score&&Text;;'
muban.首图2.二级.content = '.vod-desc .detail-sketch&&Text'
var rule = {
	title: 'LIBVIO',
	模板: '首图2',
	host: 'https://www.libvio.pw',
	url: '/type/fyclass-fypage.html',
	filterable: 0,
	filter: {},
	headers: { //网站的请求头,完整支持所有的,常带ua和cookies
		'User-Agent': 'MOBILE_UA'
	},
	class_parse: '.stui-header__menu li:gt(0):lt(7);a&&Text;a&&href;/(\\d+).html',
	// 站点分类: 电影=1 剧集=2 番剧=4 日韩=15 欧美=16
	pagecount: {},
	二级: {
		"title": ".vod-info .title&&Text",
		"img": ".vod-poster__wrap .lazyload&&data-original",
		"desc": ".vod-info .vod-rating .score&&Text;;",
		"content": ".vod-desc .detail-sketch&&Text",
		"tabs": `js:
pdfh=jsp.pdfh;pdfa=jsp.pdfa;pd=jsp.pd;
TABS=[];LISTS=[];
// 解析详情页所有播放面板(在线播放源 + 网盘源)
let panels = pdfa(html, '.playlist-panel');
panels.forEach(function(p){
	let name = pdfh(p, '.panel-head h3&&Text');
	if(!name) return;
	TABS.push(name);
	let items = [];
	let links = pdfa(p, 'a');
	links.forEach(function(a){
		let href = pd(a, 'a&&href', HOST);
		let txt = pdfh(a, 'a&&Text');
		// 只保留: 站内在线播放页(/w/) 或 网盘链接
		let isPlay = href.indexOf('/w/') > -1;
		let isPan = /quark\.cn|baidu\.com|xunlei\.com|aliyundrive\.com|alipan\.com|115\.com|115cdn|guangyapan\.com|drive\.uc\.cn|anxia\.com/.test(href);
		if(href && (isPlay || isPan)){
			items.push([txt, href]);
			log("LIBVIO 捕获: " + txt + " -> " + href);
		}
	});
	LISTS.push(items);
});
if(TABS.length==0){ detailError='未找到播放源'; }
`,
		"lists": `js:`,
	},
	lazy: `js:
if(input.indexOf('/w/')>-1){
	// 站内在线播放页: 请求页面提取 var player_aaaa 中的真实视频地址
	let html = request(input);
	let m = html.match(/"url":"([^"]+)"/);
	if(m){
		input = m[1].replace(/\\\//g,'/');
		log("LIBVIO 播放直链: " + input);
	}
} else {
	// 网盘直链: 交给网盘解析
	input = panPlay(input, playObj.flag);
}
`,
	searchUrl: '/index.php/ajax/suggest?mid=1&wd=**&limit=50',
	detailUrl: '/detail/fyid.html', //非必填,二级详情拼接链接
	搜索: 'json:list;name;pic;;id',
}
