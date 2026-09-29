import { getGoogleAccessToken } from './googleAuth';

export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  webViewLink?: string;
}

export class GoogleDriveService {
  /**
   * Search spreadsheets in user's Google Drive
   */
  static async listSpreadsheets(): Promise<GoogleDriveFile[]> {
    const token = await getGoogleAccessToken();
    if (!token) throw new Error('Pengguna belum terhubung dengan akun Google.');

    const q = "mimeType='application/vnd.google-apps.spreadsheet' and trashed=false";
    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
        q
      )}&fields=files(id,name,mimeType,modifiedTime,webViewLink)&orderBy=modifiedTime desc&pageSize=20`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Gagal mengambil daftar spreadsheet (${res.status})`);
    }

    const data = await res.json();
    return data.files || [];
  }

  /**
   * Create an automated backup copy of a spreadsheet in Google Drive
   */
  static async backupSpreadsheet(spreadsheetId: string, customName?: string): Promise<GoogleDriveFile> {
    const token = await getGoogleAccessToken();
    if (!token) throw new Error('Pengguna belum terhubung dengan akun Google.');

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const backupName = customName || `Backup_ESF_Monitoring_${timestamp}`;

    const res = await fetch(`https://www.googleapis.com/drive/v3/files/${spreadsheetId}/copy`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: backupName
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Gagal membuat backup di Google Drive (${res.status})`);
    }

    return await res.json();
  }

  /**
   * Read all rows from a sheet directly via Google Sheets API v4
   */
  static async readSheetValues(spreadsheetId: string, sheetName: string): Promise<any[][]> {
    const token = await getGoogleAccessToken();
    if (!token) throw new Error('Pengguna belum terhubung dengan akun Google.');

    const range = encodeURIComponent(`${sheetName}!A1:Z1000`);
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Gagal membaca sheet ${sheetName} (${res.status})`);
    }

    const data = await res.json();
    return data.values || [];
  }

  /**
   * Append a row to a sheet directly via Google Sheets API v4
   */
  static async appendSheetRow(spreadsheetId: string, sheetName: string, rowValues: any[]): Promise<any> {
    const token = await getGoogleAccessToken();
    if (!token) throw new Error('Pengguna belum terhubung dengan akun Google.');

    const range = encodeURIComponent(`${sheetName}!A1`);
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          values: [rowValues]
        })
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Gagal menambahkan baris ke sheet ${sheetName} (${res.status})`);
    }

    return await res.json();
  }

  /**
   * Upload an attachment (e.g. photo of damaged tool or signed BA) into Google Drive
   */
  static async uploadAttachmentToDrive(
    fileName: string,
    fileContentBase64: string,
    mimeType: string
  ): Promise<GoogleDriveFile> {
    const token = await getGoogleAccessToken();
    if (!token) throw new Error('Pengguna belum terhubung dengan akun Google.');

    // Upload using multipart metadata
    const metadata = {
      name: `[ESF]_${fileName}`,
      mimeType: mimeType
    };

    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      `Content-Type: ${mimeType}\r\n` +
      'Content-Transfer-Encoding: base64\r\n\r\n' +
      fileContentBase64 +
      closeDelimiter;

    const res = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': `multipart/related; boundary=${boundary}`
        },
        body: multipartRequestBody
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Gagal mengunggah berkas ke Google Drive (${res.status})`);
    }

    return await res.json();
  }
}
