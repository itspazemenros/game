/**
 * Module 3 — 创伤目标识别（EMDR Phase 3: Assessment）
 * 引导用户:
 *   1. 用文字描述一个困扰他们的记忆/场景
 *   2. 识别负性认知（NC）& 期望的正向认知（PC）
 *   3. 识别情绪与身体感觉
 *   4. 评定基线 SUD（主观痛苦单位，0-10）
 */
(function (global) {
  'use strict';

  // 常用负性认知预设
  const NC_PRESETS = [
    '我不够好', '我是失败者', '我不值得被爱',
    '我很无力', '我是危险的', '我应该受到惩罚',
    '我无法信任任何人', '我需要完美才能被接受',
  ];

  // 常用正向认知预设
  const PC_PRESETS = [
    '我足够好', '我可以成功', '我值得被爱',
    '我能掌控自己', '我是安全的', '我可以被原谅',
    '我可以选择信任', '我已经够好了',
  ];

  // 常用情绪
  const EMOTION_LIST = [
    { emoji: '😰', label: '焦虑' },
    { emoji: '😢', label: '悲伤' },
    { emoji: '😡', label: '愤怒' },
    { emoji: '😞', label: '羞耻' },
    { emoji: '😨', label: '恐惧' },
    { emoji: '😶', label: '麻木' },
    { emoji: '🥴', label: '困惑' },
    { emoji: '💔', label: '受伤' },
  ];

  const TargetModule = {
    id: 'targetIdentification',
    title: '目标识别',

    render() {
      const sud = State.get('sudBefore');
      const emotions = State.get('emotions') || [];
      const esc = State.esc;
      return `
        <div class="card">
          <span class="tag">第 2 步 · EMDR 评估</span>
          <h2>识别今天的处理目标 🎯</h2>
          <p class="subtitle">请尽可能诚实地填写。这些信息只用于本次游戏，不会上传任何地方。</p>

          <!-- 记忆描述 -->
          <div class="form-group">
            <label for="target-memory-input">📖 用一两句话描述让你困扰的记忆或场景</label>
            <textarea id="target-memory-input" rows="3"
              placeholder="例如：上周和朋友争吵后，我觉得自己一无是处…">${esc(State.get('targetMemory') || '')}</textarea>
          </div>

          <hr class="divider" />

          <!-- 负性认知 -->
          <div class="form-group">
            <label>🔴 你对自己最消极的想法是？（负性认知）</label>
            <div class="choice-grid" id="nc-grid">
              ${NC_PRESETS.map(nc => `
                <div class="choice-card ${State.get('negCognition') === nc ? 'active' : ''}" data-nc="${nc}">
                  <div class="label">${nc}</div>
                </div>
              `).join('')}
            </div>
            <input type="text" id="nc-custom" placeholder="或自己输入…" style="margin-top:10px;"
              value="${!NC_PRESETS.includes(State.get('negCognition') || '') ? esc(State.get('negCognition') || '') : ''}" />
          </div>

          <hr class="divider" />

          <!-- 正向认知 -->
          <div class="form-group">
            <label>🟢 你希望对自己的积极想法是？（正向认知）</label>
            <div class="choice-grid" id="pc-grid">
              ${PC_PRESETS.map(pc => `
                <div class="choice-card ${State.get('posCognition') === pc ? 'active' : ''}" data-pc="${pc}">
                  <div class="label">${pc}</div>
                </div>
              `).join('')}
            </div>
            <input type="text" id="pc-custom" placeholder="或自己输入…" style="margin-top:10px;"
              value="${!PC_PRESETS.includes(State.get('posCognition') || '') ? esc(State.get('posCognition') || '') : ''}" />
          </div>

          <hr class="divider" />

          <!-- 情绪选择 -->
          <div class="form-group">
            <label>💙 现在浮现的情绪有哪些？（可多选）</label>
            <div class="choice-grid" id="emotion-grid">
              ${EMOTION_LIST.map(e => `
                <div class="choice-card ${emotions.includes(e.label) ? 'active' : ''}" data-emotion="${e.label}">
                  <span class="icon">${e.emoji}</span>
                  <div class="label">${e.label}</div>
                </div>
              `).join('')}
            </div>
          </div>

          <hr class="divider" />

          <!-- 身体感觉 -->
          <div class="form-group">
            <label for="body-sensation-input">🫀 你在身体的哪个部位感受到这些情绪？</label>
            <input type="text" id="body-sensation-input"
              placeholder="例如：胸口很紧、喉咙发紧、胃部不舒服…"
              value="${esc(State.get('bodySensation') || '')}" />
          </div>

          <hr class="divider" />

          <!-- SUD 基线 -->
          <div class="form-group">
            <label>📊 痛苦程度评分（SUD）：当你想到这个记忆时，有多痛苦？</label>
            <div class="slider-wrap">
              <label><span>0 完全平静</span><span>10 极度痛苦</span></label>
              <input type="range" id="sud-slider" min="0" max="10" step="1" value="${sud || 5}" />
              <div class="slider-value" id="sud-value">${sud || 5}</div>
            </div>
          </div>

          <div class="btn-group">
            <button class="nav-btn primary" id="target-next-btn">下一步 →</button>
          </div>
        </div>
      `;
    },

    bind() {
      // 记忆文本
      document.getElementById('target-memory-input').addEventListener('input', (e) => {
        State.set('targetMemory', e.target.value.trim());
      });

      // NC 选择
      document.querySelectorAll('#nc-grid .choice-card').forEach(card => {
        card.addEventListener('click', () => {
          document.querySelectorAll('#nc-grid .choice-card').forEach(c => c.classList.remove('active'));
          card.classList.add('active');
          State.set('negCognition', card.dataset.nc);
          document.getElementById('nc-custom').value = '';
        });
      });
      document.getElementById('nc-custom').addEventListener('input', (e) => {
        document.querySelectorAll('#nc-grid .choice-card').forEach(c => c.classList.remove('active'));
        State.set('negCognition', e.target.value.trim());
      });

      // PC 选择
      document.querySelectorAll('#pc-grid .choice-card').forEach(card => {
        card.addEventListener('click', () => {
          document.querySelectorAll('#pc-grid .choice-card').forEach(c => c.classList.remove('active'));
          card.classList.add('active');
          State.set('posCognition', card.dataset.pc);
          document.getElementById('pc-custom').value = '';
        });
      });
      document.getElementById('pc-custom').addEventListener('input', (e) => {
        document.querySelectorAll('#pc-grid .choice-card').forEach(c => c.classList.remove('active'));
        State.set('posCognition', e.target.value.trim());
      });

      // 情绪多选
      document.querySelectorAll('#emotion-grid .choice-card').forEach(card => {
        card.addEventListener('click', () => {
          card.classList.toggle('active');
          const selected = Array.from(document.querySelectorAll('#emotion-grid .choice-card.active'))
            .map(c => c.dataset.emotion);
          State.set('emotions', selected);
        });
      });

      // 身体感觉
      document.getElementById('body-sensation-input').addEventListener('input', (e) => {
        State.set('bodySensation', e.target.value.trim());
      });

      // SUD 滑块
      const sudSlider = document.getElementById('sud-slider');
      const sudValue  = document.getElementById('sud-value');
      sudSlider.addEventListener('input', () => {
        sudValue.textContent = sudSlider.value;
        State.set('sudBefore', parseInt(sudSlider.value, 10));
      });

      // 下一步
      document.getElementById('target-next-btn').addEventListener('click', () => {
        if (!State.get('targetMemory')) {
          alert('请描述一下让你困扰的记忆。');
          return;
        }
        State.push('sudHistory', State.get('sudBefore'));
        App.next();
      });
    },
  };

  global.TargetModule = TargetModule;
})(window);
