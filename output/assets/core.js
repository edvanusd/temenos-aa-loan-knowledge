/* =========================================================
   AA Loan KB — core: util, penyimpanan progres, indeks pencarian,
   router, navigasi, command palette, tema.
   ========================================================= */
(function () {
  'use strict';
  const D = window.AA_DATA;
  const AA = (window.AA = { pages: {}, D });

  /* ---------- Util ---------- */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const strip = (html) => String(html)
    .replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ').trim();
  const fmt = (n, d = 0) => Number(n).toLocaleString('id-ID', { minimumFractionDigits: d, maximumFractionDigits: d });
  const slug = (s) => strip(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const icon = (name, cls = '') => `<svg class="i ${cls}" aria-hidden="true"><use href="#i-${name}"/></svg>`;
  const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hash = (s) => { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return (h >>> 0).toString(36); };
  const shuffle = (a) => { const r = a.slice(); for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };
  // Rupiah: Rp1.234.567 (tanpa desimal)
  const rp = (n) => (n < 0 ? '−' : '') + 'Rp' + fmt(Math.round(Math.abs(n)));
  const num = (s) => +String(s).replace(/[^\d,]/g, '').replace(',', '.') || 0;
  // Input nominal: format ribuan saat mengetik, mis. 500000000 -> 500.000.000
  function bindMoney(root) {
    root.querySelectorAll('input[data-money]').forEach((el) => {
      if (el.dataset.bound) return; el.dataset.bound = '1';
      el.addEventListener('input', () => {
        const fromEnd = el.value.length - (el.selectionStart || 0);
        const digits = el.value.replace(/\D/g, '').replace(/^0+(?=\d)/, '');
        el.value = digits ? fmt(+digits) : '';
        const p = Math.max(0, el.value.length - fromEnd);
        try { el.setSelectionRange(p, p); } catch (e) { /* abaikan */ }
      }, true);
    });
  }
  Object.assign(AA, { $, $$, esc, strip, fmt, slug, icon, reduceMotion, hash, shuffle, rp, num, bindMoney });

  /* ---------- Penyimpanan progres (localStorage) ---------- */
  // Tanpa login: kunci 'aakm.v2'. Saat login: cache per user 'aakm.v2.u.<id>'
  // (sumber kebenaran tetap database; cache membuat tampilan instan).
  const ANON_KEY = 'aakm.v2';
  const defaults = () => ({ done: {}, quiz: { attempts: [], wrong: [] }, ivqKnown: {}, glKnown: {}, visits: [], last: null, pending: [] });
  const Store = {
    key: ANON_KEY,
    data: defaults(),
    defaults,
    load() {
      this.data = defaults();
      try { const raw = localStorage.getItem(this.key); if (raw) this.data = Object.assign(defaults(), JSON.parse(raw)); } catch (e) { /* storage tidak tersedia */ }
    },
    save() { try { localStorage.setItem(this.key, JSON.stringify(this.data)); } catch (e) { /* abaikan */ } },
    use(uid) { this.key = uid ? `${ANON_KEY}.u.${uid}` : ANON_KEY; this.load(); },
    readAnon() { try { return Object.assign(defaults(), JSON.parse(localStorage.getItem(ANON_KEY) || '{}')); } catch (e) { return defaults(); } },
    clearAnon() { try { localStorage.removeItem(ANON_KEY); } catch (e) { /* abaikan */ } },
  };
  Store.load();
  AA.Store = Store;

  // Catat hari kunjungan untuk streak belajar
  (function trackVisit() {
    const today = new Date().toISOString().slice(0, 10);
    const v = Store.data.visits;
    if (v[v.length - 1] !== today) { v.push(today); if (v.length > 120) v.splice(0, v.length - 120); Store.save(); }
  })();
  AA.streak = function () {
    const set = new Set(Store.data.visits);
    let n = 0; const d = new Date();
    while (set.has(d.toISOString().slice(0, 10))) { n++; d.setDate(d.getDate() - 1); }
    return n;
  };

  /* ---------- Struktur kursus ---------- */
  const MOD_KEYS = Object.keys(D.MODS);
  AA.MODS = MOD_KEYS.map((key, i) => {
    const m = D.MODS[key];
    const sections = [];
    let words = 0;
    m.body.forEach((b, bi) => {
      if (b[0] === 'h') sections.push({ bi, title: strip(b[1]) });
      words += strip(JSON.stringify(b[1])).split(' ').length;
    });
    return { key, n: i + 1, title: m.t, part: m.sec === 'Utama' ? 'Kursus utama' : 'Lanjutan', body: m.body, sections, minutes: Math.max(3, Math.round(words / 170)) };
  });
  AA.mod = (key) => AA.MODS.find((m) => m.key === key);
  AA.doneCount = () => AA.MODS.filter((m) => Store.data.done[m.key]).length;
  AA.nextModule = () => AA.MODS.find((m) => !Store.data.done[m.key]) || AA.MODS[AA.MODS.length - 1];

  AA.NAV = {
    deep: [
      { key: 'konsep', title: 'Konsep dasar AA', icon: 'layers', desc: 'Arrangement, dependensi, interest day basis' },
      { key: 'tabel', title: 'Tabel & struktur', icon: 'table', desc: 'Tabel komponen, pola Id, negotiation rules' },
      { key: 'property', title: 'Property class', icon: 'grid', desc: '24 kelas dengan atribut, balance & workshop' },
      { key: 'produk', title: 'Membangun produk', icon: 'build', desc: 'Hierarki produk, design → proof → publish' },
      { key: 'aktivitas', title: 'Aktivitas & simulasi', icon: 'activity', desc: 'Activity, simulation, reverse & replay' },
      { key: 'balance', title: 'Balance & accounting', icon: 'scale', desc: 'Balance type, aliran saldo, rules-based accounting' },
    ],
    practice: [
      { key: 'quiz', title: 'Quiz', icon: 'quiz', desc: `${D.QUIZ.length} soal dari quiz resmi kursus` },
      { key: 'interview', title: 'Bank interview', icon: 'mic', desc: 'Tanya-jawab per topik, mode kartu latihan' },
      { key: 'glosarium', title: 'Glosarium', icon: 'dict', desc: `${D.GLOSSARY.length} istilah penting AA` },
    ],
    tools: [
      { key: 'kalkulator', title: 'Kalkulator angsuran', icon: 'calc', desc: 'Jadwal CONSTANT, LINEAR, ACTUAL dengan grafik' },
      { key: 'overdue', title: 'Simulator overdue', icon: 'alert', desc: 'DPD, status aging, penalty & late fee' },
      { key: 'asisten', title: 'Asisten materi', icon: 'chat', desc: 'Tanya apa saja, jawaban dari materi situs' },
    ],
  };

  /* ---------- Indeks pencarian (dipakai palette & asisten) ---------- */
  const STOP = new Set(('yang dan di ke dari untuk dengan atau ini itu apa adalah pada dalam juga tidak bisa akan sebagai oleh saat jika ' +
    'the of a an to in is are what how itu bagaimana jelaskan mengapa kenapa kapan berapa siapa mana tentang dong sih ya saya kamu ' +
    'tolong coba apakah artinya maksud maksudnya beda bedanya vs antara sama ada hal cara').split(' '));
  function tokens(s) {
    const out = [];
    String(s).toLowerCase().split(/[^a-z0-9.\-]+/).forEach((t) => {
      t = t.replace(/^[.\-]+|[.\-]+$/g, '');
      if (!t) return;
      if (/[.\-]/.test(t)) { out.push(t.replace(/-/g, '.')); t.split(/[.\-]/).forEach((p) => p && out.push(p)); } else out.push(t);
    });
    return out.filter((t) => t.length >= 2 && !STOP.has(t));
  }
  AA.tokens = tokens;

  let INDEX = null;
  function buildIndex() {
    const docs = [];
    const add = (d) => { d.titleTok = new Set(tokens(d.title)); const tt = tokens(d.title + ' ' + (d.keys || '') + ' ' + d.text); d.tf = {}; tt.forEach((t) => (d.tf[t] = (d.tf[t] || 0) + 1)); d.len = tt.length; d.titleLow = d.title.toLowerCase(); docs.push(d); };

    AA.MODS.forEach((m) => {
      add({ kind: 'modul', icon: 'book', title: m.title, sub: `Modul ${m.n}`, text: m.sections.map((s) => s.title).join(' '), route: `#/modul/${m.key}` });
      let cur = null;
      m.body.forEach((b) => {
        if (b[0] === 'h') { cur = { kind: 'bagian', icon: 'book', title: strip(b[1]), sub: `Modul ${m.n}: ${m.title}`, text: '', blocks: [], route: `#/modul/${m.key}?s=${slug(b[1])}`, mod: m }; add(cur); return; }
        if (b[0] === 'iq') {
          b[1].forEach(([q, a]) => add({ kind: 'interview', icon: 'mic', title: strip(q), sub: `Interview, Modul ${m.n}`, text: strip(a), answer: a, route: `#/interview?q=${encodeURIComponent(strip(q))}` }));
          return;
        }
        if (!cur) return;
        cur.blocks.push(b);
        const t = b[0] === 'tbl' ? b[1].map((r) => r.join(' ')).join(' ') + ' ' + (b[2] || '') : Array.isArray(b[1]) ? b[1].join(' ') + ' ' + (b[2] || '') : b[1];
        cur.text += ' ' + strip(t);
      });
    });
    // tokenize ulang bagian modul setelah teksnya lengkap
    docs.forEach((d) => { if (d.kind === 'bagian') { const tt = tokens(d.title + ' ' + d.text); d.tf = {}; tt.forEach((t) => (d.tf[t] = (d.tf[t] || 0) + 1)); d.len = tt.length; } });

    D.PC.forEach((p) => add({ kind: 'property', icon: 'grid', title: p.id, sub: `Property class: ${p.name}`, keys: p.name + ' ' + p.attr, text: strip(p.klik + ' ' + p.pts.join(' ') + ' ' + (p.ws || '')), route: `#/property/${p.id}`, pc: p }));
    D.GLOSSARY.forEach(([t, d]) => add({ kind: 'istilah', icon: 'dict', title: strip(t), sub: 'Glosarium', text: strip(d), def: d, route: `#/glosarium/${slug(t)}` }));
    D.IVQ.forEach(([cat, qs]) => qs.forEach(([q, a]) => add({ kind: 'interview', icon: 'mic', title: strip(q), sub: `Interview, ${strip(cat)}`, text: strip(a), answer: a, route: `#/interview?q=${encodeURIComponent(strip(q))}` })));
    D.KB.forEach((k) => add({ kind: 'kb', icon: 'chat', title: strip(k.a).split(/[.:]/)[0].slice(0, 80), sub: 'Ringkasan materi', keys: k.k, text: strip(k.a), answer: k.a, route: null }));
    [...AA.NAV.deep, ...AA.NAV.practice, ...AA.NAV.tools].forEach((p) => add({ kind: 'halaman', icon: p.icon, title: p.title, sub: p.desc, text: p.desc, route: `#/${p.key}` }));
    add({ kind: 'halaman', icon: 'home', title: 'Beranda', sub: 'Ringkasan progres dan siklus arrangement', text: 'dashboard beranda progres lifecycle siklus', route: '#/' });

    const df = {};
    docs.forEach((d) => Object.keys(d.tf).forEach((t) => (df[t] = (df[t] || 0) + 1)));
    const N = docs.length;
    const idf = (t) => Math.log(1 + N / (df[t] || 0.5));
    INDEX = { docs, idf, allTokens: Object.keys(df) };
    return INDEX;
  }

  AA.search = function (query, opts = {}) {
    if (!INDEX) buildIndex();
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const qt = Array.from(new Set(tokens(q)));
    const kinds = opts.kinds;
    const res = [];
    for (const d of INDEX.docs) {
      if (kinds && !kinds.includes(d.kind)) continue;
      let s = 0, hits = 0;
      for (const t of qt) {
        const w = INDEX.idf(t);
        let hit = false;
        if (d.titleTok.has(t)) { s += 3 * w; hit = true; }
        else if (t.length >= 3) { for (const tt of d.titleTok) if (tt.startsWith(t)) { s += 1.6 * w; hit = true; break; } }
        const f = d.tf[t];
        if (f) { s += (1 + Math.log(f)) * w / (1 + Math.log(1 + d.len / 160)); hit = true; }
        else if (t.length >= 4) { for (const k in d.tf) if (k.startsWith(t)) { s += 0.5 * w; hit = true; break; } }
        if (hit) hits++;
      }
      if (!hits) continue;
      if (q.length > 3 && d.titleLow.includes(q)) s += 6;
      if (qt.length > 1) s *= 0.55 + 0.45 * (hits / qt.length);
      res.push({ d, s });
    }
    res.sort((a, b) => b.s - a.s);
    return res.slice(0, opts.limit || 30);
  };
  AA.highlight = function (text, query) {
    const qt = tokens(query).filter((t) => t.length >= 2).map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const e = esc(text);
    if (!qt.length) return e;
    return e.replace(new RegExp('(' + qt.join('|') + ')', 'gi'), '<mark>$1</mark>');
  };

  /* ---------- Toast ---------- */
  let toastT;
  AA.toast = function (msg, ic = 'check') {
    const el = $('#toast');
    el.innerHTML = icon(ic, 'i-sm') + esc(msg);
    el.classList.add('show');
    clearTimeout(toastT);
    toastT = setTimeout(() => el.classList.remove('show'), 2200);
  };

  /* ---------- Dialog konfirmasi ---------- */
  AA.confirm = function ({ title, body, ok = 'Lanjutkan', cancel = 'Batal', danger = false }) {
    return new Promise((resolve) => {
      const dlg = document.createElement('dialog');
      dlg.className = 'dlg';
      dlg.setAttribute('aria-labelledby', 'dlgT');
      dlg.innerHTML = `<form method="dialog"><h2 id="dlgT">${esc(title)}</h2><p>${body}</p>
        <div class="btn-row dlg-actions"><button class="btn btn-line" value="no">${esc(cancel)}</button><button class="btn${danger ? ' btn-danger' : ''}" value="yes">${esc(ok)}</button></div></form>`;
      document.body.appendChild(dlg);
      dlg.addEventListener('close', () => { resolve(dlg.returnValue === 'yes'); dlg.remove(); });
      dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close('no'); });
      dlg.showModal();
      $('button[value="yes"]', dlg).focus();
    });
  };

  /* ---------- Navigasi samping ---------- */
  function navLink(href, inner, cur) { return `<a href="${href}"${cur ? ' aria-current="page"' : ''}>${inner}</a>`; }
  AA.renderNav = function (route) {
    const done = Store.data.done;
    const r = route || AA.route || { name: 'home' };
    const isCur = (name, param) => r.name === name && (param === undefined || r.param === param);
    const html = `
      ${navLink('#/', icon('home') + 'Beranda', isCur('home'))}
      <div class="nav-group">
        <div class="nav-title"><span>Kursus AA Lending</span><span>${AA.doneCount()}/${AA.MODS.length}</span></div>
        ${AA.MODS.map((m) => navLink(`#/modul/${m.key}`, `<span class="num${done[m.key] ? ' done' : ''}">${done[m.key] ? icon('check') : m.n}</span><span>${esc(m.title.replace(/\s*\(.*\)$/, ''))}</span>`, isCur('modul', m.key))).join('')}
      </div>
      <div class="nav-group">
        <div class="nav-title"><span>Pendalaman</span></div>
        ${AA.NAV.deep.map((p) => navLink(`#/${p.key}`, icon(p.icon) + esc(p.title), isCur(p.key))).join('')}
      </div>
      <div class="nav-group">
        <div class="nav-title"><span>Latihan</span></div>
        ${AA.NAV.practice.map((p) => navLink(`#/${p.key}`, icon(p.icon) + esc(p.title), isCur(p.key))).join('')}
      </div>
      <div class="nav-group">
        <div class="nav-title"><span>Alat</span></div>
        ${AA.NAV.tools.map((p) => navLink(`#/${p.key}`, icon(p.icon) + esc(p.title), isCur(p.key))).join('')}
      </div>
      ${AA.Cloud && AA.Cloud.user ? `<div class="nav-group">
        <div class="nav-title"><span>Akun</span></div>
        ${navLink('#/akun', icon('user') + 'Akun & hasil belajar', isCur('akun'))}
        ${AA.Cloud.isAdmin() ? navLink('#/admin', icon('users') + 'Admin peserta', isCur('admin')) + navLink('#/peran', icon('shield') + 'Kelola peran', isCur('peran')) : ''}
      </div>` : ''}
      <div class="nav-group"><a href="v1.html" class="small">${icon('reset')}Versi lama</a></div>`;
    const nav = $('#nav');
    const st = nav.scrollTop;
    nav.innerHTML = html;
    nav.scrollTop = st;
    AA.renderWho();
  };
  // Kartu pengguna di kaki sidebar
  AA.renderWho = function () {
    const C = AA.Cloud, who = $('#who');
    const prog = `${AA.doneCount()} dari ${AA.MODS.length} modul selesai`;
    if (C && C.user) {
      const name = C.displayName();
      who.innerHTML = `<a class="who" href="#/akun" title="Akun & hasil belajar"><span class="avatar" aria-hidden="true">${esc(AA.initials(name))}</span><span><b>${esc(name)}</b><small>${prog}</small></span></a>`;
    } else if (C && C.enabled) {
      who.innerHTML = `<a class="who" href="#/masuk"><span class="avatar avatar-ghost" aria-hidden="true">${icon('user', 'i-sm')}</span><span><b>Masuk</b><small>Simpan progres ke akunmu</small></span></a>`;
    } else {
      who.innerHTML = `<div class="who"><span class="avatar avatar-ghost" aria-hidden="true">${icon('user', 'i-sm')}</span><span><b>Mode lokal</b><small>${prog}</small></span></div>`;
    }
  };
  AA.initials = (name) => (String(name).trim().split(/\s+/).slice(0, 2).map((w) => w[0] || '').join('') || '?').toUpperCase();

  function closeSidebar() { $('#sidebar').classList.remove('open'); $('#scrim').hidden = true; $('#menuBtn').setAttribute('aria-expanded', 'false'); }
  $('#menuBtn').addEventListener('click', () => { const open = !$('#sidebar').classList.contains('open'); $('#sidebar').classList.toggle('open', open); $('#scrim').hidden = !open; $('#menuBtn').setAttribute('aria-expanded', String(open)); });
  $('#scrim').addEventListener('click', closeSidebar);
  $('#nav').addEventListener('click', (e) => { if (e.target.closest('a')) closeSidebar(); });

  /* ---------- Tema ---------- */
  const effectiveTheme = () => document.documentElement.getAttribute('data-theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  function syncThemeIcon() { $('#themeBtn use').setAttribute('href', effectiveTheme() === 'dark' ? '#i-sun' : '#i-moon'); }
  $('#themeBtn').addEventListener('click', () => {
    const next = effectiveTheme() === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('aakm.theme', next); } catch (e) { /* abaikan */ }
    syncThemeIcon();
  });
  syncThemeIcon();

  /* ---------- Command palette ---------- */
  const pal = $('#palette'), palIn = $('#paletteInput'), palList = $('#paletteList');
  let palItems = [], palSel = 0, lastFocus = null;
  const KIND_LABEL = { modul: 'Modul', bagian: 'Bagian modul', property: 'Property class', istilah: 'Istilah', interview: 'Interview', halaman: 'Halaman' };
  function palDefault() {
    const next = AA.nextModule();
    return [
      { d: { icon: 'book', title: `Lanjutkan: ${next.title}`, sub: `Modul ${next.n}`, route: `#/modul/${next.key}`, kind: 'modul' } },
      ...[...AA.NAV.deep, ...AA.NAV.practice, ...AA.NAV.tools].map((p) => ({ d: { icon: p.icon, title: p.title, sub: p.desc, route: `#/${p.key}`, kind: 'halaman' } })),
    ];
  }
  function palRender() {
    const q = palIn.value;
    palItems = q.trim() ? AA.search(q, { kinds: ['modul', 'bagian', 'property', 'istilah', 'interview', 'halaman'], limit: 40 }) : palDefault();
    palSel = 0;
    $('#paletteCount').textContent = q.trim() ? `${palItems.length} hasil` : '';
    palList.innerHTML = palItems.length ? palItems.map((r, i) => `
      <li role="option" id="po${i}" aria-selected="${i === palSel}" data-i="${i}">
        <span class="pi">${icon(r.d.icon, 'i-sm')}</span>
        <span class="pt"><b>${AA.highlight(r.d.title, q)}</b><small>${esc(r.d.sub || '')}</small></span>
        <span class="pk">${KIND_LABEL[r.d.kind] || ''}</span>
      </li>`).join('') : `<li class="empty">Tidak ada yang cocok dengan “${esc(q)}”. Coba kata lain, misalnya <b>interest</b>, <b>bill</b>, atau <b>COB</b>.</li>`;
  }
  function palMove(dir) {
    if (!palItems.length) return;
    palSel = (palSel + dir + palItems.length) % palItems.length;
    $$('li[data-i]', palList).forEach((li) => li.setAttribute('aria-selected', String(+li.dataset.i === palSel)));
    const el = $(`#po${palSel}`); if (el) el.scrollIntoView({ block: 'nearest' });
  }
  function palGo(i) { const r = palItems[i]; if (!r) return; closePalette(); location.hash = r.d.route.slice(1); }
  AA.openPalette = function (prefill = '') {
    lastFocus = document.activeElement;
    pal.hidden = false; palIn.value = prefill; palRender(); palIn.focus();
    document.body.style.overflow = 'hidden';
  };
  function closePalette() { pal.hidden = true; document.body.style.overflow = ''; if (lastFocus && lastFocus.focus) lastFocus.focus(); }
  palIn.addEventListener('input', palRender);
  palIn.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); palMove(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); palMove(-1); }
    else if (e.key === 'Enter') { e.preventDefault(); palGo(palSel); }
    else if (e.key === 'Escape') { e.preventDefault(); closePalette(); }
  });
  palList.addEventListener('click', (e) => { const li = e.target.closest('li[data-i]'); if (li) palGo(+li.dataset.i); });
  pal.addEventListener('mousedown', (e) => { if (e.target === pal) closePalette(); });
  document.addEventListener('click', (e) => { if (e.target.closest('[data-open-palette]')) AA.openPalette(); });
  const isMac = /Mac|iPhone|iPad/.test(navigator.platform);
  $('#kbdHint').textContent = isMac ? '⌘K' : 'Ctrl K';
  document.addEventListener('keydown', (e) => {
    const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName);
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); pal.hidden ? AA.openPalette() : closePalette(); }
    else if (e.key === '/' && !typing && pal.hidden) { e.preventDefault(); AA.openPalette(); }
    else if (e.key === 'Escape' && !pal.hidden) closePalette();
  });

  /* ---------- Router ---------- */
  const main = $('#main');
  let cleanup = null;
  function parse() {
    const h = location.hash.replace(/^#\/?/, '');
    const [path, qs] = h.split('?');
    const parts = path.split('/').filter(Boolean);
    const query = {};
    (qs || '').split('&').forEach((kv) => { if (!kv) return; const [k, v] = kv.split('='); query[decodeURIComponent(k)] = decodeURIComponent(v || ''); });
    return { name: parts[0] || 'home', param: parts[1] ? decodeURIComponent(parts[1]) : undefined, query };
  }
  AA.setParam = function (param) {
    // perbarui URL tanpa render ulang (mis. memilih property class)
    const r = AA.route;
    const url = `#/${r.name}${param ? '/' + encodeURIComponent(param) : ''}`;
    history.replaceState(null, '', url);
    r.param = param;
  };
  // Halaman yang boleh dibuka tanpa login
  const PUBLIC = new Set(['masuk', 'daftar', 'lupa-password', 'reset-password']);
  function render() {
    const r = parse();
    const C = AA.Cloud;
    if (C && C.enabled && C.requireLogin && !C.user && !PUBLIC.has(r.name)) {
      const next = location.hash && location.hash !== '#/' ? '?next=' + encodeURIComponent(location.hash.slice(1)) : '';
      history.replaceState(null, '', '#/masuk' + next);
      return render();
    }
    if (C && C.user && (r.name === 'masuk' || r.name === 'daftar')) { history.replaceState(null, '', '#/'); return render(); }
    let page = AA.pages[r.name];
    if (!page) { r.name = 'home'; page = AA.pages.home; }
    if (page.adminOnly && !(C && C.isAdmin())) { r.name = 'home'; page = AA.pages.home; }
    document.body.classList.toggle('auth-mode', !!page.bare);
    if (r.name === 'modul' && !AA.mod(r.param)) { r.param = AA.nextModule().key; }
    if (cleanup) { try { cleanup(); } catch (e) { /* abaikan */ } cleanup = null; }
    AA.route = r;
    $('#readbar').style.width = '0';
    main.classList.remove('enter'); void main.offsetWidth; main.classList.add('enter');
    main.innerHTML = page.render(r);
    const c = page.mount && page.mount(r, main);
    if (typeof c === 'function') cleanup = c;
    AA.renderNav(r);
    document.title = (page.title ? (typeof page.title === 'function' ? page.title(r) : page.title) + ' — ' : '') + 'Temenos AA Loan KB';
    if (!r.query.s && !(page.keepScroll && page.keepScroll(r))) window.scrollTo(0, 0);
    if (r.name !== 'home') { Store.data.lastRoute = location.hash; Store.save(); }
  }
  AA.rerender = render;
  window.addEventListener('hashchange', render);
  window.addEventListener('DOMContentLoaded', async () => {
    // Tunggu sesi login dipulihkan (maks 6 detik) sebelum render pertama
    if (AA.Cloud) {
      main.innerHTML = '<div class="boot" aria-busy="true"><span class="brand-mark"></span></div>';
      try { await Promise.race([AA.Cloud.init(), new Promise((res) => setTimeout(res, 6000))]); } catch (e) { console.error(e); }
    }
    if (!location.hash || !location.hash.startsWith('#/')) history.replaceState(null, '', location.pathname + location.search + '#/');
    render();
  });
})();
