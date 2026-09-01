// ============================================
// LIBVIO.Link 修复版 - https://www.libvio.pw
// ----------------------------------------------------------
// 为什么原版“获取不到影片信息”（已实测确认）：
//   libvio.pw 启用了 CDN 浏览器验证墙(响应头 x-cdn-challenge: required)。
//   它同时校验两样东西：
//     (1) 真实浏览器 TLS/JA3 + HTTP/2 指纹；
//     (2) 浏览器跑完 JS 验证后下发的 __cdn_verified Cookie。
//   播放器里的 request() 是纯 HTTP 客户端(非浏览器 TLS 栈)，即使把
//   Cookie 和浏览器头都填进去，CDN 仍按 TLS 指纹拒绝(实测 curl 带
//   刚生成的 Cookie 依旧 403；而真实 Chromium 同环境下 200 正常)。
//   → 所以【单靠修改本规则无法过墙】，必须让抓取走“真实浏览器通道”。
//
// 让本规则真正可用(三选一)：
//   A) 用支持真实浏览器的“爬虫/蜘蛛”加载本规则(播放器内置 WebView/浏览器
//      爬虫，或自建 Playwright/Puppeteer 代理把站点暴露给播放器，host 改填代理地址)。
//   B) host 改为不受此墙的镜像/备用域名(.me/.tv/.cc 等)。
//   C) 若播放器请求本身走浏览器指纹(client-hello 像 Chrome)，则下方
//      headers(含 __cdn_verified)可直接生效——过期后用 gen_libvio_cookie.py 刷新。
//
// 本版已修正的规则逻辑(经真实页面核对无误)：
//   1) 移除原误用的 filter_url:'{{fl.class}}'。filterable:0 时无效，
//      列表分页由 url 的 fyclass/fypage 占位符处理(实测 /type/1-1.html 返回 12 卡片)。
//   2) 二级同时抓取两种源：
//        在线源：.play-btn a -> /w/{id}-{sid}-{nid}.html
//        网盘源：.playlist-panel(视频下载 夸克/迅雷/百度)
//      原版只解析 .playlist-panel，漏掉了在线播放入口。
//   3) /w/ 播放页必须带 Referer(对应详情页)否则 CDN 403；直链在
//      var player_aaaa 的 "url" 字段。
//   4) 一级/详情选择器与线上 stui 模板一致(stui-vodlist__box / vod-poster__wrap
//      / vod-desc .detail-sketch / panel-head h3 均已核对存在)。
// ============================================
var rule = {
    title: 'LIBVIO',
    host: 'https://www.libvio.pw',
    homeUrl: '/',
    url: '/type/fyclass-fypage.html',
    filter: {},
    searchUrl: '/index.php/ajax/suggest?mid=1&wd=**&limit=50',
    searchable: 2,
    quickSearch: 1,
    filterable: 0,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate',
        'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
        // ★ 该 Cookie 由浏览器过验证后下发, 有时效; 仅在抓取走真实浏览器(方案A/C)时有效。
        //   普通 request() 即便带此 Cookie 也会被 CDN 按 TLS 指纹拒绝。过期后用
        //   gen_libvio_cookie.py 重新生成并替换本行整段值。
        'Cookie': '__cdn_verified=1788232535_25326_3f9c3252f466e5ec8bbd4cec6ef99df435510087d0abf73880d1165de7685d62'
    },
    timeout: 15000,
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
    lazy: `js:
    if(input.indexOf('/w/') > -1){
        // 站内在线播放页: 必须带 Referer(详情页), 否则 CDN 返回 403
        let mId = input.match(/\/w\/(\d+)-/);
        let ref = HOST + (mId ? '/detail/' + mId[1] + '.html' : '/');
        let html = request({url: input, headers: {'Referer': ref}});
        let m = html.match(/"url":"([^"]+)"/);
        if(m){
            input = m[1].replace(/\\\//g, '/');
            log("LIBVIO 播放直链: " + input);
        }
    } else {
        // 网盘直链: 交给网盘解析
        input = panPlay(input, playObj ? playObj.flag : '');
    }
    `,
    推荐: 'div[class="stui-vodlist__box"];.title a&&Text;.stui-vodlist__thumb&&data-original;;a&&href',
    一级: 'div[class="stui-vodlist__box"];.title a&&Text;.stui-vodlist__thumb&&data-original;;a&&href',
    二级: {
        title: ".vod-info .title&&Text",
        img: ".vod-poster__wrap .lazyload&&data-original",
        desc: ".vod-info .vod-rating .score&&Text;;",
        content: ".vod-desc .detail-sketch&&Text",
        tabs: `js:
        pdfh = jsp.pdfh;
        pdfa = jsp.pdfa;
        pd = jsp.pd;
        TABS = [];
        LISTS = [];
        // 在线播放源: .play-btn -> /w/{id}-{sid}-{nid}.html
        let pbs = pdfa(html, '.play-btn a');
        pbs.forEach(function(a){
            let href = pd(a, 'a&&href', HOST);
            if(href && href.indexOf('/w/') > -1){
                TABS.push('在线');
                LISTS.push([[pdfh(a, 'a&&Text') || '立即播放', href]]);
                log('LIBVIO 在线: ' + href);
            }
        });
        // 网盘源面板: .playlist-panel (视频下载 夸克/迅雷/百度)
        let panels = pdfa(html, '.playlist-panel');
        panels.forEach(function(p){
            let name = pdfh(p, '.panel-head h3&&Text');
            if(!name) name = '网盘';
            let items = [];
            let links = pdfa(p, 'a');
            links.forEach(function(a){
                let href = pd(a, 'a&&href', HOST);
                let txt = pdfh(a, 'a&&Text');
                let isPan = /quark\.cn|baidu\.com|xunlei\.com|aliyundrive\.com|alipan\.com|115\.com|115cdn|guangyapan\.com|drive\.uc\.cn|anxia\.com/.test(href);
                if(href && (href.indexOf('/w/') > -1 || isPan)){
                    items.push([txt, href]);
                    log('LIBVIO 捕获: ' + txt + ' -> ' + href);
                }
            });
            if(items.length > 0){ TABS.push(name); LISTS.push(items); }
        });
        if(TABS.length == 0){ detailError = '未找到播放源'; }
        `,
        lists: `js:`,
    },
    搜索: 'json:list;name;pic;;id',
}
