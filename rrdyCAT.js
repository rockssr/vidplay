/**
 * 人人电影网 - Miraplay / CatPawOpen 播放源
 * 网站: https://www.rrdynb.com
 * 类型: 网盘资源站 (夸克/迅雷/百度网盘)
 * 说明: 本源为网盘资源站，点击播放将跳转到对应网盘页面
 */

import { load } from "cheerio";

const siteUrl = "https://www.rrdynb.com";

// 分类配置
// 注意：网站导航中"老电影"对应的路径是 /zongyi/，tid=10
const classes = [
  { type_id: "movie", type_name: "电影", tid: 2, path: "/movie/" },
  { type_id: "dianshiju", type_name: "电视剧", tid: 6, path: "/dianshiju/" },
  { type_id: "laodianying", type_name: "老电影", tid: 10, path: "/zongyi/" },
  { type_id: "dongman", type_name: "动漫", tid: 13, path: "/dongman/" },
];

// 类型筛选选项（所有分类通用）
const typeFilters = [
  { n: "全部", v: "" },
  { n: "剧情", v: "剧情" },
  { n: "喜剧", v: "喜剧" },
  { n: "动作", v: "动作" },
  { n: "爱情", v: "爱情" },
  { n: "科幻", v: "科幻" },
  { n: "悬疑", v: "悬疑" },
  { n: "惊悚", v: "惊悚" },
  { n: "恐怖", v: "恐怖" },
  { n: "犯罪", v: "犯罪" },
  { n: "冒险", v: "冒险" },
  { n: "奇幻", v: "奇幻" },
  { n: "家庭", v: "家庭" },
  { n: "动画", v: "动画" },
  { n: "纪录片", v: "纪录片" },
  { n: "战争", v: "战争" },
  { n: "历史", v: "历史" },
  { n: "传记", v: "传记" },
  { n: "音乐", v: "音乐" },
  { n: "运动", v: "运动" },
  { n: "歌舞", v: "歌舞" },
  { n: "西部", v: "西部" },
  { n: "古装", v: "古装" },
  { n: "武侠", v: "武侠" },
  { n: "灾难", v: "灾难" },
  { n: "儿童", v: "儿童" },
  { n: "黑色电影", v: "黑色电影" },
  { n: "真人秀", v: "真人秀" },
  { n: "舞台艺术", v: "舞台艺术" },
  { n: "鬼怪", v: "鬼怪" },
  { n: "惊栗", v: "惊栗" },
  { n: "同性", v: "同性" },
  { n: "短片", v: "短片" },
  { n: "情色", v: "情色" },
];

// 构建 filters 对象
const filters = {};
classes.forEach((c) => {
  filters[c.type_id] = [
    {
      key: "splxa",
      name: "类型",
      value: typeFilters,
    },
  ];
});

// 请求头
const headers = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Referer: siteUrl + "/",
};

/**
 * 清洗标题：去掉"百度云网盘夸克下载.阿里云盘.中字"等后缀，提取影片名和年份
 */
function cleanTitle(rawTitle) {
  if (!rawTitle) return "";
  let title = rawTitle.trim();
  // 提取《》中的名称
  const match = title.match(/《([^》]+)》/);
  if (match) {
    title = match[1];
  } else {
    // 去掉常见后缀
    title = title
      .replace(/百度云网盘.*$/g, "")
      .replace(/阿里云盘.*$/g, "")
      .replace(/夸克下载.*$/g, "")
      .replace(/\.中字.*$/g, "")
      .replace(/\.\d{4}.*$/g, "")
      .trim();
  }
  return title;
}

/**
 * 从标题中提取年份
 */
function extractYear(rawTitle) {
  if (!rawTitle) return "";
  const match = rawTitle.match(/\((\d{4})\)/);
  return match ? match[1] : "";
}

/**
 * HTTP 请求封装
 */
async function httpGet(url, opts = {}) {
  const finalHeaders = { ...headers, ...(opts.headers || {}) };
  try {
    if (typeof req === "function") {
      // CatVodOpen 环境的全局 req 函数
      const res = await req(url, {
        headers: finalHeaders,
        method: opts.method || "GET",
        data: opts.data,
      });
      if (typeof res === "string") return res;
      if (res && res.content) return res.content;
      if (res && res.body) return res.body;
      return JSON.stringify(res);
    }
  } catch (e) {
    // 回退到全局 fetch
  }
  // nodejs 全局 fetch 回退
  const res = await globalThis.fetch(url, {
    headers: finalHeaders,
    method: opts.method || "GET",
    body: opts.data,
  });
  return await res.text();
}

/**
 * 解析影片列表（分类页通用结构）
 */
function parseVodList(html) {
  const $ = load(html);
  const list = [];
  $("#movielist li.pure-g.shadow").each((i, el) => {
    const $el = $(el);
    const $thumb = $el.find("a.movie-thumbnails");
    const href = $thumb.attr("href") || "";
    const $img = $thumb.find("img");
    const pic = $img.attr("data-original") || $img.attr("src") || "";
    const $titleLink = $el.find("h2 a");
    const rawTitle =
      $titleLink.attr("title") || $titleLink.text().trim() || "";
    const title = cleanTitle(rawTitle);
    const year = extractYear(rawTitle);
    const brief = $el.find(".brief").text().trim();
    const date = $el.find(".tags").text().trim();
    const douban = $el.find(".dou b").text().trim();
    const imdb = $el.find(".imdb b").text().trim();

    // 从简介中提取导演、主演、类型
    let director = "";
    let actor = "";
    let type = "";
    let area = "";
    const dirMatch = brief.match(/导演:\s*([^编]+)/);
    if (dirMatch) director = dirMatch[1].trim();
    const actorMatch = brief.match(/主演:\s*([^类]+)/);
    if (actorMatch) actor = actorMatch[1].trim();
    const typeMatch = brief.match(/类型:\s*([^制]+)/);
    if (typeMatch) type = typeMatch[1].trim();
    const areaMatch = brief.match(/制片国家\/地区:\s*([^语]+)/);
    if (areaMatch) area = areaMatch[1].trim();

    // vod_id 使用相对路径（去掉开头 / 和结尾 .html）
    const vod_id = href.replace(/^\//, "").replace(/\.html$/, "");

    const remarks = [douban ? "豆瓣:" + douban : "", imdb ? "IMDB:" + imdb : ""]
      .filter(Boolean)
      .join(" ");

    list.push({
      vod_id,
      vod_name: title,
      vod_pic: pic,
      vod_remarks: remarks || date,
      vod_year: year,
      vod_area: area,
      vod_director: director,
      vod_actor: actor,
      type_name: type,
    });
  });
  return list;
}

/**
 * 解析首页推荐列表（stui-vodlist 结构）
 */
function parseHomeVodList(html) {
  const $ = load(html);
  const list = [];
  $("ul.stui-vodlist li").each((i, el) => {
    const $el = $(el);
    const $thumb = $el.find("a.stui-vodlist__thumb");
    const href = $thumb.attr("href") || "";
    if (
      !href ||
      (href.indexOf("/movie/") === -1 &&
        href.indexOf("/dianshiju/") === -1 &&
        href.indexOf("/zongyi/") === -1 &&
        href.indexOf("/dongman/") === -1)
    )
      return;
    const pic = $thumb.attr("data-original") || "";
    const $title = $el.find(".stui-vodlist__detail a");
    const rawTitle = $title.attr("title") || $title.text().trim() || "";
    const title = cleanTitle(rawTitle);
    const year = extractYear(rawTitle);
    const vod_id = href.replace(/^\//, "").replace(/\.html$/, "");
    if (vod_id && title) {
      list.push({
        vod_id,
        vod_name: title,
        vod_pic: pic,
        vod_year: year,
      });
    }
  });
  return list;
}

/**
 * 解析详情页
 */
function parseDetail(html, id) {
  const $ = load(html);
  const rawTitle = $("h1").first().text().trim();
  const title = cleanTitle(rawTitle);
  const year = extractYear(rawTitle);

  // 海报
  const pic = $(".movie-txt img").first().attr("src") || "";

  // 元信息
  let director = "";
  let writer = "";
  let actor = "";
  let type = "";
  let area = "";
  let language = "";
  let releaseDate = "";
  let runtime = "";
  let alias = "";
  let imdb = "";
  let content = "";

  $(".movie-txt div").each((i, el) => {
    const text = $(el).text().trim();
    if (text.startsWith("导演:")) director = text.replace("导演:", "").trim();
    else if (text.startsWith("编剧:")) writer = text.replace("编剧:", "").trim();
    else if (text.startsWith("主演:")) actor = text.replace("主演:", "").trim();
    else if (text.startsWith("类型:")) type = text.replace("类型:", "").trim();
    else if (text.startsWith("制片国家/地区:")) area = text.replace("制片国家/地区:", "").trim();
    else if (text.startsWith("语言:")) language = text.replace("语言:", "").trim();
    else if (text.startsWith("上映日期:")) releaseDate = text.replace("上映日期:", "").trim();
    else if (text.startsWith("片长:")) runtime = text.replace("片长:", "").trim();
    else if (text.startsWith("又名:")) alias = text.replace("又名:", "").trim();
    else if (text.startsWith("IMDb:")) imdb = text.replace("IMDb:", "").trim();
  });

  // 剧情简介
  const contentMatch = html.match(/剧情简介：<\/strong><\/span><\/span><\/div>\s*<div>\s*<span[^>]*>([\s\S]*?)<br/);
  if (contentMatch) {
    content = contentMatch[1]
      .replace(/<[^>]+>/g, "")
      .replace(/&[a-z]+;/g, (m) => {
        const map = { "&hellip;": "…", "&mdash;": "—", "&ndash;": "-", "&nbsp;": " ", "&amp;": "&", "&quot;": '"', "&lt;": "<", "&gt;": ">" };
        return map[m] || m;
      })
      .trim();
  }

  // 网盘链接
  const playFrom = [];
  const playUrl = [];

  // 夸克网盘
  const quarkLinks = [];
  $('.movie-txt a[href*="pan.quark.cn"]').each((i, el) => {
    const url = $(el).attr("href");
    const name = $(el).text().trim() || "夸克网盘";
    quarkLinks.push(name + "$" + url);
  });
  if (quarkLinks.length > 0) {
    playFrom.push("夸克网盘");
    playUrl.push(quarkLinks.join("#"));
  }

  // 迅雷云盘
  const xunleiLinks = [];
  $('.movie-txt a[href*="pan.xunlei.com"]').each((i, el) => {
    const url = $(el).attr("href");
    const name = $(el).text().trim() || "迅雷云盘";
    xunleiLinks.push(name + "$" + url);
  });
  if (xunleiLinks.length > 0) {
    playFrom.push("迅雷云盘");
    playUrl.push(xunleiLinks.join("#"));
  }

  // 百度网盘
  const baiduLinks = [];
  $('.movie-txt a[href*="pan.baidu.com"]').each((i, el) => {
    const url = $(el).attr("href");
    const name = $(el).text().trim() || "百度网盘";
    const pwdMatch = $(el).parent().text().match(/提取码[：:]\s*(\w+)/);
    const label = pwdMatch ? name + "(码:" + pwdMatch[1] + ")" : name;
    baiduLinks.push(label + "$" + url);
  });
  if (baiduLinks.length > 0) {
    playFrom.push("百度网盘");
    playUrl.push(baiduLinks.join("#"));
  }

  // 阿里云盘
  const aliLinks = [];
  $('.movie-txt a[href*="alipan.com"], .movie-txt a[href*="aliyundrive.com"]').each((i, el) => {
    const url = $(el).attr("href");
    const name = $(el).text().trim() || "阿里云盘";
    aliLinks.push(name + "$" + url);
  });
  if (aliLinks.length > 0) {
    playFrom.push("阿里云盘");
    playUrl.push(aliLinks.join("#"));
  }

  const vodDetail = {
    vod_id: id,
    vod_name: title,
    vod_pic: pic,
    type_name: type,
    vod_year: year,
    vod_area: area,
    vod_lang: language,
    vod_director: director,
    vod_actor: actor,
    vod_content: content || ("导演: " + director + " 主演: " + actor + " 简介: " + (alias ? "又名:" + alias : "")),
    vod_remarks: releaseDate ? "上映:" + releaseDate : runtime ? "片长:" + runtime : "",
    vod_play_from: playFrom.join("$$$"),
    vod_play_url: playUrl.join("$$$"),
  };

  return vodDetail;
}

/**
 * 解析搜索结果页
 */
function parseSearchList(html) {
  const $ = load(html);
  const list = [];
  $("a").each((i, el) => {
    const href = $(el).attr("href") || "";
    if (
      (href.indexOf("/movie/") !== -1 ||
        href.indexOf("/dianshiju/") !== -1 ||
        href.indexOf("/zongyi/") !== -1 ||
        href.indexOf("/dongman/") !== -1) &&
      href.indexOf(".html") !== -1
    ) {
      const rawTitle = $(el).attr("title") || $(el).text().trim();
      if (!rawTitle || rawTitle.length < 2) return;
      const title = cleanTitle(rawTitle);
      const vod_id = href.replace(/^\//, "").replace(/\.html$/, "");
      if (!list.find((item) => item.vod_id === vod_id)) {
        const $img = $(el).find("img");
        const pic = $img.attr("data-original") || $img.attr("src") || "";
        list.push({
          vod_id,
          vod_name: title,
          vod_pic: pic,
          vod_year: extractYear(rawTitle),
        });
      }
    }
  });
  return list;
}

// ==================== 标准接口 ====================

async function init(cfg) {
  return {
    class: classes.map((c) => ({
      type_id: c.type_id,
      type_name: c.type_name,
    })),
    filters: filters,
  };
}

async function home(filter) {
  return {
    class: classes.map((c) => ({
      type_id: c.type_id,
      type_name: c.type_name,
    })),
    filters: filters,
  };
}

async function homeVod() {
  try {
    const html = await httpGet(siteUrl + "/");
    const list = parseHomeVodList(html);
    if (list.length === 0) {
      const movieHtml = await httpGet(siteUrl + "/movie/");
      return { list: parseVodList(movieHtml) };
    }
    return { list };
  } catch (e) {
    return { list: [] };
  }
}

async function category(tid, pg, filter, extend) {
  const cls = classes.find((c) => c.type_id === tid);
  if (!cls) {
    return { page: pg, pagecount: 1, limit: 20, total: 0, list: [] };
  }

  const splxa = (extend && extend.splxa) || "";
  let url;

  if (splxa) {
    // 有类型筛选时使用筛选URL
    // 第一页: /plus/list.php?tid={tid}&splxa={类型}
    // 分页: /plus/list.php?tid={tid}&PageNo={page}&splxa={类型}
    if (!pg || pg <= 1) {
      url = siteUrl + "/plus/list.php?tid=" + cls.tid + "&splxa=" + encodeURIComponent(splxa);
    } else {
      url = siteUrl + "/plus/list.php?tid=" + cls.tid + "&PageNo=" + pg + "&splxa=" + encodeURIComponent(splxa);
    }
  } else {
    // 无筛选时使用分类页URL
    if (!pg || pg <= 1) {
      url = siteUrl + cls.path;
    } else {
      url = siteUrl + "/list_" + cls.tid + "_" + pg + ".html";
    }
  }

  try {
    const html = await httpGet(url);
    const list = parseVodList(html);

    // 估算总页数
    let pagecount = pg;
    const $ = load(html);
    $(".pagea a, .pageqq a").each((i, el) => {
      const href = $(el).attr("href") || "";
      // 分类页分页格式: list_X_Y.html
      const match1 = href.match(/list_\d+_(\d+)\.html/);
      if (match1) {
        const p = parseInt(match1[1]);
        if (p > pagecount) pagecount = p;
      }
      // 筛选页分页格式: PageNo=Y
      const match2 = href.match(/PageNo=(\d+)/);
      if (match2) {
        const p = parseInt(match2[1]);
        if (p > pagecount) pagecount = p;
      }
    });

    return {
      page: pg,
      pagecount: pagecount,
      limit: list.length,
      total: pagecount * list.length,
      list,
    };
  } catch (e) {
    return { page: pg, pagecount: 1, limit: 0, total: 0, list: [] };
  }
}

async function detail(id) {
  const url = siteUrl + "/" + id + ".html";
  try {
    const html = await httpGet(url);
    const vodDetail = parseDetail(html, id);
    return { list: [vodDetail] };
  } catch (e) {
    return { list: [] };
  }
}

async function play(flag, id, flags) {
  return {
    parse: 0,
    url: id,
    header: {
      Referer: siteUrl + "/",
      "User-Agent": headers["User-Agent"],
    },
  };
}

async function search(wd, quick) {
  try {
    const url =
      siteUrl +
      "/plus/search.php?q=" +
      encodeURIComponent(wd) +
      "&pagesize=10";
    const html = await httpGet(url);
    const list = parseSearchList(html);
    return { list };
  } catch (e) {
    return { list: [] };
  }
}

export function __jsEvalReturn() {
  return {
    init: init,
    home: home,
    homeVod: homeVod,
    category: category,
    detail: detail,
    play: play,
    search: search,
  };
}

export { init, home, homeVod, category, detail, play, search };
