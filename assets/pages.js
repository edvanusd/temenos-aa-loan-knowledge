/* =========================================================
   AA Loan KB — halaman: beranda, siklus arrangement, pembaca modul,
   dan halaman pendalaman (konsep, tabel, property, produk,
   aktivitas, balance).
   ========================================================= */
(function () {
  'use strict';
  const AA = window.AA, D = AA.D;
  const { $, $$, esc, strip, fmt, slug, icon, Store } = AA;

  /* =======================================================
     Siklus hidup arrangement (komponen tanda tangan)
     Satu pinjaman ilustratif: commitment 100.000 → closure.
     ======================================================= */
  const LC = [
    { short: 'Booking', title: 'Arrangement dibuat', act: 'LENDING-NEW-ARRANGEMENT', mod: 'm4',
      desc: 'Customer di-booking dari Product Catalog dengan commitment Rp100 juta. Belum ada dana yang keluar, jadi commitment dicatat sebagai saldo kontingen.',
      status: 'Aktif, belum ada pencairan',
      bal: { CURCOMMIT: 100000000 },
      je: [['Dr', 'CURCOMMIT (kontingen)', 100000000], ['Cr', 'CURCOMMITBL (penyeimbang)', 100000000]] },
    { short: 'Disbursement', title: 'Dana dicairkan', act: 'LENDING-DISBURSE-COMMITMENT', mod: 'm5',
      desc: 'Rp75 juta dicairkan ke rekening customer. Commitment yang tersedia turun, dan saldo principal berjalan (CURACCOUNT) terbentuk.',
      status: 'Aktif, 75% commitment terpakai',
      bal: { CURCOMMIT: 25000000, CURACCOUNT: 75000000 },
      je: [['Dr', 'CURACCOUNT (pinjaman)', 75000000], ['Cr', 'Rekening customer', 75000000], ['Dr', 'CURCOMMITBL', 75000000], ['Cr', 'CURCOMMIT', 75000000]] },
    { short: 'Accrual', title: 'Bunga di-accrue saat COB', act: 'COB: interest accrual', mod: 'm6',
      desc: 'Setiap Close of Business bunga harian dihitung dan diakui sebagai pendapatan walau customer belum membayar. Dengan bunga 8% per tahun, sebulan terkumpul Rp500.000.',
      status: 'Aktif, bunga berjalan',
      bal: { CURCOMMIT: 25000000, CURACCOUNT: 75000000, ACCPRINCIPALINT: 500000 },
      je: [['Dr', 'ACCPRINCIPALINT', 500000], ['Cr', 'P&L pendapatan bunga', 500000]] },
    { short: 'Make due', title: 'Tagihan jatuh tempo', act: 'COB: Payment Schedule', mod: 'm7',
      desc: 'Pada tanggal jadwal, bill Rp2 juta dibuat: Rp1,5 juta principal dari CURACCOUNT dan Rp500.000 bunga dari ACCPRINCIPALINT pindah ke saldo DUE.',
      status: 'Aktif, ada bill jatuh tempo',
      bal: { CURCOMMIT: 25000000, CURACCOUNT: 73500000, DUEACCOUNT: 1500000, DUEPRINCIPALINT: 500000 },
      je: [['Dr', 'DUEACCOUNT', 1500000], ['Cr', 'CURACCOUNT', 1500000], ['Dr', 'DUEPRINCIPALINT', 500000], ['Cr', 'ACCPRINCIPALINT', 500000]] },
    { short: 'Overdue', title: 'Bill tidak dibayar, di-age', act: 'LENDING-AGE-OVERDUE', mod: 'm8', risk: true,
      desc: 'Due date terlewat. Property OVERDUE memindahkan saldo DUE ke status aging (di sini OD1); DPD mulai dihitung dan penalty bisa berlaku.',
      status: 'Overdue, DPD berjalan',
      bal: { CURCOMMIT: 25000000, CURACCOUNT: 73500000, OD1ACCOUNT: 1500000, OD1PRINCIPALINT: 500000 },
      je: [['Dr', 'OD1ACCOUNT', 1500000], ['Cr', 'DUEACCOUNT', 1500000], ['Dr', 'OD1PRINCIPALINT', 500000], ['Cr', 'DUEPRINCIPALINT', 500000]] },
    { short: 'Repayment', title: 'Customer membayar Rp3 juta', act: 'Repayment: Payment Rules', mod: 'm7',
      desc: 'Payment Rules mengalokasikan dana: bunga overdue dulu, lalu principal overdue, dan sisanya Rp1 juta mengurangi principal berjalan.',
      status: 'Aktif, tunggakan lunas',
      bal: { CURCOMMIT: 25000000, CURACCOUNT: 72500000 },
      je: [['Dr', 'Rekening customer', 3000000], ['Cr', 'OD1PRINCIPALINT', 500000], ['Cr', 'OD1ACCOUNT', 1500000], ['Cr', 'CURACCOUNT', 1000000]] },
    { short: 'Payoff', title: 'Pelunasan penuh', act: 'LENDING-CALCULATE-PAYOFF', mod: 'm10',
      desc: 'Payoff disimulasikan untuk mendapat jumlah pelunasan, lalu customer melunasi seluruh principal Rp72,5 juta. Bunga berjalan diabaikan di ilustrasi ini agar angka tetap sederhana.',
      status: 'Lunas, menunggu closure',
      bal: { CURCOMMIT: 25000000 },
      je: [['Dr', 'Rekening customer', 72500000], ['Cr', 'CURACCOUNT', 72500000]] },
    { short: 'Closure', title: 'Arrangement ditutup', act: 'CLOSURE (tipe BALANCE)', mod: 'm10',
      desc: 'Semua saldo nol, commitment sisa dilepas, dan property CLOSURE menutup arrangement karena Closure Type = BALANCE.',
      status: 'Ditutup',
      bal: {},
      je: [['Dr', 'CURCOMMITBL', 25000000], ['Cr', 'CURCOMMIT', 25000000]] },
  ];
  const BAL_GROUPS = [
    { title: 'Commitment & principal', max: 100000000, label: 'Rp100 juta', items: [['CURCOMMIT', 'commit'], ['CURACCOUNT', 'cur']] },
    { title: 'Bunga & tagihan', max: 2000000, label: 'Rp2 juta', items: [['ACCPRINCIPALINT', 'acc'], ['DUEACCOUNT', 'due'], ['DUEPRINCIPALINT', 'due'], ['OD1ACCOUNT', 'od'], ['OD1PRINCIPALINT', 'od']] },
  ];
  AA.LC = LC;

  function journalHTML(rows, opts = {}) {
    return `<div class="journal" role="table" aria-label="Jurnal">
      <div class="journal-head" role="row"><span></span><span>Akun / balance</span><span>Debit (Rp)</span><span>Kredit (Rp)</span></div>
      ${rows.map(([s, a, v]) => { const amt = typeof v === 'number' ? fmt(v) : String(v).replace(/^Rp\s?/, ''); return `<div class="journal-row ${s.toLowerCase()}" role="row"><span class="side">${s}</span><span class="acct">${opts.raw ? a : esc(a)}</span><span class="amt">${s === 'Dr' ? amt : ''}</span><span class="amt">${s === 'Cr' ? amt : ''}</span></div>`; }).join('')}
    </div>`;
  }
  AA.journalHTML = journalHTML;

  function lifecycleHTML(id, opts = {}) {
    return `
    <section class="lc" id="${id}" aria-label="Simulasi siklus hidup arrangement">
      <div class="lc-top">
        <div>
          <h2>${opts.title || 'Satu arrangement, dari booking sampai closure'}</h2>
          <p>${opts.sub || 'Pilih tahap untuk melihat activity, jurnal, dan perpindahan saldo balance-nya.'}</p>
        </div>
        <div class="lc-ctrl">
          <button class="iconbtn" data-lc="prev" aria-label="Tahap sebelumnya">${icon('left')}</button>
          <button class="btn btn-line btn-sm" data-lc="play"><span class="lc-play-ic">${icon('play', 'i-sm i-fill')}</span><span class="lc-play-tx">Putar</span></button>
          <button class="iconbtn" data-lc="next" aria-label="Tahap berikutnya">${icon('right')}</button>
        </div>
      </div>
      <div class="lc-track" style="--n:${LC.length}" role="tablist">
        <div class="lc-fill"></div>
        ${LC.map((s, i) => `<button class="lc-step${s.risk ? ' risk' : ''}" role="tab" data-i="${i}" aria-label="${i + 1}. ${esc(s.short)}"><span class="lc-dot">${i + 1}</span><span>${esc(s.short)}</span></button>`).join('')}
      </div>
      <div class="lc-body">
        <div class="lc-detail" aria-live="polite"></div>
        <div class="lc-balances">
          ${BAL_GROUPS.map((g) => `<div class="lc-group"><h4>${g.title}<span>skala ${g.label}</span></h4>
            ${g.items.map(([n, k]) => `<div class="balrow k-${k} zero" data-b="${n}"><span class="bn">${n}</span><span class="bt"><i></i></span><span class="bv">0</span></div>`).join('')}
          </div>`).join('')}
          <div class="lc-status">${icon('flag', 'i-sm')}<span>Status: <b class="lc-st"></b></span></div>
          ${opts.detailed ? `<div class="lc-check small muted" style="margin-top:8px"></div>` : ''}
        </div>
      </div>
      ${opts.detailed ? `<div class="pad" style="border-top:1px solid var(--line)"><h3 style="font-size:15px;margin-bottom:10px">Buku jurnal kumulatif</h3><div class="ledlog"></div></div>` : ''}
    </section>`;
  }

  function mountLifecycle(root, opts = {}) {
    let idx = opts.start || 0, timer = null, prev = {};
    const steps = $$('.lc-step', root), detail = $('.lc-detail', root), fill = $('.lc-fill', root);
    const playTx = $('.lc-play-tx', root), playIc = $('.lc-play-ic', root);
    const animNum = (el, from, to) => {
      if (AA.reduceMotion() || from === to) { el.textContent = fmt(to); return; }
      const t0 = performance.now(), dur = 550;
      const step = (t) => { const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3); el.textContent = fmt(Math.round(from + (to - from) * e)); if (p < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    };
    function show(i, focus) {
      idx = Math.max(0, Math.min(LC.length - 1, i));
      const s = LC[idx];
      steps.forEach((b, j) => { b.classList.toggle('now', j === idx); b.classList.toggle('past', j < idx); b.setAttribute('aria-selected', String(j === idx)); });
      if (focus) steps[idx].focus();
      const track = root.querySelector('.lc-track');
      if (track.scrollWidth > track.clientWidth + 4) track.scrollTo({ left: steps[idx].offsetLeft - track.clientWidth / 2 + 39, behavior: AA.reduceMotion() ? 'auto' : 'smooth' });
      const trackW = track.clientWidth - 48;
      fill.style.width = (trackW / LC.length) * idx + 'px';
      const m = AA.mod(s.mod);
      detail.innerHTML = `
        <span class="tag ${s.risk ? 'tag-red' : 'tag-blue'}">${esc(s.act)}</span>
        <h3>${idx + 1}. ${esc(s.title)}</h3>
        <p>${esc(s.desc)}</p>
        ${journalHTML(s.je)}
        <a class="btn btn-quiet btn-sm wrap" href="#/modul/${m.key}">${icon('book', 'i-sm')}Pelajari di Modul ${m.n}: ${esc(m.title)}</a>`;
      BAL_GROUPS.forEach((g) => g.items.forEach(([n]) => {
        const row = $(`.balrow[data-b="${n}"]`, root);
        const v = s.bal[n] || 0, was = prev[n] || 0;
        row.classList.toggle('zero', v === 0);
        $('i', row).style.width = (v ? Math.max(2.5, (v / g.max) * 100) : 0) + '%';
        animNum($('.bv', row), was, v);
        if (v !== was) { row.classList.remove('flash'); void row.offsetWidth; row.classList.add('flash'); }
      }));
      prev = Object.assign({}, s.bal);
      $('.lc-st', root).textContent = s.status;
      if (opts.detailed) {
        let dr = 0, cr = 0; const rows = [];
        LC.slice(0, idx + 1).forEach((st, k) => st.je.forEach(([sd, a, v]) => { rows.push([sd, `<span class="muted mono" style="font-size:12px">T${k + 1}</span> ${esc(a)}`, v]); if (sd === 'Dr') dr += v; else cr += v; }));
        $('.ledlog', root).innerHTML = journalHTML(rows, { raw: true });
        $('.lc-check', root).innerHTML = `Total debit ${fmt(dr)} = total kredit ${fmt(cr)} ${dr === cr ? '<span style="color:var(--green)">seimbang</span>' : ''}`;
      }
    }
    function stop() { clearInterval(timer); timer = null; playTx.textContent = 'Putar'; playIc.innerHTML = icon('play', 'i-sm i-fill'); }
    function play() {
      if (timer) return stop();
      if (idx >= LC.length - 1) show(0);
      playTx.textContent = 'Jeda'; playIc.innerHTML = icon('pause', 'i-sm');
      timer = setInterval(() => { if (idx >= LC.length - 1) return stop(); show(idx + 1); }, 2800);
    }
    root.addEventListener('click', (e) => {
      const st = e.target.closest('.lc-step');
      if (st) { stop(); show(+st.dataset.i); return; }
      const c = e.target.closest('[data-lc]');
      if (!c) return;
      if (c.dataset.lc === 'play') play();
      else { stop(); show(idx + (c.dataset.lc === 'next' ? 1 : -1)); }
    });
    $('.lc-track', root).addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); stop(); show(idx + 1, true); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); stop(); show(idx - 1, true); }
    });
    const onResize = () => show(idx);
    window.addEventListener('resize', onResize);
    show(idx);
    // Satu momen gerak: putar otomatis sekali saat pertama terlihat
    let io = null;
    if (opts.autoplay && !AA.reduceMotion() && 'IntersectionObserver' in window) {
      io = new IntersectionObserver((en) => { if (en[0].isIntersecting) { io.disconnect(); io = null; setTimeout(() => { if (!timer && idx === 0) play(); }, 900); } }, { threshold: 0.5 });
      io.observe(root);
    }
    return () => { stop(); window.removeEventListener('resize', onResize); if (io) io.disconnect(); };
  }

  /* =======================================================
     BERANDA
     ======================================================= */
  AA.pages.home = {
    title: 'Beranda',
    render() {
      const h = new Date().getHours();
      const greet = h < 11 ? 'Selamat pagi' : h < 15 ? 'Selamat siang' : h < 19 ? 'Selamat sore' : 'Selamat malam';
      const date = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      const next = AA.nextModule(), done = AA.doneCount(), total = AA.MODS.length;
      const allDone = done === total;
      const q = Store.data.quiz, best = q.attempts.length ? Math.max(...q.attempts.map((a) => Math.round((a.s / a.t) * 100))) : null;
      const ivqTotal = AA.interviewItems().length, ivqKnown = Object.keys(Store.data.ivqKnown).length;
      const glKnown = Object.keys(Store.data.glKnown).length, glTotal = D.GLOSSARY.length;
      const streak = AA.streak();
      const stat = (lbl, val, pct, green) => `<div class="stat"><span class="lbl">${lbl}</span><span class="val">${val}</span><div class="bar${green ? ' green' : ''}"><i style="width:${pct}%"></i></div></div>`;
      const tools = [AA.NAV.deep[2], AA.NAV.practice[0], AA.NAV.practice[1], AA.NAV.tools[0], AA.NAV.tools[1], AA.NAV.tools[2]];
      return `
      <div class="page">
        <div class="dash-head">
          <div><h1>${greet}${AA.Cloud && AA.Cloud.user ? ', ' + esc(AA.Cloud.firstName()) : ''}</h1><p class="date">${date}</p></div>
          <div class="btn-row">
            <button class="btn btn-line" data-open-palette>${icon('search', 'i-sm')}Cari materi</button>
            <a class="btn" href="#/modul/${next.key}">${allDone ? 'Ulas modul terakhir' : done ? `Lanjutkan Modul ${next.n}` : 'Mulai Modul 1'}</a>
          </div>
        </div>

        ${lifecycleHTML('lcHome')}

        <div class="dash-grid">
          <div class="panel resume">
            <span class="kicker">${allDone ? 'Semua modul selesai' : done ? 'Lanjutkan dari sini' : 'Mulai dari sini'}</span>
            <h3>Modul ${next.n}: ${esc(next.title)}</h3>
            <p>${esc(next.part)}, sekitar ${next.minutes} menit baca. Bagian di dalamnya: ${next.sections.slice(0, 4).map((s) => esc(s.title)).join(', ')}${next.sections.length > 4 ? ', dan lainnya' : ''}.</p>
            <div class="bar green"><i style="width:${(done / total) * 100}%"></i></div>
            <div class="btn-row"><a class="btn" href="#/modul/${next.key}">Buka modul</a><a class="btn btn-quiet" href="#/quiz">Uji pemahaman di quiz</a></div>
          </div>
          <div class="panel stats">
            <h3>Progres kamu</h3>
            ${stat('Modul selesai', `${done}/${total}`, (done / total) * 100, true)}
            ${stat('Skor quiz terbaik', best === null ? 'belum ada' : best + '%', best || 0)}
            ${stat('Jawaban interview dikuasai', `${ivqKnown}/${ivqTotal}`, (ivqKnown / ivqTotal) * 100)}
            ${stat('Istilah dikuasai', `${glKnown}/${glTotal}`, (glKnown / glTotal) * 100)}
            <p class="small muted">${streak > 1 ? `Kamu belajar ${streak} hari berturut-turut.` : (AA.Cloud && AA.Cloud.user ? 'Progres tersimpan di akunmu.' : 'Progres tersimpan di browser ini.')}</p>
          </div>
        </div>

        <section class="section">
          <div class="section-head"><h2>Peta kursus</h2><p>14 modul berurutan, dari pengenalan sampai end-to-end testing</p></div>
          <nav class="cmap" aria-label="Peta modul">
            ${AA.MODS.map((m) => `<a href="#/modul/${m.key}" class="${Store.data.done[m.key] ? 'done' : ''}${m.key === next.key && !allDone ? ' next' : ''}"><span class="n">${String(m.n).padStart(2, '0')}</span><span class="t">${esc(m.title.replace(/\s*\(.*\)$/, ''))}</span><span class="part">${m.part}</span></a>`).join('')}
          </nav>
        </section>

        <section class="section">
          <div class="section-head"><h2>Latihan & alat</h2></div>
          <div class="tools">
            ${tools.map((t) => `<a href="#/${t.key}"><span class="ti">${icon(t.icon)}</span><span><b>${esc(t.title)}</b><small>${esc(t.desc)}</small></span></a>`).join('')}
          </div>
        </section>
      </div>`;
    },
    mount(r, root) { return mountLifecycle($('#lcHome', root), { autoplay: true }); },
  };

  /* =======================================================
     PEMBACA MODUL
     ======================================================= */
  const isNumCell = (c) => /^[\s₹$€£Rp]*[−\-+]?[\d][\d.,\s]*(%|\s?(juta|miliar|jt|rb|M))?$/i.test(strip(c)) && /\d/.test(c);
  function tableHTML(t, note) {
    const head = t[0], rows = t.slice(1);
    const isJournal = /^entry$/i.test(strip(head[0])) && rows.every((r) => /^(Debit|Credit)\s*[—-]/.test(strip(r[0])));
    if (isJournal) {
      return journalHTML(rows.map((r) => { const s = strip(r[0]); const dr = /^Debit/.test(s); return [dr ? 'Dr' : 'Cr', s.replace(/^(Debit|Credit)\s*[—-]\s*/, ''), strip(r[1])]; })) + (note ? `<p class="tbl-note">${note}</p>` : '');
    }
    const numCol = head.map((_, ci) => ci > 0 && rows.every((r) => r[ci] === undefined || isNumCell(r[ci])));
    return `<div class="tbl-wrap"><table class="ledger"><thead><tr>${head.map((h, ci) => `<th${numCol[ci] ? ' class="num"' : ''}>${h}</th>`).join('')}</tr></thead>
      <tbody>${rows.map((r) => `<tr>${r.map((c, ci) => `<td${numCol[ci] ? ' class="num"' : ''}>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>${note ? `<p class="tbl-note">${note}</p>` : ''}`;
  }
  AA.tableHTML = tableHTML;

  function flowHTML(steps, note, opts = {}) {
    return `<div class="flow" data-flow>
      <ol class="flow-steps">${steps.map((s, i) => `<li><button type="button" data-i="${i}"><span class="fn">${i + 1}</span><span>${s}</span></button></li>`).join('')}</ol>
      <div class="flow-foot">${note ? `<p>${note}</p>` : '<p class="muted small">Klik langkah, atau telusuri alurnya berurutan.</p>'}
        <button type="button" class="btn btn-line btn-sm" data-flow-play>${icon('play', 'i-sm i-fill')}${opts.label || 'Telusuri alur'}</button></div>
    </div>`;
  }
  AA.flowHTML = flowHTML;
  function mountFlows(root) {
    const timers = [];
    $$('[data-flow]', root).forEach((f) => {
      const lis = $$('.flow-steps li', f);
      const set = (k) => lis.forEach((li, j) => { li.classList.toggle('now', j === k); li.classList.toggle('past', j < k); });
      f.addEventListener('click', (e) => {
        const b = e.target.closest('.flow-steps button');
        if (b) { set(+b.dataset.i); return; }
        if (e.target.closest('[data-flow-play]')) {
          let k = 0; set(0);
          const t = setInterval(() => { k++; if (k >= lis.length) { clearInterval(t); return; } set(k); }, AA.reduceMotion() ? 50 : 650);
          timers.push(t);
        }
      });
    });
    return () => timers.forEach(clearInterval);
  }
  AA.mountFlows = mountFlows;

  function qaHTML(items, opts = {}) {
    return items.map(([q, a], i) => `<div class="qa${opts.openAll ? ' open' : ''}"><button class="q" aria-expanded="${!!opts.openAll}"><span>${q}</span>${icon('right', 'chev i-sm')}</button><div class="a">${a}</div></div>`).join('');
  }
  AA.qaHTML = qaHTML;
  function mountQA(root) {
    root.addEventListener('click', (e) => {
      const b = e.target.closest('.qa > button.q');
      if (!b) return;
      const qa = b.parentElement; const open = !qa.classList.contains('open');
      qa.classList.toggle('open', open); b.setAttribute('aria-expanded', String(open));
    });
  }
  AA.mountQA = mountQA;

  // Widget kecil di dalam modul untuk rumus yang bisa dicoba
  function miniFor(text) {
    const t = strip(text);
    if (/Daily Interest/i.test(t)) return `<div class="mini" data-mini="daily"><h4>${icon('calc', 'i-sm')}Coba hitung bunga harian</h4>
      <div class="mini-grid">
        <label class="field"><span>Outstanding principal (Rp)</span><input class="input" type="text" inputmode="numeric" data-money value="500.000.000" data-k="p"></label>
        <label class="field"><span>Rate per tahun (%)</span><input class="input" type="number" min="0" step="0.01" value="8.25" data-k="r"></label>
        <label class="field"><span>Basis hari</span><select class="input" data-k="b"><option value="365">365</option><option value="360">360</option><option value="366">366</option></select></label>
      </div><div class="mini-out"></div></div>`;
    if (/LTV/.test(t)) return `<div class="mini" data-mini="ltv"><h4>${icon('calc', 'i-sm')}Coba hitung LTV</h4>
      <div class="mini-grid">
        <label class="field"><span>Loan amount (Rp)</span><input class="input" type="text" inputmode="numeric" data-money value="500.000.000" data-k="l"></label>
        <label class="field"><span>Nilai collateral (Rp)</span><input class="input" type="text" inputmode="numeric" data-money value="750.000.000" data-k="c"></label>
        <label class="field"><span>Batas LTV bank (%)</span><input class="input" type="number" min="1" value="80" data-k="m"></label>
      </div><div class="mini-out"></div></div>`;
    if (/penalty/i.test(t)) return `<div class="mini"><h4>${icon('alert', 'i-sm')}Lihat efeknya per hari keterlambatan</h4><p class="small">Simulator overdue menghitung penalty, late fee, dan status aging untuk setiap DPD.</p><div style="margin-top:10px"><a class="btn btn-line btn-sm" href="#/overdue">Buka simulator overdue</a></div></div>`;
    return '';
  }
  function mountMinis(root) {
    $$('[data-mini]', root).forEach((w) => {
      const out = $('.mini-out', w);
      const v = (k) => AA.num($(`[data-k="${k}"]`, w).value);
      AA.bindMoney(w);
      const calc = () => {
        if (w.dataset.mini === 'daily') {
          const d = (v('p') * v('r')) / 100 / v('b');
          out.innerHTML = `Bunga per hari <b>${AA.rp(d)}</b>, sebulan 30 hari ≈ <b>${AA.rp(d * 30)}</b>, setahun ≈ <b>${AA.rp(d * v('b'))}</b>.`;
        } else {
          const l = (v('l') / v('c')) * 100, ok = l <= v('m');
          out.innerHTML = `LTV = <b>${fmt(l, 2)}%</b>. ${ok ? `<span style="color:var(--green);font-weight:650">Di bawah batas ${fmt(v('m'))}%, pinjaman memenuhi syarat.</span>` : `<span style="color:var(--red);font-weight:650">Melebihi batas ${fmt(v('m'))}%, perlu tambahan collateral atau loan amount diturunkan.</span>`}`;
        }
      };
      w.addEventListener('input', calc); calc();
    });
  }

  function blockHTML(b, ctx) {
    switch (b[0]) {
      case 'h': return `<h2 id="s-${slug(b[1])}">${b[1]}</h2>`;
      case 'p': return `<p>${b[1]}</p>`;
      case 'box': return `<div class="formula">${b[1]}</div>${miniFor(b[1])}`;
      case 'list': return `<ul class="list">${b[1].map((x) => `<li>${x}</li>`).join('')}</ul>`;
      case 'tbl': return tableHTML(b[1], b[2]);
      case 'flow': return flowHTML(b[1], b[2]);
      case 'iq': return `<section class="iq" id="s-interview"><div class="iq-head"><h3>${icon('mic', 'i-sm')}Pertanyaan interview modul ini</h3><a class="btn btn-quiet btn-sm" href="#/interview?mod=${ctx.key}">Latih sebagai kartu</a></div>${qaHTML(b[1])}</section>`;
      default: return '';
    }
  }
  AA.blockHTML = blockHTML;

  AA.pages.modul = {
    title: (r) => AA.mod(r.param).title,
    render(r) {
      const m = AA.mod(r.param), i = m.n - 1;
      const prev = AA.MODS[i - 1], next = AA.MODS[i + 1];
      const done = !!Store.data.done[m.key];
      const hasIQ = m.body.some((b) => b[0] === 'iq');
      Store.data.last = m.key; Store.save();
      return `
      <div class="reader">
        <article class="article">
          <div class="crumbs"><a href="#/">Beranda</a><span class="sep">/</span><span>${m.part}</span><span class="sep">/</span><span>Modul ${m.n} dari ${AA.MODS.length}</span></div>
          <h1 class="page-title">${esc(m.title)}</h1>
          <div class="mod-meta">
            <span>${icon('clock')}${m.minutes} menit baca</span>
            <span>${icon('list')}${m.sections.length} bagian</span>
            ${done ? `<span class="status-done">${icon('check')}Selesai</span>` : ''}
          </div>
          <div class="prose">${m.body.map((b) => blockHTML(b, m)).join('')}</div>
          <div class="mod-end">
            <div class="mod-done${done ? ' is-done' : ''}">
              <div><b>${done ? 'Modul ini sudah kamu selesaikan' : 'Sudah paham materi ini?'}</b><p class="small muted">${done ? 'Progres tercatat di peta kursus.' : 'Tandai selesai agar progres di beranda ikut terhitung.'}</p></div>
              <button class="btn ${done ? 'btn-line' : ''}" data-done>${done ? 'Tandai belum selesai' : `${icon('check', 'i-sm')}Tandai selesai`}</button>
            </div>
            <nav class="mod-nav" aria-label="Modul sebelumnya dan berikutnya">
              ${prev ? `<a href="#/modul/${prev.key}"><small>Sebelumnya, Modul ${prev.n}</small><b>${esc(prev.title)}</b></a>` : ''}
              ${next ? `<a class="next" href="#/modul/${next.key}"><small>Berikutnya, Modul ${next.n}</small><b>${esc(next.title)}</b></a>` : `<a class="next" href="#/interview"><small>Selesai semua modul</small><b>Latihan bank interview</b></a>`}
            </nav>
          </div>
        </article>
        <aside class="toc" aria-label="Di halaman ini">
          <h4>Di halaman ini</h4>
          <ol>${m.sections.map((s) => `<li><a href="#/modul/${m.key}?s=${slug(s.title)}" data-sec="s-${slug(s.title)}">${esc(s.title)}</a></li>`).join('')}${hasIQ ? `<li><a href="#/modul/${m.key}?s=interview" data-sec="s-interview">Pertanyaan interview</a></li>` : ''}</ol>
          <div class="toc-progress"><div class="small muted" style="margin-bottom:6px">Progres kursus: ${AA.doneCount()}/${AA.MODS.length}</div><div class="bar green"><i style="width:${(AA.doneCount() / AA.MODS.length) * 100}%"></i></div></div>
        </aside>
      </div>`;
    },
    mount(r, root) {
      const m = AA.mod(r.param);
      const offFlows = mountFlows(root);
      mountQA(root);
      mountMinis(root);
      $('[data-done]', root).addEventListener('click', () => {
        const was = !!Store.data.done[m.key];
        if (was) delete Store.data.done[m.key]; else Store.data.done[m.key] = Date.now();
        Store.save();
        AA.sync({ t: 'module', key: m.key, done: !was });
        AA.toast(was ? 'Tanda selesai dihapus' : `Modul ${m.n} ditandai selesai`);
        const y = window.scrollY; AA.rerender(); window.scrollTo(0, y);
      });
      // Klik TOC: gulir halus tanpa memicu render ulang
      $$('.toc a', root).forEach((a) => a.addEventListener('click', (e) => {
        e.preventDefault();
        const el = document.getElementById(a.dataset.sec);
        if (el) { el.scrollIntoView({ behavior: AA.reduceMotion() ? 'auto' : 'smooth' }); history.replaceState(null, '', a.getAttribute('href')); }
      }));
      // Scroll-spy & bilah progres baca
      const heads = $$('.prose h2[id], .iq[id]', root);
      const links = $$('.toc a', root);
      const bar = $('#readbar');
      const onScroll = () => {
        const art = $('.article', root);
        const total = art.offsetHeight - window.innerHeight * 0.6;
        const p = Math.max(0, Math.min(1, (window.scrollY - art.offsetTop + 80) / total));
        bar.style.width = p * 100 + '%';
        let cur = heads[0];
        heads.forEach((h) => { if (h.getBoundingClientRect().top < 140) cur = h; });
        links.forEach((l) => l.classList.toggle('active', cur && l.dataset.sec === cur.id));
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      if (r.query.s) {
        const el = document.getElementById('s-' + r.query.s);
        if (el) requestAnimationFrame(() => el.scrollIntoView());
      }
      onScroll();
      return () => { offFlows(); window.removeEventListener('scroll', onScroll); bar.style.width = '0'; };
    },
    keepScroll: (r) => !!r.query.s,
  };

  /* =======================================================
     PENDALAMAN 1 — KONSEP DASAR
     ======================================================= */
  const DAY_BASIS = [
    ['A', '360/360', '—', '30/360'], ['A1', '360/360', '30 hari tiap bulan', null], ['A2', '360/360', '360 hari/tahun; bunga Februari dihitung di hari terakhir', null],
    ['B', '366/360', '—', 'act/360'], ['C', '366/366', '—', 'act/act'], ['D', '360/366', '—', '30/act'], ['E', '366/365', '—', 'act/365'],
    ['F', '360/365', 'bunga Februari dihitung di hari kedua terakhir', '30/365'], ['H', '30/356', '—', null], ['S', 'Special', '—', null],
  ];
  function days30(a, b) {
    let d1 = a.getDate(), d2 = b.getDate();
    if (d1 === 31) d1 = 30;
    if (d2 === 31 && d1 === 30) d2 = 30;
    return 360 * (b.getFullYear() - a.getFullYear()) + 30 * (b.getMonth() - a.getMonth()) + (d2 - d1);
  }
  const daysActual = (a, b) => Math.round((b - a) / 864e5);
  const yearLen = (y) => ((y % 4 === 0 && y % 100 !== 0) || y % 400 === 0 ? 366 : 365);

  AA.pages.konsep = {
    title: 'Konsep dasar AA',
    render() {
      return `<div class="page page-narrow">
        <div class="crumbs"><a href="#/">Beranda</a><span class="sep">/</span><span>Pendalaman</span></div>
        <h1 class="page-title">Konsep dasar AA</h1>
        <p class="lede">AA (Arrangement Architecture) adalah cara T24 membangun produk perbankan dari komponen yang reusable, yaitu Property Class. Sebuah Arrangement, misalnya pinjaman, adalah kontrak yang dibentuk dari Product, Product Group, dan Product Line.</p>

        <section class="section">
          <div class="section-head"><h2>Dari product line sampai saldo</h2></div>
          ${flowHTML(['<span class="mono">PRODUCT LINE</span> (LENDING)', 'PRODUCT GROUP', 'PRODUCT <span class="mono">(AA.PRODUCT.DESIGNER)</span>', 'ARRANGEMENT', 'ACTIVITIES', 'BALANCES / BILLS'], 'Setiap perubahan pada arrangement terjadi lewat activity, dan setiap activity menggerakkan balance.')}
        </section>

        <section class="section content">
          <div class="section-head"><h2>AA Loan, gambaran produk</h2></div>
          <ul class="list">
            <li><b>Arrangement Level</b>: Constant / Fixed / Floating; Periodic / Linear / Repayment; user-defined Band / Limit / Bullet; Mixed; Actual.</li>
            <li><b>Arrangement Conditions</b> diturunkan dari Loan Product (product condition).</li>
            <li><b>Disbursement</b>: Single atau Multiple, Negotiable atau Non-Negotiable.</li>
            <li>Loan dengan <b>Tracking</b> atau <b>Non-Tracking Account</b>; <b>Bills for payment</b>; konsep <b>Excess</b> dan <b>Under payment</b>.</li>
          </ul>
        </section>

        <section class="section">
          <div class="section-head"><h2>Dependensi AA</h2></div>
          <div class="cols">
            <div class="box"><h3>Core</h3><p><span class="tag">CUSTOMER</span> <span class="tag">ACCOUNT</span>, Delivery, Accounting, Limits, dan static tables lain.</p></div>
            <div class="box"><h3>Interest</h3><p><span class="tag">BASIC.RATE.TEXT</span> untuk floating, <span class="tag">BASIC.INTEREST</span> sebagai offer rate AA Loans (generated daily, perubahan back-dated dimungkinkan), dan <span class="tag">PERIODIC.INTEREST</span>.</p></div>
            <div class="box"><h3>Currency</h3><p>COUNTRY, REGION, HOLIDAY, CURRENCY.PARAM, CURRENCY, CURRENCY.MARKET. Negara/region di <span class="tag">BUS.DAY.CENTRES</span> membuat hari libur dicek saat input arrangement.</p></div>
          </div>
        </section>

        <section class="section">
          <div class="section-head"><h2>Interest day basis</h2><p>Numerator/denominator yang dipakai menghitung bunga</p></div>
          ${tableHTML([['Key', 'Numerator/Denominator', 'Catatan'], ...DAY_BASIS.map((r) => [`<span class="tag">${r[0]}</span>`, r[1], r[2]])])}
          <div class="panel pad" id="dbCalc">
            <h3 style="font-size:16px;margin-bottom:4px">Bandingkan bunga antar basis</h3>
            <p class="small muted" style="margin-bottom:16px">Numerator 360 menghitung bulan sebagai 30 hari, 366 menghitung hari aktual. Denominator 366 memakai panjang tahun aktual. Penyederhanaan untuk belajar.</p>
            <div class="grid-2" style="grid-template-columns:repeat(4,1fr);gap:12px">
              <label class="field"><span>Principal (Rp)</span><input class="input" type="text" inputmode="numeric" data-money value="100.000.000" data-k="p"></label>
              <label class="field"><span>Rate (%)</span><input class="input" type="number" value="8.25" step="0.01" min="0" data-k="r"></label>
              <label class="field"><span>Dari tanggal</span><input class="input" type="date" value="2026-01-31" data-k="a"></label>
              <label class="field"><span>Sampai tanggal</span><input class="input" type="date" value="2026-03-31" data-k="b"></label>
            </div>
            <div class="db-out" style="margin-top:16px"></div>
          </div>
        </section>

        <section class="section content">
          <div class="section-head"><h2>Tujuan pembelajaran</h2></div>
          <ol style="padding-left:20px;margin:0">
            <li>Mengenal Lending Product Line dan Property Classes</li>
            <li>Menyiapkan parameter tables, membuat Property dan Product Conditions</li>
            <li>Membuat Product Group dan Product, lalu proof dan publish</li>
            <li>Lending activities, Simulation, Reverse dan Replay</li>
            <li>Balance Types, perpindahan saldo, suspend arrangement</li>
            <li>Alur accounting di AA dan enquiries</li>
          </ol>
        </section>
      </div>`;
    },
    mount(r, root) {
      const off = mountFlows(root);
      const w = $('#dbCalc', root);
      const calc = () => {
        const g = (k) => $(`[data-k="${k}"]`, w).value;
        const P = AA.num(g('p')), R = (+g('r') || 0) / 100;
        const a = new Date(g('a') + 'T00:00:00'), b = new Date(g('b') + 'T00:00:00');
        if (!(b > a)) { $('.db-out', w).innerHTML = '<p class="small" style="color:var(--red)">Tanggal akhir harus setelah tanggal awal.</p>'; return; }
        const rows = DAY_BASIS.filter((x) => x[3]).map(([k, nd, , conv]) => {
          const [num, den] = conv.split('/');
          const days = num === '30' ? days30(a, b) : daysActual(a, b);
          const dv = den === 'act' ? yearLen(a.getFullYear()) : +den;
          return { k, nd, days, dv, i: (P * R * days) / dv };
        });
        const max = Math.max(...rows.map((x) => x.i)), min = Math.min(...rows.map((x) => x.i));
        $('.db-out', w).innerHTML = tableHTML([['Key', 'Basis', 'Hari dihitung', 'Pembagi', 'Bunga'], ...rows.map((x) => [`<span class="tag">${x.k}</span>`, x.nd, String(x.days), String(x.dv), `<span style="${x.i === max ? 'color:var(--red)' : x.i === min ? 'color:var(--green)' : ''}">${AA.rp(x.i)}</span>`])]) +
          `<p class="tbl-note">Selisih tertinggi dan terendah: <b>${AA.rp(max - min)}</b>. Coba rentang yang melewati Februari atau tanggal 31 untuk melihat perbedaan 30/360 dan aktual.</p>`;
      };
      AA.bindMoney(w);
      w.addEventListener('input', calc); calc();
      return off;
    },
  };

  /* =======================================================
     PENDALAMAN 2 — TABEL & STRUKTUR
     ======================================================= */
  const NR_CASES = [
    ['DEFAULT.NEGOTIABLE = Yes, tanpa rule per atribut', 'Semua atribut bisa dinegosiasikan tanpa batas'],
    ['NR.TYPE = RANGE, NR.VALUE 3–10 (usual term 5Y)', 'Boleh dinegosiasikan hanya antara 3–10 tahun'],
    ['NR.TYPE = FIX.VALUE + NR.MESSAGE ERROR', 'Tidak boleh diubah sama sekali, muncul error'],
    ['NR.TYPE = MAXIMUM + NR.MESSAGE OVERRIDE', 'Boleh lebih besar hanya dengan override'],
    ['DEFAULT.ATTR.OPTION = RESETTING', 'Kondisi direset dari produk saat rollover / reset / change product'],
    ['DEFAULT.ATTR.OPTION = NON-RESETTING', 'Kondisi dipertahankan dari level Arrangement'],
  ];
  AA.pages.tabel = {
    title: 'Tabel & struktur',
    render() {
      return `<div class="page page-narrow">
        <div class="crumbs"><a href="#/">Beranda</a><span class="sep">/</span><span>Pendalaman</span></div>
        <h1 class="page-title">Tabel & struktur data</h1>
        <p class="lede">Tabel mana yang dirilis Temenos, mana yang kamu setup saat implementasi, dan bagaimana aturan negosiasi menentukan apa yang boleh diubah di level arrangement.</p>

        <section class="section">
          <div class="section-head"><h2>Tabel komponen reusable</h2></div>
          <div class="grid-2">
            <div class="box"><h3>Dirilis Temenos</h3><p class="small muted" style="margin-bottom:10px">Tidak diubah oleh bank</p><div class="chips">${['AA.PROPERTY.CLASS', 'AA.PERIODIC.ATTRIBUTE.CLASS', 'AA.PROPERTY.CLASS.ACTION', 'AA.ACTIVITY.CLASS'].map((t) => `<span class="tag">${t}</span>`).join('')}</div></div>
            <div class="box"><h3>Setup saat implementasi</h3><p class="small muted" style="margin-bottom:10px">Bisa dipakai lintas beberapa produk</p><div class="chips">${['AA.PROPERTY', 'AA.PRD.DES.&lt;PROPERTY.CLASS&gt;', 'AA.PERIODIC.ATTRIBUTE', 'AA.SOURCE.CALC.TYPE'].map((t) => `<span class="tag tag-blue">${t}</span>`).join('')}</div></div>
          </div>
        </section>

        <section class="section">
          <div class="section-head"><h2>Tabel pembangun produk</h2></div>
          ${tableHTML([['Tabel', 'Fungsi'], ['<span class="tag">AA.PRODUCT.LINE</span>', 'Business line (LENDING); LINE.ATTRIBUTE = CCY dan REPLAY'], ['<span class="tag">AA.PRODUCT.GROUP</span>', 'Bentuk dasar produk; REBUILD.ACTIVITIES'], ['<span class="tag">AA.PRODUCT.DESIGNER</span>', 'Desain produk, currency, calculation source']])}
        </section>

        <section class="section">
          <div class="section-head"><h2>Membaca Id product condition</h2><p>Arahkan atau ketuk bagian Id</p></div>
          <div class="panel pad" id="idAnat">
            <div class="chips" style="gap:0;font-size:20px">
              <button class="tag" data-part="0" style="font-size:18px;padding:6px 10px;border-radius:6px 0 0 6px">FIXED.RATE</button><span class="tag" style="font-size:18px;padding:6px 4px;border-radius:0;border-left:0;border-right:0">-</span><button class="tag" data-part="1" style="font-size:18px;padding:6px 10px;border-radius:0">IDR</button><span class="tag" style="font-size:18px;padding:6px 4px;border-radius:0;border-left:0;border-right:0">-</span><button class="tag" data-part="2" style="font-size:18px;padding:6px 10px;border-radius:0 6px 6px 0">20100101</button>
            </div>
            <p class="id-exp" style="margin-top:14px;color:var(--ink-2)">Id product condition terdiri dari nama kondisi, currency, dan effective date. Contoh lain: <span class="tag">FIXED.INTEREST-USD-20100101</span>.</p>
          </div>
          <div class="content" style="margin-top:14px"><p>Property adalah named instance dari Property Class. Beberapa property dari kelas yang sama boleh dipakai jika Property Class mengizinkan (MULTIPLE). Detail level produk tidak terlihat di arrangement bila PRODUCT.ONLY.</p></div>
        </section>

        <section class="section">
          <div class="section-head"><h2>Negotiation rules</h2><p>Uji nilai term di level arrangement</p></div>
          <div class="nr" id="nr">
            <div class="nr-form">
              <label class="field"><span>Aturan pada atribut TERM (default produk 5Y)</span>
                <select class="input" data-k="rule">
                  <option value="none">DEFAULT.NEGOTIABLE = Yes, tanpa rule</option>
                  <option value="range" selected>NR.TYPE = RANGE (3–10)</option>
                  <option value="fix">NR.TYPE = FIX.VALUE</option>
                  <option value="min">NR.TYPE = MINIMUM (3)</option>
                  <option value="max">NR.TYPE = MAXIMUM (10)</option>
                </select></label>
              <label class="field"><span>NR.MESSAGE</span><div class="seg" data-k="msg"><button type="button" aria-pressed="true" data-v="ERROR">ERROR</button><button type="button" aria-pressed="false" data-v="OVERRIDE">OVERRIDE</button></div></label>
              <label class="field"><span>Term yang diminta customer <output data-o="v">12Y</output></span><input type="range" min="1" max="15" value="12" data-k="v"></label>
            </div>
            <div class="nr-out"><div class="small muted">Respons sistem saat arrangement di-commit</div><div class="t24msg"></div></div>
          </div>
          <h3 style="font-size:15px;margin:22px 0 10px">Kasus di dokumen: tebak perilakunya, lalu ketuk</h3>
          <div class="cases">${NR_CASES.map(([q, a]) => `<button class="case"><div class="cq">${q}</div><div class="ca">Ketuk untuk melihat perilaku</div></button>`).join('')}</div>
        </section>
      </div>`;
    },
    mount(r, root) {
      const parts = ['<b>FIXED.RATE</b> adalah nama product condition, sama dengan nama yang kamu buat di AA.PRD.DES.INTEREST.', '<b>IDR</b> adalah currency. Kondisi untuk property class bertipe CCY harus dibuat per currency, mis. IDR dan USD.', '<b>20100101</b> adalah effective date. Kondisi baru dengan tanggal lebih baru berlaku mulai tanggal itu (DATED).'];
      $$('#idAnat [data-part]', root).forEach((b) => {
        const f = () => { $$('#idAnat [data-part]', root).forEach((x) => x.classList.toggle('tag-blue', x === b)); $('#idAnat .id-exp', root).innerHTML = parts[+b.dataset.part]; };
        b.addEventListener('mouseenter', f); b.addEventListener('focus', f); b.addEventListener('click', f);
      });
      const nr = $('#nr', root);
      let msg = 'ERROR';
      const run = () => {
        const rule = $('[data-k="rule"]', nr).value, v = +$('[data-k="v"]', nr).value;
        const rng = $('[data-k="v"]', nr); rng.style.setProperty('--fill', ((v - 1) / 14) * 100 + '%');
        $('[data-o="v"]', nr).textContent = v + 'Y';
        let bad = false, why = '';
        if (rule === 'range' && (v < 3 || v > 10)) { bad = true; why = `TERM ${v}Y di luar range 3Y–10Y`; }
        if (rule === 'fix' && v !== 5) { bad = true; why = `TERM bernilai tetap 5Y, diminta ${v}Y`; }
        if (rule === 'min' && v < 3) { bad = true; why = `TERM ${v}Y di bawah minimum 3Y`; }
        if (rule === 'max' && v > 10) { bad = true; why = `TERM ${v}Y melebihi maksimum 10Y`; }
        const out = $('.t24msg', nr);
        if (!bad) { out.className = 't24msg ok'; out.innerHTML = `<span class="k">TXN COMPLETE</span><br>TERM ${v}Y diterima${rule === 'none' ? ', atribut bebas dinegosiasikan' : ', masih dalam aturan'}.`; }
        else if (msg === 'ERROR') { out.className = 't24msg err'; out.innerHTML = `<span class="k">ERROR</span><br>${why}. Arrangement tidak bisa di-commit sampai nilai diperbaiki.`; }
        else { out.className = 't24msg ovr'; out.innerHTML = `<span class="k">OVERRIDE</span><br>${why}. Boleh lanjut jika user menerima override (dan approver menyetujui).`; }
      };
      nr.addEventListener('input', run);
      $('[data-k="msg"]', nr).addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; msg = b.dataset.v; $$('[data-k="msg"] button', nr).forEach((x) => x.setAttribute('aria-pressed', String(x === b))); run(); });
      run();
      $$('.case', root).forEach((c, i) => c.addEventListener('click', () => { c.classList.add('open'); $('.ca', c).textContent = NR_CASES[i][1]; }));
    },
  };

  /* =======================================================
     PENDALAMAN 3 — PROPERTY CLASS EXPLORER
     ======================================================= */
  const ATTR_DEF = {
    DATED: 'Kondisi punya effective date; Id kondisi memuat tanggal berlaku.',
    CCY: 'Kondisi dibuat per currency.',
    'OPT.CCY': 'Currency opsional: kondisi boleh per currency atau tidak.',
    MULTIPLE: 'Boleh lebih dari satu property dari kelas ini dalam satu produk.',
    TRACKING: 'Perubahan di produk ikut memperbarui arrangement.',
    'NON.TRACKING': 'Arrangement mempertahankan nilainya walau produk berubah.',
    'TRACKING.ONLY': 'Arrangement selalu mengikuti produk; tidak bisa dinegosiasikan.',
    'FORWARD.DATED': 'Perubahan kondisi bisa dijadwalkan untuk tanggal mendatang.',
  };
  const PREFIX_DEF = { CUR: 'Current, saldo berjalan', DUE: 'Due, sudah ditagih (bill)', AGE: 'Overdue/aging, mis. GRC, DEL, NAB', UNC: 'Unallocated credit', UND: 'Unallocated debit', ACC: 'Accrued, bunga/charge terakru', TOT: 'Total commitment' };
  AA.PREFIX_DEF = PREFIX_DEF;
  const attrsOf = (p) => (p.attr === '—' ? [] : p.attr.split(',').map((s) => s.trim()));
  const prefixesOf = (p) => (/^[A-Z]{3}(, [A-Z]{3})*$/.test(p.prefix) ? p.prefix.split(', ') : []);
  const ALL_ATTRS = Array.from(new Set(D.PC.flatMap(attrsOf)));
  const modsMentioning = (id) => AA.MODS.filter((m) => strip(JSON.stringify(m.body)).includes(id));

  AA.pages.property = {
    title: (r) => (r.param ? r.param + ' — Property class' : 'Property class'),
    render(r) {
      return `<div class="page">
        <div class="crumbs"><a href="#/">Beranda</a><span class="sep">/</span><span>Pendalaman</span></div>
        <h1 class="page-title">Property class explorer</h1>
        <p class="lede">${D.PC.length} property class untuk Lending. Saring berdasarkan atribut, pilih satu kelas untuk melihat balance, penjelasan, dan latihan workshop-nya.</p>
        <div class="pc-filters">
          <div class="search-wrap" style="max-width:520px">${icon('search')}<input class="input input-search" id="pcq" placeholder="Cari, mis. interest, aging, settlement" value="${esc(r.query.q || '')}"></div>
          <div class="chips" id="pcAttr" aria-label="Saring atribut">${ALL_ATTRS.map((a) => `<button class="chip" aria-pressed="false" data-a="${a}" title="${esc(ATTR_DEF[a] || '')}">${a}</button>`).join('')}<button class="chip" aria-pressed="false" data-a="__bal">Punya balance</button></div>
        </div>
        <div class="pcx">
          <div><div class="small muted" id="pcCount" style="margin-bottom:8px"></div><div class="pc-list" id="pcList"></div></div>
          <aside class="panel pc-detail" id="pcDetail" aria-live="polite"></aside>
        </div>
      </div>`;
    },
    mount(r, root) {
      const sel = new Set();
      let cur = r.param && D.PC.find((p) => p.id === r.param) ? r.param : null;
      const list = $('#pcList', root), det = $('#pcDetail', root), q = $('#pcq', root);
      function renderList() {
        const s = q.value.trim().toLowerCase();
        const items = D.PC.filter((p) => {
          if (s && !(p.id + ' ' + p.name + ' ' + strip(p.klik + ' ' + p.pts.join(' '))).toLowerCase().includes(s)) return false;
          for (const a of sel) { if (a === '__bal') { if (!prefixesOf(p).length) return false; } else if (!attrsOf(p).includes(a)) return false; }
          return true;
        });
        $('#pcCount', root).textContent = `${items.length} dari ${D.PC.length} kelas`;
        list.innerHTML = items.length ? items.map((p) => `<button class="pc-item" data-id="${p.id}" aria-pressed="${p.id === cur}">
          <span class="pid">${p.id}${p.mandatory ? ' <span class="tag tag-red" style="font-size:11px">mandatory</span>' : ''}</span>
          <span class="pa">${prefixesOf(p).map((x) => `<span class="tag tag-blue">${x}</span>`).join('')}</span>
          <span class="pd">${esc(p.klik)}</span></button>`).join('') : `<div class="pad muted">Tidak ada kelas yang cocok. Kurangi filter atribut atau ubah kata kunci.</div>`;
      }
      function renderDetail() {
        const p = D.PC.find((x) => x.id === cur);
        if (!p) { det.classList.remove('open'); det.innerHTML = `<div class="pad pc-detail-empty"><p class="muted">Pilih property class di sebelah kiri untuk melihat detailnya.</p><p class="small muted" style="margin-top:10px">Tips: aktifkan filter <b>Punya balance</b> untuk melihat kelas yang membentuk balance type seperti CURACCOUNT atau ACCPRINCIPALINT.</p></div>`; return; }
        const mods = modsMentioning(p.id);
        det.innerHTML = `<div class="pad" style="position:relative">
          <button class="iconbtn pc-close" aria-label="Tutup detail">${icon('x')}</button>
          <span class="small muted">${esc(p.name)}</span>
          <h2>${p.id}</h2>
          <p class="sub">${esc(p.klik)}</p>
          ${attrsOf(p).length ? `<h4>Atribut</h4><div style="display:flex;flex-direction:column;gap:6px">${attrsOf(p).map((a) => `<div><span class="tag">${a}</span> <span class="attr-def">${esc(ATTR_DEF[a] || '')}</span></div>`).join('')}</div>` : ''}
          ${prefixesOf(p).length ? `<h4>Balance prefix</h4><div style="display:flex;flex-direction:column;gap:6px">${prefixesOf(p).map((x) => `<div><span class="tag tag-blue">${x}</span> <span class="attr-def">${PREFIX_DEF[x] || ''}${x !== 'AGE' ? `, contoh <span class="mono">${x}${({ ACCOUNT: 'ACCOUNT', INTEREST: 'PRINCIPALINT', 'TERM.AMOUNT': 'COMMITMENT' })[p.id] || '&lt;PROPERTY&gt;'}</span>` : ''}</span></div>`).join('')}</div>` : ''}
          <h4>Penjelasan</h4>
          <ul>${p.pts.map((x) => `<li>${x}</li>`).join('')}</ul>
          ${p.ws ? `<div class="ws"><b>Latihan workshop</b><br>${p.ws}</div>` : ''}
          ${mods.length ? `<h4>Disebut di modul</h4><div class="chips">${mods.map((m) => `<a class="chip" href="#/modul/${m.key}" style="text-decoration:none">Modul ${m.n}</a>`).join('')}</div>` : ''}
          <div class="btn-row" style="margin-top:20px"><a class="btn btn-line btn-sm" href="#/asisten?q=${encodeURIComponent('Jelaskan ' + p.id)}">${icon('chat', 'i-sm')}Tanya asisten</a></div>
        </div>`;
        det.scrollTop = 0;
        if (window.innerWidth <= 1100) det.classList.add('open');
        $('.pc-close', det).addEventListener('click', () => { det.classList.remove('open'); });
      }
      list.addEventListener('click', (e) => {
        const b = e.target.closest('.pc-item'); if (!b) return;
        cur = b.dataset.id; AA.setParam(cur);
        $$('.pc-item', list).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
        renderDetail();
      });
      $('#pcAttr', root).addEventListener('click', (e) => {
        const b = e.target.closest('.chip'); if (!b) return;
        const a = b.dataset.a; sel.has(a) ? sel.delete(a) : sel.add(a);
        b.setAttribute('aria-pressed', String(sel.has(a))); renderList();
      });
      q.addEventListener('input', renderList);
      renderList(); renderDetail();
      if (cur && window.innerWidth > 1100) { const el = $(`.pc-item[data-id="${cur}"]`, list); if (el) el.scrollIntoView({ block: 'nearest' }); }
    },
  };

  /* =======================================================
     PENDALAMAN 4 — MEMBANGUN PRODUK
     ======================================================= */
  const HIER = [
    ['Product Line', 'AA.PRODUCT.LINE', 'Level tertinggi AA, mewakili area bisnis utama: Lending, Deposits, Accounts, Trade Finance, Islamic Banking, seperti “departemen” bank. Dirilis Temenos; hanya deskripsi yang bisa diubah. Untuk Lending, LINE.ATTRIBUTE = CCY dan REPLAY.', 'Lending'],
    ['Product Group', 'AA.PRODUCT.GROUP', 'Mengelompokkan produk sejenis di bawah Product Line (Mortgage, Personal, Business, Vehicle Loans). Minimal satu property untuk tiap property class mandatory. Menambah property dengan REBUILD.ACTIVITIES = YES otomatis meng-generate activities.', 'Mortgage Loans'],
    ['Product', 'AA.PRODUCT.DESIGNER', 'Template untuk membuat arrangement. Berisi interest rules, charges, repayment rules, accounting rules, limits. Produk inheritance-only (non-saleable) bisa menjadi parent; child mewarisi lewat PARENT.PRODUCT.', 'Home Loan'],
    ['Property Class', 'AA.PROPERTY.CLASS', 'Kategori fungsi bisnis: CUSTOMER, TERM.AMOUNT, INTEREST, PAYMENT.RULES, ACCOUNTING, CHARGE, LIMIT. Product Line menentukan kelas mana yang mandatory atau opsional.', 'CUSTOMER, TERM.AMOUNT, INTEREST, PAYMENT.RULES, ACCOUNTING, CHARGE'],
    ['Property', 'AA.PROPERTY', 'Implementasi dari Property Class. INTEREST bisa menjadi Principal Interest atau Penalty Interest; CHARGE bisa menjadi Processing Fee atau Late Payment Charge.', 'Customer, Commitment, Principal Interest, Repayment, Accounting, Processing Fee'],
    ['Product Condition', 'AA.PRD.DES.<PROPERTY.CLASS>', 'Menyimpan aturan default property. Default disalin ke arrangement customer saat booking. Bisa lebih dari satu dengan periode efektif berbeda.', 'Interest 8,5% fixed basis 365, tenor 20 tahun, EMI bulanan, fee 1%'],
    ['Arrangement', 'AA.ARRANGEMENT', 'Kontrak live customer. Setelah di-authorise, activity disbursement, accrual, repayment, dan payoff berjalan terhadapnya.', 'Rakesh, Home Loan Rp500.000.000, 8,25%, 15 tahun'],
  ];
  const STAGES = [
    ['Designing', 'Tanpa efek ke sistem live', 'Produk disusun di AA.PRODUCT.DESIGNER: semua property mandatory ditambah opsional pilihan, tiap property dengan product condition-nya. Tab CALCULATION.SOURCE menentukan property kalkulasi dan source balance, mis. PRINCIPALINT dari DR.DAILY CURACCOUNT.'],
    ['Proofing', 'Validasi error dan hierarki', 'Proof memproses dari parent ke seluruh children. Jika gagal, sistem menampilkan error beserta saran perbaikan. Produk inheritance-only tidak ikut proof/publish.'],
    ['Publishing', 'Masuk Product Catalog', 'Produk yang sudah di-publish tersedia di Product Catalog untuk New Arrangement. Available Date: sejak tanggal ini sistem mencari kondisi valid untuk semua property. Expiry Date: arrangement baru tidak boleh dibuat, arrangement lama tetap berjalan.'],
  ];
  AA.pages.produk = {
    title: 'Membangun produk',
    render() {
      return `<div class="page page-narrow">
        <div class="crumbs"><a href="#/">Beranda</a><span class="sep">/</span><span>Pendalaman</span></div>
        <h1 class="page-title">Membangun produk lending</h1>
        <p class="lede">Produk AA dibangun bertingkat. Pilih satu level untuk melihat perannya, aplikasi T24 yang dipakai, dan contoh nyata dari kursus.</p>
        <section class="section">
          <div class="section-head"><h2>Hierarki produk</h2></div>
          <div class="hier" id="hier">
            <ul class="hier-list">${HIER.map((h, i) => `<li><button aria-pressed="${i === 0}" data-i="${i}"><span class="lv">${i + 1}</span>${h[0]}</button></li>`).join('')}</ul>
            <div class="hier-detail" aria-live="polite"></div>
          </div>
        </section>
        <section class="section">
          <div class="section-head"><h2>Tiga tahap rilis produk</h2></div>
          <div class="stages" id="stages">${STAGES.map((s, i) => `<button class="stage" aria-pressed="${i === 0}" data-i="${i}"><span class="sn">Tahap ${i + 1}</span><b>${s[0]}</b><small>${s[1]}</small></button>`).join('')}</div>
          <div class="stage-detail" aria-live="polite"></div>
        </section>
        <section class="section">
          <div class="section-head"><h2>Jalur menu latihan</h2><p>Dari workshop dokumen</p></div>
          <div class="panel pad" style="display:flex;flex-direction:column;gap:14px">
            <div><div class="small muted" style="margin-bottom:6px">Konfigurasi (admin)</div><div class="path"><span class="tag">Admin Menu</span><span class="sep">›</span><span class="tag">Product Builder</span><span class="sep">›</span>${['Property Classes and Properties', 'Product Conditions', 'Periodic Attributes', 'Products', 'Accounting', 'Activities'].map((x) => `<span class="chip">${x}</span>`).join('')}</div></div>
            <div><div class="small muted" style="margin-bottom:6px">Operasional (user)</div><div class="path"><span class="tag">User Menu</span><span class="sep">›</span><span class="tag">Credit Operations</span><span class="sep">›</span><span class="tag">Retail Lending – Arrangements</span><span class="sep">›</span>${['Product Catalog', 'New Arrangement Offers', 'Authorised', 'Arrangement Activities (FT)'].map((x) => `<span class="chip">${x}</span>`).join('')}</div></div>
          </div>
        </section>
      </div>`;
    },
    mount(r, root) {
      const hd = $('#hier .hier-detail', root);
      const showH = (i) => {
        const h = HIER[i];
        $$('#hier .hier-list button', root).forEach((b) => b.setAttribute('aria-pressed', String(+b.dataset.i === i)));
        hd.innerHTML = `<span class="small muted">Level ${i + 1} dari ${HIER.length}</span><h3>${h[0]}</h3><p><span class="tag">${esc(h[1])}</span></p><p style="margin-top:12px">${esc(h[2])}</p><div class="eg"><b>Contoh:</b> ${esc(h[3])}</div>
          <div class="btn-row" style="margin-top:16px">${i > 0 ? `<button class="btn btn-quiet btn-sm" data-go="${i - 1}">${icon('left', 'i-sm')}${HIER[i - 1][0]}</button>` : ''}${i < HIER.length - 1 ? `<button class="btn btn-line btn-sm" data-go="${i + 1}">Turun ke ${HIER[i + 1][0]}${icon('right', 'i-sm')}</button>` : `<a class="btn btn-line btn-sm" href="#/modul/m2">Baca Modul 2: Hierarki Produk</a>`}</div>`;
      };
      $('#hier', root).addEventListener('click', (e) => { const b = e.target.closest('[data-i],[data-go]'); if (b) showH(+(b.dataset.i ?? b.dataset.go)); });
      showH(0);
      const sd = $('.stage-detail', root);
      const showS = (i) => { $$('.stage', root).forEach((b) => b.setAttribute('aria-pressed', String(+b.dataset.i === i))); sd.textContent = STAGES[i][2]; };
      $('#stages', root).addEventListener('click', (e) => { const b = e.target.closest('.stage'); if (b) showS(+b.dataset.i); });
      showS(0);
    },
  };

  /* =======================================================
     PENDALAMAN 5 — AKTIVITAS & SIMULASI
     ======================================================= */
  const RENEW = [
    ['ROLLOVER', 'Renewal dengan kondisi lama atau yang direvisi. Hanya kondisi TRACKING yang ikut ditrack.'],
    ['RESET', 'Terjadi pada payment end date; kondisi direset sesuai setup reset di level produk.'],
    ['CHANGE.PRODUCT', 'Pindah ke kondisi produk baru. DEFAULT.ATTR.OPTION harus RESETTING agar kondisi baru berlaku.'],
    ['RENEGOTIATE', 'Mengubah kondisi banyak property sekaligus dalam satu activity.'],
  ];
  AA.pages.aktivitas = {
    title: 'Aktivitas & simulasi',
    render() {
      return `<div class="page page-narrow">
        <div class="crumbs"><a href="#/">Beranda</a><span class="sep">/</span><span>Pendalaman</span></div>
        <h1 class="page-title">Aktivitas, simulasi, reverse & replay</h1>
        <p class="lede">Arrangement hanya bisa berubah lewat activity, baik online maupun saat COB. Simulation menjalankan activity tanpa menyentuh data live, dan reverse & replay memutar ulang sejarah dari tanggal mana pun.</p>
        <section class="section content">
          <div class="section-head"><h2>Activities</h2></div>
          <ul class="list">
            <li>Operasi yang diterapkan ke arrangement: Disburse, Apply Payment, Accrue Interest, bahkan membuat arrangement baru pun sebuah activity.</li>
            <li>Activities dikelompokkan ke <b>Activity Class</b> yang didefinisikan Temenos dan menentukan perilaku, termasuk NOREVERSE / NOREPLAY.</li>
            <li>Activity di-generate otomatis saat property dipakai pertama kali di product line dan REBUILD.ACTIVITIES = YES di product group.</li>
            <li>Transaksi finansial lewat aplikasi akun (FT, Teller): activity dipilih berdasarkan Transaction Code melalui <span class="tag">ACTIVITY.MAPPING</span>, mis. TXN 850 ke <span class="tag">LENDING-DISBURSE-COMMITMENT</span>.</li>
          </ul>
        </section>
        <section class="section">
          <div class="section-head"><h2>Simulation</h2><p>Data disimpan di SIM files, arrangement live tidak berubah</p></div>
          <div class="pipe" style="grid-template-columns:repeat(3,1fr)">
            <div><span class="sn">1</span><b>Data capture</b><small>Input skenario: perubahan principal, rate, tenor, charges, atau payoff pada tanggal tertentu.</small></div>
            <div><span class="sn">2</span><b>Simulation runner</b><small>Memeriksa kondisi dan negotiation rules, menghitung maturity, charges, repayment, menyiapkan schedule.</small></div>
            <div><span class="sn">3</span><b>Simulation service</b><small>Dijalankan agent <span class="mono">TSA.SERVICE BNK/AA.SIMULATION.SERVICE</span> dengan TSM. Hasil bisa di-Execute menjadi live.</small></div>
          </div>
          <p class="small muted" style="margin-top:10px">Bisa beberapa run, beberapa activity dalam satu run, periode start–end, dan retention tertentu.</p>
        </section>
        <section class="section">
          <div class="section-head"><h2>Reverse & replay</h2><p>Effective dated processing, butuh opsi REPLAY di LINE.ATTRIBUTE</p></div>
          <div class="rr" id="rr">
            <div class="rr-stage"><div class="rr-line"><div class="rr-axis"></div></div></div>
            <div class="rr-foot">
              <div class="rr-pos">Posisi commitment<b>Rp450 jt</b></div>
              <div class="btn-row">
                <button class="btn btn-line btn-sm" data-rr="reset">${icon('reset', 'i-sm')}Posisi awal</button>
                <button class="btn btn-sm" data-rr="run">${icon('play', 'i-sm i-fill')}Sisipkan +Rp150 jt tanggal 15 Jan</button>
              </div>
            </div>
            <div class="rr-log" aria-live="polite">Tiga activity tercatat. Sisipkan transaksi back-valued untuk melihat sistem membalik lalu memutar ulang.</div>
          </div>
          <p class="small muted" style="margin-top:10px">Sistem membalik semua activity dari hari ini mundur ke tanggal back-valued, lalu memutar ulang dari tanggal itu ke hari ini. Accounting entries dibuat untuk keduanya. Tidak bisa reverse bila activity class NOREVERSE, tidak bisa replay bila NOREPLAY.</p>
        </section>
        <section class="section">
          <div class="section-head"><h2>Renewal & change product</h2></div>
          <div class="seg" id="renew" role="tablist">${RENEW.map((x, i) => `<button aria-pressed="${i === 0}" data-i="${i}" class="mono">${x[0]}</button>`).join('')}</div>
          <div class="stage-detail" id="renewOut" aria-live="polite"></div>
        </section>
      </div>`;
    },
    mount(r, root) {
      // Renewal tabs
      const ro = $('#renewOut', root);
      const showR = (i) => { $$('#renew button', root).forEach((b) => b.setAttribute('aria-pressed', String(+b.dataset.i === i))); ro.textContent = RENEW[i][1]; };
      $('#renew', root).addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) showR(+b.dataset.i); });
      showR(0);
      // Reverse & replay
      const rr = $('#rr', root), line = $('.rr-line', rr), log = $('.rr-log', rr), pos = $('.rr-pos b', rr);
      const base = [{ d: '1 Jan', day: 1, v: 500 }, { d: '31 Jan', day: 31, v: 50 }, { d: '15 Feb', day: 46, v: -100 }];
      const ins = { d: '15 Jan', day: 15, v: 150, ins: true };
      const X = (day) => 6 + (day / 52) * 88 + '%';
      let timers = [];
      const later = (fn, ms) => timers.push(setTimeout(fn, AA.reduceMotion() ? 0 : ms));
      function draw(list) {
        $$('.rr-node', line).forEach((n) => n.remove());
        let run = 0;
        list.slice().sort((a, b) => a.day - b.day).forEach((t) => {
          run += t.v;
          line.insertAdjacentHTML('beforeend', `<div class="rr-node${t.ins ? ' inserted hidden' : ''}" style="left:${X(t.day)}" data-day="${t.day}"><span class="amt${t.v < 0 ? ' neg' : ''}">${t.v > 0 ? '+' : '−'}Rp${Math.abs(t.v)} jt</span><span class="dot"></span><span class="d">${t.d}</span><span class="run">= Rp${run} jt</span></div>`);
        });
      }
      function reset() { timers.forEach(clearTimeout); timers = []; draw(base); pos.textContent = 'Rp450 jt'; log.textContent = 'Tiga activity tercatat. Sisipkan transaksi back-valued untuk melihat sistem membalik lalu memutar ulang.'; $('[data-rr="run"]', rr).disabled = false; }
      function run() {
        reset(); $('[data-rr="run"]', rr).disabled = true;
        draw([...base, ins]);
        const node = (day) => $(`.rr-node[data-day="${day}"]`, line);
        const lines = [];
        const say = (s) => { lines.push(s); log.innerHTML = lines.join('<br>'); };
        let bal = 450;
        say('Hari ini 20 Feb. Activity back-valued 15 Jan diterima.');
        later(() => { node(46).classList.add('reversed'); bal += 100; pos.textContent = 'Rp' + bal + ' jt'; say('REVERSE 15 Feb −Rp100 jt → posisi Rp550 jt'); }, 900);
        later(() => { node(31).classList.add('reversed'); bal -= 50; pos.textContent = 'Rp' + bal + ' jt'; say('REVERSE 31 Jan +Rp50 jt → posisi Rp500 jt'); }, 1800);
        later(() => { node(15).classList.remove('hidden'); node(15).classList.add('pulse'); bal += 150; pos.textContent = 'Rp' + bal + ' jt'; say('INSERT 15 Jan +Rp150 jt → posisi Rp650 jt'); }, 2800);
        later(() => { const n = node(31); n.classList.remove('reversed'); n.classList.add('pulse'); bal += 50; pos.textContent = 'Rp' + bal + ' jt'; say('REPLAY 31 Jan +Rp50 jt → posisi Rp700 jt'); }, 3800);
        later(() => { const n = node(46); n.classList.remove('reversed'); n.classList.add('pulse'); bal -= 100; pos.textContent = 'Rp' + bal + ' jt'; say('REPLAY 15 Feb −Rp100 jt → posisi akhir Rp600 jt. Accounting dibuat untuk reverse maupun replay.'); $('[data-rr="run"]', rr).disabled = false; }, 4800);
      }
      rr.addEventListener('click', (e) => { const b = e.target.closest('[data-rr]'); if (!b) return; b.dataset.rr === 'run' ? run() : reset(); });
      reset();
      return () => timers.forEach(clearTimeout);
    },
  };

  /* =======================================================
     PENDALAMAN 6 — BALANCE & ACCOUNTING
     ======================================================= */
  const PREFIXES = [['CUR', 'Current (TERM.AMOUNT, ACCOUNT)'], ['ACC', 'Accrued (INTEREST, CHARGE)'], ['DUE', 'Due (ACCOUNT, INTEREST, CHARGE)'], ['AGE', 'Overdue (ACCOUNT, INTEREST, CHARGE)'], ['UNC', 'Unallocated credit (ACCOUNT)'], ['UND', 'Unallocated debit (ACCOUNT)'], ['SP', 'Sufiks suspend / non-accrual'], ['CURCOMMIT', 'Commitment (kontingen)'], ['CURCOMMITBL', 'Penyeimbang kontingen']];
  AA.pages.balance = {
    title: 'Balance & accounting',
    render() {
      return `<div class="page">
        <div class="page-narrow" style="max-width:900px">
          <div class="crumbs"><a href="#/">Beranda</a><span class="sep">/</span><span>Pendalaman</span></div>
          <h1 class="page-title">Balance & accounting</h1>
          <p class="lede">Beberapa property punya satu atau lebih balance, yaitu komponen finansial produk. Nama balance dibentuk dari prefix ditambah nama property, misalnya ACC + PRINCIPALINT menjadi ACCPRINCIPALINT.</p>
          <section class="section">
            <div class="section-head"><h2>Rakit nama balance</h2></div>
            <div class="panel pad" id="bname">
              <div style="display:flex;flex-wrap:wrap;gap:12px;align-items:end">
                <label class="field" style="min-width:160px"><span>Prefix</span><select class="input" data-k="pf">${['CUR', 'ACC', 'DUE', 'GRC', 'DEL', 'NAB', 'UNC', 'UND'].map((x) => `<option>${x}</option>`).join('')}</select></label>
                <span style="font-size:22px;color:var(--ink-3);padding-bottom:6px">+</span>
                <label class="field" style="min-width:200px"><span>Property</span><select class="input" data-k="pr">${['ACCOUNT', 'PRINCIPALINT', 'PENALTYINT', 'COMMITMENT', 'NEWARRFEE'].map((x) => `<option>${x}</option>`).join('')}</select></label>
                <label class="field" style="flex-direction:row;align-items:center;gap:8px;padding-bottom:10px"><input type="checkbox" data-k="sp"><span>suspend (SP)</span></label>
              </div>
              <div style="margin-top:16px;display:flex;align-items:center;gap:12px;flex-wrap:wrap"><span class="tag tag-blue bn-out" style="font-size:20px;padding:6px 12px"></span><span class="small muted bn-why"></span></div>
            </div>
          </section>
          <section class="section">
            <div class="section-head"><h2>Prefix dan pemakaiannya</h2><p>Ketuk prefix untuk melihat property class yang memakainya</p></div>
            <div class="prefixes" id="pfx">${PREFIXES.map(([p, d]) => `<button class="prefix" aria-pressed="false" data-p="${p}"><span class="tag">${p}</span><small>${d}</small></button>`).join('')}</div>
            <div class="stage-detail" id="pfxOut">AC.BALANCE.TYPE mengatur reporting type (contingent, non-contingent, internal), virtual balance (penjumlahan untuk kalkulasi, mis. penalty interest dari semua overdue), activity update (history file ACCT.ACTIVITY), dan suspend balance.</div>
          </section>
        </div>
        <section class="section">
          ${lifecycleHTML('lcBal', { title: 'Aliran saldo satu pinjaman', sub: 'Setiap tahap menampilkan jurnal dan buku jurnal kumulatif yang selalu seimbang.', detailed: true })}
        </section>
        <div class="page-narrow" style="max-width:900px">
          <section class="section content">
            <div class="section-head"><h2>Suspension & resume</h2></div>
            <ul class="list">
              <li>Arrangement suspended: sisi customer tetap normal (due, capitalised), tapi bank <b>tidak membukukan P&L</b>; accrual masuk ke balance bersufiks SP, mis. <span class="tag">ACCLOANINTSP</span>.</li>
              <li>Property harus PROPERTY.TYPE = SUSPEND (hanya INTEREST dan CHARGE); SUSPEND.OVERDUES membalik overdue yang sudah masuk P&L.</li>
              <li>Saat repayment pada arrangement suspended, P&L direalisasikan otomatis. Pemicu: otomatis oleh aging (mis. status NAB), atau manual.</li>
              <li><b>Resume</b> adalah kebalikan suspension dan dilakukan manual: accrual suspend dan charge income dipindahkan ke P&L.</li>
            </ul>
          </section>
          <section class="section">
            <div class="section-head"><h2>Rules-based accounting</h2></div>
            <div class="pipe">
              <div><span class="sn">1</span><b>Accounting event</b><small>Dihasilkan activity AA: contract id, balance type, amount, value date.</small></div>
              <div><span class="sn">2</span><b>AC.ALLOCATION.RULE</b><small>Target balance, contra balance, transaction codes, movement detail.</small></div>
              <div><span class="sn">3</span><b>AC.POSTING.DETAIL</b><small>Menentukan jenis entry yang diposting.</small></div>
              <div><span class="sn">4</span><b>Entries</b><small>STMT.ENTRY (customer/akun), CATEG.ENTRY (P&L), SPEC.ENTRY.</small></div>
            </div>
            <div class="content" style="margin-top:16px"><ul class="list">
              <li>Property ACCOUNTING: ACCT.ACTION (action dengan ACCOUNTING = Yes) dan ACCT.RULE per property; amortisasi charge dengan AMORT (MATURITY / 1M / 1Y).</li>
              <li>Praktik: copy allocation rule <span class="tag">DEBIT-CHARGE</span> untuk property interest/charge baru, lalu ganti P&L category.</li>
              <li>Data: EB.CONTRACT.BALANCES (saldo per AA account), ACCT.ACTIVITY (historis); konsolidasi memakai balance type (CURACCOUNT, ACCLOANINT).</li>
            </ul></div>
          </section>
          <section class="section">
            <div class="section-head"><h2>Enquiry bawaan arrangement</h2></div>
            ${tableHTML([['Enquiry', 'Isinya'], ['Balance', 'Commitment, current/due principal, pending charges, UNC/UND'], ['Activity Log', 'Semua activity per tanggal dan sequence, drill down; dasar reverse & replay'], ['Bills', 'Due date, tipe, amount, outstanding, status'], ['Messages', 'Pesan terkait activity'], ['Payment Schedule', 'Tanggal terjadwal, amount, outstanding principal/interest/total']])}
          </section>
        </div>
      </div>`;
    },
    mount(r, root) {
      const bn = $('#bname', root);
      const AGEP = { GRC: 'status Grace', DEL: 'status Delinquent', NAB: 'status Non Accrual Basis' };
      const upd = () => {
        const pf = $('[data-k="pf"]', bn).value, pr = $('[data-k="pr"]', bn).value, sp = $('[data-k="sp"]', bn).checked;
        $('.bn-out', bn).textContent = pf + pr + (sp ? 'SP' : '');
        $('.bn-why', bn).textContent = (AGEP[pf] ? `Prefix aging (${AGEP[pf]}) dari property OVERDUE` : PREFIX_DEF[pf] || '') + (sp ? ', di-suspend (tidak masuk P&L)' : '');
      };
      bn.addEventListener('input', upd); bn.addEventListener('change', upd); upd();
      const out = $('#pfxOut', root);
      $('#pfx', root).addEventListener('click', (e) => {
        const b = e.target.closest('.prefix'); if (!b) return;
        $$('#pfx .prefix', root).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
        const p = b.dataset.p;
        const users = D.PC.filter((c) => prefixesOf(c).includes(p));
        out.innerHTML = users.length ? `<b class="mono">${p}</b> dipakai oleh: ${users.map((u) => `<a class="tag" href="#/property/${u.id}" style="text-decoration:none">${u.id}</a>`).join(' ')}` : `<b class="mono">${p}</b>: ${esc(PREFIXES.find((x) => x[0] === p)[1])}.`;
      });
      return mountLifecycle($('#lcBal', root), { detailed: true });
    },
  };
})();
