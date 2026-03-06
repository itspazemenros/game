/**
 * Module 8 — 接地气练习 & 结束仪式（EMDR Phase 7: Closure）
 * 功能：
 *   A. 紧急安全出口（浮层，随时可调用）
 *   B. 正式的 5-4-3-2-1 感官接地气练习
 *   C. 安全地带可视化
 *   D. 身体扫描（EMDR Phase 6）
 */
(function (global) {
  'use strict';

  /* ─── A. 紧急出口浮层 ─── */

  const GROUNDING_STEPS = [
    { icon: '👀', title: '视觉 · 看到 5 件东西', prompt: '环顾四周，在心里说出 5 件你现在能看到的东西的名称。例如：桌子、窗户、手机…', breath: false },
    { icon: '✋', title: '触觉 · 触摸 4 件东西', prompt: '依次触摸你周围 4 件不同质地的物体，感受它们的温度与触感。', breath: true },
    { icon: '👂', title: '听觉 · 听到 3 种声音', prompt: '闭上眼睛，静静聆听，识别 3 种不同的声音。', breath: false },
    { icon: '👃', title: '嗅觉 · 闻到 2 种气味', prompt: '深呼吸，感受 2 种你能闻到的气味，或者想象你最喜欢的气味。', breath: true },
    { icon: '👅', title: '味觉 · 感受 1 种味道', prompt: '注意嘴里的味道，或者想象你喜欢的食物的味道。', breath: false },
    { icon: '🌿', title: '完成 · 回到当下', prompt: '深深地吸一口气，缓缓呼出。感受双脚踏在地面上——你在这里，你是安全的。', breath: true },
  ];

  let _groundingStep = 0;

  function initEmergencyGrounding() {
    const overlay     = document.getElementById('grounding-overlay');
    const stepText    = document.getElementById('grounding-step-text');
    const nextBtn     = document.getElementById('grounding-next-btn');
    const closeBtn    = document.getElementById('grounding-close-btn');
    const breathCircle = document.getElementById('grounding-breath-circle');

    if (!overlay || !stepText || !nextBtn || !closeBtn) return;

    function showStep(idx) {
      const step = GROUNDING_STEPS[idx];
      stepText.innerHTML = `<strong>${step.icon} ${step.title}</strong><br/><br/>${step.prompt}`;
      if (breathCircle) breathCircle.style.display = step.breath ? 'block' : 'none';
      nextBtn.textContent = idx < GROUNDING_STEPS.length - 1 ? '下一步' : '关闭';
    }

    // 打开
    document.getElementById('safe-exit-btn')?.addEventListener('click', () => {
      _groundingStep = 0;
      State.set('groundingUsed', (State.get('groundingUsed') || 0) + 1);
      showStep(0);
      overlay.classList.remove('hidden');
    });

    // 下一步
    nextBtn.addEventListener('click', () => {
      _groundingStep++;
      if (_groundingStep >= GROUNDING_STEPS.length) {
        overlay.classList.add('hidden');
        _groundingStep = 0;
      } else {
        showStep(_groundingStep);
      }
    });

    // 返回
    closeBtn.addEventListener('click', () => {
      overlay.classList.add('hidden');
      _groundingStep = 0;
    });
  }

  /* ─── B. 正式接地气 + 安全地带（作为模块） ─── */

  const GroundingModule = {
    id: 'grounding',
    title: '接地气 & 结束',
    _phase: 'scan',  // 'scan' | 'safe_place'

    render() {
      return this._renderBodyScan();
    },

    _renderBodyScan() {
      return `
        <div class="card">
          <span class="tag">第 7 步 · 身体扫描</span>
          <h2>身体扫描 🫀</h2>
          <p class="subtitle">
            在创伤记忆处理后，花几分钟扫描全身，
            确认没有残留的紧张感。如有，用呼吸将它送走。
          </p>

          <div style="background:#f0f7fb;border-radius:8px;padding:16px;margin-bottom:20px;">
            <ol style="padding-left:20px;line-height:2;font-size:.95rem;">
              <li>闭上眼睛，从<strong>头顶</strong>开始缓慢向下扫描</li>
              <li>注意<strong>脸部、颈部、肩膀、胸口、腹部、双手、腿部、双脚</strong></li>
              <li>如果发现紧张或不适，想象每次呼气都将那里的紧张送走</li>
              <li>当全身都感觉放松平静时，睁开眼睛</li>
            </ol>
          </div>

          <!-- 身体轮廓图（SVG 简版） -->
          <div style="display:flex;justify-content:center;margin:10px 0 20px;">
            <svg width="80" height="180" viewBox="0 0 80 180" fill="none" xmlns="http://www.w3.org/2000/svg">
              <!-- 头 -->
              <circle cx="40" cy="20" r="16" fill="#dbeef7" stroke="#3a86a8" stroke-width="2"/>
              <!-- 身体 -->
              <rect x="24" y="38" width="32" height="56" rx="6" fill="#dbeef7" stroke="#3a86a8" stroke-width="2"/>
              <!-- 左臂 -->
              <rect x="8"  y="38" width="14" height="44" rx="6" fill="#dbeef7" stroke="#3a86a8" stroke-width="2"/>
              <!-- 右臂 -->
              <rect x="58" y="38" width="14" height="44" rx="6" fill="#dbeef7" stroke="#3a86a8" stroke-width="2"/>
              <!-- 左腿 -->
              <rect x="24" y="96" width="14" height="72" rx="6" fill="#dbeef7" stroke="#3a86a8" stroke-width="2"/>
              <!-- 右腿 -->
              <rect x="42" y="96" width="14" height="72" rx="6" fill="#dbeef7" stroke="#3a86a8" stroke-width="2"/>
              <!-- 扫描动画线 -->
              <line id="scan-line" x1="0" y1="20" x2="80" y2="20"
                    stroke="var(--color-secondary)" stroke-width="2.5" stroke-dasharray="4 3" opacity="0.8">
                <animate attributeName="y1" from="0" to="180" dur="6s" repeatCount="2" fill="freeze"/>
                <animate attributeName="y2" from="0" to="180" dur="6s" repeatCount="2" fill="freeze"/>
              </line>
            </svg>
          </div>

          <div class="form-group">
            <label for="scan-notes">扫描后，你的身体感觉如何？（可选填写）</label>
            <textarea id="scan-notes" rows="2" placeholder="例如：肩膀放松了，腹部还有一点点紧…"></textarea>
          </div>

          <div class="btn-group">
            <button class="nav-btn primary" id="scan-next-btn">进入安全地带 →</button>
          </div>
        </div>
      `;
    },

    _renderSafePlace() {
      return `
        <div class="card">
          <span class="tag">第 7 步 · 安全地带</span>
          <h2>你的安全地带 🏡</h2>
          <p class="subtitle">
            现在，让我们一起创建一个属于你的"心灵安全地带"——
            每当情绪激烈时，你可以在脑海中回到这里。
          </p>

          <div style="background:#e8f7f0;border-left:4px solid var(--color-secondary);
                      padding:14px;border-radius:0 8px 8px 0;margin-bottom:20px;">
            <p style="margin:0;font-size:.95rem;">
              🌊 想象一个让你感到<strong>完全安全、平静</strong>的地方。
              它可以是真实存在的，也可以是你想象出来的。
              注意其中的<em>声音、气味、色彩和感觉</em>。
            </p>
          </div>

          <div class="form-group">
            <label for="safe-place-input">🗺️ 描述你的安全地带</label>
            <textarea id="safe-place-input" rows="4"
              placeholder="例如：一片宁静的海边，有轻柔的海浪声，温暖的阳光，白色的沙滩，空气中带有淡淡的咸味…"></textarea>
          </div>

          <!-- 呼吸练习 -->
          <h3>🌬️ 深呼吸练习（跟随圆圈节奏）</h3>
          <p style="font-size:.9rem;color:var(--color-text-muted);">吸气 4 秒 → 屏气 4 秒 → 呼气 6 秒</p>
          <div style="display:flex;flex-direction:column;align-items:center;margin:16px 0;">
            <div id="breath-ring" style="
              width:90px;height:90px;border-radius:50%;
              background:radial-gradient(circle, var(--color-secondary), var(--color-primary));
              animation:breathe 14s ease-in-out infinite;
              box-shadow:0 0 24px rgba(58,134,168,.35);
            "></div>
            <p id="breath-label" style="margin-top:12px;color:var(--color-primary);font-weight:600;font-size:1rem;">
              吸气…
            </p>
          </div>

          <div class="btn-group">
            <button class="nav-btn primary" id="grounding-done-btn">完成 →</button>
          </div>
        </div>
      `;
    },

    bind() {
      if (this._phase === 'scan') {
        document.getElementById('scan-next-btn')?.addEventListener('click', () => {
          this._phase = 'safe_place';
          document.getElementById('screen-container').innerHTML = this._renderSafePlace();
          this.bind();
          _startBreathCycle();
        });
      } else {
        document.getElementById('grounding-done-btn')?.addEventListener('click', () => {
          this._phase = 'scan';
          App.next();
        });
      }
    },
  };

  /* ─── 呼吸节奏文字动画 ─── */
  let _breathTimerId = null;

  function _startBreathCycle() {
    if (_breathTimerId !== null) clearTimeout(_breathTimerId);

    const label = document.getElementById('breath-label');
    if (!label) return;
    const phases = [
      { text: '吸气…',   duration: 4000 },
      { text: '屏气…',   duration: 4000 },
      { text: '呼气…',   duration: 6000 },
    ];
    let idx = 0;
    function next() {
      // Stop if the element is no longer in the DOM (user navigated away)
      if (!document.getElementById('breath-label')) {
        _breathTimerId = null;
        return;
      }
      const p = phases[idx % phases.length];
      label.textContent = p.text;
      idx++;
      _breathTimerId = setTimeout(next, p.duration);
    }
    next();
  }

  // 暴露到全局
  global.GroundingModule = GroundingModule;
  global.initEmergencyGrounding = initEmergencyGrounding;
})(window);
