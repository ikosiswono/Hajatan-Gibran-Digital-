/**
 * HAJATAN GIBRAN DIGITAL - SETUP
 * 1) Buat Spreadsheet kosong.
 * 2) Buat folder Google Drive kosong untuk root dokumentasi.
 * 3) Isi tiga nilai di bawah.
 * 4) Jalankan setupProject() satu kali dari Apps Script editor.
 */
const INITIAL_SETUP = {
  SPREADSHEET_ID: 'GANTI_DENGAN_SPREADSHEET_ID',
  ROOT_DRIVE_FOLDER_ID: 'GANTI_DENGAN_FOLDER_ID',
  APP_SECRET: 'GANTI_DENGAN_SECRET_RANDOM_YANG_PANJANG'
};

const SHEET_DEFINITIONS = {
  'Dashboard': ['Keterangan', 'Nilai'],
  'Tamu': ['ID','Waktu','Tanggal','Jam','Nama','Alamat','No_HP','Kategori','Catatan','Petugas'],
  'Telitian Anak': ['ID','No','Waktu','Tanggal','Jam','Nama','Alamat','Nominal','Petugas','Catatan'],
  'Telitian Dewasa': ['ID','No','Waktu','Tanggal','Jam','Nama','Alamat','Nominal','Petugas','Catatan'],
  'Dokumentasi': ['ID_DOK','Tanggal','Jam','Nama_Pengirim','Kategori','Judul','Keterangan','Nama_File','Drive_File_ID','Drive_URL','Thumbnail_URL','Ukuran_File','Status','Petugas_Validasi','Waktu_Upload'],
  'Panitia': ['ID','Nama','Bagian','No_HP','Catatan'],
  'Aktivitas': ['ID','Waktu','Tanggal','Jam','Petugas','Aktivitas','Jenis_Data','ID_Data','Keterangan'],
  'Pengaturan': ['Key','Value'],
  'Backup': ['ID','Waktu','Nama_File','Drive_File_ID','Drive_URL']
};

const DOC_FOLDERS = ['Dokumentasi Tamu','Dokumentasi Panitia','Persiapan','Acara Utama','Keluarga','Singa Dangdut','Telitian','Dekorasi','Hiburan','Lainnya','Backup'];

function setupProject() {
  if (INITIAL_SETUP.SPREADSHEET_ID.indexOf('GANTI_') === 0 || INITIAL_SETUP.ROOT_DRIVE_FOLDER_ID.indexOf('GANTI_') === 0 || INITIAL_SETUP.APP_SECRET.indexOf('GANTI_') === 0) {
    throw new Error('Isi INITIAL_SETUP terlebih dahulu.');
  }

  const props = PropertiesService.getScriptProperties();
  props.setProperties({
    SPREADSHEET_ID: INITIAL_SETUP.SPREADSHEET_ID,
    ROOT_DRIVE_FOLDER_ID: INITIAL_SETUP.ROOT_DRIVE_FOLDER_ID,
    APP_SECRET: INITIAL_SETUP.APP_SECRET
  }, true);

  const ss = SpreadsheetApp.openById(INITIAL_SETUP.SPREADSHEET_ID);
  Object.keys(SHEET_DEFINITIONS).forEach(function(name) {
    let sheet = ss.getSheetByName(name);
    if (!sheet) sheet = ss.insertSheet(name);
    const headers = SHEET_DEFINITIONS[name];
    if (sheet.getLastRow() === 0) sheet.appendRow(headers);
    else sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    formatSheet_(sheet, headers.length);
  });

  const root = DriveApp.getFolderById(INITIAL_SETUP.ROOT_DRIVE_FOLDER_ID);
  DOC_FOLDERS.forEach(function(name) { getOrCreateFolder_(root, name); });

  seedSettings_();
  const dash = ss.getSheetByName('Dashboard');
  dash.clearContents();
  dash.getRange(1,1,5,2).setValues([
    ['Keterangan','Nilai'],
    ['Nama Sistem','Hajatan Gibran Digital'],
    ['Backend','Google Apps Script'],
    ['Database','Google Sheets'],
    ['Dokumentasi','Google Drive']
  ]);
  formatSheet_(dash, 2);

  SpreadsheetApp.flush();
  Logger.log('Setup selesai. Selanjutnya Deploy > New deployment > Web app.');
}

function seedSettings_() {
  const sheet = getSheet_('Pengaturan');
  const existing = tableToObjects_(sheet);
  if (existing.length) return;
  const values = [
    ['nama_acara','Hajatan Gibran Digital'],
    ['nama_anak','Gibran Kurniawan'],
    ['tanggal_acara',''],
    ['lokasi_acara',''],
    ['pesan_beranda','Dokumentasi dan pengelolaan acara dalam satu sistem digital.']
  ];
  sheet.getRange(2,1,values.length,2).setValues(values);
}

function formatSheet_(sheet, columns) {
  sheet.setFrozenRows(1);
  const header = sheet.getRange(1, 1, 1, columns);
  header.setFontWeight('bold').setBackground('#7656d8').setFontColor('#ffffff');
  sheet.autoResizeColumns(1, columns);
  sheet.setRowHeight(1, 30);
}

function installDailyBackupTrigger() {
  ScriptApp.getProjectTriggers().forEach(function(t) {
    if (t.getHandlerFunction() === 'scheduledBackup') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('scheduledBackup').timeBased().everyDays(1).atHour(2).create();
  Logger.log('Trigger backup harian berhasil dibuat.');
}

function scheduledBackup() {
  createBackup_('Sistem');
}
