import { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  RefreshCw, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Copy, 
  Coins, 
  Gift, 
  Receipt,
  Check,
  Search,
  Filter,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  ExternalLink,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Transaction, TransactionType, TransactionStatus } from '../types';

interface HistoryProps {
  onNavigate: (screen: string) => void;
  transactions: Transaction[];
  onReload: () => void;
}

export default function History({
  onNavigate,
  transactions,
  onReload
}: HistoryProps) {
  const [filter, setFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const filters = ['All', 'Deposit', 'Withdraw', 'CopyTrade', 'Staking', 'Bonus'];

  const handleReload = () => {
    setIsRefreshing(true);
    onReload();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered list calculation
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      // Type Filter
      if (filter !== 'All') {
        if (filter === 'Bonus' && tx.type !== TransactionType.Bonus && tx.type !== TransactionType.Commission) {
          return false;
        } else if (filter !== 'Bonus' && tx.type !== filter) {
          return false;
        }
      }

      // Status Filter
      if (statusFilter === 'Completed' && tx.status !== TransactionStatus.Success) return false;
      if (statusFilter === 'Pending' && tx.status !== TransactionStatus.Pending && tx.status !== TransactionStatus.Hold) return false;
      if (statusFilter === 'Failed' && tx.status !== TransactionStatus.Failed) return false;

      // Search Query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase().trim();
        const matchId = tx.id.toLowerCase().includes(q);
        const matchType = tx.type.toLowerCase().includes(q);
        const matchTrader = tx.traderName?.toLowerCase().includes(q) || false;
        const matchPair = tx.tradePair?.toLowerCase().includes(q) || false;
        const matchAddress = tx.address?.toLowerCase().includes(q) || false;
        const matchNetwork = tx.network?.toLowerCase().includes(q) || false;
        return matchId || matchType || matchTrader || matchPair || matchAddress || matchNetwork;
      }

      return true;
    });
  }, [transactions, filter, statusFilter, searchQuery]);

  // Statistics summaries
  const stats = useMemo(() => {
    let totalDeposit = 0;
    let totalWithdraw = 0;
    let totalProfit = 0;

    transactions.forEach(tx => {
      if (tx.status === TransactionStatus.Success) {
        if (tx.type === TransactionType.Deposit) totalDeposit += tx.amount;
        if (tx.type === TransactionType.Withdraw) totalWithdraw += tx.amount;
        if (tx.type === TransactionType.CopyTrade && tx.profit) totalProfit += tx.profit;
        if (tx.type === TransactionType.Bonus || tx.type === TransactionType.Commission) totalProfit += tx.amount;
      }
    });

    return { totalDeposit, totalWithdraw, totalProfit };
  }, [transactions]);

  // Detail Modal / View
  if (selectedTx) {
    const tx = selectedTx;
    const isSuccess = tx.status === TransactionStatus.Success;
    const isPending = tx.status === TransactionStatus.Pending || tx.status === TransactionStatus.Hold;
    const isFailed = tx.status === TransactionStatus.Failed;

    const formattedDate = new Date(tx.timestamp).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    let statusText = 'Completed';
    let statusBg = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    if (isPending) {
      statusText = tx.status === TransactionStatus.Hold ? 'Security Review (Hold)' : 'Processing';
      statusBg = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    } else if (isFailed) {
      statusText = 'Rejected / Failed';
      statusBg = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        className="w-full max-w-full overflow-x-hidden px-3 sm:px-4 pb-20 space-y-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => setSelectedTx(null)} 
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition py-1.5 px-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-bold uppercase font-mono cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Back to History</span>
          </button>

          <span className="text-[10px] text-cyan-400 font-bold font-mono uppercase bg-cyan-950/60 border border-cyan-800/60 px-2.5 py-1 rounded-full">
            Ledger Receipt
          </span>
        </div>

        {/* Exchange Style Receipt Card */}
        <div className="bg-gradient-to-b from-[#131722] via-[#0d1017] to-black border border-zinc-800/90 rounded-2xl p-5 shadow-2xl relative overflow-hidden space-y-5">
          {/* Top Decorative Line */}
          <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${
            isSuccess ? 'from-emerald-500 to-teal-400' : isPending ? 'from-amber-400 to-yellow-500' : 'from-rose-500 to-red-500'
          }`} />

          {/* Header Amount */}
          <div className="text-center pt-2 pb-1 space-y-1.5 relative">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest font-mono">
              Transaction Volume
            </span>
            <h1 className={`text-2xl sm:text-3xl font-black font-mono tracking-tight break-all ${
              tx.type === TransactionType.Withdraw ? 'text-rose-400' : isSuccess ? 'text-emerald-400' : 'text-white'
            }`}>
              {tx.type === TransactionType.Withdraw ? '-' : '+'}{tx.amount.toFixed(2)} <span className="text-xs text-zinc-400 font-bold uppercase">USDT</span>
            </h1>

            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-bold uppercase font-mono tracking-wider shadow-sm mt-1 ${statusBg}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isPending ? 'bg-amber-400 animate-ping' : isSuccess ? 'bg-emerald-400' : 'bg-rose-500'}`} />
              <span>{statusText}</span>
            </div>
          </div>

          {/* Separation Line */}
          <div className="relative my-3">
            <div className="border-t border-dashed border-zinc-800 w-full" />
          </div>

          {/* Meta Details */}
          <div className="space-y-3.5 text-xs font-mono">
            {/* Category */}
            <div className="flex justify-between items-center min-w-0">
              <span className="text-zinc-500 uppercase font-bold text-[10px] tracking-wider shrink-0">Type</span>
              <span className="text-white font-bold uppercase bg-zinc-900 px-2.5 py-1 border border-zinc-800 rounded-lg text-[10px] truncate max-w-[180px] text-right">
                {tx.type === TransactionType.CopyTrade ? 'Copy Trade Order' : tx.type}
              </span>
            </div>

            {/* Order Number / Hash */}
            <div className="flex justify-between items-center gap-2 min-w-0">
              <span className="text-zinc-500 uppercase font-bold text-[10px] tracking-wider shrink-0">Order ID</span>
              <div className="flex items-center gap-1.5 min-w-0 max-w-[220px] justify-end">
                <span className="text-zinc-300 font-bold bg-zinc-950 px-2 py-1 rounded border border-zinc-900 text-[10px] truncate font-mono">
                  {tx.id.toUpperCase()}
                </span>
                <button
                  onClick={() => handleCopy(tx.id, 'txid')}
                  className="p-1.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg transition shrink-0 cursor-pointer"
                  title="Copy ID"
                >
                  {copiedId === 'txid' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                </button>
              </div>
            </div>

            {/* Date & Time */}
            <div className="flex justify-between items-center gap-2 min-w-0">
              <span className="text-zinc-500 uppercase font-bold text-[10px] tracking-wider shrink-0">Timestamp</span>
              <span className="text-zinc-300 font-medium text-right text-[11px] truncate">{formattedDate}</span>
            </div>

            {/* CopyTrade Specifics */}
            {tx.type === TransactionType.CopyTrade && (
              <>
                <div className="border-t border-zinc-800/80 my-2 pt-2" />
                
                <div className="flex justify-between items-center py-1.5 bg-zinc-950/80 px-3 rounded-xl border border-zinc-850 gap-2 min-w-0">
                  <span className="text-zinc-500 uppercase font-bold text-[9px] tracking-wider shrink-0">Master Trader</span>
                  <div className="flex items-center gap-2 min-w-0 truncate">
                    <img 
                      src={tx.traderAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face'} 
                      alt={tx.traderName || 'Trader'} 
                      referrerPolicy="no-referrer"
                      className="w-6 h-6 rounded-full border border-cyan-400/40 object-cover shrink-0"
                    />
                    <span className="text-cyan-400 font-bold tracking-wide text-[11px] truncate">{tx.traderName || 'Elite Trader'}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center py-0.5 min-w-0">
                  <span className="text-zinc-500 uppercase font-bold text-[10px] tracking-wider shrink-0">Trade Pair</span>
                  <span className="text-amber-400 font-black uppercase text-[11px] tracking-wider truncate">{tx.tradePair || 'BTC/USDT'}</span>
                </div>

                <div className="flex justify-between items-center py-0.5 min-w-0">
                  <span className="text-zinc-500 uppercase font-bold text-[10px] tracking-wider shrink-0">Est. Profit Yield</span>
                  {tx.profit && tx.profit > 0 ? (
                    <span className="text-emerald-400 font-black font-mono">+{tx.profit.toFixed(2)} USDT</span>
                  ) : isPending ? (
                    <span className="text-amber-400 font-bold animate-pulse text-[10px]">Running (Active)</span>
                  ) : (
                    <span className="text-zinc-500 font-bold">0.00 USDT</span>
                  )}
                </div>

                <div className="flex justify-between items-center py-0.5 min-w-0">
                  <span className="text-zinc-500 uppercase font-bold text-[10px] tracking-wider shrink-0">Payout Status</span>
                  <span className="text-white font-black text-[11px] truncate">
                    {isSuccess 
                      ? `${(tx.amount + (tx.profit || 0)).toFixed(2)} USDT Credited`
                      : 'Awaiting Settlement'
                    }
                  </span>
                </div>
              </>
            )}

            {/* Deposit / Withdraw Specifics */}
            {(tx.type === TransactionType.Deposit || tx.type === TransactionType.Withdraw) && (
              <>
                <div className="border-t border-zinc-800/80 my-2 pt-2" />

                <div className="flex justify-between items-center py-0.5 min-w-0">
                  <span className="text-zinc-500 uppercase font-bold text-[10px] tracking-wider shrink-0">Blockchain Network</span>
                  <span className="text-white font-bold font-mono tracking-wide">{tx.network || 'USDT-TRC20'}</span>
                </div>

                {tx.address && (
                  <div className="flex flex-col gap-1.5 py-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-500 uppercase font-bold text-[10px] tracking-wider">Destination Address</span>
                      <button
                        onClick={() => handleCopy(tx.address || '', 'addr')}
                        className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold uppercase flex items-center gap-1 cursor-pointer"
                      >
                        {copiedId === 'addr' ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <span className="text-zinc-300 font-mono text-[10px] bg-zinc-950 p-2.5 border border-zinc-900 rounded-xl break-all select-all leading-relaxed max-w-full">
                      {tx.address}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center py-0.5 min-w-0">
                  <span className="text-zinc-500 uppercase font-bold text-[10px] tracking-wider shrink-0">Network Processing Fee</span>
                  <span className="text-zinc-400 font-bold">
                    {tx.type === TransactionType.Withdraw ? '1.00 USDT' : '0.00 USDT'}
                  </span>
                </div>
              </>
            )}

            {/* Staking Details */}
            {tx.type === TransactionType.Staking && (
              <>
                <div className="border-t border-zinc-800/80 my-2 pt-2" />
                <div className="flex justify-between items-center py-0.5 min-w-0">
                  <span className="text-zinc-500 uppercase font-bold text-[10px] tracking-wider shrink-0">Smart Pool</span>
                  <span className="text-purple-400 font-bold uppercase tracking-wider text-[10px]">Elite Staking Node</span>
                </div>
                <div className="flex justify-between items-center py-0.5 min-w-0">
                  <span className="text-zinc-500 uppercase font-bold text-[10px] tracking-wider shrink-0">Yield Interest</span>
                  <span className="text-emerald-400 font-bold">+18.4% APY</span>
                </div>
              </>
            )}

            {/* Bonus / Commission Details */}
            {(tx.type === TransactionType.Bonus || tx.type === TransactionType.Commission) && (
              <>
                <div className="border-t border-zinc-800/80 my-2 pt-2" />
                <div className="flex justify-between items-center py-0.5 min-w-0">
                  <span className="text-zinc-500 uppercase font-bold text-[10px] tracking-wider shrink-0">Promo Source</span>
                  <span className="text-amber-400 font-bold uppercase text-[10px] tracking-wider">
                    {tx.type === TransactionType.Bonus ? 'System Welcome Reward' : 'Team Referral Commission'}
                  </span>
                </div>
              </>
            )}
          </div>

          <div className="border-t border-dashed border-zinc-800/80 my-3" />

          {/* Security Tag */}
          <div className="flex items-center justify-center gap-1.5 text-zinc-500 text-[9px] font-bold tracking-widest uppercase font-mono text-center">
            <ShieldCheck size={13} className="text-emerald-400 shrink-0" />
            <span>NGK VERIFIED BLOCKCHAIN LEDGER RECORD</span>
          </div>
        </div>

        {/* Primary Action Button */}
        <button
          onClick={() => setSelectedTx(null)}
          className="w-full py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider font-mono border border-zinc-800 transition active:scale-98 cursor-pointer"
        >
          Close Receipt
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="w-full max-w-full overflow-x-hidden px-3 sm:px-4 pb-20 space-y-4"
    >
      {/* 1. Header Bar */}
      <div className="flex justify-between items-center gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <button 
            onClick={() => onNavigate('dashboard')} 
            className="text-zinc-400 hover:text-white transition p-1.5 bg-zinc-900/80 border border-zinc-800 rounded-xl shrink-0 cursor-pointer active:scale-95"
            title="Go to Dashboard"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-black text-white tracking-tight uppercase font-mono truncate">
              Asset History
            </h2>
            <p className="text-[10px] text-zinc-500 font-mono truncate">
              Blockchain Ledger Transactions
            </p>
          </div>
        </div>
        
        <button 
          onClick={handleReload}
          className={`w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white active:scale-95 transition shrink-0 cursor-pointer ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`}
          title="Refresh History"
        >
          <RefreshCw size={15} />
        </button>
      </div>

      {/* 2. Crypto Exchange Summary Cards */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-gradient-to-b from-[#121620] to-[#0a0c10] border border-zinc-800/80 rounded-xl p-2.5 min-w-0 flex flex-col justify-between">
          <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider font-mono truncate block">
            Deposits
          </span>
          <p className="font-mono font-bold text-xs sm:text-sm text-emerald-400 truncate mt-1">
            +${stats.totalDeposit.toFixed(2)}
          </p>
        </div>

        <div className="bg-gradient-to-b from-[#121620] to-[#0a0c10] border border-zinc-800/80 rounded-xl p-2.5 min-w-0 flex flex-col justify-between">
          <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider font-mono truncate block">
            Withdraws
          </span>
          <p className="font-mono font-bold text-xs sm:text-sm text-rose-400 truncate mt-1">
            -${stats.totalWithdraw.toFixed(2)}
          </p>
        </div>

        <div className="bg-gradient-to-b from-[#121620] to-[#0a0c10] border border-zinc-800/80 rounded-xl p-2.5 min-w-0 flex flex-col justify-between">
          <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider font-mono truncate block">
            Earnings
          </span>
          <p className="font-mono font-bold text-xs sm:text-sm text-cyan-400 truncate mt-1">
            +${stats.totalProfit.toFixed(2)}
          </p>
        </div>
      </div>

      {/* 3. Search Bar & Status Sub-filters */}
      <div className="space-y-2">
        <div className="relative w-full">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by Order ID, Trader, Address, Network..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0d0f15] border border-zinc-800 focus:border-cyan-500/60 rounded-xl pl-9 pr-8 py-2 text-xs font-mono text-white placeholder-zinc-600 outline-none transition"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition p-0.5"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Horizontal Category Filters */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none w-full max-w-full">
          {filters.map(f => {
            const isActive = filter === f;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-xl text-[10.5px] font-bold uppercase transition whitespace-nowrap border outline-none font-mono cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-cyan-500 text-zinc-950 border-cyan-400 font-black shadow-sm'
                    : 'bg-[#12141c] text-zinc-400 border-zinc-800/80 hover:text-white hover:bg-zinc-800'
                }`}
              >
                {f === 'CopyTrade' ? 'Copy Trade' : f === 'Bonus' ? 'Bonus & Comm.' : f}
              </button>
            );
          })}
        </div>

        {/* Status Pills Bar */}
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-400 pt-0.5">
          <span className="text-zinc-600 font-bold uppercase text-[9px] shrink-0">Status:</span>
          {['All', 'Completed', 'Pending', 'Failed'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2 py-0.5 rounded-lg border transition font-bold uppercase cursor-pointer text-[9.5px] ${
                statusFilter === st 
                  ? 'bg-zinc-800 text-white border-zinc-700' 
                  : 'bg-transparent text-zinc-500 border-transparent hover:text-zinc-300'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Transactions List */}
      <div className="space-y-2.5 w-full max-w-full overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="bg-[#0f1117] border border-zinc-800/80 rounded-2xl p-8 text-center flex flex-col items-center justify-center my-4 space-y-2">
            <div className="w-12 h-12 rounded-full bg-zinc-900/80 border border-zinc-800 flex items-center justify-center text-zinc-600">
              <Receipt size={24} />
            </div>
            <p className="text-xs text-zinc-400 font-bold uppercase font-mono">No matching records found</p>
            <p className="text-[10px] text-zinc-600 max-w-[220px] mx-auto font-mono">
              {searchQuery ? 'Try clearing your search keyword' : 'Your completed and active transactions will be listed here.'}
            </p>
          </div>
        ) : (
          filteredTransactions.map(tx => {
            let icon = <Receipt size={16} />;
            let iconBg = 'bg-zinc-900 border-zinc-800 text-zinc-300';
            let amtPrefix = '';
            let amtColor = 'text-white';
            let txLabel = 'Transaction';
            let txDetail = 'Blockchain Ledger';

            if (tx.type === TransactionType.Deposit) {
              icon = <ArrowDownLeft size={16} />;
              iconBg = 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400';
              amtPrefix = '+';
              amtColor = 'text-emerald-400';
              txLabel = 'USDT Deposit';
              txDetail = tx.network || 'TRC20';
            } else if (tx.type === TransactionType.Withdraw) {
              icon = <ArrowUpRight size={16} />;
              iconBg = 'bg-rose-500/10 border-rose-500/25 text-rose-400';
              amtPrefix = '-';
              amtColor = 'text-rose-400';
              txLabel = 'USDT Withdrawal';
              txDetail = tx.network || 'TRC20';
            } else if (tx.type === TransactionType.CopyTrade) {
              icon = <TrendingUp size={15} />;
              iconBg = 'bg-cyan-500/10 border-cyan-500/25 text-cyan-400';
              amtColor = tx.status === TransactionStatus.Success ? 'text-emerald-400' : 'text-zinc-200';
              amtPrefix = tx.status === TransactionStatus.Success ? '+' : '';
              txLabel = tx.traderName ? `${tx.traderName} Copy` : 'Master Copy Trade';
              txDetail = tx.tradePair || 'BTC/USDT';
            } else if (tx.type === TransactionType.Staking) {
              icon = <Coins size={16} />;
              iconBg = 'bg-purple-500/10 border-purple-500/25 text-purple-400';
              amtColor = 'text-purple-400';
              txLabel = 'Smart Staking Node';
              txDetail = 'Mainnet Pool';
            } else if (tx.type === TransactionType.Bonus || tx.type === TransactionType.Commission) {
              icon = <Gift size={16} />;
              iconBg = 'bg-amber-500/10 border-amber-500/25 text-amber-400';
              amtPrefix = '+';
              amtColor = 'text-amber-400';
              txLabel = tx.type === TransactionType.Bonus ? 'Welcome Bonus' : 'Affiliate Commission';
              txDetail = 'Bonus Pool';
            }

            const dateObj = new Date(tx.timestamp);
            const formattedDate = `${dateObj.getMonth() + 1}/${dateObj.getDate()} ${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}`;

            const displayAmount = tx.amount % 1 === 0 ? tx.amount.toString() : tx.amount.toFixed(2);

            return (
              <div 
                key={tx.id} 
                onClick={() => setSelectedTx(tx)}
                className="bg-gradient-to-r from-[#11131a] to-[#0a0c10] border border-zinc-800/80 hover:border-cyan-500/40 rounded-2xl p-3.5 transition duration-200 cursor-pointer active:scale-[0.99] flex items-center justify-between gap-3 shadow-md w-full max-w-full overflow-hidden"
              >
                {/* Left Block */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${iconBg} shadow-inner`}>
                    {icon}
                  </div>

                  <div className="space-y-0.5 min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <h3 className="text-xs font-bold text-white tracking-wide truncate font-mono">
                        {txLabel}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-500 truncate">
                      <span className="font-bold text-zinc-400 truncate">{txDetail}</span>
                      <span>•</span>
                      <span className="shrink-0">{formattedDate}</span>
                    </div>
                  </div>
                </div>

                {/* Right Block */}
                <div className="text-right flex flex-col items-end gap-1 shrink-0">
                  <h4 className={`text-xs sm:text-sm font-black font-mono tracking-tight ${amtColor}`}>
                    {amtPrefix}{displayAmount} <span className="text-[9px] text-zinc-500 font-bold uppercase">USDT</span>
                  </h4>
                  
                  {tx.status === TransactionStatus.Success ? (
                    <span className="inline-flex items-center gap-1 text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold uppercase font-mono">
                      <span className="w-1 h-1 bg-emerald-400 rounded-full" />
                      Success
                    </span>
                  ) : tx.status === TransactionStatus.Pending || tx.status === TransactionStatus.Hold ? (
                    <span className="inline-flex items-center gap-1 text-[8px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold uppercase font-mono animate-pulse">
                      <span className="w-1 h-1 bg-amber-400 rounded-full" />
                      Pending
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[8px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded-full font-bold uppercase font-mono">
                      <span className="w-1 h-1 bg-rose-500 rounded-full" />
                      Rejected
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}

