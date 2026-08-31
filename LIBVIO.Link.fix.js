// ============================================
// LIBVIO.Link 修复版 - https://www.libvio.pw
// 修复说明 (原 GitHub LIBVIO.Link.js 无显示的原因):
//   1) url 用 '/show/fyclassfyfilter.html' -> libvio.pw 已改版为 stui 模板,
//      /show/ URL 返回空页面(0影片卡片), 列表无数据显示  << 主因
//      实际有效列表 URL: /type/{id}-{page}.html
//   2) host 末尾带 '/' -> 规范要求 host 不带末尾斜杠
//   3) 原为 muban 模板协议(模板:'首图2') -> 播放器若走 DRPY_Crack 协议则无法解析
//      本版改用 DRPY_Crack 协议(与多多.js 一致), 不依赖内置模板
//   4) libvio.pw 有 CDN PoW WAF, 播放器实际抓取需实测
// 播放机制:
//   1) 在线源: 详情页播放面板 -> /w/{id}-{sid}-{nid}.html
//      播放页内嵌 var player_aaaa = { url: "真实mp4直链" }
//   2) 网盘源: 详情页 netdisk-panel -> 夸克/迅雷网盘直链 -> panPlay
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
