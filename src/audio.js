/*
 * Super Haaland Quest — procedural sound effects and music.
 * Everything is synthesized with the WebAudio API so the game ships with
 * zero binary audio assets.
 */
(function () {
  'use strict';

  class SFX {
    constructor() {
      this.ctx = null;
      this.muted = false;
      this.musicTimer = null;
      this.musicStep = 0;
    }

    ensure() {
      if (!this.ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (AC) this.ctx = new AC();
      }
      if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
      return this.ctx;
    }

    toggleMute() {
      this.muted = !this.muted;
      return this.muted;
    }

    /** One enveloped oscillator note, optionally sliding in pitch. */
    tone(freq, dur, type, vol, slideTo) {
      if (this.muted) return;
      const ctx = this.ensure();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type || 'square';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      if (slideTo) {
        osc.frequency.exponentialRampToValueAtTime(
          Math.max(30, slideTo), ctx.currentTime + dur);
      }
      gain.gain.setValueAtTime(vol || 0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + dur + 0.02);
    }

    noise(dur, vol) {
      if (this.muted) return;
      const ctx = this.ensure();
      if (!ctx) return;
      const len = Math.floor(ctx.sampleRate * dur);
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / len);
      }
      const src = ctx.createBufferSource();
      const gain = ctx.createGain();
      src.buffer = buf;
      gain.gain.value = vol || 0.08;
      src.connect(gain).connect(ctx.destination);
      src.start();
    }

    jump() { this.tone(240, 0.22, 'square', 0.05, 620); }
    dash() { this.tone(500, 0.14, 'sawtooth', 0.05, 180); }
    stomp() { this.tone(320, 0.1, 'square', 0.07, 110); this.noise(0.08, 0.05); }
    coin() { this.tone(920, 0.07, 'square', 0.05); this.tone(1240, 0.18, 'square', 0.05); }
    powerup() {
      [340, 420, 520, 640, 780].forEach((f, i) => {
        setTimeout(() => this.tone(f, 0.12, 'square', 0.05), i * 55);
      });
    }
    hurt() { this.tone(300, 0.3, 'sawtooth', 0.07, 90); }
    die() {
      [520, 420, 320, 220, 130].forEach((f, i) => {
        setTimeout(() => this.tone(f, 0.18, 'triangle', 0.08), i * 110);
      });
    }
    kick() { this.tone(180, 0.1, 'square', 0.07, 420); }
    brick() { this.noise(0.15, 0.1); this.tone(150, 0.1, 'square', 0.06, 80); }
    bump() { this.tone(140, 0.08, 'square', 0.06); }
    whistle() {
      this.tone(2200, 0.09, 'sine', 0.05);
      setTimeout(() => this.tone(2200, 0.16, 'sine', 0.05), 120);
    }
    flash() { this.tone(1600, 0.2, 'sine', 0.04, 2400); }
    stun() { this.tone(700, 0.25, 'sawtooth', 0.05, 950); }
    drum() {
      this.tone(80, 0.5, 'sine', 0.22, 45);
      this.noise(0.2, 0.1);
    }
    bossHit() { this.tone(220, 0.25, 'sawtooth', 0.09, 60); this.noise(0.15, 0.09); }
    fanfare() {
      const notes = [523, 523, 523, 659, 784, 659, 784, 1047];
      notes.forEach((f, i) => {
        setTimeout(() => this.tone(f, 0.22, 'square', 0.06), i * 130);
      });
    }
    zen() {
      [392, 494, 587, 784].forEach((f, i) => {
        setTimeout(() => this.tone(f, 0.6, 'sine', 0.05), i * 220);
      });
    }

    /** Minimal looping chip bassline; melody varies per world. */
    startMusic(world) {
      this.stopMusic();
      const scales = [
        [196, 247, 294, 247, 220, 247, 294, 330],   // fjords — folk-ish
        [220, 220, 262, 294, 220, 220, 330, 294],   // training — driving
        [175, 208, 233, 208, 175, 208, 262, 233],   // city — moody
        [196, 262, 330, 392, 330, 262, 330, 392],   // stadium — anthem
      ];
      const seq = scales[(world - 1) % scales.length];
      const tempo = 200;
      this.musicStep = 0;
      this.musicTimer = setInterval(() => {
        if (this.muted) return;
        const f = seq[this.musicStep % seq.length];
        this.tone(f, 0.16, 'triangle', 0.028);
        if (this.musicStep % 2 === 0) this.tone(f / 2, 0.18, 'sine', 0.03);
        this.musicStep++;
      }, tempo);
    }

    stopMusic() {
      if (this.musicTimer) {
        clearInterval(this.musicTimer);
        this.musicTimer = null;
      }
    }
  }

  window.HQ = window.HQ || {};
  window.HQ.sfx = new SFX();
})();
