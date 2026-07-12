import { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Sparkles, 
  Coins, 
  Lock, 
  Percent, 
  Calendar, 
  Clock, 
  Info,
  TrendingUp,
  Award,
  ChevronRight,
  AlertTriangle,
  Play,
  RotateCcw,
  CheckCircle2,
  Users,
  ShieldCheck,
  Zap,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Stake } from '../types';

interface StakingProps {
  user: User;
  onNavigate: (screen: string) => void;
  activeStake: Stake | null;
  onStartStaking: (amount: number, durationDays: number, dailyROI: number) => void;
}

interface StakingOption {
  days: number;
  roi: number; // e.g. 0.018 for 1.8%
  title: string;
  badge: string;
}

export default function Staking({
  user,
  onNavigate,
  activeStake,
  onStartStaking
}: StakingProps) {
  const [activeTab, setActiveTab] = useState<'quant' | 'pools' | 'about'>('quant');
  const [stakeAmount, setStakeAmount] = useState<string>('500');
  const [selectedOption, setSelectedOption] = useState<number>(3); // default 3 days
  const [countdownStr, setCountdownStr] = useState<string>('24:00:00');

  // Quant strategy simulator states
  const [quantBaseAmount, setQuantBaseAmount] = useState<number>(100);
  const [isQuantRunning, setIsQuantRunning] = useState<boolean>(false);
  const [quantStep, setQuantStep] = useState<number>(0); // 0 to 5
  const [quantLogs, setQuantLogs] = useState<string[]>([]);
  const [quantProgress, setQuantProgress] = useState<number>(0);
  const [quantEarnings, setQuantEarnings] = useState<number>(0);

  // Available Staking Plans - adjusted start from 500 USDT as requested
  const stakingOptions: StakingOption[] = [
    { days: 1, roi: 0.018, title: '1-Day Mortex Flash Pool', badge: 'Fast Release' },
    { days: 3, roi: 0.023, title: '3-Day Mortex Starter Pool', badge: 'Popular' },
    { days: 6, roi: 0.028, title: '6-Day Mortex Growth Pool', badge: 'Optimized' },
    { days: 10, roi: 0.035, title: '10-Day Mortex Elite Pool', badge: 'High Yield' },
    { days: 30, roi: 0.048, title: '30-Day Mortex Master Pool', badge: 'Max Multiplier' }
  ];

  const activeOption = stakingOptions.find(o => o.days === selectedOption) || stakingOptions[1];

  // Next payout 24-hour mock clock
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const next = new Date(now);
      next.setHours(24, 0, 0, 0); 
      const diff = Math.max(0, Math.floor((next.getTime() - now.getTime()) / 1000));
      
      const hrs = Math.floor(diff / 3600).toString().padStart(2, '0');
      const mins = Math.floor((diff % 3600) / 60).toString().padStart(2, '0');
      const secs = (diff % 60).toString().padStart(2, '0');
      setCountdownStr(`${hrs}:${mins}:${secs}`);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleQuickSelect = (amt: number) => {
    setStakeAmount(amt.toString());
  };

  const handleStakeSubmit = () => {
    const amt = parseFloat(stakeAmount);
    if (isNaN(amt) || amt < 500) return;
    onStartStaking(amt, activeOption.days, activeOption.roi);
    setStakeAmount('500');
  };

  // Run Five-Step Quantitative Trading
  const handleStartQuantTrade = () => {
    if (user.mainBalance < quantBaseAmount) {
      alert(`Insufficient balance to start trade. Required: ${quantBaseAmount} USDT.`);
      return;
    }
    setIsQuantRunning(true);
    setQuantStep(1);
    setQuantProgress(10);
    setQuantEarnings(0);
    setQuantLogs([`Initializing Five-Step Quantitative Trade with ${quantBaseAmount} USDT...`]);
  };

  // Five-Step quantitative animation sequence simulation
  useEffect(() => {
    if (!isQuantRunning) return;
    let timer: NodeJS.Timeout;

    const stepInfo = [
      { step: 1, pct: 1, desc: "Step 1: Allocating 1% of funds to BTC/USDT smart swap..." },
      { step: 2, pct: 3, desc: "Step 2: Placing 3% hedging order in ETH/USDT options..." },
      { step: 3, pct: 9, desc: "Step 3: Executing 9% arbitrage swap across tier-1 orderbooks..." },
      { step: 4, pct: 27, desc: "Step 4: Executing 27% leverage scalp long on Solana..." },
      { step: 5, pct: 60, desc: "Step 5: ALL IN 60% final settlement hedging locked..." }
    ];

    const runSequence = (idx: number) => {
      if (idx >= stepInfo.length) {
        // Complete the process
        timer = setTimeout(() => {
          const profitGained = quantBaseAmount * 0.035; // 3.5% yield profit
          setQuantStep(6);
          setQuantProgress(100);
          setQuantEarnings(profitGained);
          setQuantLogs(prev => [
            ...prev,
            `✓ Step 5 Complete: All positions settled in Mortex pool.`,
            `🎉 Quantitative trade successfully completed! Total profit gained: +${profitGained.toFixed(2)} USDT.`,
            `Rewards auto-credited to your profit balance.`
          ]);
          
          // Actually credit to current user (stored client-side)
          const session = localStorage.getItem('futuregrotex_current_user');
          if (session) {
            const u = JSON.parse(session) as User;
            u.mainBalance += profitGained;
            u.profitBalance += profitGained;
            u.totalVolume += quantBaseAmount; // Counts towards cumulative volume
            localStorage.setItem('futuregrotex_current_user', JSON.stringify(u));
            // Update users list as well
            const listStr = localStorage.getItem('futuregrotex_users') || '[]';
            const list = JSON.parse(listStr) as User[];
            const uIdx = list.findIndex(item => item.uid === u.uid);
            if (uIdx !== -1) {
              list[uIdx] = u;
              localStorage.setItem('futuregrotex_users', JSON.stringify(list));
            }
          }
        }, 2000);
        return;
      }

      const cur = stepInfo[idx];
      timer = setTimeout(() => {
        setQuantStep(cur.step);
        setQuantProgress(cur.step * 18);
        const allocAmt = (quantBaseAmount * (cur.pct / 100)).toFixed(2);
        const winProfit = (quantBaseAmount * (cur.pct / 100) * 0.06).toFixed(2); // Simulated sub-profit
        setQuantLogs(prev => [
          ...prev,
          `⚡ ${cur.desc}`,
          `↳ Allocation: ${allocAmt} USDT deployed. Closed position: +${winProfit} USDT profit.`
        ]);
        runSequence(idx + 1);
      }, 3000); // 3 seconds per phase
    };

    runSequence(0);

    return () => clearTimeout(timer);
  }, [isQuantRunning, quantBaseAmount]);

  // Calculating dates and progress for locked staking
  let progressPercent = 0;
  let timeRemainingStr = '';
  let formattedUnlockDate = '-';
  let activeDurationDays = 15;

  if (activeStake) {
    const start = new Date(activeStake.startDate).getTime();
    const end = new Date(activeStake.endDate).getTime();
    const now = new Date().getTime();
    
    const totalDuration = end - start;
    const elapsed = now - start;
    progressPercent = Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100)));
    
    const msLeft = end - now;
    if (msLeft > 0) {
      const minsLeft = Math.ceil(msLeft / (1000 * 60));
      if (minsLeft <= 60) {
        timeRemainingStr = `${minsLeft} simulated days left`;
      } else {
        const daysLeft = Math.max(1, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));
        timeRemainingStr = `${daysLeft} days left`;
      }
    } else {
      timeRemainingStr = 'Ready to unlock';
    }

    formattedUnlockDate = new Date(activeStake.endDate).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }) + ' (Fast release)';

    activeDurationDays = Math.round((end - start) / (60 * 1000));
    if (activeDurationDays <= 0) activeDurationDays = 1;
  }

  const projectedDailyROI = stakeAmount 
    ? (parseFloat(stakeAmount) * activeOption.roi).toFixed(2) 
    : '0.00';

  const totalExpectedReturn = stakeAmount
    ? (parseFloat(stakeAmount) * activeOption.roi * activeOption.days).toFixed(2)
    : '0.00';

  // Quantitative phases table data from Image 2
  const quantAllocationTable = [
    { label: 'Phase 1', pct: 1, amt100: 1.00, amt300: 3.00, amt500: 5.00, amt1000: 10.00, amt3000: 30.00, amt5000: 50.00 },
    { label: 'Phase 2', pct: 3, amt100: 3.00, amt300: 9.00, amt500: 15.00, amt1000: 30.00, amt3000: 90.00, amt5000: 150.00 },
    { label: 'Phase 3', pct: 9, amt100: 9.00, amt300: 27.00, amt500: 45.00, amt1000: 90.00, amt3000: 270.00, amt5000: 450.00 },
    { label: 'Phase 4', pct: 27, amt100: 27.00, amt300: 81.00, amt500: 135.00, amt1000: 270.00, amt3000: 810.00, amt5000: 1350.00 },
    { label: 'Phase 5', pct: 60, amt100: 60.00, amt300: 180.00, amt500: 300.00, amt1000: 600.00, amt3000: 1800.00, amt5000: 3000.00 }
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
          <h2 className="text-sm font-bold text-white tracking-wide uppercase">Mortex Quantitative Hub</h2>
          <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider font-mono">Consortium Staking &amp; Capital Allocation</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-zinc-950 rounded-xl border border-zinc-900">
        <button
          onClick={() => setActiveTab('quant')}
          className={`flex-1 py-2.5 text-[10px] font-bold uppercase tracking-wider font-mono rounded-lg transition-all ${
            activeTab === 'quant'
              ? 'bg-zinc-900 text-cyan-400 border border-zinc-800 shadow-sm'
              : 'text-zinc-500 hover:text-zinc-350'
          }`}
        >
          Five-Step Quant Trade
        </button>
        <button
          onClick={() => setActiveTab('pools')}
          className={`flex-1 py-2.5 text-[10px] font-bold uppercase tracking-wider font-mono rounded-lg transition-all ${
            activeTab === 'pools'
              ? 'bg-zinc-900 text-cyan-400 border border-zinc-800 shadow-sm'
              : 'text-zinc-500 hover:text-zinc-350'
          }`}
        >
          USDT Lock Pools
        </button>
        <button
          onClick={() => setActiveTab('about')}
          className={`flex-1 py-2.5 text-[10px] font-bold uppercase tracking-wider font-mono rounded-lg transition-all ${
            activeTab === 'about'
              ? 'bg-zinc-900 text-cyan-400 border border-zinc-800 shadow-sm'
              : 'text-zinc-500 hover:text-zinc-350'
          }`}
        >
          Consortium Profile
        </button>
      </div>

      {activeTab === 'quant' && (
        <div className="space-y-5">
          {/* Five Step quantitative main panel */}
          <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-850 rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
              <Zap size={130} className="text-cyan-400" />
            </div>

            <div className="flex items-center gap-3.5 mb-5">
              <div className="w-11 h-11 bg-cyan-500/10 border border-cyan-500/20 rounded-xl flex items-center justify-center text-cyan-400 shadow-inner">
                <TrendingUp size={20} />
              </div>
              <div>
                <h3 className="font-bold text-xs text-white uppercase font-mono tracking-wider">
                  Mortex Five-Stage Strategy
                </h3>
                <p className="text-[9px] text-zinc-500 mt-0.5 font-mono">Dynamic multi-stage capital compounding</p>
              </div>
            </div>

            {isQuantRunning ? (
              // Active trade animation center
              <div className="space-y-4 py-2">
                <div className="flex justify-between items-center text-[10px] font-mono uppercase">
                  <span className="text-zinc-400 font-bold">Progress Allocation</span>
                  <span className="text-cyan-400 font-black">{quantProgress}%</span>
                </div>

                <div className="h-2 bg-zinc-950 border border-zinc-850 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full"
                    style={{ width: `${quantProgress}%` }}
                    transition={{ ease: 'easeOut', duration: 0.5 }}
                  />
                </div>

                {/* Animated Steps visual */}
                <div className="grid grid-cols-5 gap-1.5 text-center text-[8px] font-mono font-bold uppercase mt-2">
                  {[1, 2, 3, 4, 5].map(stepNum => (
                    <div 
                      key={stepNum} 
                      className={`p-1 border rounded-lg transition-all ${
                        quantStep === stepNum
                          ? 'border-cyan-400 bg-cyan-950/20 text-cyan-400 scale-[1.05]'
                          : quantStep > stepNum
                          ? 'border-emerald-500 bg-emerald-950/15 text-emerald-400'
                          : 'border-zinc-800 text-zinc-600'
                      }`}
                    >
                      Step {stepNum}
                    </div>
                  ))}
                </div>

                {/* Real-time event log terminal */}
                <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-3.5 h-36 overflow-y-auto text-[9px] font-mono text-zinc-400 space-y-1.5 scrollbar-thin">
                  {quantLogs.map((log, lidx) => (
                    <div key={lidx} className="leading-normal">
                      {log.startsWith('⚡') ? (
                        <span className="text-cyan-400">{log}</span>
                      ) : log.startsWith('🎉') || log.startsWith('✓') ? (
                        <span className="text-emerald-400">{log}</span>
                      ) : log.includes('Allocation') ? (
                        <span className="text-zinc-500 pl-3">{log}</span>
                      ) : (
                        <span>{log}</span>
                      )}
                    </div>
                  ))}
                </div>

                {quantStep === 6 && (
                  <button
                    onClick={() => setIsQuantRunning(false)}
                    className="w-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-850 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition font-mono flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw size={13} /> Settle &amp; Reset Desk
                  </button>
                )}
              </div>
            ) : (
              // Configuration and initiation
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block font-mono">Select Fund size to deploy</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[100, 300, 500, 1000, 3000, 5000].map(amt => {
                      const isSel = quantBaseAmount === amt;
                      return (
                        <div
                          key={amt}
                          onClick={() => setQuantBaseAmount(amt)}
                          className={`border rounded-xl p-3 text-center cursor-pointer transition ${
                            isSel
                              ? 'border-cyan-500 bg-cyan-950/20 text-cyan-400 font-bold font-mono'
                              : 'border-zinc-850 bg-zinc-950/40 hover:bg-zinc-900/40 text-zinc-500 font-mono'
                          }`}
                        >
                          <span className="text-xs block font-bold">{amt}</span>
                          <span className="text-[8px] block mt-0.5 uppercase tracking-wide">USDT</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Calculation Table matching Image 2 */}
                <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-850 font-mono space-y-2">
                  <div className="flex justify-between items-center text-[9px] font-bold uppercase border-b border-zinc-900 pb-2 text-zinc-500">
                    <span>Phase Allocation</span>
                    <span>Fund Portion</span>
                    <span>Target Trade Size</span>
                  </div>

                  <div className="space-y-1.5 text-[9px]">
                    {[
                      { step: 1, pct: 1 },
                      { step: 2, pct: 3 },
                      { step: 3, pct: 9 },
                      { step: 4, pct: 27 },
                      { step: 5, pct: 60 }
                    ].map(st => {
                      const deployAmt = (quantBaseAmount * (st.pct / 100)).toFixed(2);
                      return (
                        <div key={st.step} className="flex justify-between items-center py-0.5 text-zinc-400">
                          <span className="font-bold uppercase">Step {st.step}</span>
                          <span className="text-zinc-500">{st.pct}% of funds</span>
                          <span className="text-white font-bold">{deployAmt} USDT</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="border-t border-zinc-900 pt-2 flex justify-between items-center text-[10px] uppercase text-zinc-400">
                    <span>Expected Session Yield</span>
                    <span className="text-emerald-400 font-black">+3.5% ROI (+${(quantBaseAmount * 0.035).toFixed(2)} USDT)</span>
                  </div>
                </div>

                <button
                  onClick={handleStartQuantTrade}
                  disabled={user.mainBalance < quantBaseAmount}
                  className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-center transition duration-200 font-mono shadow ${
                    user.mainBalance < quantBaseAmount
                      ? 'bg-zinc-850 text-zinc-500 border border-zinc-900 cursor-not-allowed'
                      : 'bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-black'
                  }`}
                >
                  Start Five-Step Quantitative Trade
                </button>

                {user.mainBalance < quantBaseAmount && (
                  <p className="text-[8px] text-rose-400 font-semibold font-mono text-center uppercase tracking-wide">
                    ⚠️ Insufficient balance to start this strategy size. Please deposit or select smaller amount.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Reference guidelines table */}
          <div className="bg-zinc-900/40 border border-zinc-850 rounded-2xl p-4.5 space-y-3.5 shadow-sm">
            <h4 className="font-bold text-xs text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Award size={14} className="text-cyan-400" /> Capital Allocation reference table
            </h4>

            <div className="overflow-x-auto text-[9px] font-mono">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 uppercase font-bold">
                    <th className="py-2">Funds</th>
                    <th className="py-2 text-center">Step 1 (1%)</th>
                    <th className="py-2 text-center">Step 2 (3%)</th>
                    <th className="py-2 text-center">Step 3 (9%)</th>
                    <th className="py-2 text-center">Step 4 (27%)</th>
                    <th className="py-2 text-center">Step 5 (60%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900 text-zinc-300">
                  {quantAllocationTable.map((row, index) => (
                    <tr key={index} className="hover:bg-zinc-950/40">
                      <td className="py-2.5 font-bold text-white">{row.label} ({row.pct}%)</td>
                      <td className="py-2.5 text-center text-cyan-400">{row.amt100}</td>
                      <td className="py-2.5 text-center text-purple-400">{row.amt300}</td>
                      <td className="py-2.5 text-center text-emerald-400">{row.amt500}</td>
                      <td className="py-2.5 text-center text-amber-400">{row.amt1000}</td>
                      <td className="py-2.5 text-center text-white">{row.amt3000}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'pools' && (
        <div className="space-y-5">
          {/* Main Staking Card */}
          <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-850 rounded-2xl p-5 shadow-lg">
            {/* Header row */}
            <div className="flex items-center gap-3.5 mb-5">
              <div className="w-11 h-11 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center text-purple-400 shadow-inner">
                <Coins size={20} />
              </div>
              <div>
                <h3 className="font-bold text-xs text-white flex items-center gap-1.5 uppercase font-mono tracking-wider">
                  USDT Locked Staking
                  <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest animate-pulse">Online</span>
                </h3>
                <div className="flex items-center gap-3 mt-1.5 text-[9px] text-zinc-500 font-mono font-bold uppercase">
                  <span className="flex items-center gap-1"><Calendar size={10} className="text-purple-400" /> Multi-Period Locks</span>
                  <span className="flex items-center gap-1"><Percent size={10} className="text-emerald-400" /> Up to 4.8% Daily Profit</span>
                </div>
              </div>
            </div>

            {/* Active stats display (Only if user has active stakes) */}
            {activeStake && (
              <div className="space-y-4 border-b border-zinc-850 pb-5 mb-5">
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-zinc-950/80 p-3 rounded-xl border border-zinc-850 text-center">
                    <span className="text-[8px] text-zinc-500 font-bold uppercase flex items-center justify-center gap-1 font-mono">
                      Staked Amount
                    </span>
                    <p className="text-xs font-mono font-bold text-white mt-1 truncate">
                      {activeStake.amount.toFixed(2)} USDT
                    </p>
                  </div>

                  <div className="bg-zinc-950/80 p-3 rounded-xl border border-zinc-850 text-center">
                    <span className="text-[8px] text-zinc-500 font-bold uppercase flex items-center justify-center gap-1 font-mono">
                      Daily Yield
                    </span>
                    <p className="text-xs font-mono font-bold text-emerald-400 mt-1 truncate">
                      +{(activeStake.amount * activeStake.dailyROI).toFixed(2)} USDT
                    </p>
                  </div>

                  <div className="bg-zinc-950/80 p-3 rounded-xl border border-zinc-850 text-center">
                    <span className="text-[8px] text-zinc-500 font-bold uppercase flex items-center justify-center gap-1 font-mono">
                      Staking rate
                    </span>
                    <p className="text-xs font-mono font-bold text-purple-400 mt-1 truncate">
                      {(activeStake.dailyROI * 100).toFixed(1)}% Daily
                    </p>
                  </div>
                </div>

                {/* Locked progress bar */}
                <div className="space-y-2 bg-zinc-950/40 p-3 rounded-xl border border-zinc-850">
                  <div className="flex justify-between items-center text-[9px] font-bold text-zinc-500 uppercase tracking-wider font-mono">
                    <span>Staking Release Progress</span>
                    <span className="text-cyan-400">{progressPercent}% ({timeRemainingStr})</span>
                  </div>
                  <div className="h-2 bg-zinc-950 rounded-full border border-zinc-900 overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                  </div>
                  <div className="flex justify-between text-[8px] text-zinc-600 font-mono uppercase font-bold">
                    <span>Started</span>
                    <span>Unlocks: {formattedUnlockDate}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Staking Configuration Form */}
            {!activeStake ? (
              <div className="space-y-4.5">
                {/* Dynamic Duration Selection Cards */}
                <div className="space-y-2">
                  <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider font-mono">Select Staking Lock Period</label>
                  <div className="grid grid-cols-1 gap-2">
                    {stakingOptions.map(opt => {
                      const isSel = selectedOption === opt.days;
                      return (
                        <div
                          key={opt.days}
                          onClick={() => setSelectedOption(opt.days)}
                          className={`flex items-center justify-between border rounded-xl p-3 cursor-pointer transition duration-150 ${
                            isSel 
                              ? 'border-purple-500 bg-purple-950/15 text-white' 
                              : 'border-zinc-800 bg-zinc-950/40 hover:bg-zinc-900/40 text-zinc-400'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSel ? 'border-purple-400' : 'border-zinc-700'}`}>
                              {isSel && <div className="w-2 h-2 rounded-full bg-purple-400" />}
                            </div>
                            <div>
                              <span className="text-xs font-bold font-mono text-white block">{opt.title}</span>
                              <span className="text-[9px] text-zinc-500 font-mono block mt-0.5">{opt.days} Day Lock Period</span>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded font-mono">
                              {(opt.roi * 100).toFixed(1)}% Daily
                            </span>
                            <span className="text-[8px] text-zinc-500 block uppercase font-mono font-bold mt-1">{opt.badge}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Stake Amount Configure Box */}
                <div className="space-y-2 pt-1">
                  <div className="flex justify-between items-center text-[9px] font-bold text-zinc-500 uppercase tracking-wider font-mono">
                    <label>Amount to Stake</label>
                    <span>Min: 500 USDT</span>
                  </div>
                  
                  <div className="relative bg-zinc-950 rounded-xl px-4 py-3 border border-zinc-850 focus-within:border-purple-500 transition">
                    <div className="flex items-center gap-2.5">
                      <img src="https://assets.coingecko.com/coins/images/325/large/Tether.png" alt="USDT" className="w-5 h-5 rounded-full" />
                      <input 
                        id="stake-amount-input"
                        type="number" 
                        min="500"
                        value={stakeAmount}
                        onChange={(e) => setStakeAmount(e.target.value)}
                        className="w-full bg-transparent text-white font-bold text-sm outline-none border-none placeholder-zinc-800 font-mono focus:ring-0 p-0"
                        placeholder="Enter Amount"
                      />
                      <span className="text-[10px] text-zinc-500 font-bold uppercase font-mono">USDT</span>
                    </div>
                  </div>
                </div>

                {/* Quick selectors tailored starting from 500 USDT */}
                <div className="grid grid-cols-4 gap-1.5">
                  {[500, 1000, 2500, 5000].map(val => (
                    <button
                      key={val}
                      onClick={() => handleQuickSelect(val)}
                      className="bg-zinc-950 hover:bg-zinc-800 border border-zinc-850 text-zinc-300 rounded-lg py-1.5 text-[9px] font-bold font-mono transition"
                    >
                      {val} USDT
                    </button>
                  ))}
                </div>

                {/* Yield outcomes projection summary */}
                <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-850 font-mono space-y-2 shadow-inner">
                  <div className="flex justify-between items-center text-xs text-zinc-400">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold">Daily yield</span>
                    <span className="text-emerald-400 font-bold font-mono">+${projectedDailyROI} USDT / day</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-zinc-400 border-t border-zinc-900 pt-2">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold">Total Maturity Profit</span>
                    <span className="text-purple-400 font-bold font-mono">+${totalExpectedReturn} USDT</span>
                  </div>
                </div>

                {/* Error notifications */}
                {parseFloat(stakeAmount) > user.mainBalance ? (
                  <div className="bg-rose-500/10 border border-rose-500/25 text-rose-400 p-2.5 rounded-xl text-[10px] flex items-center gap-2 font-mono uppercase tracking-wider font-bold">
                    <AlertTriangle size={12} className="shrink-0" />
                    <span>Insufficient balance (${user.mainBalance.toFixed(2)} USDT)</span>
                  </div>
                ) : parseFloat(stakeAmount) < 500 ? (
                  <div className="bg-amber-500/10 border border-amber-500/25 text-amber-400 p-2.5 rounded-xl text-[10px] flex items-center gap-2 font-mono uppercase tracking-wider font-bold">
                    <AlertTriangle size={12} className="shrink-0" />
                    <span>Minimum stake is 500 USDT</span>
                  </div>
                ) : null}

                {/* Submit Trigger */}
                <button
                  id="confirm-stake-btn"
                  disabled={parseFloat(stakeAmount) < 500 || parseFloat(stakeAmount) > user.mainBalance}
                  onClick={handleStakeSubmit}
                  className={`w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider text-center transition duration-200 font-mono shadow ${
                    parseFloat(stakeAmount) < 500 || parseFloat(stakeAmount) > user.mainBalance
                      ? 'bg-zinc-800 text-zinc-500 border border-zinc-850 cursor-not-allowed'
                      : 'bg-purple-500 text-zinc-950 hover:bg-purple-400 font-black'
                  }`}
                >
                  Start Staking Now
                </button>
              </div>
            ) : (
              <div className="bg-emerald-500/5 border border-emerald-500/20 p-3.5 rounded-xl text-emerald-400 text-[10px] uppercase font-bold tracking-wider text-center font-mono leading-relaxed">
                🎉 active staking pool running. Payouts claim automatically.
              </div>
            )}
          </div>

          {/* Pool Metrics Information */}
          <div className="bg-zinc-900/40 border border-zinc-850 rounded-2xl p-4.5 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 border-b border-zinc-850 pb-3">
              <Award size={14} className="text-emerald-400" />
              <h4 className="font-bold text-xs text-white uppercase tracking-wider font-mono">Staking Statistics</h4>
            </div>

            <div className="space-y-3 text-[11px] font-bold text-zinc-400 uppercase font-mono">
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 flex items-center gap-1.5"><Coins size={12} /> Total Active Staked</span>
                <span className="text-white">${user.totalStaked.toFixed(2)} USDT</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-zinc-500 flex items-center gap-1.5"><Percent size={12} /> Active Profit Rate</span>
                <span className="text-emerald-400">{activeStake ? (activeStake.dailyROI * 100).toFixed(1) : (activeOption.roi * 100).toFixed(1)}% Daily</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-zinc-500 flex items-center gap-1.5"><Clock size={12} /> Daily Payout Countdown</span>
                <span className="text-amber-400 font-mono">{countdownStr}</span>
              </div>
            </div>

            <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-850/60 text-[9px] text-zinc-500 flex items-start gap-2.5 leading-relaxed font-mono uppercase font-bold">
              <Info size={12} className="text-cyan-400 shrink-0 mt-0.5" />
              <p>
                Staking locks USDT tokens safely in Mortex's high-liquidity smart yield contract. Earnings accrue and pay out to your balance instantly.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'about' && (
        <div className="space-y-5">
          {/* Consortium Profile Details */}
          <div className="bg-zinc-900/40 border border-zinc-850 rounded-2xl p-5 space-y-4 shadow-md text-xs leading-relaxed text-zinc-300">
            <div className="flex items-center gap-2.5 border-b border-zinc-850 pb-3.5">
              <BookOpen size={15} className="text-cyan-400" />
              <h3 className="font-bold text-xs text-white uppercase tracking-wider font-mono">Mortex Investment Profile</h3>
            </div>

            <p>
              Established in <strong className="text-white">2023</strong> and headquartered in the United Kingdom's financial district, the Mortex Investment Foundation operates as a premier decentralized assets syndicate. By integrating state-of-the-art quant signal orderbooks and high-speed multi-stage liquidity locks, Mortex has successfully catered to over <strong className="text-emerald-400">500,000 global investors</strong>.
            </p>

            <p>
              Under strict regulatory protocols, Mortex provides reliable, safe, and transparent capital mirroring workflows ensuring consistent payouts while protecting initial investment principles from core market turbulence.
            </p>
          </div>

          {/* Core Leadership Team Profile Cards */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 font-mono">Mortex Executive Leadership</h3>

            {/* Robert Vandermeer */}
            <div className="flex gap-4 bg-zinc-900/30 border border-zinc-850 rounded-2xl p-4 items-center">
              <div className="w-14 h-14 bg-gradient-to-tr from-cyan-500 to-indigo-500 rounded-2xl flex-shrink-0 flex items-center justify-center font-black text-zinc-950 text-lg shadow">
                RV
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-white text-xs font-mono">Robert Vandermeer</h4>
                  <span className="text-[8px] bg-cyan-500/10 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-500/20 font-bold uppercase tracking-wide font-mono">Founder</span>
                </div>
                <p className="text-[10px] text-zinc-400 leading-normal">Formulated the patented Mortex High-Speed Multistage Capital Lock strategy in 2022. Ex-head of Liquidity at London Swap Group.</p>
              </div>
            </div>

            {/* Alexander Shaw */}
            <div className="flex gap-4 bg-zinc-900/30 border border-zinc-850 rounded-2xl p-4 items-center">
              <div className="w-14 h-14 bg-gradient-to-tr from-purple-500 to-indigo-500 rounded-2xl flex-shrink-0 flex items-center justify-center font-black text-zinc-950 text-lg shadow">
                AS
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-white text-xs font-mono">Alexander Shaw</h4>
                  <span className="text-[8px] bg-purple-500/10 text-purple-400 px-1.5 py-0.5 rounded border border-purple-500/20 font-bold uppercase tracking-wide font-mono">CEO</span>
                </div>
                <p className="text-[10px] text-zinc-400 leading-normal">Oversees Mortex Exchange direct business units and multi-jurisdiction compliance centers. 12+ years in institutional custody.</p>
              </div>
            </div>

            {/* Emily Clark */}
            <div className="flex gap-4 bg-zinc-900/30 border border-zinc-850 rounded-2xl p-4 items-center">
              <div className="w-14 h-14 bg-gradient-to-tr from-amber-500 to-rose-500 rounded-2xl flex-shrink-0 flex items-center justify-center font-black text-zinc-950 text-lg shadow">
                EC
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-white text-xs font-mono">Emily Clark</h4>
                  <span className="text-[8px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/20 font-bold uppercase tracking-wide font-mono">CEO Assistant</span>
                </div>
                <p className="text-[10px] text-zinc-400 leading-normal">Directly manages global partner alliances, incentive programs (LV1-LV10 upgrades), and VIP member retention.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
