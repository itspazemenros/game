/**
 * state.js — 全局状态管理（简单发布/订阅模式）
 * 存储用户在整个疗愈会话中的所有数据
 */
(function (global) {
  'use strict';

  const _state = {
    // 会话元数据
    sessionId: Date.now().toString(36) + Math.random().toString(36).substr(2, 6),
    startTime: new Date(),

    // 用户信息
    userName: '',

    // 安全评估
    safetyRating: null,      // 1~5
    hasSupportPerson: null,  // true/false
    emergencyContact: '',

    // EMDR 目标识别
    targetMemory: '',        // 用文字描述的目标记忆
    negCognition: '',        // 负性认知 (NC)
    posCognition: '',        // 正向认知 (PC)
    emotions: [],            // 情绪列表
    bodySensation: '',       // 身体感觉
    sudBefore: 5,            // 基线 SUD（0-10）
    sudAfter: null,

    // 认知偏差
    selectedDistortion: null,       // 识别到的认知扭曲类型 key
    distortionScenario: null,       // 场景 index

    // CBT 重构
    hotThought: '',
    evidenceFor: '',
    evidenceAgainst: '',
    balancedThought: '',

    // EMDR 脱敏
    emdrRounds: 0,
    sudHistory: [],          // 每轮后的 SUD
    emdrComplete: false,

    // 正向安装
    vocBefore: 1,            // 有效性分数（1-7）
    vocAfter: null,
    posImage: '',

    // 结束
    moodAfter: null,         // 1-10
    badges: [],              // 获得的成就

    // 接地气紧急出口
    groundingUsed: 0,
  };

  // 监听器 { key -> [callback] }
  const _listeners = {};

  const State = {
    get: (key) => _state[key],
    getAll: () => Object.assign({}, _state),

    set: (key, value) => {
      _state[key] = value;
      (_listeners[key] || []).forEach(fn => fn(value));
      (_listeners['*']    || []).forEach(fn => fn(key, value));
    },

    push: (key, value) => {
      if (!Array.isArray(_state[key])) _state[key] = [];
      _state[key].push(value);
    },

    on: (key, fn) => {
      if (!_listeners[key]) _listeners[key] = [];
      _listeners[key].push(fn);
    },

    off: (key, fn) => {
      if (_listeners[key]) {
        _listeners[key] = _listeners[key].filter(f => f !== fn);
      }
    },

    /** 把会话数据保存到 localStorage */
    persist: () => {
      try {
        localStorage.setItem('xljj_session', JSON.stringify(_state));
      } catch (_) { /* 忽略存储失败 */ }
    },

    /** 从 localStorage 恢复（可选） */
    restore: () => {
      try {
        const raw = localStorage.getItem('xljj_session');
        if (raw) {
          const saved = JSON.parse(raw);
          Object.assign(_state, saved);
          return true;
        }
      } catch (_) { /* 忽略 */ }
      return false;
    },

    /** 转义 HTML 特殊字符，防止 XSS */
    esc: (str) => {
      if (typeof str !== 'string') return '';
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    },
  };

  global.State = State;
})(window);
