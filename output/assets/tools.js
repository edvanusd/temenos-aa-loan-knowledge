/* =========================================================
   AA Loan KB — latihan & alat: quiz, bank interview, glosarium,
   kalkulator angsuran, simulator overdue, asisten materi.
   ========================================================= */
(function () {
  'use strict';
  const AA = window.AA, D = AA.D;
  const { $, $$, esc, strip, fmt, slug, icon, Store, shuffle, hash } = AA;

  const head = (crumb, title, lede) => `<div class="crumbs"><a href="#/">Beranda</a><span class="sep">/</span><span>${crumb}</span></div><h1 class="page-title">${title}</h1>${lede ? `<p class="lede">${lede}</p>` : ''}`;

  /* =======================================================
     Kartu latihan (dipakai interview & glosarium)
     ======================================================= */
  function flashcards(host, deckIn, opts) {
    let deck = shuffle(deckIn), flipped = false, seen = 0;
    const total = deckIn.length;
    function draw() {
      if (!deck.length) {
        host.innerHTML = `<div class="panel pad" style="text-align:center"><h3 style="font-size:20px">Dek selesai</h3><p class="muted" style="margin:8px 0 16px">${total} kartu sudah kamu lewati. ${opts.doneHint || ''}</p><button class="btn" data-fc="again">${icon('shuffle', 'i-sm')}Acak ulang semua kartu</button></div>`;
        return;
      }
      const c = deck[0]; flipped = false;
      host.innerHTML = `
        <div class="fc" tabindex="0" role="button" aria-label="Balik kartu">
          <div class="fc-inner">
            <div class="fc-face front"><div class="fl"><span>${esc(c.cat || '')}</span><span>${total - deck.length + 1} / ${total}</span></div><div class="fq">${c.q}</div><div class="hint">${icon('reset', 'i-sm')}Ketuk atau tekan spasi untuk membalik</div></div>
            <div class="fc-face back"><div class="fl"><span>Jawaban</span><span>${total - deck.length + 1} / ${total}</span></div><div class="fa">${c.a}</div><div class="hint">Nilai dirimu dengan jujur</div></div>
          </div>
        </div>
        <div class="fc-actions">
          <button class="btn btn-line" data-fc="later">${icon('reset', 'i-sm')}Ulangi nanti <kbd>1</kbd></button>
          <div class="bar" style="flex:1;max-width:200px"><i style="width:${(seen / total) * 100}%"></i></div>
          <button class="btn" data-fc="known">${icon('check', 'i-sm')}Sudah bisa <kbd>2</kbd></button>
        </div>`;
    }
    const flip = () => { const f = $('.fc', host); if (!f) return; flipped = !flipped; f.classList.toggle('flipped', flipped); };
    const act = (a) => {
      if (a === 'again') { deck = shuffle(deckIn); seen = 0; return draw(); }
      if (!deck.length) return;
      const c = deck.shift();
      if (a === 'later') deck.push(c); else { seen++; opts.onKnown(c); }
      draw();
    };
    host.onclick = (e) => { const b = e.target.closest('[data-fc]'); if (b) return act(b.dataset.fc); if (e.target.closest('.fc')) flip(); };
    const key = (e) => {
      if (/INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName) || !host.isConnected) return;
      if (e.key === ' ') { e.preventDefault(); flip(); } else if (e.key === '1' || e.key === 'ArrowLeft') act('later'); else if (e.key === '2' || e.key === 'ArrowRight') act('known');
    };
    document.addEventListener('keydown', key);
    draw();
    return () => document.removeEventListener('keydown', key);
  }

  /* =======================================================
     QUIZ
     ======================================================= */
  let QS = null; // sesi quiz yang sedang berjalan (di memori)
  const isTF = (q) => q.o.length === 2 && /^true$/i.test(q.o[0]) && /^false$/i.test(q.o[1]);
  function newSession(indices) {
    QS = { i: 0, items: indices.map((qi) => { const q = D.QUIZ[qi]; const opts = q.o.map((t, k) => ({ t, k })); return { qi, opts: isTF(q) ? opts : shuffle(opts), ans: null }; }), phase: 'run' };
  }
  function bestPct() { const a = Store.data.quiz.attempts; return a.length ? Math.max(...a.map((x) => Math.round((x.s / x.t) * 100))) : null; }

  AA.pages.quiz = {
    title: 'Quiz',
    render() { return `<div class="page"><div class="quiz-wrap" id="quiz"></div></div>`; },
    mount(r, root) {
      const host = $('#quiz', root);
      function setup() {
        const qd = Store.data.quiz, wrong = qd.wrong.length, best = bestPct();
        const hist = qd.attempts.slice(-12);
        host.innerHTML = `${head('Latihan', 'Quiz AA Lending', `${D.QUIZ.length} soal dari quiz resmi kursus (Quiz 1–9). Urutan pilihan diacak setiap sesi. Gunakan tombol angka untuk menjawab cepat.`)}
          <div class="qsetup">
            <button class="qmode" data-mode="quick"><b>Sesi cepat</b><small>10 soal acak, sekitar 5 menit</small></button>
            <button class="qmode" data-mode="all"><b>Semua soal</b><small>${D.QUIZ.length} soal dalam urutan acak</small></button>
            <button class="qmode" data-mode="wrong" ${wrong ? '' : 'disabled'}><b>Ulangi yang salah</b><small>${wrong ? `${wrong} soal yang pernah kamu jawab salah` : 'Belum ada soal yang salah'}</small></button>
          </div>
          ${qd.attempts.length ? `<div class="panel pad" style="margin-top:18px;display:flex;justify-content:space-between;align-items:end;gap:20px;flex-wrap:wrap">
            <div><div class="small muted">Skor terbaik</div><div style="font-size:28px;font-weight:800">${best}%</div><div class="small muted">${qd.attempts.length} sesi dikerjakan</div></div>
            <div><div class="small muted" style="margin-bottom:6px">Sesi terakhir</div><div class="history">${hist.map((a) => `<span style="height:40px" title="${a.s}/${a.t}"><i style="height:${(a.s / a.t) * 100}%"></i></span>`).join('')}</div></div>
            <button class="btn btn-quiet btn-sm" data-reset>Hapus riwayat quiz</button></div>` : ''}
          ${QS && QS.phase === 'run' ? `<div class="panel pad" style="margin-top:12px;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap"><span>Ada sesi yang belum selesai: soal ${QS.i + 1} dari ${QS.items.length}.</span><button class="btn btn-line btn-sm" data-resume>Lanjutkan sesi</button></div>` : ''}`;
      }
      function run() {
        const it = QS.items[QS.i], q = D.QUIZ[it.qi];
        const answered = it.ans !== null;
        host.innerHTML = `
          <div class="crumbs"><a href="#/quiz" data-exit>Quiz</a><span class="sep">/</span><span>Sesi ${QS.items.length} soal</span></div>
          <div class="qdots" aria-hidden="true">${QS.items.map((x, k) => `<span class="${k === QS.i ? 'cur' : x.ans === null ? '' : x.ans === D.QUIZ[x.qi].a ? 'ok' : 'bad'}"></span>`).join('')}</div>
          <div class="panel qcard">
            <div class="qn"><span>Soal ${QS.i + 1} dari ${QS.items.length}</span><span>Benar ${QS.items.filter((x) => x.ans !== null && x.ans === D.QUIZ[x.qi].a).length}</span></div>
            <h2>${q.q}</h2>
            <div class="opts" role="group" aria-label="Pilihan jawaban">
              ${it.opts.map((o, k) => {
                let cls = '';
                if (answered) { if (o.k === q.a) cls = 'correct'; else if (o.k === it.ans) cls = 'wrong'; else cls = 'dim'; }
                return `<button class="opt ${cls}" data-k="${o.k}" ${answered ? 'disabled' : ''}><span class="ok-key">${k + 1}</span><span>${o.t}</span>${cls === 'correct' ? icon('check') : cls === 'wrong' ? icon('x') : ''}</button>`;
              }).join('')}
            </div>
            ${answered ? `<div class="explain"><b>${it.ans === q.a ? 'Benar.' : 'Belum tepat.'}</b> ${q.e}</div>` : ''}
          </div>
          <div class="qnav">
            <button class="btn btn-quiet" data-nav="-1" ${QS.i === 0 ? 'disabled' : ''}>${icon('left', 'i-sm')}Sebelumnya</button>
            <button class="btn ${answered ? '' : 'btn-line'}" data-nav="1">${QS.i === QS.items.length - 1 ? 'Lihat hasil' : 'Berikutnya'}${icon('right', 'i-sm')}</button>
          </div>`;
        const b = $('.opt:not([disabled])', host); if (b && !answered && window.innerWidth > 760) b.focus({ preventScroll: true });
      }
      function finish() {
        const s = QS.items.filter((x) => x.ans === D.QUIZ[x.qi].a).length, t = QS.items.length;
        const qd = Store.data.quiz;
        if (!QS.saved) {
          qd.attempts.push({ s, t, d: Date.now() }); if (qd.attempts.length > 30) qd.attempts.shift();
          const w = new Set(qd.wrong);
          QS.items.forEach((x) => { if (x.ans === null) return; if (x.ans === D.QUIZ[x.qi].a) w.delete(x.qi); else w.add(x.qi); });
          qd.wrong = Array.from(w); Store.save(); QS.saved = true;
        }
        QS.phase = 'done';
        const pct = Math.round((s / t) * 100), C = 2 * Math.PI * 62;
        const wrongs = QS.items.filter((x) => x.ans !== null && x.ans !== D.QUIZ[x.qi].a);
        const skipped = QS.items.filter((x) => x.ans === null).length;
        host.innerHTML = `
          <div class="crumbs"><a href="#/quiz" data-exit>Quiz</a><span class="sep">/</span><span>Hasil</span></div>
          <div class="panel qresult">
            <svg class="ring" viewBox="0 0 150 150" role="img" aria-label="Skor ${pct} persen"><circle class="tr" cx="75" cy="75" r="62"/><circle class="pr" cx="75" cy="75" r="62" stroke-dasharray="${C}" stroke-dashoffset="${C}" transform="rotate(-90 75 75)" style="${pct < 60 ? 'stroke:var(--amber)' : ''}"/><text x="75" y="84" text-anchor="middle" font-size="30">${pct}%</text></svg>
            <div><h2>${pct >= 80 ? 'Siap lanjut ke materi berikutnya' : pct >= 60 ? 'Hampir, tinggal sedikit lagi' : 'Ulangi modul yang terkait, lalu coba lagi'}</h2>
              <p>${s} dari ${t} soal benar${skipped ? `, ${skipped} dilewati` : ''}. ${bestPct() !== null ? `Skor terbaikmu ${bestPct()}%.` : ''}</p>
              <div class="btn-row" style="margin-top:16px">${wrongs.length ? `<button class="btn" data-again="wrong">Ulangi ${wrongs.length} yang salah</button>` : ''}<button class="btn btn-line" data-again="quick">Sesi cepat baru</button><button class="btn btn-quiet" data-exit>Kembali</button></div>
            </div>
          </div>
          ${wrongs.length ? `<div class="panel review"><div class="qa-group"><span>Pembahasan soal yang salah</span><span>${wrongs.length}</span></div>${wrongs.map((x) => { const q = D.QUIZ[x.qi]; return `<div class="review-item"><div class="rq">${q.q}</div><div class="ra"><span class="bad">Jawabanmu: ${q.o[x.ans]}</span><br><span class="good">Benar: ${q.o[q.a]}</span></div><div class="ra">${q.e}</div></div>`; }).join('')}</div>` : ''}`;
        requestAnimationFrame(() => requestAnimationFrame(() => { const c = $('.ring .pr', host); if (c) c.style.strokeDashoffset = C * (1 - pct / 100); }));
      }
      function start(mode) {
        const all = D.QUIZ.map((_, i) => i);
        if (mode === 'quick') newSession(shuffle(all).slice(0, 10));
        else if (mode === 'all') newSession(shuffle(all));
        else newSession(shuffle(Store.data.quiz.wrong.slice()));
        run();
      }
      function answer(k) { const it = QS.items[QS.i]; if (it.ans !== null) return; it.ans = k; run(); }
      function nav(d) { if (d > 0 && QS.i === QS.items.length - 1) return finish(); QS.i = Math.max(0, Math.min(QS.items.length - 1, QS.i + d)); run(); window.scrollTo(0, 0); }
      host.addEventListener('click', (e) => {
        const t = e.target;
        if (t.closest('[data-mode]')) return start(t.closest('[data-mode]').dataset.mode);
        if (t.closest('[data-resume]')) return run();
        if (t.closest('[data-reset]')) { if (confirm('Hapus semua riwayat dan daftar soal salah?')) { Store.data.quiz = { attempts: [], wrong: [] }; Store.save(); setup(); } return; }
        if (t.closest('[data-exit]')) { e.preventDefault(); if (QS && QS.phase === 'done') QS = null; return setup(); }
        if (t.closest('[data-again]')) return start(t.closest('[data-again]').dataset.again);
        const o = t.closest('.opt'); if (o) return answer(+o.dataset.k);
        const n = t.closest('[data-nav]'); if (n) return nav(+n.dataset.nav);
      });
      const key = (e) => {
        if (!QS || QS.phase !== 'run' || !$('.qcard', host) || /INPUT|SELECT/.test(document.activeElement.tagName)) return;
        const it = QS.items[QS.i];
        if (/^[1-5]$/.test(e.key) && it.opts[+e.key - 1]) answer(it.opts[+e.key - 1].k);
        else if ((e.key === 'Enter' || e.key === 'ArrowRight') && it.ans !== null) { e.preventDefault(); nav(1); }
        else if (e.key === 'ArrowLeft') nav(-1);
      };
      document.addEventListener('keydown', key);
      QS && QS.phase === 'run' ? run() : setup();
      return () => document.removeEventListener('keydown', key);
    },
  };

  /* =======================================================
     BANK INTERVIEW
     ======================================================= */
  let IV = null;
  AA.interviewItems = function () {
    if (IV) return IV;
    const seen = new Set(); IV = [];
    const push = (q, a, cat, group, mod) => { const k = strip(q).toLowerCase(); if (seen.has(k)) return; seen.add(k); IV.push({ id: hash(k), q, a, cat, group, mod }); };
    D.IVQ.forEach(([cat, qs]) => qs.forEach(([q, a]) => push(q, a, strip(cat), 'bank')));
    AA.MODS.forEach((m) => m.body.filter((b) => b[0] === 'iq').forEach((b) => b[1].forEach(([q, a]) => push(q, a, `Modul ${m.n}: ${m.title}`, 'modul', m.key))));
    return IV;
  };
  AA.pages.interview = {
    title: 'Bank interview',
    render(r) {
      const items = AA.interviewItems();
      const cats = Array.from(new Set(items.filter((x) => x.group === 'bank').map((x) => x.cat)));
      const known = Object.keys(Store.data.ivqKnown).length;
      return `<div class="page page-narrow">
        ${head('Latihan', 'Bank pertanyaan interview', `${items.length} tanya-jawab dari bank interview dan bagian interview tiap modul. Baca sebagai daftar, atau latih dengan kartu dan tandai yang sudah kamu kuasai.`)}
        <div class="panel pad" style="margin-top:20px;display:flex;flex-direction:column;gap:14px">
          <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center;justify-content:space-between">
            <div class="seg" id="ivMode"><button aria-pressed="${r.query.mod ? 'false' : 'true'}" data-m="list">${icon('list', 'i-sm')} Daftar</button><button aria-pressed="${r.query.mod ? 'true' : 'false'}" data-m="cards">${icon('cards', 'i-sm')} Latihan kartu</button></div>
            <span class="small muted" id="ivKnown">${known} dari ${items.length} dikuasai</span>
          </div>
          <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center">
            <select class="input" id="ivCat" style="max-width:360px">
              <option value="">Semua kategori</option>
              <optgroup label="Bank interview">${cats.map((c) => `<option value="c:${esc(c)}">${esc(c)}</option>`).join('')}</optgroup>
              <optgroup label="Per modul">${AA.MODS.filter((m) => items.some((x) => x.mod === m.key)).map((m) => `<option value="m:${m.key}" ${r.query.mod === m.key ? 'selected' : ''}>Modul ${m.n}: ${esc(m.title)}</option>`).join('')}</optgroup>
            </select>
            <label style="display:flex;gap:8px;align-items:center;font-size:14px"><input type="checkbox" id="ivHide"> Sembunyikan yang sudah dikuasai</label>
          </div>
        </div>
        <div id="ivOut"></div>
      </div>`;
    },
    mount(r, root) {
      const items = AA.interviewItems();
      const out = $('#ivOut', root);
      let mode = r.query.mod ? 'cards' : 'list', offCards = null;
      const filtered = () => {
        const c = $('#ivCat', root).value, hide = $('#ivHide', root).checked;
        return items.filter((x) => (!c || (c.startsWith('c:') ? x.cat === c.slice(2) : x.mod === c.slice(2))) && (!hide || !Store.data.ivqKnown[x.id]));
      };
      const updKnown = () => { $('#ivKnown', root).textContent = `${Object.keys(Store.data.ivqKnown).length} dari ${items.length} dikuasai`; };
      function draw() {
        if (offCards) { offCards(); offCards = null; }
        const list = filtered();
        if (!list.length) { out.innerHTML = `<div class="panel pad" style="margin-top:18px"><p class="muted">Semua pertanyaan di kategori ini sudah kamu kuasai. Matikan “Sembunyikan yang sudah dikuasai” untuk mengulang.</p></div>`; return; }
        if (mode === 'cards') {
          out.innerHTML = '<div class="fc-wrap"></div>';
          offCards = flashcards($('.fc-wrap', out), list, { onKnown: (c) => { Store.data.ivqKnown[c.id] = 1; Store.save(); updKnown(); }, doneHint: 'Jawaban yang kamu tandai “Sudah bisa” tersimpan.' });
          return;
        }
        let html = '', lastCat = null;
        list.forEach((x) => {
          if (x.cat !== lastCat) { html += `<div class="qa-group"><span>${esc(x.cat)}</span><span>${list.filter((y) => y.cat === x.cat).length}</span></div>`; lastCat = x.cat; }
          const k = !!Store.data.ivqKnown[x.id];
          html += `<div class="qa" data-id="${x.id}"><button class="q" aria-expanded="false"><span>${x.q}</span>${k ? icon('check', 'known i-sm') : icon('right', 'chev i-sm')}</button><div class="a">${x.a}<div style="margin-top:10px"><button class="btn btn-quiet btn-sm" data-known="${x.id}">${k ? 'Tandai belum dikuasai' : `${icon('check', 'i-sm')}Tandai sudah dikuasai`}</button></div></div></div>`;
        });
        out.innerHTML = `<div class="qalist">${html}</div>`;
      }
      out.addEventListener('click', (e) => {
        const kb = e.target.closest('[data-known]');
        if (kb) { const id = kb.dataset.known; if (Store.data.ivqKnown[id]) delete Store.data.ivqKnown[id]; else Store.data.ivqKnown[id] = 1; Store.save(); updKnown(); draw(); const el = $(`.qa[data-id="${id}"]`, out); if (el) { el.classList.add('open'); } return; }
        const b = e.target.closest('.qa > button.q'); if (!b) return;
        const qa = b.parentElement, o = !qa.classList.contains('open'); qa.classList.toggle('open', o); b.setAttribute('aria-expanded', String(o));
      });
      $('#ivMode', root).addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; mode = b.dataset.m; $$('#ivMode button', root).forEach((x) => x.setAttribute('aria-pressed', String(x === b))); draw(); });
      $('#ivCat', root).addEventListener('change', draw);
      $('#ivHide', root).addEventListener('change', draw);
      draw();
      if (r.query.q) {
        const it = items.find((x) => strip(x.q) === r.query.q);
        if (it) { mode = 'list'; $$('#ivMode button', root).forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.m === 'list'))); draw(); const el = $(`.qa[data-id="${it.id}"]`, out); if (el) { el.classList.add('open'); requestAnimationFrame(() => el.scrollIntoView({ block: 'center' })); } }
      }
      return () => offCards && offCards();
    },
    keepScroll: (r) => !!r.query.q,
  };

  /* =======================================================
     GLOSARIUM
     ======================================================= */
  AA.pages.glosarium = {
    title: 'Glosarium',
    render() {
      return `<div class="page">
        ${head('Latihan', 'Glosarium', `${D.GLOSSARY.length} istilah penting AA Loan. Cari, lompat per huruf, atau hafalkan dengan kartu.`)}
        <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center;margin-top:20px">
          <div class="search-wrap" style="flex:1;min-width:240px;max-width:480px">${icon('search')}<input class="input input-search" id="glq" placeholder="Cari istilah atau definisi"></div>
          <div class="seg" id="glMode"><button aria-pressed="true" data-m="list">${icon('list', 'i-sm')} Daftar</button><button aria-pressed="false" data-m="cards">${icon('cards', 'i-sm')} Kartu</button></div>
          <span class="small muted" id="glKnown"></span>
        </div>
        <div id="glOut"></div>
      </div>`;
    },
    mount(r, root) {
      const terms = D.GLOSSARY.map(([t, d]) => ({ id: slug(t), t, d })).sort((a, b) => strip(a.t).localeCompare(strip(b.t)));
      const out = $('#glOut', root), q = $('#glq', root);
      let mode = 'list', off = null;
      const updK = () => { $('#glKnown', root).textContent = `${Object.keys(Store.data.glKnown).length} dari ${terms.length} dikuasai`; };
      function draw() {
        if (off) { off(); off = null; }
        if (mode === 'cards') {
          out.innerHTML = '<div class="fc-wrap"></div>';
          off = flashcards($('.fc-wrap', out), terms.map((x) => ({ id: x.id, q: x.t, a: x.d, cat: 'Istilah' })), { onKnown: (c) => { Store.data.glKnown[c.id] = 1; Store.save(); updK(); } });
          return;
        }
        const s = q.value.trim().toLowerCase();
        const list = terms.filter((x) => !s || strip(x.t + ' ' + x.d).toLowerCase().includes(s));
        const letters = new Set(list.map((x) => strip(x.t)[0].toUpperCase()));
        const hl = (txt) => { if (!s) return txt; return txt.replace(new RegExp('(' + s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')(?![^<]*>)', 'gi'), '<mark class="hit">$1</mark>'); };
        let html = '', last = '';
        list.forEach((x) => { const L = strip(x.t)[0].toUpperCase(); if (L !== last) { html += `<div class="gl-letter" id="gl-${L}">${L}</div>`; last = L; } html += `<div class="gl-term${r.param === x.id ? ' hl' : ''}" id="t-${x.id}"><h3>${hl(x.t)}</h3><p>${hl(x.d)}</p></div>`; });
        out.innerHTML = `<div class="az">${'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((L) => letters.has(L) ? `<a href="#gl-${L}" data-l="${L}">${L}</a>` : `<span>${L}</span>`).join('')}</div>
          <div class="gl">${html || `<p class="muted" style="grid-column:1/-1">Tidak ada istilah yang cocok dengan “${esc(q.value)}”. Coba asisten untuk pertanyaan bebas.</p>`}</div>`;
      }
      out.addEventListener('click', (e) => { const a = e.target.closest('.az a'); if (!a) return; e.preventDefault(); const el = document.getElementById('gl-' + a.dataset.l); if (el) el.scrollIntoView({ behavior: AA.reduceMotion() ? 'auto' : 'smooth' }); });
      q.addEventListener('input', draw);
      $('#glMode', root).addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; mode = b.dataset.m; $$('#glMode button', root).forEach((x) => x.setAttribute('aria-pressed', String(x === b))); q.disabled = mode === 'cards'; draw(); });
      updK(); draw();
      if (r.param) { const el = document.getElementById('t-' + r.param); if (el) requestAnimationFrame(() => el.scrollIntoView({ block: 'center' })); }
      return () => off && off();
    },
    keepScroll: (r) => !!r.param,
  };

  /* =======================================================
     KALKULATOR ANGSURAN
     ======================================================= */
  const CUR = { IDR: { s: 'Rp', d: 0 }, USD: { s: '$', d: 2 }, INR: { s: '₹', d: 0 } };
  const TYPES = { CONSTANT: 'Annuity: angsuran sama tiap periode', LINEAR: 'Principal tetap, bunga menurun', ACTUAL: 'Hanya bunga, principal dibayar di akhir' };
  function schedule(P, n, rate, type) {
    const r = rate / 100 / 12, rows = [];
    let bal = P;
    const emi = r > 0 ? (P * r) / (1 - Math.pow(1 + r, -n)) : P / n;
    for (let k = 1; k <= n; k++) {
      const i = bal * r;
      let p = type === 'CONSTANT' ? emi - i : type === 'LINEAR' ? P / n : k === n ? P : 0;
      if (k === n) p = bal;
      bal = Math.max(0, bal - p);
      rows.push({ k, p, i, pay: p + i, bal });
    }
    const ti = rows.reduce((a, x) => a + x.i, 0);
    return { rows, ti, tp: P + ti };
  }
  AA.schedule = schedule;
  const PRESETS = [
    { l: 'Home loan di kursus', P: 5000000, n: 240, r: 8.25, c: 'INR', t: 'CONSTANT' },
    { l: 'Workshop Term Amount', P: 40000, n: 36, r: 6, c: 'USD', t: 'LINEAR' },
    { l: 'KPR Rp 500 juta', P: 500000000, n: 180, r: 7.5, c: 'IDR', t: 'CONSTANT' },
  ];
  AA.pages.kalkulator = {
    title: 'Kalkulator angsuran',
    render() {
      return `<div class="page">
        ${head('Alat', 'Kalkulator angsuran', 'Bandingkan payment type AA: CONSTANT (annuity) butuh Term Amount dan Interest property, LINEAR butuh Term Amount, dan ACTUAL di sini sebagai interest-only dengan pelunasan principal di akhir.')}
        <div class="chips" style="margin-top:16px" id="presets"><span class="small muted" style="align-self:center;margin-right:4px">Contoh:</span>${PRESETS.map((p, i) => `<button class="chip" data-p="${i}">${p.l}</button>`).join('')}</div>
        <div class="calc">
          <form class="panel calc-form" id="cf" onsubmit="return false">
            <div class="row2">
              <label class="field"><span>Mata uang</span><select class="input" name="c">${Object.keys(CUR).map((k) => `<option value="${k}">${k}</option>`).join('')}</select></label>
              <label class="field"><span>Principal</span><input class="input" name="P" type="number" min="1" step="any" value="5000000"></label>
            </div>
            <label class="field"><span>Tenor <output data-o="n"></output></span><input type="range" name="n" min="1" max="360" value="240"></label>
            <label class="field"><span>Bunga per tahun <output data-o="r"></output></span><input type="range" name="r" min="0" max="24" step="0.05" value="8.25"></label>
            <div class="field"><span>Payment type</span><div class="seg" id="ptype" style="width:100%">${Object.keys(TYPES).map((t, i) => `<button type="button" data-t="${t}" aria-pressed="${i === 0}" style="flex:1" class="mono">${t}</button>`).join('')}</div><small class="muted" id="ptdesc" style="font-size:13px"></small></div>
          </form>
          <div style="display:flex;flex-direction:column;gap:18px;min-width:0">
            <div class="figures" id="figs"></div>
            <div class="panel chart" id="chart" style="position:relative"></div>
            <div class="panel" style="overflow:hidden"><div class="pad" style="padding-bottom:0"><h3 style="font-size:15px">Perbandingan tiga payment type</h3><p class="small muted">Principal, tenor, dan rate yang sama</p></div><div id="cmp" style="padding:14px 22px 22px"></div></div>
            <div class="panel" style="overflow:hidden"><div class="pad" style="padding-bottom:12px;display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;align-items:baseline"><h3 style="font-size:15px">Jadwal angsuran</h3><span class="small muted">Penyederhanaan edukasi: T24 juga memperhitungkan day basis, tiered rate, charges, dan recalculation.</span></div><div id="sched"></div></div>
          </div>
        </div>
      </div>`;
    },
    mount(r, root) {
      const f = $('#cf', root);
      let type = 'CONSTANT', showAll = false;
      const money = (v, c) => `${CUR[c].s}${fmt(v, CUR[c].d)}`;
      const short = (v) => { const a = Math.abs(v); return a >= 1e9 ? fmt(v / 1e9, 1) + ' M' : a >= 1e6 ? fmt(v / 1e6, 1) + ' jt' : a >= 1e3 ? fmt(v / 1e3, 0) + ' rb' : fmt(v, 0); };
      function fillRange(el) { el.style.setProperty('--fill', ((el.value - el.min) / (el.max - el.min)) * 100 + '%'); }
      function calc() {
        const P = Math.max(1, +f.P.value || 0), n = +f.n.value, rate = +f.r.value, c = f.c.value;
        $$('input[type=range]', f).forEach(fillRange);
        $('[data-o="n"]', f).textContent = `${n} bulan${n >= 12 ? ` (${fmt(n / 12, n % 12 ? 1 : 0)} th)` : ''}`;
        $('[data-o="r"]', f).textContent = fmt(rate, 2) + '%';
        $('#ptdesc', root).textContent = TYPES[type];
        const S = schedule(P, n, rate, type);
        const first = S.rows[0], last = S.rows[S.rows.length - 1];
        $('#figs', root).innerHTML = `
          <div><small>${type === 'CONSTANT' ? 'Angsuran per bulan' : type === 'LINEAR' ? 'Angsuran pertama' : 'Bunga per bulan'}</small><b>${money(type === 'ACTUAL' ? first.i : first.pay, c)}</b><span class="note">${type === 'LINEAR' ? `turun ke ${money(last.pay, c)}` : type === 'ACTUAL' ? `+ ${money(P, c)} di bulan ke-${n}` : `selama ${n} bulan`}</span></div>
          <div><small>Total bunga</small><b>${money(S.ti, c)}</b><span class="note">${fmt((S.ti / P) * 100, 1)}% dari principal</span></div>
          <div><small>Total dibayar</small><b>${money(S.tp, c)}</b><span class="note">principal + bunga</span></div>`;
        drawChart(S, c, n);
        const all = Object.keys(TYPES).map((t) => ({ t, ...schedule(P, n, rate, t) }));
        const minI = Math.min(...all.map((x) => x.ti));
        $('#cmp', root).innerHTML = `<div class="tbl-wrap" style="margin:0"><table class="ledger cmp"><thead><tr><th>Type</th><th class="num">Angsuran pertama</th><th class="num">Angsuran terakhir</th><th class="num">Total bunga</th></tr></thead><tbody>${all.map((x) => `<tr><td><span class="tag ${x.t === type ? 'tag-blue' : ''}">${x.t}</span></td><td class="num">${money(x.rows[0].pay, c)}</td><td class="num">${money(x.rows[x.rows.length - 1].pay, c)}</td><td class="num ${x.ti === minI ? 'best' : ''}">${money(x.ti, c)}</td></tr>`).join('')}</tbody></table></div>`;
        const rows = showAll || S.rows.length <= 24 ? S.rows : S.rows.slice(0, 12);
        $('#sched', root).innerHTML = `<div class="tbl-wrap" style="margin:0;border:0;border-top:1px solid var(--line);border-radius:0;max-height:${showAll ? '560px' : 'none'};overflow:auto"><table class="ledger"><thead><tr><th>Bulan</th><th class="num">Angsuran</th><th class="num">Principal</th><th class="num">Bunga</th><th class="num">Outstanding</th></tr></thead><tbody>${rows.map((x) => `<tr><td>${x.k}</td><td class="num">${money(x.pay, c)}</td><td class="num">${money(x.p, c)}</td><td class="num">${money(x.i, c)}</td><td class="num">${money(x.bal, c)}</td></tr>`).join('')}</tbody>
          <tfoot><tr><td>Total</td><td class="num">${money(S.tp, c)}</td><td class="num">${money(P, c)}</td><td class="num">${money(S.ti, c)}</td><td></td></tr></tfoot></table></div>
          ${S.rows.length > 24 ? `<div class="showall"><button class="btn btn-quiet btn-sm" data-all>${showAll ? 'Tampilkan 12 bulan pertama saja' : `Tampilkan semua ${S.rows.length} angsuran`}</button></div>` : ''}`;
      }
      function drawChart(S, c, n) {
        const byYear = n > 48;
        const data = [];
        if (byYear) { for (let y = 0; y < Math.ceil(n / 12); y++) { const g = S.rows.slice(y * 12, y * 12 + 12); data.push({ l: `Th ${y + 1}`, p: g.reduce((a, x) => a + x.p, 0), i: g.reduce((a, x) => a + x.i, 0), bal: g[g.length - 1].bal }); } }
        else S.rows.forEach((x) => data.push({ l: `Bln ${x.k}`, p: x.p, i: x.i, bal: x.bal }));
        const W = 760, H = 270, L = 58, R = 58, T = 14, B = 30, iw = W - L - R, ih = H - T - B;
        const P0 = S.rows[0].bal + S.rows[0].p;
        const maxPay = Math.max(...data.map((d) => d.p + d.i)) * 1.08 || 1;
        const bw = iw / data.length, barW = Math.max(1.5, bw * 0.7);
        const y = (v) => T + ih - (v / maxPay) * ih, y2 = (v) => T + ih - (v / P0) * ih;
        let svg = '';
        for (let k = 0; k <= 4; k++) { const v = (maxPay / 4) * k, yy = y(v); svg += `<line class="grid" x1="${L}" x2="${W - R}" y1="${yy}" y2="${yy}"/><text class="ax" x="${L - 8}" y="${yy + 3.5}" text-anchor="end">${short(v)}</text><text class="ax" x="${W - R + 8}" y="${y2((P0 / 4) * k) + 3.5}">${short((P0 / 4) * k)}</text>`; }
        data.forEach((d, k) => {
          const x = L + k * bw + (bw - barW) / 2;
          svg += `<rect class="c-prin" x="${x}" y="${y(d.p)}" width="${barW}" height="${Math.max(0, T + ih - y(d.p))}"/><rect class="c-int" x="${x}" y="${y(d.p + d.i)}" width="${barW}" height="${Math.max(0, y(d.p) - y(d.p + d.i))}"/>`;
        });
        const pts = [[L, y2(P0)], ...data.map((d, k) => [L + (k + 1) * bw, y2(d.bal)])];
        svg += `<polyline class="c-line" points="${pts.map((p) => p.join(',')).join(' ')}"/>`;
        const every = Math.ceil(data.length / 10);
        data.forEach((d, k) => { if (k % every === 0 || k === data.length - 1) svg += `<text class="ax" x="${L + k * bw + bw / 2}" y="${H - 10}" text-anchor="middle">${byYear ? k + 1 : d.l.replace('Bln ', '')}</text>`; });
        data.forEach((d, k) => { svg += `<rect class="hoverband" data-k="${k}" x="${L + k * bw}" y="${T}" width="${bw}" height="${ih}"/>`; });
        const ch = $('#chart', root);
        ch.innerHTML = `<div class="chart-head"><h3>${byYear ? 'Pembayaran per tahun' : 'Pembayaran per bulan'}</h3><div class="legend"><span><i class="c-prin-bg"></i>Principal</span><span><i class="c-int-bg"></i>Bunga</span><span><i class="c-line-bg"></i>Outstanding (sumbu kanan)</span></div></div>
          <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Grafik principal, bunga, dan outstanding">${svg}</svg><div class="tip" hidden></div>`;
        const tip = $('.tip', ch), svgEl = $('svg', ch);
        svgEl.addEventListener('mousemove', (e) => {
          const band = e.target.closest('.hoverband');
          $$('.hoverband.on', svgEl).forEach((b) => b !== band && b.classList.remove('on'));
          if (!band) { tip.hidden = true; return; }
          band.classList.add('on');
          const d = data[+band.dataset.k];
          tip.hidden = false;
          tip.innerHTML = `<div class="tl">${byYear ? 'Tahun ' + (+band.dataset.k + 1) : d.l.replace('Bln', 'Bulan')}</div>Angsuran <b>${money(d.p + d.i, c)}</b><br>Principal <b>${money(d.p, c)}</b><br>Bunga <b>${money(d.i, c)}</b><br>Outstanding <b>${money(d.bal, c)}</b>`;
          const rect = ch.getBoundingClientRect(), bx = band.getBoundingClientRect();
          let left = bx.left - rect.left + bx.width / 2 + 12;
          if (left + 200 > rect.width) left = bx.left - rect.left - 200;
          tip.style.left = Math.max(8, left) + 'px'; tip.style.top = '52px';
        });
        svgEl.addEventListener('mouseleave', () => { tip.hidden = true; $$('.hoverband.on', svgEl).forEach((b) => b.classList.remove('on')); });
      }
      f.addEventListener('input', calc);
      $('#ptype', root).addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; type = b.dataset.t; $$('#ptype button', root).forEach((x) => x.setAttribute('aria-pressed', String(x === b))); calc(); });
      $('#presets', root).addEventListener('click', (e) => { const b = e.target.closest('[data-p]'); if (!b) return; const p = PRESETS[+b.dataset.p]; f.P.value = p.P; f.n.value = p.n; f.r.value = p.r; f.c.value = p.c; type = p.t; $$('#ptype button', root).forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.t === type))); showAll = false; calc(); });
      $('#sched', root).addEventListener('click', (e) => { if (e.target.closest('[data-all]')) { showAll = !showAll; calc(); } });
      f.c.value = 'INR';
      calc();
    },
  };

  /* =======================================================
     SIMULATOR OVERDUE
     ======================================================= */
  const MAXD = 180;
  const pos = (d) => Math.sqrt(Math.min(d, MAXD) / MAXD) * 100;
  const AGE = [{ a: 0, b: 1, l: 'Due', c: 'z-cur' }, { a: 1, b: 5, l: 'Grace', c: 'z-grc' }, { a: 5, b: 60, l: 'Delinquent', c: 'z-del' }, { a: 60, b: MAXD + 1, l: 'NAB', c: 'z-nab' }];
  const CLS = [{ a: 0, b: 1, l: 'Regular', c: 'z-cur' }, { a: 1, b: 31, l: 'Early delinquency', c: 'z-grc' }, { a: 31, b: 91, l: 'Serious', c: 'z-del' }, { a: 91, b: MAXD + 1, l: 'Potensi NPA', c: 'z-npa' }];
  const LADDER = [['SMS', 1], ['Email', 5], ['Telepon', 15], ['Kunjungan', 31], ['Legal notice', 91]];
  AA.pages.overdue = {
    title: 'Simulator overdue',
    render() {
      return `<div class="page">
        ${head('Alat', 'Simulator overdue', 'Geser jumlah hari keterlambatan (DPD) untuk melihat status aging property OVERDUE, klasifikasi pinjaman, penalty interest, dan late fee yang menumpuk.')}
        <div class="calc">
          <form class="panel calc-form" id="of" onsubmit="return false">
            <label class="field"><span>EMI yang tidak dibayar</span><input class="input" name="due" type="number" min="0" value="42603"></label>
            <div class="row2">
              <label class="field"><span>Rate normal (%)</span><input class="input" name="rate" type="number" step="0.01" value="8.25"></label>
              <label class="field"><span>Penalty spread (%)</span><input class="input" name="pen" type="number" step="0.01" value="2"></label>
            </div>
            <label class="field"><span>Late payment fee</span><input class="input" name="fee" type="number" min="0" value="500"></label>
            <div style="border-top:1px solid var(--line);padding-top:16px" class="field"><span>Hitung DPD dari tanggal</span>
              <div class="row2"><label class="field"><span style="font-weight:500">Due date</span><input class="input" type="date" name="dd" value="2026-09-05"></label><label class="field"><span style="font-weight:500">Tanggal cek</span><input class="input" type="date" name="td" value="2026-10-05"></label></div>
            </div>
          </form>
          <div style="display:flex;flex-direction:column;gap:18px;min-width:0">
            <div class="panel pad">
              <label class="field"><span>Days past due <output data-o="d"></output></span><input type="range" name="dpd" min="0" max="1000" value="408" id="dpd" aria-label="Days past due"></label>
              <div class="odt-wrap" style="margin-top:6px">
                <div class="odt-marker" id="odm"></div>
                <div class="odt-row"><span>Status aging AA</span><div class="odt-bar">${AGE.map((s) => `<div class="${s.c}" style="width:${pos(Math.min(s.b, MAXD)) - pos(s.a)}%">${s.l}</div>`).join('')}</div></div>
                <div class="odt-row"><span>Klasifikasi pinjaman</span><div class="odt-bar">${CLS.map((s) => `<div class="${s.c}" style="width:${pos(Math.min(s.b, MAXD)) - pos(s.a)}%">${s.l}</div>`).join('')}</div></div>
              </div>
              <p class="small muted" style="margin-top:6px">Status aging memakai contoh workshop 24–26 (Grace 1 hari, Delinquent 5 hari, NAB 60 hari). Klasifikasi dari Modul 8; batas NPA mengikuti regulasi. Skala hari tidak linear agar hari-hari awal terlihat.</p>
            </div>
            <div class="figures" id="ofig"></div>
            <div class="panel pad" id="onote"></div>
            <div class="panel pad"><h3 style="font-size:15px;margin-bottom:10px">Urutan collection</h3><div class="ladder" id="lad">${LADDER.map(([l]) => `<div>${l}</div>`).join('')}</div><p class="small muted" style="margin-top:8px">Ilustrasi urutan dari Modul 8; jadwal nyata mengikuti kebijakan bank.</p></div>
          </div>
        </div>
      </div>`;
    },
    mount(r, root) {
      const f = $('#of', root), dpd = $('#dpd', root);
      const v = (n) => +f[n].value || 0;
      // Slider memakai skala akar yang sama dengan bilah status
      const toD = (v) => Math.round(MAXD * Math.pow(v / 1000, 2));
      const toV = (d) => Math.round(Math.sqrt(d / MAXD) * 1000);
      function calc() {
        const d = toD(+dpd.value);
        dpd.style.setProperty('--fill', dpd.value / 10 + '%');
        $('[data-o="d"]', root).textContent = d + ' hari';
        const m = $('#odm', root); m.style.left = `calc(150px + 12px + (100% - 162px) * ${pos(d) / 100})`; m.dataset.l = 'DPD ' + d;
        if (window.innerWidth <= 600) m.style.left = `${pos(d)}%`;
        const ag = AGE.find((s) => d >= s.a && d < s.b), cl = CLS.find((s) => d >= s.a && d < s.b);
        $$('.odt-row', root).forEach((row, ri) => $$('.odt-bar div', row).forEach((el, k) => el.classList.toggle('on', (ri ? CLS : AGE)[k] === (ri ? cl : ag))));
        const due = v('due'), pen = (due * v('pen') / 100 * d) / 365, fee = d >= 1 ? v('fee') : 0;
        $('#ofig', root).innerHTML = `
          <div><small>Penalty interest</small><b>${fmt(pen, 2)}</b><span class="note">${v('pen')}% × ${d} hari / 365</span></div>
          <div><small>Late fee</small><b>${fmt(fee)}</b><span class="note">${d >= 1 ? 'dibebankan sekali' : 'belum berlaku'}</span></div>
          <div><small>Untuk regularisasi</small><b>${fmt(due + pen + fee, 2)}</b><span class="note">EMI + penalty + fee</span></div>`;
        const notes = {
          Due: `Bill masih berstatus DUE. Belum ada penalty; jika dibayar hari ini, arrangement tetap regular.`,
          Grace: `Masa grace: tagihan sudah lewat due date, DPD mulai dihitung. Bunga efektif atas tunggakan ${fmt(v('rate') + v('pen'), 2)}% (normal ${fmt(v('rate'), 2)}% + penalty ${fmt(v('pen'), 2)}%).`,
          Delinquent: `Status Delinquent: chaser notice dikirim otomatis. Penalty terus ter-accrue setiap COB; saldo pindah ke balance aging (mis. DELACCOUNT).`,
          NAB: `Non Accrual Basis: arrangement di-suspend. Bunga tetap dihitung di sisi customer tapi bank tidak membukukannya ke P&L (balance bersufiks SP), dan semua bill di bawahnya ikut di-age (age all bills).`,
        };
        $('#onote', root).innerHTML = `<div style="display:flex;gap:10px;align-items:center;margin-bottom:8px;flex-wrap:wrap"><span class="tag ${ag.l === 'Due' ? 'tag-green' : ag.l === 'Grace' ? 'tag-amber' : 'tag-red'}">${ag.l.toUpperCase()}</span><span class="tag">${cl.l}</span></div><p style="color:var(--ink-2)">${notes[ag.l]}</p><p class="small muted" style="margin-top:8px">Bayar seluruh tunggakan termasuk bunga dan charge, maka status kembali regular sesuai aturan bank.</p>`;
        $$('#lad div', root).forEach((el, k) => el.classList.toggle('on', d >= LADDER[k][1]));
      }
      const fromDates = () => {
        const a = new Date(f.dd.value + 'T00:00:00'), b = new Date(f.td.value + 'T00:00:00');
        if (isNaN(a) || isNaN(b)) return;
        dpd.value = toV(Math.max(0, Math.min(MAXD, Math.round((b - a) / 864e5)))); calc();
      };
      f.addEventListener('input', (e) => { if (e.target.name === 'dd' || e.target.name === 'td') fromDates(); else calc(); });
      dpd.addEventListener('input', calc);
      window.addEventListener('resize', calc);
      fromDates();
      return () => window.removeEventListener('resize', calc);
    },
  };

  /* =======================================================
     ASISTEN MATERI (retrieval dari konten situs)
     ======================================================= */
  const CHAT = [];
  const SUGG = ['Apa itu arrangement?', 'Bedanya tracking dan non-tracking', 'Bagaimana alokasi pembayaran?', 'Apa itu DPD?', 'Jelaskan payoff', 'STMT.ENTRY vs CATEG.ENTRY', 'Apa itu reverse & replay?', 'Interest day basis'];
  function answerFor(q) {
    if (/^(halo|hai|hi|hello|pagi|siang|sore|malam|selamat)\b/i.test(q.trim())) return { html: 'Halo! Tanyakan apa saja seputar AA Lending: property class, booking, accrual, overdue, payoff, accounting, atau istilah tertentu.' };
    const res = AA.search(q, { kinds: ['kb', 'bagian', 'property', 'istilah', 'interview'], limit: 8 });
    if (!res.length || res[0].s < 2.2) return { html: `Saya belum menemukan materi yang cocok untuk “${esc(q)}”. Coba kata kunci yang lebih spesifik, misalnya <b>payment schedule</b>, <b>NAB</b>, <b>commitment</b>, atau nama property class seperti <b>PAYMENT.RULES</b>.` };
    const d = res[0].d;
    let html = '', src = '';
    if (d.kind === 'kb') { html = `<p>${d.answer}</p>`; src = 'Ringkasan materi Arrangement Architecture – Loans'; }
    else if (d.kind === 'bagian') {
      const bl = d.blocks.slice(0, 3).map((b) => b[0] === 'p' ? `<p style="margin-bottom:8px">${b[1]}</p>` : b[0] === 'list' ? `<ul style="margin:0 0 8px;padding-left:18px">${b[1].map((x) => `<li>${x}</li>`).join('')}</ul>` : b[0] === 'tbl' ? AA.tableHTML(b[1], b[2]) : b[0] === 'box' ? `<div class="formula">${b[1]}</div>` : b[0] === 'flow' ? `<p style="margin-bottom:8px">${b[1].join(' → ')}</p>` : '').join('');
      html = `<p style="margin-bottom:8px"><b>${esc(d.title)}</b></p>${bl}`;
      src = `<a href="${d.route}">${esc(d.sub)}, bagian “${esc(d.title)}”</a>`;
    } else if (d.kind === 'property') { html = `<p style="margin-bottom:8px"><b class="mono">${d.pc.id}</b>: ${esc(d.pc.klik)}</p><ul style="margin:0;padding-left:18px">${d.pc.pts.slice(0, 4).map((x) => `<li>${x}</li>`).join('')}</ul>`; src = `<a href="${d.route}">Property class ${d.pc.id}</a>`; }
    else if (d.kind === 'istilah') { html = `<p><b>${esc(d.title)}</b>: ${d.def}</p>`; src = `<a href="${d.route}">Glosarium</a>`; }
    else if (d.kind === 'interview') { html = `<p style="margin-bottom:6px"><b>${esc(d.title)}</b></p><p>${d.answer}</p>`; src = `<a href="${d.route}">${esc(d.sub)}</a>`; }
    const seen = new Set([d.title.toLowerCase()]);
    const rel = res.slice(1).filter((x) => { const k = x.d.title.toLowerCase(); if (!x.d.route || x.s < res[0].s * 0.35 || seen.has(k)) return false; seen.add(k); return true; }).slice(0, 3);
    return { html, src, rel };
  }
  AA.pages.asisten = {
    title: 'Asisten materi',
    render() {
      return `<div class="page">
        ${head('Alat', 'Asisten materi', 'Menjawab dengan mencari di seluruh materi situs ini: 14 modul, property class, glosarium, bank interview, dan ringkasan dokumen AA Loans. Setiap jawaban menyertakan tautan ke sumbernya.')}
        <div class="chat">
          <div class="chat-log" id="clog" aria-live="polite"></div>
          <div class="chat-sugg">${SUGG.map((s) => `<button class="chip" data-s="${esc(s)}">${esc(s)}</button>`).join('')}</div>
          <form class="chat-in" id="cform"><input class="input" id="cin" placeholder="Tulis pertanyaan, mis. kapan accrual mulai?" autocomplete="off"><button class="btn" aria-label="Kirim">${icon('send', 'i-sm')}Kirim</button></form>
        </div>
      </div>`;
    },
    mount(r, root) {
      const log = $('#clog', root);
      const add = (m) => {
        const el = document.createElement('div');
        el.className = 'msg ' + m.who;
        el.innerHTML = m.who === 'user' ? esc(m.text) : m.html + (m.src ? `<div class="src">Sumber: ${m.src}</div>` : '') + (m.rel && m.rel.length ? `<div class="rel">${m.rel.map((x) => `<a class="chip" href="${x.d.route}" style="text-decoration:none">${esc(x.d.title)}</a>`).join('')}</div>` : '');
        log.appendChild(el); log.scrollTop = log.scrollHeight;
      };
      if (!CHAT.length) CHAT.push({ who: 'bot', html: 'Halo, saya asisten materi AA Loan. Tanyakan konsep, activity, atau istilah, dan saya carikan jawabannya dari materi kursus.' });
      CHAT.forEach(add);
      const send = (q) => {
        q = q.trim(); if (!q) return;
        const um = { who: 'user', text: q }; CHAT.push(um); add(um);
        const typing = document.createElement('div'); typing.className = 'msg bot'; typing.innerHTML = '<span class="typing"><i></i><i></i><i></i></span>'; log.appendChild(typing); log.scrollTop = log.scrollHeight;
        setTimeout(() => { typing.remove(); const a = answerFor(q); const bm = { who: 'bot', ...a }; CHAT.push(bm); add(bm); }, AA.reduceMotion() ? 0 : 420);
      };
      $('#cform', root).addEventListener('submit', (e) => { e.preventDefault(); const i = $('#cin', root); send(i.value); i.value = ''; });
      $('.chat-sugg', root).addEventListener('click', (e) => { const b = e.target.closest('[data-s]'); if (b) send(b.dataset.s); });
      if (r.query.q) { send(r.query.q); history.replaceState(null, '', '#/asisten'); }
      if (window.innerWidth > 760) $('#cin', root).focus({ preventScroll: true });
    },
  };
})();
