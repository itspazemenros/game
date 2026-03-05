/**
 * Module 4 — 认知偏差识别（CBT：认知扭曲类型）
 * 展示一个简短情景，让用户识别其中的认知扭曲，
 * 然后提供心理教育说明。
 */
(function (global) {
  'use strict';

  const DISTORTIONS = [
    {
      key: 'all_or_nothing',
      name: '非黑即白',
      icon: '⚡',
      desc: '用极端、全有或全无的方式看待事情。',
      example: '"我搞砸了一道题，所以我完全失败了。"',
    },
    {
      key: 'catastrophizing',
      name: '灾难化',
      icon: '🌋',
      desc: '把小问题放大成最坏的结局。',
      example: '"我犯了个错误，所有人都会嘲笑我，我的生活完了。"',
    },
    {
      key: 'mind_reading',
      name: '揣摩他人',
      icon: '🔮',
      desc: '假设自己知道别人在想什么，且通常是负面的。',
      example: '"他今天没打招呼，肯定是讨厌我了。"',
    },
    {
      key: 'overgeneralization',
      name: '过度泛化',
      icon: '🔁',
      desc: '从单一事件推断出普遍规律。',
      example: '"我又被拒绝了，我永远找不到工作。"',
    },
    {
      key: 'emotional_reasoning',
      name: '情感推理',
      icon: '💭',
      desc: '把感受当作事实的证据。',
      example: '"我感觉自己是个累赘，所以我就是。"',
    },
    {
      key: 'should_statements',
      name: '"应该"句式',
      icon: '📜',
      desc: '用严苛的"应该"标准要求自己或他人。',
      example: '"我不应该感到焦虑，我应该坚强。"',
    },
    {
      key: 'personalization',
      name: '个人化',
      icon: '🎯',
      desc: '把外部事件的责任都揽到自己身上。',
      example: '"同事今天心情不好，一定是我做了什么。"',
    },
    {
      key: 'mental_filter',
      name: '心理过滤',
      icon: '🔍',
      desc: '只关注负面细节，忽略整体正面信息。',
      example: '"我的演讲有一处卡顿，整个演讲都糟透了。"',
    },
  ];

  // 情景题库（每道题含正确答案）
  const SCENARIOS = [
    {
      text: '小李参加了一场工作面试，总体发挥不错，但结束时忘了感谢面试官。回家后他一直想："我真是太蠢了，这份工作肯定没戏了，我这辈子找不到好工作。"',
      answer: 'catastrophizing',
      hint: '他将一个小失误（忘说谢谢）放大成了极端的坏结果。',
    },
    {
      text: '小红在团队会议上提出了一个新想法，大部分人赞同，但一个同事沉默不语。小红心想："那个人肯定觉得我的想法很蠢，他讨厌我。"',
      answer: 'mind_reading',
      hint: '她假设自己能猜到同事沉默的负面原因，没有任何证据。',
    },
    {
      text: '小张在健身打卡中断了一天，他心里想："只要一天不锻炼，我的计划就全完了，我就是个没有毅力的人。"',
      answer: 'all_or_nothing',
      hint: '他用"全有或全无"的极端方式看待一次小中断。',
    },
    {
      text: '小美的男朋友有一次没有回复她的信息，她立刻担忧："他不爱我了，我们的感情出问题了，我感觉到他要分手了。"',
      answer: 'emotional_reasoning',
      hint: '她把自己的焦虑感受当作感情出问题的"证明"。',
    },
  ];

  const CogBiasModule = {
    id: 'cogBiasAssessment',
    title: '认知偏差识别',

    _scenarioIdx: 0,
    _phase: 'quiz',        // 'quiz' | 'result' | 'edu'
    _selectedKey: null,
    _correct: false,

    render() {
      this._scenarioIdx = State.get('distortionScenario') || 0;
      this._phase = 'quiz';
      this._selectedKey = null;
      return this._renderQuiz();
    },

    _renderQuiz() {
      const scenario = SCENARIOS[this._scenarioIdx];
      return `
        <div class="card">
          <span class="tag">第 3 步 · 认知偏差识别</span>
          <h2>找出思维中的"陷阱" 🕵️</h2>
          <p class="subtitle">读下面这个故事，选出其中最主要的认知扭曲类型。</p>

          <div style="background:#f0f7fb;border-left:4px solid var(--color-primary);padding:16px;border-radius:0 8px 8px 0;margin-bottom:20px;">
            <p style="margin:0;font-size:1rem;line-height:1.7;">${scenario.text}</p>
          </div>

          <h3>这段内心独白主要体现了哪种认知扭曲？</h3>
          <ul class="distortion-list" id="distortion-list">
            ${DISTORTIONS.map(d => `
              <li data-key="${d.key}">
                <span class="dist-title">${d.icon} ${d.name}</span>
                <div class="dist-desc">${d.desc}</div>
              </li>
            `).join('')}
          </ul>

          <div class="btn-group">
            <button class="nav-btn primary" id="cog-submit-btn" disabled>确认答案</button>
          </div>
        </div>
      `;
    },

    _renderResult() {
      const scenario = SCENARIOS[this._scenarioIdx];
      const chosen = DISTORTIONS.find(d => d.key === this._selectedKey);
      const correct = DISTORTIONS.find(d => d.key === scenario.answer);
      return `
        <div class="card">
          <span class="tag">第 3 步 · 答案解析</span>
          <h2>${this._correct ? '🎉 回答正确！' : '💡 再想想…'}</h2>

          ${!this._correct ? `
            <p>你选择了：<strong>${chosen?.icon} ${chosen?.name}</strong></p>
          ` : ''}

          <div style="background:${this._correct ? '#d4edda' : '#fff3cd'};border-radius:8px;padding:16px;margin:16px 0;">
            <p><strong>✅ 正确答案：${correct?.icon} ${correct?.name}</strong></p>
            <p style="margin-top:8px;font-size:.95rem;">${scenario.hint}</p>
          </div>

          <h3>📚 关于「${correct?.name}」</h3>
          <p>${correct?.desc}</p>
          <p style="color:var(--color-text-muted);font-size:.9rem;">典型例句：${correct?.example}</p>

          <h3 style="margin-top:16px;">💬 如何纠正这个偏差？</h3>
          <p>${_getReframeTip(scenario.answer)}</p>

          <div class="btn-group">
            <button class="nav-btn primary" id="cog-continue-btn">继续 →</button>
          </div>
        </div>
      `;
    },

    bind() {
      if (this._phase === 'quiz') {
        this._bindQuiz();
      } else {
        this._bindResult();
      }
    },

    _bindQuiz() {
      document.querySelectorAll('#distortion-list li').forEach(li => {
        li.addEventListener('click', () => {
          document.querySelectorAll('#distortion-list li').forEach(l => l.classList.remove('active'));
          li.classList.add('active');
          this._selectedKey = li.dataset.key;
          document.getElementById('cog-submit-btn').disabled = false;
        });
      });

      document.getElementById('cog-submit-btn').addEventListener('click', () => {
        const scenario = SCENARIOS[this._scenarioIdx];
        this._correct = this._selectedKey === scenario.answer;
        State.set('selectedDistortion', this._selectedKey);
        this._phase = 'result';
        // 重新渲染结果
        document.getElementById('screen-container').innerHTML = this._renderResult();
        this._bindResult();
      });
    },

    _bindResult() {
      document.getElementById('cog-continue-btn').addEventListener('click', () => {
        // 记录下次从哪个场景开始（循环，以便重复使用）
        const nextIdx = (this._scenarioIdx + 1) % SCENARIOS.length;
        State.set('distortionScenario', nextIdx);
        // 始终进入下一模块（不在本模块内循环）
        App.next();
      });
    },
  };

  function _getReframeTip(key) {
    const tips = {
      all_or_nothing: '试着用"有时"、"有些"来替代绝对化词汇。问问自己：是否存在中间地带？',
      catastrophizing: '问自己：最坏情况发生的概率有多大？即使最坏情况发生，我能应对吗？',
      mind_reading: '识别出"我在猜测他人想法"。用实际证据或直接沟通取代臆测。',
      overgeneralization: '找一个反例来打破"永远/从不"的结论。',
      emotional_reasoning: '区分感受与事实："我感到…"不等于"事实是…"',
      should_statements: '把"应该"换成"我希望"或"对我来说这很重要"，减少自我批判。',
      personalization: '列举出其他可能导致该事件的因素，分散责任归因。',
      mental_filter: '刻意寻找被忽视的积极信息，练习整体视角。',
    };
    return tips[key] || '尝试用更平衡、有证据的思维方式取代自动化的负面想法。';
  }

  global.CogBiasModule = CogBiasModule;
})(window);
