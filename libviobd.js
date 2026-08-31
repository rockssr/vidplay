// ============================================
// LIBVIO - https://www.libvio.pw  (DRPY_Crack 协议)
// 站点类型: MacCMS (stui 模板)
// 说明: 与多多.js 同协议(DRPY_Crack), 播放器可直接解析
// 播放机制:
//   1) 在线源: 详情页播放面板 -> /w/{id}-{sid}-{nid}.html
//      播放页内嵌 var player_aaaa = { url: "真实mp4直链" }
//   2) 网盘源: 详情页 netdisk-panel -> 夸克/迅雷网盘直链
//      走 panPlay / panDetailContent 解析
// 分类URL: /type/{id}-{page}.html  (第1页 /type/{id}-1.html 有效)
// 详情URL: /detail/{id}.html
// 搜索API: /index.php/ajax/suggest?mid=1&wd=**&limit=50
// ============================================
var rule = {
    title: 'LIBVIO',
    host: 'https://www.libvio.pw',
    homeUrl: '/',
    url: '/type/fyclass-fypage.html',
    filter_url: '{{fl.class}}',
    filter: {},
    searchUrl: '/index.php/ajax/suggest?mid=1&wd=**&limit=50',
    searchable: 2,
    quickSearch: 1,
    filterable: 0,
    headers: {
        'User-Agent': 'MOBILE_UA',
        'Cookie': ''
    },
    timeout: 10000,
    class_name: '电影&剧集&番剧&日韩&欧美',
    class_url: '1&2&4&15&16',
    play_parse: true,
    play_json: [{
        re: '*',
        json: {
            parse: 0,
            jx: 0
        }
    }],
	lazy:`js:
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
    推荐: 'div[class="stui-vodlist__box"];.title a&&Text;.stui-vodlist__thumb&&data-original;;a&&href',
    一级: 'div[class="stui-vodlist__box"];.title a&&Text;.stui-vodlist__thumb&&data-original;;a&&href',
    二级: {
        title: ".vod-info .title&&Text",
        img: ".vod-poster__wrap .lazyload&&data-original",
        desc: ".vod-info .vod-rating .score&&Text;;",
        content: ".vod-desc .detail-sketch&&Text",
        tabs: `js: pdfh = jsp.pdfh;
pdfa = jsp.pdfa;
pd = jsp.pd;
TABS=[];
LISTS=[];
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
lists: `js:`,
},
    搜索: 'json:list;name;pic;;id',
}
