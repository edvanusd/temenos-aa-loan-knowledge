# Temenos AA Loan — Knowledge Base

Situs belajar Temenos Transact **Arrangement Architecture (AA) Lending**: 14 modul kursus, pendalaman konsep, property class explorer, simulator saldo, kalkulator angsuran, simulator overdue, quiz, bank interview, glosarium, dan asisten pencarian materi.

Live: https://edvanusd.github.io/temenos-aa-loan-knowledge/

## Struktur

```
output/
  index.html        shell aplikasi (v2)
  v1.html           versi lama, tetap bisa dibuka
  assets/
    app.css         design system "ledger" (tema terang & gelap)
    data.js         SEMUA konten materi (modul, property class, quiz, glosarium, interview, KB)
    core.js         util, progres (localStorage), indeks pencarian, router, navigasi, command palette
    pages.js        beranda + siklus arrangement, pembaca modul, halaman pendalaman
    tools.js        quiz, bank interview, glosarium, kalkulator, simulator overdue, asisten
```

Tanpa build step dan tanpa framework — cukup file statis.

## Menambah / mengubah materi

Semua konten ada di `output/assets/data.js`:

- `MODS.mX.body` — blok modul: `['h', judul]`, `['p', html]`, `['list', [..]]`, `['tbl', [[header..],[baris..]], catatan?]`, `['flow', [langkah..], catatan?]`, `['box', rumus]`, `['iq', [[tanya, jawab]..]]`.
  Tabel dengan header `Entry | Amount` dan baris `Debit — …` / `Credit — …` otomatis tampil sebagai jurnal Dr/Cr.
- `PC` — property class, `QUIZ` — soal (`a` = indeks jawaban benar), `GLOSSARY`, `IVQ` — bank interview, `KB` — ringkasan untuk asisten.

Indeks pencarian (⌘K / Ctrl K) dan asisten dibangun otomatis dari data ini.

## Menjalankan lokal

```
cd output && python3 -m http.server 8000
```

## Publikasi

GitHub Pages melayani branch `gh-pages`. Salin isi `output/` ke root branch `gh-pages` lalu push.
