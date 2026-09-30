import React, { useState } from 'react';
import { StorageService } from '../services/storage';
import { User } from '../types';
import { ALL_JOBSITES } from '../data/defaultUsers';
import {
  Users,
  KeyRound,
  UserPlus,
  Trash2,
  RotateCcw,
  Check,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';

interface DeveloperPanelProps {
  onNotify: (type: 'success' | 'error' | 'info' | 'warning', title: string, message?: string) => void;
}

export const DeveloperPanel: React.FC<DeveloperPanelProps> = ({ onNotify }) => {
  const [users, setUsers] = useState<User[]>(() => StorageService.getUsers());
  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({});

  // Modal / Form state for Change Password
  const [selectedUserForPassword, setSelectedUserForPassword] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');

  // Modal / Form state for Add User
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserJobsite, setNewUserJobsite] = useState(ALL_JOBSITES[0]);
  const [newUserRole, setNewUserRole] = useState<'user' | 'ho'>('user');
  const [newUserNameDesc, setNewUserNameDesc] = useState('');

  const refreshUsers = () => {
    setUsers(StorageService.getUsers());
  };

  const toggleShowPassword = (username: string) => {
    setShowPasswords((prev) => ({ ...prev, [username]: !prev[username] }));
  };

  const handleOpenPasswordModal = (user: User) => {
    setSelectedUserForPassword(user);
    setNewPassword(user.password || '');
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForPassword || !newPassword.trim()) return;

    const ok = StorageService.updatePassword(selectedUserForPassword.username, newPassword.trim());
    if (ok) {
      onNotify('success', 'Password Berhasil Diubah', `Password untuk user "${selectedUserForPassword.username}" telah diperbarui.`);
      refreshUsers();
      setSelectedUserForPassword(null);
      setNewPassword('');
    } else {
      onNotify('error', 'Gagal Mengubah Password', 'Terjadi kesalahan sistem saat memperbarui password.');
    }
  };

  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newUserPassword.trim()) {
      onNotify('warning', 'Data Belum Lengkap', 'Username dan password wajib diisi.');
      return;
    }

    const newUser: User = {
      username: newUsername.trim(),
      password: newUserPassword.trim(),
      jobsite: newUserJobsite,
      role: newUserRole,
      name: newUserNameDesc.trim() || `User ${newUsername.trim()}`
    };

    const success = StorageService.addUser(newUser);
    if (success) {
      onNotify('success', 'User Baru Ditambahkan', `Akun "${newUser.username}" untuk jobsite "${newUser.jobsite}" berhasil dibuat.`);
      refreshUsers();
      setIsAddUserOpen(false);
      setNewUsername('');
      setNewUserPassword('');
      setNewUserNameDesc('');
    } else {
      onNotify('error', 'Username Sudah Digunakan', `Username "${newUsername}" sudah ada dalam database.`);
    }
  };

  const handleDeleteUser = (u: User) => {
    if (u.username === 'Developer' || u.username === 'HO - Balikpapan') {
      onNotify('warning', 'Akun Dilindungi', 'Akun Developer dan HO - Balikpapan tidak boleh dihapus.');
      return;
    }

    if (window.confirm(`Apakah Anda yakin ingin menghapus akun user "${u.username}"?`)) {
      const ok = StorageService.deleteUser(u.username);
      if (ok) {
        onNotify('success', 'User Dihapus', `Akun "${u.username}" berhasil dihapus dari sistem.`);
        refreshUsers();
      }
    }
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset seluruh username & password ke konfigurasi awal?')) {
      StorageService.resetUsersToDefault();
      refreshUsers();
      onNotify('info', 'Reset Akun Berhasil', 'Seluruh daftar username & password telah dikembalikan ke default.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Developer Banner */}
      <div className="bg-[#063D2E] border border-[#0B4D3B] rounded-2xl p-6 shadow-md relative overflow-hidden text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
                DEVELOPER ACCOUNT PRIVILEGE
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Users className="w-6 h-6 text-emerald-300" />
              Manajemen Pengguna & Password
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/80 mt-1 max-w-2xl leading-relaxed">
              Sesuai otorisasi sistem, akun Developer berfungsi khusus untuk menambah username, mengganti password akun jobsite, dan menghapus akun.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="px-3.5 py-2 rounded-xl bg-[#0E5642] hover:bg-[#126850] border border-emerald-400/30 text-xs font-semibold text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5 text-emerald-300" />
              <span>Reset Default</span>
            </button>
            <button
              type="button"
              onClick={() => setIsAddUserOpen(true)}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#063D2E] text-xs font-black flex items-center gap-1.5 transition-all shadow-md shadow-emerald-950/40 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Tambah User Baru</span>
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Daftar Akun Terdaftar ({users.length} Akun)
          </span>
          <span className="text-xs text-slate-500">12 Jobsite + HO + Developer</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#063D2E] text-white font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">No</th>
                <th className="py-3 px-4">Username / ID</th>
                <th className="py-3 px-4">Jobsite Terikat</th>
                <th className="py-3 px-4">Hak Akses / Peran</th>
                <th className="py-3 px-4">Password</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {users.map((u, idx) => {
                const isProtected = u.username === 'Developer' || u.username === 'HO - Balikpapan';
                const isShowing = showPasswords[u.username];

                return (
                  <tr key={u.username} className="hover:bg-emerald-50/40 transition-colors">
                    <td className="py-3 px-4 text-slate-400">{idx + 1}</td>
                    <td className="py-3 px-4 font-sans font-bold text-slate-900">
                      {u.username}
                      {u.name && <div className="text-[10px] text-slate-500 font-normal font-sans">{u.name}</div>}
                    </td>
                    <td className="py-3 px-4 font-sans text-emerald-800 font-bold">{u.jobsite}</td>
                    <td className="py-3 px-4 font-sans">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                          u.role === 'ho'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : u.role === 'developer'
                            ? 'bg-sky-50 text-sky-700 border border-sky-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {u.role === 'ho' ? 'HO Super Admin' : u.role === 'developer' ? 'Developer' : 'Jobsite User'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-700">
                          {isShowing ? u.password : '••••••••'}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleShowPassword(u.username)}
                          className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                        >
                          {isShowing ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-slate-500" />}
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-sans whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenPasswordModal(u)}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                          title="Ganti Password"
                        >
                          <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Ganti Password</span>
                        </button>

                        {!isProtected && (
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(u)}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 transition-colors cursor-pointer"
                            title="Hapus Akun User"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Change Password */}
      {selectedUserForPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-[#0B4D3B] rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Ganti Password Akun</h3>
              </div>
              <button
                onClick={() => setSelectedUserForPassword(null)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Ubah password login untuk akun <b className="text-emerald-400">{selectedUserForPassword.username}</b> ({selectedUserForPassword.jobsite}).
            </p>

            <form onSubmit={handleSavePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Password Baru
                </label>
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Masukkan password baru"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm font-mono text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedUserForPassword(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  Simpan Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add User */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-[#0B4D3B] rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Tambah Username / Akun Baru</h3>
              </div>
              <button
                onClick={() => setIsAddUserOpen(false)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddUserSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Username (Contoh: "IPF - Tabang" / "Site Baru")
                </label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="Masukkan username unik"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Password
                </label>
                <input
                  type="text"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  placeholder="Masukkan password akun"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Jobsite Terikat
                  </label>
                  <input
                    type="text"
                    value={newUserJobsite}
                    onChange={(e) => setNewUserJobsite(e.target.value)}
                    placeholder="Nama Jobsite"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Hak Akses / Peran
                  </label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as 'user' | 'ho')}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  >
                    <option value="user">User Jobsite Reguler</option>
                    <option value="ho">HO Super Admin (Akses Semua Site)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Keterangan Nama PIC / Tim
                </label>
                <input
                  type="text"
                  value={newUserNameDesc}
                  onChange={(e) => setNewUserNameDesc(e.target.value)}
                  placeholder="Contoh: ESF Team Jobsite..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  Daftarkan Akun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
