# Dokumen Fix Scope: Driver & Conductor Dashboard

## Tujuan

Menyesuaikan tampilan dan penataan data pada halaman Driver Dashboard dan Conductor Dashboard agar tetap konsisten dengan proyek yang sedang berjalan saat ini, tanpa mengubah fundamental aplikasi seperti:

- type definitions
- service layer
- hooks
- state/data contracts
- struktur API yang sudah dipakai saat ini

Tujuan utama adalah: perubahan UI/data yang ditampilkan pada halaman dashboard harus mengikuti data dan arsitektur yang sudah benar di kode saat ini, bukan mengembalikan struktur lama atau mengganti fundamental aplikasi.

---

## Prinsip Utama

1. Gunakan kode yang sedang berjalan saat ini sebagai sumber kebenaran teknis.
2. Jaga struktur fundamental tetap sama.
3. Sesuaikan tampilan, label, urutan, layout, dan data yang ditampilkan agar cocok dengan data yang tersedia saat ini.
4. Jangan menambah perubahan besar di luar halaman Driver Dashboard dan Conductor Dashboard.
5. Jika ada mismatch data, maka fokusnya adalah menyesuaikan tampilan/data yang ditampilkan dengan format yang benar saat ini, bukan mengubah type, service, atau hook secara global.

---

## Scope yang Diizinkan

Yang boleh diubah hanya hal yang berkaitan langsung dengan halaman berikut:

- Driver dashboard
- Conductor dashboard
- komponen pendukung yang langsung dipakai oleh halaman tersebut
- local helper logic yang hanya dipakai oleh halaman tersebut

Contoh yang diperbolehkan:

- layout card
- urutan item
- kondisi rendering data
- label tampilan
- penyesuaian teks/format UI
- mapping data ke tampilan
- komponen kecil yang hanya dipakai di dashboard itu sendiri

---

## Yang Harus Dipertahankan

Hal-hal berikut TIDAK boleh berubah kecuali benar-benar diperlukan untuk menjaga halaman tetap jalan sesuai project saat ini:

- type definitions di folder `types/`
- service layer di folder `services/`
- hook logic di folder `hooks/`
- context/auth/state global
- struktur data API yang sudah dipakai
- konfigurasi global
- shared component di luar dashboard scope
- halaman lain di aplikasi

Catatan penting:

- Jika data yang datang dari API/service berbeda dengan kebutuhan UI, maka yang harus disesuaikan adalah cara menampilkan data di halaman dashboard.
- Bukan dengan mengganti type atau service global untuk seluruh aplikasi.

---

## Aturan Desain / Adaptasi

Saat menyesuaikan halaman driver/conductor dashboard:

- Gunakan pattern data yang sudah ada di project saat ini.
- Sesuaikan UI terhadap real data shape yang benar saat ini.
- Jangan mengembalikan logic lama yang sudah tidak relevan.
- Jangan mengubah kontrak API atau hook untuk semua bagian aplikasi hanya agar cocok dengan tampilan lama.
- Kalau perlu transformasi, lakukan di layer halaman lokal, bukan di global.

---

## Batasan Kerja yang Wajib Dipatuhi

1. Hanya perubahan pada halaman Driver Dashboard dan Conductor Dashboard.
2. Jangan mengubah halaman lain.
3. Jangan mengganti tipe global hanya untuk kebutuhan tampilan lokal.
4. Jangan mengubah service global hanya untuk halaman UI tertentu.
5. Jangan mengganti hook global kecuali memang benar-benar tidak bisa dihindari dalam dashboard yang bersangkutan.
6. Jangan mengubah struktur data aplikasi secara luas.
7. Jangan refactor besar-besaran.
8. Tetap minimal dan fokus pada permasalahan yang sedang ditangani.

---

## Workflow yang Disarankan

1. Ambil state project saat ini sebagai referensi teknis.
2. Identifikasi tampilan/penataan yang ingin dipertahankan dari lokal.
3. Cocokkan dengan data/type/service/hook yang sedang aktif di project saat ini.
4. Sesuaikan tampilan dashboard lokal ke struktur data yang benar saat ini.
5. Jangan ubah fundamental aplikasi.
6. Validasi halaman target berjalan dengan benar.
7. Pastikan tidak ada perubahan di luar driver/dashboard dan conductor/dashboard.

---

## Prompt Standar untuk AI

```text
Use the current project code as the source of truth for all technical implementation, but preserve the visual design and layout improvements that were previously made locally in the Driver dashboard and Conductor dashboard.

Goal:
- Keep the application fundamentals unchanged: types, services, hooks, data contracts, and current structure in this project must remain valid.
- Update only the Driver dashboard and Conductor dashboard UI/data presentation so they match the real current codebase.
- Ensure the dashboard pages reflect the actual data available today without changing app-wide architecture.

Strict scope:
- Only modify files related to the Driver dashboard and Conductor dashboard.
- Do not change unrelated routes, pages, services, hooks, types, shared components, or global logic unless absolutely required for the dashboard pages to work.
- Keep changes minimal and focused.
- Do not refactor unrelated code.

Rules:
- Preserve the current app foundation as-is.
- Adapt local UI/layout changes to the real current data model and service responses.
- Do not revert or overwrite working logic outside the target dashboard pages.
- Do not broaden the fix beyond Driver dashboard and Conductor dashboard.
- Do not modify types, services, or hooks globally just to match an older UI implementation.

Output:
- Briefly explain what visual/layout changes were preserved.
- Briefly explain what was adapted to the current project structure.
- Confirm that only Driver dashboard and Conductor dashboard files were changed.
```

---

## Catatan Penting

Dokumen ini dibuat agar AI berikutnya memahami bahwa yang dipindahkan adalah:

- perubahan tampilan
- penataan data yang ditampilkan
- adaptasi UI ke data yang benar saat ini

Bukan:

- perubahan fundamental project
- perubahan type global
- perubahan service global
- perubahan hooks/global state
- perubahan desain arsitektur aplikasi

Dengan kata lain, fokusnya adalah:

“UI/data dashboard yang cocok dengan struktur saat ini, tanpa merusak fondasi aplikasi.”
