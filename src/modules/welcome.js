/**
 * Module 1 — 欢迎页
 * 介绍游戏目的、EMDR+CBT 融合说明、收集用户名
 */
(function (global) {
  'use strict';

  const WelcomeModule = {
    id: 'welcome',
    title: '欢迎',
    totalSteps: 1,

    render() {
      return `
        <div class="card">
          <span class="tag">心灵重建 · 疗愈游戏</span>
          <h1>欢迎来到心灵重建 🌱</h1>
          <p class="subtitle">一款融合 EMDR 与 CBT 的互动疗愈游戏，帮助你识别认知偏差、处理创伤记忆、重建内心平衡。</p>

          <hr class="divider" />

          <h3>🧠 这个游戏能帮你做什么？</h3>
          <ul>
            <li>识别并纠正常见的认知偏差（CBT）</li>
            <li>以双侧视觉刺激安全处理困扰你的记忆（EMDR）</li>
            <li>安装积极的自我认知，增强情绪韧性</li>
            <li>学习接地气技巧，随时平复激烈情绪</li>
          </ul>

          <hr class="divider" />

          <h3>⏱ 大约需要多长时间？</h3>
          <p>完整流程约 <strong>20~40 分钟</strong>，你可以随时暂停。点击右上角 🛡 安全出口可立刻进入接地气练习。</p>

          <hr class="divider" />

          <div class="form-group">
            <label for="user-name-input">你希望我怎么称呼你？（可选）</label>
            <input type="text" id="user-name-input" placeholder="例如：小明、阳光…" maxlength="20" />
          </div>

          <div class="btn-group">
            <button class="nav-btn primary" id="welcome-start-btn">开始旅程 →</button>
          </div>

          <p style="font-size:.8rem;color:var(--color-text-muted);margin-top:16px;">
            ⚠️ 本游戏仅作为心理健康辅助工具，不替代专业心理治疗。如有严重心理困扰，请寻求专业帮助。
          </p>
        </div>
      `;
    },

    bind() {
      const nameInput = document.getElementById('user-name-input');
      const startBtn  = document.getElementById('welcome-start-btn');

      // 允许回车也能跳过
      nameInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') startBtn.click();
      });

      startBtn.addEventListener('click', () => {
        const name = (nameInput.value || '').trim() || '旅行者';
        State.set('userName', name);
        App.next();
      });
    },
  };

  global.WelcomeModule = WelcomeModule;
})(window);
