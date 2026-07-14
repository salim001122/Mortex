import { useState, useRef, ChangeEvent } from 'react';
import { 
  ArrowLeft, 
  ShieldCheck, 
  Lock, 
  Key, 
  UserCheck, 
  HelpCircle, 
  LogOut, 
  ChevronRight, 
  Globe, 
  UploadCloud, 
  QrCode,
  Calendar,
  Zap,
  TrendingUp,
  AlertTriangle,
  Award,
  Wallet,
  Cpu,
  Fingerprint,
  Copy,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User, VIPRank } from '../types';
import * as OTPAuth from 'otpauth';

interface ProfileProps {
  user: User;
  onNavigate: (screen: string) => void;
  onUpdateKYC: (fullName: string, idNumber: string, nationality: string, documentImage: string) => void;
  onUpdate2FA: (secret: string) => void;
  onUpdatePassword: (password: string) => void;
  onLogout: () => void;
  onShowSupport: () => void;
  onShowToast: (msg: string, type: 'success' | 'error' | 'warning' | 'info') => void;
  onUpdateAvatar?: (avatarUrl: string) => void;
}

const BEAUTIFUL_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&h=150&fit=crop&crop=face'
];

export default function Profile({
  user,
  onNavigate,
  onUpdateKYC,
  onUpdate2FA,
  onUpdatePassword,
  onLogout,
  onShowSupport,
  onShowToast,
  onUpdateAvatar
}: ProfileProps) {
  const [kycModalOpen, setKycModalOpen] = useState(false);
  const [twoFactorModalOpen, setTwoFactorModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  // KYC Inputs
  const [kycName, setKycName] = useState('');
  const [kycId, setKycId] = useState('');
  const [kycCountry, setKycCountry] = useState('');
  const [kycImageBase64, setKycImageBase64] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 2FA Inputs
  const [tempSecret, setTempSecret] = useState('');
  const [otpCodeInput, setOtpCodeInput] = useState('');

  // Password Inputs
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Copy helper
  const [copiedKey, setCopiedKey] = useState<'uid' | 'secret' | null>(null);

  const handleCopyText = (text: string, key: 'uid' | 'secret') => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      onShowToast('Copied to clipboard successfully!', 'success');
      setTimeout(() => {
        setCopiedKey(null);
      }, 2000);
    }
  };

  const avatarSeed = user.email || 'default';
  const avatarUrl = user.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(avatarSeed)}`;

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setKycImageBase64(ev.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleKYCSubmit = () => {
    if (!kycName || !kycId || !kycCountry || !kycImageBase64) {
      onShowToast('Please fill out all fields and upload an ID photo.', 'error');
      return;
    }
    onUpdateKYC(kycName, kycId, kycCountry, kycImageBase64);
    setKycModalOpen(false);
  };

  const handleOpen2FA = () => {
    if (user.twoFactorEnabled) {
      onShowToast('Google 2FA is already active on your profile.', 'warning');
      return;
    }
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let secret = '';
    for (let i = 0; i < 16; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setTempSecret(secret);
    setOtpCodeInput('');
    setTwoFactorModalOpen(true);
  };

  const handleVerify2FA = () => {
    if (!/^\d{6}$/.test(otpCodeInput)) {
      onShowToast('Verification code must be exactly 6 digits.', 'error');
      return;
    }

    try {
      // Create TOTP instance
      const totp = new OTPAuth.TOTP({
        issuer: 'GTX',
        label: user.email,
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        secret: tempSecret
      });

      // Validate token
      const delta = totp.validate({
        token: otpCodeInput,
        window: 2 // allow clock drift
      });

      if (delta === null) {
        onShowToast('Invalid authenticator code! Please try again.', 'error');
        return;
      }

      onUpdate2FA(tempSecret);
      setTwoFactorModalOpen(false);
      onShowToast('Two-Factor Authentication (2FA) successfully activated!', 'success');
    } catch (err) {
      console.error(err);
      onShowToast('An error occurred during 2FA synchronization.', 'error');
    }
  };

  const handlePasswordSubmit = () => {
    if (newPassword.length < 6) {
      onShowToast('Password must be at least 6 characters long.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      onShowToast('Passwords do not match.', 'error');
      return;
    }
    onUpdatePassword(newPassword);
    setPasswordModalOpen(false);
    setNewPassword('');
    setConfirmPassword('');
  };

  const kycStatusDisplay = {
    not_submitted: { text: 'Not Verified', color: 'text-zinc-500 bg-zinc-950 border-zinc-800' },
    pending: { text: 'Pending Review', color: 'text-amber-400 bg-amber-500/10 border-amber-500/25' },
    verified: { text: 'Verified', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25' }
  };

  const formattedJoinDate = user.createdAt 
    ? new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    : 'July 2026';

  // Card themes based on Tier Level
  const cardThemes = {
    Bronze: 'from-amber-850 via-zinc-900 to-zinc-950 border-amber-800/30 text-amber-300',
    Silver: 'from-slate-700 via-zinc-900 to-zinc-950 border-slate-600/30 text-slate-300',
    Gold: 'from-amber-600 via-amber-950 to-zinc-950 border-amber-500/30 text-amber-400',
    Platinum: 'from-cyan-800 via-indigo-950 to-zinc-950 border-cyan-500/30 text-cyan-400'
  };

  const currentTheme = cardThemes[user.tier] || cardThemes.Gold;

  const otpauthUrl = `otpauth://totp/GTX:${encodeURIComponent(user.username)}?secret=${tempSecret}&issuer=GTX`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&color=09090b&data=${encodeURIComponent(otpauthUrl)}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-5 px-4 pb-12 font-sans"
    >
      {/* Super Minimal Back Navigation */}
      <div className="flex items-center">
        <button 
          id="back-to-dashboard-btn"
          onClick={() => onNavigate('dashboard')} 
          className="text-zinc-400 hover:text-white transition py-1.5 px-3 hover:bg-zinc-900 rounded-xl border border-zinc-850/60 bg-zinc-950 flex items-center gap-2 text-xs font-bold font-mono uppercase tracking-wider"
        >
          <ArrowLeft size={14} className="text-cyan-400" />
          <span>Back</span>
        </button>
      </div>

      {/* Simplified, High-End Profile Card */}
      <div className="bg-gradient-to-b from-zinc-900/90 to-zinc-950 border border-zinc-850 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full border border-zinc-800 p-0.5 bg-zinc-950 shadow-md">
            <img src={avatarUrl} alt="User Avatar" className="w-full h-full rounded-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-white truncate">{user.username}</span>
              {user.kycStatus === 'verified' && (
                <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
              )}
              {user.tier !== VIPRank.Bronze && (
                <span className="inline-flex items-center gap-0.5 bg-gradient-to-r from-amber-400 to-yellow-500 text-zinc-950 text-[8px] font-extrabold px-1.5 py-0.5 rounded shadow-sm border border-yellow-300/50 uppercase tracking-widest animate-pulse">
                  👑 VIP
                </span>
              )}
            </div>
            <span className="text-xs text-zinc-400 truncate block mt-0.5">{user.email}</span>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/25 uppercase tracking-wider font-mono">
                {user.tier} Pass
              </span>
              <span className={`text-[9px] font-black px-2 py-0.5 rounded-md border uppercase tracking-wider font-mono ${kycStatusDisplay[user.kycStatus].color}`}>
                {kycStatusDisplay[user.kycStatus].text}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-zinc-850/60 pt-3.5 text-xs">
          <span className="text-zinc-500 font-bold uppercase tracking-wider font-mono text-[9px]">Member Since</span>
          <span className="text-zinc-300 font-bold font-mono uppercase">{formattedJoinDate}</span>
        </div>
      </div>



      {/* Premium Funds Card */}
      <div className="bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
        {/* Decorative background light orb */}
        <div className="absolute -top-12 -right-12 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl pointer-events-none" />
        
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Wallet size={12} className="text-cyan-400" />
              Accumulated Net Worth
            </span>
            <span className="text-2xl font-black text-white tracking-tight font-mono block mt-1">
              ${(user.mainBalance + user.profitBalance + user.totalStaked).toLocaleString(undefined, { minimumFractionDigits: 2 })} <span className="text-xs text-cyan-400 font-bold uppercase">USDT</span>
            </span>
          </div>

          <span className={`text-[8px] font-black px-2 py-1 rounded-md border uppercase tracking-wider font-mono ${user.twoFactorEnabled ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25' : 'bg-amber-500/10 text-amber-400 border-amber-500/25'}`}>
            {user.twoFactorEnabled ? '2FA SECURED' : 'UNSECURED'}
          </span>
        </div>

        {/* Detailed asset breakdown */}
        <div className="grid grid-cols-2 gap-3 mt-4 pt-3.5 border-t border-zinc-800/60 text-[10px] font-mono">
          <div className="bg-zinc-950/40 p-2.5 rounded-xl border border-zinc-850/60">
            <span className="text-zinc-500 block font-bold uppercase text-[8px] tracking-wider">Available Principal</span>
            <span className="text-white font-bold block mt-1 text-xs">${user.mainBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })} USDT</span>
          </div>
          <div className="bg-zinc-950/40 p-2.5 rounded-xl border border-zinc-850/60">
            <span className="text-zinc-500 block font-bold uppercase text-[8px] tracking-wider">Yield Earnings</span>
            <span className="text-emerald-400 font-bold block mt-1 text-xs">+${user.profitBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })} USDT</span>
          </div>
        </div>
      </div>

      {/* Simple Information Blocks */}
      <div className="grid grid-cols-2 gap-3.5">
        <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850/60 flex flex-col justify-between space-y-2">
          <span className="text-zinc-500 text-[9px] font-bold uppercase tracking-wider font-mono">UID / User ID</span>
          <div className="flex items-center justify-between gap-1 mt-1">
            <span className="text-xs font-bold text-white font-mono truncate">{user.uid.slice(0, 14).toUpperCase()}</span>
            <button 
              type="button"
              onClick={() => handleCopyText(user.uid, 'uid')}
              className="p-1 text-zinc-500 hover:text-cyan-400 transition"
              title="Copy UID"
            >
              {copiedKey === 'uid' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
            </button>
          </div>
        </div>

        <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850/60 flex flex-col justify-between space-y-2 font-mono">
          <span className="text-zinc-500 text-[9px] font-bold uppercase tracking-wider">System Node</span>
          <div className="flex items-center gap-1.5 mt-1 text-emerald-400 font-bold text-xs uppercase">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>GTX-GLOBAL</span>
          </div>
        </div>
      </div>

      {/* Settings Row Configurations */}
      <div className="space-y-3">
        <h3 className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 font-mono px-1">
          Account Operations
        </h3>

        <div className="bg-zinc-900/30 border border-zinc-850/80 rounded-2xl overflow-hidden divide-y divide-zinc-850/50 shadow-sm">
          {/* Two-Factor Auth Settings */}
          <div 
            id="setup-2fa-card-btn"
            onClick={handleOpen2FA}
            className="p-4 flex items-center justify-between hover:bg-zinc-900/40 cursor-pointer transition duration-150"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shadow-sm">
                <Key size={15} />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-white uppercase tracking-wide font-mono">Two-Factor Security</h4>
                <p className="text-[10px] text-zinc-500">Enable Google Authenticator for secure transactions</p>
              </div>
            </div>
            
            <div className="flex items-center gap-1.5">
              <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full border uppercase font-mono tracking-wider ${user.twoFactorEnabled ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-zinc-950 text-zinc-500 border-zinc-850'}`}>
                {user.twoFactorEnabled ? 'Active' : 'Not Set'}
              </span>
              <ChevronRight size={13} className="text-zinc-600" />
            </div>
          </div>

          {/* Change Account Password */}
          <div 
            id="change-password-card-btn"
            onClick={() => setPasswordModalOpen(true)}
            className="p-4 flex items-center justify-between hover:bg-zinc-900/40 cursor-pointer transition duration-150"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shadow-sm">
                <Lock size={15} />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-white uppercase tracking-wide font-mono">Set Password</h4>
                <p className="text-[10px] text-zinc-500">Update account credentials and keys</p>
              </div>
            </div>
            
            <ChevronRight size={13} className="text-zinc-600" />
          </div>

          {/* KYC ID Verification status */}
          <div 
            id="kyc-verification-card-btn"
            onClick={() => {
              if (user.kycStatus === 'not_submitted') {
                setKycModalOpen(true);
              } else {
                onShowToast(`Your identity verification status is currently: ${user.kycStatus.toUpperCase()}`, 'info');
              }
            }}
            className="p-4 flex items-center justify-between hover:bg-zinc-900/40 cursor-pointer transition duration-150"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-sm">
                <UserCheck size={15} />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-white uppercase tracking-wide font-mono">Verify Identity (KYC)</h4>
                <p className="text-[10px] text-zinc-500">Validate legal documentation to unlock limits</p>
              </div>
            </div>
            
            <div className="flex items-center gap-1.5">
              <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full border uppercase font-mono tracking-wider ${kycStatusDisplay[user.kycStatus].color}`}>
                {kycStatusDisplay[user.kycStatus].text}
              </span>
              <ChevronRight size={13} className="text-zinc-600" />
            </div>
          </div>
        </div>



        {/* Chat Support Action */}
        <button 
          id="profile-support-btn"
          onClick={onShowSupport}
          className="w-full bg-cyan-500/5 hover:bg-cyan-500/10 border border-cyan-500/20 rounded-2xl p-4 flex items-center justify-between cursor-pointer transition duration-200"
        >
          <div className="flex items-center gap-3.5 text-left">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shadow-sm">
              <HelpCircle size={15} />
            </div>
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wide font-mono block">Support Center</span>
              <p className="text-[10px] text-zinc-500 font-mono block">Chat with live 24/7 support agents</p>
            </div>
          </div>
          <ChevronRight size={13} className="text-cyan-400" />
        </button>

        {/* Logout Action */}
        <button 
          id="logout-btn"
          onClick={onLogout}
          className="w-full bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 flex items-center justify-between cursor-pointer transition duration-200"
        >
          <div className="flex items-center gap-3.5 text-left">
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shadow-sm">
              <LogOut size={15} />
            </div>
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-rose-400 uppercase tracking-wide font-mono block">Terminate Session</span>
              <p className="text-[10px] text-zinc-500 font-mono block">Sign out securely from this device</p>
            </div>
          </div>
          <ChevronRight size={13} className="text-rose-500" />
        </button>
      </div>

      {/* ================================== MODALS ================================== */}

      {/* 1. Password Update Modal */}
      <AnimatePresence>
        {passwordModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5.5 w-full max-w-sm shadow-2xl relative"
            >
              <div className="flex justify-between items-center mb-4 border-b border-zinc-800 pb-3">
                <div>
                  <h3 className="font-bold text-sm text-white font-mono">Set Password</h3>
                  <p className="text-[9px] text-cyan-400 font-mono uppercase font-bold mt-0.5">Secure Password Updates</p>
                </div>
                <button 
                  onClick={() => setPasswordModalOpen(false)} 
                  className="w-7 h-7 bg-zinc-950 hover:bg-zinc-800 rounded-lg text-zinc-400 flex items-center justify-center border border-zinc-850 transition text-xs font-bold font-mono"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 font-mono">
                <div className="space-y-1">
                  <label className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider block">New Security Password</label>
                  <input 
                    id="new-password-input"
                    type="password" 
                    placeholder="Minimum 6 characters" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider block">Confirm Password</label>
                  <input 
                    id="confirm-password-input"
                    type="password" 
                    placeholder="Repeat new password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button 
                    onClick={() => setPasswordModalOpen(false)} 
                    className="flex-1 bg-zinc-950 hover:bg-zinc-800 border border-zinc-850 text-zinc-400 font-bold py-2.5 rounded-xl text-xs transition uppercase"
                  >
                    Cancel
                  </button>
                  <button 
                    id="confirm-change-password-btn"
                    onClick={handlePasswordSubmit}
                    className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-black py-2.5 rounded-xl text-xs transition uppercase"
                  >
                    Set Password
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. KYC Modal */}
      <AnimatePresence>
        {kycModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5.5 w-full max-w-sm shadow-2xl my-8 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-4 border-b border-zinc-800 pb-3">
                <div>
                  <h3 className="font-bold text-sm text-white font-mono">Verify Identity</h3>
                  <p className="text-[9px] text-cyan-400 font-mono uppercase font-bold mt-0.5">National Identification Center</p>
                </div>
                <button 
                  onClick={() => setKycModalOpen(false)} 
                  className="w-7 h-7 bg-zinc-950 hover:bg-zinc-800 rounded-lg text-zinc-400 flex items-center justify-center border border-zinc-850 transition text-xs font-bold font-mono"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[8px] text-zinc-500 font-bold uppercase block tracking-wider font-mono">Full Legal Name</label>
                  <input 
                    id="kyc-name-input"
                    type="text" 
                    placeholder="As shown on passport or ID card" 
                    value={kycName}
                    onChange={(e) => setKycName(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-cyan-500 font-sans"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[8px] text-zinc-500 font-bold uppercase block tracking-wider font-mono">Document Number</label>
                  <input 
                    id="kyc-id-input"
                    type="text" 
                    placeholder="Passport / ID number details" 
                    value={kycId}
                    onChange={(e) => setKycId(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[8px] text-zinc-500 font-bold uppercase block tracking-wider font-mono">Nationality Country</label>
                  <div className="relative">
                    <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
                    <input 
                      id="kyc-country-input"
                      type="text" 
                      placeholder="Country of nationality" 
                      value={kycCountry}
                      onChange={(e) => setKycCountry(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none focus:border-cyan-500 font-sans"
                    />
                  </div>
                </div>

                {/* Upload documentation box */}
                <div className="space-y-1.5">
                  <label className="text-[8px] text-zinc-500 font-bold uppercase block tracking-wider font-mono">Upload Identification Image (JPG/PNG)</label>
                  <div 
                    id="upload-id-zone"
                    onClick={() => fileInputRef.current?.click()}
                    className="border border-dashed border-zinc-800 bg-zinc-950/60 rounded-xl p-4.5 flex flex-col items-center justify-center hover:bg-zinc-950 transition cursor-pointer text-center"
                  >
                    <UploadCloud size={24} className="text-cyan-400 mb-1.5" />
                    <span className="text-[11px] font-bold text-zinc-300">Choose Image File</span>
                    <span className="text-[8px] text-zinc-500 font-mono font-bold mt-0.5 uppercase">Supports PNG, JPG (Max 5MB)</span>
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Preview Thumbnail */}
                {kycImageBase64 && (
                  <div className="rounded-xl overflow-hidden border border-zinc-800 h-28 relative shadow-sm">
                     <img src={kycImageBase64} alt="ID Document Preview" className="w-full h-full object-cover" />
                     <div className="absolute top-2 left-2 bg-zinc-950/80 px-2 py-0.5 rounded text-[8px] font-bold text-cyan-400 uppercase tracking-wider border border-cyan-500/20 font-mono">
                      Document Preview
                    </div>
                  </div>
                )}

                <button 
                  id="submit-kyc-btn"
                  onClick={handleKYCSubmit}
                  className="w-full bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-black py-3 rounded-xl text-xs uppercase tracking-wider transition font-mono"
                >
                  Submit Identity Details
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. 2FA Configuration Modal with Real QR Code Generator */}
      <AnimatePresence>
        {twoFactorModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5.5 w-full max-w-sm shadow-2xl relative"
            >
              <div className="flex justify-between items-center mb-3 border-b border-zinc-800 pb-3">
                <div>
                  <h3 className="font-bold text-sm text-white font-mono">Two-Factor Setup</h3>
                  <p className="text-[9px] text-cyan-400 font-mono uppercase font-bold mt-0.5">Google Authenticator Sync</p>
                </div>
                <button 
                  onClick={() => setTwoFactorModalOpen(false)} 
                  className="w-7 h-7 bg-zinc-950 hover:bg-zinc-800 rounded-lg text-zinc-400 flex items-center justify-center border border-zinc-850 transition text-xs font-bold font-mono"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] text-zinc-500 leading-relaxed text-center font-sans font-bold uppercase tracking-wide">
                  Scan the Google Authenticator compatible QR Code below to protect your withdrawals.
                </p>

                {/* Real Visual QR Code Generator */}
                <div className="flex flex-col items-center justify-center bg-zinc-950 border border-zinc-850 p-5 rounded-2xl space-y-4">
                  <div className="bg-white p-3 rounded-xl shadow-lg border border-zinc-200/50">
                    <img 
                      src={qrCodeUrl} 
                      alt="Google Authenticator QR Code" 
                      className="w-36 h-36" 
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  
                  <div className="text-center space-y-1 w-full">
                    <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider block font-mono">Authenticator Key</span>
                    <div className="flex items-center justify-between gap-2 bg-zinc-900 border border-zinc-850 px-3 py-2 rounded-xl">
                      <span className="text-[10px] font-bold font-mono text-cyan-400 tracking-wider select-all truncate flex-1 text-left">
                        {tempSecret}
                      </span>
                      <button 
                        type="button"
                        onClick={() => handleCopyText(tempSecret, 'secret')}
                        className="text-zinc-400 hover:text-white transition p-1 shrink-0"
                        title="Copy Key"
                      >
                        {copiedKey === 'secret' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider block font-mono">6-Digit Verification Code</label>
                  <input 
                    id="otp-code-input"
                    type="text" 
                    placeholder="Enter 6-digit OTP" 
                    maxLength={6}
                    value={otpCodeInput}
                    onChange={(e) => setOtpCodeInput(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-4 py-2.5 text-center text-lg font-mono tracking-widest text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <button 
                  id="confirm-2fa-btn"
                  onClick={handleVerify2FA}
                  className="w-full bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-black py-3 rounded-xl text-xs uppercase tracking-wider transition font-mono shadow shadow-cyan-500/10"
                >
                  Synchronize &amp; Enable
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
