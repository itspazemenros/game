/**
 * Module 2 — 安全评估
 * 在进入创伤处理前确保用户处于足够安全的状态
 * 包含：当前情绪稳定度、支持系统、紧急联系信息提醒
 */
(function (global) {
  'use strict';

  const SafetyModule = {
    id: 'safety',
    title: '安全评估',
    totalSteps: 1,

    render() {
      const name = State.esc(State.get('userName') || '旅行者');
      const current = State.get('safetyRating') || 3;
      return `
        <div class="card">
          <span class="tag">第 1 步 · 安全基础</span>
          <h2>你好，${name} 👋</h2>
          <p class="subtitle">在开始之前，我们先评估一下你现在的状态。诚实地回答会让游戏体验更安全。</p>

          <h3>📊 此刻你感觉有多稳定？</h3>
          <p style="font-size:.9rem;color:var(--color-text-muted);">
            1 = 非常不稳定 / 5 = 非常稳定
          </p>
          <div class="choice-grid" id="stability-grid">
            ${[1,2,3,4,5].map(n => `
              <div class="choice-card ${n === current ? 'active' : ''}" data-val="${n}">
                <span class="icon">${['😰','😟','😐','🙂','😊'][n-1]}</span>
                <div class="label">${n}</div>
                <div class="desc">${['极度不稳定','有些不安','一般','较为稳定','非常稳定'][n-1]}</div>
              </div>
            `).join('')}
          </div>

          <hr class="divider" />

          <h3>🤝 你身边有可以联系的支持者吗？</h3>
          <div class="btn-group" id="support-group">
            <button class="nav-btn ${State.get('hasSupportPerson') === true  ? 'primary' : 'secondary'}" data-support="true">✅ 有</button>
            <button class="nav-btn ${State.get('hasSupportPerson') === false ? 'primary' : 'secondary'}" data-support="false">❌ 暂时没有</button>
          </div>

          <hr class="divider" />

          <div id="safety-warning" class="hidden" style="background:#fff3cd;border:1px solid #ffc107;border-radius:8px;padding:14px;margin-top:8px;">
            <strong>⚠️ 注意：</strong>你当前的状态较为脆弱。建议先进行接地气练习，或联系信任的人陪伴你完成今天的练习。
            <div class="btn-group" style="margin-top:10px;">
              <button class="nav-btn accent" id="go-grounding-first">先做接地气练习</button>
              <button class="nav-btn secondary" id="continue-anyway">我想继续</button>
            </div>
          </div>

          <div id="safety-ok" class="hidden" style="background:#d4edda;border:1px solid #28a745;border-radius:8px;padding:14px;margin-top:8px;">
            ✅ 很好！你的状态足以安全进行今天的练习。
          </div>

          <div class="btn-group" style="margin-top:24px;">
            <button class="nav-btn primary" id="safety-next-btn">下一步 →</button>
          </div>
        </div>
      `;
    },

    bind() {
      // 稳定度选择
      document.querySelectorAll('#stability-grid .choice-card').forEach(card => {
        card.addEventListener('click', () => {
          document.querySelectorAll('#stability-grid .choice-card').forEach(c => c.classList.remove('active'));
          card.classList.add('active');
          const val = parseInt(card.dataset.val, 10);
          State.set('safetyRating', val);
          _updateWarning();
        });
      });

      // 支持者选择
      document.querySelectorAll('#support-group [data-support]').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('#support-group [data-support]').forEach(b => b.className = 'nav-btn secondary');
          btn.className = 'nav-btn primary';
          State.set('hasSupportPerson', btn.dataset.support === 'true');
          _updateWarning();
        });
      });

      document.getElementById('go-grounding-first')?.addEventListener('click', () => {
        App.goTo('grounding');
      });
      document.getElementById('continue-anyway')?.addEventListener('click', () => {
        document.getElementById('safety-warning').classList.add('hidden');
        document.getElementById('safety-ok').classList.remove('hidden');
      });

      document.getElementById('safety-next-btn').addEventListener('click', () => {
        if (!State.get('safetyRating')) State.set('safetyRating', 3);
        App.next();
      });

      _updateWarning();

      function _updateWarning() {
        const rating  = State.get('safetyRating') || 3;
        const warning = document.getElementById('safety-warning');
        const ok      = document.getElementById('safety-ok');
        if (!warning || !ok) return;
        if (rating <= 2) {
          warning.classList.remove('hidden');
          ok.classList.add('hidden');
        } else {
          warning.classList.add('hidden');
          ok.classList.remove('hidden');
        }
      }
    },
  };

  global.SafetyModule = SafetyModule;
})(window);
