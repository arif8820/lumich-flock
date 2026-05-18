# UAT — Unified Input & Edit Produksi (v0.9.3)

Tanggal: 2026-05-18  
Feature branch: `worktree-unified-input`  
Tester: _______________

---

## Scope

- Unifikasi input baru dan edit menjadi satu entry point ("+  Input Harian")
- Auto-load data existing saat flock + tanggal dipilih
- Lock period: operator=H+1, supervisor=H+7, admin=unlimited
- Mode Koreksi admin: alasan wajib, disimpan sebagai audit trail
- Fix UX: klik number input → seleksi semua teks
- Hapus route `/produksi/[id]/edit`

---

## TC-01 — Input Baru (Flock + Tanggal Belum Ada Data)

**Prasyarat:** Login sebagai operator. Pilih flock yang belum punya data hari ini.

| # | Langkah | Ekspektasi | Hasil |
|---|---------|-----------|-------|
| 1 | Buka `/produksi`, klik **+ Input Harian** | Form Input Harian terbuka | ☐ Pass ☐ Fail |
| 2 | Pilih flock dari dropdown | Dropdown tampil nama flock + kandang | ☐ Pass ☐ Fail |
| 3 | Pilih tanggal hari ini | Semua field tetap kosong / default 0 | ☐ Pass ☐ Fail |
| 4 | Tidak ada loading spinner / shimmer | Form langsung siap diisi | ☐ Pass ☐ Fail |
| 5 | Isi Kematian=2, Afkir=1, lalu tab Telur → isi 1 entry | Nilai tersimpan di state | ☐ Pass ☐ Fail |
| 6 | Klik **Simpan** | Toast sukses, redirect ke daftar produksi | ☐ Pass ☐ Fail |
| 7 | Record baru muncul di daftar Produksi | Tanggal, flock, angka sesuai input | ☐ Pass ☐ Fail |

---

## TC-02 — Edit Data Existing (Auto-Load)

**Prasyarat:** Ada record produksi hari ini untuk flock X (dari TC-01 atau data seed).

| # | Langkah | Ekspektasi | Hasil |
|---|---------|-----------|-------|
| 1 | Buka `/produksi/input` | Form kosong | ☐ Pass ☐ Fail |
| 2 | Pilih flock X | Belum auto-load (tanggal belum dipilih) | ☐ Pass ☐ Fail |
| 3 | Pilih tanggal yang ada datanya | Spinner singkat muncul, lalu semua field ter-populate dengan data existing | ☐ Pass ☐ Fail |
| 4 | Verifikasi Kematian, Afkir, tab Telur/Pakan/Vaksin sesuai data yang sudah disimpan | Nilai sama persis | ☐ Pass ☐ Fail |
| 5 | Ubah Kematian +1, klik **Simpan** | Toast sukses | ☐ Pass ☐ Fail |
| 6 | Buka lagi form dengan flock + tanggal sama | Nilai Kematian terbaru muncul | ☐ Pass ☐ Fail |

---

## TC-03 — Auto-Load Race Condition (Ganti Flock Cepat)

| # | Langkah | Ekspektasi | Hasil |
|---|---------|-----------|-------|
| 1 | Pilih flock A + tanggal ada data | Data flock A mulai loading | ☐ Pass ☐ Fail |
| 2 | Sebelum loading selesai, ganti flock ke B | Loading flock A dibatalkan | ☐ Pass ☐ Fail |
| 3 | Tunggu loading selesai | Form menampilkan data flock B, bukan data stale flock A | ☐ Pass ☐ Fail |

---

## TC-04 — Lock Period Operator (H+1)

**Prasyarat:** Login sebagai operator.

| # | Langkah | Ekspektasi | Hasil |
|---|---------|-----------|-------|
| 1 | Pilih flock + tanggal hari ini (H+0) | Form aktif, submit enabled | ☐ Pass ☐ Fail |
| 2 | Pilih tanggal kemarin (H-1, masih dalam H+1 dari kemarin = hari ini) | Form aktif | ☐ Pass ☐ Fail |
| 3 | Pilih tanggal 3 hari lalu | Form disabled (semua field), submit disabled | ☐ Pass ☐ Fail |
| 4 | Pesan kunci terlihat jelas | Muncul keterangan "Periode edit telah berakhir" atau serupa | ☐ Pass ☐ Fail |
| 5 | Tidak bisa submit meskipun form diedit via dev tools | Server action menolak request | ☐ Pass ☐ Fail |

---

## TC-05 — Lock Period Supervisor (H+7)

**Prasyarat:** Login sebagai supervisor.

| # | Langkah | Ekspektasi | Hasil |
|---|---------|-----------|-------|
| 1 | Pilih tanggal H-6 (6 hari lalu) | Form aktif | ☐ Pass ☐ Fail |
| 2 | Pilih tanggal H-8 (8 hari lalu) | Form disabled, submit disabled | ☐ Pass ☐ Fail |
| 3 | Pesan kunci muncul | "Periode edit telah berakhir" | ☐ Pass ☐ Fail |

---

## TC-06 — Admin: Edit Tanggal Lama Tanpa Record (Buat Baru)

**Prasyarat:** Login sebagai admin. Pilih flock + tanggal 10 hari lalu yang belum ada data.

| # | Langkah | Ekspektasi | Hasil |
|---|---------|-----------|-------|
| 1 | Pilih flock + tanggal 10 hari lalu tanpa data | Form kosong, field aktif (admin tidak terkunci) | ☐ Pass ☐ Fail |
| 2 | **Field "Alasan Koreksi" TIDAK muncul** | Karena tidak ada record existing — tidak perlu audit | ☐ Pass ☐ Fail |
| 3 | Isi data, klik Simpan | Berhasil tanpa alasan koreksi | ☐ Pass ☐ Fail |

---

## TC-07 — Admin: Mode Koreksi (H+7 + Record Existing)

**Prasyarat:** Login sebagai admin. Ada record existing untuk tanggal > H+7.

| # | Langkah | Ekspektasi | Hasil |
|---|---------|-----------|-------|
| 1 | Pilih flock + tanggal > H+7 yang ada datanya | Data ter-load, muncul field "Alasan Koreksi" di bawah tabs | ☐ Pass ☐ Fail |
| 2 | Kosongkan field Alasan Koreksi, klik Simpan | Error: "Alasan minimal 10 karakter" | ☐ Pass ☐ Fail |
| 3 | Isi alasan < 10 karakter, klik Simpan | Error: validasi min 10 karakter | ☐ Pass ☐ Fail |
| 4 | Isi alasan ≥ 10 karakter, ubah nilai Kematian, klik Simpan | Toast sukses | ☐ Pass ☐ Fail |
| 5 | Cek tabel `correction_records` di DB atau halaman admin audit | Entry baru dengan alasan yang dimasukkan | ☐ Pass ☐ Fail |

---

## TC-08 — Tidak Ada Tombol Edit/Koreksi/Terkunci di Daftar Produksi

| # | Langkah | Ekspektasi | Hasil |
|---|---------|-----------|-------|
| 1 | Buka `/produksi` sebagai operator | Tidak ada tombol Edit, Koreksi, atau Terkunci pada setiap card/row | ☐ Pass ☐ Fail |
| 2 | Buka `/produksi` sebagai admin | Sama — tidak ada tombol per-row | ☐ Pass ☐ Fail |
| 3 | Lebar kolom tabel desktop | Kolom kanan (kosong sebelumnya) sudah tidak ada | ☐ Pass ☐ Fail |

---

## TC-09 — Route Edit Lama Dihapus (404)

| # | Langkah | Ekspektasi | Hasil |
|---|---------|-----------|-------|
| 1 | Navigasi manual ke `/produksi/some-uuid/edit` | Halaman 404 Next.js | ☐ Pass ☐ Fail |
| 2 | Tidak ada link/button di app yang menuju URL tersebut | Verifikasi dengan inspect element | ☐ Pass ☐ Fail |

---

## TC-10 — UX Fix: Number Input Select-All on Focus

**Berlaku untuk:** Stepper +/− (Kematian, Afkir, Telur Pecah, Telur Abnormal) dan field Pakan/Vaksin.

| # | Langkah | Ekspektasi | Hasil |
|---|---------|-----------|-------|
| 1 | Klik field stepper dengan nilai 5 | Seluruh teks "5" langsung terseleksi (highlight) | ☐ Pass ☐ Fail |
| 2 | Ketik "12" langsung setelah klik | Nilai berubah menjadi 12, bukan 512 | ☐ Pass ☐ Fail |
| 3 | Klik field Pakan (qty) dengan nilai 100 | "100" terseleksi | ☐ Pass ☐ Fail |
| 4 | Ketik "75" | Nilai menjadi 75 | ☐ Pass ☐ Fail |
| 5 | Klik field Vaksin dengan nilai 1 | "1" terseleksi | ☐ Pass ☐ Fail |
| 6 | Ketik "0" | Nilai menjadi 0 | ☐ Pass ☐ Fail |
| 7 | Uji di mobile (iOS Safari / Android Chrome) | Select-all tetap berfungsi | ☐ Pass ☐ Fail |

---

## TC-11 — Operator Coop Access Guard

**Prasyarat:** Login sebagai operator. Operator hanya ditugaskan ke Kandang A.

| # | Langkah | Ekspektasi | Hasil |
|---|---------|-----------|-------|
| 1 | Dropdown flock hanya menampilkan flock dari Kandang A | Flock Kandang B tidak muncul | ☐ Pass ☐ Fail |
| 2 | Request langsung ke server action dengan flockId dari Kandang B | Ditolak: "Akses ditolak" | ☐ Pass ☐ Fail |

---

## TC-12 — Changelog Versi

| # | Langkah | Ekspektasi | Hasil |
|---|---------|-----------|-------|
| 1 | Buka halaman Changelog di app | Versi terbaru menampilkan v0.9.3 | ☐ Pass ☐ Fail |
| 2 | Entry v0.9.3 berisi semua perubahan utama | Minimal 5 item perubahan terlihat | ☐ Pass ☐ Fail |

---

## Ringkasan Hasil

| Test Case | Judul | Status |
|-----------|-------|--------|
| TC-01 | Input Baru | ☐ Pass ☐ Fail |
| TC-02 | Edit via Auto-Load | ☐ Pass ☐ Fail |
| TC-03 | Race Condition | ☐ Pass ☐ Fail |
| TC-04 | Lock Operator | ☐ Pass ☐ Fail |
| TC-05 | Lock Supervisor | ☐ Pass ☐ Fail |
| TC-06 | Admin Buat Baru Tanggal Lama | ☐ Pass ☐ Fail |
| TC-07 | Admin Mode Koreksi | ☐ Pass ☐ Fail |
| TC-08 | Tidak Ada Edit Button | ☐ Pass ☐ Fail |
| TC-09 | Route Edit 404 | ☐ Pass ☐ Fail |
| TC-10 | Number Input Select-All | ☐ Pass ☐ Fail |
| TC-11 | Operator Access Guard | ☐ Pass ☐ Fail |
| TC-12 | Changelog | ☐ Pass ☐ Fail |

**Tester sign-off:** _______________ **Tanggal:** _______________
