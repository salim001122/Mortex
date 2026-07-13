import { useState } from 'react';
import { 
  ArrowLeft, 
  Users, 
  Link, 
  Copy, 
  Gift, 
  BarChart3, 
  Check, 
  QrCode,
  Info,
  Award,
  ChevronRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'motion/react';
import { User } from '../types';

interface ReferralProps {
  user: User;
  onNavigate: (screen: string) => void;
  onCopySuccess: () => void;
}

export default function Referral({
  user,
  onNavigate,
  onCopySuccess
}: ReferralProps) {
  const [copied, setCopied] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'invite' | 'agent' | 'incentives'>('invite');

  // Generate real dynamic invitation links
  const referralLink = `${window.location.origin}/?ref=${user.referralCode || 'GTX'}`;
  
  // Real dynamic, instantly scannable QR Code using QR Server API
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&color=083344&bgcolor=ffffff&data=${encodeURIComponent(referralLink)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    onCopySuccess();
    setTimeout(() => setCopied(false), 2000);
  };

  const nextMilestone = 5;
  const progressPercent = Math.min(((user.teamCount || 0) / nextMilestone) * 100, 100);

  // Simulated active referrers lists
  const referredTeamList = [
    { name: 'Krypto_Whale88', date: 'Jul 10, 2026', profit: '25.00 USDT', active: true, level: 1 },
    { name: 'SatoshiMind', date: 'Jul 09, 2026', profit: '7.50 USDT', active: true, level: 1 },
    { name: 'AlphaTradeX', date: 'Jul 08, 2026', profit: '0.00 USDT', active: false, level: 1 }
  ];

  // Referral Deposit Rewards Table Data from Image 3
  const depositRewardsTable = [
    { deposit: 100, inviter: 5, member: 3 },
    { deposit: 300, inviter: 20, member: 10 },
    { deposit: 500, inviter: 30, member: 20 },
    { deposit: 1000, inviter: 70, member: 50 },
    { deposit: 3000, inviter: 240, member: 150 },
    { deposit: 5000, inviter: 450, member: 250 },
    { deposit: 10000, inviter: 900, member: 500 },
    { deposit: 20000, inviter: 1800, member: 1000 },
    { deposit: 50000, inviter: 4500, member: 2500 }
  ];

  // Agent promotional level table from Image 4
  const agentLevelsTable = [
    { lvl: 'LV1', members: '5', reward: '50', ratio: '0.5%' },
    { lvl: 'LV2', members: '30', reward: '100', ratio: '0.8%' },
    { lvl: 'LV3', members: '100', reward: '300', ratio: '1.2%' },
    { lvl: 'LV4', members: '300', reward: '1000', ratio: '1.5%' },
    { lvl: 'LV5', members: '600', reward: '2000', ratio: '1.8%' },
    { lvl: 'LV6', members: '1000', reward: '3500', ratio: '2.0%' },
    { lvl: 'LV7', members: '2000', reward: '6000', ratio: '2.5%' },
    { lvl: 'LV8', members: '4000', reward: '12000', ratio: '3.0%' },
    { lvl: 'LV9', members: '6000', reward: '18000', ratio: '4.0%' },
    { lvl: 'LV10', members: '10000', reward: '30000', ratio: '5.0%' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-5 px-4 pb-12"
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 bg-zinc-900/40 p-3 rounded-xl border border-zinc-900">
        <button 
          id="back-to-dashboard-btn"
          onClick={() => onNavigate('dashboard')} 
          className="text-zinc-400 hover:text-white transition p-1.5 hover:bg-zinc-800 rounded-lg"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="text-sm font-bold text-white tracking-wide uppercase">GTX Affiliate Center</h2>
          <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider font-mono">Incentive Levels &amp; Commissions</p>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex p-1 bg-zinc-950 rounded-xl border border-zinc-900">
        <button
          onClick={() => setActiveSubTab('invite')}
          className={`flex-1 py-2 text-[9px] font-bold uppercase tracking-wider font-mono rounded-lg transition-all ${
            activeSubTab === 'invite'
              ? 'bg-zinc-900 text-cyan-400 border border-zinc-800 shadow-sm'
              : 'text-zinc-500 hover:text-zinc-350'
          }`}
        >
          Invitation Desk
        </button>
        <button
          onClick={() => setActiveSubTab('incentives')}
          className={`flex-1 py-2 text-[9px] font-bold uppercase tracking-wider font-mono rounded-lg transition-all ${
            activeSubTab === 'incentives'
              ? 'bg-zinc-900 text-cyan-400 border border-zinc-800 shadow-sm'
              : 'text-zinc-500 hover:text-zinc-350'
          }`}
        >
          Deposit Rewards
        </button>
        <button
          onClick={() => setActiveSubTab('agent')}
          className={`flex-1 py-2 text-[9px] font-bold uppercase tracking-wider font-mono rounded-lg transition-all ${
            activeSubTab === 'agent'
              ? 'bg-zinc-900 text-cyan-400 border border-zinc-800 shadow-sm'
              : 'text-zinc-500 hover:text-zinc-350'
          }`}
        >
          Agent Levels
        </button>
      </div>

      {activeSubTab === 'invite' && (
        <div className="space-y-5">
          {/* Main Affiliate Promotional Card */}
          <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-850 rounded-2xl p-5 shadow-lg relative overflow-hidden">
            {/* Abstract design elements */}
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
              <Gift size={150} className="text-cyan-500" />
            </div>

            {/* Level Reward Header */}
            <div className="text-center mb-6 relative z-10">
              <div className="w-12 h-12 mx-auto mb-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl flex items-center justify-center text-cyan-400 shadow-inner">
                <Gift size={22} />
              </div>
              <h3 className="font-bold text-sm text-white tracking-wide uppercase font-mono">Claim Direct/Indirect Yields</h3>
              <p className="text-[10px] text-zinc-400 mt-1.5 font-mono leading-relaxed uppercase font-bold">
                Direct (L1): <span className="text-cyan-400 font-black">5% Profit</span> • Indirect (L2): <span className="text-purple-400 font-black">3% Profit</span>
              </p>
            </div>

            {/* Copy referral links */}
            <div className="space-y-2">
              <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider font-mono block">Your GTX Promotion Link</label>
              <div className="flex items-center gap-2.5 bg-zinc-950 border border-zinc-850 rounded-xl p-2 pl-3.5 shadow-inner">
                <Link size={14} className="text-cyan-400 shrink-0" />
                <span className="text-xs text-zinc-300 truncate font-mono select-all flex-1">
                  {referralLink}
                </span>
                <button
                  id="copy-invite-link-btn"
                  onClick={handleCopyLink}
                  className="bg-cyan-500 hover:bg-cyan-400 text-zinc-950 px-3.5 py-2 rounded-lg text-xs font-black transition flex items-center gap-1.5 shrink-0 uppercase tracking-wider font-mono shadow-md"
                >
                  {copied ? <Check size={11} className="stroke-[3]" /> : <Copy size={11} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            {/* REAL Live Generated dynamic QR Code */}
            <div className="my-6 flex flex-col items-center justify-center relative z-10">
              <div className="bg-white p-3 rounded-2xl border border-zinc-200 shadow-xl relative group">
                <img 
                  id="referral-qr-code-img"
                  src={qrCodeUrl} 
                  alt="Referral Invitation QR Code" 
                  className="w-28 h-28 object-contain transition duration-200 group-hover:scale-[1.02]"
                  referrerPolicy="no-referrer"
                />
              </div>
              <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider mt-3 flex items-center gap-1.5 font-mono">
                <QrCode size={11} className="text-cyan-400 animate-pulse" /> Scan QR to Join Your Network
              </p>
            </div>

            {/* Partner milestones */}
            <div className="mt-4 border-t border-zinc-850/60 pt-4">
              <div className="flex justify-between items-center text-[9px] text-zinc-500 font-bold uppercase mb-2 font-mono">
                <span>Direct Team progression</span>
                <span className="text-cyan-400">{user.teamCount || 0}/{nextMilestone} Directs</span>
              </div>
              
              <div className="h-2 bg-zinc-950 rounded-full border border-zinc-900 overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>

              {user.teamCount < nextMilestone ? (
                <p className="text-[9px] text-zinc-500 mt-2.5 font-mono uppercase font-bold">
                  Invite <span className="text-cyan-400 font-black">{nextMilestone - user.teamCount}</span> more active trader with deposit &gt;= 100 USDT to reach <span className="text-cyan-400 font-black">LV1 Agent</span>!
                </p>
              ) : (
                <p className="text-[9px] text-emerald-400 mt-2.5 font-mono uppercase font-bold">
                  🎉 Direct LV1 Agent status target reached! Elite rewards enabled.
                </p>
              )}
            </div>
          </div>

          {/* Network Stats Metrics Grid */}
          <div className="grid grid-cols-2 gap-3.5">
            <div className="bg-zinc-900/40 border border-zinc-850 rounded-2xl p-4 text-center shadow-sm">
              <p className="text-zinc-500 text-[8px] font-bold uppercase font-mono tracking-wider">Direct Invited</p>
              <p className="text-lg font-mono font-bold text-white mt-1">{user.teamCount || 0}</p>
              <p className="text-[9px] text-zinc-500 mt-1 font-mono uppercase font-bold">Level 1 Directs</p>
            </div>

            <div className="bg-zinc-900/40 border border-zinc-850 rounded-2xl p-4 text-center shadow-sm">
              <p className="text-zinc-500 text-[8px] font-bold uppercase font-mono tracking-wider">Total Commission</p>
              <p className="text-lg font-mono font-bold text-emerald-400 mt-1">
                ${(user.totalCommission || 0).toFixed(2)}
              </p>
              <p className="text-[9px] text-zinc-500 mt-1 font-mono uppercase font-bold">Accrued Profit</p>
            </div>
          </div>

          {/* Network Referred Team lists */}
          <div className="bg-zinc-900/40 border border-zinc-850 rounded-2xl p-4.5 space-y-3.5 shadow-sm">
            <h4 className="font-bold text-xs text-white uppercase tracking-wider font-mono">Network Sub-Members</h4>
            
            <div className="space-y-2.5">
              {referredTeamList.map((m, idx) => (
                <div key={idx} className="flex items-center justify-between bg-zinc-950/40 p-3 rounded-xl border border-zinc-850/50">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xs font-mono font-black text-white">
                      {m.name.charAt(0)}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block font-mono">{m.name}</span>
                      <span className="text-[8px] text-zinc-500 font-mono block mt-0.5">Joined: {m.date} • Level {m.level}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-emerald-400">+{m.profit}</span>
                    <span className={`block text-[7px] font-bold uppercase font-mono tracking-wider mt-0.5 ${m.active ? 'text-emerald-400' : 'text-zinc-500'}`}>
                      {m.active ? 'Active' : 'Offline'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'incentives' && (
        <div className="space-y-4">
          {/* New Member Deposit Rewards Table Card (from Image 3) */}
          <div className="bg-zinc-900/40 border border-zinc-850 rounded-2xl p-4 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
              <div className="flex items-center gap-2">
                <Gift size={14} className="text-cyan-400" />
                <h4 className="font-bold text-xs text-white uppercase tracking-wider font-mono">New Member Deposit Rewards</h4>
              </div>
              <span className="text-[8px] bg-zinc-950 px-2 py-0.5 rounded border border-zinc-850 text-emerald-400 font-bold font-mono">USDT</span>
            </div>

            <div className="overflow-x-auto text-[10px] font-mono">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 uppercase font-bold">
                    <th className="py-2">New Member 1st Deposit</th>
                    <th className="py-2 text-center">Inviter Reward</th>
                    <th className="py-2 text-center">New Member Reward</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900 text-zinc-300">
                  {depositRewardsTable.map((row, index) => (
                    <tr key={index} className="hover:bg-zinc-950/40">
                      <td className="py-2.5 font-bold text-white">{row.deposit} USDT</td>
                      <td className="py-2.5 text-center text-cyan-400">+{row.inviter} USDT</td>
                      <td className="py-2.5 text-center text-emerald-400">+{row.member} USDT</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Guidelines & Warnings */}
            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850/60 text-[9px] text-zinc-400 space-y-2 leading-relaxed font-sans">
              <p className="font-bold text-zinc-300 font-mono text-[10px] uppercase border-b border-zinc-900 pb-1.5 flex items-center gap-1">
                <Info size={11} className="text-cyan-400" /> Warm Reminders
              </p>
              <div className="flex items-start gap-1.5">
                <CheckCircle2 size={11} className="text-cyan-400 shrink-0 mt-0.5" />
                <p>New members must make a first deposit of at least 100 USDT to activate the rewards. Deposits under 100 USDT are ineligible for bonuses.</p>
              </div>
              <div className="flex items-start gap-1.5">
                <CheckCircle2 size={11} className="text-cyan-400 shrink-0 mt-0.5" />
                <p>Depositing 300 USDT or more rewards both parties with 1 additional exclusive Trading Signal possessing a premium quota ratio of 2%.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'agent' && (
        <div className="space-y-4">
          {/* Agent Promotional Reward levels Table (from Image 4) */}
          <div className="bg-zinc-900/40 border border-zinc-850 rounded-2xl p-4 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
              <div className="flex items-center gap-2">
                <Award size={14} className="text-cyan-400" />
                <h4 className="font-bold text-xs text-white uppercase tracking-wider font-mono">Agent Promotion Incentive Ladder</h4>
              </div>
              <span className="text-[8px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 font-bold font-mono">10 TIERS</span>
            </div>

            <div className="overflow-x-auto text-[10px] font-mono">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 uppercase font-bold">
                    <th className="py-2">Rank Level</th>
                    <th className="py-2 text-center">Team Size</th>
                    <th className="py-2 text-center">Cash Bonus</th>
                    <th className="py-2 text-center">Volume Dividend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900 text-zinc-300">
                  {agentLevelsTable.map((row, index) => (
                    <tr key={index} className="hover:bg-zinc-950/40">
                      <td className="py-2.5 font-black text-white">{row.lvl} Agent</td>
                      <td className="py-2.5 text-center text-zinc-400">{row.members}+ members</td>
                      <td className="py-2.5 text-center text-cyan-400 font-bold">+{row.reward} USDT</td>
                      <td className="py-2.5 text-center text-emerald-400 font-bold">{row.ratio}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Agent Guidelines & Terms */}
            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850/60 text-[9px] text-zinc-400 space-y-2 leading-relaxed font-sans">
              <p className="font-bold text-zinc-300 font-mono text-[10px] uppercase border-b border-zinc-900 pb-1.5 flex items-center gap-1">
                <Info size={11} className="text-cyan-400" /> Promotion Milestones
              </p>
              <div className="flex items-start gap-1.5">
                <CheckCircle2 size={11} className="text-cyan-400 shrink-0 mt-0.5" />
                <p>Direct Upgrade: Individually invite 5 direct team members with deposit &gt;= 100 USDT to immediately receive the 50 USDT promotion bonus.</p>
              </div>
              <div className="flex items-start gap-1.5">
                <CheckCircle2 size={11} className="text-cyan-400 shrink-0 mt-0.5" />
                <p>Dividends Distribution: Volume dividends are calculated and distributed three times each month on the 6th, 16th, and 26th.</p>
              </div>
              <div className="flex items-start gap-1.5">
                <CheckCircle2 size={11} className="text-cyan-400 shrink-0 mt-0.5" />
                <p>Birthday Reward: Active LV1 agents and above are eligible for a 100 USDT annual GTX Consortium allowance.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
