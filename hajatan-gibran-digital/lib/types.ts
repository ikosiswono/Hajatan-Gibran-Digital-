export type ApiResponse<T = unknown> = {
  ok: boolean;
  message?: string;
  data?: T;
  error?: string;
};

export type DashboardData = {
  totalTamu: number;
  telitianAnak: number;
  telitianDewasa: number;
  totalTelitian: number;
  jumlahDokumentasi: number;
  dokumentasiMenunggu: number;
  jumlahPanitia: number;
  aktivitasTerbaru: Record<string, string | number>[];
};

export type TelitianRow = {
  ID: string;
  No: number;
  Waktu: string;
  Tanggal: string;
  Jam: string;
  Nama: string;
  Alamat: string;
  Nominal: number;
  Petugas: string;
  Catatan: string;
};

export type DokumentasiRow = {
  ID_DOK: string;
  Tanggal: string;
  Jam: string;
  Nama_Pengirim: string;
  Kategori: string;
  Judul: string;
  Keterangan: string;
  Nama_File: string;
  Drive_File_ID: string;
  Drive_URL: string;
  Thumbnail_URL: string;
  Ukuran_File: number;
  Status: string;
  Petugas_Validasi: string;
  Waktu_Upload: string;
};
