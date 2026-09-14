const TZ = 'Asia/Jakarta';
const MAX_IMAGE_BYTES = 2200000;
const ALLOWED_IMAGE_MIME = ['image/jpeg','image/png','image/webp'];

function doGet() {
  return json_({ ok: true, message: 'Hajatan Gibran Digital API aktif.' });
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) throw new Error('Body request kosong.');
    const req = JSON.parse(e.postData.contents);
    verifySecret_(req.secret);
    const action = String(req.action || '');
    const p = req.payload || {};
    let data;

    switch (action) {
      case 'getDashboard': data = getDashboard_(); break;
      case 'listTamu': data = listRows_('Tamu', 1000); break;
      case 'addTamu': data = addTamu_(p); break;
      case 'updateTamu': data = updateTamu_(p); break;
      case 'deleteTamu': data = deleteTamu_(p); break;
      case 'listTelitian': data = listTelitian_(p); break;
      case 'addTelitian': data = addTelitian_(p); break;
      case 'updateTelitian': data = updateTelitian_(p); break;
      case 'deleteTelitian': data = deleteTelitian_(p); break;
      case 'listDocumentation': data = listDocumentation_(); break;
      case 'getPublicGallery': data = getPublicGallery_(); break;
      case 'uploadDocumentation': data = uploadDocumentation_(p); break;
      case 'updateDocumentationStatus': data = updateDocumentationStatus_(p); break;
      case 'deleteDocumentation': data = deleteDocumentation_(p); break;
      case 'listPanitia': data = listRows_('Panitia', 1000); break;
      case 'addPanitia': data = addPanitia_(p); break;
      case 'updatePanitia': data = updatePanitia_(p); break;
      case 'deletePanitia': data = deletePanitia_(p); break;
      case 'getActivity': data = getActivity_(); break;
      case 'getSettings': data = getSettings_(); break;
      case 'getPublicSettings': data = getPublicSettings_(); break;
      case 'saveSettings': data = saveSettings_(p); break;
      case 'createBackup': data = createBackup_(p.Petugas || 'Admin'); break;
      default: throw new Error('Action tidak dikenal: ' + action);
    }
    return json_({ ok: true, data: data });
  } catch (err) {
    return json_({ ok: false, error: err && err.message ? err.message : String(err) });
  }
}

function verifySecret_(secret) {
  const expected = PropertiesService.getScriptProperties().getProperty('APP_SECRET');
  if (!expected) throw new Error('APP_SECRET belum diset. Jalankan setupProject().');
  if (String(secret || '') !== expected) throw new Error('Akses ditolak.');
}

function getSs_() {
  const id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (!id) throw new Error('SPREADSHEET_ID belum diset.');
  return SpreadsheetApp.openById(id);
}

function getSheet_(name) {
  const sheet = getSs_().getSheetByName(name);
  if (!sheet) throw new Error('Sheet "' + name + '" tidak ditemukan. Jalankan setupProject().');
  return sheet;
}

function nowParts_() {
  const d = new Date();
  return {
    waktu: Utilities.formatDate(d, TZ, 'yyyy-MM-dd HH:mm:ss'),
    tanggal: Utilities.formatDate(d, TZ, 'dd/MM/yyyy'),
    jam: Utilities.formatDate(d, TZ, 'HH:mm:ss'),
    stamp: Utilities.formatDate(d, TZ, 'yyyyMMdd-HHmmss')
  };
}

function clean_(value, maxLen) {
  const s = String(value == null ? '' : value).replace(/[<>]/g, '').trim();
  return s.substring(0, maxLen || 500);
}

function money_(value) {
  const n = Number(value);
  if (!isFinite(n) || n < 0) throw new Error('Nominal tidak valid.');
  return Math.round(n);
}

function tableToObjects_(sheet) {
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  if (lastRow < 2 || lastCol < 1) return [];
  const values = sheet.getRange(1, 1, lastRow, lastCol).getValues();
  const headers = values[0].map(String);
  return values.slice(1).filter(function(row){ return row.some(function(v){ return v !== ''; }); }).map(function(row) {
    const obj = {};
    headers.forEach(function(h, i) {
      const v = row[i];
      obj[h] = v instanceof Date ? Utilities.formatDate(v, TZ, 'yyyy-MM-dd HH:mm:ss') : v;
    });
    return obj;
  });
}

function listRows_(sheetName, limit) {
  const rows = tableToObjects_(getSheet_(sheetName));
  rows.reverse();
  return rows.slice(0, limit || 1000);
}

function headerIndex_(sheet) {
  const headers = sheet.getRange(1,1,1,sheet.getLastColumn()).getValues()[0].map(String);
  const map = {};
  headers.forEach(function(h,i){ map[h] = i + 1; });
  return map;
}

function findRowById_(sheet, idHeader, id) {
  if (!id) throw new Error('ID wajib diisi.');
  const idx = headerIndex_(sheet)[idHeader];
  if (!idx) throw new Error('Kolom ID tidak ditemukan.');
  const last = sheet.getLastRow();
  if (last < 2) return -1;
  const values = sheet.getRange(2, idx, last - 1, 1).getValues();
  for (let i=0;i<values.length;i++) if (String(values[i][0]) === String(id)) return i + 2;
  return -1;
}

function nextId_(prefix) {
  const props = PropertiesService.getScriptProperties();
  const key = 'SEQ_' + prefix;
  const next = Number(props.getProperty(key) || 0) + 1;
  props.setProperty(key, String(next));
  return 'HGD-' + prefix + '-' + String(next).padStart(6, '0');
}

function nextNo_(sheet) {
  const idx = headerIndex_(sheet)['No'];
  if (!idx || sheet.getLastRow() < 2) return 1;
  const nums = sheet.getRange(2, idx, sheet.getLastRow()-1, 1).getValues().flat().map(Number).filter(isFinite);
  return nums.length ? Math.max.apply(null, nums) + 1 : 1;
}

function withLock_(fn) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try { return fn(); } finally { lock.releaseLock(); }
}

function addTamu_(p) {
  return withLock_(function(){
    const sheet=getSheet_('Tamu'), n=nowParts_();
    const nama=clean_(p.Nama,120); if(!nama) throw new Error('Nama tamu wajib diisi.');
    const id=nextId_('TAMU');
    sheet.appendRow([id,n.waktu,n.tanggal,n.jam,nama,clean_(p.Alamat,180),clean_(p.No_HP,30),clean_(p.Kategori||'Umum',60),clean_(p.Catatan,300),clean_(p.Petugas||'Admin',80)]);
    logActivity_(p.Petugas||'Admin','Menambahkan tamu','Tamu',id,nama);
    return {ID:id};
  });
}

function updateTamu_(p) {
  return withLock_(function(){
    const sheet=getSheet_('Tamu'), row=findRowById_(sheet,'ID',p.ID); if(row<0) throw new Error('Data tamu tidak ditemukan.');
    const h=headerIndex_(sheet); const fields=['Nama','Alamat','No_HP','Kategori','Catatan','Petugas'];
    fields.forEach(function(k){ if(Object.prototype.hasOwnProperty.call(p,k)) sheet.getRange(row,h[k]).setValue(clean_(p[k], k==='Catatan'?300:180)); });
    logActivity_(p.Petugas||'Admin','Memperbarui tamu','Tamu',p.ID,clean_(p.Nama,120)); return {ID:p.ID};
  });
}

function deleteTamu_(p) {
  return withLock_(function(){const sheet=getSheet_('Tamu'),row=findRowById_(sheet,'ID',p.ID);if(row<0)throw new Error('Data tidak ditemukan.');sheet.deleteRow(row);logActivity_('Admin','Menghapus tamu','Tamu',p.ID,'');return {ID:p.ID};});
}

function telitianSheet_(jenis) {
  const j=clean_(jenis,20).toLowerCase();
  if(j==='anak') return 'Telitian Anak';
  if(j==='dewasa') return 'Telitian Dewasa';
  throw new Error('Jenis telitian tidak valid.');
}

function listTelitian_(p) { return listRows_(telitianSheet_(p.jenis), 2000); }

function addTelitian_(p) {
  return withLock_(function(){
    const name=telitianSheet_(p.jenis), sheet=getSheet_(name), n=nowParts_(), nama=clean_(p.Nama,120); if(!nama)throw new Error('Nama wajib diisi.');
    const prefix=name==='Telitian Anak'?'TA':'TD', id=nextId_(prefix), no=nextNo_(sheet), nominal=money_(p.Nominal);
    sheet.appendRow([id,no,n.waktu,n.tanggal,n.jam,nama,clean_(p.Alamat,180),nominal,clean_(p.Petugas||'Admin',80),clean_(p.Catatan,300)]);
    logActivity_(p.Petugas||'Admin','Menambahkan '+name,name,id,nama+' - Rp'+nominal); return {ID:id,No:no};
  });
}

function updateTelitian_(p) {
  return withLock_(function(){
    const name=telitianSheet_(p.jenis),sheet=getSheet_(name),row=findRowById_(sheet,'ID',p.ID);if(row<0)throw new Error('Data tidak ditemukan.');const h=headerIndex_(sheet);
    if(p.Nama!==undefined)sheet.getRange(row,h.Nama).setValue(clean_(p.Nama,120));if(p.Alamat!==undefined)sheet.getRange(row,h.Alamat).setValue(clean_(p.Alamat,180));if(p.Nominal!==undefined)sheet.getRange(row,h.Nominal).setValue(money_(p.Nominal));if(p.Petugas!==undefined)sheet.getRange(row,h.Petugas).setValue(clean_(p.Petugas,80));if(p.Catatan!==undefined)sheet.getRange(row,h.Catatan).setValue(clean_(p.Catatan,300));
    logActivity_(p.Petugas||'Admin','Memperbarui '+name,name,p.ID,clean_(p.Nama,120));return {ID:p.ID};
  });
}

function deleteTelitian_(p) {return withLock_(function(){const name=telitianSheet_(p.jenis),sheet=getSheet_(name),row=findRowById_(sheet,'ID',p.ID);if(row<0)throw new Error('Data tidak ditemukan.');sheet.deleteRow(row);logActivity_('Admin','Menghapus '+name,name,p.ID,'');return {ID:p.ID};});}

function listDocumentation_() { return listRows_('Dokumentasi', 1000); }
function getPublicGallery_() { return listRows_('Dokumentasi', 1000).filter(function(r){ return String(r.Status)==='Disetujui'; }).slice(0,300); }

function uploadDocumentation_(p) {
  return withLock_(function(){
    const dataUrl=String(p.Data_URL||''); const match=dataUrl.match(/^data:(image\/(?:jpeg|png|webp));base64,(.+)$/); if(!match)throw new Error('Data gambar tidak valid.');
    const mime=match[1];if(ALLOWED_IMAGE_MIME.indexOf(mime)<0)throw new Error('Format gambar tidak diizinkan.');
    const bytes=Utilities.base64Decode(match[2]);if(bytes.length>MAX_IMAGE_BYTES)throw new Error('Ukuran gambar terlalu besar setelah kompresi.');
    const n=nowParts_(), category=normalizeCategory_(p.Kategori), sender=clean_(p.Nama_Pengirim,100);if(!sender)throw new Error('Nama pengirim wajib diisi.');
    const safeName=(clean_(p.Nama_File,120)||('foto-'+n.stamp+'.jpg')).replace(/[^a-zA-Z0-9._ -]/g,'_');
    const root=DriveApp.getFolderById(PropertiesService.getScriptProperties().getProperty('ROOT_DRIVE_FOLDER_ID'));
    const folderName=category==='Tamu'?'Dokumentasi Tamu':category==='Panitia'?'Dokumentasi Panitia':category;
    const folder=getOrCreateFolder_(root,folderName);
    const blob=Utilities.newBlob(bytes,mime,safeName);const file=folder.createFile(blob);
    try{file.setSharing(DriveApp.Access.ANYONE_WITH_LINK,DriveApp.Permission.VIEW);}catch(shareErr){Logger.log('Peringatan sharing Drive: '+shareErr);}
    const fileId=file.getId(),url='https://drive.google.com/uc?export=view&id='+fileId,thumb='https://drive.google.com/thumbnail?id='+fileId+'&sz=w1000';
    const id=nextId_('DOK'),sheet=getSheet_('Dokumentasi');
    sheet.appendRow([id,n.tanggal,n.jam,sender,category,clean_(p.Judul,140),clean_(p.Keterangan,500),safeName,fileId,url,thumb,bytes.length,'Menunggu Persetujuan','',n.waktu]);
    logActivity_(sender,'Mengirim dokumentasi','Dokumentasi',id,category+' - '+safeName);return {ID_DOK:id};
  });
}

function updateDocumentationStatus_(p) {
  return withLock_(function(){const allowed=['Menunggu Persetujuan','Disetujui','Ditolak'];const status=clean_(p.Status,40);if(allowed.indexOf(status)<0)throw new Error('Status tidak valid.');const sheet=getSheet_('Dokumentasi'),row=findRowById_(sheet,'ID_DOK',p.ID_DOK);if(row<0)throw new Error('Dokumentasi tidak ditemukan.');const h=headerIndex_(sheet);sheet.getRange(row,h.Status).setValue(status);sheet.getRange(row,h.Petugas_Validasi).setValue(clean_(p.Petugas_Validasi||'Admin',80));logActivity_(p.Petugas_Validasi||'Admin','Validasi dokumentasi','Dokumentasi',p.ID_DOK,status);return {ID_DOK:p.ID_DOK,Status:status};});
}

function deleteDocumentation_(p) {
  return withLock_(function(){const sheet=getSheet_('Dokumentasi'),row=findRowById_(sheet,'ID_DOK',p.ID_DOK);if(row<0)throw new Error('Dokumentasi tidak ditemukan.');const h=headerIndex_(sheet),fileId=String(sheet.getRange(row,h.Drive_File_ID).getValue()||'');if(fileId){try{DriveApp.getFileById(fileId).setTrashed(true);}catch(e){Logger.log(e);}}sheet.deleteRow(row);logActivity_('Admin','Menghapus dokumentasi','Dokumentasi',p.ID_DOK,'');return {ID_DOK:p.ID_DOK};});
}

function normalizeCategory_(value) {const allowed=['Persiapan','Acara Utama','Keluarga','Tamu','Panitia','Singa Dangdut','Telitian','Dekorasi','Hiburan','Lainnya'];const v=clean_(value,50);return allowed.indexOf(v)>=0?v:'Lainnya';}

function addPanitia_(p) {return withLock_(function(){const nama=clean_(p.Nama,120);if(!nama)throw new Error('Nama wajib diisi.');const id=nextId_('PAN'),sheet=getSheet_('Panitia');sheet.appendRow([id,nama,clean_(p.Bagian,120),clean_(p.No_HP,30),clean_(p.Catatan,300)]);logActivity_('Admin','Menambahkan panitia','Panitia',id,nama);return {ID:id};});}
function updatePanitia_(p) {return withLock_(function(){const sheet=getSheet_('Panitia'),row=findRowById_(sheet,'ID',p.ID);if(row<0)throw new Error('Panitia tidak ditemukan.');const h=headerIndex_(sheet);['Nama','Bagian','No_HP','Catatan'].forEach(function(k){if(p[k]!==undefined)sheet.getRange(row,h[k]).setValue(clean_(p[k],k==='Catatan'?300:150));});logActivity_('Admin','Memperbarui panitia','Panitia',p.ID,clean_(p.Nama,120));return {ID:p.ID};});}
function deletePanitia_(p) {return withLock_(function(){const sheet=getSheet_('Panitia'),row=findRowById_(sheet,'ID',p.ID);if(row<0)throw new Error('Panitia tidak ditemukan.');sheet.deleteRow(row);logActivity_('Admin','Menghapus panitia','Panitia',p.ID,'');return {ID:p.ID};});}

function getDashboard_() {
  const anak=listRows_('Telitian Anak',5000),dewasa=listRows_('Telitian Dewasa',5000),docs=listRows_('Dokumentasi',5000);
  const sa=anak.reduce(function(a,r){return a+Number(r.Nominal||0);},0),sd=dewasa.reduce(function(a,r){return a+Number(r.Nominal||0);},0);
  return {totalTamu:Math.max(0,getSheet_('Tamu').getLastRow()-1),telitianAnak:sa,telitianDewasa:sd,totalTelitian:sa+sd,jumlahDokumentasi:docs.length,dokumentasiMenunggu:docs.filter(function(r){return r.Status==='Menunggu Persetujuan';}).length,jumlahPanitia:Math.max(0,getSheet_('Panitia').getLastRow()-1),aktivitasTerbaru:getActivity_().slice(0,8)};
}

function logActivity_(petugas, activity, type, id, note) {
  const n=nowParts_(),sheet=getSheet_('Aktivitas'),aid=nextId_('LOG');sheet.appendRow([aid,n.waktu,n.tanggal,n.jam,clean_(petugas||'Sistem',80),clean_(activity,150),clean_(type,80),clean_(id,80),clean_(note,300)]);
}
function getActivity_(){return listRows_('Aktivitas',200);}

function getSettings_(){const rows=tableToObjects_(getSheet_('Pengaturan')),out={};rows.forEach(function(r){out[String(r.Key)]=String(r.Value==null?'':r.Value);});return out;}
function getPublicSettings_(){const all=getSettings_(),keys=['nama_acara','nama_anak','tanggal_acara','lokasi_acara','pesan_beranda'],out={};keys.forEach(function(k){out[k]=all[k]||'';});return out;}
function saveSettings_(p){return withLock_(function(){const sheet=getSheet_('Pengaturan'),allowed=['nama_acara','nama_anak','tanggal_acara','lokasi_acara','pesan_beranda'];const existing=tableToObjects_(sheet);const map={};existing.forEach(function(r,i){map[String(r.Key)]=i+2;});allowed.forEach(function(k){if(p[k]===undefined)return;const val=clean_(p[k],500);if(map[k])sheet.getRange(map[k],2).setValue(val);else sheet.appendRow([k,val]);});logActivity_('Admin','Memperbarui pengaturan','Pengaturan','SETTINGS','');return getSettings_();});}

function createBackup_(petugas) {
  const props=PropertiesService.getScriptProperties(),spreadsheetId=props.getProperty('SPREADSHEET_ID'),rootId=props.getProperty('ROOT_DRIVE_FOLDER_ID');if(!spreadsheetId||!rootId)throw new Error('Konfigurasi backup belum lengkap.');
  const root=DriveApp.getFolderById(rootId),folder=getOrCreateFolder_(root,'Backup'),n=nowParts_(),name='HGD-Backup-'+n.stamp;
  const copy=DriveApp.getFileById(spreadsheetId).makeCopy(name,folder);const url=copy.getUrl(),id=nextId_('BKP');getSheet_('Backup').appendRow([id,n.waktu,name,copy.getId(),url]);logActivity_(petugas||'Admin','Membuat backup','Backup',id,name);return {ID:id,name:name,url:url};
}

function getOrCreateFolder_(parent, name) {const it=parent.getFoldersByName(name);return it.hasNext()?it.next():parent.createFolder(name);}
function json_(obj) {return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);}
