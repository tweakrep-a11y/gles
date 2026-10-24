# Rencana Implementasi: Redesign Total UI/UX Manga Detail V3 & Anime Detail V1

Berdasarkan preferensi pengguna:
1. **Gaya Visual:** *Compact floating header* dengan fokus langsung ke sinopsis dan aksi cepat.
2. **Navigasi Konten:** *Tab bar interaktif* dengan filter pencarian instan, urutan (Asc/Desc), dan seleksi cepat.
3. **Penyampaian:** *Interactive live preview* di Web App (`/app/page.tsx`) dan update kode Jetpack Compose (`MangaDetailV3Fragment.kt` & `AnimeDetailV1Fragment.kt`).

---

## 1. Konsep & Perubahan Desain Manga Detail V3

### Masalah Desain Sebelumnya
- Header terlalu memakan ruang layar vertikal dengan elemen bertumpuk kaku.
- Daftar chapter panjang tanpa fitur pencarian nomor chapter yang instan atau pengelompokan yang nyaman.
- Kurang visual hierarchy pada rating, status rilis, dan genre tags.

### Desain Baru (Total Overhaul)
- **Compact Floating Hero Header**:
  - Cover manga ditampilkan proporsional dengan ambient blur glow halus di latar belakang.
  - Badge metadata dinamis: Skor/Rating bintang, Status (Ongoing/Completed), Type (Manga/Manhwa/Manhua), Total Chapter.
  - Quick Action Buttons: Tombol utama "Mulai Baca Ch. 1" atau "Lanjutkan Ch. X", tombol Favorite/Bookmark instan, dan Share.
  - Sinopsis ringkas yang dapat diperluas (*tap to expand/collapse*) dengan transisi halus.
- **Interactive Multi-Tab Navigator**:
  - **Tab Chapter**:
    - Search bar instan untuk menemukan nomor chapter langsung (misal: "105").
    - Toggle urutan Chapter (Terbaru ➔ Terlama atau Terlama ➔ Terbaru).
    - Mode tampilan Chapter: List View rapi dengan tanggal update dan status sudah dibaca, atau Grid View compact.
    - Tombol aksi batch: "Tandai sudah dibaca", filter riwayat.
  - **Tab Info & Statistik**:
    - Kartu statistik komprehensif: Pengarang/Author, Artis, Serialisasi, Sumber Komik aktif, Estimasi waktu baca.
    - Chips Genre interaktif yang dapat di-klik untuk filter.
  - **Tab Terkait / Rekomendasi**:
    - Rekomendasi manga serupa dengan cover horizontal scroll card.

---

## 2. Konsep & Perubahan Desain Anime Detail V1

### Masalah Desain Sebelumnya
- Tampilan detail kurang sinematik dan tidak intuitif untuk pemilihan episode banyak.
- Server/kualitas video dan info episode terasa terpisah tanpa visual player preview.

### Desain Baru (Total Overhaul)
- **Compact Floating Hero Header**:
  - Banner 16:9 atau poster mini ber-ambient backdrop dengan badge HD/FHD, Rating Usia, Musim/Tahun (e.g., Spring 2024), Studio.
  - Tombol CTA Utama yang menonjol: "Tonton Sekarang (Ep. 1)" dengan progress bar jika ada riwayat tonton terakhir.
  - Quick Action Bar: Simpan ke Daftar Tonton (Watchlist), Trailer Modal/Preview, Bagikan.
  - Sinopsis informatif yang dapat diperluas secara mulus tanpa menutupi navigasi.
- **Interactive Multi-Tab Navigator**:
  - **Tab Episode**:
    - Filter rentang episode (misal: "1 - 25", "26 - 50", "51 - 75") untuk anime ber-episode panjang.
    - Search bar nomor episode.
    - Urutan episode (Episode 1 pertama atau Episode terbaru pertama).
    - Kartu episode modern: Thumbnail preview dengan indikator durasi, judul episode, tanggal rilis, dan progress bar tonton.
  - **Tab Server & Kualitas**:
    - Pemilih resolusi (360p, 480p, 720p, 1080p) dan switch server streaming cepat.
  - **Tab Detail & Musim**:
    - Info Studio, Produser, Status Tayang, Jadwal Tayang mingguan (Broadcast day), Sinopsis lengkap, Karakter/Voice Actors.

---

## 3. Implementasi Preview Interaktif di Web App (`/app/page.tsx`)

- Menambahkan mode tampilan **Detail Preview Modal / Full-Screen Page**:
  - Tombol pada setiap kartu manga/anime di halaman utama untuk membuka langsung ke "Manga Detail V3 Preview" atau "Anime Detail V1 Preview".
  - Bar switcher di header preview untuk beralih antara tampilan Home, Manga Detail V3, dan Anime Detail V1.
  - Kontrol interaktif penuh: coba ketik nomor chapter di search bar, klik tombol urutkan, klik switch tab, coba tombol bookmark/favorite, dan navigasi episode.

---

## 4. Sinkronisasi Kode Jetpack Compose Android

- Memperbarui `MangaDetailV3Fragment.kt` dan `AnimeDetailV1Fragment.kt` agar struktur layout Compose-nya mengimplementasikan arsitektur baru:
  - Header compact dengan `Box` & `Surface` styling modern, shadow ambient, dan Material 3 components.
  - `TabRow` interaktif untuk navigasi Chapters/Episodes, Info/Stats, dan Related.
  - State management untuk pencarian chapter/episode dan sorting ascending/descending.

---

## 5. Verifikasi & Pengujian
- Menjalankan `compile_applet` untuk memastikan TypeScript dan build dev server Next.js 100% bersih tanpa error.
- Memverifikasi tampilan responsif (mobile viewport & desktop) serta kelancaran interaksi tab dan pencarian.
