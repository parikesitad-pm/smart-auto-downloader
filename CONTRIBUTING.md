# Panduan Kontribusi & Standarisasi Git

Dokumen ini berisi standar commit, proteksi repository, dan alur rilis otomatis untuk **Smart Auto Downloader**.

---

## 1. Standarisasi Pesan Commit (Conventional Commits Bahasa Indonesia)

Setiap commit wajib mengikuti format Conventional Commits dengan pesan deskripsi dalam **Bahasa Indonesia** yang jelas, baku, dan tanpa singkatan membingungkan:

```
<tipe>: <deskripsi perubahan dalam Bahasa Indonesia>
```

### Daftar Tipe Commit Resmi:

| Tipe            | Kegunaan                                                    | Contoh Pesan                                               |
| :-------------- | :---------------------------------------------------------- | :--------------------------------------------------------- |
| **`feat:`**     | Penambahan fitur baru atau kapabilitas aplikasi             | `feat: tambah pemilih resolusi video dan opsi audio mp3`   |
| **`fix:`**      | Perbaikan bug atau penanganan kesalahan                     | `fix: atasi kegagalan parsing link tiktok tanpa watermark` |
| **`docs:`**     | Perubahan pada dokumentasi, panduan, atau README            | `docs: perbarui panduan instalasi dan alur rilis windows`  |
| **`chore:`**    | Pemeliharaan dependensi, build tool, atau konfigurasi       | `chore: rapikan dependensi dan konfigurasi tauri`          |
| **`release:`**  | Rilis versi baru dan sinkronisasi tag/changelog             | `release: rilis versi v1.2.0 dan sinkronisasi changelog`   |
| **`style:`**    | Perubahan styling tampilan, padding, warna (non-fungsional) | `style: perbarui gradien tombol ala gemini pada header`    |
| **`refactor:`** | Restrukturisasi kode tanpa mengubah fungsionalitas luar     | `refactor: pisahkan atom dan molekul pada url input bar`   |

---

## 2. Proteksi Git Anti-Corrupt Index di Windows

Pada sistem operasi Windows, proses kompilasi Rust (`cargo`) dan bundler sering kali mengunci file biner (`.exe`, `.pdb`, folder `target/`).
Jika perintah `git add .` membaca file yang sedang di-lock oleh proses lain, Git Windows dapat menghasilkan error:

```
fatal: .git/index: index file smaller than expected
```

### Solusi & Proteksi:

1. Pastikan file `.gitignore` selalu menyaring:
   - `target/` dan `src-tauri/target/`
   - `*.exe`, `*.msi`, `*.dll`, `*.pdb`, `*.ilk`, `*.obj`, `*.wixobj`
   - `dist/` dan `node_modules/`
2. Jika suatu saat error terjadi karena crash mendadak, pulihkan index dengan:
   ```powershell
   Remove-Item .git/index -Force
   git reset
   ```

---

## 3. Otomatisasi Rilis Menggunakan Script Helper

Gunakan script helper yang sudah disediakan untuk menaikkan versi dan push otomatis:

```powershell
# Patch update (contoh: v1.2.0 -> v1.2.1)
npm run release:patch -- -Message "perbaiki deteksi clipboard otomatis"

# Minor update (contoh: v1.2.0 -> v1.3.0)
npm run release:minor -- -Message "tambah dukungan ekstraksi playlist youtube"

# Major update (contoh: v1.2.0 -> v2.0.0)
npm run release:major -- -Message "rombak total arsitektur ke v2"
```

Script ini akan secara otomatis:

1. Memperbarui versi di `package.json`, `src-tauri/Cargo.toml`, dan `src-tauri/tauri.conf.json`.
2. Menulis riwayat perubahan baru ke `src/data/changelog.json`.
3. Melakukan staging aman dan membuat commit berstandar `release: rilis versi vX.X.X - <pesan>`.
4. Membuat Git tag `vX.X.X`.
5. Mendorong branch dan tag ke GitHub (`git push origin main --tags`) sehingga memicu GitHub Actions.
