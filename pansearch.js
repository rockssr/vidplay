var rule = {
	title:'盘搜搜索',
	host:'https://www.pansearch.me/',
	homeUrl:'/',
	url: '/forum-fyclass-fypage.html?',
	filter_url:'{{fl.class}}',
	filter:{
	},
	searchUrl: '/search?keyword=**',
	searchable:2,
	quickSearch:0,
	filterable:0,
	headers:{
		'User-Agent': PC_UA,
		'Accept': '*/*',
		'Referer': 'https://www.pansearch.me'
	},
	timeout:5000,
	play_parse:true,
	lazy:`js: 
input = panPlay(input,playObj.flag)
`,
	limit:6,
	推荐:'',
	一级:'',
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
	var buildId = "";
	function getBuildId(){
		const html = request(rule.homeUrl);
		const regex = /"buildId":"(.*?)"/;
		const match = regex.exec(html);
		if (match && match.length > 1) {
			buildId = match[1];
		}
	}

	function get_result(){
		const limit = 10;
		let offsetParam = '';
		const offset = (MY_PAGE - 1) * limit;
		if (offset > 0) {
			offsetParam = '&offset=' + offset;
		}
		const urls = rule.homeUrl + "_next/data/" + buildId + "/search.json?keyword=" + encodeURIComponent(KEY) + offsetParam;
		const result = JSON.parse(request(urls));
		const json = result.pageProps.data;
		const total = json.total;
		const videoIdSet = new Set();
		const videos = [];

		for (const item of json.data) {
			const content = item.content;
			let splitList = content.split('\\n');
			const img = item.image || (rule.homeUrl + "favicon.png");
			pdfh=jsp.pdfh;pdfa=jsp.pdfa;pd=jsp.pd;

			if (content.includes('1、')) {
				for (const line of splitList) {
					if (line === "") continue;
					let vodId = pdfh(line, 'a&&href');
					if (!vodId) continue;
					if (!vodId.includes('alipan.com') && !vodId.includes('quark.cn') && !vodId.includes('aliyundrive.com')) continue;
					videos.push({
						vod_id: vodId,
						vod_name: line.replaceAll(/<\\/?[^>]+>/g, "").replace(/[0-9]*、/g, '').replace(/:http.*/g, ''),
						vod_pic: img,
						vod_remarks: item.pan,
					});
				}
			} else {
				let vodId = pdfh(content, 'a&&href');
				const vodName = splitList[0].replaceAll(/<\\\\?[^>]+>/g, "").replace("名称：", "").replace("资源标题：", "");
				if (!vodId) continue;
				videos.push({
					vod_id: vodId,
					vod_name: vodName,
					vod_pic: img,
					vod_remarks: item.pan,
				});
			}

		}
		return videos;
	}
	if (!buildId.length) {
		getBuildId()
	}
	VODS = get_result();
`,
}
