/**
 * Module 6 — EMDR 双侧刺激脱敏（Phase 4: Desensitization）
 * 流程：
 *   1. 简短指导语
 *   2. 聚焦目标记忆 + NC + 情绪 + 身体感觉
 *   3. 开始双侧视觉刺激（左右移动的光球）+ 可选双侧音调
 *   4. 每轮结束后评定 SUD
 *   5. 重复至 SUD ≤ 2 或达到最大轮数
 */
(function (global) {
  'use strict';

  const MAX_ROUNDS = 6;
  const ROUND_DURATION_MS = 24000;  // 每轮 24 秒
  const BALL_SPEED_OPTIONS = { slow: 3000, medium: 1800, fast: 1000 }; // 单次横穿时间(ms)

  let _animationId   = null;
  let _roundTimer    = null;
  let _ballDir       = 1;       // 1=向右, -1=向左
  let _ballPos       = 10;      // 百分比
  let _lastTime      = null;
  let _speed         = BALL_SPEED_OPTIONS.medium;
  let _running       = false;
  let _currentRound  = 0;
  let _audioEnabled  = true;

  const EMDRModule = {
    id: 'emdrDesensitization',
    title: 'EMDR 脱敏',

    render() {
      const memory   = State.esc(State.get('targetMemory') || '（目标记忆）');
      const nc       = State.esc(State.get('negCognition') || '（负性认知）');
      const emotions = (State.get('emotions') || []).map(e => State.esc(e)).join('、') || '（情绪）';
      const body     = State.esc(State.get('bodySensation') || '（身体感觉）');
      const sud      = State.get('sudBefore') || 5;

      return `
        <div class="card">
          <span class="tag">第 5 步 · EMDR 脱敏</span>
          <h2>双侧刺激脱敏 👁️</h2>

          <!-- 聚焦提示 -->
          <div style="background:#f0f7fb;border-radius:8px;padding:14px;margin-bottom:16px;">
            <p style="margin:0 0 6px;font-size:.9rem;font-weight:600;">🎯 在本轮练习中，请同时注意：</p>
            <ul style="margin:0;padding-left:18px;font-size:.9rem;color:var(--color-text-muted);">
              <li>记忆画面：<strong style="color:var(--color-text)">${memory.slice(0,40)}…</strong></li>
              <li>负性信念：<strong style="color:var(--color-text)">${nc}</strong></li>
              <li>情绪：<strong style="color:var(--color-text)">${emotions}</strong></li>
              <li>身体感觉：<strong style="color:var(--color-text)">${body}</strong></li>
            </ul>
          </div>

          <!-- EMDR 轨道 -->
          <div id="emdr-track">
            <div id="emdr-ball"></div>
          </div>

          <!-- 控制栏 -->
          <div id="emdr-controls">
            <button class="nav-btn primary" id="emdr-start-btn">▶ 开始本轮</button>
            <button class="nav-btn secondary hidden" id="emdr-stop-btn">⏸ 暂停</button>

            <label id="emdr-speed-label">速度：
              <select id="emdr-speed-select">
                <option value="slow">慢</option>
                <option value="medium" selected>中</option>
                <option value="fast">快</option>
              </select>
            </label>

            <label style="font-size:.9rem;color:var(--color-text-muted);">
              <input type="checkbox" id="emdr-audio-check" checked /> 双侧音调
            </label>
          </div>

          <!-- 进度 -->
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
            <span style="font-size:.9rem;color:var(--color-text-muted);">
              第 <span id="emdr-round-num">0</span> / ${MAX_ROUNDS} 轮
            </span>
            <span id="emdr-round-timer" style="font-size:.9rem;color:var(--color-primary);font-weight:700;"></span>
          </div>

          <!-- SUD 评估（每轮后显示） -->
          <div id="emdr-sud-section" class="hidden">
            <hr class="divider" />
            <h3>本轮结束后，现在的痛苦程度（SUD）？</h3>
            <div class="slider-wrap">
              <label><span>0 完全平静</span><span>10 极度痛苦</span></label>
              <input type="range" id="emdr-sud-slider" min="0" max="10" step="1" value="${sud}" />
              <div class="slider-value" id="emdr-sud-value">${sud}</div>
            </div>
            <div id="emdr-notice" style="font-size:.9rem;color:var(--color-text-muted);margin-bottom:12px;"></div>
            <div class="btn-group">
              <button class="nav-btn primary" id="emdr-next-round-btn">继续下一轮</button>
              <button class="nav-btn secondary" id="emdr-finish-btn">完成脱敏</button>
            </div>
          </div>

          <!-- SUD 历史 -->
          <div id="emdr-sud-history" style="margin-top:12px;"></div>
        </div>
      `;
    },

    bind() {
      _currentRound = State.get('emdrRounds') || 0;
      _speed = BALL_SPEED_OPTIONS.medium;
      _running = false;

      document.getElementById('emdr-round-num').textContent = _currentRound;
      _renderSudHistory();

      // 开始按钮
      document.getElementById('emdr-start-btn').addEventListener('click', () => {
        _startRound();
      });

      // 暂停按钮
      document.getElementById('emdr-stop-btn').addEventListener('click', () => {
        _stopRound(false);
      });

      // 速度选择
      document.getElementById('emdr-speed-select').addEventListener('change', (e) => {
        _speed = BALL_SPEED_OPTIONS[e.target.value] || BALL_SPEED_OPTIONS.medium;
      });

      // 音频开关
      document.getElementById('emdr-audio-check').addEventListener('change', (e) => {
        _audioEnabled = e.target.checked;
        if (!_audioEnabled) Audio2.stopAmbient();
        else if (_running) Audio2.startAmbient();
      });

      // SUD 滑块
      document.getElementById('emdr-sud-slider').addEventListener('input', (e) => {
        document.getElementById('emdr-sud-value').textContent = e.target.value;
      });

      // 下一轮
      document.getElementById('emdr-next-round-btn').addEventListener('click', () => {
        _recordSud();
        if (_currentRound >= MAX_ROUNDS) {
          _finishDesensitization();
          return;
        }
        // 隐藏 SUD 区
        document.getElementById('emdr-sud-section').classList.add('hidden');
        _renderSudHistory();
        // 重置开始按钮
        document.getElementById('emdr-start-btn').classList.remove('hidden');
        document.getElementById('emdr-stop-btn').classList.add('hidden');
      });

      // 完成
      document.getElementById('emdr-finish-btn').addEventListener('click', () => {
        _recordSud();
        _finishDesensitization();
      });
    },
  };

  /* ─── 内部辅助函数 ─── */

  function _startRound() {
    if (_running) return;
    _running = true;
    _currentRound++;
    State.set('emdrRounds', _currentRound);
    document.getElementById('emdr-round-num').textContent = _currentRound;
    document.getElementById('emdr-start-btn').classList.add('hidden');
    document.getElementById('emdr-stop-btn').classList.remove('hidden');
    document.getElementById('emdr-sud-section').classList.add('hidden');

    if (_audioEnabled) Audio2.startAmbient();

    // 定时结束
    let remaining = ROUND_DURATION_MS / 1000;
    const timerEl = document.getElementById('emdr-round-timer');
    timerEl.textContent = `⏱ ${remaining}s`;
    _roundTimer = setInterval(() => {
      remaining--;
      if (timerEl) timerEl.textContent = `⏱ ${remaining}s`;
      if (remaining <= 0) _stopRound(true);
    }, 1000);

    // 动画
    _lastTime = null;
    _ballPos = 10;
    _ballDir = 1;
    _animationId = requestAnimationFrame(_animateBall);
  }

  function _stopRound(auto) {
    if (!_running && !auto) return;
    _running = false;
    cancelAnimationFrame(_animationId);
    clearInterval(_roundTimer);

    const timerEl = document.getElementById('emdr-round-timer');
    if (timerEl) timerEl.textContent = '';
    Audio2.stopAmbient();

    document.getElementById('emdr-start-btn').classList.remove('hidden');
    document.getElementById('emdr-stop-btn').classList.add('hidden');

    if (auto) {
      // 显示 SUD 评估区
      document.getElementById('emdr-sud-section').classList.remove('hidden');
      // 写提示语
      const notice = document.getElementById('emdr-notice');
      const prevSud = State.get('sudHistory').slice(-1)[0] ?? State.get('sudBefore');
      if (notice) {
        notice.textContent = `上次评分：${prevSud}。如果 SUD ≤ 2，可以点击"完成脱敏"。`;
      }
    }
  }

  function _animateBall(timestamp) {
    if (!_running) return;

    const ball = document.getElementById('emdr-ball');
    const track = document.getElementById('emdr-track');
    if (!ball || !track) return;

    if (_lastTime === null) _lastTime = timestamp;
    const delta = timestamp - _lastTime;
    _lastTime = timestamp;

    // 每毫秒移动的百分比 = 80% / speed_ms
    const stepPct = (delta / _speed) * 80;
    _ballPos += _ballDir * stepPct;

    if (_ballPos >= 90) {
      _ballPos = 90;
      _ballDir = -1;
      if (_audioEnabled) Audio2.playTone('right', 520);
    } else if (_ballPos <= 10) {
      _ballPos = 10;
      _ballDir = 1;
      if (_audioEnabled) Audio2.playTone('left', 440);
    }

    ball.style.left = _ballPos + '%';
    _animationId = requestAnimationFrame(_animateBall);
  }

  function _recordSud() {
    const sliderVal = parseInt(document.getElementById('emdr-sud-slider')?.value ?? State.get('sudBefore'), 10);
    State.push('sudHistory', sliderVal);
    State.set('sudAfter', sliderVal);
  }

  function _renderSudHistory() {
    const container = document.getElementById('emdr-sud-history');
    if (!container) return;
    const history = State.get('sudHistory') || [];
    if (history.length < 2) { container.innerHTML = ''; return; }

    const bars = history.map((val, i) => {
      const pct = val * 10;
      const color = val <= 3 ? '#6dbfa8' : val <= 6 ? '#f4a261' : '#e76f51';
      return `
        <div class="chart-bar-row">
          <div class="chart-bar-label">${i === 0 ? '基线' : `第${i}轮`}</div>
          <div class="chart-bar-track">
            <div class="chart-bar-fill" style="width:${pct}%;background:${color}"></div>
          </div>
          <div class="chart-bar-val">${val}</div>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <h3 style="margin-bottom:10px;">📊 SUD 变化</h3>
      ${bars}
    `;
  }

  function _finishDesensitization() {
    State.set('emdrComplete', true);
    Audio2.stopAmbient();
    App.next();
  }

  global.EMDRModule = EMDRModule;
})(window);
