/**
 * 🦞 龙虾世界杯预测 2026 - 主脚本 (v2.0)
 * 
 * 新增: 实时结果 + 积分榜 + 预测准度对账
 */

const FLAGS = {
  'MEX':'🇲🇽','RSA':'🇿🇦','KOR':'🇰🇷','CZE':'🇨🇿',
  'CAN':'🇨🇦','BIH':'🇧🇦','QAT':'🇶🇦','SUI':'🇨🇭',
  'BRA':'🇧🇷','MAR':'🇲🇦','HAI':'🇭🇹','SCO':'🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  'USA':'🇺🇸','PAR':'🇵🇾','AUS':'🇦🇺','TUR':'🇹🇷',
  'GER':'🇩🇪','CUW':'🇨🇼','CIV':'🇨🇮','ECU':'🇪🇨',
  'NED':'🇳🇱','JPN':'🇯🇵','SWE':'🇸🇪','TUN':'🇹🇳',
  'ESP':'🇪🇸','CPV':'🇨🇻','BEL':'🇧🇪','EGY':'🇪🇬',
  'KSA':'🇸🇦','URU':'🇺🇾','NZL':'🇳🇿','POR':'🇵🇹',
  'FRA':'🇫🇷','SEN':'🇸🇳','IRQ':'🇮🇶','NOR':'🇳🇴',
  'ARG':'🇦🇷','ALG':'🇩🇿','JOR':'🇯🇴','AUT':'🇦🇹',
  'COL':'🇨🇴','COD':'🇨🇩','UZB':'🇺🇿','IRN':'🇮🇷',
  'ENG':'🏴󠁧󠁢󠁥󠁮󠁧󠁿','CRO':'🇭🇷','GHA':'🇬🇭','PAN':'🇵🇦',
};

const GROUP_NAMES = {
  A: '🇲🇽墨西哥 · 🇿🇦南非 · 🇰🇷韩国 · 🇨🇿捷克',
  B: '🇨🇦加拿大 · 🇧🇦波黑 · 🇶🇦卡塔尔 · 🇨🇭瑞士',
  C: '🇧🇷巴西 · 🇲🇦摩洛哥 · 🇭🇹海地 · 🏴󠁧󠁢󠁳󠁣󠁴󠁿苏格兰',
  D: '🇺🇸美国 · 🇵🇾巴拉圭 · 🇦🇺澳大利亚 · 🇹🇷土耳其',
  E: '🇩🇪德国 · 🇨🇼库拉索 · 🇨🇮科特迪瓦 · 🇪🇨厄瓜多尔',
  F: '🇳🇱荷兰 · 🇯🇵日本 · 🇸🇪瑞典 · 🇹🇳突尼斯',
  G: '🇪🇸西班牙 · 🇨🇻佛得角 · 🇧🇪比利时 · 🇪🇬埃及',
  H: '🇸🇦沙特 · 🇺🇾乌拉圭 · 🇳🇿新西兰 · 🇵🇹葡萄牙',
  I: '🇫🇷法国 · 🇸🇳塞内加尔 · 🇮🇶伊拉克 · 🇳🇴挪威',
  J: '🇦🇷阿根廷 · 🇩🇿阿尔及利亚 · 🇯🇴约旦 · 🇦🇹奥地利',
  K: '🇨🇴哥伦比亚 · 🇨🇩刚果(金) · 🇺🇿乌兹别克 · 🇮🇷伊朗',
  L: '🏴󠁧󠁢󠁥󠁮󠁧󠁿英格兰 · 🇭🇷克罗地亚 · 🇬🇭加纳 · 🇵🇦巴拿马',
};

let data = null;
let results = null;
let news = null;

// ===== 加载数据 =====
async function loadData() {
  try {
    const [predResp, resResp, newsResp] = await Promise.all([
      fetch('predictions.json'),
      fetch('results.json').catch(() => null),
      fetch('news.json').catch(() => null)
    ]);
    data = await predResp.json();
    if (resResp) results = await resResp.json();
    if (newsResp) news = await newsResp.json();
    return true;
  } catch (e) {
    console.error('加载数据失败:', e);
    return false;
  }
}

// ===== 渲染小组标签 =====
function renderTabs() {
  const container = document.getElementById('groupTabs');
  container.innerHTML = '';
  
  const groups = Object.keys(data);
  groups.forEach((g, i) => {
    const btn = document.createElement('button');
    btn.className = 'group-btn' + (i === 0 ? ' active' : '');
    btn.textContent = g + '组';
    btn.dataset.group = g;
    btn.addEventListener('click', () => switchGroup(g));
    container.appendChild(btn);
  });
}

function switchGroup(g) {
  document.querySelectorAll('.group-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.group === g);
  });
  document.querySelectorAll('.group-panel').forEach(p => {
    p.classList.toggle('active', p.dataset.group === g);
  });
}

// ===== 获取实际比分 =====
function getRealScore(group, home, away) {
  if (!results || !results[group]) return null;
  const match = results[group].matches.find(m => m.home === home && m.away === away);
  return match || null;
}

function getResultBadge(match) {
  if (!match || match.status !== 'finished') return null;
  return match.score;
}

// ===== 渲染比赛卡片（增强版） =====
function renderMatchCard(m) {
  const hf = FLAGS[m.home] || '🏳️';
  const af = FLAGS[m.away] || '🏳️';
  const isHome = ['USA', 'MEX', 'CAN'].includes(m.home);
  const homeTag = isHome ? '<span class="home-tag">🏠主场</span>' : '';
  const hw = parseFloat(m.winProb.homeWin);
  const dw = parseFloat(m.winProb.draw);
  const aw = parseFloat(m.winProb.awayWin);
  
  // 找实际比分
  const realMatch = getRealScore(m.home === 'KOR' && m.away === 'CZE' ? 'A' : 
    Object.keys(data).find(g => data[g].matches.some(mm => mm.home === m.home && mm.away === m.away)), m.home, m.away);
  let realScoreBadge = '';
  let accuracyBadge = '';
  
  if (realMatch && realMatch.status === 'finished') {
    const pts = realMatch.score.split('-').map(Number);
    const predBest = m.bestScore.split('-').map(Number);
    const scoreExact = pts[0] === predBest[0] && pts[1] === predBest[1];
    const outcomePred = hw > dw && hw > aw ? 'H' : (aw > hw && aw > dw ? 'A' : 'D');
    const outcomeReal = pts[0] > pts[1] ? 'H' : (pts[0] < pts[1] ? 'A' : 'D');
    const outcomeCorrect = outcomePred === outcomeReal;
    
    realScoreBadge = `<div class="real-score-badge">实际 ${realMatch.score}</div>`;
    
    if (scoreExact) {
      accuracyBadge = `<div class="acc-badge acc-perfect">🎯 精准命中！</div>`;
    } else if (outcomeCorrect) {
      accuracyBadge = `<div class="acc-badge acc-good">✅ 方向正确</div>`;
    } else {
      accuracyBadge = `<div class="acc-badge acc-miss">❌ 预测偏差</div>`;
    }
  } else if (realMatch && realMatch.status === 'scheduled') {
    realScoreBadge = `<div class="real-score-badge scheduled">🕐 待赛</div>`;
  }
  
  const card = document.createElement('div');
  card.className = 'match-card' + (realMatch && realMatch.status === 'finished' ? ' has-result' : '');
  card.innerHTML = `
    <div class="match-teams">
      <div class="team">
        <span class="team-flag">${hf}</span>
        <div class="team-name">${m.homeName}${homeTag}</div>
      </div>
      <div class="vs-section">
        <div class="score-display">${realMatch && realMatch.status === 'finished' ? realMatch.score : m.bestScore}</div>
        <div class="xg-display">${realMatch && realMatch.status === 'finished' ? '完赛' : `xG ${m.xg.home} - ${m.xg.away}`}</div>
        ${realScoreBadge}
        ${accuracyBadge}
      </div>
      <div class="team">
        <span class="team-flag">${af}</span>
        <div class="team-name">${m.awayName}</div>
      </div>
    </div>
    <div class="winbar">
      <div class="winbar-home" style="width:${hw}%"></div>
      <div class="winbar-draw" style="width:${dw}%"></div>
      <div class="winbar-away" style="width:${aw}%"></div>
    </div>
    <div class="match-probs">
      <span>🏠 <strong style="color:var(--green)">${m.winProb.homeWin}%</strong></span>
      <span>🤝 <strong style="color:var(--gray)">${m.winProb.draw}%</strong></span>
      <span>✈️ <strong style="color:var(--red)">${m.winProb.awayWin}%</strong></span>
      <span>🎯 预测最可能 ${m.bestScore} (${m.bestProb}%)</span>
    </div>
    <div class="top5-scores">
      <span style="color:var(--gold);font-weight:600">Top 5</span>
      ${m.top5.map(s => `<span class="score-item">${s.score} <span style="color:var(--text-muted)">${s.prob}%</span></span>`).join('')}
    </div>
  `;
  return card;
}

// ===== 渲染实际积分榜 =====
function renderRealStandings(groupCode) {
  if (!results || !results[groupCode] || !results[groupCode].standings) return '';
  
  const std = results[groupCode].standings;
  if (std.length === 0) return '';
  
  const isComplete = std.length === 4;
  
  let html = `<div class="standings-section">
    <div class="standings-title real">📊 实际积分榜 ${isComplete ? '' : '(部分完赛)'}</div>
    <table class="standings-table">
      <tr>
        <th></th>
        <th>球队</th>
        <th style="text-align:center">赛</th>
        <th style="text-align:center">胜</th>
        <th style="text-align:center">平</th>
        <th style="text-align:center">负</th>
        <th style="text-align:center">进/失</th>
        <th style="text-align:center">净胜</th>
        <th style="text-align:right">积分</th>
      </tr>`;
  
  const sorted = [...std].sort((a, b) => b.pts - a.pts || (b.gd - a.gd) || ((b.gf - b.ga) - (a.gf - a.ga)));
  
  sorted.forEach((s, i) => {
    const f = FLAGS[s.code] || '🏳️';
    const qClass = i < 2 ? 'qualify-zone' : (i === 2 ? 'maybe-zone' : '');
    const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : (s.gp > 0 ? '' : '');
    
    html += `<tr class="${qClass}">
      <td class="rank-num">${medal || (i + 1)}</td>
      <td>
        <div class="team-cell">
          <span class="flag">${f}</span>
          <span>${s.name}</span>
        </div>
      </td>
      <td style="text-align:center">${s.gp}</td>
      <td style="text-align:center;color:var(--green)">${s.w}</td>
      <td style="text-align:center;color:var(--text-muted)">${s.d}</td>
      <td style="text-align:center;color:var(--red)">${s.l}</td>
      <td style="text-align:center">${s.gf}:${s.ga}</td>
      <td style="text-align:center;font-weight:${s.gd > 0 ? '700' : '400'};color:${s.gd > 0 ? 'var(--green)' : s.gd < 0 ? 'var(--red)' : 'var(--text-muted)'}">${s.gd > 0 ? '+' : ''}${s.gd}</td>
      <td style="text-align:right;font-weight:700;color:var(--gold)">${s.pts}</td>
    </tr>`;
  });
  
  html += '</table>';
  
  // 晋级线标识
  if (isComplete) {
    html += `<div class="legend-row">
      <span class="legend-dot" style="background:var(--green-bg);border:1px solid var(--green)"></span> 前二出线区
    </div>`;
  }
  
  html += '</div>';
  return html;
}

// ===== 渲染小组排名（原预测出线榜） =====
function renderStandings(standings, groupCode) {
  const section = document.createElement('div');
  section.className = 'standings-section';
  
  let html = `<div class="standings-title">📊 出线概率（蒙特卡洛 × 5000次）</div>`;
  html += `<table class="standings-table">
    <tr>
      <th></th>
      <th>球队</th>
      <th style="text-align:right">出线率</th>
      <th style="text-align:center">均分</th>
      <th></th>
    </tr>`;
  
  standings.forEach((s, i) => {
    const f = FLAGS[s.code] || '🏳️';
    const pct = parseFloat(s.advancePct);
    const barColor = pct > 70 ? 'var(--green)' : pct > 40 ? 'var(--gold)' : 'var(--text-muted)';
    
    // 是否和实际积分榜吻合
    let alignIcon = '';
    if (results && results[groupCode] && results[groupCode].standings.length > 0) {
      const realStd = results[groupCode].standings;
      const sortedReal = [...realStd].sort((a, b) => b.pts - a.pts || (b.gd - a.gd) || ((b.gf - b.ga) - (a.gf - a.ga)));
      const realPos = sortedReal.findIndex(ss => ss.code === s.code);
      if (realPos === 0) alignIcon = '🥇';
      else if (realPos === 1) alignIcon = '🥈';
    }
    
    html += `<tr>
      <td class="rank-num">${alignIcon || (i + 1)}</td>
      <td>
        <div class="team-cell">
          <span class="flag">${f}</span>
          <span>${s.name}</span>
        </div>
      </td>
      <td class="advance-pct">${s.advancePct}%</td>
      <td class="points-cell" style="text-align:center">${s.avgPoints}</td>
      <td>
        <div class="advance-bar-wrap">
          <div class="advance-bar-fill" style="width:${pct}%;background:${barColor}"></div>
        </div>
      </td>
    </tr>`;
  });
  html += '</table>';
  section.innerHTML = html;
  return section;
}

// ===== 渲染全局准度统计 =====
function renderAccuracyStats() {
  if (!results) return '';
  
  let total = 0, exact = 0, outcome = 0, miss = 0;
  const details = [];
  
  Object.keys(data).forEach(g => {
    const grp = data[g];
    grp.matches.forEach(m => {
      const real = getRealScore(g, m.home, m.away);
      if (!real || real.status !== 'finished') return;
      
      total++;
      const pts = real.score.split('-').map(Number);
      const predBest = m.bestScore.split('-').map(Number);
      const scoreExact = pts[0] === predBest[0] && pts[1] === predBest[1];
      
      const hw = parseFloat(m.winProb.homeWin);
      const dw = parseFloat(m.winProb.draw);
      const aw = parseFloat(m.winProb.awayWin);
      const outcomePred = hw > dw && hw > aw ? 'H' : (aw > hw && aw > dw ? 'A' : 'D');
      const outcomeReal = pts[0] > pts[1] ? 'H' : (pts[0] < pts[1] ? 'A' : 'D');
      const outcomeCorrect = outcomePred === outcomeReal;
      
      if (scoreExact) exact++;
      else if (outcomeCorrect) outcome++;
      else miss++;
      
      details.push({
        match: `${FLAGS[m.home] || m.home} ${m.homeName} vs ${m.awayName} ${FLAGS[m.away] || m.away}`,
        predicted: m.bestScore,
        actual: real.score,
        scoreExact,
        outcomeCorrect,
        top5Includes: m.top5.some(t => t.score === real.score)
      });
    });
  });
  
  if (total === 0) return `<div class="section"><div class="section-header"><h2>📊 预测准度</h2></div><p style="color:var(--text-muted);font-size:14px">暂无已完赛比赛，数据积累中...</p></div>`;
  
  const accExact = (exact / total * 100).toFixed(0);
  const accOutcome = ((exact + outcome) / total * 100).toFixed(0);
  
  let html = `<section class="section" id="accuracy">
    <div class="section-header">
      <h2>📊 龙虾预测准度</h2>
      <p>与实际比赛结果对比 · 数据会随赛程推进实时更新</p>
    </div>
    
    <div class="accuracy-stats-grid">
      <div class="acc-stat-card perfect">
        <div class="acc-stat-num">${exact}</div>
        <div class="acc-stat-label">精准命中<br><small>比分完全一致</small></div>
      </div>
      <div class="acc-stat-card good">
        <div class="acc-stat-num">${outcome}</div>
        <div class="acc-stat-label">方向正确<br><small>胜平负猜对</small></div>
      </div>
      <div class="acc-stat-card miss">
        <div class="acc-stat-num">${miss}</div>
        <div class="acc-stat-label">预测偏差<br><small>结果不符</small></div>
      </div>
      <div class="acc-stat-card overall">
        <div class="acc-stat-num">${accOutcome}%</div>
        <div class="acc-stat-label">方向准确率<br><small>${total}场已完赛</small></div>
      </div>
    </div>
    
    <div class="acc-details">
      ${details.map(d => {
        let badge = d.scoreExact ? '🎯精准命中' : d.outcomeCorrect ? '✅方向对' : '❌偏差';
        let cls = d.scoreExact ? 'perfect' : d.outcomeCorrect ? 'good' : 'miss';
        const top5Str = d.top5Includes ? ' (Top5内有)' : '';
        return `<div class="acc-detail-row ${cls}">
          <span class="acc-detail-match">${d.match}</span>
          <span class="acc-detail-pred">预测 ${d.predicted}</span>
          <span class="acc-detail-real">实际 ${d.actual}</span>
          <span class="acc-detail-badge ${cls}">${badge}${top5Str}</span>
        </div>`;
      }).join('')}
    </div>
  </section>`;
  
  return html;
}

// ===== 渲染所有面板 =====
function renderPanels() {
  const container = document.getElementById('groupPanels');
  container.innerHTML = '';
  
  const groups = Object.keys(data);
  groups.forEach((g, i) => {
    const grp = data[g];
    const panel = document.createElement('div');
    panel.className = 'group-panel' + (i === 0 ? ' active' : '');
    panel.dataset.group = g;
    
    const desc = document.createElement('p');
    desc.style.cssText = 'color:var(--text-muted);font-size:13px;margin-bottom:16px';
    desc.textContent = GROUP_NAMES[g] || g + '组';
    panel.appendChild(desc);
    
    // 比赛卡片
    const grid = document.createElement('div');
    grid.className = 'match-grid';
    grp.matches.forEach(m => {
      grid.appendChild(renderMatchCard(m));
    });
    panel.appendChild(grid);
    
    // 实际积分榜 + 预测出线榜并排
    const bothStandings = document.createElement('div');
    bothStandings.className = 'standings-dual';
    
    const realStdHtml = renderRealStandings(g);
    if (realStdHtml) {
      const realDiv = document.createElement('div');
      realDiv.innerHTML = realStdHtml;
      bothStandings.appendChild(realDiv);
    }
    
    if (grp.standings && grp.standings.length) {
      const predDiv = renderStandings(grp.standings, g);
      bothStandings.appendChild(predDiv);
    }
    
    panel.appendChild(bothStandings);
    container.appendChild(panel);
  });
}

// ===== 平滑导航 =====
function setupNav() {
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      
      const target = link.getAttribute('href').substring(1);
      ['groups', 'knockout', 'accuracy', 'fun', 'about'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = (id === 'about' ? 'about' : id) === target ? 'block' : 'none';
      });
      
      // 特殊处理 accuracy 和 fun
      const accSec = document.getElementById('accuracy');
      if (accSec) accSec.style.display = target === 'accuracy' ? 'block' : 'none';
      const funSec = document.getElementById('fun');
      if (funSec) funSec.style.display = target === 'fun' ? 'block' : 'none';
    });
  });
}

// ===== 渲染趣闻板块 =====
function renderNewsSection() {
  if (!news || !news.headlines || news.headlines.length === 0) return null;
  
  const sorted = [...news.headlines].sort((a, b) => new Date(b.date) - new Date(a.date));
  
  const section = document.createElement('section');
  section.className = 'section';
  section.id = 'fun';
  section.style.display = 'none';
  
  let html = `
    <div class="section-header">
      <h2>🎪 世界杯趣闻</h2>
      <p>赛场外的花絮、奇葩、冷知识 · 每日更新</p>
    </div>
    <div class="fun-grid">`;
  
  sorted.forEach(item => {
    const dateLabel = item.date.replace(/^2026-/, '');
    
    let tagClass = 'fun-tag';
    const tagColors = {
      '离谱': 'tag-insane', '翻车': 'tag-wtf', '狠': 'tag-brutal',
      '惨': 'tag-ouch', '魔性': 'tag-funny', '潮流': 'tag-cool',
      '玄学': 'tag-mystic', '暴力': 'tag-brutal', '传奇': 'tag-legacy',
      '争议': 'tag-hot', '强势': 'tag-strong', '纪录': 'tag-legacy'
    };
    if (tagColors[item.tag]) tagClass += ' ' + tagColors[item.tag];
    
    html += `
      <a href="news.html?id=${item.id}" class="fun-card" data-id="${item.id}">
        <div class="fun-emoji">${item.emoji || '⚽'}</div>
        <div class="fun-body">
          <div class="fun-meta">
            <span class="${tagClass}">${item.tag}</span>
            <span class="fun-date">${dateLabel}</span>
          </div>
          <h3 class="fun-title">${item.title}</h3>
          <p class="fun-summary">${item.summary}</p>
          <div class="fun-readmore"><span class="fun-readmore-btn">查看详情 →</span></div>
        </div>
      </a>`;
  });
  
  html += `
    </div>
    <div class="fun-footer">
      <span>🦞 趣闻每日更新 · 来源综合各大媒体</span>
    </div>
  </section>`;
  
  section.innerHTML = html;
  
  return section;
}

// ===== 初始化 =====
async function init() {
  const ok = await loadData();
  if (!ok) {
    document.getElementById('loader').innerHTML = `
      <div style="text-align:center">
        <div style="font-size:48px">😿</div>
        <p style="color:var(--text-secondary);margin-top:16px">加载预测数据失败了，请稍后再试</p>
      </div>`;
    return;
  }
  
  renderTabs();
  renderPanels();
  setupNav();
  
  // 插入趣闻板块到页面
  const footer = document.querySelector('.footer');
  const newsSec = renderNewsSection();
  if (newsSec) {
    document.body.insertBefore(newsSec, footer);
  }
  
  // 隐藏加载
  setTimeout(() => {
    document.getElementById('loader').classList.add('fade-out');
    setTimeout(() => {
      document.getElementById('loader').style.display = 'none';
    }, 600);
  }, 500);
}

document.addEventListener('DOMContentLoaded', init);
