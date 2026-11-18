// ================= НАСТРОЙКИ =================
// Ссылка на Telegram-бота: все кнопки сайта ведут сюда.
const CONFIG = {
  botUrl: "https://t.me/KT_RoomBot",
};
// =============================================

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* ---------- bot links ---------- */
$$("[data-bot]").forEach(a => (a.href = CONFIG.botUrl));
$("#year").textContent = new Date().getFullYear();

/* ---------- i18n ---------- */
let lang = "ru";
const t = key => (I18N[lang] && I18N[lang][key]) ?? I18N.ru[key] ?? key;

function applyLang(l) {
  lang = I18N[l] ? l : "ru";
  document.documentElement.lang = lang;
  document.title = t("meta.title");
  $$("[data-i18n]").forEach(el => (el.textContent = t(el.dataset.i18n)));
  $$(".lang button").forEach(b => b.classList.toggle("active", b.dataset.lang === lang));
  buildRibbons();
  try { localStorage.setItem("ktr-lang", lang); } catch (e) {}
}
$$(".lang button").forEach(b => b.addEventListener("click", () => applyLang(b.dataset.lang)));

function detectLang() {
  try { const s = localStorage.getItem("ktr-lang"); if (s) return s; } catch (e) {}
  const n = (navigator.language || "ru").slice(0, 2).toLowerCase();
  return n === "uk" ? "uk" : n === "en" ? "en" : "ru";
}

/* ---------- ribbons ---------- */
function buildRibbons() {
  const words = t("ribbon.a");
  const a = [...words, ...words, ...words].map(w => `<span>${w}</span>`).join("");
  const b = Array(12).fill("<span>K Trading Room</span>").join("");
  $('[data-ribbon="a"]').innerHTML = a + a;
  $('[data-ribbon="b"]').innerHTML = b + b;
}

/* ---------- header / menu ---------- */
const header = $("#header");
const onScroll = () => header.classList.toggle("scrolled", scrollY > 20);
addEventListener("scroll", onScroll, { passive: true });
onScroll();
$("#burger").addEventListener("click", () => document.body.classList.toggle("menu-open"));
$$("#nav a").forEach(a => a.addEventListener("click", () => document.body.classList.remove("menu-open")));

/* ---------- cursor glow ---------- */
const glow = $(".cursor-glow");
addEventListener("pointermove", e => { glow.style.left = e.clientX + "px"; glow.style.top = e.clientY + "px"; }, { passive: true });

/* ---------- hero decorations parallax ---------- */
const decos = $$(".deco[data-depth]");
if (!reduceMotion && matchMedia("(hover: hover)").matches) {
  addEventListener("pointermove", e => {
    const dx = e.clientX / innerWidth - 0.5, dy = e.clientY / innerHeight - 0.5;
    decos.forEach(d => { const k = +d.dataset.depth; d.style.transform = `translate(${-dx * k}px, ${-dy * k}px)`; });
  }, { passive: true });
}
addEventListener("scroll", () => {
  if (scrollY > innerHeight * 1.2) return;
  decos.forEach(d => (d.style.translate = `0 ${scrollY * (+d.dataset.depth / 100)}px`));
}, { passive: true });

/* ---------- reveal on scroll ---------- */
const io = new IntersectionObserver(entries => {
  entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
}, { threshold: 0.12 });
$$(".reveal").forEach(el => io.observe(el));

/* ---------- card tilt + spotlight ---------- */
$$(".card").forEach(card => {
  card.addEventListener("pointermove", e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    card.style.transform = `perspective(900px) rotateX(${(0.5 - y) * 8}deg) rotateY(${(x - 0.5) * 10}deg) translateY(-4px)`;
    card.style.setProperty("--mx", x * 100 + "%");
    card.style.setProperty("--my", y * 100 + "%");
  });
  card.addEventListener("pointerleave", () => (card.style.transform = ""));
});

/* ---------- modal ---------- */
const modal = $("#modal");
function openModal(key) {
  const m = t("m." + key);
  $("#modalTitle").textContent = m.t;
  $("#modalText").textContent = m.d;
  $("#modalList").innerHTML = "";
  m.l.forEach(item => { const li = document.createElement("li"); li.textContent = item; $("#modalList").appendChild(li); });
  modal.classList.add("open");
}
const closeModal = () => modal.classList.remove("open");
$$("[data-modal]").forEach(c => c.addEventListener("click", () => openModal(c.dataset.modal)));
$("#modalClose").addEventListener("click", closeModal);
modal.addEventListener("click", e => { if (e.target === modal) closeModal(); });
addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });

/* ---------- canvas helper ---------- */
function fitCanvas(c) {
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const w = c.clientWidth, h = c.clientHeight;
  if (c.width !== Math.round(w * dpr) || c.height !== Math.round(h * dpr)) {
    c.width = Math.round(w * dpr); c.height = Math.round(h * dpr);
  }
  const ctx = c.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, w, h };
}
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
function pill(ctx, text, x, y, bg, fg, align = "center") {
  ctx.font = "800 12px Manrope, sans-serif";
  const w = ctx.measureText(text).width + 20, h = 26;
  let px = align === "center" ? x - w / 2 : align === "right" ? x - w : x;
  ctx.save(); ctx.shadowColor = bg; ctx.shadowBlur = 18; ctx.fillStyle = bg;
  roundRect(ctx, px, y - h / 2, w, h, 8); ctx.fill(); ctx.restore();
  ctx.fillStyle = fg; ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillText(text, px + 10, y + 1);
}
const GREEN = "#22f08a", RED = "#ff4d6a", BLUE = "#3b8bff";

/* ================= HERO LIVE CHART ================= */
(function heroChart() {
  const c = $("#heroChart");
  const elPrice = $("#tPrice"), elSig = $("#tSignal"), elRes = $("#tResult");
  const STEP = 0.00011, CANDLE_MS = 650;
  let price = 1.0842, candles = [], idx = 0, bias = 0, biasLeft = 0;
  let signals = [], sinceSignal = 0, lastT = performance.now(), acc = 0, tickAcc = 0;

  const newCandle = () => ({ i: idx++, o: price, h: price, l: price, c: price });
  // pre-fill history
  for (let k = 0; k < 60; k++) {
    const cd = newCandle();
    for (let s = 0; s < 11; s++) tick(cd, true);
    candles.push(cd);
  }
  let cur = newCandle(); candles.push(cur);

  function tick(cd, silent) {
    const drift = biasLeft > 0 ? bias * STEP * 0.3 : 0;
    price += (Math.random() - 0.5) * STEP * 1.6 + drift;
    cd.c = price; cd.h = Math.max(cd.h, price); cd.l = Math.min(cd.l, price);
  }

  function closeCandle() {
    if (biasLeft > 0) biasLeft--;
    sinceSignal++;
    // resolve signals
    signals.forEach(s => {
      if (!s.done && cur.i >= s.exp) {
        s.done = true;
        s.win = s.dir > 0 ? cur.c > s.entry : cur.c < s.entry;
        elRes.textContent = s.win ? "WIN ✓" : "LOSS";
        elRes.className = s.win ? "up" : "";
        elRes.style.color = s.win ? "" : RED;
      }
    });
    // new signal
    if (sinceSignal > 7 && !signals.some(s => !s.done)) {
      const dir = Math.random() > 0.5 ? 1 : -1;
      const willWin = Math.random() < 0.78;
      bias = willWin ? dir : -dir; biasLeft = 4;
      signals.push({ i: cur.i, dir, entry: cur.c, exp: cur.i + 4, done: false });
      sinceSignal = 0;
      elSig.textContent = dir > 0 ? "CALL ↑" : "PUT ↓";
      elSig.style.color = dir > 0 ? GREEN : RED;
      elRes.textContent = "…"; elRes.style.color = ""; elRes.className = "";
    }
    cur = newCandle(); candles.push(cur);
    if (candles.length > 200) candles.shift();
    signals = signals.filter(s => s.i > candles[0].i);
  }

  function draw() {
    const { ctx, w, h } = fitCanvas(c);
    ctx.clearRect(0, 0, w, h);
    const right = 74, top = 30, bottom = 24;
    const cw = w < 500 ? 11 : 14;
    const n = Math.floor((w - right) / cw);
    const vis = candles.slice(-n);
    let lo = Infinity, hi = -Infinity;
    vis.forEach(d => { lo = Math.min(lo, d.l); hi = Math.max(hi, d.h); });
    signals.forEach(s => { lo = Math.min(lo, s.entry); hi = Math.max(hi, s.entry); });
    const pad = (hi - lo) * 0.15 + STEP; lo -= pad; hi += pad;
    const Y = v => top + (1 - (v - lo) / (hi - lo)) * (h - top - bottom);
    const first = vis[0].i;
    const X = i => (i - first) * cw + cw / 2;

    // grid
    ctx.strokeStyle = "rgba(80,255,170,.06)"; ctx.lineWidth = 1;
    for (let g = 0; g <= 5; g++) { const y = top + g * (h - top - bottom) / 5; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
    ctx.fillStyle = "rgba(147,168,158,.6)"; ctx.font = "500 10px Manrope"; ctx.textAlign = "left";
    for (let g = 0; g <= 5; g++) { const v = hi - g * (hi - lo) / 5; ctx.fillText(v.toFixed(5), w - right + 10, top + g * (h - top - bottom) / 5 - 4); }

    // area under closes
    const grad = ctx.createLinearGradient(0, top, 0, h);
    grad.addColorStop(0, "rgba(34,240,138,.14)"); grad.addColorStop(1, "rgba(34,240,138,0)");
    ctx.beginPath(); vis.forEach((d, k) => { const x = X(d.i), y = Y(d.c); k ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
    ctx.lineTo(X(vis[vis.length - 1].i), h); ctx.lineTo(X(first), h); ctx.closePath(); ctx.fillStyle = grad; ctx.fill();

    // candles
    vis.forEach(d => {
      const up = d.c >= d.o, col = up ? GREEN : RED, x = X(d.i);
      ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(x, Y(d.h)); ctx.lineTo(x, Y(d.l)); ctx.stroke();
      const y1 = Y(Math.max(d.o, d.c)), y2 = Y(Math.min(d.o, d.c));
      ctx.save(); if (d === cur) { ctx.shadowColor = col; ctx.shadowBlur = 14; }
      ctx.fillRect(x - cw * 0.32, y1, cw * 0.64, Math.max(1.5, y2 - y1)); ctx.restore();
    });

    // signals
    signals.forEach(s => {
      const x = X(s.i), y = Y(s.entry), xe = X(Math.min(s.exp, cur.i));
      const col = s.dir > 0 ? GREEN : RED;
      ctx.setLineDash([4, 4]); ctx.strokeStyle = col; ctx.globalAlpha = .7;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(Math.max(xe, x + 30), y); ctx.stroke();
      ctx.setLineDash([]); ctx.globalAlpha = 1;
      // arrow
      ctx.save(); ctx.shadowColor = col; ctx.shadowBlur = 16; ctx.fillStyle = col;
      const ay = s.dir > 0 ? y + 22 : y - 22;
      ctx.beginPath();
      if (s.dir > 0) { ctx.moveTo(x, ay - 10); ctx.lineTo(x - 8, ay + 4); ctx.lineTo(x + 8, ay + 4); }
      else { ctx.moveTo(x, ay + 10); ctx.lineTo(x - 8, ay - 4); ctx.lineTo(x + 8, ay - 4); }
      ctx.fill(); ctx.restore();
      if (!s.done) {
        const pr = (performance.now() % 1200) / 1200;
        ctx.strokeStyle = col; ctx.globalAlpha = 1 - pr; ctx.beginPath(); ctx.arc(x, y, 4 + pr * 16, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1;
        pill(ctx, s.dir > 0 ? "CALL ↑" : "PUT ↓", x, s.dir > 0 ? ay + 24 : ay - 24, col, "#02140a");
      } else {
        const ex = X(s.exp);
        pill(ctx, s.win ? "WIN ✓" : "LOSS", ex, Y(s.entry) + (s.dir > 0 ? -30 : 30), s.win ? GREEN : RED, "#02140a");
      }
    });

    // current price line
    const py = Y(cur.c);
    ctx.setLineDash([2, 4]); ctx.strokeStyle = "rgba(238,247,242,.35)";
    ctx.beginPath(); ctx.moveTo(0, py); ctx.lineTo(w - right, py); ctx.stroke(); ctx.setLineDash([]);
    ctx.save(); ctx.shadowColor = GREEN; ctx.shadowBlur = 14; ctx.fillStyle = GREEN;
    roundRect(ctx, w - right + 4, py - 11, right - 8, 22, 6); ctx.fill(); ctx.restore();
    ctx.fillStyle = "#02140a"; ctx.font = "800 11px Manrope"; ctx.textBaseline = "middle"; ctx.fillText(cur.c.toFixed(5), w - right + 10, py + 1);
    ctx.textBaseline = "alphabetic";
    elPrice.textContent = cur.c.toFixed(5);
  }

  let visible = true;
  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(c);
  function loop(now) {
    const dt = Math.min(now - lastT, 100); lastT = now;
    if (visible) {
      if (!reduceMotion) {
        acc += dt; tickAcc += dt;
        if (tickAcc > 60) { tickAcc = 0; tick(cur); }
        if (acc > CANDLE_MS) { acc = 0; closeCandle(); }
      }
      draw();
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();

/* ================= DEMO (step-by-step trade) ================= */
(function demoChart() {
  const c = $("#demoChart"), steps = $$(".step"), STEP_MS = 3000, N = 60, SPLIT = 30;
  // deterministic price path: falls to support, bounces up
  let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const path = [];
  for (let i = 0; i < N; i++) {
    let v;
    if (i < 22) v = 100 - i * 0.75 + (rnd() - 0.5) * 3.2;
    else if (i <= SPLIT) v = 84.2 + Math.abs(Math.sin(i * 1.3)) * 2.4 + (rnd() - 0.5) * 1.2;
    else v = 84.6 + (i - SPLIT) * 0.62 + (rnd() - 0.5) * 2.6;
    path.push(v);
  }
  path[SPLIT] = 85.2;
  const SUPPORT = 83.6, ENTRY = path[SPLIT];
  let t = 0, playing = false, last = performance.now(), hold = 0;
  const total = STEP_MS * 4;

  steps.forEach((s, k) => s.addEventListener("click", () => { t = k * STEP_MS; hold = 0; playing = true; }));
  $("#replay").addEventListener("click", () => { t = 0; hold = 0; playing = true; });
  new IntersectionObserver(([e]) => { playing = e.isIntersecting; }, { threshold: 0.35 }).observe(c);

  function draw() {
    const { ctx, w, h } = fitCanvas(c);
    ctx.clearRect(0, 0, w, h);
    const padL = 24, padR = 24, top = 80, bottom = 40;
    const lo = 72, hi = 104;
    const X = i => padL + (i / (N - 1)) * (w - padL - padR);
    const Y = v => top + (1 - (v - lo) / (hi - lo)) * (h - top - bottom);
    const step = Math.min(3, Math.floor(t / STEP_MS));
    const p = Math.min(1, (t - step * STEP_MS) / STEP_MS);
    const ease = x => 1 - Math.pow(1 - x, 3);

    // grid
    ctx.strokeStyle = "rgba(80,255,170,.06)";
    for (let g = 0; g <= 6; g++) { const y = top + g * (h - top - bottom) / 6; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
    for (let g = 0; g <= 10; g++) { const x = g * w / 10; ctx.beginPath(); ctx.moveTo(x, top - 20); ctx.lineTo(x, h - bottom + 10); ctx.stroke(); }

    // how far the line is drawn
    let upto = step === 0 ? ease(p) * SPLIT : step < 3 ? SPLIT : SPLIT + ease(p) * (N - 1 - SPLIT);

    // support zone
    const zA = step === 0 ? Math.max(0, (p - 0.45) / 0.55) : 1;
    if (zA > 0) {
      ctx.globalAlpha = zA;
      ctx.fillStyle = "rgba(59,139,255,.10)"; ctx.fillRect(0, Y(SUPPORT + 1.2), w, Y(SUPPORT - 1.2) - Y(SUPPORT + 1.2));
      ctx.setLineDash([6, 6]); ctx.strokeStyle = BLUE; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(0, Y(SUPPORT)); ctx.lineTo(w * zA, Y(SUPPORT)); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = BLUE; ctx.font = "800 12px Manrope"; ctx.textAlign = "left"; ctx.fillText(t_("cv.level"), padL, Y(SUPPORT) + 26);
      ctx.globalAlpha = 1;
    }

    // entry line + profit area
    if (step >= 2) {
      const ex = X(SPLIT);
      ctx.setLineDash([4, 4]); ctx.strokeStyle = "rgba(238,247,242,.6)"; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(ex, Y(ENTRY)); ctx.lineTo(w - padR, Y(ENTRY)); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = "rgba(238,247,242,.8)"; ctx.font = "800 11px Manrope"; ctx.textAlign = "right";
      ctx.fillText(t_("cv.entry"), w - padR, Y(ENTRY) + 16);
      // expiry vertical
      const xx = X(N - 1);
      ctx.strokeStyle = "rgba(255,255,255,.18)"; ctx.beginPath(); ctx.moveTo(xx, top - 10); ctx.lineTo(xx, h - bottom); ctx.stroke();
      if (step === 3 && upto > SPLIT) {
        ctx.beginPath(); ctx.moveTo(X(SPLIT), Y(ENTRY));
        for (let i = SPLIT; i <= upto; i++) ctx.lineTo(X(i), Y(Math.max(ENTRY, path[i])));
        const fx = X(upto); ctx.lineTo(fx, Y(ENTRY)); ctx.closePath();
        const g = ctx.createLinearGradient(0, Y(ENTRY) - 120, 0, Y(ENTRY));
        g.addColorStop(0, "rgba(34,240,138,.35)"); g.addColorStop(1, "rgba(34,240,138,.02)");
        ctx.fillStyle = g; ctx.fill();
      }
    }

    // price line
    ctx.save(); ctx.shadowColor = GREEN; ctx.shadowBlur = 14; ctx.strokeStyle = GREEN; ctx.lineWidth = 2.6; ctx.lineJoin = "round";
    ctx.beginPath();
    const whole = Math.floor(upto);
    for (let i = 0; i <= whole; i++) { const x = X(i), y = Y(path[i]); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    let hx = X(whole), hy = Y(path[whole]);
    if (upto > whole && whole < N - 1) {
      const f = upto - whole; hx = X(whole + f); hy = Y(path[whole] + (path[whole + 1] - path[whole]) * f); ctx.lineTo(hx, hy);
    }
    ctx.stroke(); ctx.restore();
    // head dot
    ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(hx, hy, 4, 0, Math.PI * 2); ctx.fill();
    const pr = (performance.now() % 1400) / 1400;
    ctx.strokeStyle = GREEN; ctx.globalAlpha = 1 - pr; ctx.beginPath(); ctx.arc(hx, hy, 5 + pr * 14, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1;

    // signal marker
    if (step >= 1) {
      const sx = X(SPLIT), sy = Y(ENTRY);
      const a = step === 1 ? ease(Math.min(1, p * 2)) : 1;
      ctx.globalAlpha = a;
      ctx.save(); ctx.shadowColor = GREEN; ctx.shadowBlur = 20; ctx.fillStyle = GREEN;
      ctx.beginPath(); ctx.moveTo(sx, sy + 14); ctx.lineTo(sx - 10, sy + 32); ctx.lineTo(sx + 10, sy + 32); ctx.fill(); ctx.restore();
      const label = t_("cv.signal");
      pill(ctx, label, Math.min(Math.max(sx, 110), w - 110), sy + 56 + (1 - a) * 20, GREEN, "#02140a");
      ctx.globalAlpha = 1;
    }

    // countdown
    if (step >= 2) {
      const left = step === 2 ? 180 : Math.max(0, Math.round(180 * (1 - p)));
      const mm = String(Math.floor(left / 60)).padStart(2, "0"), ss = String(left % 60).padStart(2, "0");
      ctx.font = "800 26px Unbounded, Manrope, sans-serif"; ctx.textAlign = "right"; ctx.fillStyle = "#eef7f2";
      ctx.fillText(`${mm}:${ss}`, w - padR, top + 4);
      ctx.font = "600 11px Manrope"; ctx.fillStyle = "#93a89e"; ctx.fillText(t_("cv.left"), w - padR, top + 22);
    }

    // result
    if (step === 3 && p > 0.92) {
      const k = (p - 0.92) / 0.08;
      ctx.globalAlpha = k;
      ctx.save(); ctx.font = "800 15px Manrope";
      pill(ctx, t_("cv.win"), X(N - 1) - 14, Y(path[N - 1]) + 40, GREEN, "#02140a", "right");
      ctx.restore(); ctx.globalAlpha = 1;
    }

    // step UI
    steps.forEach((s, k) => {
      s.classList.toggle("active", k === step);
      s.classList.toggle("done", k < step);
      $(".step__bar", s).style.width = k === step ? p * 100 + "%" : k < step ? "100%" : "0";
    });
  }
  const t_ = key => (I18N[lang] && I18N[lang][key]) ?? I18N.ru[key] ?? key;

  function loop(now) {
    const dt = Math.min(now - last, 100); last = now;
    if (playing) {
      if (reduceMotion) t = total - 1;
      else if (t < total - 1) t = Math.min(total - 1, t + dt);
      else { hold += dt; if (hold > 3500) { t = 0; hold = 0; } }
    }
    draw();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();

applyLang(detectLang());
