/**
 * Module 5 — CBT 认知重构（思维记录单）
 * 帮助用户系统性地挑战并改写自动化负性思维：
 *   1. 热点思维（Hot Thought）
 *   2. 支持证据
 *   3. 反对证据
 *   4. 平衡性思维
 *   5. 情绪重评
 */
(function (global) {
  'use strict';

  const CBTModule = {
    id: 'cbtRestructuring',
    title: 'CBT 认知重构',

    render() {
      const nc  = State.get('negCognition') || '我不够好';
      const esc = State.esc;
      return `
        <div class="card">
          <span class="tag">第 4 步 · 认知重构</span>
          <h2>改写你的思维故事 ✏️</h2>
          <p class="subtitle">
            CBT 的核心是：<strong>想法影响情绪，情绪影响行为</strong>。
            我们来一起审视那个让你痛苦的核心想法。
          </p>

          <!-- 热点思维 -->
          <div class="form-group">
            <label for="hot-thought-input">
              🔥 你最强烈的负面想法是？
              <span style="font-size:.85rem;font-weight:400;color:var(--color-text-muted);">（可直接使用负性认知）</span>
            </label>
            <input type="text" id="hot-thought-input"
              placeholder="例如：我不够好"
              value="${esc(State.get('hotThought') || nc)}" />
          </div>

          <hr class="divider" />

          <!-- 支持证据 -->
          <div class="form-group">
            <label for="evidence-for-input">
              📋 <strong>支持</strong>这个想法的证据有哪些？
              <span style="font-size:.85rem;font-weight:400;color:var(--color-text-muted);">（尽量列举真实发生的事情）</span>
            </label>
            <textarea id="evidence-for-input" rows="3"
              placeholder="例如：上周我项目没完成、朋友最近没主动联系我…">${esc(State.get('evidenceFor') || '')}</textarea>
          </div>

          <!-- 反对证据 -->
          <div class="form-group">
            <label for="evidence-against-input">
              ✅ <strong>反对</strong>这个想法的证据有哪些？
              <span style="font-size:.85rem;font-weight:400;color:var(--color-text-muted);">（有时需要刻意寻找）</span>
            </label>
            <textarea id="evidence-against-input" rows="3"
              placeholder="例如：我曾经完成过很多任务、有朋友在困难时支持过我…">${esc(State.get('evidenceAgainst') || '')}</textarea>
          </div>

          <hr class="divider" />

          <!-- 平衡性思维引导 -->
          <div style="background:#f0f7fb;border-radius:8px;padding:14px;margin-bottom:18px;">
            <p style="margin:0;font-size:.9rem;">
              💡 <strong>提示</strong>：平衡性思维不是盲目乐观，而是更公平、更全面地看待自己和情况。
              试着用"虽然…但是…"或"在某些情况下…"来构建新想法。
            </p>
          </div>

          <!-- 平衡性思维 -->
          <div class="form-group">
            <label for="balanced-thought-input">
              ⚖️ 综合两方面证据，更平衡的思维是？
            </label>
            <textarea id="balanced-thought-input" rows="3"
              placeholder="例如：虽然我有时会搞砸事情，但我也有很多做得不错的地方，我不是一个彻底的失败者。">${esc(State.get('balancedThought') || '')}</textarea>
          </div>

          <!-- 情绪重评 -->
          <div class="form-group">
            <label>😌 改变想法后，你现在感觉如何？（痛苦程度）</label>
            <div class="slider-wrap">
              <label><span>0 完全平静</span><span>10 极度痛苦</span></label>
              <input type="range" id="cbt-sud-slider" min="0" max="10" step="1"
                value="${State.get('sudBefore') || 5}" />
              <div class="slider-value" id="cbt-sud-value">${State.get('sudBefore') || 5}</div>
            </div>
          </div>

          <div class="btn-group">
            <button class="nav-btn primary" id="cbt-next-btn">进入 EMDR 脱敏 →</button>
          </div>
        </div>
      `;
    },

    bind() {
      // 热点思维
      document.getElementById('hot-thought-input').addEventListener('input', (e) => {
        State.set('hotThought', e.target.value.trim());
      });
      // 支持证据
      document.getElementById('evidence-for-input').addEventListener('input', (e) => {
        State.set('evidenceFor', e.target.value.trim());
      });
      // 反对证据
      document.getElementById('evidence-against-input').addEventListener('input', (e) => {
        State.set('evidenceAgainst', e.target.value.trim());
      });
      // 平衡性思维
      document.getElementById('balanced-thought-input').addEventListener('input', (e) => {
        State.set('balancedThought', e.target.value.trim());
      });
      // SUD 滑块
      const slider = document.getElementById('cbt-sud-slider');
      const valEl  = document.getElementById('cbt-sud-value');
      slider.addEventListener('input', () => {
        valEl.textContent = slider.value;
      });

      // 下一步
      document.getElementById('cbt-next-btn').addEventListener('click', () => {
        if (!State.get('hotThought')) State.set('hotThought', State.get('negCognition') || '我不够好');
        if (!State.get('balancedThought')) {
          alert('请尝试写出一个更平衡的想法，即使只有一句话。');
          return;
        }
        State.set('sudBefore', parseInt(slider.value, 10));
        App.next();
      });
    },
  };

  global.CBTModule = CBTModule;
})(window);
