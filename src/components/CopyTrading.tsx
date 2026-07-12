import { useState, useEffect } from 'react';
import { 
  Copy, 
  TrendingUp, 
  Users, 
  ArrowLeft, 
  Sparkles, 
  ShieldCheck, 
  Hourglass, 
  Search,
  DollarSign,
  AlertTriangle,
  Clock,
  Award,
  BookOpen,
  CheckCircle2,
  Lock,
  Compass
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Trader, Transaction } from '../types';

interface CopyTradingProps {
  user: User;
  onNavigate: (screen: string) => void;
  traders: Trader[];
  activeTrades: Transaction[];
  onStartCopyTrade: (traderName: string, amount: number) => void;
}

export default function CopyTrading({
  user,
  onNavigate,
  traders,
  activeTrades,
  onStartCopyTrade
}: CopyTradingProps) {
  const [activeTab, setActiveTab] = useState<'signals' | 'traders'>('signals');
  const [selectedTrader, setSelectedTrader] = useState<Trader | null>(null);
  const [copyAmount, setCopyAmount] = useState<string>('100');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('');

  // Track the actual current signal execution rate in mock
  const [executingSignalId, setExecutingSignalId] = useState<string | null>(null);

  // Live countdown to UK signal times
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Format current UTC / UK time for Mortex platform display
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Europe/London',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      };
      setCurrentTimeStr(now.toLocaleTimeString('en-GB', options) + ' BST');
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleOpenCopyModal = (trader: Trader) => {
    setSelectedTrader(trader);
    setCopyAmount(Math.max(100, trader.minAmount).toString());
  };

  const handleCloseCopyModal = () => {
    setSelectedTrader(null);
  };

  const handleSubmitCopy = () => {
    if (!selectedTrader) return;
    const amt = parseFloat(copyAmount);
    if (isNaN(amt) || amt < selectedTrader.minAmount) return;
    onStartCopyTrade(selectedTrader.name, amt);
    handleCloseCopyModal();
  };

  // Signal execution
  const handleExecuteSignal = (signalName: string, ratio: number) => {
    if (user.mainBalance < 30) {
      alert("Accounts with a balance below 30 USDT cannot participate in Mortex signals.");
      return;
    }
    // Set executing loader
    setExecutingSignalId(signalName);
    setTimeout(() => {
      // Execute the signal as a copy trade with entire or a fixed portion of user balance
      const tradeAmt = user.mainBalance >= 100 ? user.mainBalance : 30; // Auto use max or min
      onStartCopyTrade(`Mortex ${signalName} (Ratio ${ratio}%)`, tradeAmt);
      setExecutingSignalId(null);
    }, 1500);
  };

  // Expected 30-sec profit output (2.19% for regular, or specific for custom traders)
  const projectedProfit = selectedTrader && copyAmount 
    ? (parseFloat(copyAmount) * (selectedTrader.roi30d / 100 * 0.015)).toFixed(2) 
    : '0.00';

  const limitReached = user.copyTradeCount >= 2;

  // Filtered traders list with Mortex copy limits
  const filteredTraders = traders.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-5 px-4 pb-12"
    >
      {/* Header section with back navigations */}
      <div className="flex justify-between items-center bg-zinc-900/40 p-3 rounded-xl border border-zinc-900">
        <div className="flex items-center gap-2.5">
          <button 
            id="back-to-dashboard-btn"
            onClick={() => onNavigate('dashboard')} 
            className="text-zinc-400 hover:text-white transition p-1.5 hover:bg-zinc-800 rounded-lg"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide uppercase">Mortex Trading Room</h2>
            <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider font-mono">Signal Mirror & copy center</p>
          </div>
        </div>
        
        <div className="bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-850 text-[10px] text-zinc-400 font-mono flex items-center gap-1.5 shadow-inner">
          <Clock size={11} className="text-cyan-400 animate-spin" style={{ animationDuration: '4s' }} />
          <span>{currentTimeStr || 'UK Clock'}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-zinc-950 rounded-xl border border-zinc-900">
        <button
          onClick={() => setActiveTab('signals')}
          className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider font-mono rounded-lg transition-all ${
            activeTab === 'signals'
              ? 'bg-zinc-900 text-cyan-400 border border-zinc-800 shadow-sm'
              : 'text-zinc-500 hover:text-zinc-350'
          }`}
        >
          Mortex Daily Signals
        </button>
        <button
          onClick={() => setActiveTab('traders')}
          className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider font-mono rounded-lg transition-all ${
            activeTab === 'traders'
              ? 'bg-zinc-900 text-cyan-400 border border-zinc-800 shadow-sm'
              : 'text-zinc-500 hover:text-zinc-350'
          }`}
        >
          Elite Copiers
        </button>
      </div>

      {activeTab === 'signals' && (
        <div className="space-y-5">
          {/* Official Mortex Project Information */}
          <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-850 rounded-2xl p-4.5 space-y-4 shadow-xl">
            <div className="flex items-center gap-2.5 border-b border-zinc-850/60 pb-3">
              <BookOpen size={15} className="text-cyan-400" />
              <h3 className="font-bold text-xs text-white uppercase tracking-wider font-mono">Mortex Exchange Project Guidelines</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-[10px] font-mono uppercase">
              <div className="bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-850/60">
                <span className="text-zinc-500 block">System Website</span>
                <span className="text-white font-bold block mt-0.5">MORTEX.COM</span>
              </div>
              <div className="bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-850/60">
                <span className="text-zinc-500 block">Platform Token</span>
                <span className="text-cyan-400 font-bold block mt-0.5">MORTEX (Mortex Token)</span>
              </div>
              <div className="bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-850/60">
                <span className="text-zinc-500 block">Min Active Deposit</span>
                <span className="text-emerald-400 font-bold block mt-0.5">100 USDT</span>
              </div>
              <div className="bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-850/60">
                <span className="text-zinc-500 block">Participation Min</span>
                <span className="text-white font-bold block mt-0.5">30 USDT Balance</span>
              </div>
            </div>

            <div className="space-y-2 text-[10px] text-zinc-400 leading-relaxed font-sans border-t border-zinc-850/60 pt-3">
              <div className="flex items-start gap-2">
                <CheckCircle2 size={12} className="text-cyan-400 shrink-0 mt-0.5" />
                <p><strong className="text-zinc-300">Daily Profit Yields:</strong> Standard daily signals yield <span className="text-emerald-400 font-mono font-bold">2.1% - 3.5%</span>. Net monthly yield surpasses <span className="text-emerald-400 font-mono font-bold">87% ROI</span>.</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 size={12} className="text-cyan-400 shrink-0 mt-0.5" />
                <p><strong className="text-zinc-300">Withdrawal Terms:</strong> Minimum withdrawal is <span className="text-white font-bold font-mono">10 USDT</span>. Settle fee: <span className="text-cyan-400 font-bold font-mono">5%</span> via TRC-20.</p>
              </div>
              <div className="flex items-start gap-2">
                <AlertTriangle size={12} className="text-amber-500 shrink-0 mt-0.5" />
                <p className="text-zinc-400"><strong className="text-amber-400">Trading Lock Rule:</strong> Accumulated trading volume must equal your principal deposit to withdraw freely. Early principal release incurs a <span className="text-rose-400 font-mono font-bold">20% fee</span>.</p>
              </div>
            </div>
          </div>

          {/* Live Active Signal Panels */}
          <div className="space-y-3.5">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 font-mono flex items-center justify-between">
              <span>Standard Daily Signals &amp; Schedule</span>
              <span className="bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20 text-[8px] animate-pulse">Live Feed</span>
            </h3>

            {/* Signal 1 */}
            <div className="bg-zinc-900/40 border border-zinc-850 rounded-2xl p-4 flex flex-col justify-between gap-3 relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-cyan-500 rounded-full animate-ping" />
                    <h4 className="font-bold text-xs text-white font-mono uppercase">Standard Signal #1</h4>
                  </div>
                  <p className="text-[9px] text-zinc-500 font-mono">UK Time: 12:30 • Profit margin per signal ~70%</p>
                </div>
                <div className="text-right">
                  <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[9px] font-bold px-2 py-0.5 rounded-full font-mono">1.0% RATIO</span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-1 pt-3 border-t border-zinc-850/40">
                <div className="text-[10px] text-zinc-400 font-mono">
                  <span>Requirement: </span>
                  <span className="text-white font-bold">&gt;= 30 USDT</span>
                </div>
                
                <button
                  onClick={() => handleExecuteSignal('Signal 1', 1.0)}
                  disabled={user.mainBalance < 30 || executingSignalId !== null}
                  className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase font-mono tracking-wider transition ${
                    user.mainBalance < 30
                      ? 'bg-zinc-950 text-zinc-600 border border-zinc-900 cursor-not-allowed'
                      : 'bg-cyan-500 hover:bg-cyan-400 text-zinc-950 shadow-md'
                  }`}
                >
                  {executingSignalId === 'Signal 1' ? 'Executing...' : 'Execute Signal'}
                </button>
              </div>
            </div>

            {/* Signal 2 */}
            <div className="bg-zinc-900/40 border border-zinc-850 rounded-2xl p-4 flex flex-col justify-between gap-3 relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-pulse" />
                    <h4 className="font-bold text-xs text-white font-mono uppercase">Standard Signal #2</h4>
                  </div>
                  <p className="text-[9px] text-zinc-500 font-mono">UK Time: 15:00 • Profit margin per signal ~70%</p>
                </div>
                <div className="text-right">
                  <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[9px] font-bold px-2 py-0.5 rounded-full font-mono">2.0% RATIO</span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-1 pt-3 border-t border-zinc-850/40">
                <div className="text-[10px] text-zinc-400 font-mono">
                  <span>Requirement: </span>
                  <span className="text-white font-bold">&gt;= 30 USDT</span>
                </div>
                
                <button
                  onClick={() => handleExecuteSignal('Signal 2', 2.0)}
                  disabled={user.mainBalance < 30 || executingSignalId !== null}
                  className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase font-mono tracking-wider transition ${
                    user.mainBalance < 30
                      ? 'bg-zinc-950 text-zinc-600 border border-zinc-900 cursor-not-allowed'
                      : 'bg-purple-500 hover:bg-purple-400 text-white shadow-md'
                  }`}
                >
                  {executingSignalId === 'Signal 2' ? 'Executing...' : 'Execute Signal'}
                </button>
              </div>
            </div>

            {/* Signal 3 (Bonus) */}
            <div className="bg-zinc-900/40 border border-zinc-850 rounded-2xl p-4 flex flex-col justify-between gap-3 relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Award size={14} className="text-amber-400 shrink-0" />
                    <h4 className="font-bold text-xs text-white font-mono uppercase">VIP Bonus Signal</h4>
                  </div>
                  <p className="text-[9px] text-zinc-500 font-mono">UK Time: 15:40 • Double quota yield limits</p>
                </div>
                <div className="text-right">
                  <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] font-bold px-2 py-0.5 rounded-full font-mono">2.0% RATIO</span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-1 pt-3 border-t border-zinc-850/40">
                <div className="text-[9px] text-zinc-500 font-mono max-w-[60%] lowercase">
                  Requires today's deposit of <span className="text-amber-400 font-bold">300 USDT</span> or referral who did.
                </div>
                
                {user.mainBalance >= 300 ? (
                  <button
                    onClick={() => handleExecuteSignal('VIP Bonus Signal', 2.0)}
                    disabled={executingSignalId !== null}
                    className="bg-amber-500 hover:bg-amber-400 text-zinc-950 px-4 py-2 rounded-lg text-[10px] font-bold uppercase font-mono tracking-wider transition shadow-md"
                  >
                    {executingSignalId === 'VIP Bonus Signal' ? 'Executing...' : 'Execute Signal'}
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 bg-zinc-950 px-2.5 py-1.5 rounded-lg border border-zinc-900 font-mono">
                    <Lock size={10} className="text-zinc-600" />
                    <span>LOCKED</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'traders' && (
        <div className="space-y-3.5">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 font-mono">
              Elite Traders Pool
            </h3>
            
            {/* Custom Search bar */}
            <div className="relative flex items-center bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 focus-within:border-cyan-500/50 transition">
              <Search size={13} className="text-zinc-500 mr-2 shrink-0" />
              <input 
                type="text" 
                placeholder="Search trader..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-xs text-white placeholder-zinc-600 outline-none w-full sm:w-36 font-sans border-none p-0 focus:ring-0"
              />
            </div>
          </div>

          {filteredTraders.length === 0 ? (
            <div className="bg-zinc-900/30 border border-zinc-900 rounded-2xl p-8 text-center text-zinc-500 text-xs">
              No traders found matching "{searchQuery}"
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3.5">
              {filteredTraders.map(t => {
                const riskStyles = {
                  Low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                  Medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                  High: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                };

                return (
                  <div 
                    key={t.id} 
                    id={`trader-card-${t.id}`}
                    onClick={() => !limitReached && handleOpenCopyModal(t)}
                    className={`group bg-zinc-900/40 border border-zinc-850 rounded-2xl p-4.5 transition duration-200 relative overflow-hidden ${
                      limitReached 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'hover:border-cyan-500/30 hover:bg-zinc-900/70 cursor-pointer shadow-md'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-3">
                      {/* Trader Profile Meta */}
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-zinc-800 to-zinc-900 border border-zinc-750 flex items-center justify-center font-black relative shadow">
                          <span className="text-cyan-400 font-mono text-sm uppercase">
                            {t.avatarLetter}
                          </span>
                          <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-3 h-3 rounded-full border-2 border-zinc-900" />
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-bold text-sm text-white group-hover:text-cyan-400 transition tracking-wide font-mono">
                              {t.name}
                            </h4>
                            <ShieldCheck size={13} className="text-cyan-400" />
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className={`text-[8px] border font-bold px-2 py-0.5 rounded-full uppercase font-mono ${riskStyles[t.riskScore]}`}>
                              {t.riskScore} Risk
                            </span>
                            
                            <span className="text-[10px] text-zinc-500 flex items-center gap-1 font-mono">
                              <Users size={11} /> {t.followers.toLocaleString()} copiers
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* ROI 30D Rate */}
                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-lg">
                          +{t.roi30d}% ROI
                        </span>
                        <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider mt-2 font-mono">30D Performance</p>
                      </div>
                    </div>

                    {/* Core performance statistics in a beautiful grid */}
                    <div className="grid grid-cols-3 gap-2.5 mt-4 border-t border-zinc-800/60 pt-3.5">
                      <div className="bg-zinc-950/60 p-2 rounded-xl border border-zinc-850/50 text-center">
                        <p className="text-[8px] text-zinc-500 uppercase font-bold font-mono">Min investment</p>
                        <p className="text-xs font-bold text-cyan-400 mt-1 font-mono">{Math.max(100, t.minAmount)} USDT</p>
                      </div>

                      <div className="bg-zinc-950/60 p-2 rounded-xl border border-zinc-850/50 text-center">
                        <p className="text-[8px] text-zinc-500 uppercase font-bold font-mono">Win Rate</p>
                        <p className="text-xs font-bold text-white mt-1 font-mono">{t.winRate}%</p>
                      </div>

                      <div className="bg-zinc-950/60 p-2 rounded-xl border border-zinc-850/50 text-center">
                        <p className="text-[8px] text-zinc-500 uppercase font-bold font-mono">Weekly Return</p>
                        <p className="text-xs font-bold text-emerald-400 mt-1 font-mono">+${t.weeklyProfit.toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Trigger Callout */}
                    {!limitReached && (
                      <div className="mt-3 flex justify-end">
                        <span className="text-[10px] text-cyan-400 font-bold flex items-center gap-1 group-hover:underline font-mono uppercase tracking-wider">
                          Start Mirroring <Copy size={11} />
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Active Trades Panel */}
      {activeTrades.length > 0 && (
        <div className="space-y-2.5">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5 font-mono">
            <Hourglass size={12} className="text-amber-400 animate-pulse" />
            Active Copy &amp; Signal Trades ({activeTrades.length})
          </h3>

          <div className="space-y-2.5">
            {activeTrades.map(trade => (
              <div key={trade.id} id={`active-trade-${trade.id}`} className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 shadow-sm relative overflow-hidden">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white font-mono">{trade.traderName}</span>
                      <span className="text-[8px] bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded-full border border-cyan-500/20 font-bold font-mono uppercase tracking-wider animate-pulse">Running</span>
                    </div>
                    <p className="text-[10px] text-zinc-500 mt-1 font-mono">Amount Staked: {trade.amount.toFixed(2)} USDT</p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      +${(trade.amount * 0.0219).toFixed(2)} USDT
                    </span>
                    <p className="text-[8px] text-zinc-500 font-bold uppercase mt-0.5 font-mono">Returns Profit</p>
                  </div>
                </div>

                {/* Animated loading bar */}
                <div className="mt-3.5 h-1.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-900">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 30, ease: 'linear' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Copy Trade Action Dialog Modal */}
      <AnimatePresence>
        {selectedTrader && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5.5 w-full max-w-sm shadow-2xl relative"
            >
              <div className="flex justify-between items-center mb-4 border-b border-zinc-800 pb-3">
                <div>
                  <h3 className="font-bold text-sm text-white font-mono">Mirror Trader</h3>
                  <p className="text-[9px] text-cyan-400 font-bold font-mono uppercase tracking-wider mt-0.5">{selectedTrader.name}</p>
                </div>
                <button 
                  id="close-copy-modal-btn"
                  onClick={handleCloseCopyModal}
                  className="w-7 h-7 bg-zinc-950 hover:bg-zinc-800 rounded-lg text-zinc-400 flex items-center justify-center border border-zinc-850 transition text-xs font-bold font-mono"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {/* Statistics Box */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-zinc-950/80 p-2.5 rounded-xl border border-zinc-850 text-center">
                    <span className="text-[8px] text-zinc-500 uppercase font-bold font-mono">Trader Win Rate</span>
                    <p className="text-sm font-mono font-bold text-emerald-400 mt-0.5">{selectedTrader.winRate}%</p>
                  </div>
                  <div className="bg-zinc-950/80 p-2.5 rounded-xl border border-zinc-850 text-center">
                    <span className="text-[8px] text-zinc-500 uppercase font-bold font-mono">Starting Price</span>
                    <p className="text-sm font-mono font-bold text-cyan-400 mt-0.5">{Math.max(100, selectedTrader.minAmount)} USDT</p>
                  </div>
                </div>

                {/* Amount input controller */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[9px] text-zinc-500 font-bold uppercase font-mono">
                    <label>Amount to Deploy</label>
                    <span>Minimum: {Math.max(100, selectedTrader.minAmount)} USDT</span>
                  </div>

                  <div className="relative bg-zinc-950 rounded-xl px-4 py-3 border border-zinc-850 focus-within:border-cyan-500 transition">
                    <div className="flex items-center gap-2.5">
                      <img src="https://assets.coingecko.com/coins/images/325/large/Tether.png" alt="USDT" className="w-5 h-5 rounded-full shadow" />
                      <input 
                        id="copy-amount-input"
                        type="number" 
                        min={Math.max(100, selectedTrader.minAmount)}
                        value={copyAmount}
                        onChange={(e) => setCopyAmount(e.target.value)}
                        className="w-full bg-transparent text-white font-bold text-sm outline-none border-none placeholder-zinc-700 font-mono focus:ring-0 p-0"
                        placeholder={`${Math.max(100, selectedTrader.minAmount)}.00`}
                      />
                      <span className="text-[10px] text-zinc-500 font-bold font-mono uppercase">USDT</span>
                    </div>
                  </div>
                </div>

                {/* Dynamically configured Quick Amount selection pills */}
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    Math.max(100, selectedTrader.minAmount),
                    Math.max(100, selectedTrader.minAmount) + 100,
                    Math.max(100, selectedTrader.minAmount) + 300,
                    Math.max(100, selectedTrader.minAmount) + 500
                  ].map(val => (
                    <button
                      key={val}
                      onClick={() => setCopyAmount(val.toString())}
                      className="bg-zinc-950 hover:bg-zinc-800 border border-zinc-850 text-zinc-300 rounded-lg py-1.5 text-[9px] font-bold font-mono transition"
                    >
                      {val} USDT
                    </button>
                  ))}
                </div>

                {/* Estimate Outcomes */}
                <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-850 flex justify-between items-center text-xs text-zinc-400 shadow-inner">
                  <div>
                    <p className="font-bold text-white text-[11px] uppercase tracking-wide font-mono">Projected Yield</p>
                    <p className="text-[9px] text-zinc-500 mt-0.5">Est performance rate</p>
                  </div>
                  <span className="text-sm font-mono font-black text-emerald-400">
                    +${projectedProfit} USDT
                  </span>
                </div>

                {/* Action button trigger - no locks, instant */}
                {parseFloat(copyAmount) > user.mainBalance ? (
                  <div className="bg-rose-500/10 border border-rose-500/25 text-rose-400 p-2.5 rounded-xl text-[10px] flex items-center gap-2 font-mono uppercase tracking-wider font-bold">
                    <AlertTriangle size={12} className="shrink-0" />
                    <span>Insufficient main balance (${user.mainBalance.toFixed(2)} USDT)</span>
                  </div>
                ) : parseFloat(copyAmount) < Math.max(100, selectedTrader.minAmount) ? (
                  <div className="bg-amber-500/10 border border-amber-500/25 text-amber-400 p-2.5 rounded-xl text-[10px] flex items-center gap-2 font-mono uppercase tracking-wider font-bold">
                    <AlertTriangle size={12} className="shrink-0" />
                    <span>Amount is below minimum of {Math.max(100, selectedTrader.minAmount)} USDT</span>
                  </div>
                ) : null}

                <button
                  id="confirm-copy-btn"
                  disabled={isNaN(parseFloat(copyAmount)) || parseFloat(copyAmount) < Math.max(100, selectedTrader.minAmount) || parseFloat(copyAmount) > user.mainBalance}
                  onClick={handleSubmitCopy}
                  className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-center transition duration-200 font-mono shadow ${
                    isNaN(parseFloat(copyAmount)) || parseFloat(copyAmount) < Math.max(100, selectedTrader.minAmount) || parseFloat(copyAmount) > user.mainBalance
                      ? 'bg-zinc-800 text-zinc-500 border border-zinc-850 cursor-not-allowed'
                      : 'bg-cyan-500 text-zinc-950 hover:bg-cyan-400 font-black'
                  }`}
                >
                  Confirm Mirror Trade
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
