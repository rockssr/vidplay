var rule = {
    title:'影搜',
    host:'https://yingso.fun:3001/',
    url:'',
    detailUrl:'/pgc/view/web/season?season_id=fyid',
    filter_url:'fl={{fl}}',
    searchUrl:'/x/web-interface/search/type?keyword=**&page=fypage&search_type=',
    searchable:1,
    filterable:1,
    quickSearch:0,
	headers:{
		'User-Agent': PC_UA,
		'Accept': '*/*',
		'Referer': 'https://yingso.fun',
		'Content-Type': 'application/json'
	},
    timeout:5000,
    class_name:'电影&电视&短剧&动漫&综艺&教育&课程&书籍&音乐&其他',
    class_url:'dy&ds&dj&dm&zy&jy&kc&sj&yy&qt',
    play_parse:true,
    lazy:`js:
    input = panPlay(input,playObj.flag)
    `,
    limit:5,
    推荐:`js:
		function parseVodList(resp) {
			const jsons = resp;
			const videos = [];
			for(const item of jsons.data){
			let vod = [];
			if(item.root ==1)
			vod ={
					vod_id: 'https://www.aliyundrive.com/s/' + item.key,
					vod_name: item.title,
					vod_pic: 'https://inews.gtimg.com/newsapp_bt/0/13263837859/1000',
					vod_remarks: "",
			};
			else if(item.root == 2)
			vod ={
					vod_id: 'https://pan.quark.cn/s/' + item.key,
					vod_name: item.title,
					vod_pic: 'https://i2.100024.xyz/2024/03/15/o4d8hp.webp',
					vod_remarks: "",
				};
			else continue;
			videos.push(vod);
			}
			return videos;
		}

        let url = rule.homeUrl + "/v3/ali/all";

		let body = {"root":0, "pageSize": 30,"cat":"all","pageNum":1}
		let data = JSON.stringify(body)
		let html = request(url, {headers:rule.headers, body:data, method:'POST'}, true);
        let resp = JSON.parse(html);
        VODS = parseVodList(resp)
    `,
    一级:`js:
		function parseVodList(resp) {
			const jsons = resp;
			const videos = [];
			for(const item of jsons.data){
			let vod = [];
			if(item.root ==1)
			vod ={
					vod_id: 'https://www.aliyundrive.com/s/' + item.key,
					vod_name: item.title,
					vod_pic: 'https://inews.gtimg.com/newsapp_bt/0/13263837859/1000',
					vod_remarks: "",
			};
			else if(item.root == 2)
			vod ={
					vod_id: 'https://pan.quark.cn/s/' + item.key,
					vod_name: item.title,
					vod_pic: 'https://i2.100024.xyz/2024/03/15/o4d8hp.webp',
					vod_remarks: "",
				};
			else continue;
			videos.push(vod);
			}
			return videos;
		}

		let url = rule.homeUrl + "/v3/ali/all";
		let body = {"root":0,"pageSize": 30,"cat":MY_CATE,"pageNum":MY_PAGE};
		let data = JSON.stringify(body)
		let html = request(url, {headers:rule.headers, body:data, method:'POST'}, true);
		let resp = JSON.parse(html);
		VODS = parseVodList(resp)
    `,
     二级:`js:
        let id=input;
        let title="";
        let pic="";
        let typeName="";
        let dec=id;
        let remark="";
        let vod={vod_id:id,vod_name:title,vod_pic:pic,type_name:typeName,vod_remarks:remark,vod_content:dec};
        
        initPan();
        let panVod = panDetailContent(vod ,[input]);
        TABS = panVod.tabs
        LISTS = panVod.lists
        detailError = panVod.error
        vod["vod_play_from"]=panVod.tabs.join("$$$");

        for (var i in LISTS) {
            if (LISTS.hasOwnProperty(i)) {
              // print(i);
              try {
                LISTS[i] = LISTS[i].map(function (it) {
                  return it.split('$').slice(0, 2).join('$');
                });
              } catch (e) {
                print('格式化LISTS发生错误:' + e.message);
              }
            }
        }
        vod_play_url = LISTS.map(function (it) {
            return it.join('#');
        }).join("$$$");
        vod["vod_play_url"]=vod_play_url;
        VOD=vod;
     `,
    搜索:`js:
	function parseVodList(resp) {
		const jsons = resp;
		const videos = [];
		for(const item of jsons.data){
		let vod = [];
		if(item.root ==1)
		vod ={
				vod_id: 'https://www.aliyundrive.com/s/' + item.key,
				vod_name: item.title,
				vod_pic: 'https://inews.gtimg.com/newsapp_bt/0/13263837859/1000',
				vod_remarks: "",
		};
		else if(item.root == 2)
		vod ={
				vod_id: 'https://pan.quark.cn/s/' + item.key,
				vod_name: item.title,
				vod_pic: 'https://i2.100024.xyz/2024/03/15/o4d8hp.webp',
				vod_remarks: "",
			};
		else continue;
		videos.push(vod);
		}
		return videos;
	}

	let url = rule.homeUrl + "/v3/ali/search";
	let body = {"root":0,"pageSize": 30,"cat":"all","title":KEY,"pageNum":1};
	let data = JSON.stringify(body)
	let html = request(url, {headers:rule.headers, body:data, method:'POST'}, true);
	let resp = JSON.parse(html);
	VODS = parseVodList(resp)
    `,
}
