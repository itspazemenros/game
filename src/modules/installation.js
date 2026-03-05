/**
 * Module 7 — 正向认知安装（EMDR Phase 5: Installation）
 * 用双侧刺激强化正向认知（PC），评定 VOC（认知有效性，1-7）
 */
(function (global) {
  'use strict';

  const INSTALL_DURATION_MS = 15000; // 每轮 15 秒
  const INSTALL_MAX_ROUNDS  = 3;

  let _running  = false;
  let _animId   = null;
  let _timer    = null;
  let _ballDir  = 1;
  let _ballPos  = 10;
  let _lastTime = null;
  let _rounds   = 0;

  const InstallationModule = {
    id: 'installation',
    title: '正向安装',

    render() {
      const pc  = State.esc(State.get('posCognition') || '我足够好');
      const voc = State.get('vocBefore') || 1;
      return `
        <div class="card">
          <span class="tag">第 6 步 · EMDR 安装</span>
          <h2>安装正向认知 🌟</h2>
          <p class="subtitle">
            脱敏完成后，我们要把正向的自我信念深深"种入"记忆中。
          </p>

          <!-- 正向认知展示 -->
          <div style="background:linear-gradient(135deg,#dbeef7,#d4edda);
                      border-radius:12px;padding:20px;text-align:center;margin-bottom:20px;">
            <p style="font-size:.9rem;color:var(--color-text-muted);margin-bottom:6px;">你的正向认知</p>
            <p style="font-size:1.6rem;font-weight:700;color:var(--color-primary-dk);margin:0;">"${pc}"</p>
          </div>

          <!-- VOC 前 -->
          <div class="form-group">
            <label>⭐ 此刻你有多相信"${pc}"？（VOC：1=完全不信，7=完全相信）</label>
            <div class="slider-wrap">
              <label><span>1 完全不信</span><span>7 完全相信</span></label>
              <input type="range" id="voc-slider" min="1" max="7" step="1" value="${voc}" />
              <div class="slider-value" id="voc-value">${voc}</div>
            </div>
          </div>

          <!-- 积极画面输入 -->
          <div class="form-group">
            <label for="pos-image-input">🖼️ 想象一个与"${pc}"一致的正面画面或记忆（可选）</label>
            <textarea id="pos-image-input" rows="2"
              placeholder="例如：我帮助朋友解决问题时的那种满足感…">${State.get('posImage') || ''}</textarea>
          </div>

          <!-- 安装轨道 -->
          <h3>同时聚焦正向认知与积极画面，跟随光球移动视线：</h3>
          <div id="emdr-track" style="margin:16px 0;">
            <div id="emdr-ball"></div>
          </div>

          <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:16px;">
            <button class="nav-btn primary" id="install-start-btn">▶ 开始安装</button>
            <button class="nav-btn secondary hidden" id="install-stop-btn">⏸ 停止</button>
            <span id="install-timer" style="font-size:.9rem;color:var(--color-primary);font-weight:700;"></span>
            <span style="font-size:.85rem;color:var(--color-text-muted);">
              第 <span id="install-round">0</span> / ${INSTALL_MAX_ROUNDS} 轮
            </span>
          </div>

          <!-- VOC 后评定（每轮后显示） -->
          <div id="install-voc-section" class="hidden">
            <hr class="divider" />
            <h3>安装后，你现在有多相信正向认知？</h3>
            <div class="slider-wrap">
              <label><span>1 完全不信</span><span>7 完全相信</span></label>
              <input type="range" id="voc-after-slider" min="1" max="7" step="1" value="4" />
              <div class="slider-value" id="voc-after-value">4</div>
            </div>
            <div class="btn-group">
              <button class="nav-btn primary" id="install-next-btn">再做一轮</button>
              <button class="nav-btn secondary" id="install-finish-btn">完成安装</button>
            </div>
          </div>
        </div>
      `;
    },

    bind() {
      _running = false;
      _rounds  = 0;

      // VOC 前滑块
      const vocSlider = document.getElementById('voc-slider');
      document.getElementById('voc-value').textContent = vocSlider.value;
      vocSlider.addEventListener('input', (e) => {
        document.getElementById('voc-value').textContent = e.target.value;
        State.set('vocBefore', parseInt(e.target.value, 10));
      });

      // 积极画面
      document.getElementById('pos-image-input').addEventListener('input', (e) => {
        State.set('posImage', e.target.value.trim());
      });

      // 开始
      document.getElementById('install-start-btn').addEventListener('click', _startInstall);

      // 停止
      document.getElementById('install-stop-btn').addEventListener('click', () => _stopInstall(false));

      // VOC 后滑块
      document.getElementById('voc-after-slider').addEventListener('input', (e) => {
        document.getElementById('voc-after-value').textContent = e.target.value;
      });

      // 再做一轮
      document.getElementById('install-next-btn').addEventListener('click', () => {
        _saveVocAfter();
        if (_rounds >= INSTALL_MAX_ROUNDS) { _finishInstall(); return; }
        document.getElementById('install-voc-section').classList.add('hidden');
        document.getElementById('install-start-btn').classList.remove('hidden');
        document.getElementById('install-stop-btn').classList.add('hidden');
      });

      // 完成
      document.getElementById('install-finish-btn').addEventListener('click', () => {
        _saveVocAfter();
        _finishInstall();
      });
    },
  };

  /* ─── 内部函数 ─── */

  function _startInstall() {
    if (_running) return;
    _running = true;
    _rounds++;
    document.getElementById('install-round').textContent = _rounds;
    document.getElementById('install-start-btn').classList.add('hidden');
    document.getElementById('install-stop-btn').classList.remove('hidden');
    document.getElementById('install-voc-section').classList.add('hidden');
    Audio2.startAmbient();

    let remaining = INSTALL_DURATION_MS / 1000;
    const timerEl = document.getElementById('install-timer');
    if (timerEl) timerEl.textContent = `⏱ ${remaining}s`;
    _timer = setInterval(() => {
      remaining--;
      if (timerEl) timerEl.textContent = `⏱ ${remaining}s`;
      if (remaining <= 0) _stopInstall(true);
    }, 1000);

    _ballPos  = 10;
    _ballDir  = 1;
    _lastTime = null;
    _animId   = requestAnimationFrame(_animate);
  }

  function _stopInstall(auto) {
    if (!_running && !auto) return;
    _running = false;
    cancelAnimationFrame(_animId);
    clearInterval(_timer);
    Audio2.stopAmbient();

    const timerEl = document.getElementById('install-timer');
    if (timerEl) timerEl.textContent = '';

    document.getElementById('install-start-btn').classList.remove('hidden');
    document.getElementById('install-stop-btn').classList.add('hidden');

    if (auto) {
      document.getElementById('install-voc-section').classList.remove('hidden');
    }
  }

  function _animate(timestamp) {
    if (!_running) return;
    const ball  = document.getElementById('emdr-ball');
    if (!ball) return;
    if (_lastTime === null) _lastTime = timestamp;
    const delta = timestamp - _lastTime;
    _lastTime   = timestamp;

    const step = (delta / 2000) * 80;
    _ballPos += _ballDir * step;
    if (_ballPos >= 90) { _ballPos = 90; _ballDir = -1; Audio2.playTone('right', 520); }
    else if (_ballPos <= 10) { _ballPos = 10; _ballDir = 1; Audio2.playTone('left', 440); }

    ball.style.left = _ballPos + '%';
    _animId = requestAnimationFrame(_animate);
  }

  function _saveVocAfter() {
    const val = parseInt(document.getElementById('voc-after-slider')?.value ?? 4, 10);
    State.set('vocAfter', val);
  }

  function _finishInstall() {
    Audio2.stopAmbient();
    App.next();
  }

  global.InstallationModule = InstallationModule;
})(window);
