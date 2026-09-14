import {
  signInWithPopup,
  onAuthStateChanged,
  User,
  GoogleAuthProvider
} from "firebase/auth";
import { auth, googleWorkspaceProvider } from "./firebase";

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // Token will be acquired upon user-interactive Google Sign-In
        if (onAuthSuccess) onAuthSuccess(user, "");
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const signInWithGoogle = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, googleWorkspaceProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error("Gagal memperoleh token akses Google Workspace.");
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error) {
    console.error("Google sign in error:", error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logoutGoogle = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};

/**
 * Upload file directly to Google Drive via Google Drive v3 REST API
 */
export async function uploadDirectToGoogleDrive(
  file: File,
  folderName: string = "Hajatan Gibran Digital",
  customDescription: string = ""
): Promise<{ ok: boolean; fileId?: string; webViewLink?: string; error?: string }> {
  const token = await getAccessToken();
  if (!token) {
    return { ok: false, error: "Silakan login dengan akun Google terlebih dahulu." };
  }

  try {
    // 1. Search or create the folder
    const folderSearchQuery = encodeURIComponent(
      `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false`
    );
    const searchRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${folderSearchQuery}&fields=files(id,name)`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const searchData = await searchRes.json();
    let folderId = searchData.files?.[0]?.id;

    if (!folderId) {
      // Create folder
      const createFolderRes = await fetch("https://www.googleapis.com/drive/v3/files", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: folderName,
          mimeType: "application/vnd.google-apps.folder"
        })
      });
      const createdFolder = await createFolderRes.json();
      folderId = createdFolder.id;
    }

    // 2. Upload file multipart (metadata + media)
    const metadata = {
      name: file.name,
      parents: folderId ? [folderId] : [],
      description: customDescription
    };

    const boundary = "-------314159265358979323846";
    const delimiter = "\r\n--" + boundary + "\r\n";
    const closeDelim = "\r\n--" + boundary + "--";

    const base64Data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const res = String(reader.result);
        const commaIdx = res.indexOf(",");
        resolve(commaIdx >= 0 ? res.substring(commaIdx + 1) : res);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const multipartRequestBody =
      delimiter +
      "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
      JSON.stringify(metadata) +
      delimiter +
      `Content-Type: ${file.type || "image/jpeg"}\r\n` +
      "Content-Transfer-Encoding: base64\r\n\r\n" +
      base64Data +
      closeDelim;

    const uploadRes = await fetch(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,thumbnailLink",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": `multipart/related; boundary=${boundary}`
        },
        body: multipartRequestBody
      }
    );

    const uploadData = await uploadRes.json();
    if (!uploadRes.ok) {
      throw new Error(uploadData.error?.message || "Gagal mengunggah file ke Google Drive.");
    }

    return {
      ok: true,
      fileId: uploadData.id,
      webViewLink: uploadData.webViewLink
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Gagal mengunggah ke Google Drive."
    };
  }
}

/**
 * List files in Google Drive folder
 */
export async function listGoogleDriveFiles(folderName: string = "Hajatan Gibran Digital") {
  const token = await getAccessToken();
  if (!token) return { ok: false, error: "Belum login dengan Google." };

  try {
    const folderSearchQuery = encodeURIComponent(
      `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false`
    );
    const searchRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${folderSearchQuery}&fields=files(id,name)`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const searchData = await searchRes.json();
    const folderId = searchData.files?.[0]?.id;

    let query = "trashed=false and mimeType contains 'image/'";
    if (folderId) {
      query = `'${folderId}' in parents and trashed=false`;
    }

    const filesRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
        query
      )}&fields=files(id,name,mimeType,thumbnailLink,webViewLink,size,createdTime)&pageSize=30`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const filesData = await filesRes.json();
    if (!filesRes.ok) throw new Error(filesData.error?.message || "Gagal membaca Google Drive.");

    return { ok: true, files: filesData.files || [] };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Gagal mengambil data Google Drive."
    };
  }
}

/**
 * Read data from Google Spreadsheet
 */
export async function readGoogleSheet(spreadsheetId: string, range: string) {
  const token = await getAccessToken();
  if (!token) return { ok: false, error: "Belum login dengan Google." };

  try {
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
        spreadsheetId
      )}/values/${encodeURIComponent(range)}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || "Gagal membaca Google Spreadsheet.");
    return { ok: true, values: data.values || [] };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Gagal membaca Google Spreadsheet."
    };
  }
}

/**
 * Append row to Google Spreadsheet
 */
export async function appendGoogleSheet(spreadsheetId: string, range: string, values: unknown[][]) {
  const token = await getAccessToken();
  if (!token) return { ok: false, error: "Belum login dengan Google." };

  try {
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
        spreadsheetId
      )}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ values })
      }
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || "Gagal menambahkan data ke Google Spreadsheet.");
    return { ok: true, data };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Gagal menulis ke Google Spreadsheet."
    };
  }
}
