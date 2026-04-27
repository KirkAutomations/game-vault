// Thus Spoke Zarathustra - shared SDK
// Journal, audio, typewriter, and small UI helpers.
(() => {
  const JOURNAL_KEY = 'zarathustra.journal';

  function getJournal() {
    try { return JSON.parse(localStorage.getItem(JOURNAL_KEY) || '[]'); }
    catch (e) { return []; }
  }
  function saveJournal(j) {
    try { localStorage.setItem(JOURNAL_KEY, JSON.stringify(j)); } catch (e) {}
  }
  function addQuote(id, text, source) {
    const j = getJournal();
    if (j.find(q => q.id === id)) return false;
    j.push({ id, text, source: source || '', unlockedAt: Date.now() });
    saveJournal(j);
    showToast(text, 'quote collected');
    return true;
  }
  function clearJournal() { localStorage.removeItem(JOURNAL_KEY); }

  // Toast
  function showToast(text, label) {
    const t = document.createElement('div');
    t.className = 'zara-toast';
    const labelHtml = label ? `<div class="zt-label">${label}</div>` : '';
    t.innerHTML = `${labelHtml}<div class="zt-text">&ldquo;${text}&rdquo;</div>`;
    document.body.appendChild(t);
    requestAnimationFrame(() => t.classList.add('visible'));
    setTimeout(() => {
      t.classList.remove('visible');
      setTimeout(() => t.remove(), 1000);
    }, 4800);
  }

  // Audio
  let ctx = null;
  let wind = null, murmur = null;
  function audio() {
    if (!ctx) {
      try { ctx = new (window.AudioContext || window.webkitAudioContext)(); }
      catch (e) { return null; }
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function makeNoise(seconds) {
    const c = audio(); if (!c) return null;
    const buf = c.createBuffer(1, Math.max(1, Math.floor(c.sampleRate * seconds)), c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    return buf;
  }

  function playWind(level) {
    const c = audio(); if (!c) return;
    if (wind) return wind;
    level = level == null ? 0.1 : level;
    const buf = makeNoise(4);
    const src = c.createBufferSource();
    src.buffer = buf; src.loop = true;
    const filter = c.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 350;
    const gain = c.createGain();
    gain.gain.value = 0;
    gain.gain.linearRampToValueAtTime(level, c.currentTime + 1.8);
    const lfo = c.createOscillator();
    lfo.frequency.value = 0.08;
    const lfoGain = c.createGain();
    lfoGain.gain.value = 160;
    lfo.connect(lfoGain).connect(filter.frequency);
    lfo.start();
    src.connect(filter).connect(gain).connect(c.destination);
    src.start();
    wind = { src, gain, filter, lfo };
    return wind;
  }
  function stopWind() {
    if (!wind) return;
    const c = audio(); const w = wind; wind = null;
    w.gain.gain.cancelScheduledValues(c.currentTime);
    w.gain.gain.linearRampToValueAtTime(0, c.currentTime + 1);
    setTimeout(() => { try { w.src.stop(); w.lfo.stop(); } catch (e) {} }, 1200);
  }

  function playMurmur(level) {
    const c = audio(); if (!c) return;
    if (murmur) return murmur;
    level = level == null ? 0.08 : level;
    const buf = makeNoise(3);
    const src = c.createBufferSource();
    src.buffer = buf; src.loop = true;
    const filter = c.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 260;
    filter.Q.value = 0.7;
    const gain = c.createGain();
    gain.gain.value = 0;
    gain.gain.linearRampToValueAtTime(level, c.currentTime + 1);
    src.connect(filter).connect(gain).connect(c.destination);
    src.start();
    murmur = { src, gain, filter };
    return murmur;
  }
  function stopMurmur() {
    if (!murmur) return;
    const c = audio(); const m = murmur; murmur = null;
    m.gain.gain.cancelScheduledValues(c.currentTime);
    m.gain.gain.linearRampToValueAtTime(0, c.currentTime + 1);
    setTimeout(() => { try { m.src.stop(); } catch (e) {} }, 1200);
  }
  function setMurmurIntensity(level) {
    if (!murmur) return;
    const c = audio();
    murmur.gain.gain.cancelScheduledValues(c.currentTime);
    murmur.gain.gain.linearRampToValueAtTime(level, c.currentTime + 0.7);
  }

  function footstep(vol) {
    const c = audio(); if (!c) return;
    vol = vol == null ? 0.05 : vol;
    const now = c.currentTime;
    const osc = c.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = 60 + Math.random() * 30;
    const gain = c.createGain();
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
    osc.connect(gain).connect(c.destination);
    osc.start(now); osc.stop(now + 0.18);
  }
  function laugh(vol) {
    const c = audio(); if (!c) return;
    vol = vol == null ? 0.12 : vol;
    const now = c.currentTime;
    const buf = c.createBuffer(1, Math.floor(c.sampleRate * 0.55), c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const t = i / data.length;
      const env = Math.sin(t * Math.PI) * (0.5 + Math.sin(i * 0.03) * 0.5);
      data[i] = (Math.random() * 2 - 1) * env;
    }
    const src = c.createBufferSource();
    src.buffer = buf;
    const filter = c.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 520 + Math.random() * 280;
    const gain = c.createGain();
    gain.gain.value = vol;
    src.connect(filter).connect(gain).connect(c.destination);
    src.start(now);
  }
  function chime(vol) {
    const c = audio(); if (!c) return;
    vol = vol == null ? 0.07 : vol;
    const now = c.currentTime;
    [1, 1.5, 2.5, 3.75].forEach((m, i) => {
      const osc = c.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = 392 * m;
      const g = c.createGain();
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(vol / (i + 1), now + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 2);
      osc.connect(g).connect(c.destination);
      osc.start(now); osc.stop(now + 2);
    });
  }
  function thud(vol) {
    const c = audio(); if (!c) return;
    vol = vol == null ? 0.5 : vol;
    const now = c.currentTime;
    const osc = c.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(85, now);
    osc.frequency.exponentialRampToValueAtTime(28, now + 0.32);
    const g = c.createGain();
    g.gain.setValueAtTime(vol, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc.connect(g).connect(c.destination);
    osc.start(now); osc.stop(now + 0.5);

    const nbuf = makeNoise(0.15);
    const nsrc = c.createBufferSource();
    nsrc.buffer = nbuf;
    const nfilt = c.createBiquadFilter();
    nfilt.type = 'lowpass';
    nfilt.frequency.value = 220;
    const ng = c.createGain();
    ng.gain.setValueAtTime(vol * 0.7, now);
    ng.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    nsrc.connect(nfilt).connect(ng).connect(c.destination);
    nsrc.start(now);
  }
  function scream(vol) {
    const c = audio(); if (!c) return;
    vol = vol == null ? 0.22 : vol;
    const now = c.currentTime;
    const osc = c.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(820, now);
    osc.frequency.exponentialRampToValueAtTime(88, now + 1.1);
    const osc2 = c.createOscillator();
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(1640, now);
    osc2.frequency.exponentialRampToValueAtTime(176, now + 1.1);
    const filter = c.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 2000;
    const g = c.createGain();
    g.gain.setValueAtTime(0.001, now);
    g.gain.linearRampToValueAtTime(vol, now + 0.08);
    g.gain.setValueAtTime(vol, now + 0.9);
    g.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
    osc.connect(filter); osc2.connect(filter);
    filter.connect(g).connect(c.destination);
    osc.start(now); osc2.start(now);
    osc.stop(now + 1.2); osc2.stop(now + 1.2);
  }
  function gasp(vol) {
    const c = audio(); if (!c) return;
    vol = vol == null ? 0.1 : vol;
    const now = c.currentTime;
    const buf = makeNoise(0.4);
    const src = c.createBufferSource();
    src.buffer = buf;
    const filter = c.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(400, now);
    filter.frequency.exponentialRampToValueAtTime(1200, now + 0.3);
    filter.Q.value = 2;
    const g = c.createGain();
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(vol, now + 0.1);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    src.connect(filter).connect(g).connect(c.destination);
    src.start(now);
  }

  // Typewriter
  function typewrite(el, text, opts) {
    opts = opts || {};
    const cps = opts.cps || 42;
    const onChar = opts.onChar;
    let i = 0;
    let stopped = false;
    el.textContent = '';
    const startT = performance.now();
    function tick(now) {
      if (stopped) return;
      const target = Math.min(text.length, Math.floor((now - startT) * cps / 1000));
      while (i < target) {
        el.textContent += text[i];
        if (onChar) onChar(text[i], i, text);
        i++;
      }
      if (i < text.length) requestAnimationFrame(tick);
      else if (opts.onDone) opts.onDone();
    }
    requestAnimationFrame(tick);
    return {
      complete() {
        if (stopped) return;
        stopped = true;
        while (i < text.length) {
          el.textContent += text[i];
          if (onChar) onChar(text[i], i, text);
          i++;
        }
        if (opts.onDone) opts.onDone();
      },
      isDone() { return i >= text.length; },
      cancel() { stopped = true; },
    };
  }

  function injectStyles() {
    if (document.getElementById('zara-style')) return;
    const s = document.createElement('style');
    s.id = 'zara-style';
    s.textContent = `
      .zara-toast {
        position: fixed;
        top: 4vh;
        left: 50%;
        transform: translateX(-50%) translateY(-12px);
        max-width: 520px;
        width: min(86vw, 520px);
        padding: 0.9rem 1.4rem;
        background: rgba(11,10,8,0.94);
        border: 1px solid #d4a017;
        color: #eae4d2;
        font-family: 'Cormorant Garamond', Georgia, serif;
        opacity: 0;
        transition: opacity 0.6s ease, transform 0.6s ease;
        pointer-events: none;
        z-index: 200;
        text-align: center;
      }
      .zara-toast.visible {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }
      .zara-toast .zt-label {
        font-size: 0.68rem;
        letter-spacing: 0.25em;
        text-transform: uppercase;
        color: #d4a017;
        margin-bottom: 0.35rem;
      }
      .zara-toast .zt-text {
        font-style: italic;
        font-size: 0.98rem;
        line-height: 1.5;
      }
    `;
    document.head.appendChild(s);
  }
  if (document.readyState !== 'loading') injectStyles();
  else document.addEventListener('DOMContentLoaded', injectStyles);

  window.Zara = {
    getJournal, addQuote, clearJournal,
    showToast,
    audio, playWind, stopWind, playMurmur, stopMurmur, setMurmurIntensity,
    footstep, laugh, chime, thud, scream, gasp,
    typewrite,
  };
})();
