/* =========================================================
   AA Loan KB — halaman akun: masuk, daftar, lupa & reset password,
   akun & hasil belajar, admin peserta.
   ========================================================= */
(function () {
  'use strict';
  const AA = window.AA, D = AA.D;
  const { $, $$, esc, fmt, icon, Store } = AA;
  const C = AA.Cloud;

  /* ---------- Util tanggal & perangkat ---------- */
  const rtf = new Intl.RelativeTimeFormat('id', { numeric: 'auto' });
  function ago(t) {
    if (!t) return '—';
    const s = (Date.parse(t) - Date.now()) / 1000, a = Math.abs(s);
    if (a < 60) return 'baru saja';
    if (a < 3600) return rtf.format(Math.round(s / 60), 'minute');
    if (a < 86400) return rtf.format(Math.round(s / 3600), 'hour');
    if (a < 86400 * 7) return rtf.format(Math.round(s / 86400), 'day');
    return dateStr(t);
  }
  const dateStr = (t) => (t ? new Date(t).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');
  const dateTime = (t) => (t ? new Date(t).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—');
  function device(ua) {
    if (!ua) return '—';
    const os = /Windows/.test(ua) ? 'Windows' : /Android/.test(ua) ? 'Android' : /iPhone|iPad/.test(ua) ? 'iOS' : /Mac OS X/.test(ua) ? 'macOS' : /Linux/.test(ua) ? 'Linux' : 'Lainnya';
    const br = /Edg\//.test(ua) ? 'Edge' : /OPR\//.test(ua) ? 'Opera' : /Chrome\//.test(ua) ? 'Chrome' : /Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : 'Browser';
    return `${br}, ${os}`;
  }
  const KIND = { signup: 'Daftar', login: 'Masuk', visit: 'Kunjungan' };
  const MODE = { quick: 'Sesi cepat', all: 'Semua soal', wrong: 'Ulangi yang salah', lokal: 'Dari perangkat' };
  const nMods = AA.MODS.length;
  const ivTotal = () => AA.interviewItems().length;

  /* ---------- Kerangka halaman auth ---------- */
  const SAMPLE = [
    ['Sen', 'Modul 4: Loan Booking', 'selesai'],
    ['Sen', 'Quiz, sesi cepat', '8/10'],
    ['Sel', 'Kartu interview', '+6 dikuasai'],
    ['Rab', 'Modul 5: Loan Disbursement', 'selesai'],
    ['Kam', 'Quiz, ulangi yang salah', '2/2'],
  ];
  function authShell(inner) {
    return `<div class="auth">
      <div class="auth-main">
        <a class="brand" href="#/masuk"><span class="brand-mark" aria-hidden="true"></span><span class="brand-text"><b>AA Loan KB</b><small>Temenos Transact · Lending</small></span></a>
        <div class="auth-form">${inner}</div>
        <p class="auth-foot small muted">Dibuat untuk belajar Arrangement Architecture Lending. <button class="linkbtn" id="authTheme">Ganti tema</button></p>
      </div>
      <aside class="auth-side" aria-label="Contoh catatan belajar">
        <div class="auth-side-in">
          <h2>Setiap langkah belajarmu tercatat</h2>
          <p>Modul yang selesai, skor setiap sesi quiz, dan kartu interview yang sudah kamu kuasai tersimpan di akunmu. Buka dari laptop maupun ponsel, progresnya sama.</p>
          <div class="ledger-card">
            <div class="lc-cap"><span>Contoh catatan belajar</span><span>minggu ini</span></div>
            <table class="ledger"><thead><tr><th>Hari</th><th>Aktivitas</th><th class="num">Hasil</th></tr></thead>
            <tbody>${SAMPLE.map((r) => `<tr><td>${r[0]}</td><td>${r[1]}</td><td class="num">${r[2]}</td></tr>`).join('')}</tbody></table>
          </div>
        </div>
      </aside>
    </div>`;
  }
  function notConfigured() {
    return authShell(`<h1>Login belum aktif</h1>
      <p class="auth-lede">Database belum dihubungkan, jadi situs berjalan di mode lokal dan progres disimpan di browser ini saja.</p>
      <div class="callout">Admin: isi <span class="mono">assets/config.js</span> dengan Project URL dan publishable key Supabase, lalu jalankan <span class="mono">supabase/schema.sql</span>. Panduan lengkap ada di README.</div>
      <a class="btn" href="#/">Lanjut belajar tanpa login</a>`);
  }
  const pwField = (name, label, auto, extra = '') => `<label class="field"><span>${label}</span>
    <span class="pw"><input class="input" type="password" name="${name}" autocomplete="${auto}" required minlength="8" ${extra}><button type="button" class="pw-eye" aria-label="Tampilkan password" data-eye>${icon('eye', 'i-sm')}</button></span></label>`;
  function bindAuthCommon(root) {
    root.addEventListener('click', (e) => {
      const eye = e.target.closest('[data-eye]');
      if (eye) { const inp = eye.previousElementSibling; const show = inp.type === 'password'; inp.type = show ? 'text' : 'password'; eye.setAttribute('aria-label', show ? 'Sembunyikan password' : 'Tampilkan password'); eye.innerHTML = icon(show ? 'eye-off' : 'eye', 'i-sm'); }
      if (e.target.closest('#authTheme')) $('#themeBtn').click();
    });
  }
  function formState(form, busy, label) {
    const b = $('button[type=submit]', form);
    if (!b.dataset.label) b.dataset.label = b.innerHTML;
    b.disabled = busy;
    b.innerHTML = busy ? `<span class="spin" aria-hidden="true"></span>${label}` : b.dataset.label;
  }
  const showErr = (form, msg) => { const el = $('.form-err', form); el.textContent = msg || ''; el.hidden = !msg; };
  const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  /* ---------- MASUK ---------- */
  AA.pages.masuk = {
    title: 'Masuk', bare: true,
    render(r) {
      if (!C.enabled) return notConfigured();
      return authShell(`<h1>Masuk</h1>
        <p class="auth-lede">Lanjutkan belajar AA Lending dari terakhir kali kamu berhenti.</p>
        <form id="fLogin" novalidate>
          <label class="field"><span>Email</span><input class="input" type="email" name="email" autocomplete="email" required value="${esc(r.query.email || '')}"></label>
          ${pwField('password', 'Password', 'current-password')}
          <div class="form-row"><a href="#/lupa-password" class="small">Lupa password?</a></div>
          <p class="form-err" role="alert" hidden></p>
          <button class="btn btn-block" type="submit">Masuk</button>
        </form>
        <p class="auth-alt">Belum punya akun? <a href="#/daftar${r.query.next ? '?next=' + encodeURIComponent(r.query.next) : ''}">Daftar</a></p>`);
    },
    mount(r, root) {
      if (!C.enabled) return;
      bindAuthCommon(root);
      const f = $('#fLogin', root);
      (f.email.value ? f.password : f.email).focus();
      f.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = f.email.value.trim(), password = f.password.value;
        if (!emailOk(email)) return showErr(f, 'Masukkan alamat email yang valid.');
        if (!password) return showErr(f, 'Masukkan password.');
        showErr(f, ''); formState(f, true, 'Memeriksa…');
        try {
          await C.signIn({ email, password });
          AA.toast(`Selamat datang kembali, ${C.firstName()}`);
          location.hash = r.query.next ? '#' + r.query.next : '#/';
        } catch (err) { formState(f, false); showErr(f, C.errText(err)); }
      });
    },
  };

  /* ---------- DAFTAR ---------- */
  AA.pages.daftar = {
    title: 'Daftar', bare: true,
    render() {
      if (!C.enabled) return notConfigured();
      return authShell(`<h1>Buat akun</h1>
        <p class="auth-lede">Gratis. Progres modul, quiz, dan latihan interview akan tersimpan di akun ini.</p>
        <form id="fReg" novalidate>
          <label class="field"><span>Nama lengkap</span><input class="input" type="text" name="name" autocomplete="name" required maxlength="80"></label>
          <label class="field"><span>Email</span><input class="input" type="email" name="email" autocomplete="email" required></label>
          ${pwField('password', 'Password (minimal 8 karakter)', 'new-password')}
          ${pwField('password2', 'Ulangi password', 'new-password')}
          <p class="form-err" role="alert" hidden></p>
          <button class="btn btn-block" type="submit">Daftar</button>
        </form>
        <p class="auth-alt">Sudah punya akun? <a href="#/masuk">Masuk</a></p>`);
    },
    mount(r, root) {
      if (!C.enabled) return;
      bindAuthCommon(root);
      const f = $('#fReg', root);
      f.name.focus();
      f.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = f.name.value.trim().replace(/\s+/g, ' '), email = f.email.value.trim(), password = f.password.value;
        if (name.length < 2) return showErr(f, 'Isi nama lengkap kamu.');
        if (!emailOk(email)) return showErr(f, 'Masukkan alamat email yang valid.');
        if (password.length < 8) return showErr(f, 'Password minimal 8 karakter.');
        if (password !== f.password2.value) return showErr(f, 'Kedua password tidak sama.');
        showErr(f, ''); formState(f, true, 'Membuat akun…');
        try {
          const res = await C.signUp({ name, email, password });
          if (res.confirmed) {
            AA.toast(`Akun dibuat. Selamat belajar, ${C.firstName()}`);
            location.hash = r.query.next ? '#' + r.query.next : '#/';
          } else {
            $('.auth-form', root).innerHTML = `<div class="sent">${icon('mail')}</div><h1>Cek email kamu</h1>
              <p class="auth-lede">Kami mengirim tautan konfirmasi ke <b>${esc(email)}</b>. Buka tautan itu, lalu kamu langsung masuk. Tidak ada di kotak masuk? Cek folder spam.</p>
              <a class="btn btn-line btn-block" href="#/masuk?email=${encodeURIComponent(email)}">Kembali ke halaman masuk</a>`;
          }
        } catch (err) { formState(f, false); showErr(f, C.errText(err)); }
      });
    },
  };

  /* ---------- LUPA PASSWORD ---------- */
  AA.pages['lupa-password'] = {
    title: 'Lupa password', bare: true,
    render() {
      if (!C.enabled) return notConfigured();
      return authShell(`<h1>Lupa password</h1>
        <p class="auth-lede">Masukkan email akunmu. Kami kirim tautan untuk membuat password baru.</p>
        <form id="fForgot" novalidate>
          <label class="field"><span>Email</span><input class="input" type="email" name="email" autocomplete="email" required></label>
          <p class="form-err" role="alert" hidden></p>
          <button class="btn btn-block" type="submit">Kirim tautan reset</button>
        </form>
        <p class="auth-alt"><a href="#/masuk">Kembali ke halaman masuk</a></p>`);
    },
    mount(r, root) {
      if (!C.enabled) return;
      bindAuthCommon(root);
      const f = $('#fForgot', root);
      f.email.focus();
      f.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = f.email.value.trim();
        if (!emailOk(email)) return showErr(f, 'Masukkan alamat email yang valid.');
        showErr(f, ''); formState(f, true, 'Mengirim…');
        try {
          await C.resetPassword(email);
          $('.auth-form', root).innerHTML = `<div class="sent">${icon('mail')}</div><h1>Tautan terkirim</h1>
            <p class="auth-lede">Jika <b>${esc(email)}</b> terdaftar, tautan reset password sudah dikirim. Buka dari perangkat ini agar langsung diarahkan ke halaman password baru.</p>
            <a class="btn btn-line btn-block" href="#/masuk">Kembali ke halaman masuk</a>`;
        } catch (err) { formState(f, false); showErr(f, C.errText(err)); }
      });
    },
  };

  /* ---------- RESET PASSWORD (dari tautan email) ---------- */
  AA.pages['reset-password'] = {
    title: 'Password baru', bare: true,
    render() {
      if (!C.enabled) return notConfigured();
      if (!C.user) return authShell(`<h1>Tautan tidak valid</h1><p class="auth-lede">Tautan reset sudah kedaluwarsa atau sudah dipakai. Minta tautan baru.</p><a class="btn btn-block" href="#/lupa-password">Minta tautan baru</a>`);
      return authShell(`<h1>Buat password baru</h1>
        <p class="auth-lede">Untuk akun <b>${esc(C.user.email)}</b>.</p>
        <form id="fReset" novalidate>
          ${pwField('password', 'Password baru (minimal 8 karakter)', 'new-password')}
          ${pwField('password2', 'Ulangi password baru', 'new-password')}
          <p class="form-err" role="alert" hidden></p>
          <button class="btn btn-block" type="submit">Simpan password</button>
        </form>`);
    },
    mount(r, root) {
      const f = $('#fReset', root);
      if (!f) return;
      bindAuthCommon(root);
      f.password.focus();
      f.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (f.password.value.length < 8) return showErr(f, 'Password minimal 8 karakter.');
        if (f.password.value !== f.password2.value) return showErr(f, 'Kedua password tidak sama.');
        showErr(f, ''); formState(f, true, 'Menyimpan…');
        try { await C.updatePassword(f.password.value); AA.toast('Password disimpan'); location.hash = '#/'; }
        catch (err) { formState(f, false); showErr(f, C.errText(err)); }
      });
    },
  };

  /* ---------- Komponen ringkasan hasil ---------- */
  function figures(x) {
    return `<div class="figures figures-5">
      <div><small>Modul selesai</small><b>${x.mod}/${nMods}</b><span class="bar green" style="margin-top:8px"><i style="width:${(x.mod / nMods) * 100}%"></i></span></div>
      <div><small>Skor quiz terbaik</small><b>${x.best == null ? '—' : x.best + '%'}</b><span class="note">${x.last == null ? 'belum ada sesi' : `terakhir ${x.last}%`}</span></div>
      <div><small>Sesi quiz</small><b>${x.att}</b><span class="note">${x.att ? 'sesi dikerjakan' : 'mulai dari menu Quiz'}</span></div>
      <div><small>Interview dikuasai</small><b>${x.iv}/${ivTotal()}</b><span class="note">kartu tanya-jawab</span></div>
      <div><small>Istilah dikuasai</small><b>${x.gl}/${D.GLOSSARY.length}</b><span class="note">glosarium</span></div>
    </div>`;
  }
  function moduleGrid(doneMap) {
    return `<div class="modgrid">${AA.MODS.map((m) => { const t = doneMap[m.key]; return `<div class="${t ? 'on' : ''}" title="${esc(m.title)}"><span class="mono">${String(m.n).padStart(2, '0')}</span><b>${esc(m.title.replace(/\s*\(.*\)$/, ''))}</b><small>${t ? 'Selesai ' + dateStr(t) : 'Belum'}</small></div>`; }).join('')}</div>`;
  }
  function quizTable(rows) {
    if (!rows.length) return `<p class="muted pad">Belum ada sesi quiz.</p>`;
    return `<div class="tbl-wrap" style="margin:0;border:0;border-radius:0"><table class="ledger"><thead><tr><th>Tanggal</th><th>Mode</th><th class="num">Skor</th><th class="num">Persen</th></tr></thead><tbody>
      ${rows.map((q) => { const p = Math.round((q.s / q.t) * 100); return `<tr><td>${dateTime(q.d)}</td><td>${esc(MODE[q.mode] || q.mode || '—')}</td><td class="num">${q.s}/${q.t}</td><td class="num"><span class="${p >= 80 ? 'good' : p < 60 ? 'bad' : ''}">${p}%</span></td></tr>`; }).join('')}
    </tbody></table></div>`;
  }
  function loginTable(rows) {
    if (!rows.length) return `<p class="muted pad">Belum ada catatan.</p>`;
    return `<div class="tbl-wrap" style="margin:0;border:0;border-radius:0"><table class="ledger"><thead><tr><th>Waktu</th><th>Jenis</th><th>Perangkat</th></tr></thead><tbody>
      ${rows.map((l) => `<tr><td>${dateTime(l.created_at)}</td><td>${KIND[l.kind] || l.kind}</td><td>${esc(device(l.user_agent))}</td></tr>`).join('')}
    </tbody></table></div>`;
  }

  /* ---------- AKUN & HASIL BELAJAR ---------- */
  AA.pages.akun = {
    title: 'Akun & hasil belajar',
    render() {
      if (!C.user) return `<div class="page page-narrow"><h1 class="page-title">Akun</h1><p class="lede">Masuk untuk melihat hasil belajarmu.</p><div class="btn-row" style="margin-top:16px"><a class="btn" href="#/masuk">Masuk</a></div></div>`;
      const d = Store.data, att = d.quiz.attempts;
      const best = att.length ? Math.max(...att.map((a) => Math.round((a.s / a.t) * 100))) : null;
      const last = att.length ? Math.round((att[att.length - 1].s / att[att.length - 1].t) * 100) : null;
      const p = C.profile || {};
      return `<div class="page">
        <div class="crumbs"><a href="#/">Beranda</a><span class="sep">/</span><span>Akun</span></div>
        <div class="acct-head">
          <span class="avatar avatar-lg" aria-hidden="true">${esc(AA.initials(C.displayName()))}</span>
          <div><h1 class="page-title">${esc(C.displayName())}</h1>
            <p class="muted">${esc(C.user.email)} · bergabung ${dateStr(p.created_at || C.user.created_at)}${C.isAdmin() ? ' · <span class="tag tag-blue">Admin</span>' : ''}</p></div>
          <button class="btn btn-line" id="btnOut">${icon('logout', 'i-sm')}Keluar</button>
        </div>
        <section class="section">${figures({ mod: AA.doneCount(), best, last, att: att.length, iv: Object.keys(d.ivqKnown).length, gl: Object.keys(d.glKnown).length })}</section>
        <section class="section"><div class="section-head"><h2>Modul</h2><a class="btn btn-quiet btn-sm" href="#/modul/${AA.nextModule().key}">Lanjutkan modul berikutnya</a></div>${moduleGrid(d.done)}</section>
        <div class="grid-2 section" style="align-items:start">
          <section class="panel" style="overflow:hidden"><div class="pad" style="padding-bottom:12px"><h2 style="font-size:17px">Riwayat quiz</h2></div>${quizTable(att.slice().reverse().slice(0, 15))}</section>
          <section class="panel" style="overflow:hidden"><div class="pad" style="padding-bottom:12px"><h2 style="font-size:17px">Riwayat masuk</h2></div><div id="myLogins"><p class="muted pad">Memuat…</p></div></section>
        </div>
        <section class="section"><div class="section-head"><h2>Pengaturan akun</h2></div>
          <div class="grid-2" style="align-items:start">
            <form class="panel pad set-form" id="fName" novalidate><h3>Nama tampilan</h3>
              <label class="field"><span>Nama lengkap</span><input class="input" name="name" maxlength="80" value="${esc(p.full_name || C.displayName())}"></label>
              <p class="form-err" role="alert" hidden></p><button class="btn btn-line" type="submit">Simpan nama</button></form>
            <form class="panel pad set-form" id="fPw" novalidate><h3>Ganti password</h3>
              ${pwField('password', 'Password baru (minimal 8 karakter)', 'new-password')}
              <p class="form-err" role="alert" hidden></p><button class="btn btn-line" type="submit">Simpan password</button></form>
          </div>
        </section>
      </div>`;
    },
    mount(r, root) {
      if (!C.user) return;
      bindAuthCommon(root);
      $('#btnOut', root).addEventListener('click', () => C.signOut());
      C.myLogins(12).then((rows) => { const el = $('#myLogins', root); if (el) el.innerHTML = loginTable(rows); })
        .catch((e) => { const el = $('#myLogins', root); if (el) el.innerHTML = `<p class="pad small" style="color:var(--red)">${esc(C.errText(e))}</p>`; });
      const fn = $('#fName', root);
      fn.addEventListener('submit', async (e) => {
        e.preventDefault();
        const v = fn.name.value.trim().replace(/\s+/g, ' ');
        if (v.length < 2) return showErr(fn, 'Isi nama lengkap kamu.');
        showErr(fn, ''); formState(fn, true, 'Menyimpan…');
        try { await C.updateName(v); AA.toast('Nama disimpan'); AA.rerender(); } catch (err) { formState(fn, false); showErr(fn, C.errText(err)); }
      });
      const fp = $('#fPw', root);
      fp.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (fp.password.value.length < 8) return showErr(fp, 'Password minimal 8 karakter.');
        showErr(fp, ''); formState(fp, true, 'Menyimpan…');
        try { await C.updatePassword(fp.password.value); fp.reset(); formState(fp, false); AA.toast('Password diganti'); } catch (err) { formState(fp, false); showErr(fp, C.errText(err)); }
      });
    },
  };

  /* ---------- ADMIN ---------- */
  let ADM = { rows: null, logins: null, sort: 'last_login_at', dir: -1, q: '' };
  const COLS = [
    ['full_name', 'Peserta'], ['last_login_at', 'Terakhir aktif'], ['modules_done', 'Modul', true], ['quiz_best_pct', 'Quiz terbaik', true],
    ['quiz_attempts', 'Sesi quiz', true], ['interview_known', 'Interview', true], ['glossary_known', 'Istilah', true], ['login_count', 'Masuk', true],
  ];
  function csv(rows) {
    const head = ['Nama', 'Email', 'Peran', 'Bergabung', 'Terakhir aktif', 'Jumlah masuk', 'Modul selesai', 'Skor quiz terbaik (%)', 'Skor quiz terakhir (%)', 'Sesi quiz', 'Kartu interview dikuasai', 'Istilah dikuasai'];
    const q = (v) => `"${String(v == null ? '' : v).replace(/"/g, '""')}"`;
    const lines = [head.map(q).join(',')].concat(rows.map((r) => [r.full_name, r.email, r.role, dateStr(r.created_at), dateTime(r.last_login_at || r.last_seen_at), r.login_count, r.modules_done, r.quiz_best_pct, r.quiz_last_pct, r.quiz_attempts, r.interview_known, r.glossary_known].map(q).join(',')));
    const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = `peserta-aa-loan-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  const lastActive = (r) => r.last_login_at || r.last_seen_at;

  AA.pages.admin = {
    title: (r) => (r.param ? 'Detail peserta' : 'Admin peserta'),
    adminOnly: true,
    render(r) {
      if (r.param) return `<div class="page" id="admDetail"><div class="crumbs"><a href="#/admin">Admin peserta</a><span class="sep">/</span><span>Detail</span></div><p class="muted">Memuat…</p></div>`;
      return `<div class="page">
        <div class="crumbs"><a href="#/">Beranda</a><span class="sep">/</span><span>Admin</span></div>
        <div class="dash-head"><div><h1 class="page-title">Admin peserta</h1><p class="lede">Semua akun yang terdaftar beserta hasil belajarnya. Data dibaca langsung dari database.</p></div>
          <div class="btn-row"><a class="btn btn-line" href="#/peran">${icon('shield', 'i-sm')}Kelola peran</a><button class="btn btn-line" id="admReload">${icon('reset', 'i-sm')}Muat ulang</button><button class="btn" id="admCsv" disabled>${icon('download', 'i-sm')}Unduh CSV</button></div></div>
        <section class="section" id="admFig"></section>
        <section class="section">
          <div class="section-head"><h2>Peserta</h2><div class="search-wrap" style="min-width:260px">${icon('search')}<input class="input input-search" id="admQ" placeholder="Cari nama atau email" value="${esc(ADM.q)}"></div></div>
          <div class="panel" style="overflow:hidden" id="admTable"><p class="muted pad">Memuat data peserta…</p></div>
        </section>
        <section class="section">
          <div class="section-head"><h2>Aktivitas masuk terbaru</h2><p>25 catatan terakhir dari semua peserta</p></div>
          <div class="panel" style="overflow:hidden" id="admLogins"><p class="muted pad">Memuat…</p></div>
        </section>
      </div>`;
    },
    mount(r, root) {
      if (r.param) return mountDetail(r.param, root);
      const draw = () => {
        if (!$('#admFig', root)) return;
        const rows = ADM.rows || [];
        const q = ADM.q.toLowerCase();
        const list = rows.filter((x) => !q || (x.full_name + ' ' + x.email).toLowerCase().includes(q));
        list.sort((a, b) => {
          const k = ADM.sort; let va = k === 'last_login_at' ? lastActive(a) : a[k], vb = k === 'last_login_at' ? lastActive(b) : b[k];
          if (va == null && vb == null) return 0; if (va == null) return 1; if (vb == null) return -1;
          return (typeof va === 'string' ? va.localeCompare(vb) : va - vb) * ADM.dir;
        });
        const week = Date.now() - 7 * 864e5;
        const active = rows.filter((x) => lastActive(x) && Date.parse(lastActive(x)) > week).length;
        const avgMod = rows.length ? rows.reduce((s, x) => s + (x.modules_done || 0), 0) / rows.length : 0;
        const withQ = rows.filter((x) => x.quiz_best_pct != null);
        const avgQ = withQ.length ? withQ.reduce((s, x) => s + x.quiz_best_pct, 0) / withQ.length : null;
        const fin = rows.filter((x) => x.modules_done >= nMods).length;
        $('#admFig', root).innerHTML = `<div class="figures figures-4">
          <div><small>Total peserta</small><b>${rows.length}</b><span class="note">akun terdaftar</span></div>
          <div><small>Aktif 7 hari terakhir</small><b>${active}</b><span class="note">${rows.length ? Math.round((active / rows.length) * 100) : 0}% dari peserta</span></div>
          <div><small>Rata-rata modul selesai</small><b>${fmt(avgMod, 1)}/${nMods}</b><span class="note">${fin} peserta menyelesaikan semua</span></div>
          <div><small>Rata-rata skor quiz terbaik</small><b>${avgQ == null ? '—' : fmt(avgQ, 0) + '%'}</b><span class="note">${withQ.length} peserta pernah quiz</span></div></div>`;
        const th = COLS.map(([k, l, n]) => `<th class="${n ? 'num' : ''}"><button class="sortbtn" data-k="${k}" aria-label="Urutkan ${l}">${l}${ADM.sort === k ? `<span aria-hidden="true">${ADM.dir > 0 ? '▲' : '▼'}</span>` : ''}</button></th>`).join('');
        $('#admTable', root).innerHTML = list.length ? `<div class="tbl-wrap adm" style="margin:0;border:0;border-radius:0"><table class="ledger"><thead><tr>${th}</tr></thead><tbody>
          ${list.map((x) => `<tr data-id="${x.id}" tabindex="0">
            <td><a href="#/admin/${x.id}" class="who-cell"><span><b>${esc(x.full_name || '(tanpa nama)')}</b>${x.role === 'admin' ? ' <span class="tag tag-blue" style="font-size:11px">admin</span>' : ''}</span><small>${esc(x.email)}</small></a></td>
            <td title="${esc(dateTime(lastActive(x)))}">${ago(lastActive(x))}</td>
            <td class="num"><span class="mbar"><i style="width:${((x.modules_done || 0) / nMods) * 100}%"></i></span>${x.modules_done || 0}/${nMods}</td>
            <td class="num">${x.quiz_best_pct == null ? '—' : `<span class="${x.quiz_best_pct >= 80 ? 'good' : x.quiz_best_pct < 60 ? 'bad' : ''}">${x.quiz_best_pct}%</span>`}</td>
            <td class="num">${x.quiz_attempts || 0}</td><td class="num">${x.interview_known || 0}</td><td class="num">${x.glossary_known || 0}</td><td class="num">${x.login_count || 0}</td></tr>`).join('')}
          </tbody></table></div>` : `<p class="muted pad">${rows.length ? 'Tidak ada peserta yang cocok dengan pencarian.' : 'Belum ada peserta. Bagikan tautan situs agar tim mendaftar.'}</p>`;
        const byId = Object.fromEntries(rows.map((x) => [x.id, x]));
        const L = ADM.logins || [];
        $('#admLogins', root).innerHTML = L.length ? `<div class="tbl-wrap" style="margin:0;border:0;border-radius:0"><table class="ledger"><thead><tr><th>Waktu</th><th>Peserta</th><th>Jenis</th><th>Perangkat</th></tr></thead><tbody>
          ${L.map((l) => `<tr><td>${dateTime(l.created_at)}</td><td><a href="#/admin/${l.user_id}">${esc((byId[l.user_id] || {}).full_name || (byId[l.user_id] || {}).email || 'Peserta')}</a></td><td>${KIND[l.kind] || l.kind}</td><td>${esc(device(l.user_agent))}</td></tr>`).join('')}
          </tbody></table></div>` : `<p class="muted pad">Belum ada aktivitas masuk.</p>`;
        $('#admCsv', root).disabled = !rows.length;
      };
      const load = async () => {
        try {
          const [rows, logins] = await Promise.all([C.learners(), C.recentLogins(25)]);
          ADM.rows = rows; ADM.logins = logins; draw();
        } catch (e) { if ($('#admTable', root)) $('#admTable', root).innerHTML = `<p class="pad" style="color:var(--red)">${esc(C.errText(e))}</p>`; }
      };
      if (ADM.rows) draw();
      load();
      $('#admReload', root).addEventListener('click', () => { load(); AA.toast('Data peserta dimuat ulang', 'reset'); });
      $('#admCsv', root).addEventListener('click', () => csv(ADM.rows || []));
      $('#admQ', root).addEventListener('input', (e) => { ADM.q = e.target.value; draw(); });
      root.addEventListener('click', (e) => {
        const s = e.target.closest('.sortbtn');
        if (s) { const k = s.dataset.k; ADM.dir = ADM.sort === k ? -ADM.dir : (k === 'full_name' ? 1 : -1); ADM.sort = k; draw(); return; }
        const tr = e.target.closest('tr[data-id]');
        if (tr && !e.target.closest('a')) location.hash = '#/admin/' + tr.dataset.id;
      });
      root.addEventListener('keydown', (e) => { const tr = e.target.closest('tr[data-id]'); if (tr && e.key === 'Enter') location.hash = '#/admin/' + tr.dataset.id; });
    },
  };

  async function mountDetail(id, root) {
    const host = $('#admDetail', root);
    try {
      const x = await C.learnerDetail(id);
      if (!host.isConnected) return;
      if (!x.summary) { host.innerHTML += '<p>Peserta tidak ditemukan.</p>'; return; }
      const s = x.summary;
      const done = {}; x.modules.forEach((m) => { done[m.module_key] = Date.parse(m.completed_at); });
      const quiz = x.quiz.map((q) => ({ s: q.score, t: q.total, d: Date.parse(q.created_at), mode: q.mode }));
      host.innerHTML = `
        <div class="crumbs"><a href="#/admin">Admin peserta</a><span class="sep">/</span><span>${esc(s.full_name || s.email)}</span></div>
        <div class="acct-head">
          <span class="avatar avatar-lg" aria-hidden="true">${esc(AA.initials(s.full_name || s.email))}</span>
          <div><h1 class="page-title">${esc(s.full_name || '(tanpa nama)')}</h1><p class="muted">${esc(s.email)} · bergabung ${dateStr(s.created_at)} · terakhir aktif ${ago(lastActive(s))}</p></div>
          <div class="role-ctl"><span class="small muted">Peran</span>${roleSwitch(s)}</div>
        </div>
        <section class="section">${figures({ mod: s.modules_done || 0, best: s.quiz_best_pct, last: s.quiz_last_pct, att: s.quiz_attempts || 0, iv: s.interview_known || 0, gl: s.glossary_known || 0 })}</section>
        <section class="section"><div class="section-head"><h2>Modul</h2></div>${moduleGrid(done)}</section>
        <div class="grid-2 section" style="align-items:start">
          <section class="panel" style="overflow:hidden"><div class="pad" style="padding-bottom:12px"><h2 style="font-size:17px">Riwayat quiz</h2></div>${quizTable(quiz)}</section>
          <section class="panel" style="overflow:hidden"><div class="pad" style="padding-bottom:12px"><h2 style="font-size:17px">Riwayat masuk</h2></div>${loginTable(x.logins)}</section>
        </div>`;
      bindRoleSwitches(host, [s], () => AA.rerender());
    } catch (e) { host.innerHTML += `<p style="color:var(--red)">${esc(C.errText(e))}</p>`; }
  }

  /* ---------- KELOLA PERAN ---------- */
  const ROLE = { learner: 'Peserta', admin: 'Admin' };
  const adminCount = (rows) => rows.filter((x) => x.role === 'admin').length;
  let ROLE_ROWS = [];
  function roleSwitch(x) {
    const me = C.user && x.id === C.user.id;
    const pool = ROLE_ROWS.length ? ROLE_ROWS : ADM.rows || [];
    const lastAdmin = x.role === 'admin' && pool.length > 0 && adminCount(pool) <= 1;
    return `<div class="seg role-seg" role="group" aria-label="Peran ${esc(x.full_name || x.email)}">
      ${['learner', 'admin'].map((r) => `<button type="button" data-role="${r}" data-uid="${x.id}" aria-pressed="${x.role === r}" ${r === 'learner' && lastAdmin ? 'disabled title="Minimal harus ada satu admin"' : ''}>${ROLE[r]}</button>`).join('')}
    </div>${me ? '<span class="small muted you">kamu</span>' : ''}`;
  }
  async function changeRole(x, role) {
    const me = C.user && x.id === C.user.id;
    const name = x.full_name || x.email;
    const ok = await AA.confirm(role === 'admin'
      ? { title: `Jadikan ${name} admin?`, body: `${esc(name)} akan bisa melihat hasil belajar semua peserta, mengunduh CSV, dan mengubah peran akun lain.`, ok: 'Jadikan admin' }
      : me
        ? { title: 'Turunkan dirimu menjadi peserta?', body: 'Kamu akan langsung kehilangan akses ke halaman Admin peserta dan Kelola peran. Hanya admin lain yang bisa mengembalikannya.', ok: 'Ya, jadikan saya peserta', danger: true }
        : { title: `Ubah ${name} menjadi peserta?`, body: `${esc(name)} tidak bisa lagi membuka halaman Admin peserta dan Kelola peran. Data belajarnya tetap tersimpan.`, ok: 'Jadikan peserta', danger: true });
    if (!ok) return false;
    try {
      await C.setRole(x.id, role);
      x.role = role;
      if (ADM.rows) { const r = ADM.rows.find((y) => y.id === x.id); if (r) r.role = role; }
      AA.toast(`${name} sekarang ${ROLE[role].toLowerCase()}`, 'shield');
      if (me && role !== 'admin') { location.hash = '#/akun'; return false; }
      AA.renderNav();
      return true;
    } catch (e) { AA.toast(C.errText(e), 'alert'); return false; }
  }
  function bindRoleSwitches(host, rows, after) {
    host.addEventListener('click', async (e) => {
      const b = e.target.closest('.role-seg button[data-role]');
      if (!b || b.disabled || b.getAttribute('aria-pressed') === 'true') return;
      e.stopPropagation();
      const x = rows.find((r) => r.id === b.dataset.uid);
      if (!x) return;
      const seg = b.parentElement; seg.classList.add('busy');
      const done = await changeRole(x, b.dataset.role);
      seg.classList.remove('busy');
      if (done && after) after();
    });
  }

  AA.pages.peran = {
    title: 'Kelola peran',
    adminOnly: true,
    render() {
      return `<div class="page page-narrow" style="max-width:1000px">
        <div class="crumbs"><a href="#/">Beranda</a><span class="sep">/</span><a href="#/admin">Admin peserta</a><span class="sep">/</span><span>Kelola peran</span></div>
        <h1 class="page-title">Kelola peran</h1>
        <p class="lede">Tentukan siapa yang menjadi admin. Perubahan langsung berlaku saat akun itu memuat ulang halaman, dan setiap perubahan dicatat.</p>
        <dl class="roles-def">
          <div><dt><span class="tag">Peserta</span></dt><dd>Belajar dan melihat hasil belajarnya sendiri. Peran default untuk akun baru.</dd></div>
          <div><dt><span class="tag tag-blue">Admin</span></dt><dd>Semua akses peserta, ditambah halaman Admin peserta, unduh CSV, dan kelola peran. Minimal harus ada satu admin.</dd></div>
        </dl>
        <section class="section">
          <div class="section-head">
            <div class="chips" id="roleFilter"><button class="chip" aria-pressed="true" data-f="">Semua <span class="cnt"></span></button><button class="chip" aria-pressed="false" data-f="admin">Admin <span class="cnt"></span></button><button class="chip" aria-pressed="false" data-f="learner">Peserta <span class="cnt"></span></button></div>
            <div class="search-wrap" style="min-width:240px">${icon('search')}<input class="input input-search" id="roleQ" placeholder="Cari nama atau email"></div>
          </div>
          <div class="panel" style="overflow:hidden" id="roleList"><p class="muted pad">Memuat akun…</p></div>
        </section>
        <section class="section">
          <div class="section-head"><h2>Riwayat perubahan peran</h2><p>30 perubahan terakhir</p></div>
          <div class="panel" style="overflow:hidden" id="roleLog"><p class="muted pad">Memuat…</p></div>
        </section>
      </div>`;
    },
    mount(r, root) {
      let filter = '', q = '';
      const list = $('#roleList', root);
      const draw = () => {
        if (!list.isConnected) return;
        const rows = ROLE_ROWS;
        $$('#roleFilter .chip', root).forEach((c) => { const f = c.dataset.f; $('.cnt', c).textContent = f ? rows.filter((x) => x.role === f).length : rows.length; c.setAttribute('aria-pressed', String(f === filter)); });
        const ql = q.toLowerCase();
        const show = rows.filter((x) => (!filter || x.role === filter) && (!ql || (x.full_name + ' ' + x.email).toLowerCase().includes(ql)))
          .sort((a, b) => (a.role === b.role ? (a.full_name || a.email).localeCompare(b.full_name || b.email) : a.role === 'admin' ? -1 : 1));
        list.innerHTML = show.length ? `<div class="tbl-wrap" style="margin:0;border:0;border-radius:0"><table class="ledger role-table"><thead><tr><th>Akun</th><th>Bergabung</th><th>Terakhir aktif</th><th>Peran</th></tr></thead><tbody>
          ${show.map((x) => `<tr><td><a href="#/admin/${x.id}" class="who-cell"><b>${esc(x.full_name || '(tanpa nama)')}</b><small>${esc(x.email)}</small></a></td><td>${dateStr(x.created_at)}</td><td>${ago(lastActive(x))}</td><td><div class="role-ctl">${roleSwitch(x)}</div></td></tr>`).join('')}
          </tbody></table></div>` : `<p class="muted pad">Tidak ada akun yang cocok.</p>`;
      };
      const drawLog = (log) => {
        if (!$('#roleLog', root)) return;
        const byId = Object.fromEntries(ROLE_ROWS.map((x) => [x.id, x]));
        const nm = (id) => { const x = byId[id]; return x ? esc(x.full_name || x.email) : '<span class="muted">akun dihapus</span>'; };
        $('#roleLog', root).innerHTML = log.length ? `<div class="tbl-wrap" style="margin:0;border:0;border-radius:0"><table class="ledger"><thead><tr><th>Waktu</th><th>Akun</th><th>Perubahan</th><th>Oleh</th></tr></thead><tbody>
          ${log.map((l) => `<tr><td>${dateTime(l.created_at)}</td><td>${nm(l.user_id)}</td><td>${ROLE[l.old_role] || l.old_role} → <b>${ROLE[l.new_role] || l.new_role}</b></td><td>${l.changed_by ? nm(l.changed_by) : '—'}</td></tr>`).join('')}
          </tbody></table></div>` : `<p class="muted pad">Belum ada perubahan peran yang dicatat dari website.</p>`;
      };
      const load = async () => {
        try { ROLE_ROWS = await C.learners(); draw(); } catch (e) { if (list.isConnected) list.innerHTML = `<p class="pad" style="color:var(--red)">${esc(C.errText(e))}</p>`; return; }
        try { drawLog(await C.roleChanges(30)); } catch (e) { if ($('#roleLog', root)) $('#roleLog', root).innerHTML = `<p class="pad" style="color:var(--red)">${esc(C.errText(e))}</p>`; }
      };
      $('#roleFilter', root).addEventListener('click', (e) => { const c = e.target.closest('.chip'); if (!c) return; filter = c.dataset.f; draw(); });
      $('#roleQ', root).addEventListener('input', (e) => { q = e.target.value; draw(); });
      bindRoleSwitches(list, { find: (fn) => ROLE_ROWS.find(fn) }, () => { if (AA.route && AA.route.name === 'peran') load(); });
      load();
    },
  };
})();
