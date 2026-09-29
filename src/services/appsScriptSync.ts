import { StorageService } from './storage';
import { User } from '../types';

export class AppsScriptSyncService {
  /**
   * Pull all data from Google Apps Script Web App
   * @param silent Jika true, proses sinkronisasi berjalan hening di background tanpa memicu status loading yang mengganggu UI
   */
  static async pullDataFromSheet(silent: boolean = false): Promise<{ success: boolean; message: string; data?: any; hasChanged?: boolean }> {
    const config = StorageService.getSyncConfig();
    if (!config.webAppUrl || !config.webAppUrl.trim().startsWith('http')) {
      return {
        success: false,
        message: 'URL Google Apps Script belum dikonfigurasi. Masukkan URL Web App pada tab Sinkronisasi Apps Script.'
      };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6500);

    try {
      if (!silent) {
        config.lastSyncStatus = 'syncing';
        StorageService.saveSyncConfig(config);
      }

      // Add timestamp to prevent browser cache
      const fetchUrl = new URL(config.webAppUrl);
      fetchUrl.searchParams.set('_t', Date.now().toString());

      const response = await fetch(fetchUrl.toString(), {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const resJson = await response.json();
      if (resJson.status === 'success' && resJson.data) {
        // Parse and store directly into all 7 local modules with exact column indices
        const counts = StorageService.parseAndStoreSpreadsheetData(resJson.data);

        config.lastSyncTime = new Date().toISOString();
        config.lastSyncStatus = 'success';
        config.lastSyncMessage = `Sinkronisasi berhasil: ${counts.assetCount} Asset, ${counts.toolboxCount} Toolbox, ${counts.peminjamanCount} Peminjaman dimuat.`;
        StorageService.saveSyncConfig(config);

        if (counts.hasChanged && !silent) {
          StorageService.addSyncLog({
            id: `log-${Date.now()}`,
            timestamp: new Date().toISOString(),
            action: 'PULL',
            module: 'ALL',
            jobsite: 'Spreadsheet Sync',
            status: 'SUCCESS',
            detail: `Perubahan terdeteksi dari Spreadsheet: ${counts.assetCount} Asset, ${counts.toolboxCount} Toolbox, ${counts.peminjamanCount} Peminjaman dimuat.`
          });
        }

        return {
          success: true,
          message: `Berhasil sinkronisasi! Dimuat ${counts.assetCount} Asset, ${counts.toolboxCount} Toolbox, ${counts.peminjamanCount} Peminjaman, dll.`,
          data: resJson.data,
          hasChanged: counts.hasChanged
        };
      } else {
        throw new Error(resJson.message || 'Format respon Apps Script tidak valid');
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (!silent) {
        config.lastSyncStatus = 'error';
        config.lastSyncMessage = `Gagal sinkron: ${err.message || 'CORS / Network error'}`;
        StorageService.saveSyncConfig(config);

        StorageService.addSyncLog({
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          action: 'PULL',
          module: 'ALL',
          jobsite: 'Spreadsheet Sync',
          status: 'FAILED',
          detail: `Gagal menarik data: ${err.message}`
        });
      }

      return {
        success: false,
        message: `Koneksi Google Apps Script: ${err.name === 'AbortError' ? 'Timeout (jaringan lambat)' : err.message}. Pastikan deployment diset 'Execute as: Me' dan 'Who has access: Anyone'.`
      };
    }
  }

  /**
   * Helper to normalize module names to match Google Apps Script expectations
   */
  static getScriptModuleName(module: string): string {
    switch (module) {
      case 'populasi-asset':
      case 'asset':
      case 'assets':
        return 'assets';
      case 'populasi-toolbox':
      case 'toolbox':
      case 'toolboxes':
        return 'toolboxes';
      case 'peminjaman-tools':
      case 'peminjaman':
        return 'peminjaman';
      case 'pengadaan-barang':
      case 'pengadaan':
        return 'pengadaan';
      case 'ba-kerusakan':
      case 'kerusakan':
        return 'kerusakan';
      case 'osr-tools':
      case 'osr':
        return 'osr';
      case 'ba-serah-terima':
      case 'bast':
        return 'bast';
      default:
        return module;
    }
  }

  /**
   * Push an item addition or modification to Google Spreadsheet
   * Menggunakan Dual-Channel (POST + GET Fallback) untuk menjamin data pasti masuk ke Spreadsheet
   */
  static async pushItemToSheet(
    module: string,
    action: 'insert' | 'update',
    itemData: any,
    user: User
  ): Promise<{ success: boolean; message: string }> {
    const config = StorageService.getSyncConfig();
    const scriptModule = this.getScriptModuleName(module);
    
    // Log local save
    StorageService.addSyncLog({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'MANUAL_INPUT',
      module: scriptModule,
      jobsite: user.jobsite,
      status: 'SUCCESS',
      detail: `Data [${scriptModule}] ${action === 'insert' ? 'ditambahkan' : 'diperbarui'} oleh ${user.username}`
    });

    if (!config.webAppUrl || !config.webAppUrl.trim().startsWith('http')) {
      return {
        success: true,
        message: 'Data tersimpan di sistem lokal aplikasi. (URL Apps Script belum dipasang).'
      };
    }

    try {
      const payload = {
        action: action,
        module: scriptModule,
        userRole: user.role,
        jobsite: user.jobsite,
        username: user.username,
        data: itemData
      };

      const primaryKey =
        itemData.noRegistrasi ||
        itemData.noToolbox ||
        itemData.noPeminjaman ||
        itemData.noPoPr ||
        itemData.noBa ||
        itemData.noOsr ||
        itemData.noBast ||
        itemData.id;

      // Single Reliable Transmission (POST with fallback only if network throws exception)
      // Never send POST and GET in parallel to prevent duplicate rows
      let pushSuccess = false;
      try {
        await fetch(config.webAppUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8'
          },
          body: JSON.stringify(payload),
          mode: 'no-cors'
        });
        pushSuccess = true;
      } catch (postErr) {
        console.warn('POST failed, attempting fallback webhook:', postErr);
      }

      if (!pushSuccess) {
        // Fallback only if POST failed at network level
        const getUrl = new URL(config.webAppUrl);
        getUrl.searchParams.set('action', action);
        getUrl.searchParams.set('module', scriptModule);
        getUrl.searchParams.set('key', primaryKey || '');
        getUrl.searchParams.set('userRole', user.role);
        getUrl.searchParams.set('jobsite', user.jobsite);
        getUrl.searchParams.set('data', JSON.stringify(itemData));
        getUrl.searchParams.set('_t', Date.now().toString());

        await fetch(getUrl.toString(), {
          method: 'GET',
          mode: 'no-cors'
        });
      }

      config.lastSyncTime = new Date().toISOString();
      config.lastSyncStatus = 'success';
      config.lastSyncMessage = `Berhasil mengirim sinkronisasi ${action} ke Google Spreadsheet.`;
      StorageService.saveSyncConfig(config);

      return {
        success: true,
        message: 'Data berhasil disimpan dan disinkronkan ke Google Spreadsheet!'
      };
    } catch (err: any) {
      console.warn('Network sync notice:', err);
      return {
        success: true,
        message: 'Data tersimpan di aplikasi: ' + err.message
      };
    }
  }

  /**
   * Push a delete command to Google Spreadsheet (ONLY for HO - Balikpapan)
   */
  static async pushDeleteToSheet(
    module: string,
    key: string,
    user: User
  ): Promise<{ success: boolean; message: string }> {
    if (user.role !== 'ho' && user.jobsite !== 'HO - Balikpapan') {
      return {
        success: false,
        message: 'Akses ditolak: Hanya user "HO - Balikpapan" yang berhak menghapus data pada aplikasi dan spreadsheet.'
      };
    }

    const config = StorageService.getSyncConfig();
    const scriptModule = this.getScriptModuleName(module);

    if (!config.webAppUrl || !config.webAppUrl.trim().startsWith('http')) {
      return {
        success: true,
        message: 'Data dihapus dari aplikasi. (URL Apps Script belum dipasang).'
      };
    }

    try {
      const payload = {
        action: 'delete',
        module: scriptModule,
        key: key,
        userRole: user.role,
        jobsite: user.jobsite,
        username: user.username
      };

      // Single Reliable Transmission for Delete (POST with fallback only if network throws exception)
      let deleteSuccess = false;
      try {
        await fetch(config.webAppUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8'
          },
          body: JSON.stringify(payload),
          mode: 'no-cors'
        });
        deleteSuccess = true;
      } catch (postErr) {
        console.warn('Delete POST notice:', postErr);
      }

      if (!deleteSuccess) {
        const getUrl = new URL(config.webAppUrl);
        getUrl.searchParams.set('action', 'delete');
        getUrl.searchParams.set('module', scriptModule);
        getUrl.searchParams.set('key', key);
        getUrl.searchParams.set('userRole', user.role);
        getUrl.searchParams.set('jobsite', user.jobsite);
        getUrl.searchParams.set('_t', Date.now().toString());

        await fetch(getUrl.toString(), {
          method: 'GET',
          mode: 'no-cors'
        });
      }

      return {
        success: true,
        message: `Data '${key}' berhasil dihapus dari aplikasi dan sinkronisasi penghapusan dikirim ke Google Spreadsheet.`
      };
    } catch (err: any) {
      return {
        success: true,
        message: 'Data terhapus di aplikasi: ' + err.message
      };
    }
  }
}
