/* =========================================================
   AA Loan KB — akun & database (Supabase)
   - Login/daftar dengan email + password (Supabase Auth)
   - Progres belajar disimpan ke tabel Postgres (lihat supabase/schema.sql)
   - Jika config.js kosong, situs berjalan di "mode lokal" (localStorage)
   ========================================================= */
(function () {
  'use strict';
  const AA = window.AA, D = AA.D, Store = AA.Store;
  const CFG = window.AA_CONFIG || {};
  const lib = window.supabase;
  const configured = !!(CFG.supabaseUrl && CFG.supabaseKey);

  // Peta hash soal → indeks, agar riwayat tetap benar walau urutan soal berubah
  const QHASH = D.QUIZ.map((q) => AA.hash(AA.strip(q.q)));
  const qIndex = (a) => { const i = a && a.h ? QHASH.indexOf(a.h) : -1; return i >= 0 ? i : (a && D.QUIZ[a.q] ? a.q : -1); };
  AA.quizHash = (i) => QHASH[i];

  const siteUrl = () => location.origin + location.pathname;
  const dayKey = (t) => new Date(t).toISOString().slice(0, 10);

  const Cloud = (AA.Cloud = {
    configured,
    enabled: configured && !!(lib && lib.createClient),
    requireLogin: CFG.requireLogin !== false,
    client: null,
    user: null,
    profile: null,

    displayName() {
      if (!this.user) return '';
      const p = this.profile || {};
      const meta = this.user.user_metadata || {};
      return p.full_name || meta.full_name || (this.user.email || '').split('@')[0];
    },
    firstName() { return this.displayName().split(/\s+/)[0]; },
    isAdmin() { return !!(this.profile && this.profile.role === 'admin'); },

    /* ---------- Inisialisasi ---------- */
    async init() {
      if (!this.enabled) {
        if (configured) console.warn('Library Supabase gagal dimuat; berjalan di mode lokal.');
        return;
      }
      // Tangkap kembalian dari tautan email (konfirmasi / reset password)
      const hashParams = new URLSearchParams(location.hash.replace(/^#\/?/, '').split('?').pop());
      const isCallback = /access_token=|error_description=/.test(location.hash) || /[?&]code=/.test(location.search);
      const cbType = hashParams.get('type');
      const cbErr = hashParams.get('error_description');

      this.client = lib.createClient(CFG.supabaseUrl, CFG.supabaseKey, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storageKey: 'aakm.auth' },
      });
      this.client.auth.onAuthStateChange((event) => {
        // Jangan memanggil Supabase langsung di callback ini (bisa deadlock); tunda.
        if (event === 'PASSWORD_RECOVERY') setTimeout(() => { location.hash = '#/reset-password'; }, 0);
        if (event === 'SIGNED_OUT' && this.user) setTimeout(() => this._reset(), 0);
      });
      const { data } = await this.client.auth.getSession();

      if (isCallback) {
        const target = cbErr ? '#/masuk' : cbType === 'recovery' ? '#/reset-password' : '#/';
        history.replaceState(null, '', location.pathname + target);
        if (cbErr) setTimeout(() => AA.toast(this.errText({ message: cbErr }), 'alert'), 400);
        else if (cbType === 'signup' || cbType === 'email') setTimeout(() => AA.toast('Email terkonfirmasi. Selamat belajar!'), 400);
      }
      if (data && data.session) await this._setUser(data.session.user, 'visit');
      window.addEventListener('online', () => this.flush());
    },

    async _setUser(user, kind) {
      this.user = user;
      Store.use(user.id);
      const { data: prof } = await this.client.from('profiles').select('*').eq('id', user.id).maybeSingle();
      this.profile = prof || { id: user.id, full_name: (user.user_metadata || {}).full_name || '', email: user.email, role: 'learner' };
      await this.flush();
      const pulled = await this.pull();
      if (pulled) await this._adoptLocal();
      if (kind) {
        this.client.rpc('record_login', { p_kind: kind, p_user_agent: navigator.userAgent.slice(0, 300) })
          .then((r) => { if (r.error) console.warn('record_login', r.error); });
      }
    },

    _reset() {
      this.user = null; this.profile = null;
      Store.use(null);
      history.replaceState(null, '', location.pathname + '#/masuk');
      location.reload();
    },

    /* ---------- Muat progres dari database ---------- */
    async pull() {
      const c = this.client, uid = this.user.id;
      const [mp, qa, cp, le] = await Promise.all([
        c.from('module_progress').select('module_key,completed_at').eq('user_id', uid),
        c.from('quiz_attempts').select('mode,score,total,answers,created_at').eq('user_id', uid).order('created_at', { ascending: true }),
        c.from('card_progress').select('deck,card_id').eq('user_id', uid),
        c.from('login_events').select('created_at').eq('user_id', uid).order('created_at', { ascending: false }).limit(300),
      ]);
      const err = mp.error || qa.error || cp.error || le.error;
      if (err) {
        console.warn('pull', err);
        AA.toast('Progres dari server belum termuat. Menampilkan data di perangkat ini.', 'alert');
        return false;
      }
      const d = Store.data;
      d.done = {};
      mp.data.forEach((r) => { d.done[r.module_key] = Date.parse(r.completed_at); });
      d.ivqKnown = {}; d.glKnown = {};
      cp.data.forEach((r) => { (r.deck === 'interview' ? d.ivqKnown : d.glKnown)[r.card_id] = 1; });
      d.quiz.attempts = qa.data.map((r) => ({ s: r.score, t: r.total, d: Date.parse(r.created_at), mode: r.mode }));
      // Soal "salah" = soal yang jawaban terakhirnya salah
      const last = {};
      qa.data.forEach((r) => (r.answers || []).forEach((a) => { const i = qIndex(a); if (i >= 0) last[i] = !!a.ok; }));
      d.quiz.wrong = Object.keys(last).filter((k) => !last[k]).map(Number);
      const days = new Set(le.data.map((r) => dayKey(r.created_at)));
      days.add(dayKey(Date.now()));
      d.visits = Array.from(days).sort();
      Store.save();
      return true;
    },

    // Pindahkan progres yang dibuat sebelum login (mode lokal) ke akun ini, sekali saja
    async _adoptLocal() {
      const a = Store.readAnon();
      const ops = [];
      Object.keys(a.done || {}).forEach((k) => { if (!Store.data.done[k]) ops.push({ t: 'module', key: k, done: true }); });
      Object.keys(a.ivqKnown || {}).forEach((id) => { if (!Store.data.ivqKnown[id]) ops.push({ t: 'card', deck: 'interview', id, known: true }); });
      Object.keys(a.glKnown || {}).forEach((id) => { if (!Store.data.glKnown[id]) ops.push({ t: 'card', deck: 'glossary', id, known: true }); });
      ((a.quiz && a.quiz.attempts) || []).forEach((x) => { if (x && x.t > 0) ops.push({ t: 'quiz', mode: 'lokal', score: x.s, total: x.t, answers: [] }); });
      if (!ops.length) return;
      for (const o of ops) { this._applyLocal(o); await this.op(o, { quiet: true }); }
      Store.clearAnon();
      AA.toast('Progres sebelumnya di perangkat ini dipindahkan ke akunmu');
    },
    _applyLocal(o) {
      const d = Store.data;
      if (o.t === 'module') { if (o.done) d.done[o.key] = Date.now(); else delete d.done[o.key]; }
      if (o.t === 'card') { const m = o.deck === 'interview' ? d.ivqKnown : d.glKnown; if (o.known) m[o.id] = 1; else delete m[o.id]; }
      if (o.t === 'quiz') d.quiz.attempts.push({ s: o.score, t: o.total, d: Date.now(), mode: o.mode });
      Store.save();
    },

    /* ---------- Simpan perubahan ---------- */
    async op(o, opts = {}) {
      if (!this.user) return;
      try { await this._send(o); return true; } catch (e) {
        console.warn('sync', e);
        Store.data.pending.push(o); Store.save();
        if (!opts.quiet) AA.toast('Belum tersimpan ke server. Akan dicoba lagi otomatis.', 'alert');
        return false;
      }
    },
    async _send(o) {
      const c = this.client, uid = this.user.id;
      let r;
      if (o.t === 'module') {
        r = o.done
          ? await c.from('module_progress').upsert({ user_id: uid, module_key: o.key }, { onConflict: 'user_id,module_key', ignoreDuplicates: true })
          : await c.from('module_progress').delete().eq('user_id', uid).eq('module_key', o.key);
      } else if (o.t === 'card') {
        r = o.known
          ? await c.from('card_progress').upsert({ user_id: uid, deck: o.deck, card_id: o.id }, { onConflict: 'user_id,deck,card_id', ignoreDuplicates: true })
          : await c.from('card_progress').delete().eq('user_id', uid).eq('deck', o.deck).eq('card_id', o.id);
      } else if (o.t === 'quiz') {
        r = await c.from('quiz_attempts').insert({ user_id: uid, mode: o.mode, score: o.score, total: o.total, answers: o.answers || [] });
      }
      if (r && r.error) throw r.error;
    },
    async flush() {
      if (!this.user || !Store.data.pending.length) return;
      const list = Store.data.pending.splice(0);
      Store.save();
      for (const o of list) { try { await this._send(o); } catch (e) { Store.data.pending.push(o); } }
      Store.save();
    },

    /* ---------- Akun ---------- */
    async signUp({ name, email, password }) {
      const { data, error } = await this.client.auth.signUp({ email, password, options: { data: { full_name: name }, emailRedirectTo: siteUrl() } });
      if (error) throw error;
      // Jika email sudah terdaftar & konfirmasi email aktif, Supabase mengembalikan user tanpa identities
      if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) throw { message: 'User already registered' };
      if (data.session) { await this._setUser(data.session.user, 'signup'); return { confirmed: true }; }
      return { confirmed: false };
    },
    async signIn({ email, password }) {
      const { data, error } = await this.client.auth.signInWithPassword({ email, password });
      if (error) throw error;
      await this._setUser(data.user, 'login');
    },
    async signOut() {
      try { await this.client.auth.signOut(); } catch (e) { /* tetap keluar secara lokal */ }
      this._reset();
    },
    async resetPassword(email) {
      const { error } = await this.client.auth.resetPasswordForEmail(email, { redirectTo: siteUrl() });
      if (error) throw error;
    },
    async updatePassword(password) {
      const { error } = await this.client.auth.updateUser({ password });
      if (error) throw error;
    },
    async updateName(full_name) {
      const { error } = await this.client.from('profiles').update({ full_name }).eq('id', this.user.id);
      if (error) throw error;
      this.profile.full_name = full_name;
    },
    async myLogins(limit = 15) {
      const { data, error } = await this.client.from('login_events').select('kind,user_agent,created_at').eq('user_id', this.user.id).order('created_at', { ascending: false }).limit(limit);
      if (error) throw error;
      return data;
    },

    /* ---------- Admin ---------- */
    async learners() {
      const { data, error } = await this.client.from('learner_summary').select('*');
      if (error) throw error;
      return data;
    },
    async recentLogins(limit = 25) {
      const { data, error } = await this.client.from('login_events').select('user_id,kind,user_agent,created_at').order('created_at', { ascending: false }).limit(limit);
      if (error) throw error;
      return data;
    },
    async setRole(userId, role) {
      const { error } = await this.client.rpc('set_user_role', { p_user_id: userId, p_role: role });
      if (error) throw error;
      if (userId === this.user.id && this.profile) this.profile.role = role;
    },
    async roleChanges(limit = 30) {
      const { data, error } = await this.client.from('role_changes').select('user_id,old_role,new_role,changed_by,created_at').order('created_at', { ascending: false }).limit(limit);
      if (error) throw error;
      return data;
    },
    async learnerDetail(id) {
      const c = this.client;
      const [sum, mp, qa, le] = await Promise.all([
        c.from('learner_summary').select('*').eq('id', id).maybeSingle(),
        c.from('module_progress').select('module_key,completed_at').eq('user_id', id),
        c.from('quiz_attempts').select('mode,score,total,answers,created_at').eq('user_id', id).order('created_at', { ascending: false }).limit(50),
        c.from('login_events').select('kind,user_agent,created_at').eq('user_id', id).order('created_at', { ascending: false }).limit(30),
      ]);
      const err = sum.error || mp.error || qa.error || le.error;
      if (err) throw err;
      return { summary: sum.data, modules: mp.data, quiz: qa.data, logins: le.data };
    },

    /* ---------- Pesan error yang bisa dipahami ---------- */
    errText(e) {
      const m = String((e && (e.message || e.error_description || e.msg)) || e || '');
      const map = [
        [/invalid login credentials/i, 'Email atau password salah.'],
        [/already registered|already been registered|user_already_exists/i, 'Email ini sudah terdaftar. Silakan masuk.'],
        [/email not confirmed/i, 'Email belum dikonfirmasi. Buka tautan konfirmasi di kotak masuk email kamu.'],
        [/password should be at least|weak.?password/i, 'Password terlalu lemah. Gunakan minimal 8 karakter.'],
        [/rate limit|too many requests|over_email_send_rate_limit/i, 'Terlalu banyak percobaan. Tunggu beberapa menit lalu coba lagi.'],
        [/invalid email|unable to validate email/i, 'Format email tidak valid.'],
        [/signups not allowed|signup is disabled/i, 'Pendaftaran akun baru sedang ditutup. Hubungi admin.'],
        [/expired|invalid.*(token|link)|otp/i, 'Tautan sudah kedaluwarsa atau tidak valid. Minta tautan baru.'],
        [/same.*password|different from the old/i, 'Password baru harus berbeda dari password lama.'],
        [/failed to fetch|network|load failed/i, 'Tidak bisa terhubung ke server. Periksa koneksi internet lalu coba lagi.'],
      ];
      // Pesan dari fungsi database (sudah berbahasa Indonesia)
      if (/^(Hanya admin|Minimal harus ada satu admin|Peran tidak dikenal|Peserta tidak ditemukan)/.test(m)) return m;
      if (/set_user_role|role_changes/.test(m) && /could not find|does not exist|schema cache/i.test(m)) return 'Fitur kelola peran belum aktif di database. Jalankan supabase/002_kelola_peran.sql di Supabase SQL Editor.';
      for (const [re, t] of map) if (re.test(m)) return t;
      return m ? `Terjadi kesalahan: ${m}` : 'Terjadi kesalahan. Coba lagi.';
    },
  });

  // Dipanggil halaman setiap kali progres berubah
  AA.sync = (o) => (Cloud.user ? Cloud.op(o) : Promise.resolve());
})();
