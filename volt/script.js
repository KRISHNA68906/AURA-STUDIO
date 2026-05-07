// ---------- Loader ----------
const loader = document.getElementById('loader');
const pct = document.getElementById('loaderPct');
let p = 0;
const li = setInterval(() => {
  p += Math.random() * 12;
  if (p >= 100) { p = 100; clearInterval(li); setTimeout(() => loader.classList.add('done'), 300); }
  pct.textContent = Math.floor(p);
  loader.querySelector('.loader-bar span').style.width = p + '%';
}, 80);

// ---------- Scroll-triggered car rotation + parallax ----------
const carWrap = document.getElementById('carWrap');
const carStage = document.getElementById('carStage');
const hero = document.getElementById('hero');

window.addEventListener('scroll', () => {
  const y = window.scrollY;
  const heroH = hero.offsetHeight;
  const t = Math.min(y / heroH, 1.4);
  // rotateY for 3D-ish spin, slight tilt + scale + translate
  const rotY = t * 120;        // up to 120deg as you scroll
  const rotX = 6 - t * 4;
  const scale = 1 - t * 0.15;
  const ty = t * 60;
  carWrap.style.transform = `translateY(${ty}px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${scale})`;
  // Hero content parallax
  document.querySelector('.hero-content').style.transform = `translateY(${y * 0.3}px)`;
  document.querySelector('.hero-content').style.opacity = Math.max(0, 1 - y / (heroH * 0.7));
});

// ---------- Reveal on scroll ----------
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      if (e.target.classList.contains('perf')) e.target.classList.add('in-view');
      if (e.target.classList.contains('stat')) animateStat(e.target);
    }
  });
}, { threshold: 0.2 });

document.querySelectorAll('.reveal, .perf').forEach(el => io.observe(el));

// ---------- Counter animation ----------
function animateStat(stat) {
  const el = stat.querySelector('.stat-num');
  if (!el || el.dataset.done) return;
  el.dataset.done = '1';
  const target = parseFloat(el.dataset.target);
  const suffix = el.dataset.suffix || '';
  const isFloat = target % 1 !== 0;
  const dur = 1600; const start = performance.now();
  function step(now) {
    const k = Math.min((now - start) / dur, 1);
    const eased = 1 - Math.pow(1 - k, 3);
    const v = target * eased;
    el.textContent = (isFloat ? v.toFixed(1) : Math.floor(v)) + suffix;
    if (k < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// ---------- Speed transition flash on nav clicks ----------
const flash = document.createElement('div');
flash.className = 'speed-flash';
document.body.appendChild(flash);
document.querySelectorAll('.nav-links a').forEach(a => {
  a.addEventListener('click', () => {
    flash.classList.remove('go'); void flash.offsetWidth; flash.classList.add('go');
  });
});

// ---------- Sound design (synthetic EV hum via WebAudio) ----------
const soundBtn = document.getElementById('soundBtn');
let audioCtx, osc, gain, filter, on = false;
soundBtn.addEventListener('click', () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    osc = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    gain = audioCtx.createGain();
    filter = audioCtx.createBiquadFilter();
    osc.type = 'sawtooth'; osc.frequency.value = 60;
    osc2.type = 'sine'; osc2.frequency.value = 120;
    filter.type = 'lowpass'; filter.frequency.value = 400;
    gain.gain.value = 0;
    osc.connect(filter); osc2.connect(filter); filter.connect(gain); gain.connect(audioCtx.destination);
    osc.start(); osc2.start();
  }
  on = !on;
  soundBtn.classList.toggle('active', on);
  soundBtn.querySelector('.sound-on').textContent = on ? '◉ SOUND ON' : '◉ SOUND';
  gain.gain.linearRampToValueAtTime(on ? 0.05 : 0, audioCtx.currentTime + 0.4);
});

// Modulate hum with scroll velocity for "speed" feel
let lastY = 0, lastT = performance.now();
window.addEventListener('scroll', () => {
  if (!on || !filter) return;
  const now = performance.now();
  const dy = Math.abs(window.scrollY - lastY);
  const dt = now - lastT || 1;
  const v = Math.min(dy / dt * 50, 1500);
  filter.frequency.linearRampToValueAtTime(300 + v, audioCtx.currentTime + 0.1);
  lastY = window.scrollY; lastT = now;
});
