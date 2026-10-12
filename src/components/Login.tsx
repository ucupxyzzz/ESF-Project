import React, { useState } from 'react';
import { StorageService } from '../services/storage';
import { User } from '../types';
import { Lock, User as UserIcon, KeyRound, AlertCircle, ShieldCheck } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Harap masukkan username dan password.');
      return;
    }

    const authenticatedUser = StorageService.authenticate(username, password);
    if (authenticatedUser) {
      onLoginSuccess(authenticatedUser);
    } else {
      setError('Username atau password salah. Silakan periksa kembali!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#021A13] via-[#063D2E] to-[#0A4D3B] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background Decorative Ambient Glows */}
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Card */}
      <div className="relative w-full max-w-md bg-[#063D2E]/95 border border-[#0D523F] backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl shadow-emerald-950/60">
        {/* Header / Brand */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-400 to-emerald-200 flex items-center justify-center font-black text-[#063D2E] text-2xl shadow-xl shadow-emerald-950/40 mb-4 border border-emerald-300/30">
            ESF
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase">
            ESF Monitoring System
          </h1>
          <p className="text-xs text-emerald-200/75 mt-1 font-medium">
            Equipment Support Facility • Multi-Jobsite
          </p>
          <div className="mt-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#04281E] border border-emerald-500/20 text-[11px] text-emerald-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Dual-Channel Realtime Synchronization</span>
          </div>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-emerald-200 uppercase tracking-wider mb-2">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-300/60">
                <UserIcon className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username Anda"
                className="w-full pl-10 pr-4 py-2.5 bg-[#04281E]/90 border border-[#0D523F] rounded-xl text-white placeholder:text-emerald-300/40 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-emerald-200 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-300/60">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password Anda"
                className="w-full pl-10 pr-12 py-2.5 bg-[#04281E]/90 border border-[#0D523F] rounded-xl text-white placeholder:text-emerald-300/40 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 transition-all font-mono"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs text-emerald-300/70 hover:text-white transition-colors cursor-pointer"
              >
                {showPassword ? 'Sembunyi' : 'Lihat'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-[#04281E] font-black text-sm shadow-lg shadow-emerald-950/50 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <KeyRound className="w-4 h-4" />
            Masuk ke Sistem
          </button>
        </form>

        {/* Footer info */}
        <div className="mt-6 text-center text-[10px] text-emerald-300/50">
          ESF Monitoring System • Multi Jobsite &copy; 2025
        </div>
      </div>
    </div>
  );
};
