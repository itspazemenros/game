/**
 * app.js — 主控制器
 * 管理模块流程、进度条、导航按钮、安全出口
 */
(function (global) {
  'use strict';

  /* ─── 模块注册（按流程顺序） ─── */
  const MODULES = [
    WelcomeModule,
    SafetyModule,
    TargetModule,
    CogBiasModule,
    CBTModule,
    EMDRModule,
    InstallationModule,
    GroundingModule,
    SummaryModule,
  ];

  let _currentIdx = 0;

  /* ─── 公共 App API ─── */
  const App = {
    /** 进入下一个模块 */
    next() {
      if (_currentIdx < MODULES.length - 1) {
        _navigate(_currentIdx + 1);
      }
    },

    /** 回到上一个模块 */
    back() {
      if (_currentIdx > 0) {
        _navigate(_currentIdx - 1);
      }
    },

    /** 跳转到指定模块 id */
    goTo(moduleId) {
      const idx = MODULES.findIndex(m => m.id === moduleId);
      if (idx !== -1) _navigate(idx);
    },

    currentModule() {
      return MODULES[_currentIdx];
    },
  };

  /* ─── 导航内部函数 ─── */
  function _navigate(idx) {
    _currentIdx = idx;
    const mod = MODULES[idx];

    // 1. 渲染屏幕内容
    const container = document.getElementById('screen-container');
    container.innerHTML = mod.render();

    // 2. 绑定事件
    if (typeof mod.bind === 'function') mod.bind();

    // 3. 更新进度条
    _updateProgress(idx);

    // 4. 显示/隐藏底部导航（欢迎页和总结页不显示标准导航）
    const footer = document.getElementById('nav-footer');
    const hideNavOn = ['welcome', 'summary'];
    if (hideNavOn.includes(mod.id)) {
      footer.classList.add('hidden');
    } else {
      footer.classList.remove('hidden');
      document.getElementById('btn-back').style.visibility = idx > 0 ? 'visible' : 'hidden';
    }

    // 5. 显示/隐藏安全出口（欢迎页之后才显示）
    const safeBtn = document.getElementById('safe-exit-btn');
    safeBtn.classList.toggle('hidden', idx === 0);

    // 6. 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function _updateProgress(idx) {
    const total = MODULES.length - 1;
    const pct   = Math.round((idx / total) * 100);
    const bar   = document.getElementById('progress-bar');
    const label = document.getElementById('progress-label');
    const cont  = document.getElementById('progress-bar-container');

    cont.classList.remove('hidden');
    bar.style.width  = pct + '%';
    label.textContent = `${MODULES[idx].title}  ${pct}%`;
  }

  /* ─── 底部导航按钮 ─── */
  document.getElementById('btn-back').addEventListener('click', () => App.back());
  document.getElementById('btn-next').addEventListener('click', () => App.next());

  /* ─── 初始化 ─── */
  function _init() {
    // 初始化紧急接地气浮层
    initEmergencyGrounding();

    // 渲染第一个模块
    _navigate(0);
  }

  // 暴露到全局
  global.App = App;

  // DOM 就绪后启动
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _init);
  } else {
    _init();
  }
})(window);
