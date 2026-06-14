#!/bin/bash
# 从 news.json 读取数据，内嵌到 news.html 中

NEWS_JSON=$(cat /tmp/wcup-test/news.json)

cat > /tmp/wcup-test/news.html << 'HTMLEOF'
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🦞 世界杯趣闻</title>
  <link rel="stylesheet" href="style.css">
  <style>
    .article-page {
      max-width: 720px;
      margin: 0 auto;
      padding: 90px 20px 60px;
    }
    .article-back {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: var(--text-muted);
      text-decoration: none;
      font-size: 13px;
      margin-bottom: 24px;
      padding: 6px 12px;
      border-radius: 8px;
      transition: all 0.2s;
    }
    .article-back:hover {
      color: var(--gold);
      background: var(--gold-dim);
    }
    .article-emoji {
      font-size: 56px;
      line-height: 1;
      margin-bottom: 12px;
    }
    .article-meta {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;
    }
    .article-tag {
      display: inline-block;
      padding: 2px 10px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 700;
    }
    .article-date {
      font-size: 13px;
      color: var(--text-muted);
    }
    .article-title {
      font-size: 26px;
      font-weight: 700;
      line-height: 1.35;
      margin-bottom: 24px;
    }
    .article-hero {
      background: var(--bg-card);
      border-radius: 16px;
      height: 220px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 80px;
      margin-bottom: 24px;
      border: 1px solid var(--border);
      position: relative;
      overflow: hidden;
    }
    .article-hero-bg {
      position: absolute;
      inset: 0;
      opacity: 0.04;
      background: radial-gradient(circle at 50% 50%, var(--gold) 0%, transparent 70%);
    }
    .article-hero-emoji {
      position: relative;
      z-index: 1;
      filter: drop-shadow(0 8px 24px rgba(240, 192, 64, 0.3));
      animation: float 3s ease-in-out infinite;
    }
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-8px); }
    }
    .article-body {
      font-size: 15px;
      line-height: 1.85;
      color: var(--text-secondary);
    }
    .article-body p {
      margin-bottom: 16px;
    }
    .article-divider {
      border: none;
      border-top: 1px solid var(--border);
      margin: 32px 0;
    }
    .article-tags-row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 16px;
    }
    .article-related {
      background: var(--bg-card);
      border-radius: 12px;
      padding: 20px;
      border: 1px solid var(--border);
      margin-top: 24px;
    }
    .article-related h3 {
      font-size: 14px;
      margin-bottom: 12px;
      color: var(--text-muted);
    }
    .article-related a {
      display: flex;
      align-items: center;
      gap: 10px;
      color: var(--text);
      text-decoration: none;
      padding: 10px 12px;
      border-radius: 8px;
      transition: all 0.2s;
      font-size: 14px;
    }
    .article-related a:hover {
      background: var(--bg-card-hover);
      color: var(--gold);
    }
    .article-related a .emoji {
      font-size: 20px;
    }
    .article-footer-text {
      text-align: center;
      font-size: 12px;
      color: var(--text-muted);
      margin-top: 40px;
      padding: 20px;
    }
    .loading-placeholder {
      text-align: center;
      padding: 60px 0;
    }
    @media (max-width: 640px) {
      .article-title { font-size: 20px; }
      .article-hero { height: 160px; font-size: 60px; }
    }
  </style>
</head>
<body>
  <nav class="navbar">
    <div class="nav-inner">
      <a href="index.html" class="logo" style="text-decoration:none;color:var(--text)">
        <span class="logo-icon">🦞</span>
        <span class="logo-text">龙虾世界杯 <span class="gold">预测 2026</span></span>
      </a>
      <div class="nav-update">
        <span class="update-dot"></span>
        <span>趣闻详情</span>
      </div>
    </div>
  </nav>

  <div class="article-page" id="app">
    <div class="loading-placeholder">
      <div style="font-size:48px">🦞</div>
      <p style="color:var(--text-muted);margin-top:12px">正在为你加载...</p>
    </div>
  </div>

  <script>
    // ============================================
    // 📰 所有趣闻数据已内嵌，无需网络请求
    // ============================================
    const NEWS_DATA = HTMLEOF

# 把 JSON 插入到 const NEWS_DATA 后面
# 需要特殊处理，不要直接用 here-doc 嵌入 JSON

# 用 python 来处理
python3 << 'PYEOF'
import json

with open('/tmp/wcup-test/news.json', 'r') as f:
    data = json.load(f)

# 读取已生成的 news.html 头部
with open('/tmp/wcup-test/news.html', 'r') as f:
    content = f.read()

# 把 JSON 嵌入到 const NEWS_DATA 的引号中
json_str = json.dumps(data, ensure_ascii=False, indent=2)
# 转义模板字面量中的特殊字符
json_str = json_str.replace('\\', '\\\\').replace('`', '\\`').replace('${', '\\${')

embedded = content.replace('const NEWS_DATA = HTMLEOF', 'const NEWS_DATA = ' + json_str)

# 追加剩下的 JS 逻辑
embedded += '''

    const TAG_COLORS = {
      '离谱': '#a855f7', '翻车': '#f97316', '狠': '#ef4444',
      '惨': '#6366f1', '魔性': '#eab308', '潮流': '#06b6d4',
      '玄学': '#8b5cf6', '暴力': '#ef4444', '传奇': '#f59e0b',
      '争议': '#ff6b6b', '强势': '#22c55e', '纪录': '#f59e0b'
    };

    function renderArticle(id) {
      const item = NEWS_DATA.headlines.find(h => h.id === id);
      
      if (!item) {
        document.getElementById('app').innerHTML = `
          <div style="text-align:center;padding:60px 0">
            <div style="font-size:48px">😿</div>
            <p style="color:var(--text-muted);margin-top:12px">找不到这篇文章</p>
            <a href="index.html" style="color:var(--gold);margin-top:16px;display:inline-block">← 回首页</a>
          </div>
        `;
        return;
      }
      
      const dateLabel = item.date.replace(/^2026-/, '');
      const tagColor = TAG_COLORS[item.tag] || '#6b7280';
      
      // 正文分段
      const text = item.detail || item.summary;
      const paragraphs = text.split(/[。！？]/).filter(p => p.trim()).map(p => p.trim() + '。');
      
      // 相关推荐
      const sameTag = NEWS_DATA.headlines.filter(h => h.id !== id && h.tag === item.tag).slice(0, 3);
      const fallback = NEWS_DATA.headlines.filter(h => h.id !== id).sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3);
      const related = sameTag.length >= 2 ? sameTag : fallback;
      
      document.getElementById('app').innerHTML = `
        <a href="javascript:history.back()" class="article-back">← 返回</a>
        
        <div class="article-meta">
          <span class="article-tag" style="background:${tagColor}30;color:${tagColor}">${item.tag}</span>
          <span class="article-date">${dateLabel}</span>
        </div>
        
        <h1 class="article-title">${item.title}</h1>
        
        <div class="article-hero">
          <div class="article-hero-bg"></div>
          <div class="article-hero-emoji">${item.emoji || '⚽'}</div>
        </div>
        
        <div class="article-body">
          ${paragraphs.map((p, i) => {
            const cls = i === 0 ? ' style="color:var(--text);font-size:16px;font-weight:500"' : '';
            return '<p' + cls + '>' + p + '</p>';
          }).join('')}
        </div>
        
        <hr class="article-divider">
        
        <div class="article-tags-row">
          <span class="article-tag" style="background:${tagColor}30;color:${tagColor}">${item.tag}</span>
          <span class="article-tag" style="background:var(--bg-secondary);color:var(--text-muted)">⚽ 2026世界杯</span>
          <span class="article-tag" style="background:var(--bg-secondary);color:var(--text-muted)">🦞 龙虾趣闻</span>
        </div>
        
        ${related.length > 0 ? `
        <div class="article-related">
          <h3>📰 你可能还感兴趣</h3>
          ${related.map(r => `
            <a href="news.html?id=${r.id}">
              <span class="emoji">${r.emoji || '⚽'}</span>
              <span>${r.title}</span>
            </a>
          `).join('')}
        </div>
        ` : ''}
        
        <div class="article-footer-text">
          🦞 世界杯趣闻每日更新 · 来源综合各大媒体
        </div>
      `;
      
      document.title = item.title + ' 🦞 世界杯趣闻';
    }
    
    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get('id')) || 0;
    renderArticle(id);
  </script>
</body>
</html>
'''

with open('/tmp/wcup-test/news.html', 'w') as f:
    f.write(embedded)

print("news.html 生成完毕")
PYEOF
