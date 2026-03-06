/**
 * audio.js — 可选的音频辅助（双侧音调 + 环境音）
 * 使用 Web Audio API；若浏览器不支持则静默降级
 */
(function (global) {
  'use strict';

  let ctx = null;
  const AMBIENT_VOLUME   = 0.08;
  const AMBIENT_NOISE_AMP = 0.15;  // amplitude of white noise samples

  function getCtx() {
    if (!ctx) {
      try {
        ctx = new (window.AudioContext || window.webkitAudioContext)();
      } catch (_) { return null; }
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  /**
   * 播放一声短促的双侧提示音
   * @param {'left'|'right'} side — 左耳还是右耳
   * @param {number} freq — 频率 Hz（默认 440）
   */
  function playTone(side, freq) {
    const c = getCtx();
    if (!c) return;

    const osc     = c.createOscillator();
    const gain    = c.createGain();
    const panner  = c.createStereoPanner();

    osc.type = 'sine';
    osc.frequency.value = freq || 440;
    gain.gain.setValueAtTime(0, c.currentTime);
    gain.gain.linearRampToValueAtTime(0.25, c.currentTime + 0.02);
    gain.gain.linearRampToValueAtTime(0,    c.currentTime + 0.18);
    panner.pan.value = side === 'left' ? -1 : 1;

    osc.connect(gain);
    gain.connect(panner);
    panner.connect(c.destination);

    osc.start(c.currentTime);
    osc.stop(c.currentTime + 0.2);
  }

  /**
   * 开启/关闭环境音（轻柔白噪音）
   */
  let ambientNode = null;
  let ambientGain = null;

  function startAmbient() {
    const c = getCtx();
    if (!c || ambientNode) return;
    const bufSize = c.sampleRate * 2;
    const buf = c.createBuffer(1, bufSize, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * AMBIENT_NOISE_AMP;

    const filter = c.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 600;

    ambientNode = c.createBufferSource();
    ambientNode.buffer = buf;
    ambientNode.loop = true;

    ambientGain = c.createGain();
    ambientGain.gain.value = AMBIENT_VOLUME;

    ambientNode.connect(filter);
    filter.connect(ambientGain);
    ambientGain.connect(c.destination);
    ambientNode.start();
  }

  function stopAmbient() {
    if (ambientNode) { ambientNode.stop(); ambientNode = null; }
  }

  global.Audio2 = { playTone, startAmbient, stopAmbient };
})(window);
