<div align="center">
  <br />
  <h1><b>KasirPintar 🛒</b></h1>
  <p>
    Modern, Cepat, dan Intuitif. Solusi Point of Sale (POS) berbasis web yang dirancang untuk merevolusi cara Anda mengelola bisnis.
  </p>
  <br />
</div>

## ✨ Tentang Proyek

**KasirPintar** adalah aplikasi kasir (Point of Sale) lengkap yang dibangun dengan tumpukan teknologi modern. Aplikasi ini tidak hanya berfungsi untuk mencatat transaksi penjualan, tetapi juga sebagai sistem manajemen inventaris, pelanggan, dan laporan yang terintegrasi. Dengan antarmuka yang bersih dan responsif, KasirPintar memberikan pengalaman pengguna yang luar biasa baik untuk kasir maupun admin.

Proyek ini dibuat sebagai implementasi dari konsep-konsep terbaru dalam pengembangan web, termasuk *server-side rendering*, *server actions*, dan arsitektur berbasis komponen dengan Next.js dan Shadcn/UI.

<br/>

<div align="center">
  <img src="./videokasirpintar-ezgif.com-video-to-gif-converter.gif" alt="Screenshot KasirPintar" style="border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
  <p><small><i>Gambar tampilan dashboard</i></small></p>
</div>

<br/>

## 🚀 Fitur Utama

Aplikasi ini dilengkapi dengan berbagai fitur canggih untuk membantu operasional bisnis Anda:

* **🛒 Point of Sale (POS)**: Antarmuka kasir yang cepat dan mudah digunakan, dilengkapi dengan pencarian produk, pemindai barcode/QR code, dan penerapan diskon otomatis.
* **📦 Manajemen Produk**: Tambah, edit, hapus, dan kelola semua produk Anda dengan mudah. Termasuk informasi SKU, harga beli, harga jual, dan kategori.
* **📊 Manajemen Stok**: Fitur *Stok Opname* untuk penyesuaian stok fisik dan sistem, serta pelacakan pergerakan stok dari pembelian hingga penjualan.
* **🚚 Manajemen Supplier & Pembelian**: Catat data supplier dan kelola seluruh siklus pembelian, mulai dari *Purchase Order* (PO) hingga penerimaan barang (*Goods Receipt*).
* **🏷️ Manajemen Kategori & Promosi**: Kelompokkan produk berdasarkan kategori dan buat promosi berbasis persentase diskon dengan periode waktu tertentu.
* **👥 Manajemen Pengguna**: Sistem otentikasi dengan role (ADMIN, CASHIER) untuk membatasi akses ke fitur-fitur tertentu.
* **📈 Laporan Komprehensif**:
    * Laporan Penjualan harian, bulanan, atau rentang waktu kustom.
    * Laporan Laba Rugi untuk menganalisis keuntungan per produk.
    * Laporan Produk Terlaris.
* **⬇️ Ekspor Data**: Ekspor laporan penjualan dan laba rugi ke format Excel (XLSX) untuk analisis lebih lanjut.
* **📱 Responsif & Modern**: Dibangun dengan TailwindCSS dan Shadcn/UI untuk tampilan yang estetik dan dapat diakses di berbagai perangkat.
* **🌓 Tema Terang & Gelap**: Sesuaikan tampilan sesuai preferensi Anda.

## 🛠️ Tumpukan Teknologi

Project ini dibangun menggunakan teknologi-teknologi berikut:

* **Framework**: [Next.js](https://nextjs.org/) (App Router)
* **Bahasa**: [TypeScript](https://www.typescriptlang.org/)
* **ORM**: [Prisma](https://www.prisma.io/)
* **Database**: PostgreSQL
* **UI**: [Tailwind CSS](https://tailwindcss.com/) & [Shadcn/UI](https://ui.shadcn.com/)
* **Autentikasi**: [NextAuth.js](https://next-auth.js.org/)
* **Validasi Form**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)
* **Notifikasi**: [Sonner](https://sonner.emilkowal.ski/)
* **Deployment**: [Vercel](https://vercel.com)

## ⚙️ Memulai

Ikuti langkah-langkah berikut untuk menjalankan proyek ini secara lokal:

1.  **Clone repositori:**
    ```bash
    git clone [https://github.com/iqbalhikam/project-uas-web.git](https://github.com/iqbalhikam/project-uas-web.git)
    cd project-uas-web
    ```

2.  **Instal dependensi:**
    ```bash
    npm install
    ```

3.  **Setup Database:**
    * Pastikan Anda memiliki PostgreSQL yang berjalan.
    * Salin file `.env.example` menjadi `.env`.
    * Sesuaikan `DATABASE_URL` di file `.env` dengan kredensial database Anda.
        ```env
        DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
        ```

4.  **Migrasi Database:**
    Jalankan perintah berikut untuk membuat tabel-tabel yang diperlukan di database Anda.
    ```bash
    npx prisma migrate dev --name init
    ```

5.  **Setup Variabel Lingkungan (Environment Variables):**
    Buka file `.env` dan tambahkan `NEXTAUTH_SECRET`. Anda bisa menghasilkan secret baru dengan perintah berikut di terminal:
    ```bash
    openssl rand -base64 32
    ```
    ```env
    # .env
    NEXTAUTH_SECRET="SECRET_YANG_ANDA_HASILKAN"
    ```

6.  **Jalankan server pengembangan:**
    ```bash
    npm run dev
    ```

7.  Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

    **Akun Default:**
    * Email: `admin@example.com`
    * Password: `admin123`
    > Anda dapat mengubah atau menambahkan pengguna baru melalui *seeding* database atau dari halaman manajemen pengguna setelah login sebagai admin.

## 🤝 Berkontribusi

Kontribusi membuat komunitas open source menjadi tempat yang luar biasa untuk belajar, menginspirasi, dan berkreasi. Setiap kontribusi yang Anda berikan sangat **dihargai**.

Jika Anda memiliki saran untuk membuat proyek ini lebih baik, silakan fork repositori dan buat *pull request*. Anda juga bisa membuka *issue* dengan tag "enhancement". Jangan lupa untuk memberikan bintang pada proyek ini! Terima kasih!

1.  Fork Proyek
2.  Buat Branch Fitur Anda (`git checkout -b fitur/FiturLuarBiasa`)
3.  Commit Perubahan Anda (`git commit -m 'Menambahkan FiturLuarBiasa'`)
4.  Push ke Branch (`git push origin fitur/FiturLuarBiasa`)
5.  Buka sebuah *Pull Request*
