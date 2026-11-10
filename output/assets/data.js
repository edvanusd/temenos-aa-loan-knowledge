/* Konten materi AA Loan — diekstrak dari versi 1 (v1.html). Edit di sini untuk menambah/mengubah materi. */
window.AA_DATA = {
 "PC": [
  {
   "id": "CUSTOMER",
   "name": "Customer",
   "attr": "DATED, NON.TRACKING",
   "prefix": "— (null)",
   "mandatory": "Wajib",
   "klik": "Mandatory untuk semua Arrangement.",
   "pts": [
    "Mandatory — tidak bisa Tracking, bersifat Dated.",
    "Balance Prefix = Null.",
    "Product Condition: Owner, Primary Owner, Other Party, Role & Notes — biasanya Negotiable di level Arrangement.",
    "Primary Owner dipakai untuk Accounting, Reporting & Limit; tidak bisa diubah setelah Arrangement di-authorise.",
    "Other Party (Guarantor, Co-signatory) didefinisikan di tabel AA.PARTY.ROLE.",
    "Limit yang bisa dipakai hanyalah limit milik Primary Owner."
   ],
   "ws": "Workshop 1–2: lihat Property Class CUSTOMER, buat Property & Product Condition dengan semua atribut negotiable tanpa restriksi."
  },
  {
   "id": "ACCOUNT",
   "name": "Account",
   "attr": "DATED",
   "prefix": "CUR, DUE, AGE, UNC, UND",
   "klik": "Akun yang menampung saldo pokok Arrangement.",
   "pts": [
    "Dibutuhkan untuk semua Arrangement finansial; menampung saldo Principal.",
    "Category: Customer-type 1000–9999, Non-contingent (hindari range Nostro/Vostro), biasanya Non-Negotiable.",
    "Posting Restrict: bisa override untuk Debit / Credit / semua transaksi.",
    "Title, Short Title & Mnemonic bisa diubah di level Arrangement.",
    "Currency: default dari Activity New Arrangement; tidak bisa diubah setelah authorisation.",
    "Base Date Type: AGREEMENT (mulai dari tanggal arrangement) atau START (dari disbursement pertama).",
    "Bus Day Centres: holiday table negara/region; Date Convention: Forward/Backward/Forward Same Month/Calendar; Date Adjustment: VALUE atau PERIOD."
   ],
   "ws": "Workshop 3–4: buat Property ACCOUNT, lalu Product Condition: Category 3107, Base Date Type AGREEMENT, CATEGORY non-negotiable."
  },
  {
   "id": "OFFICERS",
   "name": "Officers",
   "attr": "DATED, TRACKING",
   "prefix": "—",
   "klik": "Petugas yang bertanggung jawab atas Produk/Arrangement.",
   "pts": [
    "Bisa Tracking; Update Action mengubah nilai field di level Arrangement; tidak menghasilkan accounting entry.",
    "Primary Officer: officer utama, Id-nya disalin ke record account; valid di DEPT.ACCT.OFFICER.",
    "Other Officers punya Role yang valid di AA.OFFICER.ROLE.",
    "Default officer = Account Officer di record CUSTOMER."
   ],
   "ws": "Workshop 5–6: Other Officer code 20 & 21 dengan role Application & Approval; DEFAULT.NEGOTIABLE = Yes."
  },
  {
   "id": "TERM.AMOUNT",
   "name": "Term Amount",
   "attr": "CCY, DATED, NON.TRACKING",
   "prefix": "CUR, TOT",
   "klik": "Jumlah komitmen (commitment) dan jangka waktu pinjaman.",
   "pts": [
    "Mewakili Committed Amount + Repayment Term; currency specific.",
    "Committed Amount: jumlah yang dipinjamkan; Change Amount untuk menaikkan/menurunkan commitment di level Arrangement.",
    "Repayment Term: periode pelunasan; Maturity Date dihitung dari Agreement Date + Term.",
    "Revolving: No / Payment / Prepayment — mengembalikan available commitment saat repayment.",
    "Update Limits: update atau tidak record LIMIT dengan commitment amount.",
    "Disbursement tidak otomatis — dipicu transaksi dengan transaction code \"disbursement\" (FT, Teller, Cash Pooling); tunduk pada sisa commitment & Activity Restriction."
   ],
   "ws": "Workshop 7–8: default 40.000 (min 20.000, max 200.000 dengan override), term 3Y (1–5Y, di bawah 1Y boleh dengan override, di atas 5Y tidak), Revolving No non-negotiable."
  },
  {
   "id": "ACTIVITY.MAPPING",
   "name": "Activity Mapping",
   "attr": "DATED, MERGE, TRACKING.ONLY",
   "prefix": "—",
   "klik": "Jembatan antara aplikasi eksternal (FT/Teller) dan aktivitas AA.",
   "pts": [
    "Hanya satu Property boleh ditempel di Product Group; nilai tidak bisa dilihat/diedit di level Arrangement.",
    "Transaction Code aplikasi lain (FT via FT.TXN.TYPE.CONDITION, Teller via TELLER.TRANSACTION, Cash Pooling via AC.SWEEP.TYPE) memetakan ke AA Activity.",
    "Default Activity untuk unmapped Transaction Code Debit & Credit bisa ditentukan.",
    "Contoh: TXN 850 → LENDING-DISBURSE-COMMITMENT; TXN 851 → LENDING-APPLYPAYMENT-PR.PRINCIPAL.DECREASE."
   ],
   "ws": "Workshop 9–10: map TXN 850 & 851, Default Credit = LENDING-CREDIT-ARRANGEMENT, Default Debit = LENDING-DEBIT-ARRANGEMENT, DEFAULT.NEGOTIABLE No."
  },
  {
   "id": "INTEREST",
   "name": "Interest",
   "attr": "DATED, CCY, MULTIPLE, TRACKING, FORWARD.DATED",
   "prefix": "ACC, DUE, AGE",
   "klik": "Komponen bunga pinjaman (bisa lebih dari satu).",
   "pts": [
    "Bank bisa punya beberapa interest property: principal interest, penalty interest, dst. (USD 5%, GBP 4%, dst.).",
    "Tipe: Fixed (rate ditentukan), Floating (Id BASIC.RATE.TEXT / BASIC.INTEREST), Periodic (Id PERIODIC.INTEREST, default rate berdasarkan TERM, bisa di-interpolate, bisa di-reset berkala).",
    "Jika user input rate sendiri, sistem tidak default dari BASIC.INTEREST/PERIODIC.INTEREST.",
    "Tiered rates: SINGLE, LEVEL, BAND, MIXED — tiap tier bisa beda rate type, margin, min & max.",
    "Tier Amount atau Tier Percent (tidak keduanya) untuk kalkulasi Band.",
    "Interest Day Basis: A 360/360, B 366/360, C 366/366, D 360/366, E 366/365, F 360/365, dst.",
    "Accrual Rule: include first / last / both; Compounding: DAILY, WEEKn, Mnn, TWMTH, Nnnn.",
    "Calculation Threshold: max debit balance tanpa bunga; Negative Rate bisa diatur.",
    "Activities: Accrue, Periodic Reset, Change — bisa memicu recalculation & perubahan Payment Schedule."
   ],
   "ws": "Workshop 11–14: buat condition fixed 6% (5,5–6,5% override, basis B, tier SINGLE), floating (BASIC.INTEREST 1, margin 0,5%→0,25–0,75%, min 7% max 9%, basis C), periodic (table 90, interpolasi, reset 2x setahun, margin 0,75%, basis A)."
  },
  {
   "id": "PAYMENT.SCHEDULE",
   "name": "Payment Schedule",
   "attr": "DATED, CCY, FORWARD.DATED",
   "prefix": "—",
   "klik": "Aturan & jadwal bawaan pembayaran pinjaman.",
   "pts": [
    "Payment Type: ACTUAL (repayment property terhitung: interest & charge), CONSTANT (annuity — butuh Term Amount + Interest property), LINEAR (butuh Term Amount), OTHER (user defined).",
    "Payments Method: due atau capitalised; residual amount di tanggal pembayaran terakhir.",
    "Payment Frequency vs Due Frequency (Due = frekuensi property dibuat jatuh tempo; utama & interest harus sama dengan payment frequency, charge boleh beda).",
    "Billing: bill dibuat pada due date atau dimajukan beberapa hari; bill dengan due date sama bisa digabung.",
    "Recalculation: terjadwal (RECALC.FREQUENCY) atau karena activity (ON.ACTIVITY: Disburse, Repay, Change Interest); RECALCULATE: Payment / Term / Residual / Nothing.",
    "Tipe pembayaran khusus: one-off additional/special/zero, regular zero (seasonal), regular additional, regular special.",
    "Bill = Make Due activity; dasar overdue & delinquency. Credit Balance menampung kelebihan bayar; otomatis dipakai saat bill due via field Repay from Credit Balance (APPLY.PAYMENT)."
   ],
   "ws": "Workshop 15–18: interest-only monthly + recalc kuartalan; linear monthly single bill + recalc saat DISBURSE-COMMITMENT & CHANGE.TERM; constant weekly + recalc saat DISBURSE & CHANGE-REPAYMENT.SCHEDULE."
  },
  {
   "id": "LIMIT",
   "name": "Limit",
   "attr": "DATED, NON.TRACKING",
   "prefix": "—",
   "klik": "Referensi limit (plafon) untuk Arrangement.",
   "pts": [
    "Limit Product ditunjukkan di field LIMIT.REFERENCE; umumnya level Arrangement & non tracking.",
    "Limit harus milik Primary Owner.",
    "Single Limit: Yes = eksklusif satu arrangement; No = dipakai arrangement mana pun milik customer sama.",
    "Netting: saldo kredit arrangement ditambahkan ke overdraft limit untuk arrangement lain (hanya shared limit).",
    "Arrangement boleh dibuat tanpa Limit — override muncul saat activity DISBURSE."
   ],
   "ws": "Workshop 19–20: limit shared + netting, hanya LIMIT.REFERENCE yang negotiable."
  },
  {
   "id": "PAYMENT.RULES",
   "name": "Payment Rules",
   "attr": "DATED, MULTIPLE, TRACKING",
   "prefix": "—",
   "klik": "Aturan alokasi dana saat pembayaran masuk.",
   "pts": [
    "Satu pembayaran bisa diterapkan ke banyak bill dan banyak jenis amount.",
    "Application Type: BILL.PROPERTY (bayar dues property tertentu lintas bill), BILL.DATE (bayar bill tertentu dulu, dalam bill urut property), CURRENT (langsung ke saldo current).",
    "Payments Order: Oldest First / Oldest Last (tidak boleh untuk CURRENT).",
    "Property Application Type: DUE atau CURRENT per property dalam Property Sequence.",
    "Remainder Activity: menangani kelebihan pembayaran — memicu Payment Rules Property lain; jika gagal, diproses Default Activity di ACCOUNTING.",
    "MAKE.BILL.DUE: boleh menagih bill yang belum jatuh tempo."
   ],
   "ws": "Workshop 21–23: bayar bill by property (PRINDECREASEFEE, DISBURSEMENTFEE, NEWARRFEE, PRINCIPALINT, ACCOUNT, oldest first, remainder → PR.PRINCIPAL.DECREASE, MAKE.BILL.DUE Yes) dan by bill date."
  },
  {
   "id": "OVERDUE",
   "name": "Overdue",
   "attr": "DATED, TRACKING",
   "prefix": "—",
   "klik": "Status aging tagihan (Grace, Delinquent, NAB).",
   "pts": [
    "Hanya bisa TRACKING. Ageing status didefinisikan di virtual table AA.OVERDUE.STATUS (EB.LOOKUP).",
    "Ageing Type: by days (numerik) atau by bills (angka + \"B\", mis. 1B, 2B); nilai 0 = overdue di hari yang sama (hanya boleh satu status).",
    "Chaser Notice: notice otomatis N hari setelah status; bisa berkala.",
    "Age All Bills: pada status tertentu semua bill di bawahnya di-age ke status itu (seluruh pinjaman menua).",
    "Suspend Arrangement: berhenti booking P&L, accrual ke kategori CRF khusus — butuh AGE.ALL.BILLS = YES.",
    "Move Balances: pindahkan amount ke Status Balance (mis. delinquent).",
    "Value date accounting: DUE (tanggal jatuh tempo bill) / STATUS (tanggal pindah status) / kosong (financial date).",
    "Tolerance: tidak meng-age jika outstanding dalam batas % dari bill atau nominal per currency; Tolerance Action = REPAY atau REMAIN.",
    "Bill Settlement: Delinquent basis (deemed settled saat total repayment ≥ bill amount) atau Financial basis (semua saldo benar2 lunas). Activities pemicu: LENDING-APPLYPAYMENT-PAYMENT.RULES, LENDING-UPDATE-OVERDUE."
   ],
   "ws": "Workshop 24–26: Grace 1 hari; Delinquent 5 hari + notice; NAB 60 hari + suspend + age all bills; tolerance 2% REMAIN / USD 5 REPAY."
  },
  {
   "id": "CHARGE",
   "name": "Charge",
   "attr": "DATED, OPT.CCY, MULTIPLE, TRACKING, FORWARD.DATED",
   "prefix": "ACC, DUE, AGE",
   "klik": "Biaya-biaya (fee) pada pinjaman.",
   "pts": [
    "Charge property boleh banyak; currency optional.",
    "Charge Type: Flat (amount ditetapkan, mis. USD 50) atau Calculated (persentase dari balance, mis. 2% dari transaction amount).",
    "Calculation Type: Flat / Percentage / Unit (USD 2 per transaction); Charge Rate wajib untuk Percentage, Charge Amount wajib untuk Flat & Unit.",
    "Tiered: Level, Banded, Groups; Min & Max charge per tier (tidak untuk Flat).",
    "Calculation Threshold: base amount minimum agar dihitung (bukan Flat).",
    "Free Amount: potongan dari charge terhitung (rebate)."
   ],
   "ws": "Workshop 27–30: Property SUSPEND; condition flat USD 100; tiered 0/2%/1,5%/1% dengan min-max; rebate 50."
  },
  {
   "id": "ACTIVITY.CHARGES",
   "name": "Activity Charges",
   "attr": "DATED, TRACKING, FORWARD.DATED",
   "prefix": "—",
   "klik": "Charge yang dipicu activity tertentu.",
   "pts": [
    "Activity attracting charge: valid di AA.ACTIVITY; berapa pun activity bisa didefinisikan.",
    "Charge property terpicu saat activity terjadi; bisa dibiayakan (billed) saat kejadian atau ditunda beberapa hari.",
    "Bisa billed atau capitalised; tidak ikut aging. Contoh: disbursement charge, arrangement fee."
   ],
   "ws": "Workshop 31–32: charge saat arrangement dibuka, property NEWARRFEE, dibuat DUE saat activity."
  },
  {
   "id": "CHARGE.OVERRIDE",
   "name": "Charge Override",
   "attr": "DATED, NON.TRACKING, TRIGGER",
   "prefix": "—",
   "klik": "Kontrol amount charge yang bisa dimodifikasi/waived user.",
   "pts": [
    "Muncul di arrangement setelah activity charge tervalidasi.",
    "Charge Actual Amount: Null = default CHG.AMT dipakai; 0 = charge di-waive sepenuhnya; angka = amount baru (jika negotiable).",
    "Jika lebih dari satu charge untuk activity sama, user bisa modify/waive semuanya.",
    "Charge saat payoff, repayment & disbursement tidak bisa dimodifikasi/waived."
   ],
   "ws": "Workshop 33–34: 3 charge property (NEWARRFEE, DISBURSEMENTFEE, PRINDECREASEFEE), NEWARRFEE = 500."
  },
  {
   "id": "PERIODIC.CHARGES",
   "name": "Periodic Charges",
   "attr": "DATED, OPT.CCY",
   "prefix": "—",
   "klik": "Pengaturan deferred charge berkala.",
   "pts": [
    "INC.ALL.DEF.CHGS: pada tanggal terjadwal, semua deferred charge dijadikan due.",
    "DEFERRED.CHARGE: charge yang di-defer (multi-value).",
    "Keduanya bisa di set di level product atau arrangement."
   ]
  },
  {
   "id": "ACTIVITY.RESTRICTION",
   "name": "Activity Restriction",
   "attr": "DATED, CCY, MULTIPLE, TRACKING, FORWARD.DATED",
   "prefix": "—",
   "klik": "Pembatasan penuh atau parsial atas sebuah activity.",
   "pts": [
    "Multiple properties; product condition harus dibuat per currency.",
    "Full restriction: activity tidak boleh dijalankan sama sekali (error message wajib).",
    "Partial/conditional: boleh dengan override (override message wajib) — mis. >5 repayment/tahun, disbursement kelipatan 100.",
    "Dikontrol Periodic Rules. Periodic attributes bawaan: CURRENT/TOTAL LOAN REPAY TOLERANCE, TRANSACTION AMOUNT MINIMUM/MAXIMUM/MULTIPLE/TOTAL, TRANSACTION COUNT TOTAL."
   ],
   "ws": "Workshop 39–41: larang change of term (error AC-CANT.ENT.PENDING.CAT.CODE); minimum disbursement 200 dengan override."
  },
  {
   "id": "CHANGE.PRODUCT",
   "name": "Change Product",
   "attr": "DATED, TRACKING",
   "prefix": "—",
   "klik": "Perpindahan arrangement ke produk lain.",
   "pts": [
    "Allowed Product: daftar produk tujuan; kosong = semua; hanya sesama Product Group.",
    "Scheduled switch: CHANGE.DATE (tanggal spesifik, date convention diabaikan), CHANGE.PERIOD, PRIOR.DAYS (switch dimajukan; nilai efektif = schedule date).",
    "Change Activity: ROLLOVER / RESET / CHANGE.PRODUCT — wajib jika renewal date ditentukan.",
    "Mayoritas kondisi ditimpa default produk baru; kecuali Customer, Account, Term Amount & Limit.",
    "Status di AA.ARRANGEMENT: PROCESSED / CURRENT / SCHEDULED.",
    "RENEGOTIATE: ubah kondisi banyak property sekaligus."
   ],
   "ws": "Workshop 43–44: change period 6 bulan, activity LENDING-RESET-ARRANGEMENT, switch 3 hari di muka."
  },
  {
   "id": "PAYOFF",
   "name": "Payoff",
   "attr": "DATED, TRACKING",
   "prefix": "—",
   "klik": "Simulasi & pelunasan dini penuh.",
   "pts": [
    "Expiry days: hari kerja berlaku payoff bill; payoff dihapus setelah expiry.",
    "Settlement activity otomatis saat payoff disimulasikan / dibayar via activity SETTLE.",
    "Auto settlement future dues (jika Yes, Settlement Due Activity wajib — memicu Apply Payment).",
    "Payoff statement = informasi customer, lewat simulation activity (SIMULATION.RUNNER, activity LENDING-CALCULATE-PAYOFF).",
    "Prepayment charge bisa berupa activity charge atau periodic rule charge.",
    "Credit di UNC Account property otomatis dipakai menyetel dues."
   ],
   "ws": "Workshop 45–46: settlement LENDING-APPLYPAYMENT-PR.CURRENT.BALANCES, auto settlement → PR.PAYOFF."
  },
  {
   "id": "SETTLEMENT",
   "name": "Settlement",
   "attr": "CCY, DATED",
   "prefix": "—",
   "klik": "Metode settlement pembayaran (Direct Debit).",
   "pts": [
    "Settlement method: hanya DD (Direct Debit).",
    "Mandate reference: record DD.DDI (status AVAILABLE), di-update via activity LENDING-UPDATE-SETTLEMENT.",
    "Akun arrangement harus currency lokal perusahaan; DD transaction code harus dipetakan via ACTIVITY.MAPPING.",
    "Remainder activity PAYMENT.RULES harus LENDING-CREDIT-ARRANGEMENT; payment rules DD diset di APPLY.PAYMENT (PAYMENT.SCHEDULE).",
    "Payment type: ACTUAL, CONSTANT, LINEAR, CHARGE; bisa satu mandate untuk charge dan satu untuk principal/interest."
   ],
   "ws": "Workshop 47–48: settlement ACTUAL & LINEAR via DD."
  },
  {
   "id": "CLOSURE",
   "name": "Closure",
   "attr": "DATED, TRACKING",
   "prefix": "—",
   "klik": "Penutupan arrangement.",
   "pts": [
    "Closure Type: MATURITY (proses saat maturity date) atau BALANCE (saat semua saldo nol).",
    "Closure Method: Automatic atau Manual.",
    "Closure Period: kapan activity CLOSURE diproses untuk closure otomatis.",
    "Posting Restrict: code posting restriction penutupan account."
   ],
   "ws": "Workshop 49–51: otomatis saat maturity / saldo nol, period 10 hari / nil, posting restriction 90."
  },
  {
   "id": "ACCOUNTING",
   "name": "Accounting",
   "attr": "DATED, MERGE, TRACKING.ONLY",
   "prefix": "—",
   "klik": "Aturan accounting (alokasi) tiap property.",
   "pts": [
    "Tidak bisa dilihat/diedit di level Arrangement; Update Action tidak menghasilkan accounting entry.",
    "Rules untuk setiap property yang butuh accounting entries: ACCT.ACTION (action property; harus ACTION dengan ACCOUNTING=Yes di AA.PROPERTY.CLASS.ACTION), ACCT.RULE (valid di AC.ALLOCATION.RULE), PROPERTY.",
    "Amortisasi charge/komisi: ACCRUE.AMORT = AMORT, ACCRUE.PERIOD = MATURITY atau period (1M, 1Y)."
   ],
   "ws": "Workshop 64–65: lihat condition LENDING dan allocation rules tiap action property."
  },
  {
   "id": "BALANCE.MAINTENANCE",
   "name": "Balance Maintenance",
   "attr": "DATED, NON.TRACKING, CCY, MULTIPLE, ARRANGEMENT",
   "prefix": "—",
   "klik": "Migrasi & penyesuaian saldo/bill (take-over).",
   "pts": [
    "Untuk take-over kontrak dari sistem legacy / modul lending T24 lama ke AA.",
    "Actions: Capture Bill, Capture Balance, Adjust Bill, Adjust Balance, Write Off Bill, Write Off Balance, Adjust All.",
    "Tanggal capture/adjust sebelum start date arrangement; sisi lainnya via allocation rules (suspense/wash account).",
    "Urutan migrasi: take-over arrangement → capture outstanding principal → capture overdue bills → capture accruals."
   ],
   "ws": "Workshop 70–71: buat property & product condition, semua atribut negotiable."
  },
  {
   "id": "PRESENTATION",
   "name": "Presentation",
   "attr": "—",
   "prefix": "—",
   "klik": "Tampilan/layer presentasi arrangement.",
   "pts": [
    "Mengatur bagaimana arrangement ditampilkan (layer presentation, default LENDING untuk retail lending)."
   ]
  },
  {
   "id": "MESSAGING",
   "name": "Messaging",
   "attr": "—",
   "prefix": "—",
   "klik": "Pesan/notifikasi terkait activity.",
   "pts": [
    "Mengatur pesan yang terkait dengan activity arrangement (mis. chaser notice, notice messaging)."
   ]
  },
  {
   "id": "API",
   "name": "API",
   "attr": "—",
   "prefix": "—",
   "klik": "Antarmuka API activity.",
   "pts": [
    "Menyediakan aktivitas layanan API untuk arrangement (mis. payoff service, activity API mapping)."
   ]
  }
 ],
 "KB": [
  {
   "k": "aa arrangement overview product loan",
   "a": "AA Arrangement adalah kontrak pinjaman (loan) yang dibangun dari komponen Property Class. Overview produk AA Loan mencakup: Arrangement Level (Constant / Fixed / Floating; Periodic / Linear / Repayment; User defined Band / Limit / Bullet; Mixed; Actual). Arrangement Conditions berasal dari Loan Product; Disbursement bisa Single atau Multiple, Negotiable atau Non-Negotiable; ada Loan Tracking / Non Tracking Account, Bills for payment, Excess & Under payment."
  },
  {
   "k": "dependencies customer account core delivery accounting limits static tables",
   "a": "AA menggunakan dependensi: CUSTOMER, ACCOUNT, core dependencies (Delivery, Accounting, Limits) dan tabel-tabel Static lainnya."
  },
  {
   "k": "interest related basic.rate.text floating periodic offer rate generated daily back dated",
   "a": "Dependensi Interest AA: BASIC.RATE.TEXT (floating interest) dan BASIC.INTEREST. Offer rate digunakan untuk AA Loans; generated daily dan perubahan back-dated juga dimungkinkan. Periodic interest memakai tabel PERIODIC.INTEREST."
  },
  {
   "k": "currency country region holiday currency.param currency market bus.day.centres",
   "a": "Dependensi Currency: COUNTRY, REGION, HOLIDAY, CURRENCY.PARAM, CURRENCY, CURRENCY.MARKET. Negara/Region bisa ditunjuk di field BUS.DAY.CENTRES pada Account Product Condition sehingga saat input Arrangement, hari libur negara tsb dicek dan override digenerate. Currency dipakai di field CURRENCY pada tabel AA.PRODUCT.DESIGNER."
  },
  {
   "k": "interest day basis 360 366 365 a a1 a2 b c d e f day count",
   "a": "Interest Day Basis = numerator/denominator: A 360/360; A1 360/360 (30 hari/bulan); A2 360/360 (360 hari/tahun, bunga tambahan Februari dihitung hari terakhir); B 366/360; C 366/366; D 360/366; E 366/365; F 360/365 (bunga Februari dihitung hari kedua terakhir); H 30/356; S special."
  },
  {
   "k": "tables building components re-usable property class periodic attribute activity source calc",
   "a": "Tabel untuk membangun komponen reusable: AA.PROPERTY.CLASS, AA.PROPERTY, AA.PERIODIC.ATTRIBUTE.CLASS, AA.PERIODIC.ATTRIBUTE, AA.ACTIVITY.CLASS, AA.ACTIVITY, AA.PRD.DES.<PROPERTY.CLASS>, AA.SOURCE.CALC.TYPE, AA.PROPERTY.CLASS.ACTION. Yang dirilis Temenos: AA.PROPERTY.CLASS, AA.PERIODIC.ATTRIBUTE.CLASS, AA.PROPERTY.CLASS.ACTION, AA.ACTIVITY.CLASS. Yang di-setup saat implementasi: AA.PROPERTY, AA.PRD.DES.<PROPERTY.CLASS>, AA.PERIODIC.ATTRIBUTE, AA.SOURCE.CALC.TYPE — bisa dipakai lintas produk."
  },
  {
   "k": "aa.property.class type ccy opt.ccy dated multiple merge forward.dated tracking balance prefix product line lending",
   "a": "AA.PROPERTY.CLASS dirilis Temenos untuk mendefinisikan Actions & Attributes. TYPE field mengontrol: CCY, OPT.CCY, DATED, MULTIPLE, MERGE, FORWARD.DATED, TRACKING, NON.TRACKING, TRACKING.ONLY, ARRANGEMENT, TRIGGER. Product Line prefix: ACCOUNTS, DEPOSITS, INTERNET.SERVICES, LENDING, PROXY.SERVICES, SAVINGS, OTHER. Balance prefix (BALANCE.PREFIX field): CUR, ACC, DUE, AGE, dll."
  },
  {
   "k": "aa.property named type instance product group suspend overdues product only accounting rules",
   "a": "AA.PROPERTY adalah named type/instance dari Property Class, ditempel ke Product Group lalu diturunkan ke Product. Bila Property Class mengizinkan, beberapa property sekelas bisa dipakai dalam satu Product. TYPE property: PRODUCT.ONLY (detail tidak terlihat/diamenden di level Arrangement, mis. ACCOUNTING rules), SUSPEND (suspend income — hanya untuk INTEREST & CHARGE), SUSPEND.OVERDUES (suspend overdue income; hanya jika SUSPEND juga dipilih)."
  },
  {
   "k": "aa.prd.des product condition fixed.rate currency effective date id",
   "a": "AA.PRD.DES.<Property Class> mendefinisikan Product Condition per Property Class, mis. AA.PRD.DES.TERM.AMOUNT, AA.PRD.DES.ACCOUNT. Bisa dibuat beberapa kondisi berbeda dan beberapa record ber-tanggal. Field kondisi mewakili atribut Property Class. Date-specific bila property class DATED; currency-specific bila diizinkan (untuk multi-currency harus dibuat per currency; currency bisa OPT.CCY mis. Charge). Currency & Effective Date menjadi bagian Id, contoh: FIXED.RATE-USD-20100101; FIXED.INTEREST-GBP-20100101. Kondisi bisa ber-value date masa depan."
  },
  {
   "k": "default negotiable negotiation rules nr.attribute options type value message comparison error override fix value range",
   "a": "Negotiation rules: DEFAULT.NEGOTIABLE (mandatory, Yes/No — apakah semua atribut bisa dinegosiasikan; attribute-level selalu menimpa). DEFAULT.ATTR.OPTION: RESETTING (kondisi direset dari produk saat rollover/reset/change product) atau NON-RESETTING (kondisi dipertahankan dari arrangement). Field per atribut: NR.ATTRIBUTE (atribut property class), NR.OPTIONS (negotiable / non-negotiable), NR.TYPE (COMPARISON.TYPE: Equal, Like, Range, Mandatory, Fix Value), NR.VALUE, NR.MESSAGE (ERROR atau OVERRIDE). Contoh: usual term 5 tahun, bisa dinegosiasikan hanya antara 3–10 tahun."
  },
  {
   "k": "aa.property.class.action actions accounting entry product line",
   "a": "AA.PROPERTY.CLASS.ACTION menyimpan informasi action per PROPERTY CLASS: daftar action, apakah action menghasilkan accounting entry atau tidak, dan Product Line."
  },
  {
   "k": "customer property class primary owner other party guarantor party role limit sanctioned",
   "a": "CUSTOMER Property Class: mandatory, non-tracking, dated, balance prefix null. Primary Owner dipakai untuk Accounting, Reporting & Limit dan tidak dapat diganti setelah authorisation; otomatis masuk daftar owner. Other owners ditambah manual. Other Party (Guarantor, Co-signatory) didefinisikan di AA.PARTY.ROLE. Hanya limit milik Primary Owner yang dapat dipakai. Customer harus record valid di aplikasi CUSTOMER."
  },
  {
   "k": "account property class category posting restrict title mnemonic base date type bus day centres date convention adjustment currency",
   "a": "ACCOUNT Property Class: DATED, balance prefix CUR/DUE/AGE/UNC/UND. Menahan saldo principal. Category: Customer-type 1000–9999, non-contingent, non-negotiable. Posting Restrict (debit/credit/all → override). Title/Short Title/Mnemonic (mnemonic = alternate Id, bisa diubah di arrangement). Currency default dari New Arrangement Activity, tak bisa diubah setelah authorisation. Base Date Type: AGREEMENT / START (disbursement pertama). BUS.DAY.CENTRES (holiday), Date Convention (Forward/Backward/Forward Same Month/Calendar), Date Adjustment (VALUE / PERIOD, tidak berlaku untuk Calendar)."
  },
  {
   "k": "officers property class primary officer dept.acct.officer role aa.officer.role account officer",
   "a": "OFFICERS Property Class: DATED, TRACKING, update action tanpa accounting entry. Primary Officer = officer utama, Id-nya tersalin ke record account. Officer harus valid di DEPT.ACCT.OFFICER; role other officers valid di AA.OFFICER.ROLE (virtual table). Default = Account Officer di CUSTOMER."
  },
  {
   "k": "term amount property class committed amount maturity revolving prepayment update limit disbursement not automatic",
   "a": "TERM.AMOUNT (CCY, DATED, NON.TRACKING; prefix CUR, TOT): Committed Amount (jumlah yang dilimpahkan), Change Amount (naik/turun commitment di level arrangement), Repayment Term, Maturity Date (dari Agreement Date + Term), Amount on Maturity (Due atau Outstanding), Revolving: No / Payment / Prepayment, Updating Limits (update record LIMIT atau tidak). Disbursement TIDAK otomatis — dipicu transaksi dengan transaction code disbursement (FT/Teller/Cash Pooling), tunduk sisa commitment & activity restriction."
  },
  {
   "k": "activity mapping property class transaction code ft teller cash pool default debit credit 850 851",
   "a": "ACTIVITY.MAPPING (DATED, MERGE, TRACKING.ONLY; hanya 1 property per Product Group; tidak bisa dilihat di arrangement): memetakan Transaction Code dari aplikasi lain ke AA Activity. Rantai: Transaction Type ACDI → FT.TXN.TYPE.CONDITION → Transaction Code 850 → Activity LENDING-DISBURSE-COMMITMENT. Serupa untuk AC.CASH.POOL (AC.SWEEP.TYPE) dan TELLER (TELLER.TRANSACTION). Default activity untuk unmapped debit/credit codes bisa diset. Contoh workshop: 850 → LENDING-DISBURSE-COMMITMENT; 851 → LENDING-APPLYPAYMENT-PR.PRINCIPAL.DECREASE."
  },
  {
   "k": "interest property class fixed floating periodic tiered level banded mixed accrual rule compounding calculation threshold negative rate periodic period reset",
   "a": "INTEREST (DATED, CCY, MULTIPLE, TRACKING, FORWARD.DATED; prefix ACC/DUE/AGE): Fixed (rate ditentukan), Floating (BASIC.RATE.TEXT), Periodic (PERIODIC.INTEREST, rate default per TERM, interpolasi antar periode, reset berkala; jika user input rate, default tidak dipakai). Tiered: single / LEVEL / BAND / MIXED (contoh level 5% s.d. 50000, 5,5% s.d. 100000, band 6% setelahnya); tiap tier bisa beda tipe rate, margin, min/max. Tier Amount ATAU Tier Percent (tidak keduanya). Interest Day Basis A/B/C/D/E/F; Accrual Rule (include first/last/both); Compounding DAILY, WEEKn, Mnn, TWMTH, Nnnn; Calculation Threshold (max debit balance tanpa bunga); Negative Rate; Periodic period (default Term). Activities: Accrue, Periodic Reset, Change → bisa memicu recalculation & perubahan schedule."
  },
  {
   "k": "payment schedule property class actual constant linear other payment frequency due frequency billing bill recalculation",
   "a": "PAYMENT.SCHEDULE (DATED, CCY, FORWARD.DATED): Payment Type ACTUAL (repayment property terhitung), CONSTANT (annuity; butuh Term Amount + Interest property), LINEAR (butuh Term Amount), OTHER (user defined). Method due/capitalised; residual amount di pembayaran terakhir. Payment Frequency & Due Frequency (principal & interest harus sama dengan payment frequency; charge boleh beda; due frequency default ke payment frequency jika null). Billing: bill pada due date atau dimajukan N hari, bill same-date bisa digabung; repayment bisa % dari outstanding. Recalculation: RECALC.FREQUENCY (terjadwal) & ON.ACTIVITY (Disburse/Repay/Change interest), RECALCULATE = Payment/Term/Residual/Nothing. Tipe pembayaran: one-off additional/special/zero, regular zero (seasonal), regular additional/special."
  },
  {
   "k": "bill make due issue advance chaser fee combine single bill overdue delinquency basis",
   "a": "Bill adalah Make Due activity di AA: pemberitahuan pembayaran berisi due date & proyeksi amount. Semua dues ditagih (principal, interest, charge), baik terjadwal maupun ad-hoc. Default diterbitkan pada due date; bisa issue in advance N hari kerja; chaser fee bisa ditautkan. Bill dengan due date sama & notice sama bisa digabung atau di-split untuk dibayar dari akun berbeda. Billed amount = dasar overdue/delinquency: dibayar tepat waktu = up to date; melewati due date = basis overdue processing."
  },
  {
   "k": "credit balance excess payment allocation rule repay from credit balance unallocated",
   "a": "Credit Balance menahan posisi kredit positif dalam loan, dikredit via activity LENDING-CREDIT-ARRANGEMENT (remainder activity dalam payment). Fungsinya: menahan kelebihan bayar (overpaid) dan saldo paid-in-advance yang dipakai membayar bill berikutnya. Saat bill due & ada kredit, activity otomatis dipicu — ditentukan di field Repay from Credit Balance (APPLY.PAYMENT) di PAYMENT.SCHEDULE. Pembayaran bisa juga dialokasikan langsung ke credit di akun AA Loan."
  },
  {
   "k": "limit property class limit reference single limit netting shared disburse override without limit",
   "a": "LIMIT (DATED, NON.TRACKING): Limit Product di LIMIT.REFERENCE, harus milik Primary Owner. Single Limit Yes = eksklusif untuk satu arrangement; No = boleh dipakai arrangement account lain milik customer yang sama. Netting (hanya shared limit): credit balance arrangement ditambahkan ke overdraft limit untuk arrangement lain. Arrangement boleh dibuat tanpa limit — override muncul saat activity DISBURSE."
  },
  {
   "k": "payment rules property class application type bill property bill date current oldest first remainder make bill due",
   "a": "PAYMENT.RULES (DATED, MULTIPLE, TRACKING): mengalokasikan satu pembayaran ke banyak bill/amount. Application Type: BILL.PROPERTY (bayar property tertentu lintas bill, mis. penalty interest → maintenance → disbursement charge), BILL.DATE (bill demi bill; dalam bill urut property), CURRENT (langsung ke saldo current; tidak boleh pakai payments order). Payments Order: Oldest First / Oldest Last. Remainder Activity untuk kelebihan/ad-hoc (memicu payment rules property lain; jika gagal → Default Activity di ACCOUNTING). MAKE.BILL.DUE = menagih bill yang belum due. Activity terkait: Apply Payment."
  },
  {
   "k": "overdue property class ageing status grace delinquent non accrual basis nab chaser notice age all bills suspend tolerance bill settlement",
   "a": "OVERDUE (DATED, TRACKING): Ageing status dari virtual table AA.OVERDUE.STATUS (EB.LOOKUP) mis. Grace, Delinquent, NAB. Ageing by days (angka) atau by bills (angka+B, mis. 1B); nilai 0 = overdue di hari due (hanya satu status boleh 0). Chaser Notice N hari setelah status, bisa berkala. Age All Bills: semua bill di bawah status di-age ke status tsb. Suspend Arrangement: stop P&L, accrual ke CRF — butuh AGE.ALL.BILLS YES. Move Balances ke Status Balance. Value date accounting: DUE / STATUS / blank (financial date). Tolerance: % dari bill atau nominal per currency; Tolerance Action REPAY / REMAIN. Bill Settlement: delinquent basis (deemed settled bila total repayment ≥ bill amount) vs financial basis (saldo benar2 lunas). Activities: LENDING-AGE-OVERDUE, LENDING-UPDATE-OVERDUE."
  },
  {
   "k": "charge property class flat calculated percentage unit tiered level banded groups minimum maximum threshold free amount rebate",
   "a": "CHARGE (DATED, OPT.CCY, MULTIPLE, TRACKING, FORWARD.DATED; prefix ACC/DUE/AGE): Flat (amount tetap, mis. USD 50) atau Calculated (2% dari transaction amount, 3% dari commitment). Calculation Type: Flat / Percentage (butuh Charge Rate) / Unit (butuh Charge Amount, dikalikan). Tiered: Level / Banded / Groups. Min & Max per tier (tidak untuk Flat). Calculation Threshold: base minimum agar dihitung. Free Amount: potongan/rebate dari charge terhitung."
  },
  {
   "k": "activity charges property class billed capitalised deferred charge when activity performed disbursement charge annual fee break rule",
   "a": "Jenis charge: Activity Charges (saat activity dilakukan, mis. disbursement charge; bisa billed atau capitalised, tidak aging), Scheduled Charges (pada hari tertentu sesuai loan schedule, mis. annual fee; billed/capitalised), Break Rule Charges (saat rule dilanggar, mis. jumlah disbursement per tahun melebihi batas — via Periodic Rules). Charge payment terms: kapan charge dibilled (mis. 5 hari sebelum effective date)."
  },
  {
   "k": "charge override property class actual amount waive modify payoff",
   "a": "CHARGE.OVERRIDE (DATED, NON.TRACKING, TRIGGER): muncul di arrangement setelah activity charge tervalidasi. Charge Actual Amount: Null = default charge (CHG.AMT); 0 = waived; angka = amount baru jika negotiable. Beberapa charge untuk satu activity bisa dimodifikasi/waived semuanya. Charge saat payoff/repayment/disbursement tidak bisa dimodifikasi atau di-waive."
  },
  {
   "k": "periodic attribute class periodic rules structure interest maximum minimum rate increase decrease tolerance term amount full disburse comparison type routine",
   "a": "AA.PERIODIC.ATTRIBUTE.CLASS + AA.PERIODIC.ATTRIBUTE = Periodic Rules: rule yang berlaku pada periode/hidup arrangement. Struktur: Property Class → Action → Comparison Type (MINIMUM, MAXIMUM, ±BASISPOINTS, ±TOLERANCE, EQUAL, MULTIPLE, ±DIFFERENCE) → Data Type (AMT, PERIOD, A, D, N, R, DAO) → Routine (valid di EB.API, mis. AA.GET.RATE.VALUE, AA.GET.AMOUNT.VALUE, AA.GET.FULL.DISBURSE, AA.GET.ACTIVITY.VALUE/TOTAL/COUNT). PERIOD.TYPE: LIFE, INITIAL, REPEATING, ROLLING; PERIOD: 01D, 5M, 2Y; RULE.START: AGREEMENT, ANNIVERSARY, ARRANGEMENT, START; RULE.ERR.MSG / RULE.OVE.MSG untuk pesan error/override. Contoh INTEREST: MAXIMUM.RATE, MINIMUM.RATE, RATE.DECREASE(+TOLERANCE), RATE.INCREASE(+TOLERANCE). TERM.AMOUNT: AMOUNT.DECREASE/INCREASE(+TOLERANCE), FULL.DISBURSE. ACTIVITY.RESTRICTION: CURRENT/TOTAL.LOAN.REPAY.TOLERANCE, TRANSACTION.AMOUNT.MIN/MAX/MULTIPLE/TOTAL, TRANSACTION.COUNT.TOTAL."
  },
  {
   "k": "activity restriction property class full restriction partial conditional error override multiple of 100 repayments per year",
   "a": "ACTIVITY.RESTRICTION (DATED, CCY, MULTIPLE, TRACKING, FORWARD.DATED; product condition per currency): Full restriction = activity tidak bisa dijalankan (error message wajib, mis. larangan change of term dengan pesan AC-CANT.ENT.PENDING.CAT.CODE). Partial/conditional = boleh dengan override (override message wajib), mis. >5 repayment per tahun, atau disbursement harus kelipatan 100. Bisa dikontrol Periodic Rules."
  },
  {
   "k": "change product property class allowed product scheduled switch rollover reset renegotiate parent processed current status",
   "a": "CHANGE.PRODUCT (DATED, TRACKING): Allowed Product (kosong = semua; hanya satu Product Group). Scheduled switch: CHANGE.DATE (date convention diabaikan), CHANGE.PERIOD, PRIOR.DAYS (event dimajukan, efektif di schedule date, mis. switch 26 April efektif 1 Mei). Change Activity: ROLLOVER (renewal dengan kondisi lama/revisi; hanya kondisi TRACKING yang ditrack), RESET (pada payment end date; reset kondisi sesuai setup produk), CHANGE.PRODUCT (reset ke kondisi produk baru; DEFAULT.ATTR.OPTION harus RESETTING agar kondisi baru berlaku). ROLLOVER/RESET/CHANGE.PRODUCT boleh; mayoritas kondisi ditimpa produk baru kecuali Customer, Account, Term Amount & Limit. Status di AA.ARRANGEMENT: PROCESSED / CURRENT / SCHEDULED. RENEGOTIATE mengubah banyak kondisi sekaligus."
  },
  {
   "k": "payoff property class expiry days settlement activity simulation payoff statement prepayment charge",
   "a": "PAYOFF (DATED, TRACKING): Expiry days (payoff dihapus setelah expiry date), Settlement activity otomatis saat simulate/payoff via SETTLE, auto settlement future dues (Settlement Due Activity wajib → memicu Apply Payment). Payoff statement untuk informasi customer, di-simulate via SIMULATION.RUNNER dengan activity LENDING-CALCULATE-PAYOFF dan activity date = payoff date. Prepayment charge bisa activity charge atau periodic rule charge. Bills dibuat untuk pembayaran reguler & break-rule charges; statement termasuk saldo current yang belum due; credit UNC otomatis menyetel dues."
  },
  {
   "k": "settlement property class direct debit dd mandate ddi payment type apply payment",
   "a": "SETTLEMENT (CCY, DATED): Settlement method hanya DD (Direct Debit). Mandate reference = record DD.DDI (status AVAILABLE), diupdate via LENDING-UPDATE-SETTLEMENT; akun harus currency lokal. DD transaction code harus dipetakan ke activity via ACTIVITY.MAPPING. Remainder activity PAYMENT.RULES harus LENDING-CREDIT-ARRANGEMENT. Payment type: ACTUAL, CONSTANT, LINEAR, CHARGE. Issue Bill activity memicu pembuatan DD.ITEM. Bisa satu mandate untuk charge dan satu untuk principal/interest."
  },
  {
   "k": "closure property class maturity balance automatic manual period posting restrict",
   "a": "CLOSURE (DATED, TRACKING): Closure Type MATURITY (sesuai maturity date) atau BALANCE (saat semua saldo nol). Method Automatic/Manual. Closure Period = kapan activity CLOSURE diproses untuk closure otomatis. Posting Restrict = kode penutupan akun."
  },
  {
   "k": "aa.product.line product group product designer build banking products rebuild activities inheritance parent proof publish",
   "a": "Membangun produk AA: AA.PRODUCT.LINE (definisi business line oleh Temenos; untuk Lending LINE.ATTRIBUTE = CCY & REPLAY; property class ditandai mandatory/optional), AA.PRODUCT.GROUP (bentuk dasar produk; tiap mandatory property class wajib ada minimal satu property mandatory; internal vs external; REBUILD.ACTIVITIES = YES untuk auto-generate activities saat property ditambahkan), AA.PRODUCT.DESIGNER (produk dari product group; semua property mandatory + optional; product condition per property; currency multi-value; produk inheritance-only non-saleable sebagai parent; PARENT.PRODUCT untuk child). Calculation source (tab CALCULATION.SOURCE): calculated property + source balance + source type, mis. PRINCIPALINT dari DR.DAILY CURACCOUNT."
  },
  {
   "k": "proofing publishing product catalog available date expiry date design errors suggestions",
   "a": "Pembuatan produk 3 tahap: Designing → Proofing → Publishing. Design tidak berpengaruh ke produk live. Proof memeriksa error desain (terutama hierarki); Publish menempatkan produk di Product Catalog; keduanya memproses dari parent ke semua children. Available Date = tanggal mulai berlaku (sistem mencari kondisi valid mulai tanggal itu). Expiry Date = produk berhenti ada untuk arrangement BARU; arrangement lama tetap jalan. Jika proofing gagal, error ditampilkan beserta saran perbaikan."
  },
  {
   "k": "reverse and replay effective dated processing noreverse noreplay back valued commitment example",
   "a": "Reverse & Replay: mengubah/membalik activity dari tanggal berapa pun sejak kontrak dimulai; LINE.ATTRIBUTE Product Line harus punya opsi REPLAY. Reversal tidak bisa bila AA.ACTIVITY.CLASS type NOREVERSE; replay tidak bisa bila NOREPLAY. Proses: membalik semua activity terkait dari hari ini mundur ke tanggal back-valued, lalu memutar ulang dari tanggal itu ke hari ini; accounting entries dibuat untuk keduanya; history kondisi harus lengkap. Contoh: 1 Jan commitment 500T → 31 Jan +50T → 15 Feb −100T = 450T; back-valued +150T tgl 15 Jan → reverse dua transaksi terakhir → replay → posisi 600T."
  },
  {
   "k": "simulation overview replicates real time sim files execute convert live arrangement runner service",
   "a": "Simulation mereplikasi skenario nyata untuk arrangement baru/eksisting: efek perubahan principal, rate, tenor, charge, payoff amount. Melakukan update seperti activity sungguhan tapi menyimpan data di simulated files (SIM); tidak membuat/mengubah arrangement live; memeriksa kondisi & negotiation rules, menghitung maturity, charges, repayment, menyiapkan schedule. Bisa multiple simulation per arrangement, beberapa activity dalam satu run, periode dengan start/end date, data disimpan sementara. Bisa dikonversi jadi live (Execute). Sub-sistem: data capture, simulation runner, simulation service (TSA.SERVICE agent BNK/AA.SIMULATION.SERVICE + TSM)."
  },
  {
   "k": "balances arrangement ac.balance.type balance prefix cur acc due age unc und sp balance name accounting",
   "a": "Balance AA: property tertentu punya balance; balance type = komponen finansial produk. Nama balance = Balance Prefix + Property + [SP]: mis. ACC + PRINCIPALINT = ACCPRINCIPALINT. Prefix: CUR (current — TERM.AMOUNT/ACCOUNT), ACC (accrued — INTEREST/CHARGE), DUE (due — ACCOUNT/INTEREST/CHARGE), AGE (overdue), UNC (unallocated credit), UND (unallocated debit); suffix SP = suspend/non-accrual. AC.BALANCE.TYPE menambah balance type: Reporting Type Contingent / Non-contingent / Internal; virtual (penjumlahan balance untuk kalkulasi); Activity Update (dated history file ACCT.ACTIVITY); Suspend Balance. Balance dipakai untuk reporting, basis kalkulasi interest/charge, dan periodic restriction."
  },
  {
   "k": "suspension arrangement suspend non accrual basis pl suspense sp resume interest charged bill",
   "a": "Suspension: arrangement tetap diproses dari sisi customer (amount tetap due, interest capitalised) tapi bank tidak booking P&L; accrual dibukukan ke suspense balance ber-suffix SP (mis. ACCLOANINTSP). Property harus punya PROPERTY.TYPE SUSPEND (hanya INTEREST & CHARGE); SUSPEND.OVERDUES hanya jika SUSPEND — membalik overdue yang sudah ke P&L dan menahan posting berikutnya; saat repayment, P&L direalisasikan otomatis. Suspension dipicu otomatis oleh aging atau manual. Resume = kebalikannya (manual): menyetel accrual suspend ke P&L, memindahkan charge income ke P&L."
  },
  {
   "k": "accounting property class rules allocation rule posting detail rules based accounting event event.type mvmt target transaction codes",
   "a": "ACCOUNTING (DATED, MERGE, TRACKING.ONLY; tidak terlihat di arrangement): rules per property — ACCT.ACTION (action dengan ACCOUNTING=Yes di AA.PROPERTY.CLASS.ACTION), ACCT.RULE (valid di AC.ALLOCATION.RULE), PROPERTY. Amortisasi: ACCRUE.AMORT=AMORT, ACCRUE.PERIOD=MATURITY/1M/1Y. Rules Based Accounting: aplikasi menghasilkan accounting EVENT (contract id, balance type, amount, value date); Allocation Rule menentukan Target Balance, Contra Balance, Transaction Codes, Movement Detail → Posting Entries (STMT/CATEG/SPEC) via AC.POSTING.DETAIL. Saran: copy allocation rule DEBIT-CHARGE untuk property interest/charge baru, ganti P&L category."
  },
  {
   "k": "accounting data files eb.contract.balances acct.activity stmt.entry categ.entry spec.entry consolidation",
   "a": "Data accounting AA: EB.CONTRACT.BALANCES = saldo arrangement per AA Account; ACCOUNT/ACCT.ACTIVITY = saldo historis & movement per value date; STMT.ENTRY (Account No = Arr A/c, multi balance type), CATEG.ENTRY (P&L movement), SPEC.ENTRY (CRF, Deal No = Arr A/c). Consolidation: CONSOL key dari Term/Maturity date & field AA.ACCOUNT.DETAILS; Principal asset type = balance type (CURACCOUNT vs LIVEDB di LD; CURCOMMITMENT vs LIVECMT); accrued interest memakai balance type (mis. ACCLOANINT) bukan asset type 51000."
  },
  {
   "k": "enquiries arrangement balance activity log bills payment schedule messages drill down",
   "a": "Enquiry bawaan dalam record Arrangement: Balance (commitment, current/due principal, pending charges, unallocated credit/debit), Activity Log (semua activity per tanggal & sequence, drill down ke Arrangement Activity; basis reverse & replay), Bills (due date, activity type, amount, outstanding, status due/settled, drill down), Messages, Payment Schedule (scheduled date, amount, outstanding principal, interest, total)."
  },
  {
   "k": "activities overview arrangement activity class disburse apply payment accrue create arrangement online cob",
   "a": "Activities = operasi yang diterapkan ke Arrangement (mis. Disburse, Apply Payment, Accrue Interest). Arrangement hanya bisa diubah via Activity (online maupun COB); membuat arrangement baru pun adalah activity. Activities dikelompokkan ke Activity Class (didefinisikan Temenos; menentukan perilaku, termasuk NOREVERSE/NOREPLAY). Activity di-generate otomatis saat property pertama dipakai di Product Line dengan REBUILD.ACTIVITIES=YES di AA.PRODUCT.GROUP."
  },
  {
   "k": "financial activities teller funds transfer disbursement repayment payoff account applications transaction code",
   "a": "Pembayaran masuk/keluar akun AA dilakukan lewat aplikasi account-related: Funds Transfer, Teller, dsb. Activity dipilih otomatis berdasar Transaction Code (via ACTIVITY.MAPPING). Contoh activity: Disburse, Apply Repayment, Payoff Loan."
  },
  {
   "k": "aa loan lending property classes list overview mapping rules schedule restriction charge presentation messaging api",
   "a": "Property Classes untuk Lending Product Line: CUSTOMER, ACCOUNT, LIMIT, OFFICERS, TERM.AMOUNT, ACTIVITY.MAPPING, INTEREST, PAYMENT.RULES, CHARGE, ACCOUNTING, PAYMENT.SCHEDULE, ACTIVITY.RESTRICTION, BALANCE (Overdue), OVERDUE, MAINTENANCE (Balance Maintenance), CHANGE.PRODUCT, SETTLEMENT, PAYOFF, CLOSURE, PRESENTATION, MESSAGING, API, ACTIVITY.CHARGES, PERIODIC.CHARGES, CHARGE.OVERRIDE."
  },
  {
   "k": "quiz answers true false primary customer changed joint owner account category any term amount two attributes roles aa.customer",
   "a": "Jawaban Quiz 1: (1) Account Property tidak memegang currency account — False (Account Property memegang currency; tidak bisa diubah setelah authorisation). (2) Primary Customer bisa diganti dengan Joint Owner — False (primary owner tidak bisa diubah setelah authorisation). (3) AA Account boleh pakai category code apa pun — False (harus Customer-type 1000–9999 non-contingent, bukan range Nostro/Vostro). (4) TERM.AMOUNT memegang dua atribut amount — False (committed amount & term/maturity). (5) Roles other parties didefinisikan di AA.CUSTOMER — False (di AA.PARTY.ROLE)."
  },
  {
   "k": "quiz answers activity mapping periodic reset calculation threshold negative interest",
   "a": "Jawaban Quiz 2: (1) Activity Mapping menghubungkan aplikasi eksternal dengan activity arrangement saat debit/kredit — True. (2) Periodic Reset untuk Interest tidak diizinkan di AA — False (diizinkan, terjadwal atau manual, bisa memicu recalculation). (4) Calculation Threshold = minimum interest amount — False (maximum debit balance yang tidak dihitung bunganya). (5) AA mendukung negative interest — True (bisa di-set user atau karena negative spread tinggi)."
  },
  {
   "k": "quiz answers payment schedule constant linear repayment",
   "a": "Jawaban Quiz 3: (1) Yang TIDAK bisa didefinisikan di Payment Schedule Product Condition: c) menggabungkan bill yang jatuh tempo pada tanggal BERBEDA (hanya same date). (2) Constant repayment: c) jumlah principal & interest konstan sepanjang waktu (annuity). (3) Linear repayment: a) payment tetap, dan c/d: principal repayment konstan (interest menurun) — jawaban dokumen: payment fixed & principal konstan; interest menurun."
  },
  {
   "k": "quiz answers match activity charge scheduled break rule charge property class",
   "a": "Jawaban Quiz 4 (match): 1.Activity Charge — b) LENDING-NEW-ARRANGEMENT; 2.Scheduled Charge — c) Payment Schedule; 3.Break Rule Charge — e) Periodic Rules; 4.Charge Property Class — d) Currency dependent optional; 5.Activity Charge Property Class — a) Not currency dependent."
  },
  {
   "k": "quiz answers simulation payoff payment types dd allowed",
   "a": "Jawaban Quiz 7: (1) Simulation di AA = b) proses mereplikasi skenario nyata. (2) = c) melakukan activity sungguhan tapi tidak membuat/mengubah record live. (3) Payment types untuk DD = c) ACTUAL, CONSTANT dan LINEAR."
  },
  {
   "k": "quiz answers activities auto generated rebuild activities negotiation fix value custom tracking currency product designer",
   "a": "Jawaban Quiz 6: (1) Activities ter-generate otomatis saat: b) property dipakai pertama kali di product line dengan REBUILD.ACTIVITIES=YES di AA.PRODUCT.GROUP. (2) Yang bukan activity: c) Enquiry. (3) FIX.VALUE dengan Arrangement Link CUSTOM.TRACKING: c) tidak bisa dinegosiasikan tapi akan ditrack. (4) Currency di AA.PRODUCT.DESIGNER: c) allowed currencies diinput di multi-value CURRENCY field."
  },
  {
   "k": "quiz answers balances aged nab virtual suspend prefixes accounting property class",
   "a": "Jawaban Quiz 8: (1) Semua bill otomatis di-age ke NAB — False (hanya bila AGE.ALL.BILLS=YES). (2) Virtual balance = penjumlahan balance terpilih — True. (3) SUSPEND activity membalik overdue yang sudah posting ke P&L — True (itu SUSPEND.OVERDUES; jawaban dokumen True). (4) Suspension bisa diminta manual — True. (5) Balance prefixes ditunjukkan di ACCOUNTING Property Class — False (di masing-masing property class via field BALANCE.PREFIX)."
  },
  {
   "k": "quiz answers soft accounting contingent commitment historic balances memo consolidation",
   "a": "Jawaban Quiz 9: (1) Yang tidak benar soal soft accounting: b) semua action menghasilkan accounting event. (2) Balance untuk commitment amount: a) Contingent. (3) Historic balances & movements: d) di ACCT.ACTIVITY. (4) Memo balance yang salah: d) dipakai untuk kalkulasi interest — memo tidak untuk kalkulasi; virtual yang bisa. (5) Konsolidasi balance AA: b) pada user defined balance types."
  },
  {
   "k": "quiz answers periodic attribute transaction maximum term amount product change automated",
   "a": "Jawaban Quiz 5: (1) TRANSACTION.AMOUNT.MAXIMUM untuk membatasi Term Amount — False (untuk transaction amount activity). (2) Periodic Attribute Classes terhubung ke Properties — True. (3) Product Change bisa otomatis — True (scheduled: CHANGE.DATE/CHANGE.PERIOD). (4) Periodic Attribute Class bukan Property Class — True (ia adalah class terpisah untuk periodic rules)."
  },
  {
   "k": "workshops practice product builder admin menu property classes properties conditions",
   "a": "Jalur menu latihan: Admin Menu > Product Builder > Property Classes and Properties / Product Conditions / Periodic Attributes / Products / Accounting / Activities. Untuk operasional: User Menu > Credit Operations > Retail Lending – Arrangements (Product Catalog, New Arrangement Offers, Authorised, Arrangement Activities (FT) > AA Disbursement / AA Repayment). Command line: TSA.SERVICE (BNK/AA.SIMULATION.SERVICE, TSM), EB.CONTRACT.BALANCES, ACCT.BALANCE.ACTIVITY."
  },
  {
   "k": "temenos transact t24 core banking system cbs modules branches centralized database",
   "a": "Temenos Transact (dulu T24) adalah Core Banking System (CBS) — sistem pusat operasional harian bank: record customer, buka akun, pinjaman & deposito, pembayaran, hitung bunga, limit & collateral, accounting otomatis. CBS = layanan di semua cabang dari satu database terpusat (buka home loan di Hyderabad, bayar EMI di Chennai, cek saldo di Mumbai). Modul utama Temenos: Customer, Accounts, Lending, Deposits, Payments, Limits, Collateral, AA (framework produk)."
  },
  {
   "k": "kenapa aa diperkenalkan manfaat configuration driven reusable komponen cepat peluncuran produk",
   "a": "Mengapa AA diperkenalkan: sistem lama menyimpan logika produk di dalam program — sulit dirawat, produk baru berminggu-minggu/bulanan, biaya pengembangan tinggi. AA menjadikan produk configuration-driven. Manfaat: peluncuran produk lebih cepat, komponen reusable, sedikit coding, mudah dirawat, fleksibel, standar. Contoh: meluncurkan Home Loan baru cukup konfigurasi AA tanpa perubahan kode aplikasi."
  },
  {
   "k": "product vs arrangement template instance customer contoh rakesh emi negosiasi",
   "a": "Product vs Arrangement: Product = template dibuat sekali berisi aturan default, dipakai banyak customer (Home Loan: bunga 8,5%, maks 20 tahun, EMI bulanan). Arrangement = kontrak live dibuat per customer, memuat nilai spesifik customer (Rakesh: ₹50.00.000, bunga dinegosiasikan 8,25%, term 15 tahun)."
  },
  {
   "k": "loan booking new arrangement flow product catalog validasi authorization maker checker arrangement id",
   "a": "Loan Booking = membuat Arrangement live dari produk terkonfigurasi. Aplikasi utama AA.ARRANGEMENT.ACTIVITY. Alur: Product Catalog → pilih produk → New Arrangement → pilih customer (validasi ada/aktif/KYC) → amount (min/max/limit) → currency → agreement date → term → interest (default → dinegosiasikan) → repayment frequency & method → collateral → limit → validasi (status INPUT) → maker simpan → checker authorize (status AUTHORIZED). Internal: product condition disalin jadi arrangement condition, dibuat Arrangement ID unik (mis. LD22000145). Status flow: INPUT → UNAUTHORIZED → AUTHORIZED → ACTIVE → CLOSED."
  },
  {
   "k": "agreement date effective date future dated back dated loan bunga mulai",
   "a": "Agreement Date = tanggal kontrak ditandatangani (legal). Effective Date = tanggal mulai proses — bunga, accrual, dan loan processing dimulai dari effective date, bukan agreement date. Future-dated loan (agreement 20-Jul, effective 25-Jul): pinjaman sudah ada tapi tanpa accounting & disbursement sampai effective date. Back-dated loan (effective 10-Jul): sistem menghitung bunga/accrual/due dari tanggal itu sesuai aturan bank."
  },
  {
   "k": "disbursement full partial multiple settlement account accounting loan asset gl debit credit",
   "a": "Loan Disbursement = melepaskan dana yang disetujui setelah arrangement authorized, via AA.ARRANGEMENT.ACTIVITY (activity DISBURSEMENT). Tipe: Full (seluruh sekaligus), Partial (sebagian — konstruksi/pendidikan), Multiple (bertahap per stage). Validasi: arrangement authorized & aktif, customer aktif, amount tidak melebihi approval, settlement account ada/aktif/currency cocok, tanpa duplikat. Accounting: Debit Loan Asset GL / Credit Customer Settlement Account. Bunga mulai berjalan atas jumlah yang disbursed sejak effective disbursement date."
  },
  {
   "k": "interest accrual cob close of business daily 1130 formula 365 posting difference",
   "a": "Interest Accrual = menghitung & mengakui bunga setiap hari meski EMI belum dibayar — dijalankan saat COB (Close of Business, batch end-of-day). Rumus: Daily Interest = (Principal × Rate) ÷ 365. Contoh ₹50.00.000 @8,25% ≈ ₹1.130,14/hari. Accrual vs Posting: accrual harian mengakui income (tanpa pembayaran customer); posting periodik memindahkan bunga accrued ke dues/income sesuai aturan. Accounting: Dr Interest Receivable / Cr Interest Income. Prinsip: accrual accounting — income diakui saat diperoleh, bukan saat kas diterima."
  },
  {
   "k": "emi equated monthly installment repayment schedule payment allocation charges penalty interest principal urutan",
   "a": "EMI (Equated Monthly Installment) = pembayaran tetap berkala sampai lunas (mis. ₹50.00.000, 20 th, 8,25% → ±₹42.603). Mula-mula interest > principal, nanti principal > interest. Repayment schedule dibuat saat authorize & diupdate tiap pembayaran; COB men-generate due sebelum tanggal EMI. Payment allocation (urutan dikonfigurasi produk): charges → penalty interest → interest → principal. Partial payment: sisa tetap outstanding/overdue sesuai produk. Advance payment: disesuaikan cicilan mendatang, potong principal, atau ditahan. Missed EMI: OVERDUE, COB berikutnya menghitung penal interest. Accounting EMI: Dr Customer A/C / Cr Interest Receivable + Cr Loan Principal + Cr Charges Income."
  },
  {
   "k": "overdue dpd days past due delinquency penalty late payment charge collection recovery klasifikasi npa",
   "a": "Overdue = gagal bayar pada/before due date; Delinquency = kondisi customer punya overdue. DPD (Days Past Due) = hari sejak due date tanpa pembayaran, diupdate COB. Penalty interest (mis. 8,25% + 2% = 10,25% efektif) & late payment charge (mis. ₹500) sesuai konfigurasi. Collection: SMS → email → telepon → kunjungan → legal notice. Recovery: tim recovery, restrukturisasi, legal, eksekusi collateral. Klasifikasi bisnis: 0 regular; 1–30 early delinquency; 31–90 serious; >90 potensi NPA (regulasi lokal). Overdue bisa kembali regular setelah semua dues dilunasi."
  },
  {
   "k": "rescheduling restructuring moratorium tenure extension top up additional disbursement emi reduction",
   "a": "Loan Rescheduling = mengubah syarat pinjaman tanpa membuat pinjaman baru (arrangement sama lanjut), via AA.ARRANGEMENT.ACTIVITY: RESCHEDULE, CHANGE.TERM, CHANGE.INTEREST, CHANGE.REPAYMENT, MORATORIUM, TOP.UP. Jenis: EMI reduction (₹42.603 → ₹34.800), tenure extension (20 → 25 tahun), interest revision, moratorium (payment holiday 6 bulan — bunga bisa tetap accrue/capitalize/deferred), frequency change (bulanan → kuartalan), balloon payment, top-up (tambah plafon ₹10L, schedule dihitung ulang), additional disbursement bertahap. Rescheduling = operasional; restructuring = lebih luas untuk borrower bermasalah (konsesi bunga, penyesuaian principal). Umumnya tanpa entry accounting langsung kecuali top-up (Dr Loan Asset / Cr Customer A/C)."
  },
  {
   "k": "prepayment full partial foreclosure payoff pre-closure charge total settlement accounting closure",
   "a": "Prepayment = bayar sebelum due date. Partial (sebagian — pinjaman tetap aktif) vs Full (seluruh — closed). Foreclosure = penutupan sebelum maturity setelah payoff dibayar. Payoff = settlement akhir: outstanding principal + accrued interest + penalty + pre-closure charge + pajak. Contoh: ₹28.00.000 + 25.000 + 2.000 + 8.000 + GST 1.440 = ₹28.36.440. Pre-closure charge mis. 2%. Activity PAYOFF/SETTLEMENT via AA.ARRANGEMENT.ACTIVITY. Setelah closure: accrual & EMI berhenti, status CLOSED, history tetap untuk audit, limit & collateral dilepas."
  },
  {
   "k": "accounting double entry gl general ledger stmt.entry categ.entry loan asset interest receivable income charges",
   "a": "Accounting Temenos: double entry (Total Debit = Total Credit). GL = buku induk: Loan Asset GL (outstanding pinjaman), Interest Income, Interest Receivable (accrued), Charges Income, Cash. Customer account (milik customer, saldo customer) vs GL account (milik bank). STMT.ENTRY = entry akun customer (statement, operasional: amount, date, currency, narrative). CATEG.ENTRY = entry GL (trial balance, P&L, balance sheet). Accounting per tahap: booking biasanya tanpa entry; disbursement Dr Loan Asset / Cr Customer; accrual Dr Interest Receivable / Cr Interest Income; EMI Dr Customer / Cr Interest + Principal + Charges; payoff Dr Customer / Cr semua komponen + GST."
  },
  {
   "k": "credit limit approved available utilized hierarchy corporate facility collateral ltv loan to value release",
   "a": "Credit Limit = maksimum yang bank pinjamkan ke customer. Hierarchy: Corporate → Customer → Facility → Loan Arrangement (₹10Cr → ₹2Cr → ₹1Cr → ₹50L). Approved − Utilized = Available (₹1Cr − 40L = 60L; update otomatis per booking). Validasi saat booking: limit aktif, disetujui, belum expired, amount dalam available, currency valid. Collateral = aset jaminan (properti, cash/FD, emas, kendaraan, sekuritas, bank guarantee). LTV = Loan ÷ Collateral Value × 100 (mis. 50L ÷ 75L = 66,67%, batas 80% → lolos). Setelah closure: utilized limit & collateral dilepas, available dipulihkan."
  },
  {
   "k": "sit uat functional testing end-to-end loan test fase sql validasi defect lifecycle regression",
   "a": "End-to-end functional testing lending: BRD → FRD → test scenario/case → eksekusi → defect log → retest → regression → UAT. Fase test: produk (proof/publish/catalog), booking (validasi, schedule, authorize), disbursement (kredit akun, GL, STMT & CATEG entry), accrual (COB, tanpa duplikat), EMI (alokasi, next due), overdue (DPD, penalty), reschedule (EMI baru), payoff (closure, limit release). SQL validasi: CUSTOMER, AA_ARRANGEMENT, STMT_ENTRY, CATEG_ENTRY (nama tabel bisa beda per implementasi). SIT = integrasi dengan LOS/CRM/AML/payment/SWIFT/GL/reporting; UAT = penerimaan business user. Setelah COB cek: interest accrued, EMI, penalty, DPD, charges, laporan."
  },
  {
   "k": "negotiation non negotiable tracking non tracking arr.link product inheritance proof publish advanced configuration",
   "a": "Konsep lanjutan konfigurasi: Negotiation (condition bisa diubah dalam rentang saat booking, mis. 8–9% default 8,5%) vs Non-Negotiation (tetap, dikontrol produk). Tracking (history nilai dipelihara — audit/regulasi) vs Non-Tracking (hanya nilai terakhir). ARR.LINK = dependensi antar property: interest berubah → repayment schedule dihitung ulang; loan amount berubah → processing fee dihitung ulang. Product Inheritance: produk baru mewarisi konfigurasi parent (Premium Home Loan mewarisi interest/charges/accounting dari Home Loan), hanya override yang beda. Proof memvalidasi konfigurasi; Publish menjadikan produk tersedia di Product Catalog dengan Available Date & Expiry Date."
  }
 ],
 "QUIZ": [
  {
   "q": "Account Property tidak memegang currency dari Account.",
   "o": [
    "True",
    "False"
   ],
   "a": 1,
   "e": "Account Property memegang currency Arrangement — default dari New Arrangement Activity dan tidak bisa diubah setelah authorisation."
  },
  {
   "q": "Primary Customer dari sebuah Arrangement dapat diganti dengan Joint Owner.",
   "o": [
    "True",
    "False"
   ],
   "a": 1,
   "e": "Setelah Arrangement di-authorise, Primary Owner tidak dapat diubah. Other owners hanya bisa ditambahkan."
  },
  {
   "q": "AA Account dapat memakai sembarang Account Category Code.",
   "o": [
    "True",
    "False"
   ],
   "a": 1,
   "e": "Harus Customer-type range 1000–9999, Non-contingent, dan menghindari range Nostro/Vostro."
  },
  {
   "q": "Term Amount Property Class memegang dua atribut Amount.",
   "o": [
    "True",
    "False"
   ],
   "a": 1,
   "e": "Term Amount memegang Committed Amount dan Term (repayment term / maturity date), bukan dua atribut amount."
  },
  {
   "q": "Roles dari Other Parties (CUSTOMER) didefinisikan di virtual table AA.CUSTOMER.",
   "o": [
    "True",
    "False"
   ],
   "a": 1,
   "e": "Roles Other Party (Guarantor, Co-signatory) didefinisikan di AA.PARTY.ROLE."
  },
  {
   "q": "Activity Mapping Property menyediakan link antara aplikasi eksternal dan arrangement activities saat debit/kredit ke akun arrangement.",
   "o": [
    "True",
    "False"
   ],
   "a": 0,
   "e": "Benar — Transaction Code dari FT/Teller/Cash Pooling dipetakan ke AA Activity melalui Activity Mapping."
  },
  {
   "q": "Periodic Reset untuk Interest tidak diizinkan di AA.",
   "o": [
    "True",
    "False"
   ],
   "a": 1,
   "e": "Periodic Interest dapat direset pada frekuensi tertentu (terjadwal atau manual), dan dapat memicu recalculation."
  },
  {
   "q": "Calculation Threshold untuk Interest menentukan minimum interest amount sebuah arrangement.",
   "o": [
    "True",
    "False"
   ],
   "a": 1,
   "e": "Calculation Threshold = maximum debit balance yang tidak dihitung bunganya."
  },
  {
   "q": "AA mendukung negative interest.",
   "o": [
    "True",
    "False"
   ],
   "a": 0,
   "e": "User dapat menetapkan negative interest, atau muncul dari negative spread tinggi; jika tidak diizinkan, bunga nol saat rate < 0."
  },
  {
   "q": "Apa yang TIDAK dapat didefinisikan dalam Payment Schedule Product Condition?",
   "o": [
    "Properties yang dimasukkan Schedule",
    "Payment Frequency",
    "Menggabungkan bill yang jatuh tempo pada tanggal berbeda",
    "Payment Frequency sekaligus Due Frequency"
   ],
   "a": 2,
   "e": "Bill hanya bisa digabung bila jatuh tempo pada tanggal yang SAMA."
  },
  {
   "q": "Manakah yang benar tentang tipe repayment Constant?",
   "o": [
    "Payment amount reguler dan tetap",
    "Interest repayment meningkat",
    "Principal dan interest jumlahnya konstan",
    "Interest variabel, principal konstan"
   ],
   "a": 2,
   "e": "Constant (annuity): total angsuran principal + interest konstan sepanjang periode; butuh Term Amount + Interest property."
  },
  {
   "q": "Manakah fitur tipe repayment Linear?",
   "o": [
    "Payment tetap sepanjang periode",
    "Interest meningkat",
    "Principal repayment meningkat",
    "Principal repayment konstan sepanjang periode"
   ],
   "a": 0,
   "e": "Linear: pembayaran tetap (principal konstan, interest menurun seiring saldo turun); membutuhkan term amount property."
  },
  {
   "q": "TRANSACTION.AMOUNT.MAXIMUM Periodic Attribute Class dapat dipakai untuk membatasi Term Amount.",
   "o": [
    "True",
    "False"
   ],
   "a": 1,
   "e": "Ia membatasi maximum transaction amount sebuah activity (mis. disbursement), bukan Term Amount."
  },
  {
   "q": "Periodic Attribute Classes terhubung ke Properties.",
   "o": [
    "True",
    "False"
   ],
   "a": 0,
   "e": "Periodic Attribute Class dikaitkan ke Property Class (INTEREST, TERM.AMOUNT, ACTIVITY.RESTRICTION, CHARGE, PAY.OFF) dan dipakai dalam product condition."
  },
  {
   "q": "Product Change dari sebuah Arrangement dapat diotomatisasi.",
   "o": [
    "True",
    "False"
   ],
   "a": 0,
   "e": "Scheduled switch via CHANGE.DATE atau CHANGE.PERIOD (otomatis atau manual)."
  },
  {
   "q": "Periodic Attribute Class bukanlah Property Class.",
   "o": [
    "True",
    "False"
   ],
   "a": 0,
   "e": "Benar — ia adalah class terpisah (AA.PERIODIC.ATTRIBUTE.CLASS) untuk periodic rules."
  },
  {
   "q": "Apa yang dimaksud Simulation di AA?",
   "o": [
    "Proses repayment pinjaman AA",
    "Proses mereplikasi skenario nyata",
    "Proses menutup Arrangement",
    "Proses membuat Arrangement"
   ],
   "a": 1,
   "e": "Simulation mereplikasi skenario nyata (perubahan principal, rate, tenor, payoff) tanpa mengubah record live; data disimpan di SIM files."
  },
  {
   "q": "Manakah yang benar tentang Simulation di AA?",
   "o": [
    "Melakukan activity nyata dan update record live",
    "Record simulasi tidak bisa dieksekusi jadi live",
    "Melakukan activity nyata tapi tidak update/membuat record live",
    "Simulasi hanya untuk arrangement eksisting"
   ],
   "a": 2,
   "e": "Simulation menjalankan pemrosesan seperti nyata tetapi menyimpan di simulated files; bisa dikonversi ke live melalui Execute."
  },
  {
   "q": "Apa saja AA.PAYMENT.TYPES yang diizinkan untuk DD (Direct Debit)?",
   "o": [
    "CONSTANT, User Defined, LINEAR",
    "ACTUAL, CONSTANT, User Defined",
    "ACTUAL, CONSTANT, LINEAR",
    "ACTUAL, User Defined, LINEAR"
   ],
   "a": 2,
   "e": "Untuk settlement Direct Debit: ACTUAL, CONSTANT dan LINEAR (plus CHARGE)."
  },
  {
   "q": "Bagaimana activities di-generate otomatis?",
   "o": [
    "Saat property pertama dipakai di Product Line",
    "Saat property pertama dipakai dengan REBUILD.ACTIVITIES=YES di AA.PRODUCT.GROUP",
    "Saat Product Group baru dibuat",
    "Saat property baru dipakai di AA.PRODUCT.DESIGNER"
   ],
   "a": 1,
   "e": "REBUILD.ACTIVITIES harus YES di AA.PRODUCT.GROUP ketika property ditambahkan."
  },
  {
   "q": "Manakah yang BUKAN activity dalam sebuah Arrangement?",
   "o": [
    "Menaikkan commitment amount",
    "Interest accrual",
    "Enquiry",
    "Mengkredit Arrangement"
   ],
   "a": 2,
   "e": "Enquiry bukan activity — hanya menampilkan data; arrangement hanya diubah via activity."
  },
  {
   "q": "Negotiation rule sebuah atribut adalah FIX.VALUE. Apa dampaknya bila Arrangement Link di-set CUSTOM.TRACKING?",
   "o": [
    "Akan track nilai atribut apa pun negotiation rule-nya",
    "Tidak akan track nilai atribut",
    "FIX.VALUE tidak bisa dinegosiasikan tapi akan ditrack",
    "CUSTOM.TRACKING tidak mengizinkan negosiasi"
   ],
   "a": 2,
   "e": "Nilai tetap (fix value) tidak dinegosiasikan, namun tetap ditrack pada level arrangement."
  },
  {
   "q": "Bagaimana cara menetapkan currency yang diizinkan di AA.PRODUCT.DESIGNER?",
   "o": [
    "Opsi 'ALL' di field CURRENCY",
    "Currency terlarang disebutkan, sisanya diizinkan",
    "Currency diizinkan diinput di multi-value CURRENCY field",
    "Produk hanya bisa local currency"
   ],
   "a": 2,
   "e": "Allowed currencies diinput di multi-value field CURRENCY; kondisi product per currency harus tersedia."
  },
  {
   "q": "Semua bill otomatis di-age ke status NAB saat satu bill di-age ke NAB.",
   "o": [
    "True",
    "False"
   ],
   "a": 1,
   "e": "Hanya bila field AGE.ALL.BILLS = YES pada status tersebut (efeknya seluruh loan ikut menua)."
  },
  {
   "q": "Virtual Balance adalah penjumlahan balance terpilih.",
   "o": [
    "True",
    "False"
   ],
   "a": 0,
   "e": "Benar — balance buatan bank berupa penjumlahan balance type untuk keperluan kalkulasi, mis. penalty interest dari semua overdue balance."
  },
  {
   "q": "SUSPEND activity membalikkan overdues yang sudah diposting ke P&L.",
   "o": [
    "True",
    "False"
   ],
   "a": 0,
   "e": "SUSPEND.OVERDUES membalik posting P&L overdue dan menahan posting berikutnya; accrual lanjut ke balance SP."
  },
  {
   "q": "Suspension dapat diminta secara manual.",
   "o": [
    "True",
    "False"
   ],
   "a": 0,
   "e": "Dipicu otomatis oleh proses aging, atau diminta manual; Resume selalu manual."
  },
  {
   "q": "Balance Prefixes ditunjukkan di ACCOUNTING Property Class.",
   "o": [
    "True",
    "False"
   ],
   "a": 1,
   "e": "Balance prefix ditetapkan di masing-masing Property Class via field BALANCE.PREFIX (CUR, ACC, DUE, AGE, UNC, UND)."
  },
  {
   "q": "Manakah yang TIDAK benar tentang Soft Accounting?",
   "o": [
    "Balance dapat didefinisikan user",
    "Semua action menghasilkan accounting event",
    "Satu action dapat menghasilkan beberapa accounting event",
    "EB.CONTRACT.BALANCES menahan saldo Arrangement per AA Account"
   ],
   "a": 1,
   "e": "Tidak semua action menghasilkan accounting event — ditandai di AA.PROPERTY.CLASS.ACTION."
  },
  {
   "q": "Tipe balance apa yang dihasilkan untuk commitment amount?",
   "o": [
    "Contingent",
    "Non Contingent",
    "Virtual",
    "Virtual dengan reporting"
   ],
   "a": 0,
   "e": "Commitment adalah item off-balance-sheet → contingent (balance CURCOMMIT + contingent balancing CURCOMMITBL)."
  },
  {
   "q": "Di mana Historic Balances dan Balance Movements disimpan?",
   "o": [
    "Di Arrangements",
    "Di EB.CONTRACT.BALANCES",
    "Di SPEC.ENTRIES",
    "Di ACCT.ACTIVITY"
   ],
   "a": 3,
   "e": "ACCT.ACTIVITY menyimpan saldo historis & movement per value date."
  },
  {
   "q": "Manakah yang SALAH tentang Memo type balance?",
   "o": [
    "Dipakai untuk pelaporan lokal",
    "Dipakai untuk pelaporan finansial",
    "Untuk menahan balance",
    "Dipakai untuk kalkulasi interest"
   ],
   "a": 3,
   "e": "Memo untuk reporting; untuk kalkulasi dipakai Virtual balance."
  },
  {
   "q": "Manakah yang benar tentang konsolidasi AA Balances?",
   "o": [
    "Pada hard coded asset type dan user defined balance type",
    "Pada user defined balance type",
    "Pada hard coded asset type"
   ],
   "a": 1,
   "e": "Konsolidasi AA memakai user defined balance types (asset type = balance type, mis. CURACCOUNT, ACCLOANINT)."
  },
  {
   "q": "Aplikasi utama yang digunakan untuk Loan Booking adalah…",
   "o": [
    "AA.PRODUCT.CATALOG",
    "AA.ARRANGEMENT",
    "AA.ARRANGEMENT.ACTIVITY",
    "FUNDS.TRANSFER"
   ],
   "a": 2,
   "e": "Loan Booking diproses melalui AA.ARRANGEMENT.ACTIVITY; AA.PRODUCT.CATALOG untuk memilih produk, AA.ARRANGEMENT untuk melihat arrangement."
  },
  {
   "q": "Bunga dan accrual mulai dihitung dari…",
   "o": [
    "Agreement Date",
    "Effective Date",
    "Booking Date",
    "Authorization Date"
   ],
   "a": 1,
   "e": "Interest, accrual, dan loan processing dimulai dari Effective Date, bukan tanggal kontrak (Agreement Date)."
  },
  {
   "q": "Accounting saat Loan Booking biasanya…",
   "o": [
    "Dr Loan Asset / Cr Customer Account",
    "Dr Interest Receivable / Cr Interest Income",
    "Tanpa entry karena tidak ada pergerakan dana",
    "Dr Customer / Cr Cash"
   ],
   "a": 2,
   "e": "Booking tidak memindahkan dana — sistem hanya membuat arrangement, conditions, dan schedule. Entry muncul saat disbursement, accrual, repayment, charges, dan payoff."
  },
  {
   "q": "Apa itu DPD?",
   "o": [
    "Days per Database",
    "Days Past Due — hari sejak due date tanpa pembayaran",
    "Durasi Pinjaman Default",
    "Daily Payment Deduction"
   ],
   "a": 1,
   "e": "DPD (Days Past Due) diupdate saat COB: 05-Sep → 10-Sep = DPD 5."
  },
  {
   "q": "Payoff amount TIDAK memuat…",
   "o": [
    "Outstanding principal",
    "Accrued interest",
    "Pre-closure charge",
    "Deposito customer"
   ],
   "a": 3,
   "e": "Payoff = outstanding principal + accrued interest + penalty + pre-closure charge + pajak (jika ada)."
  },
  {
   "q": "ARR.LINK dengan opsi NON-TRACKING berarti…",
   "o": [
    "Arrangement otomatis mengikuti perubahan produk",
    "Arrangement tidak berubah saat produk berubah",
    "Arrangement tidak bisa dinegosiasikan",
    "Produk tidak bisa diubah"
   ],
   "a": 1,
   "e": "Produk berubah 8,5% → 9%, arrangement tetap 8,5%. TRACKING: arrangement ikut berubah; TRACKING ONLY: ikut dan tidak bisa dinegosiasikan."
  },
  {
   "q": "Loan-to-Value (LTV) dihitung sebagai…",
   "o": [
    "Collateral ÷ Loan × 100",
    "Loan ÷ Collateral Value × 100",
    "Loan × Collateral",
    "(Loan + Interest) ÷ Collateral"
   ],
   "a": 1,
   "e": "Contoh: loan ₹50L, nilai properti ₹75L → LTV 66,67%."
  },
  {
   "q": "STMT.ENTRY vs CATEG.ENTRY — pasangan yang benar…",
   "o": [
    "STMT = GL, CATEG = customer",
    "STMT = customer/statement, CATEG = GL/laporan finansial",
    "Keduanya entry GL",
    "Keduanya entry customer"
   ],
   "a": 1,
   "e": "STMT.ENTRY untuk rekening koran customer (operasional); CATEG.ENTRY untuk trial balance, P&L, balance sheet."
  },
  {
   "q": "Moratorium 6 bulan berarti…",
   "o": [
    "Bunga berhenti total",
    "Customer tidak membayar EMI sementara; perlakuan bunga tergantung produk (accrue/capitalize/deferred)",
    "Pinjaman ditutup sementara",
    "Limit dibekukan"
   ],
   "a": 1,
   "e": "Moratorium = payment holiday sementara; perlakuan bunga ditentukan konfigurasi produk."
  },
  {
   "q": "Rescheduling membuat…",
   "o": [
    "Arrangement baru",
    "Arrangement lama ditutup dan dibuka ulang",
    "Arrangement yang sama lanjut dengan syarat & schedule baru",
    "Produk baru"
   ],
   "a": 2,
   "e": "Rescheduling mengubah EMI/tenure/rate/frekuensi tanpa membuat pinjaman baru — arrangement sama berlanjut."
  },
  {
   "q": "Match: Activity Charge — ?",
   "o": [
    "Not currency dependent",
    "LENDING-NEW-ARRANGEMENT",
    "Payment Schedule",
    "Currency dependent optional",
    "Periodic Rules"
   ],
   "a": 1,
   "e": "Activity Charge terkait activity seperti LENDING-NEW-ARRANGEMENT; Scheduled Charge → Payment Schedule; Break Rule Charge → Periodic Rules; Charge class → OPT.CCY; Activity Charge class → tidak currency dependent."
  },
  {
   "q": "Match: Break Rule Charge — ?",
   "o": [
    "Periodic Rules",
    "Payment Schedule",
    "LENDING-NEW-ARRANGEMENT",
    "Not currency dependent",
    "Currency dependent optional"
   ],
   "a": 0,
   "e": "Break rule charge didefinisikan di tab Periodic Rules (mis. batas disbursement per tahun)."
  },
  {
   "q": "Match: Scheduled Charge — ?",
   "o": [
    "Currency dependent optional",
    "Payment Schedule",
    "Periodic Rules",
    "LENDING-NEW-ARRANGEMENT",
    "Not currency dependent"
   ],
   "a": 1,
   "e": "Scheduled charge (mis. annual fee) terdefinisi lewat Payment Schedule yang menempel di produk."
  },
  {
   "q": "Match: Charge Property Class — ?",
   "o": [
    "Payment Schedule",
    "Currency dependent optional",
    "Periodic Rules",
    "LENDING-NEW-ARRANGEMENT",
    "Not currency dependent"
   ],
   "a": 1,
   "e": "CHARGE Property Class bertipe OPT.CCY — currency optional/dependent."
  },
  {
   "q": "Match: Activity Charge Property Class — ?",
   "o": [
    "LENDING-NEW-ARRANGEMENT",
    "Not currency dependent",
    "Payment Schedule",
    "Periodic Rules",
    "Currency dependent optional"
   ],
   "a": 1,
   "e": "ACTIVITY.CHARGES tidak bergantung currency."
  }
 ],
 "GLOSSARY": [
  [
   "Arrangement",
   "Kontrak/perjanjian antara bank dan customer dalam AA (mis. pinjaman). Dibuat melalui activity; semua perubahan juga lewat activity."
  ],
  [
   "AA (Arrangement Architecture)",
   "Arsitektur berbasis komponen di T24 untuk membangun produk perbankan dari Property Class yang reusable."
  ],
  [
   "Property Class",
   "Kategori komponen (mis. INTEREST, CHARGE) yang menentukan atribut, action, dan tipe balance. Dirilis Temenos."
  ],
  [
   "Property",
   "Named instance dari Property Class (mis. PRINCIPALINT), dibuat saat implementasi, ditempel ke Product Group."
  ],
  [
   "Product Condition",
   "Kondisi/nilai default property di level produk (tabel AA.PRD.DES.<Property Class>); Id memuat currency & effective date."
  ],
  [
   "Negotiable",
   "Atribut yang boleh diubah di level Arrangement, dikontrol DEFAULT.NEGOTIABLE dan NR.* fields (range, fix value, error/override)."
  ],
  [
   "Commitment Amount",
   "Jumlah yang dijanjikan/dilimpahkan (plafon) pinjaman; balance CURCOMMIT."
  ],
  [
   "Revolving",
   "Pemulihan available commitment saat repayment: No / Payment / Prepayment."
  ],
  [
   "Balance Prefix",
   "CUR (current), ACC (accrued), DUE (jatuh tempo), AGE (overdue), UNC (unallocated credit), UND (unallocated debit), SP (suspend)."
  ],
  [
   "Balance Type",
   "Komponen finansial produk; Contingent / Non-contingent / Internal / Virtual; didefinisikan/extend di AC.BALANCE.TYPE."
  ],
  [
   "Bill",
   "Make Due activity — pemberitahuan pembayaran (principal, interest, charge); dasar overdue & delinquency."
  ],
  [
   "Billed Balance",
   "Saldo yang telah dibuatkan bill (DUE/AGE) — lawan current balance (CUR)."
  ],
  [
   "Overdue / Ageing",
   "Perpindahan status bill setelah lewat due date: Grace, Delinquent, Non Accrual Basis (NAB), dll."
  ],
  [
   "Non Accrual Basis (NAB)",
   "Status saat P&L tidak lagi dibukukan; accrual ke balance suspense ber-suffix SP."
  ],
  [
   "Suspension",
   "Menghentikan booking P&L arrangement; accrual interest/charge ke balance SP; bisa memicu otomatis dari aging atau manual."
  ],
  [
   "Activity",
   "Operasi pada arrangement (disburse, apply payment, accrue, dll.); dikelompokkan dalam Activity Class."
  ],
  [
   "Activity Mapping",
   "Pemetaan Transaction Code (FT/Teller/Cash Pool) ke activity AA."
  ],
  [
   "Payment Rules",
   "Aturan alokasi dana pembayaran: by bill property / bill date / current; urutan oldest first/last; remainder activity."
  ],
  [
   "Remainder Activity",
   "Menangani kelebihan pembayaran — biasanya LENDING-CREDIT-ARRANGEMENT ke credit balance."
  ],
  [
   "Credit Balance (UNC)",
   "Saldo kredit dalam pinjaman (overpaid / paid in advance) yang otomatis dipakai saat bill due."
  ],
  [
   "Payoff",
   "Pelunasan penuh; disimulasikan via LENDING-CALCULATE-PAYOFF; menghasilkan payoff statement & bill dengan expiry."
  ],
  [
   "Simulation",
   "Replikasi skenario tanpa menyentuh record live; data di SIM files; bisa di-Execute menjadi live."
  ],
  [
   "Reverse & Replay",
   "Pembalikan activity back-valued lalu diputar ulang sampai hari ini; butuh opsi REPLAY di Product Line."
  ],
  [
   "Rollover / Reset / Change Product",
   "Activity renewal: rollover (lanjut dgn kondisi tracking), reset (kondisi dari produk), change product (pindah produk baru)."
  ],
  [
   "Periodic Rule",
   "Rule per periode (LIFE/INITIAL/REPEATING/ROLLING) via Periodic Attribute; mis. max/min rate, tolerance perubahan, batasan activity."
  ],
  [
   "Proofing & Publishing",
   "Validasi desain produk (proof) lalu publikasi ke Product Catalog; Available Date & Expiry Date."
  ],
  [
   "Allocation Rule (AC.ALLOCATION.RULE)",
   "Rule yang mengubah accounting event menjadi posting entries (target/contra balance, transaction codes, movement detail)."
  ],
  [
   "Rules Based Accounting",
   "Accounting generik berbasis event (bukan logic detail di aplikasi) — hanya dipakai AA saat ini."
  ],
  [
   "TSA.SERVICE / TSM",
   "Agent service untuk menjalankan simulation service (BNK/AA.SIMULATION.SERVICE)."
  ],
  [
   "Product Line / Product Group / Product",
   "Hierarki: line (LENDING) → group (basic shape) → product (AA.PRODUCT.DESIGNER) → arrangement."
  ],
  [
   "DD.DDI",
   "Mandate Direct Debit untuk settlement; status AVAILABLE; di-update via LENDING-UPDATE-SETTLEMENT."
  ]
 ],
 "MODS": {
  "m1": {
   "t": "Pengenalan Temenos Transact & AA",
   "sec": "Utama",
   "body": [
    [
     "h",
     "Apa itu Temenos Transact (T24)?"
    ],
    [
     "p",
     "<b>Temenos Transact</b> (dulu T24) adalah <b>Core Banking System (CBS)</b> — sistem pusat yang menjalankan operasional harian bank: membuat &amp; memelihara record customer, membuka akun, menawarkan pinjaman &amp; deposito, memproses pembayaran, menghitung bunga, mengelola limit &amp; collateral, dan memposting accounting secara otomatis."
    ],
    [
     "h",
     "Apa itu Core Banking System?"
    ],
    [
     "p",
     "Software yang memungkinkan bank memberikan layanan di <b>semua cabang dari satu database terpusat</b>. Contoh: customer buka home loan di Hyderabad, bayar EMI di Chennai, cek saldo di Mumbai, tutup pinjaman di Bengaluru — semua cabang memakai CBS yang sama."
    ],
    [
     "tbl",
     [
      [
       "Modul",
       "Fungsi"
      ],
      [
       "Customer",
       "Informasi customer"
      ],
      [
       "Accounts",
       "Savings, Current, CASA"
      ],
      [
       "Lending",
       "Home, Personal, Vehicle, Business loans"
      ],
      [
       "Deposits",
       "Fixed &amp; Recurring Deposits"
      ],
      [
       "Payments",
       "Domestic &amp; International"
      ],
      [
       "Limits",
       "Credit limits"
      ],
      [
       "Collateral",
       "Securities pinjaman"
      ],
      [
       "AA",
       "Framework produk lending/deposit/account"
      ]
     ]
    ],
    [
     "h",
     "Apa itu Arrangement Architecture (AA)?"
    ],
    [
     "p",
     "AA adalah <b>product framework</b> untuk mendefinisikan produk perbankan dan mengelola seluruh lifecycle-nya. Alih-alih menulis program terpisah per jenis pinjaman, bank cukup <b>mengonfigurasi</b> produk — meluncurkan Home Loan baru tanpa perubahan kode aplikasi."
    ],
    [
     "p",
     "Mengapa AA diperkenalkan? Sistem lama menyimpan logika produk di dalam program: sulit dirawat, produk baru berminggu-minggu, biaya tinggi. AA menjadikan produk <b>configuration-driven</b>: peluncuran lebih cepat, komponen reusable, minim coding, mudah dirawat, fleksibel, standar."
    ],
    [
     "h",
     "Apa itu Arrangement?"
    ],
    [
     "p",
     "<b>Arrangement</b> = perjanjian bank–customer untuk satu produk. Produk adalah <b>template</b>; arrangement adalah <b>instance</b> untuk customer tertentu."
    ],
    [
     "tbl",
     [
      [
       "Produk",
       "Arrangement"
      ],
      [
       "Dibuat sekali",
       "Dibuat per customer"
      ],
      [
       "Template",
       "Kontrak live"
      ],
      [
       "Aturan default",
       "Nilai spesifik customer"
      ],
      [
       "Dipakai banyak customer",
       "Milik satu customer"
      ]
     ]
    ],
    [
     "h",
     "Posisi AA dalam Loan Lifecycle"
    ],
    [
     "flow",
     [
      "Bank meluncurkan produk",
      "Buat Product di AA",
      "Proof",
      "Publish",
      "Tersedia di Product Catalog",
      "Booking (New Arrangement)",
      "Authorize",
      "Disburse",
      "Interest Accrual",
      "Repayments",
      "Closure"
     ],
     "Setiap proses lending dimulai dari produk AA yang dikonfigurasi dengan benar."
    ],
    [
     "iq",
     [
      [
       "Apa itu Temenos Transact?",
       "Core banking platform untuk mengelola customer, akun, pinjaman, deposito, pembayaran melalui sistem terpusat."
      ],
      [
       "Apa itu AA?",
       "Framework konfigurasi di Temenos untuk mendefinisikan produk dan lifecycle-nya tanpa mengubah kode aplikasi."
      ],
      [
       "Apa itu Arrangement?",
       "Perjanjian live bank–customer berdasarkan produk terkonfigurasi, memuat amount, rate, schedule, status."
      ],
      [
       "Bedanya Product vs Arrangement?",
       "Product = template aturan &amp; default; Arrangement = kontrak aktual customer dari template itu."
      ],
      [
       "Mengapa bank pakai AA?",
       "Produk dapat dikonfigurasi, peluncuran cepat, komponen reusable, pengembangan minim, manajemen konsisten."
      ]
     ]
    ]
   ]
  },
  "m2": {
   "t": "Hierarki Produk AA",
   "sec": "Utama",
   "body": [
    [
     "h",
     "Hierarki Lengkap"
    ],
    [
     "flow",
     [
      "Product Line",
      "Product Group",
      "Product",
      "Property Class",
      "Property",
      "Product Condition",
      "Arrangement"
     ],
     "Inilah hierarki lengkap untuk membangun sebuah produk perbankan."
    ],
    [
     "p",
     "Contoh nyata: Lending → Mortgage Loans → Home Loan → property classes (CUSTOMER, TERM.AMOUNT, INTEREST, PAYMENT.RULES, ACCOUNTING, CHARGES) → properties (Customer, Commitment, Principal Interest, Repayment, Accounting, Processing Fee) → product conditions (interest 8,5%, tenure 20 tahun, EMI bulanan, fee 1%) → Arrangement (Rakesh, pinjaman ₹50.00.000)."
    ],
    [
     "h",
     "1. Product Line"
    ],
    [
     "p",
     "Level tertinggi AA, mewakili area bisnis utama: <b>Lending, Deposits, Accounts, Trade Finance, Islamic Banking</b> — seperti \"departemen\" bank. Lending memuat Home/Vehicle/Personal/Education Loan. Aplikasi: <span class=\"mono\">AA.PRODUCT.LINE</span>."
    ],
    [
     "h",
     "2. Product Group"
    ],
    [
     "p",
     "Mengelompokkan produk sejenis di bawah Product Line (Mortgage, Personal, Business, Vehicle Loans) agar ratusan produk tidak menumpuk langsung di bawah Lending. Aplikasi: <span class=\"mono\">AA.PRODUCT.GROUP</span>."
    ],
    [
     "h",
     "3. Product"
    ],
    [
     "p",
     "Template untuk membuat arrangement (Home Loan → Premium → Staff → Women). Berisi interest rules, charges, repayment rules, accounting rules, limits. Aplikasi: <span class=\"mono\">AA.PRODUCT.DESIGNER</span>."
    ],
    [
     "h",
     "4. Property Class"
    ],
    [
     "p",
     "Kategori fungsi bisnis: CUSTOMER, TERM.AMOUNT, INTEREST, PAYMENT.RULES, ACCOUNTING, CHARGES, LIMIT, COLLATERAL. Product Line menentukan property class mana yang mandatory/opsional."
    ],
    [
     "h",
     "5. Property"
    ],
    [
     "p",
     "Implementasi dari Property Class. Contoh INTEREST → Principal Interest, Penalty Interest, Floating, Fixed; CHARGES → Processing Fee, Late Payment Charge, Documentation Fee. Satu produk memakai satu atau beberapa property per class."
    ],
    [
     "h",
     "6. Product Condition"
    ],
    [
     "p",
     "Menyimpan <b>aturan default</b> property. Contoh: Principal Interest → rate 8,50%, tipe Fixed, basis 365 hari, compounding bulanan; Repayment → bulanan, 240 cicilan, EMI. Default disalin ke arrangement customer saat booking."
    ],
    [
     "h",
     "7. Arrangement"
    ],
    [
     "p",
     "Kontrak live customer: Rakesh, Home Loan, ₹50.00.000, 8,25%, 15 tahun. Setelah authorized, activity disbursement/accrual/repayment/payoff berjalan terhadapnya."
    ],
    [
     "tbl",
     [
      [
       "Komponen",
       "Aplikasi"
      ],
      [
       "Product Line",
       "AA.PRODUCT.LINE"
      ],
      [
       "Product Group",
       "AA.PRODUCT.GROUP"
      ],
      [
       "Product",
       "AA.PRODUCT.DESIGNER"
      ],
      [
       "Product Catalog",
       "AA.PRODUCT.CATALOG"
      ],
      [
       "Arrangement Activity",
       "AA.ARRANGEMENT.ACTIVITY"
      ],
      [
       "Arrangement",
       "AA.ARRANGEMENT"
      ]
     ]
    ],
    [
     "iq",
     [
      [
       "Apa itu Product Line?",
       "Level tertinggi AA yang mewakili domain bisnis seperti Lending, Deposits, Accounts."
      ],
      [
       "Mengapa perlu Product Group?",
       "Mengorganisir produk sejenis dalam satu Product Line agar manajemen terstruktur."
      ],
      [
       "Apa itu Property Class?",
       "Kategori bisnis yang mengelompokkan fungsionalitas terkait: Interest, Accounting, Payment Rules."
      ],
      [
       "Apa itu Property?",
       "Implementasi terkonfigurasi dari Property Class yang menentukan perilaku produk."
      ],
      [
       "Apa itu Product Condition?",
       "Menyimpan nilai default &amp; aturan property: rate, frekuensi repayment, charges."
      ]
     ]
    ]
   ]
  },
  "m3": {
   "t": "Konfigurasi Produk di AA",
   "sec": "Utama",
   "body": [
    [
     "h",
     "Skenario"
    ],
    [
     "p",
     "ABC Bank ingin meluncurkan Home Loan: bunga 8,5%, tenure maks 20 tahun, EMI bulanan, processing fee 1%. Produk belum ada — harus dikonfigurasi dulu."
    ],
    [
     "flow",
     [
      "Business Requirement",
      "Buat Product Line",
      "Buat Product Group",
      "Buat Product",
      "Attach Property Classes",
      "Attach Properties",
      "Configure Product Conditions",
      "Configure Negotiation",
      "Configure ARR.LINK",
      "Proof",
      "Publish",
      "Tersedia di Catalog"
     ]
    ],
    [
     "h",
     "Langkah 1–3: Line, Group, Product"
    ],
    [
     "p",
     "LENDING (AA.PRODUCT.LINE) → Mortgage Loans (AA.PRODUCT.GROUP) → HOME.LOAN / Standard Home Loan (AA.PRODUCT.DESIGNER). Produk belum tahu interest/charges/repayment/accounting — semua ditambahkan via Properties."
    ],
    [
     "h",
     "Langkah 4–5: Property Class &amp; Property"
    ],
    [
     "tbl",
     [
      [
       "Property Class",
       "Mandatory",
       "Property"
      ],
      [
       "CUSTOMER",
       "Ya",
       "Customer"
      ],
      [
       "TERM.AMOUNT",
       "Ya",
       "Commitment"
      ],
      [
       "INTEREST",
       "Ya",
       "Principal Interest"
      ],
      [
       "PAYMENT.RULES",
       "Ya",
       "Repayment"
      ],
      [
       "ACCOUNTING",
       "Ya",
       "Accounting"
      ],
      [
       "CHARGES",
       "Tidak",
       "Processing Fee"
      ],
      [
       "LIMIT",
       "Opsional",
       "—"
      ]
     ]
    ],
    [
     "h",
     "Langkah 6: Product Conditions (default)"
    ],
    [
     "tbl",
     [
      [
       "Kelompok",
       "Kondisi"
      ],
      [
       "Interest",
       "Rate 8,50% · Fixed · basis 365 hari"
      ],
      [
       "Repayment",
       "Bulanan · 240 cicilan · EMI"
      ],
      [
       "Charges",
       "Processing Fee 1%"
      ],
      [
       "Loan Amount",
       "Min ₹1.00.000 · Maks ₹1.00.00.000"
      ]
     ]
    ],
    [
     "h",
     "Langkah 7: Negotiation"
    ],
    [
     "p",
     "Field tidak harus tetap. Contoh: default 8,50%, manager boleh menawarkan 8,25%/8,00%. Produk menetapkan <b>min 8,00% — default 8,50% — maks 9,00%</b>; user berwenang bernegosiasi dalam rentang itu. Customer A dapat 8,50%, customer B (salary account) 8,25% — produk sama, arrangement berbeda."
    ],
    [
     "h",
     "Langkah 8: ARR.LINK"
    ],
    [
     "p",
     "Konsep AA terpenting: menentukan apakah <b>perubahan produk di masa depan mempengaruhi arrangement eksisting</b>."
    ],
    [
     "list",
     [
      "<b>TRACKING</b> — perubahan produk otomatis memperbarui arrangement (produk 8,5% → 9%, arrangement ikut 9%).",
      "<b>NON-TRACKING</b> — arrangement tidak berubah (produk 9%, arrangement tetap 8,5%).",
      "<b>TRACKING ONLY</b> — arrangement selalu mengikuti nilai produk; user tidak bisa menegosiasikan."
     ]
    ],
    [
     "h",
     "Langkah 9–10: Proof &amp; Publish"
    ],
    [
     "p",
     "Proof memvalidasi: mandatory property class/property, product conditions, relationship, error konfigurasi. Jika gagal, field <span class=\"mono\">PRODUCT.ERROR</span> menampilkan masalah + saran. Publish menetapkan <b>Available Date</b> &amp; <b>Expiry Date</b>; baru setelah publish produk muncul di Product Catalog."
    ],
    [
     "p",
     "Contoh: festive offer (bunga 8%, fee 0,5%, tenure maks 25 tahun) cukup dengan update conditions → proof → publish; arrangement lama tetap berperilaku sesuai ARR.LINK-nya."
    ],
    [
     "iq",
     [
      [
       "Apa itu Product Configuration?",
       "Proses mendefinisikan produk: membuat produk, attach property class &amp; property, configure conditions, negotiation, tracking, validasi Proof, lalu publish."
      ],
      [
       "Apa tujuan Negotiation?",
       "Mengizinkan perubahan nilai condition tertentu (rate, tenure) dalam batas yang ditentukan saat pembuatan arrangement."
      ],
      [
       "Apa itu ARR.LINK?",
       "Mengontrol apakah perubahan produk di masa depan mempengaruhi arrangement eksisting."
      ],
      [
       "Bedanya Proof vs Publish?",
       "Proof memvalidasi konfigurasi &amp; menemukan error; Publish menjadikan produk tersedia di Product Catalog."
      ],
      [
       "Bisa pakai produk tanpa publish?",
       "Tidak — harus lolos Proof lalu di-Publish."
      ]
     ]
    ]
   ]
  },
  "m4": {
   "t": "Loan Booking (New Arrangement)",
   "sec": "Utama",
   "body": [
    [
     "h",
     "Skenario"
    ],
    [
     "p",
     "Produk Home Loan sudah dikonfigurasi. Customer Rakesh Kumar ingin pinjaman ₹50.00.000, 20 tahun, EMI bulanan. Proses ini disebut <b>Loan Booking</b> — membuat Arrangement live dari Produk yang ada."
    ],
    [
     "flow",
     [
      "Produk terkonfigurasi",
      "Customer apply",
      "Eligibility diverifikasi",
      "Pilih produk",
      "Input detail pinjaman",
      "Validate",
      "Authorize",
      "Arrangement dibuat",
      "Siap disburse"
     ]
    ],
    [
     "tbl",
     [
      [
       "Aplikasi",
       "Fungsi"
      ],
      [
       "AA.ARRANGEMENT.ACTIVITY",
       "Loan booking (utama)"
      ],
      [
       "AA.ARRANGEMENT",
       "Lihat arrangement"
      ],
      [
       "AA.PRODUCT.CATALOG",
       "Pemilihan produk"
      ]
     ]
    ],
    [
     "h",
     "Langkah Booking 1–6"
    ],
    [
     "list",
     [
      "<b>Product Catalog</b>: LENDING → Mortgage Loans → Standard Home Loan → klik <i>New Arrangement</i>.",
      "<b>Customer</b>: pilih ID (100234 — Rakesh Kumar). Validasi: ada, aktif, KYC lengkap, eligible.",
      "<b>Loan Amount</b>: ₹50.00.000 — divalidasi min/maks produk &amp; limit customer.",
      "<b>Currency</b>: INR — default dari produk, bisa dinegosiasikan bila diizinkan.",
      "<b>Agreement Date</b>: 20-Jul-2026 — tanggal perjanjian ditandatangani.",
      "<b>Term</b>: 20 tahun — divalidasi min/maks &amp; aturan negosiasi."
     ]
    ],
    [
     "h",
     "Agreement Date vs Effective Date (sering ditanya interview!)"
    ],
    [
     "tbl",
     [
      [
       "Agreement Date",
       "Effective Date"
      ],
      [
       "Tanggal kontrak ditandatangani (20-Jul)",
       "Tanggal mulai proses (25-Jul)"
      ],
      [
       "Legal agreement",
       "Bunga, accrual &amp; proses pinjaman mulai dari sini"
      ]
     ]
    ],
    [
     "p",
     "<b>Future-dated</b>: agreement 20-Jul, effective 25-Jul — pinjaman sudah ada tapi tanpa accounting &amp; disbursement sampai effective date. <b>Back-dated</b>: effective 10-Jul (sebelum hari ini) — sistem menghitung bunga/accrual/due dari 10-Jul sesuai aturan bank."
    ],
    [
     "h",
     "Langkah 7–12"
    ],
    [
     "list",
     [
      "<b>Interest</b>: default 8,50% → dinegosiasikan 8,25% (produk mengizinkan).",
      "<b>Repayment</b>: bulanan (weekly/fortnightly/quarterly/half-yearly/yearly) &amp; method EMI (atau Bullet, Interest Only, Linear, Constant).",
      "<b>Collateral</b>: House Property (opsional sesuai produk).",
      "<b>Limits</b>: limit kredit ₹75.00.000, diminta ₹50.00.000 → lolos.",
      "<b>Validasi</b>: field wajib, customer, produk, negosiasi, limit, tanggal, currency, repayment, interest, charges → status <b>INPUT</b>.",
      "<b>Authorization</b>: maker membuat → checker mengauthorize → status <b>AUTHORIZED</b>."
     ]
    ],
    [
     "h",
     "Setelah Authorize (internal)"
    ],
    [
     "list",
     [
      "Product Conditions disalin menjadi <b>Arrangement Conditions</b>.",
      "Dibuat <b>Arrangement ID</b> unik, contoh LD22000145.",
      "Disimpan nilai spesifik customer (bukan default produk)."
     ]
    ],
    [
     "flow",
     [
      "INPUT",
      "UNAUTHORIZED",
      "AUTHORIZED",
      "ACTIVE",
      "CLOSED"
     ],
     "Alur status arrangement."
    ],
    [
     "p",
     "Backend membuat: arrangement, customer link, interest conditions, repayment schedule, accounting references, activity log. Tabel: AA.ARRANGEMENT.ACTIVITY, AA.ARRANGEMENT, CUSTOMER, ACCOUNT, LIMIT, AA.ACTIVITY."
    ],
    [
     "h",
     "Skenario Testing"
    ],
    [
     "list",
     [
      "<b>Positif</b>: arrangement &amp; ID tergenerate; default interest tersalin; negotiated interest tersimpan; frekuensi repayment benar; maker-checker berjalan; status AUTHORIZED.",
      "<b>Negatif</b>: customer tidak ada; melebihi limit produk; currency invalid; field wajib kosong; bunga di luar rentang negosiasi; produk expired/belum publish; customer diblokir."
     ]
    ],
    [
     "iq",
     [
      [
       "Apa itu Loan Booking?",
       "Membuat Arrangement spesifik-customer dari produk lending yang terkonfigurasi."
      ],
      [
       "Aplikasi untuk Loan Booking?",
       "AA.ARRANGEMENT.ACTIVITY."
      ],
      [
       "Apa yang dibuat setelah authorization?",
       "Arrangement authorized dengan Arrangement ID unik berisi product condition spesifik customer."
      ],
      [
       "Agreement vs Effective date?",
       "Agreement: kontrak ditandatangani. Effective: bunga/accrual/proses pinjaman dimulai."
      ],
      [
       "Validasi saat booking?",
       "Customer, produk, limit, field wajib, negosiasi, currency, repayment, tanggal."
      ]
     ]
    ]
   ]
  },
  "m5": {
   "t": "Loan Disbursement",
   "sec": "Utama",
   "body": [
    [
     "h",
     "Skenario"
    ],
    [
     "p",
     "Pinjaman Rakesh sudah AUTHORIZED (₹50.00.000, 8,25%, 20 tahun) tapi dana belum cair. <b>Disbursement</b> = melepaskan dana yang disetujui ke customer / pihak ketiga. Arrangement sudah ada; disbursement membuat dana tersedia."
    ],
    [
     "flow",
     [
      "Authorized Arrangement",
      "Initiate Disbursement",
      "Validate Arrangement",
      "Validate Amount",
      "Validate Settlement Account",
      "Accounting Entries",
      "Credit Customer",
      "Update Outstanding Principal",
      "Activity Completed"
     ]
    ],
    [
     "h",
     "Tipe Disbursement"
    ],
    [
     "tbl",
     [
      [
       "Tipe",
       "Penjelasan",
       "Contoh"
      ],
      [
       "Full",
       "Seluruh amount sekaligus",
       "Approved ₹50L → disbursed ₹50L"
      ],
      [
       "Partial",
       "Sebagian amount",
       "₹50L → ₹20L (sisa ₹30L) — umum di konstruksi/project/pendidikan"
      ],
      [
       "Multiple",
       "Bertahap per stage",
       "Foundation ₹10L, Structure ₹15L, Roofing ₹15L, Completion ₹10L"
      ]
     ]
    ],
    [
     "h",
     "Proses &amp; Validasi"
    ],
    [
     "list",
     [
      "Buka <span class=\"mono\">AA.ARRANGEMENT.ACTIVITY</span>, pilih activity DISBURSEMENT.",
      "Cek arrangement: ada, authorized, aktif; produk mengizinkan disbursement; customer aktif.",
      "Amount: tidak melebihi approval, sesuai aturan produk, currency cocok.",
      "<b>Settlement account</b>: akun tujuan dana — dicek ada, aktif, currency cocok, posting diizinkan."
     ]
    ],
    [
     "h",
     "Accounting Entries"
    ],
    [
     "tbl",
     [
      [
       "Entry",
       "Amount"
      ],
      [
       "Debit — Loan Asset GL",
       "₹50.00.000"
      ],
      [
       "Credit — Customer Settlement Account",
       "₹50.00.000"
      ]
     ]
    ],
    [
     "p",
     "Bank menciptakan aset pinjaman; customer menerima dana. Sistem memperbarui Outstanding Principal, Disbursed Amount, Available Balance, activity record &amp; audit."
    ],
    [
     "h",
     "Kapan Bunga Mulai?"
    ],
    [
     "p",
     "Bunga berjalan atas <b>jumlah yang telah disbursed</b> sejak tanggal effective disbursement. Disbursed ₹20L → bunga hanya atas ₹20L sampai pencairan berikutnya."
    ],
    [
     "h",
     "Testing &amp; Isu Produksi"
    ],
    [
     "list",
     [
      "Positif: full/partial/multiple disbursement; outstanding benar; settlement account terkredit; accounting terposting; status completed.",
      "Negatif: melebihi approval; settlement account closed; currency invalid; arrangement unauthorized; akun beku; duplikat request; produk tak mendukung multiple disbursement."
     ]
    ],
    [
     "tbl",
     [
      [
       "Isu",
       "Penyebab"
      ],
      [
       "Dana tidak masuk",
       "Settlement account invalid"
      ],
      [
       "Accounting gagal",
       "GL mapping hilang"
      ],
      [
       "Amount mismatch",
       "Product condition error"
      ],
      [
       "Interest salah",
       "Tanggal disbursement salah"
      ],
      [
       "Disbursement ganda",
       "Activity diproses dua kali"
      ]
     ]
    ],
    [
     "iq",
     [
      [
       "Apa itu Loan Disbursement?",
       "Melepaskan dana pinjaman yang disetujui ke customer/pihak ketiga setelah arrangement authorized."
      ],
      [
       "Boleh sebagian?",
       "Ya — konstruksi/pendidikan sering pakai partial/staged disbursement."
      ],
      [
       "Kapan bunga mulai?",
       "Pada jumlah yang disbursed sejak effective disbursement date, sesuai konfigurasi produk."
      ],
      [
       "Aplikasi untuk disbursement?",
       "AA.ARRANGEMENT.ACTIVITY."
      ],
      [
       "Validasi sebelum disbursement?",
       "Status arrangement &amp; customer, settlement account, currency, limit amount, aturan produk, authorization."
      ]
     ]
    ]
   ]
  },
  "m6": {
   "t": "Interest Accrual & COB",
   "sec": "Utama",
   "body": [
    [
     "h",
     "Skenario"
    ],
    [
     "p",
     "Pinjaman ₹50.00.000 @8,25% disbursed 01-Aug-2026; EMI pertama 05-Sep-2026. Bank <b>tidak menunggu EMI</b> untuk mengakui pendapatan — bunga dihitung &amp; dicatat <b>setiap hari</b> lewat <b>Interest Accrual</b> saat <b>COB (Close of Business)</b>."
    ],
    [
     "h",
     "Rumus Bunga Harian"
    ],
    [
     "box",
     "Daily Interest = (Principal × Rate) ÷ 365<br>Contoh: (50.00.000 × 8,25%) ÷ 365 ≈ ₹1.130,14 per hari"
    ],
    [
     "p",
     "Prinsip: <b>Accrual Accounting</b> — pendapatan diakui saat diperoleh, bukan saat kas diterima, sehingga laporan keuangan akurat."
    ],
    [
     "h",
     "Apa itu COB?"
    ],
    [
     "p",
     "Batch process setelah jam operasional: interest accrual, kapitalisasi bunga (jika ada), generate repayment due, charges, penalty, GL posting, update status, end-of-day processing lainnya."
    ],
    [
     "h",
     "Accrual vs Posting"
    ],
    [
     "tbl",
     [
      [
       "Accrual",
       "Posting"
      ],
      [
       "Proses harian",
       "Proses periodik"
      ],
      [
       "Menghitung bunga yang terjadi",
       "Memindahkan bunga accrued ke dues/income sesuai aturan"
      ],
      [
       "Saat COB",
       "Tanggal posting terjadwal / aturan produk"
      ],
      [
       "Tanpa pembayaran customer",
       "Bisa mempengaruhi saldo customer sesuai konfigurasi"
      ]
     ]
    ],
    [
     "h",
     "Day Count Convention"
    ],
    [
     "tbl",
     [
      [
       "Metode",
       "Deskripsi"
      ],
      [
       "Actual/365",
       "Hari aktual / 365"
      ],
      [
       "Actual/360",
       "Hari aktual / 360"
      ],
      [
       "30/360",
       "Tiap bulan dianggap 30 hari"
      ],
      [
       "Actual/Actual",
       "Hari kalender aktual"
      ]
     ],
     "Didefinisikan di Interest Property saat konfigurasi produk."
    ],
    [
     "h",
     "Fixed vs Floating"
    ],
    [
     "list",
     [
      "<b>Fixed</b>: 8,25% konstan selama pinjaman.",
      "<b>Floating</b>: Repo Rate + Spread — saat benchmark berubah, Temenos menghitung ulang accrual mendatang dengan rate baru setelah tanggal efektif perubahan."
     ]
    ],
    [
     "flow",
     [
      "COB mulai",
      "Identifikasi arrangement aktif",
      "Baca outstanding principal",
      "Baca kondisi bunga",
      "Hitung bunga harian",
      "Buat accrual record",
      "Posting GL",
      "Update arrangement",
      "COB selesai"
     ]
    ],
    [
     "h",
     "Accounting &amp; Validasi"
    ],
    [
     "tbl",
     [
      [
       "Entry",
       "Amount"
      ],
      [
       "Debit — Interest Receivable GL",
       "₹1.130,14"
      ],
      [
       "Credit — Interest Income GL",
       "₹1.130,14"
      ]
     ]
    ],
    [
     "list",
     [
      "Positif: accrual harian muncul setelah COB; amount sesuai rate; mulai dari tanggal effective; perubahan floating rate mempengaruhi accrual mendatang; GL &amp; activity history benar; tanpa accrual duplikat per tanggal bisnis.",
      "Negatif: rate hilang; day count invalid; COB terputus; arrangement inactive/closed; outstanding negatif; GL mapping hilang.",
      "Cek consultant: tanggal mulai bunga, outstanding yang dipakai, day count, akurasi harian, posting GL sukses, COB tanpa error, tanpa duplikasi."
     ]
    ],
    [
     "iq",
     [
      [
       "Apa itu Interest Accrual?",
       "Kalkulasi &amp; pengakuan bunga harian atas outstanding pinjaman, biasanya saat COB, walau EMI belum dibayar."
      ],
      [
       "Apa itu COB?",
       "Batch end-of-day: interest accrual, due generation, accounting update, charges, activity terjadwal lainnya."
      ],
      [
       "Bedanya Accrual vs Posting?",
       "Accrual mengakui bunga terjadi (harian, tanpa pembayaran); Posting menerapkan sesuai aturan (periodik, bisa mempengaruhi dues)."
      ],
      [
       "Kapan accrual mulai?",
       "Dari tanggal effective disbursement, atas outstanding principal sesuai konfigurasi produk."
      ],
      [
       "Jika pinjaman baru sebagian disbursed?",
       "Bunga hanya accrue atas outstanding yang telah disbursed, bukan porsi yang belum dicairkan."
      ]
     ]
    ]
   ]
  },
  "m7": {
   "t": "Repayment & EMI Processing",
   "sec": "Utama",
   "body": [
    [
     "h",
     "Skenario"
    ],
    [
     "p",
     "EMI tanggal 5 tiap bulan; EMI pertama dibayar 05-Sep. Temenos memproses repayment: principal + interest + charges + penal interest + pajak (jika ada)."
    ],
    [
     "h",
     "Apa itu EMI?"
    ],
    [
     "p",
     "<b>Equated Monthly Installment</b> — jumlah tetap yang dibayar berkala sampai lunas. Contoh: ₹50.00.000, 20 tahun, 8,25% → EMI ±₹42.603. Mula-mula porsi interest &gt; principal; lama-lama principal &gt; interest."
    ],
    [
     "h",
     "Repayment Schedule &amp; Due Generation"
    ],
    [
     "tbl",
     [
      [
       "EMI ke",
       "Due",
       "Principal",
       "Interest",
       "Total"
      ],
      [
       "1",
       "05-Sep",
       "₹8.200",
       "₹34.403",
       "₹42.603"
      ],
      [
       "2",
       "05-Okt",
       "₹8.250",
       "₹34.353",
       "₹42.603"
      ],
      [
       "3",
       "05-Nov",
       "₹8.310",
       "₹34.293",
       "₹42.603"
      ]
     ],
     "Schedule dibuat saat arrangement authorized dan diupdate tiap pembayaran. Sebelum tanggal EMI, COB men-generate jumlah due (status DUE)."
    ],
    [
     "h",
     "Payment Allocation"
    ],
    [
     "flow",
     [
      "Customer Payment",
      "Charges",
      "Penalty Interest",
      "Interest",
      "Principal"
     ],
     "Urutan alokasi dikonfigurasi di produk (sebagian bank memprioritaskan interest lebih dulu). Contoh ₹42.603 → charges ₹500 + interest ₹33.903 + principal ₹8.200."
    ],
    [
     "h",
     "Kasus Khusus"
    ],
    [
     "list",
     [
      "<b>Partial payment</b>: bayar ₹20.000 dari due ₹42.603 → sisa ₹22.603; sesuai produk: tetap outstanding/overdue, penalty bisa berlaku, COB berikutnya update saldo overdue.",
      "<b>Advance payment</b>: bayar ₹85.206 → sesuai aturan produk: disesuaikan ke cicilan mendatang, langsung memotong principal, atau ditahan sampai due berikutnya.",
      "<b>Missed EMI</b>: lewat due date tanpa bayar → status OVERDUE; COB berikutnya menghitung penal interest, update saldo overdue, informasi collection."
     ]
    ],
    [
     "h",
     "Accounting"
    ],
    [
     "tbl",
     [
      [
       "Entry",
       "Amount"
      ],
      [
       "Debit — Customer Settlement Account",
       "₹42.603"
      ],
      [
       "Credit — Interest Receivable",
       "₹33.903"
      ],
      [
       "Credit — Loan Principal",
       "₹8.200"
      ],
      [
       "Credit — Charges Income",
       "₹500"
      ]
     ]
    ],
    [
     "p",
     "Backend: validasi arrangement → baca repayment rules → alokasi → update principal/interest → accounting → update schedule → tutup due (jika lunas). Update: outstanding principal, interest balance, cicilan terbayar, next due date, activity history."
    ],
    [
     "iq",
     [
      [
       "Apa itu Repayment?",
       "Membayar pinjaman sesuai schedule — bisa mencakup principal, interest, charges, penalty."
      ],
      [
       "Apa itu EMI?",
       "Pembayaran berkala tetap untuk melunasi pinjaman dalam tenure yang disepakati."
      ],
      [
       "Jika hanya bayar sebagian EMI?",
       "Sisa umumnya outstanding &amp; bisa overdue; penalty/overdue tergantung konfigurasi produk."
      ],
      [
       "Bagaimana Temenos mengalokasikan pembayaran?",
       "Sesuai payment allocation rules produk: charges, penalty, interest, principal."
      ],
      [
       "Aplikasi repayment?",
       "AA.ARRANGEMENT.ACTIVITY (activity REPAYMENT)."
      ]
     ]
    ]
   ]
  },
  "m8": {
   "t": "Overdue Management & Delinquency",
   "sec": "Utama",
   "body": [
    [
     "h",
     "Skenario"
    ],
    [
     "p",
     "EMI due 05-Sep ₹42.603 tidak dibayar → 06-Sep Temenos mulai overdue processing. <b>Overdue</b> = gagal membayar pada/before due date; <b>Delinquency</b> = kondisi customer memiliki overdue."
    ],
    [
     "flow",
     [
      "Loan aktif",
      "EMI due digenerate",
      "Customer tak bayar",
      "COB deteksi overdue",
      "DPD mulai",
      "Penalty interest",
      "Collection",
      "Recovery / Reschedule",
      "Regularized / Closed"
     ]
    ],
    [
     "h",
     "DPD (Days Past Due)"
    ],
    [
     "tbl",
     [
      [
       "Due",
       "Hari ini",
       "DPD"
      ],
      [
       "05-Sep",
       "06-Sep",
       "1"
      ],
      [
       "05-Sep",
       "10-Sep",
       "5"
      ],
      [
       "05-Sep",
       "05-Okt",
       "30"
      ]
     ],
     "Diupdate saat COB. Tiap COB mengecek: due? sudah dibayar? outstanding? lalu hitung DPD, penalty, update status."
    ],
    [
     "h",
     "Penalty &amp; Late Charge"
    ],
    [
     "box",
     "Contoh: normal 8,25% + penalty 2% = 10,25% efektif selama overdue.<br>Late Payment Fee tetap, mis. ₹500 — ditambahkan ke outstanding dues."
    ],
    [
     "h",
     "Collection &amp; Recovery"
    ],
    [
     "list",
     [
      "Collection: SMS → email → telepon → kunjungan petugas → legal notice.",
      "Recovery: tim recovery, restrukturisasi pinjaman, legal recovery, eksekusi collateral."
     ]
    ],
    [
     "h",
     "Klasifikasi Pinjaman"
    ],
    [
     "tbl",
     [
      [
       "DPD",
       "Status bisnis"
      ],
      [
       "0",
       "Regular"
      ],
      [
       "1–30",
       "Early delinquency"
      ],
      [
       "31–90",
       "Serious delinquency"
      ],
      [
       "&gt;90",
       "Potensi NPA (sesuai regulasi"
      ]
     ],
     "Klasifikasi pasti bergantung regulasi lokal &amp; kebijakan bank."
    ],
    [
     "h",
     "Accounting &amp; Testing"
    ],
    [
     "tbl",
     [
      [
       "Entry",
       "Amount"
      ],
      [
       "Debit — Customer Charges Receivable",
       "₹500"
      ],
      [
       "Credit — Charges Income GL",
       "₹500"
      ]
     ]
    ],
    [
     "list",
     [
      "Positif: status overdue setelah EMI bolos; DPD naik harian; penalty &amp; late charge terposting; status collection update; repayment menghapus overdue; accounting benar.",
      "Negatif: penalty sebelum due; DPD salah; penalty duplikat; status overdue salah; arrangement closed ditandai overdue."
     ]
    ],
    [
     "iq",
     [
      [
       "Apa itu overdue?",
       "Customer tidak membayar repayment terjadwal pada/before due date."
      ],
      [
       "Apa itu DPD?",
       "Jumlah hari pembayaran tak dibayar sejak due date."
      ],
      [
       "Kapan penalty diberlakukan?",
       "Setelah repayment overdue, sesuai konfigurasi produk &amp; aturan bank."
      ],
      [
       "Overdue vs delinquency?",
       "Overdue: kejadian per transaksi (pembayaran bolos). Delinquency: kondisi keseluruhan ada repayment overdue."
      ],
      [
       "Apakah pinjaman overdue bisa normal lagi?",
       "Ya — setelah seluruh overdue (termasuk bunga &amp; charge) dilunasi, status kembali regular sesuai aturan bank."
      ]
     ]
    ]
   ]
  },
  "m9": {
   "t": "Rescheduling / Restructuring",
   "sec": "Utama",
   "body": [
    [
     "h",
     "Skenario"
    ],
    [
     "p",
     "Rakesh kehilangan pekerjaan; EMI ₹42.603 terlalu berat. Bank merestrukturisasi. <b>Rescheduling</b> = mengubah syarat pinjaman <b>tanpa membuat pinjaman baru</b>; arrangement yang sama berlanjut."
    ],
    [
     "h",
     "Jenis Rescheduling"
    ],
    [
     "tbl",
     [
      [
       "Tipe",
       "Deskripsi",
       "Contoh"
      ],
      [
       "EMI Reduction",
       "EMI lebih ringan",
       "₹42.603 → ₹34.800 (tenure biasanya naik)"
      ],
      [
       "Tenure Extension",
       "Perpanjang periode",
       "20 → 25 tahun (EMI turun)"
      ],
      [
       "Interest Revision",
       "Ubah bunga",
       "8,25% → 7,90% → schedule dihitung ulang"
      ],
      [
       "Moratorium",
       "Payment holiday sementara",
       "6 bulan tanpa EMI (bunga: tetap accrue / capitalize / deferred)"
      ],
      [
       "Frequency Change",
       "Ubah frekuensi",
       "Bulanan → kuartalan"
      ],
      [
       "Balloon",
       "Pembayaran besar di akhir",
       "—"
      ],
      [
       "Top-up",
       "Tambahan plafon",
       "Outstanding ₹30L + top-up ₹10L = ₹40L, schedule dihitung ulang"
      ],
      [
       "Additional Disbursement",
       "Pencairan bertahap",
       "Stage ₹20L + ₹15L + ₹15L (tiap cair: principal/interest/schedule diupdate)"
      ]
     ]
    ],
    [
     "h",
     "Activity &amp; Flow"
    ],
    [
     "p",
     "Aplikasi: <span class=\"mono\">AA.ARRANGEMENT.ACTIVITY</span>; activity: RESCHEDULE, CHANGE.TERM, CHANGE.INTEREST, CHANGE.REPAYMENT, MORATORIUM, TOP.UP."
    ],
    [
     "flow",
     [
      "Customer request",
      "Bank review",
      "Approval",
      "Pilih arrangement",
      "Pilih activity reschedule",
      "Ubah kondisi",
      "Validasi",
      "Maker simpan",
      "Checker authorize",
      "Schedule baru",
      "Pinjaman lanjut"
     ]
    ],
    [
     "p",
     "Backend: baca arrangement &amp; kondisi → terapkan kondisi baru → hitung ulang bunga &amp; EMI → generate schedule baru → update arrangement → catat activity. Accounting: umumnya <b>tanpa entry customer langsung</b> (hanya update future interest/installment); kecuali top-up → Debit Loan Asset GL / Credit Customer Account ₹10.00.000."
    ],
    [
     "iq",
     [
      [
       "Apa itu Loan Rescheduling?",
       "Mengubah syarat pinjaman eksisting tanpa membuat pinjaman baru; arrangement sama berlanjut."
      ],
      [
       "Rescheduling vs restructuring?",
       "Rescheduling mengubah syarat repayment (operasional); restructuring lebih luas untuk borrower bermasalah."
      ],
      [
       "Aplikasi rescheduling?",
       "AA.ARRANGEMENT.ACTIVITY."
      ],
      [
       "Setelah reschedule?",
       "Schedule dihitung ulang, kondisi diupdate, activity dicatat."
      ],
      [
       "Apakah buat arrangement baru?",
       "Tidak — hanya syarat &amp; schedule mendatang yang berubah."
      ]
     ]
    ]
   ]
  },
  "m10": {
   "t": "Prepayment, Payoff & Closure",
   "sec": "Utama",
   "body": [
    [
     "h",
     "Skenario"
    ],
    [
     "p",
     "Outstanding principal ₹28.00.000, bunga 8,25%, sisa tenure 10 tahun. Rakesh dapat bonus dan ingin melunasi segera. <b>Prepayment</b> = membayar sebelum due date (partial atau full)."
    ],
    [
     "h",
     "Partial vs Full Prepayment"
    ],
    [
     "tbl",
     [
      [
       "Partial Prepayment",
       "Full Prepayment"
      ],
      [
       "Sebagian outstanding dibayar",
       "Seluruh outstanding dibayar"
      ],
      [
       "Pinjaman tetap aktif",
       "Pinjaman closed setelah payoff sukses"
      ],
      [
       "₹28L → bayar ₹5L → sisa ₹23L",
       "₹28L + interest ₹25.000 + charges ₹10.000 = payoff ₹28.35.000"
      ]
     ]
    ],
    [
     "h",
     "Foreclosure &amp; Payoff"
    ],
    [
     "p",
     "<b>Foreclosure</b> = menutup pinjaman sebelum maturity setelah semua dues dibayar. Banyak bank: Foreclosure = Full Prepayment + Loan Closure. <b>Payoff</b> = jumlah settlement akhir untuk menutup pinjaman sepenuhnya."
    ],
    [
     "flow",
     [
      "Outstanding Principal",
      "Accrued Interest",
      "Penalty Interest (jika ada)",
      "Pre-closure Charges",
      "Taxes",
      "Payoff Amount"
     ]
    ],
    [
     "tbl",
     [
      [
       "Komponen",
       "Amount"
      ],
      [
       "Outstanding Principal",
       "₹28.00.000"
      ],
      [
       "Accrued Interest",
       "₹25.000"
      ],
      [
       "Penal Interest",
       "₹2.000"
      ],
      [
       "Pre-closure Charge",
       "₹8.000"
      ],
      [
       "GST",
       "₹1.440"
      ],
      [
       "<b>Total Payoff</b>",
       "<b>₹28.36.440</b>"
      ]
     ]
    ],
    [
     "p",
     "Pre-closure charge contoh 2% × ₹28.00.000 = ₹56.000 — tergantung produk &amp; regulasi. Activity: PAYOFF atau SETTLEMENT via <span class=\"mono\">AA.ARRANGEMENT.ACTIVITY</span>."
    ],
    [
     "h",
     "Accounting"
    ],
    [
     "tbl",
     [
      [
       "Entry",
       "Amount"
      ],
      [
       "Debit — Customer Settlement Account",
       "₹28.36.440"
      ],
      [
       "Credit — Loan Principal",
       "₹28.00.000"
      ],
      [
       "Credit — Interest Receivable",
       "₹25.000"
      ],
      [
       "Credit — Penalty Income",
       "₹2.000"
      ],
      [
       "Credit — Charges Income",
       "₹8.000"
      ],
      [
       "Credit — GST Payable",
       "₹1.440"
      ]
     ]
    ],
    [
     "flow",
     [
      "AUTHORIZED",
      "ACTIVE",
      "PAYOFF INITIATED",
      "PAYMENT COMPLETED",
      "CLOSED"
     ],
     "Alur status."
    ],
    [
     "h",
     "Setelah Closure"
    ],
    [
     "list",
     [
      "Interest accrual berhenti; EMI &amp; overdue processing berhenti.",
      "Arrangement ditandai Closed; history lengkap tetap untuk enquiry/audit.",
      "Limit &amp; collateral terkait dilepaskan (jika dikonfigurasi)."
     ]
    ],
    [
     "iq",
     [
      [
       "Bedanya Partial vs Full Prepayment?",
       "Partial: sebagian dibayar, pinjaman tetap aktif. Full: seluruh dibayar, pinjaman closed setelah payoff."
      ],
      [
       "Apa itu Payoff?",
       "Jumlah settlement akhir untuk menutup pinjaman: outstanding principal, accrued interest, penalty, charges, pajak."
      ],
      [
       "Apa itu Foreclosure?",
       "Penutupan pinjaman sebelum maturity setelah customer membayar payoff penuh."
      ],
      [
       "Aplikasi payoff?",
       "AA.ARRANGEMENT.ACTIVITY."
      ],
      [
       "Apa terjadi setelah closure?",
       "Accrual &amp; EMI berhenti, status Closed, history tetap, limit/collateral bisa dilepas."
      ]
     ]
    ]
   ]
  },
  "m11": {
   "t": "Accounting (GL, STMT.ENTRY, CATEG.ENTRY)",
   "sec": "Lanjutan",
   "body": [
    [
     "h",
     "Mengapa Penting?"
    ],
    [
     "p",
     "Pertanyaan interview tersering: \"accounting apa yang terjadi saat pinjaman dibooking, disbursed, dibayar, atau ditutup?\" Setiap activity pinjaman otomatis menghasilkan accounting entries."
    ],
    [
     "h",
     "Double Entry &amp; GL"
    ],
    [
     "p",
     "Setiap transaksi memiliki Debit &amp; Credit dengan <b>Total Debit = Total Credit</b>. Contoh disbursement ₹50.00.000: Debit Loan Asset, Credit Customer Account. <b>General Ledger (GL)</b> = buku induk seluruh transaksi akuntansi."
    ],
    [
     "tbl",
     [
      [
       "GL",
       "Fungsi"
      ],
      [
       "Loan Asset GL",
       "Outstanding pinjaman"
      ],
      [
       "Interest Income GL",
       "Bunga yang diperoleh"
      ],
      [
       "Interest Receivable GL",
       "Accrued interest"
      ],
      [
       "Charges Income GL",
       "Processing fee"
      ],
      [
       "Cash GL",
       "Saldo kas"
      ]
     ]
    ],
    [
     "tbl",
     [
      [
       "Customer Account",
       "GL Account"
      ],
      [
       "Milik customer",
       "Milik bank"
      ],
      [
       "Menyimpan saldo customer",
       "Menyimpan saldo akuntansi"
      ],
      [
       "Contoh: Savings Account",
       "Contoh: Loan Asset GL"
      ]
     ]
    ],
    [
     "h",
     "STMT.ENTRY vs CATEG.ENTRY"
    ],
    [
     "tbl",
     [
      [
       "STMT.ENTRY",
       "CATEG.ENTRY"
      ],
      [
       "Entry akun customer",
       "Entry GL (Category Ledger)"
      ],
      [
       "Rekening koran customer",
       "Akuntansi bank"
      ],
      [
       "Tampilan customer",
       "Tampilan finansial / laporan"
      ],
      [
       "Operasional",
       "Trial balance, P&L, Balance Sheet"
      ]
     ],
     "STMT.ENTRY memuat amount, date, currency, account, balance, reference, narrative."
    ],
    [
     "h",
     "Accounting per Tahap Lifecycle"
    ],
    [
     "tbl",
     [
      [
       "Tahap",
       "Accounting"
      ],
      [
       "Booking",
       "Tanpa pergerakan dana — biasanya tanpa entry; hanya arrangement/schedule dibuat"
      ],
      [
       "Disbursement",
       "Dr Loan Asset GL / Cr Customer Account"
      ],
      [
       "Interest Accrual (harian)",
       "Dr Interest Receivable / Cr Interest Income"
      ],
      [
       "EMI",
       "Dr Customer A/C / Cr Interest Receivable + Cr Loan Principal + Cr Charges Income"
      ],
      [
       "Penalty",
       "Dr Customer A/C / Cr Penalty Income"
      ],
      [
       "Payoff",
       "Dr Customer A/C / Cr Loan Principal + Interest Receivable + Charges + GST + Penalty"
      ]
     ]
    ],
    [
     "flow",
     [
      "Business Activity",
      "Arrangement Activity",
      "Accounting Event",
      "Generate STMT.ENTRY",
      "Generate CATEG.ENTRY",
      "Update General Ledger",
      "Laporan keuangan terupdate"
     ]
    ],
    [
     "iq",
     [
      [
       "Apa itu STMT.ENTRY?",
       "Menyimpan transaksi akun customer (debit/kredit) — dasar rekening koran."
      ],
      [
       "Apa itu CATEG.ENTRY?",
       "Entry GL untuk pelaporan finansial, trial balance, P&L."
      ],
      [
       "Bedanya?",
       "STMT.ENTRY: entry customer/statement. CATEG.ENTRY: entry GL/akuntansi."
      ],
      [
       "Accounting saat disbursement?",
       "Loan Asset GL di-debit, akun settlement customer di-credit."
      ],
      [
       "Mengapa double entry penting?",
       "Memastikan setiap transaksi balance (debit = kredit) sehingga integritas catatan finansial terjaga."
      ]
     ]
    ]
   ]
  },
  "m13": {
   "t": "Limits & Collateral",
   "sec": "Lanjutan",
   "body": [
    [
     "h",
     "Mengapa Penting?"
    ],
    [
     "p",
     "Validasi pertama sebelum disbursement: apakah limit kredit customer cukup dan collateral yang disyaratkan sudah disediakan? Gagal salah satu → pinjaman tidak bisa lanjut."
    ],
    [
     "h",
     "Credit Limit"
    ],
    [
     "p",
     "<b>Credit Limit</b> = jumlah maksimum yang bank bersedia pinjamkan ke customer. Tujuan: kontrol risiko kredit, cegah over-lending, pantau exposure, patuh regulasi."
    ],
    [
     "h",
     "Limit Hierarchy"
    ],
    [
     "flow",
     [
      "Corporate Limit",
      "Customer Limit",
      "Facility Limit",
      "Loan Arrangement"
     ]
    ],
    [
     "tbl",
     [
      [
       "Level",
       "Limit"
      ],
      [
       "Corporate",
       "₹10 Crore"
      ],
      [
       "Customer",
       "₹2 Crore"
      ],
      [
       "Home Loan Facility",
       "₹1 Crore"
      ],
      [
       "Loan Booked",
       "₹50 Lakh"
      ]
     ]
    ],
    [
     "h",
     "Available vs Utilized"
    ],
    [
     "tbl",
     [
      [
       "Item",
       "Amount"
      ],
      [
       "Approved",
       "₹1.00.00.000"
      ],
      [
       "Utilized (sudah dipakai)",
       "₹40.00.000"
      ],
      [
       "Available",
       "₹60.00.000"
      ]
     ],
     "Booking pinjaman lain ₹20L → utilized ₹60L, available ₹40L — Temenos update otomatis. Validasi saat booking: limit aktif, disetujui, belum expired, amount dalam available, currency valid, produk ter-link."
    ],
    [
     "h",
     "Collateral &amp; LTV"
    ],
    [
     "p",
     "<b>Collateral</b> = aset yang dijaminkan customer: properti, cash/FD, emas, kendaraan, sekuritas, bank guarantee. Jika default, bank bisa memulihkan sesuai prosedur hukum."
    ],
    [
     "box",
     "LTV = Loan Amount ÷ Collateral Value × 100<br>Contoh: ₹50L ÷ ₹75L = 66,67% (batas bank mis. 80% → diterima)."
    ],
    [
     "p",
     "Satu collateral bisa menopang beberapa pinjaman sesuai kebijakan: properti ₹1Cr → Loan A ₹40L + Loan B ₹20L = alokasi ₹60L, sisa nilai jaminan ₹40L."
    ],
    [
     "flow",
     [
      "Customer apply",
      "Cek credit limit",
      "Validasi available limit",
      "Verifikasi collateral",
      "Valuasi properti",
      "Hitung LTV",
      "Approve",
      "Book arrangement",
      "Update limit"
     ]
    ],
    [
     "p",
     "Saat pinjaman lunas: limit utilized dilepas (available dipulihkan), collateral dilepas, exposure customer diupdate. Aplikasi: LIMIT, AA.ARRANGEMENT, AA.ARRANGEMENT.ACTIVITY, COLLATERAL (implementasi bank-specific)."
    ],
    [
     "iq",
     [
      [
       "Apa itu Credit Limit?",
       "Maksimum amount yang bank otorisasi untuk dipinjamkan; divalidasi sebelum booking/disbursement."
      ],
      [
       "Approved vs Available limit?",
       "Approved: total disanksi. Available: sisa yang masih bisa dipinjam."
      ],
      [
       "Apa itu Collateral?",
       "Aset yang dijaminkan sebagai security pinjaman — mengurangi risiko kredit bank."
      ],
      [
       "Apa itu LTV?",
       "Rasio loan amount terhadap nilai collateral — untuk menilai risiko lending."
      ],
      [
       "Setelah closure?",
       "Utilized limit dilepas, available diupdate, collateral bisa dilepas sesuai kebijakan bank."
      ]
     ]
    ]
   ]
  },
  "m14": {
   "t": "Konfigurasi Produk Lanjutan",
   "sec": "Lanjutan",
   "body": [
    [
     "h",
     "Skenario"
    ],
    [
     "p",
     "ABC Bank ingin meluncurkan \"Home Loan – Salaried Customers\": bunga 8,25%, tenure 20 tahun, fee 1%, EMI bulanan, partial prepayment diizinkan, maksimum ₹1 Crore — semuanya via konfigurasi AA tanpa coding."
    ],
    [
     "flow",
     [
      "Product Line",
      "Product Group",
      "Product",
      "Property Classes",
      "Properties",
      "Product Conditions",
      "Proof",
      "Publish",
      "Product Catalog",
      "Arrangement"
     ]
    ],
    [
     "h",
     "Negotiation vs Non-Negotiation"
    ],
    [
     "tbl",
     [
      [
       "Negotiation",
       "Non-Negotiation"
      ],
      [
       "User boleh mengubah",
       "User tidak boleh mengubah"
      ],
      [
       "Fleksibel",
       "Tetap"
      ],
      [
       "Perlu approval bisnis",
       "Dikontrol produk"
      ]
     ],
     "Contoh negotiable: rate 8,25% bisa dinegosiasikan ke 8,00%. Contoh non-negotiable: minimum interest Education Loan 7% — tidak bisa diubah user."
    ],
    [
     "h",
     "Tracking vs Non-Tracking"
    ],
    [
     "tbl",
     [
      [
       "Tracking",
       "Non-Tracking"
      ],
      [
       "History dipelihara",
       "Hanya nilai terakhir"
      ],
      [
       "Ramah audit &amp; regulasi",
       "Hemat storage"
      ],
      [
       "Contoh: interest 8,25% → 8,10%, keduanya tersimpan",
       "Contoh: email customer (nilai lama tidak disimpan)"
      ]
     ]
    ],
    [
     "h",
     "ARR.LINK (relasi antar property)"
    ],
    [
     "p",
     "ARR.LINK membuat dependensi antar property: jika <b>Interest</b> berubah → schedule <b>Repayment</b> otomatis dihitung ulang; jika <b>Loan Amount</b> berubah → <b>Processing Fee</b> dihitung ulang otomatis."
    ],
    [
     "h",
     "Product Inheritance"
    ],
    [
     "p",
     "Produk baru bisa mewarisi konfigurasi produk lain: Premium Home Loan mewarisi interest rules, charges, accounting, repayment dari Home Loan; hanya mengubah maksimum loan &amp; processing fee. Manfaat: konfigurasi lebih sedikit, pembuatan produk lebih cepat, perawatan mudah."
    ],
    [
     "h",
     "Proof &amp; Publish (lanjutan)"
    ],
    [
     "list",
     [
      "Proof mengecek: mandatory property class ter-attach, condition terkonfigurasi, validation rules, dependency ter-resolve, konsistensi produk. Gagal → tidak bisa publish.",
      "Publish → produk muncul di Product Catalog, arrangement bisa dibuat, user bisa memilih produk untuk pinjaman baru."
     ]
    ],
    [
     "tbl",
     [
      [
       "Aplikasi",
       "Fungsi"
      ],
      [
       "AA.PRODUCT.LINE",
       "Buat Product Line"
      ],
      [
       "AA.PRODUCT.GROUP",
       "Buat Product Group"
      ],
      [
       "AA.PRODUCT.DESIGNER",
       "Desain produk"
      ],
      [
       "AA.PROPERTY.CLASS",
       "Definisikan Property Class"
      ],
      [
       "AA.PROPERTY",
       "Konfigurasi property"
      ],
      [
       "AA.PRODUCT.CATALOG",
       "Produk ter-publish"
      ],
      [
       "AA.ARRANGEMENT",
       "Buat arrangement customer"
      ]
     ]
    ],
    [
     "iq",
     [
      [
       "Bedanya Product Line / Group / Product?",
       "Line: kategori bisnis tertinggi. Group: kelompok produk sejenis. Product: produk aktual yang dipakai customer."
      ],
      [
       "Apa itu Property Class (ringkas)?",
       "Pengelompokan logis property terkait: Interest, Repayment, Charges, Settlement."
      ],
      [
       "Apa tujuan ARR.LINK?",
       "Membuat dependensi antar property sehingga perubahan satu property otomatis menghitung ulang property terkait."
      ],
      [
       "Apa itu Product Inheritance?",
       "Produk baru menggunakan konfigurasi produk yang ada, meng-override hanya perbedaan yang perlu."
      ],
      [
       "Proof vs Publish?",
       "Proof: validasi internal. Publish: ketersediaan bisnis."
      ]
     ]
    ]
   ]
  },
  "m15": {
   "t": "End-to-End Functional Testing",
   "sec": "Lanjutan",
   "body": [
    [
     "h",
     "Peran Functional Consultant / QA"
    ],
    [
     "p",
     "Tanggung jawab bukan sekadar membuat produk/membooking pinjaman — memastikan seluruh lifecycle benar: business requirement (BRD/FRD), konfigurasi produk, pemrosesan pinjaman, accounting, database, integrasi eksternal."
    ],
    [
     "flow",
     [
      "BRD",
      "FRD",
      "Test Scenario",
      "Test Case",
      "Eksekusi",
      "Defect Logging",
      "Retesting",
      "Regression",
      "UAT"
     ]
    ],
    [
     "h",
     "End-to-End Loan Test Flow"
    ],
    [
     "flow",
     [
      "Create Customer",
      "Create Account",
      "Verify Limit",
      "Verify Collateral",
      "Loan Booking",
      "Authorization",
      "Disbursement",
      "Interest Accrual",
      "EMI Payment",
      "Overdue",
      "Reschedule",
      "Payoff",
      "Loan Closure"
     ]
    ],
    [
     "h",
     "Checklist per Fase"
    ],
    [
     "list",
     [
      "<b>Produk</b>: line/group/product dibuat; property class wajib &amp; condition terkonfigurasi; proof sukses; published; muncul di Catalog.",
      "<b>Booking</b>: customer ada &amp; aktif; produk tersedia; currency/amount/interest tervalidasi; EMI &amp; schedule tergenerate; arrangement dibuat &amp; authorized.",
      "<b>Disbursement</b>: arrangement aktif; activity terproses; akun customer terkredit; Loan Asset GL terupdate; STMT.ENTRY &amp; CATEG.ENTRY tercipta; outstanding terupdate.",
      "<b>Accrual</b>: jalankan COB — bunga harian terhitung; Interest Receivable &amp; Income GL terupdate; tanpa duplikat; balance.",
      "<b>EMI</b>: due tergenerate; EMI terpotong; principal turun; interest &amp; charges teralokasi; next due date benar.",
      "<b>Overdue</b>: jangan bayar → COB → overdue tercipta, DPD terupdate, penalty terpasang, collection status update.",
      "<b>Reschedule</b>: EMI dihitung ulang; tenure update; schedule baru; arrangement tetap aktif; history tercatat.",
      "<b>Payoff</b>: outstanding/interest/charges terhitung; payoff final; loan closed; accrual berhenti; collateral &amp; limit dilepas."
     ]
    ],
    [
     "h",
     "Validasi Database (SQL)"
    ],
    [
     "box",
     "SELECT * FROM CUSTOMER WHERE CUSTOMER.NO='100001';<br>SELECT * FROM AA_ARRANGEMENT WHERE ARRANGEMENT_ID='LN000001';<br>SELECT * FROM STMT_ENTRY WHERE ACCOUNT='123456789';<br>SELECT * FROM CATEG_ENTRY WHERE CATEGORY='LOAN';",
     "Nama tabel bisa berbeda per versi/database/implementasi bank."
    ],
    [
     "h",
     "COB Checklist &amp; Validasi Accounting"
    ],
    [
     "list",
     [
      "Setelah COB: interest accrued, EMI digenerate, penalty, DPD, charges terposting, laporan tergenerate.",
      "STMT.ENTRY: amount, currency, account, debit/kredit, value date, booking date, reference, narrative.",
      "CATEG.ENTRY: GL category, debit/kredit, accounting date, currency, amount, transaction reference."
     ]
    ],
    [
     "h",
     "Integrasi &amp; Defect"
    ],
    [
     "tbl",
     [
      [
       "Sistem",
       "Fungsi"
      ],
      [
       "LOS",
       "Loan origination"
      ],
      [
       "CRM",
       "Data customer"
      ],
      [
       "AML",
       "Compliance"
      ],
      [
       "Payment Hub",
       "Pembayaran"
      ],
      [
       "SWIFT",
       "Transfer internasional"
      ],
      [
       "GL",
       "Akuntansi"
      ],
      [
       "Reporting",
       "MIS &amp; regulasi"
      ]
     ],
     "Defect lifecycle: requirement → testing → defect ditemukan → log → fix developer → retest → regression → closed. Contoh defect kritis: EMI salah, wrong accrual, STMT.ENTRY hilang, payoff salah, duplicate accounting entry."
    ],
    [
     "iq",
     [
      [
       "Apa yang divalidasi setelah disbursement?",
       "Akun customer terkredit, loan asset terupdate, STMT.ENTRY &amp; CATEG.ENTRY terbentuk, outstanding terupdate."
      ],
      [
       "Apa itu SIT?",
       "System Integration Testing — memverifikasi Temenos bekerja benar dengan LOS, payment, accounting, CRM, reporting."
      ],
      [
       "Apa itu UAT?",
       "User Acceptance Testing oleh business user memastikan solusi memenuhi requirement sebelum produksi."
      ],
      [
       "Cara memvalidasi accounting?",
       "Verifikasi STMT.ENTRY, CATEG.ENTRY, debit = kredit, GL posting, referensi accounting."
      ],
      [
       "Skenario test pinjaman terpenting?",
       "Booking, disbursement, accrual, EMI, overdue, rescheduling, payoff, closure, validasi accounting, limit &amp; collateral."
      ]
     ]
    ]
   ]
  }
 },
 "IVQ": [
  [
   "Pengenalan (HR/Proyek)",
   [
    [
     "Apa itu Core Banking?",
     "Sistem perangkat lunak yang menyediakan layanan bank lintas cabang dari database terpusat tunggal."
    ],
    [
     "Apa itu Temenos Transact (T24)?",
     "Core banking platform untuk customer, akun, pinjaman, deposito, pembayaran melalui sistem terpusat."
    ],
    [
     "Apa itu AA?",
     "Framework konfigurasi produk & lifecycle-nya tanpa perubahan kode aplikasi."
    ],
    [
     "Bedanya AA vs modul classic?",
     "Modul classic (LD/MG) logika per program; AA configuration-driven dengan komponen reusable (property class/property)."
    ],
    [
     "Apa itu settlement account?",
     "Akun customer tempat dana pinjaman dikredit / EMI di-debit."
    ],
    [
     "Apa itu maker-checker?",
     "Pembagian tugas: maker membuat record, checker mengauthorize — kontrol internal."
    ],
    [
     "Apa itu COB?",
     "Batch end-of-day: accrual, due generation, charges, GL posting, update status."
    ]
   ]
  ],
  [
   "AA &amp; Hierarki",
   [
    [
     "Jelaskan hierarki AA.",
     "Product Line → Product Group → Product → Property Class → Property → Product Condition → Arrangement."
    ],
    [
     "Apa itu Product Catalog?",
     "Katalog produk ter-publish yang jadi acuan membuat arrangement baru."
    ],
    [
     "Apa itu Product Designer?",
     "Layar pembuatan produk (AA.PRODUCT.DESIGNER) — tempat property &amp; condition ditempelkan."
    ],
    [
     "Apa itu Product Inheritance?",
     "Produk baru mewarisi konfigurasi parent, hanya meng-override perbedaan."
    ],
    [
     "Apa itu Product Versioning?",
     "Manajemen versi produk agar perubahan terkontrol dan ter-audit."
    ],
    [
     "Bagaimana produk baru dibuat?",
     "Buat line → group → product → attach property class/property → conditions → proof → publish."
    ],
    [
     "Apa itu mandatory Property Class?",
     "Property class yang wajib ada di product group &amp; product (mis. CUSTOMER, TERM.AMOUNT, INTEREST untuk lending); didefinisikan di product line. Bila hilang, proof gagal."
    ]
   ]
  ],
  [
   "Konfigurasi &amp; Booking",
   [
    [
     "Apa itu Negotiation?",
     "Izin mengubah nilai condition (rate/tenure) dalam batas saat pembuatan arrangement."
    ],
    [
     "Apa itu Tracking?",
     "Property menyimpan history nilai untuk audit/regulasi; non-tracking hanya nilai terakhir."
    ],
    [
     "Apa itu ARR.LINK?",
     "Relasi antar property — perubahan satu property otomatis menghitung ulang yang terkait (interest → schedule; amount → fee)."
    ],
    [
     "Apa itu Available/Effective/Expiry date?",
     "Available: mulai berlaku. Effective: kapan arrangement memproses. Expiry: berhenti untuk arrangement baru; existing tetap jalan."
    ],
    [
     "Apa itu Arrangement ID?",
     "Id unik arrangement (mis. LD22000145) yang dibuat saat authorization."
    ],
    [
     "Apa itu Future/Back-dated arrangement?",
     "Future-dated: efektif setelah hari ini — tanpa accounting sampai effective. Back-dated: efektif di masa lalu — bunga/accrual dihitung mundur sesuai aturan."
    ],
    [
     "Apa yang terjadi setelah authorization?",
     "Product condition disalin jadi arrangement condition, ID dibuat, schedule &amp; accounting reference tergenerate."
    ]
   ]
  ],
  [
   "Disbursement – Repayment",
   [
    [
     "Kapan limit &amp; collateral dicek?",
     "Sebelum approval/booking dan sebelum disbursement."
    ],
    [
     "Apa itu Full/Partial/Multiple disbursement?",
     "Full sekaligus; partial sebagian; multiple bertahap per stage (konstruksi)."
    ],
    [
     "Kapan interest start?",
     "Pada amount yang disbursed sejak effective disbursement date."
    ],
    [
     "Apa itu payment allocation?",
     "Urutan pembagian pembayaran: charges → penalty → interest → principal (dikonfigurasi per produk)."
    ],
    [
     "Apa itu advance payment?",
     "Pembayaran lebih besar dari due — disesuaikan ke cicilan mendatang, potong principal, atau ditahan sesuai aturan produk."
    ],
    [
     "Apa yang terjadi bila EMI bolos?",
     "Status overdue, DPD dihitung COB, penalty &amp; late charge, proses collection."
    ]
   ]
  ],
  [
   "Overdue – Closure",
   [
    [
     "Apa itu DPD dan cara hitungnya?",
     "Hari sejak due date tanpa pembayaran; diupdate harian oleh COB."
    ],
    [
     "Apa itu moratorium?",
     "Payment holiday sementara — interest bisa tetap accrue, capitalize, atau deferred."
    ],
    [
     "Apa itu top-up loan?",
     "Tambahan plafon pada arrangement eksisting; schedule dihitung ulang."
    ],
    [
     "Apa itu payoff &amp; komponennya?",
     "Settlement akhir: outstanding principal + accrued interest + penalty + pre-closure charge + pajak."
    ],
    [
     "Apa yang terjadi setelah closure?",
     "Accrual/EMI/overdue berhenti, status Closed, history tetap, limit &amp; collateral dilepas."
    ],
    [
     "Bedanya Rescheduling vs Restructuring?",
     "Rescheduling: ubah syarat repayment (operasional). Restructuring: perubahan menyeluruh untuk borrower bermasalah (konsesi, regulasi)."
    ]
   ]
  ],
  [
   "Accounting, Limit &amp; Testing",
   [
    [
     "Apa itu STMT.ENTRY vs CATEG.ENTRY?",
     "STMT: entry akun customer (statement). CATEG: entry GL (laporan finansial)."
    ],
    [
     "Accounting saat disbursement/accrual/EMI?",
     "Disburse: Dr Loan Asset / Cr Customer. Accrual: Dr Interest Receivable / Cr Interest Income. EMI: Dr Customer / Cr Interest + Principal + Charges."
    ],
    [
     "Apa itu LTV?",
     "Loan ÷ nilai collateral × 100 — ukuran risiko collateral."
    ],
    [
     "Available vs Utilized limit?",
     "Approved dikurangi yang terpakai = available; Temenos update otomatis tiap booking/penutupan."
    ],
    [
     "Apa itu SIT/UAT?",
     "SIT: integrasi antar sistem. UAT: penerimaan oleh business user sebelum produksi."
    ],
    [
     "Apa itu defect leakage/rejection/reopen?",
     "Leakage: bug lolos ke fase berikutnya/produksi. Rejection: defect ditolak (bukan bug). Reopen: fix gagal, dibuka kembali."
    ]
   ]
  ]
 ]
};
