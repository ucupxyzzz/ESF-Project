import React, { useState } from 'react';
import { StorageService } from '../services/storage';
import { User } from '../types';
import {
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  AlertCircle,
  ShieldCheck,
  Shield,
  LogIn,
  ClipboardCheck,
  TrendingUp,
  X,
  HelpCircle
} from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Harap masukkan username dan password.');
      return;
    }

    const authenticatedUser = StorageService.authenticate(username, password);
    if (authenticatedUser) {
      if (rememberMe) {
        localStorage.setItem('esf_remembered_username', username);
      } else {
        localStorage.removeItem('esf_remembered_username');
      }
      onLoginSuccess(authenticatedUser);
    } else {
      setError('Username atau password salah. Silakan periksa kembali!');
    }
  };

  return (
    <div className="min-h-screen bg-[#e8f6f0] flex flex-col justify-between items-center p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans">
      {/* Background Organic Curved Waves (Matching Reference Image) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Top-left waves */}
        <svg
          className="absolute -top-12 -left-16 w-[450px] sm:w-[650px] lg:w-[850px] h-auto opacity-90 transition-all"
          viewBox="0 0 700 500"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M-50 0C120 40 260 120 280 250C300 380 180 440 80 490L-50 500V0Z"
            fill="url(#grad-tl-1)"
          />
          <path
            d="M-50 0C80 80 190 140 210 270C230 400 120 450 -50 490V0Z"
            fill="url(#grad-tl-2)"
            fillOpacity="0.8"
          />
          <defs>
            <linearGradient id="grad-tl-1" x1="0" y1="0" x2="300" y2="400" gradientUnits="userSpaceOnUse">
              <stop stopColor="#34d399" stopOpacity="0.75" />
              <stop offset="1" stopColor="#059669" stopOpacity="0.85" />
            </linearGradient>
            <linearGradient id="grad-tl-2" x1="0" y1="0" x2="220" y2="450" gradientUnits="userSpaceOnUse">
              <stop stopColor="#10b981" />
              <stop offset="1" stopColor="#047857" />
            </linearGradient>
          </defs>
        </svg>

        {/* Right side undulating wave */}
        <svg
          className="absolute -right-20 top-0 bottom-0 h-full w-[400px] sm:w-[650px] lg:w-[800px] opacity-90"
          viewBox="0 0 650 900"
          preserveAspectRatio="none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M650 0V900C480 850 320 720 340 540C360 360 490 220 420 80C395 30 410 0 650 0Z"
            fill="url(#grad-r-1)"
          />
          <path
            d="M650 120V900C520 880 420 780 440 600C460 420 560 300 500 160L650 120Z"
            fill="url(#grad-r-2)"
            fillOpacity="0.85"
          />
          <defs>
            <linearGradient id="grad-r-1" x1="650" y1="100" x2="300" y2="800" gradientUnits="userSpaceOnUse">
              <stop stopColor="#6ee7b7" stopOpacity="0.8" />
              <stop offset="0.6" stopColor="#10b981" stopOpacity="0.85" />
              <stop offset="1" stopColor="#059669" stopOpacity="0.9" />
            </linearGradient>
            <linearGradient id="grad-r-2" x1="650" y1="200" x2="400" y2="750" gradientUnits="userSpaceOnUse">
              <stop stopColor="#34d399" />
              <stop offset="1" stopColor="#047857" />
            </linearGradient>
          </defs>
        </svg>

        {/* Bottom undulating wave */}
        <svg
          className="absolute -bottom-10 left-0 right-0 w-full h-[220px] opacity-75"
          viewBox="0 0 1440 260"
          preserveAspectRatio="none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0 160C240 220 480 240 720 180C960 120 1200 150 1440 220V260H0V160Z"
            fill="#a7f3d0"
            fillOpacity="0.5"
          />
          <path
            d="M0 200C320 260 640 250 960 200C1160 170 1320 190 1440 240V260H0V200Z"
            fill="#10b981"
            fillOpacity="0.35"
          />
        </svg>

        {/* Bottom-left Dot Grid (Matching Reference) */}
        <div className="absolute bottom-6 left-6 grid grid-cols-6 gap-2.5 opacity-60">
          {Array.from({ length: 30 }).map((_, idx) => (
            <div key={idx} className="w-1.5 h-1.5 rounded-full bg-emerald-700/60" />
          ))}
        </div>
      </div>

      {/* Spacer for vertical centering */}
      <div className="hidden sm:block flex-1 max-h-8" />

      {/* Main Container Card (Centered) */}
      <div className="relative z-10 w-full max-w-[1020px] bg-white rounded-[28px] sm:rounded-[36px] shadow-[0_20px_60px_-15px_rgba(6,78,59,0.12)] border border-emerald-100/80 p-6 sm:p-10 lg:p-12 my-auto transition-all">
        {/* Top-Right Badge: "Secure Login" */}
        <div className="flex justify-end mb-4 sm:mb-2">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50/90 border border-emerald-200/90 text-emerald-800 text-xs font-semibold shadow-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Secure Login</span>
          </div>
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Branding, Logo & 3 Feature Highlights */}
          <div className="lg:col-span-7 flex flex-col items-center text-center">
            {/* Circular Emblem Logo */}
            <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full flex items-center justify-center p-1 drop-shadow-md transition-transform hover:scale-105 duration-300">
              <img
                src="/assets/logo-tools-facility-trans.png"
                alt="ESF Tools & Facility Logo"
                className="w-full h-full object-contain"
              />
            </div>

            {/* Title: ESF MONITORING */}
            <h1 className="mt-4 text-3xl sm:text-4xl lg:text-[40px] font-black text-[#064E3B] tracking-tight uppercase">
              ESF MONITORING
            </h1>

            {/* Divider with System text */}
            <div className="flex items-center justify-center gap-3 my-2 w-full max-w-xs">
              <div className="h-[2px] flex-1 bg-emerald-600/80 rounded-full" />
              <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#064E3B]">
                SYSTEM
              </span>
              <div className="h-[2px] flex-1 bg-emerald-600/80 rounded-full" />
            </div>

            {/* Subtitle */}
            <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-md mx-auto mt-1 leading-relaxed">
              Kelola Equipment Support Facility dengan Efisien, Akurat dan Terorganisir
            </p>

            {/* 3 Feature Highlights Row (Manage, Monitor, Optimize) */}
            <div className="mt-8 grid grid-cols-3 gap-2.5 sm:gap-4 w-full max-w-lg">
              {/* Feature 1: Manage */}
              <div className="bg-slate-50/80 hover:bg-emerald-50/40 border border-slate-100 hover:border-emerald-200/60 rounded-2xl p-3 sm:p-3.5 flex flex-col items-center text-center transition-all">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-600 mb-2">
                  <ClipboardCheck className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-xs sm:text-sm text-slate-800">Manage</h4>
                <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 leading-snug">
                  Kelola data tools dengan mudah
                </p>
              </div>

              {/* Feature 2: Monitor */}
              <div className="bg-slate-50/80 hover:bg-emerald-50/40 border border-slate-100 hover:border-emerald-200/60 rounded-2xl p-3 sm:p-3.5 flex flex-col items-center text-center transition-all">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-600 mb-2">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-xs sm:text-sm text-slate-800">Monitor</h4>
                <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 leading-snug">
                  Pantau status dan kondisi tools
                </p>
              </div>

              {/* Feature 3: Optimize */}
              <div className="bg-slate-50/80 hover:bg-emerald-50/40 border border-slate-100 hover:border-emerald-200/60 rounded-2xl p-3 sm:p-3.5 flex flex-col items-center text-center transition-all">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-600 mb-2">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-xs sm:text-sm text-slate-800">Optimize</h4>
                <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 leading-snug">
                  Optimalkan penggunaan tools
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Nested Login Form Box */}
          <div className="lg:col-span-5">
            <div className="border border-slate-200/90 rounded-2xl sm:rounded-3xl p-6 sm:p-8 bg-white shadow-xs">
              <div className="mb-6">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#064E3B] tracking-tight">
                  Login
                </h2>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  Masukkan username dan password Anda
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                {/* Username Input */}
                <div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Username"
                      className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      className="w-full pl-10 pr-11 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                      title={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password Row */}
                <div className="flex items-center justify-between pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-700 border-slate-300 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span className="text-xs text-slate-600 font-medium">Ingat saya</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline transition-colors cursor-pointer"
                  >
                    Lupa password?
                  </button>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full mt-3 py-3.5 px-4 rounded-xl bg-[#067A52] hover:bg-[#056845] active:scale-[0.99] text-white font-bold text-sm shadow-md shadow-emerald-900/15 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login</span>
                </button>
              </form>

              {/* Security Note Box */}
              <div className="mt-5 p-3 rounded-xl bg-emerald-50/80 border border-emerald-200/80 flex items-center gap-2.5 text-xs text-emerald-900">
                <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-medium text-[11px] sm:text-xs">
                  Sistem aman dan hanya untuk pengguna yang berwenang
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer for vertical centering */}
      <div className="hidden sm:block flex-1 max-h-8" />

      {/* Bottom Footer Notice */}
      <footer className="relative z-10 text-center py-3 text-[11px] sm:text-xs text-[#064E3B]/70 font-medium">
        &copy; 2026 PT KARUNIA &bull; ESF Monitoring System
      </footer>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-emerald-100">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                <HelpCircle className="w-5 h-5" />
              </div>
              <button
                onClick={() => setShowForgotModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <h3 className="text-lg font-bold text-slate-800 mt-4">
              Lupa Password Akun?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              Untuk menjaga keamanan data operasional Equipment Support Facility, reset password
              dilakukan secara tersentralisasi.
            </p>
            <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 space-y-1.5">
              <p className="font-semibold text-emerald-800">Silakan hubungi:</p>
              <p>&bull; <strong>Administrator ESF HO Balikpapan</strong></p>
              <p>&bull; Atau kirim permintaan via Koordinator Jobsite masing-masing</p>
            </div>
            <button
              type="button"
              onClick={() => setShowForgotModal(false)}
              className="mt-5 w-full py-2.5 rounded-xl bg-[#067A52] hover:bg-[#056845] text-white font-bold text-xs sm:text-sm transition-all cursor-pointer"
            >
              Mengerti &amp; Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
