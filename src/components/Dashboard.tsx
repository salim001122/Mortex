import { useState, useEffect } from 'react';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  Bot, 
  Copy, 
  History, 
  Eye, 
  EyeOff, 
  Gift, 
  ChevronRight, 
  TrendingUp, 
  Users, 
  Percent,
  Clock,
  Wallet,
  Lock
} from 'lucide-react';
import { motion } from 'motion/react';
import { User, VIPRank, Transaction, TransactionStatus } from '../types';

function ActiveTradeTimer({ endTime }: { endTime?: string }) {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    if (!endTime) return;
    const endMs = new Date(endTime).getTime();
    const durationMs = 30 * 60 * 1000; // 30 minutes
    const startMs = endMs - durationMs;

    const updateTimer = () => {
      const now = Date.now();
      const remaining = endMs - now;
      if (remaining <= 0) {
        setTimeLeft(0);
        setProgress(100);
      } else {
        setTimeLeft(remaining);
        const elapsed = now - startMs;
        const percent = Math.min(100, Math.max(0, (elapsed / durationMs) * 100));
        setProgress(percent);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  if (!endTime) return null;

  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);

  if (timeLeft <= 0) {
    return (
      <div className="mt-3 text-[10px] font-bold text-emerald-400 font-mono flex items-center gap-1.5 bg-emerald-950/20 border border-emerald-900/30 px-2.5 py-1.5 rounded-lg">
        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
        Settle Pending...
      </div>
    );
  }

  return (
    <div className="space-y-2 mt-3 bg-zinc-950/40 border border-zinc-850/40 p-2.5 rounded-xl">
      <div className="flex justify-between items-center text-[10px] text-zinc-500 font-mono font-bold">
        <span className="flex items-center gap-1">
          <Clock size={11} className="text-amber-500 animate-spin" style={{ animationDuration: '6s' }} />
          Settle Countdown
        </span>
        <span className="text-amber-400 font-bold font-mono">{minutes}m {seconds}s left</span>
      </div>
      <div className="h-1 bg-zinc-950 rounded-full overflow-hidden border border-zinc-900">
        <div 
          className="h-full bg-gradient-to-r from-cyan-500 via-amber-500 to-emerald-500 rounded-full transition-all duration-1000"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

interface DashboardProps {
  user: User;
  onNavigate: (screen: string) => void;
  onDepositClick: () => void;
  onWithdrawClick: () => void;
  onClaimBonus: () => void;
  activeTrades: Transaction[];
  activeStakeAmount: number;
  onReleaseTrade: (txId: string, totpCode: string) => boolean | Promise<boolean>;
}

export default function Dashboard({
  user,
  onNavigate,
  onDepositClick,
  onWithdrawClick,
  onClaimBonus,
  activeTrades,
  activeStakeAmount,
  onReleaseTrade
}: DashboardProps) {
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [totpInputs, setTotpInputs] = useState<{[txId: string]: string}>({});
  const activeCopyAmount = activeTrades.reduce((sum, t) => sum + t.amount, 0);

  // Helper to format numbers nicely with $ and commas
  const formatBalance = (amount: number) => {
    return balanceVisible ? `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '••••••';
  };

  const volume = user.totalVolume;
  let progress = 0;
  let nextRankThreshold = 800;
  let nextRank = VIPRank.Silver;

  if (volume >= 20000) {
    progress = 100;
    nextRankThreshold = 20000;
    nextRank = VIPRank.Platinum;
  } else if (volume >= 5000) {
    progress = ((volume - 5000) / 15000) * 100;
    nextRankThreshold = 20000;
    nextRank = VIPRank.Platinum;
  } else if (volume >= 800) {
    progress = ((volume - 800) / 4200) * 100;
    nextRankThreshold = 5000;
    nextRank = VIPRank.Gold;
  } else {
    progress = (volume / 800) * 100;
    nextRankThreshold = 800;
    nextRank = VIPRank.Silver;
  }

  const isToday = (dateStr: string | null) => {
    if (!dateStr) return false;
    const today = new Date().toDateString();
    const lastClaim = new Date(dateStr).toDateString();
    return today === lastClaim;
  };

  const alreadyClaimed = isToday(user.lastBonusClaim);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-4 px-4 pb-12"
    >
      {/* 1. Main Balance Card (Sleek Redesigned Premium Card) */}
      <div className="bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 border border-zinc-800 rounded-2xl p-5 relative overflow-hidden shadow-2xl">
        {/* Decorative background light orb */}
        <div className="absolute -top-12 -right-12 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:14px_14px]" />

        <div className="flex justify-between items-start relative z-10 mb-4 pb-4 border-b border-zinc-850/60">
          <div>
            <p className="text-zinc-500 text-[10px] uppercase font-black tracking-widest flex items-center gap-1.5 font-mono">
              Net Capital Portfolio
              <img src="https://assets.coingecko.com/coins/images/325/large/Tether.png" alt="usdt" className="w-4 h-4 rounded-full shadow" />
            </p>
            
            <div className="flex items-center gap-2 mt-1">
              <span className="text-3xl font-mono font-black text-white tracking-tight">
                {formatBalance(user.mainBalance + user.profitBalance + activeCopyAmount)}
              </span>
              <button 
                onClick={() => setBalanceVisible(!balanceVisible)} 
                className="p-1 rounded-md hover:bg-zinc-850 transition text-zinc-400 hover:text-white outline-none"
              >
                {balanceVisible ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
            </div>
          </div>

          <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/25 text-[9px] font-bold px-2.5 py-1 rounded-lg tracking-wider font-mono uppercase flex items-center gap-1.5 shadow-xs">
            <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
            Secure System Active
          </span>
        </div>

        {/* Breakdown of balances with premium containers and icons */}
        <div className="grid grid-cols-2 gap-3 relative z-10">
          {/* Main Balance */}
          <div className="bg-zinc-950/40 p-3 rounded-xl border border-zinc-850/60 shadow-inner flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-[9px] text-zinc-500 font-bold uppercase tracking-wider font-mono">
              <Wallet size={11} className="text-cyan-400" />
              <span>Main Balance</span>
            </div>
            <p className="text-sm font-black font-mono text-white mt-1.5">
              {balanceVisible ? `$${user.mainBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '••••••'}
              <span className="text-[9px] text-zinc-500 font-normal ml-1">USDT</span>
            </p>
          </div>

          {/* Profit Balance */}
          <div className="bg-emerald-950/5 p-3 rounded-xl border border-emerald-900/10 shadow-inner flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-[9px] text-emerald-500/80 font-bold uppercase tracking-wider font-mono">
              <TrendingUp size={11} className="text-emerald-400" />
              <span>Profit Balance</span>
            </div>
            <p className="text-sm font-black font-mono text-emerald-400 mt-1.5">
              {balanceVisible ? `+$${user.profitBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '••••••'}
              <span className="text-[9px] text-emerald-600 font-normal ml-1">USDT</span>
            </p>
          </div>
        </div>

        {/* User Level and Progress */}
        <div className="mt-5 border-t border-zinc-850/60 pt-4 relative z-10">
          <div className="flex justify-between items-center text-[10px] text-zinc-500 mb-2 font-bold uppercase font-mono">
            <span className="text-cyan-400 flex items-center gap-1">
              VIP Tier: {user.tier}
            </span>
            <span>
              {user.tier === VIPRank.Platinum ? 'MAX RANK' : `Next Rank: ${nextRank} ($${nextRankThreshold})`}
            </span>
          </div>
          
          <div className="relative h-2 bg-zinc-950 rounded-full border border-zinc-900 overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>

          {user.tier !== VIPRank.Platinum && (
            <p className="text-[9px] text-zinc-500 mt-2 font-bold font-mono uppercase tracking-wider">
              Accumulate <span className="text-cyan-400">${Math.max(nextRankThreshold - volume, 0).toFixed(0)} USDT</span> volume to unlock {nextRank}!
            </p>
          )}
        </div>
      </div>

      {/* 2. Standard Quick Navigation Icons */}
      <div className="grid grid-cols-4 gap-1 bg-zinc-900/60 p-2 rounded-xl border border-zinc-800/80">
        <button 
          onClick={onDepositClick}
          className="flex flex-col items-center group py-1.5 hover:bg-zinc-800/40 rounded-lg transition"
        >
          <div className="w-10 h-10 rounded-lg bg-cyan-950/40 border border-cyan-800/60 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-900/50 transition">
            <ArrowDownLeft size={18} />
          </div>
          <span className="text-[10px] text-zinc-400 group-hover:text-cyan-400 font-semibold mt-1 transition">Deposit</span>
        </button>

        <button 
          onClick={onWithdrawClick}
          className="flex flex-col items-center group py-1.5 hover:bg-zinc-800/40 rounded-lg transition"
        >
          <div className="w-10 h-10 rounded-lg bg-emerald-950/40 border border-emerald-800/60 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-900/50 transition">
            <ArrowUpRight size={18} />
          </div>
          <span className="text-[10px] text-zinc-400 group-hover:text-emerald-400 font-semibold mt-1 transition">Withdraw</span>
        </button>

        <button 
          onClick={() => onNavigate('copyTrade')}
          className="flex flex-col items-center group py-1.5 hover:bg-zinc-800/40 rounded-lg transition"
        >
          <div className="w-10 h-10 rounded-lg bg-amber-950/40 border border-amber-800/60 flex items-center justify-center text-amber-400 group-hover:bg-amber-900/50 transition">
            <Copy size={18} />
          </div>
          <span className="text-[10px] text-zinc-400 group-hover:text-amber-400 font-semibold mt-1 transition">Copy</span>
        </button>

        <button 
          onClick={() => onNavigate('history')}
          className="flex flex-col items-center group py-1.5 hover:bg-zinc-800/40 rounded-lg transition"
        >
          <div className="w-10 h-10 rounded-lg bg-zinc-850 border border-zinc-700 flex items-center justify-center text-zinc-300 group-hover:bg-zinc-700 transition">
            <History size={18} />
          </div>
          <span className="text-[10px] text-zinc-400 group-hover:text-white font-semibold mt-1 transition">History</span>
        </button>
      </div>

      {/* 3. Account Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="coding-card rounded-xl p-4 flex flex-col justify-between">
          <div>
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">Trading Volume</p>
            <p className="font-mono font-bold text-lg text-white mt-1">
              {formatBalance(user.totalVolume)}
            </p>
          </div>
          <div className="mt-2.5 flex items-center gap-1 text-[10px] text-zinc-400 bg-zinc-950 px-2 py-1 rounded border border-zinc-800/60">
            <Percent size={10} className="text-cyan-400" />
            <span>Progress: {Math.min(progress, 100).toFixed(0)}%</span>
          </div>
        </div>

        <div className="coding-card rounded-xl p-4 flex flex-col justify-between">
          <div>
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">My Profits</p>
            <p className="font-mono font-bold text-lg text-emerald-400 mt-1">
              {formatBalance(user.profitBalance)}
            </p>
          </div>
          <div className="mt-2.5 flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/40 px-2 py-1 rounded border border-emerald-900/30">
            <TrendingUp size={10} />
            <span>Earned Profits</span>
          </div>
        </div>

        <div className="coding-card rounded-xl p-4 flex flex-col justify-between">
          <div>
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">Active Copies</p>
            <p className="font-mono font-bold text-lg text-amber-400 mt-1">
              {formatBalance(activeCopyAmount)}
            </p>
          </div>
          <div className="mt-2.5 flex items-center gap-1 text-[10px] text-amber-400 bg-amber-950/40 px-2 py-1 rounded border border-amber-900/30">
            <Copy size={10} />
            <span>{activeTrades.length} Trades Running</span>
          </div>
        </div>

        <div className="coding-card rounded-xl p-4 flex flex-col justify-between">
          <div>
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">Team Volume</p>
            <p className="font-mono font-bold text-lg text-cyan-400 mt-1">
              {formatBalance(user.teamVolume)}
            </p>
          </div>
          <div className="mt-2.5 flex items-center gap-1 text-[10px] text-cyan-400 bg-cyan-950/40 px-2 py-1 rounded border border-cyan-900/30">
            <Users size={10} />
            <span>{user.teamCount} Friends Invited</span>
          </div>
        </div>
      </div>

      {/* 4. Action Bars: Leaderboard & Daily Bonus */}
      <div className="flex flex-col gap-2.5">
        <button 
          onClick={() => onNavigate('leaderboard')}
          className="coding-card rounded-xl p-3.5 flex items-center justify-between hover:border-zinc-700 transition text-left cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800/60 flex items-center justify-center text-cyan-400 text-sm">
              🏆
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wide">Top Traders</h4>
              <p className="text-[10px] text-zinc-500 mt-0.5">See how professional traders perform</p>
            </div>
          </div>
          <ChevronRight size={14} className="text-zinc-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition" />
        </button>

        <button 
          onClick={onClaimBonus}
          disabled={alreadyClaimed}
          className={`coding-card rounded-xl p-3.5 flex items-center justify-between border transition text-left ${
            alreadyClaimed 
              ? 'opacity-55 cursor-not-allowed bg-zinc-900/40' 
              : 'hover:border-amber-500/40 cursor-pointer'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${alreadyClaimed ? 'bg-zinc-950 border border-zinc-800 text-zinc-600' : 'bg-amber-950 border border-amber-800 text-amber-400'}`}>
              <Gift size={15} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wide">Daily Bonus</h4>
              <p className="text-[10px] text-zinc-500 mt-0.5">
                {alreadyClaimed ? 'Come back tomorrow!' : 'Claim free daily bonus!'}
              </p>
            </div>
          </div>
          
          <span className={`text-[10px] font-bold px-3 py-1.5 rounded-lg uppercase transition-colors ${
            alreadyClaimed 
              ? 'bg-zinc-950 border border-zinc-800 text-zinc-500' 
              : 'bg-amber-500 text-zinc-950 font-bold hover:bg-amber-400'
          }`}>
            {alreadyClaimed ? 'Claimed' : 'Claim'}
          </span>
        </button>
      </div>

      {/* 5. Dynamic Active Positions Section */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Active Copy Trades
        </h3>

        <div className="space-y-2.5">
          {activeTrades.length === 0 ? (
            <div className="coding-card rounded-xl p-6 text-center shadow-md">
              <p className="text-xs text-zinc-500 font-medium">No active trades right now</p>
              <p className="text-[10px] text-zinc-600 mt-1">Start a copy trade signal or follow an elite copier to earn profit.</p>
            </div>
          ) : (
            <>
              {/* Copy Trading Positions */}
              {activeTrades.map(trade => {
                const isHold = trade.status === TransactionStatus.Hold;
                return (
                  <div key={trade.id} className={`rounded-xl p-4 border transition duration-200 ${
                    isHold 
                      ? 'bg-amber-950/10 border-amber-500/30 shadow-md' 
                      : 'bg-zinc-900/40 border-zinc-850'
                  }`}>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg border flex items-center justify-center font-bold font-mono text-sm ${
                          isHold 
                            ? 'bg-amber-950/40 border-amber-800 text-amber-400' 
                            : 'bg-zinc-850 border-zinc-700 text-cyan-400'
                        }`}>
                          {(trade.traderName || 'T').charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white font-mono">{trade.traderName}</span>
                            {isHold ? (
                              <span className="text-[8px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/20 font-bold font-mono uppercase tracking-wider animate-pulse flex items-center gap-1">
                                <Lock size={8} /> SECURE HOLD
                              </span>
                            ) : (
                              <span className="text-[8px] bg-yellow-500/10 text-yellow-400 px-2 py-0.5 rounded-full border border-yellow-500/20 font-bold font-mono uppercase tracking-wider animate-pulse">Running</span>
                            )}
                          </div>
                          <p className="text-[10px] text-zinc-500 mt-0.5 font-mono">Size: {trade.amount.toFixed(2)} USDT</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-emerald-400">
                          +${(trade.amount * 0.0219).toFixed(2)}
                        </span>
                        <p className="text-[9px] text-zinc-500 font-semibold mt-0.5">Est. Return</p>
                      </div>
                    </div>

                    {isHold ? (
                      <div className="mt-3.5 pt-3.5 border-t border-amber-500/10 space-y-2">
                        <p className="text-[9px] text-zinc-400 leading-normal font-mono">
                          ⚠️ <span className="text-amber-400 font-bold">2ND DAILY TRADE ESCROW HOLD:</span> Payout held in security review. Enter your 6-digit Google Authenticator code below to release.
                        </p>
                        
                        {!user.twoFactorEnabled ? (
                          <button
                            onClick={() => onNavigate('more')}
                            className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-[9px] font-black uppercase tracking-wider rounded-lg font-mono transition"
                          >
                            Enable 2FA to Release Funds
                          </button>
                        ) : (
                          <div className="flex gap-2 items-center mt-2">
                            <input 
                              type="text"
                              maxLength={6}
                              placeholder="000000"
                              value={totpInputs[trade.id] || ''}
                              onChange={(e) => setTotpInputs(prev => ({ ...prev, [trade.id]: e.target.value.replace(/\D/g, '') }))}
                              className="bg-zinc-950 border border-zinc-800 text-white rounded-lg px-2.5 py-1.5 text-center text-xs font-mono tracking-widest w-24 outline-none focus:border-amber-500 transition"
                            />
                            <button
                              onClick={() => {
                                const code = totpInputs[trade.id];
                                if (!code || code.length !== 6) {
                                  alert("Please enter a 6-digit 2FA code.");
                                  return;
                                }
                                const res = onReleaseTrade(trade.id, code);
                                if (res instanceof Promise) {
                                  res.then(success => {
                                    if (success) {
                                      setTotpInputs(prev => ({ ...prev, [trade.id]: '' }));
                                    }
                                  });
                                } else if (res) {
                                  setTotpInputs(prev => ({ ...prev, [trade.id]: '' }));
                                }
                              }}
                              className="flex-1 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-[9px] font-black uppercase tracking-wider rounded-lg font-mono transition py-2 text-center"
                            >
                              Verify & Release
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Countdown Timer */
                      <ActiveTradeTimer endTime={trade.endTime} />
                    )}
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
