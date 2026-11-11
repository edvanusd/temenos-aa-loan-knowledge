/* =========================================================
   Konfigurasi database (Supabase)
   Isi dua nilai di bawah dari Supabase → Project Settings → API Keys.
   Keduanya memang dirancang publik (dipasang di website); data tetap
   dilindungi Row Level Security di supabase/schema.sql.
   JANGAN pernah menaruh secret key / service_role key di sini.
   Jika dikosongkan, situs berjalan di mode lokal (tanpa login).
   ========================================================= */
window.AA_CONFIG = {
  supabaseUrl: 'https://ytrooqfzbpimtmrbsurx.supabase.co',
  supabaseKey: 'sb_publishable_L07Xf4NyD2jlldjwHX6lKQ_WHWgEHWU', // publishable key (aman untuk publik)
  requireLogin: true // true = materi hanya bisa dibuka setelah login
};
