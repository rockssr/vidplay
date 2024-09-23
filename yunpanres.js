var rule = {
    title:'云盘资源网',
    host:'https://res.yunpan.win',
    url:'/?PageIndex=fypage&PageSize=12&Keyword=&Type=fyclass&Tag=',
    detailUrl:'/',
    searchUrl:'/?PageIndex=fypage&PageSize=12&Keyword=**&Type=&Tag=',
    searchable:1,
    filterable:1,
    quickSearch:0,
    timeout:30000,
    class_name:'全部&电影&电视剧&动画&纪录片&综艺',
    class_url:'&电影&电视剧&动画&纪录片&综艺',
    play_parse:true,
    lazy:`js:
    input = panPlay(input,playObj.flag)
    `,
    limit:5,
    推荐:'.card;.card-title&&Text;.col-md-4&&img&&src;.card-text:eq(1)&&Text;.card-link:eq(1)&&onclick',
    一级:'.card;.card-title&&Text;.col-md-4&&img&&src;.card-text:eq(1)&&Text;.card-link:eq(1)&&onclick',
	二级:`js:
	let matches=input.match(/open\\(\\'(.*)\\'\\)/);
    const urls = matches[1];
	let title="";
	let pic="";
	let typeName="";
	let dec=urls;
	let remark="";
	let vod={vod_id:urls,vod_name:title,vod_pic:pic,type_name:typeName,vod_remarks:remark,vod_content:dec};
	
	initPan();
	let panVod = panDetailContent(vod ,[urls]);
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
 搜索:'.card;.card-title&&Text;.col-md-4&&img&&src;.card-text:eq(1)&&Text;.card-link:eq(1)&&onclick',
}
