/**
 * 🦞 龙虾世界杯预测 2026 - 主脚本
 * 
 * 从 predictions.json 加载数据，渲染交互式看板
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
  'Q1':'🏴󠁧󠁢󠁥','Q2':'🏴󠁧󠁢','Q3':'🏴󠁧','Q4':'🏴󠁷','Q5':'🌍','Q6':'🌏',
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

// ===== 加载数据 =====
async function loadData() {
  try {
    const resp = await fetch('predictions.json');
    data = await resp.json();
    return true;
  } catch (e) {
    console.error('加载预测数据失败:', e);
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
  // 切换标签激活状态
  document.querySelectorAll('.group-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.group === g);
  });
  // 切换面板
  document.querySelectorAll('.group-panel').forEach(p => {
    p.classList.toggle('active', p.dataset.group === g);
  });
}

// ===== 渲染比赛卡片 =====
function renderMatchCard(m) {
  const hf = FLAGS[m.home] || '🏳️';
  const af = FLAGS[m.away] || '🏳️';
  const isHome = ['USA', 'MEX', 'CAN'].includes(m.home);
  const homeTag = isHome ? '<span class="home-tag">🏠主场</span>' : '';
  const hw = parseFloat(m.winProb.homeWin);
  const dw = parseFloat(m.winProb.draw);
  const aw = parseFloat(m.winProb.awayWin);
  
  const card = document.createElement('div');
  card.className = 'match-card';
  card.innerHTML = `
    <div class="match-teams">
      <div class="team">
        <span class="team-flag">${hf}</span>
        <div class="team-name">${m.homeName}${homeTag}</div>
      </div>
      <div class="vs-section">
        <div class="score-display">${m.bestScore}</div>
        <div class="xg-display">xG ${m.xg.home} - ${m.xg.away}</div>
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
      <span>🎯 准确率 ${m.bestProb}%</span>
    </div>
    <div class="top5-scores">
      <span style="color:var(--gold);font-weight:600">Top 5</span>
      ${m.top5.map(s => `<span class="score-item">${s.score} <span style="color:var(--text-muted)">${s.prob}%</span></span>`).join('')}
    </div>
  `;
  return card;
}

// ===== 渲染小组排名 =====
function renderStandings(standings) {
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
    html += `<tr>
      <td class="rank-num">${i + 1}</td>
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
    
    // 小组描述
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
    
    // 排名
    if (grp.standings && grp.standings.length) {
      panel.appendChild(renderStandings(grp.standings));
    }
    
    container.appendChild(panel);
  });
}

// ===== 平滑导航 =====
function setupNav() {
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      
      const target = link.getAttribute('href').substring(1);
      ['groups', 'knockout', 'about'].forEach(id => {
        const el = document.getElementById(id === 'about' ? 'about' : id === 'knockout' ? 'knockout' : 'groups');
        if (el) el.style.display = id === target ? 'block' : 'none';
      });
    });
  });
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
  
  // 隐藏加载
  setTimeout(() => {
    document.getElementById('loader').classList.add('fade-out');
    setTimeout(() => {
      document.getElementById('loader').style.display = 'none';
    }, 600);
  }, 500);
}

// 等 DOM 加载完再跑
document.addEventListener('DOMContentLoaded', init);
