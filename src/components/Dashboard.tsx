import { useState } from 'react';
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
  Percent
} from 'lucide-react';
import { motion } from 'motion/react';
import { User, VIPRank, Transaction } from '../types';

interface DashboardProps {
  user: User;
  onNavigate: (screen: string) => void;
  onDepositClick: () => void;
  onWithdrawClick: () => void;
  onClaimBonus: () => void;
  activeTrades: Transaction[];
  activeStakeAmount: number;
}

export default function Dashboard({
  user,
  onNavigate,
  onDepositClick,
  onWithdrawClick,
  onClaimBonus,
  activeTrades,
  activeStakeAmount
}: DashboardProps) {
  const [balanceVisible, setBalanceVisible] = useState(true);

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
      {/* 1. Main Balance Card (Sleek Coding Card) */}
      <div className="coding-card rounded-xl p-5 relative overflow-hidden">
        {/* Subtle decorative grid background for coding theme */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:14px_14px]" />

        <div className="flex justify-between items-start relative z-10">
          <div>
            <p className="text-zinc-400 text-xs font-semibold tracking-wide flex items-center gap-1.5">
              Total Balance
              <img src="https://assets.coingecko.com/coins/images/325/large/Tether.png" alt="usdt" className="w-4 h-4 rounded-full" />
            </p>
            
            <div className="flex items-center gap-2 mt-1">
              <span className="text-3xl font-mono font-bold text-white tracking-tight">
                {formatBalance(user.mainBalance + user.profitBalance + user.totalStaked)}
              </span>
              <button 
                onClick={() => setBalanceVisible(!balanceVisible)} 
                className="p-1 rounded-md hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-white outline-none"
              >
                {balanceVisible ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
            </div>
          </div>

          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono px-2.5 py-1 rounded-md tracking-wider flex items-center gap-1">
            <TrendingUp size={10} /> +2.19% Yield
          </span>
        </div>

        {/* User Level and Progress */}
        <div className="mt-5 border-t border-zinc-800 pt-4 relative z-10">
          <div className="flex justify-between items-center text-xs text-zinc-400 mb-2 font-medium">
            <span className="text-cyan-400 font-bold flex items-center gap-1">
              Level: {user.tier}
            </span>
            <span className="font-mono text-[11px]">
              {user.tier === VIPRank.Platinum ? 'Max Level' : `Next: ${nextRank} ($${nextRankThreshold})`}
            </span>
          </div>
          
          <div className="relative h-2.5 bg-zinc-950 rounded-full border border-zinc-800 overflow-hidden">
            <motion.div 
              className="h-full bg-cyan-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>

          {user.tier !== VIPRank.Platinum && (
            <p className="text-[10px] text-zinc-500 mt-2 font-medium">
              Trade <span className="text-cyan-400 font-mono font-bold">${Math.max(nextRankThreshold - volume, 0).toFixed(0)}</span> more to rank up!
            </p>
          )}
        </div>
      </div>

      {/* 2. Standard Quick Navigation Icons */}
      <div className="grid grid-cols-5 gap-1 bg-zinc-900/60 p-2 rounded-xl border border-zinc-800/80">
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
          onClick={() => onNavigate('stake')}
          className="flex flex-col items-center group py-1.5 hover:bg-zinc-800/40 rounded-lg transition"
        >
          <div className="w-10 h-10 rounded-lg bg-purple-950/40 border border-purple-800/60 flex items-center justify-center text-purple-400 group-hover:bg-purple-900/50 transition">
            <Bot size={18} />
          </div>
          <span className="text-[10px] text-zinc-400 group-hover:text-purple-400 font-semibold mt-1 transition">Staking</span>
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
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">Staked Amount</p>
            <p className="font-mono font-bold text-lg text-purple-400 mt-1">
              {formatBalance(user.totalStaked)}
            </p>
          </div>
          <div className="mt-2.5 flex items-center gap-1 text-[10px] text-purple-400 bg-purple-950/40 px-2 py-1 rounded border border-purple-900/30">
            <Bot size={10} />
            <span>Staking Active</span>
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
          Active Trades &amp; Staking
        </h3>

        <div className="space-y-2.5">
          {activeTrades.length === 0 && activeStakeAmount === 0 ? (
            <div className="coding-card rounded-xl p-6 text-center shadow-md">
              <p className="text-xs text-zinc-500 font-medium">No active positions right now</p>
              <p className="text-[10px] text-zinc-600 mt-1">Start a copy trade or staking pool to earn profit.</p>
            </div>
          ) : (
            <>
              {/* Copy Trading Positions */}
              {activeTrades.map(trade => (
                <div key={trade.id} className="coding-card rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-cyan-400 font-bold font-mono">
                        {trade.traderName?.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{trade.traderName}</span>
                          <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse" />
                          <span className="text-[9px] uppercase font-bold text-yellow-400 font-mono">Trading</span>
                        </div>
                        <p className="text-[10px] text-zinc-500 mt-0.5">Size: {trade.amount.toFixed(2)} USDT</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-emerald-400">
                        +${(trade.amount * 0.0219).toFixed(2)}
                      </span>
                      <p className="text-[9px] text-zinc-500 font-semibold mt-0.5">Est. Return</p>
                    </div>
                  </div>
                </div>
              ))}

              {/* AI Staking Positions */}
              {activeStakeAmount > 0 && (
                <div className="coding-card rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-purple-400">
                        <Bot size={14} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">USDT Staking</span>
                          <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" />
                          <span className="text-[9px] uppercase font-bold text-purple-400 font-mono">Yielding</span>
                        </div>
                        <p className="text-[10px] text-zinc-500 mt-0.5">Total locked: {activeStakeAmount.toFixed(2)} USDT</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-purple-400">
                        3.6% Daily
                      </span>
                      <p className="text-[9px] text-zinc-500 font-semibold mt-0.5">Daily ROI</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
