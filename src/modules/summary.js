/**
 * Module 9 — 进展总结（EMDR Phase 8: Re-evaluation）
 * 展示本次会话数据：
 *   - SUD 变化折线图
 *   - VOC 变化
 *   - CBT 思维记录摘要
 *   - 获得的成就徽章
 *   - 下次练习建议
 */
(function (global) {
  'use strict';

  const BADGE_DEFS = [
    { key: 'explorer',    icon: '🧭', name: '勇敢探索者',  cond: () => true },
    { key: 'cbt_master',  icon: '🧠', name: 'CBT 思维侦探', cond: () => !!State.get('balancedThought') },
    { key: 'emdr_hero',   icon: '👁️', name: 'EMDR 勇士',    cond: () => State.get('emdrComplete') },
    { key: 'calm_body',   icon: '🫀', name: '身体觉察达人', cond: () => !!State.get('bodySensation') },
    { key: 'safe_place',  icon: '🏡', name: '安全地带建造者',cond: () => (State.get('groundingUsed')||0) > 0 || true },
    {
      key: 'sud_reduced',
      icon: '📉',
      name: 'SUD 下降勇士',
      cond: () => {
        const h = State.get('sudHistory') || [];
        return h.length >= 2 && h[h.length-1] < h[0];
      },
    },
    {
      key: 'voc_up',
      icon: '⭐',
      name: '正向认知强化',
      cond: () => {
        const before = State.get('vocBefore') || 1;
        const after  = State.get('vocAfter')  || 1;
        return after > before;
      },
    },
  ];

  const SummaryModule = {
    id: 'summary',
    title: '会话总结',

    render() {
      const badges = _computeBadges();
      State.set('badges', badges.map(b => b.key));
      State.persist();

      const name       = State.esc(State.get('userName') || '旅行者');
      const sudHistory = State.get('sudHistory') || [];
      const sudBefore  = State.get('sudBefore') || 5;
      const sudAfter   = State.get('sudAfter')  ?? sudBefore;
      const vocBefore  = State.get('vocBefore') || 1;
      const vocAfter   = State.get('vocAfter')  ?? vocBefore;
      const nc         = State.esc(State.get('negCognition')  || '（未填写）');
      const pc         = State.esc(State.get('posCognition')  || '（未填写）');
      const balanced   = State.esc(State.get('balancedThought') || '（未完成）');
      const rounds     = State.get('emdrRounds') || 0;

      const sudDelta = sudBefore - sudAfter;
      const vocDelta = vocAfter  - vocBefore;

      return `
        <div class="card">
          <span class="tag">会话总结 · 心灵重建</span>
          <h2>太棒了，${name}！🎉</h2>
          <p class="subtitle">你完成了本次心灵重建之旅。以下是本次会话的回顾与成果。</p>

          <hr class="divider" />

          <!-- SUD 变化 -->
          <h3>📊 痛苦程度（SUD）变化</h3>
          ${_renderSudChart(sudHistory, sudBefore)}

          <div style="display:flex;gap:16px;flex-wrap:wrap;margin:12px 0;">
            <div style="flex:1;min-width:120px;background:#f0f7fb;border-radius:8px;padding:12px;text-align:center;">
              <div style="font-size:.8rem;color:var(--color-text-muted);">开始时 SUD</div>
              <div style="font-size:1.8rem;font-weight:700;color:var(--color-danger)">${sudBefore}</div>
            </div>
            <div style="flex:1;min-width:120px;background:#f0f7fb;border-radius:8px;padding:12px;text-align:center;">
              <div style="font-size:.8rem;color:var(--color-text-muted);">结束时 SUD</div>
              <div style="font-size:1.8rem;font-weight:700;color:${sudAfter<=3?'var(--color-secondary)':'var(--color-accent)'}">${sudAfter}</div>
            </div>
            <div style="flex:1;min-width:120px;background:#f0f7fb;border-radius:8px;padding:12px;text-align:center;">
              <div style="font-size:.8rem;color:var(--color-text-muted);">降低了</div>
              <div style="font-size:1.8rem;font-weight:700;color:var(--color-primary)">${sudDelta >= 0 ? '↓' + sudDelta : '↑' + Math.abs(sudDelta)}</div>
            </div>
          </div>

          <hr class="divider" />

          <!-- VOC 变化 -->
          <h3>⭐ 正向认知可信度（VOC）</h3>
          <div style="display:flex;gap:16px;flex-wrap:wrap;margin:8px 0 16px;">
            <div style="flex:1;min-width:120px;background:#f0f7fb;border-radius:8px;padding:12px;text-align:center;">
              <div style="font-size:.8rem;color:var(--color-text-muted);">安装前</div>
              <div style="font-size:1.8rem;font-weight:700;color:var(--color-accent)">${vocBefore}/7</div>
            </div>
            <div style="flex:1;min-width:120px;background:#f0f7fb;border-radius:8px;padding:12px;text-align:center;">
              <div style="font-size:.8rem;color:var(--color-text-muted);">安装后</div>
              <div style="font-size:1.8rem;font-weight:700;color:var(--color-secondary)">${vocAfter}/7</div>
            </div>
          </div>

          <hr class="divider" />

          <!-- CBT 记录摘要 -->
          <h3>🧠 CBT 思维重构摘要</h3>
          <table style="width:100%;border-collapse:collapse;font-size:.9rem;">
            <tr>
              <td style="padding:6px 0;color:var(--color-text-muted);width:110px;">负性认知</td>
              <td style="padding:6px 8px;color:var(--color-danger);">${nc}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:var(--color-text-muted);">正向认知</td>
              <td style="padding:6px 8px;color:var(--color-secondary);">${pc}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:var(--color-text-muted);">平衡性思维</td>
              <td style="padding:6px 8px;font-style:italic;">${balanced}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:var(--color-text-muted);">EMDR 轮数</td>
              <td style="padding:6px 8px;">${rounds} 轮</td>
            </tr>
          </table>

          <hr class="divider" />

          <!-- 成就徽章 -->
          <h3>🏅 本次获得的成就</h3>
          <div class="badge-row">
            ${badges.map(b => `
              <div class="badge">
                <span class="badge-icon">${b.icon}</span>
                <div class="badge-name">${b.name}</div>
              </div>
            `).join('')}
          </div>

          <hr class="divider" />

          <!-- 下次建议 -->
          <h3>📅 下次练习建议</h3>
          <ul>
            ${sudAfter > 3 ? '<li>SUD 仍高于 3，建议在专业治疗师的陪伴下继续处理这个记忆。</li>' : '<li>SUD 已降低至较安全水平，继续在日常生活中练习平衡性思维。</li>'}
            ${vocAfter < 5 ? '<li>正向认知可信度还有提升空间，可以多做安装练习或找治疗师深化。</li>' : '<li>正向认知已有良好基础，继续用行动验证"' + pc + '"。</li>'}
            <li>每天花 5 分钟做接地气练习，尤其在情绪波动时。</li>
            <li>把你的平衡性思维写在便利贴上，贴在常看到的地方。</li>
          </ul>

          <div style="background:#fff3cd;border-radius:8px;padding:14px;margin:16px 0;font-size:.9rem;">
            ⚠️ <strong>重要提醒：</strong>本游戏是自助辅助工具，不能替代专业心理咨询。
            如有持续的心理困扰，请务必寻求有执照的心理治疗师的帮助。
          </div>

          <div class="btn-group center">
            <button class="nav-btn primary" id="restart-btn">🔄 重新开始</button>
            <button class="nav-btn accent"  id="save-btn">💾 保存记录</button>
          </div>
        </div>
      `;
    },

    bind() {
      document.getElementById('restart-btn').addEventListener('click', () => {
        if (confirm('确定要开始新的会话吗？当前记录将会被清除。')) {
          localStorage.removeItem('xljj_session');
          location.reload();
        }
      });

      document.getElementById('save-btn').addEventListener('click', _downloadReport);
    },
  };

  /* ─── SUD 图表 ─── */
  function _renderSudChart(history, baseline) {
    const all = [baseline, ...history.slice(1)];
    if (all.length < 2) return '<p style="color:var(--color-text-muted);font-size:.9rem;">（数据不足以显示图表）</p>';

    return all.map((val, i) => {
      const pct   = val * 10;
      const color = val <= 3 ? '#6dbfa8' : val <= 6 ? '#f4a261' : '#e76f51';
      const label = i === 0 ? '基线' : `第${i}轮`;
      return `
        <div class="chart-bar-row">
          <div class="chart-bar-label">${label}</div>
          <div class="chart-bar-track">
            <div class="chart-bar-fill" style="width:${pct}%;background:${color};"></div>
          </div>
          <div class="chart-bar-val">${val}</div>
        </div>
      `;
    }).join('');
  }

  /* ─── 成就计算 ─── */
  function _computeBadges() {
    return BADGE_DEFS.filter(b => {
      try { return b.cond(); } catch (_) { return false; }
    });
  }

  /* ─── 下载报告 ─── */
  function _downloadReport() {
    const s      = State.getAll();
    const lines  = [
      '=== 心灵重建 · 会话报告 ===',
      `日期：${new Date().toLocaleString('zh-CN')}`,
      `用户：${s.userName}`,
      '',
      '── 目标记忆 ──',
      s.targetMemory,
      '',
      '── CBT 思维记录 ──',
      `负性认知：${s.negCognition}`,
      `正向认知：${s.posCognition}`,
      `支持证据：${s.evidenceFor}`,
      `反对证据：${s.evidenceAgainst}`,
      `平衡性思维：${s.balancedThought}`,
      '',
      '── EMDR 数据 ──',
      `基线 SUD：${s.sudBefore}`,
      `SUD 历史：${(s.sudHistory||[]).join(' → ')}`,
      `EMDR 轮数：${s.emdrRounds}`,
      `VOC 前：${s.vocBefore}  VOC 后：${s.vocAfter}`,
      '',
      '── 成就 ──',
      (s.badges||[]).join('、'),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const a    = document.createElement('a');
    a.href     = URL.createObjectURL(blob);
    a.download = `xinling-report_${new Date().toISOString().slice(0,10)}.txt`;
    a.click();
  }

  global.SummaryModule = SummaryModule;
})(window);
