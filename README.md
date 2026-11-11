# Temenos AA Loan — Knowledge Base

Situs belajar Temenos Transact **Arrangement Architecture (AA) Lending**: 14 modul kursus, pendalaman konsep, property class explorer, simulator saldo, kalkulator angsuran, simulator overdue, quiz, bank interview, glosarium, dan asisten pencarian materi. Semua nominal dalam **Rupiah (IDR)**.

Peserta **daftar & login** (Supabase Auth). Progres modul, setiap sesi quiz, kartu interview/glosarium yang dikuasai, dan riwayat masuk tersimpan di database Postgres (Supabase). Admin punya halaman **Admin peserta** untuk melihat hasil semua peserta dan mengunduh CSV.

Live: https://edvanusd.github.io/temenos-aa-loan-knowledge/

## Struktur

```
output/
  index.html        shell aplikasi (v2)
  v1.html           versi lama, tetap bisa dibuka
  assets/
    app.css         design system "ledger" (tema terang & gelap)
    config.js       URL & publishable key Supabase, opsi wajib login
    data.js         SEMUA konten materi (modul, property class, quiz, glosarium, interview, KB)
    core.js         util, cache progres, indeks pencarian, router + login wall, navigasi, command palette
    cloud.js        Supabase: login/daftar, muat & simpan progres, antrean jika offline, query admin
    pages.js        beranda + siklus arrangement, pembaca modul, halaman pendalaman
    tools.js        quiz, bank interview, glosarium, kalkulator, simulator overdue, asisten
    account.js      halaman masuk, daftar, lupa/reset password, akun & hasil belajar, admin peserta
supabase/
  schema.sql        tabel, Row Level Security, view ringkasan peserta (jalankan di SQL Editor)
  002_kelola_peran.sql  tambahan: fungsi set_user_role + log role_changes (untuk database lama)
```

Tanpa build step dan tanpa framework — cukup file statis.

## Menambah / mengubah materi

Semua konten ada di `output/assets/data.js`:

- `MODS.mX.body` — blok modul: `['h', judul]`, `['p', html]`, `['list', [..]]`, `['tbl', [[header..],[baris..]], catatan?]`, `['flow', [langkah..], catatan?]`, `['box', rumus]`, `['iq', [[tanya, jawab]..]]`.
  Tabel dengan header `Entry | Amount` dan baris `Debit — …` / `Credit — …` otomatis tampil sebagai jurnal Dr/Cr.
- `PC` — property class, `QUIZ` — soal (`a` = indeks jawaban benar), `GLOSSARY`, `IVQ` — bank interview, `KB` — ringkasan untuk asisten.

Indeks pencarian (⌘K / Ctrl K) dan asisten dibangun otomatis dari data ini.

## Akun & database (Supabase)

1. **Buat tabel** — Supabase → SQL Editor → New query → tempel isi `supabase/schema.sql` → Run. Aman dijalankan ulang.
2. **URL situs** — Authentication → URL Configuration:
   - Site URL: `https://edvanusd.github.io/temenos-aa-loan-knowledge/`
   - Redirect URLs: tambahkan `https://edvanusd.github.io/temenos-aa-loan-knowledge/**`
   Ini dipakai tautan konfirmasi email & reset password.
3. **Konfirmasi email (opsional)** — Authentication → Sign In / Providers → Email → *Confirm email*.
   Jika aktif, peserta harus klik tautan di email sebelum bisa masuk. Email bawaan Supabase dibatasi
   beberapa email per jam; untuk tim besar matikan opsi ini atau pasang SMTP sendiri.
4. **Kunci di website** — `output/assets/config.js`: `supabaseUrl` dan `supabaseKey` (publishable/anon key).
   Jangan pernah menaruh secret / service_role key di repo.
5. **Jadikan akunmu admin** — daftar dulu di website, lalu jalankan di SQL Editor:
   `update public.profiles set role = 'admin' where email = 'email-kamu@domain.com';`
   Muat ulang website; menu **Admin peserta** dan **Kelola peran** muncul di sidebar.
6. **Kelola peran dari website** — untuk database yang dibuat sebelum fitur ini, jalankan
   `supabase/002_kelola_peran.sql` sekali di SQL Editor (instalasi baru: sudah termasuk di `schema.sql`).
   Admin lalu bisa menjadikan akun lain admin atau peserta lewat menu **Kelola peran**. Fungsi
   `set_user_role` menolak non-admin, tidak mengizinkan admin terakhir diturunkan, dan setiap
   perubahan dicatat di tabel `role_changes`.

Tabel: `profiles`, `login_events`, `module_progress`, `quiz_attempts`, `card_progress`, `role_changes`, view `learner_summary`.
Peserta hanya bisa membaca/menulis datanya sendiri; admin bisa membaca semua (RLS). Login hanya
mengatur akses tampilan — file materi tetap file statis publik di GitHub Pages.

Catatan: project Supabase gratis dijeda otomatis setelah ±7 hari tanpa aktivitas; buka dashboard
Supabase untuk mengaktifkannya kembali. `requireLogin: false` di `config.js` membuat materi bisa dibuka
tanpa login (login tetap tersedia untuk menyimpan progres).

## Menjalankan lokal

```
cd output && python3 -m http.server 8000
```

## Publikasi

GitHub Pages melayani branch `gh-pages`. Salin isi `output/` ke root branch `gh-pages` lalu push.
