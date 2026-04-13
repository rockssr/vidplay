// FLgens 影視源
// 網站: https://www.flgens.com
// 類型: MacCMS HTML 抓取 + player_aaaa 直接提取 m3u8

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const SITE = 'https://www.flgens.com';

const CATEGORIES = [
  { id: '1', name: '電影' },
  { id: '13', name: '國產劇' },
  { id: '14', name: '港台劇' },
  { id: '15', name: '歐美劇' },
  { id: '16', name: '日韓劇' },
  { id: '4', name: '動漫' },
  { id: '3', name: '綜藝' }
];

function base64Decode(str) {
  try {
    const CryptoJS = createCryptoJS();
    return CryptoJS.enc.Utf8.stringify(CryptoJS.enc.Base64.parse(str));
  } catch (e) {
    return '';
  }
}

async function getLocalInfo() {
  return jsonify({
    ver: 1,
    name: 'FLgens',
    api: 'csp_flgens',
    type: 3
  });
}

async function getConfig() {
  const tabs = CATEGORIES.map(c => ({
    name: c.name,
    ext: { id: c.id }
  }));
  return jsonify({
    ver: 1,
    title: 'FLgens',
    site: SITE,
    tabs
  });
}

async function getCards(ext) {
  ext = argsify(ext);
  const { id, page = 1 } = ext;

  const url = page === 1
    ? `${SITE}/vodtype/${id}/`
    : `${SITE}/vodtype/${id}-${page}/`;

  const { data } = await $fetch.get(url, {
    headers: { 'User-Agent': UA, 'Referer': SITE + '/' }
  });

  const cheerio = createCheerio();
  const $ = cheerio.load(data);
  const list = [];

  $('#list li').each((i, el) => {
    const $a = $(el).find('a').first();
    const href = $a.attr('href') || '';
    const name = $a.find('span').text().trim();
    const pic = $a.find('img').attr('data-original') || $a.find('img').attr('src') || '';

    // href: /vodplay/{id}-{sid}-{nid}/
    const match = href.match(/\/vodplay\/(\d+)-(\d+)-(\d+)\//);
    if (match && name) {
      list.push({
        vod_id: match[1],
        vod_name: name,
        vod_pic: pic,
        ext: { id: match[1], sid: match[2], nid: match[3] }
      });
    }
  });

  return jsonify({ list, page });
}

async function getTracks(ext) {
  ext = argsify(ext);
  const { id, sid = 1, nid = 1 } = ext;

  const url = `${SITE}/vodplay/${id}-${sid}-${nid}/`;
  const { data } = await $fetch.get(url, {
    headers: { 'User-Agent': UA, 'Referer': SITE + '/' }
  });

  const cheerio = createCheerio();
  const $ = cheerio.load(data);

  // 提取 player_aaaa JSON（用大括號計數處理嵌套）
  let videoUrl = '';
  let vodName = '';
  const startIdx = data.indexOf('var player_aaaa=');
  if (startIdx !== -1) {
    const jsonStart = data.indexOf('{', startIdx);
    if (jsonStart !== -1) {
      let depth = 0, jsonEnd = -1;
      for (let i = jsonStart; i < data.length; i++) {
        if (data[i] === '{') depth++;
        if (data[i] === '}') depth--;
        if (depth === 0) { jsonEnd = i; break; }
      }
      if (jsonEnd !== -1) {
        try {
          const playerData = JSON.parse(data.substring(jsonStart, jsonEnd + 1));
          videoUrl = playerData.url || '';
          vodName = playerData.vod_data?.vod_name || '';
        } catch (e) {
          // JSON 解析失敗
        }
      }
    }
  }

  // 收集所有集數
  const tracks = [];
  const seen = new Set();

  // 從 #nav 提取集數連結
  $('#nav a').each((i, el) => {
    const href = $(el).attr('href') || '';
    const name = $(el).text().trim();
    const epMatch = href.match(/\/vodplay\/(\d+)-(\d+)-(\d+)\//);
    if (epMatch && name && !seen.has(epMatch[3])) {
      seen.add(epMatch[3]);
      tracks.push({
        name: name,
        ext: { id: epMatch[1], sid: epMatch[2], nid: epMatch[3] }
      });
    }
  });

  // 沒有集數時，用當前頁面
  if (tracks.length === 0 && videoUrl) {
    tracks.push({
      name: vodName || '播放',
      ext: { id, sid, nid }
    });
  }

  return jsonify({
    list: [{
      title: 'FLgens',
      tracks
    }]
  });
}

async function getPlayinfo(ext) {
  ext = argsify(ext);
  const { id, sid = 1, nid = 1 } = ext;

  const url = `${SITE}/vodplay/${id}-${sid}-${nid}/`;
  const { data } = await $fetch.get(url, {
    headers: { 'User-Agent': UA, 'Referer': SITE + '/' }
  });

  // 提取 player_aaaa JSON（用大括號計數處理嵌套）
  let videoUrl = '';
  const startIdx = data.indexOf('var player_aaaa=');
  if (startIdx !== -1) {
    const jsonStart = data.indexOf('{', startIdx);
    if (jsonStart !== -1) {
      let depth = 0, jsonEnd = -1;
      for (let i = jsonStart; i < data.length; i++) {
        if (data[i] === '{') depth++;
        if (data[i] === '}') depth--;
        if (depth === 0) { jsonEnd = i; break; }
      }
      if (jsonEnd !== -1) {
        try {
          const playerData = JSON.parse(data.substring(jsonStart, jsonEnd + 1));
          videoUrl = playerData.url || '';
        } catch (e) {
          // 解析失敗
        }
      }
    }
  }

  if (videoUrl) {
    return jsonify({
      urls: [videoUrl],
      headers: [{ 'User-Agent': UA, 'Referer': url }]
    });
  }

  return jsonify({ urls: [] });
}

async function search(ext) {
  ext = argsify(ext);
  const { text, wd, page = 1 } = ext;
  const keyword = text || wd || '';

  let url;
  if (page === 1) {
    url = `${SITE}/vodsearch/?wd=${encodeURIComponent(keyword)}`;
  } else {
    url = `${SITE}/vodsearch/page/${page}/wd/${encodeURIComponent(keyword)}/`;
  }

  const { data } = await $fetch.get(url, {
    headers: { 'User-Agent': UA, 'Referer': SITE + '/' }
  });

  const cheerio = createCheerio();
  const $ = cheerio.load(data);
  const list = [];

  $('#list li').each((i, el) => {
    const $a = $(el).find('a').first();
    const href = $a.attr('href') || '';
    const name = $a.find('span').text().trim();
    const pic = $a.find('img').attr('data-original') || $a.find('img').attr('src') || '';

    const match = href.match(/\/vodplay\/(\d+)-(\d+)-(\d+)\//);
    if (match && name) {
      list.push({
        vod_id: match[1],
        vod_name: name,
        vod_pic: pic,
        ext: { id: match[1], sid: match[2], nid: match[3] }
      });
    }
  });

  return jsonify({ list, page });
}
