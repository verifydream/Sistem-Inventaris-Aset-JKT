# Sistem Inventaris Aset JKT

Aplikasi web untuk mengelola inventaris aset perusahaan dengan fitur QR code, laporan, dan rekomendasi AI.

## Fitur

- Mode Guest dan Admin
- Sistem QR Code untuk setiap aset
- Tampilan UI responsive dan modern
- Manajemen aset (nama, pemilik, deskripsi, tanggal, kondisi, gambar)
- Riwayat perubahan kondisi aset
- Rekomendasi AI menggunakan Gemini API
- Export laporan ke PDF dan Excel

## Teknologi

- Frontend: React.js, Material-UI
- Backend: Node.js, Express
- Database: MongoDB
- AI: Google Gemini API

## Instalasi

```bash
# Install semua dependencies (backend dan frontend)
npm run install-all

# Jalankan aplikasi (development mode)
npm run dev-all
```

## Penggunaan

- Mode Guest: Akses default, hanya bisa melihat aset dan download laporan
- Mode Admin: Akses dengan password "admin123", memiliki akses penuh untuk mengelola aset