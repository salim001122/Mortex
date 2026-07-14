import { useState } from 'react';
import { 
  ArrowLeft, 
  RefreshCw, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Copy, 
  Coins, 
  Gift, 
  Clock, 
  Receipt,
  Check
} from 'lucide-react';
import { motion } from 'motion/react';
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
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const filters = ['All', 'Deposit', 'Withdraw', 'CopyTrade', 'Staking'];

  const filteredTransactions = filter === 'All' 
    ? transactions 
    : transactions.filter(tx => tx.type === filter);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (selectedTx) {
    const tx = selectedTx;
    const isSuccess = tx.status === TransactionStatus.Success;
    const isPending = tx.status === TransactionStatus.Pending;
    const isFailed = tx.status === TransactionStatus.Failed;

    const formattedDate = new Date(tx.timestamp).toLocaleString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    let statusText = 'Completed';
    let statusColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (isPending) {
      statusText = 'Pending Approval';
      statusColor = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    } else if (isFailed) {
      statusText = 'Failed / Rejected';
      statusColor = 'text-rose-400 bg-rose-500/10 border-rose-500/20';
    }

    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="px-4 pb-14 space-y-5"
      >
        {/* Header */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setSelectedTx(null)} 
            className="text-zinc-400 hover:text-white transition p-1 hover:bg-zinc-850 rounded-lg"
          >
            <ArrowLeft size={18} />
          </button>
          <h2 className="text-sm font-black text-zinc-400 uppercase tracking-widest font-mono">Transaction Details</h2>
        </div>

        {/* Receipt Style Card */}
        <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-850 rounded-2xl p-5 shadow-2xl relative overflow-hidden space-y-5 animate-in fade-in duration-300">
          {/* Decorative Top Bar Accent */}
          <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${
            isSuccess ? 'from-emerald-500 to-teal-500' : isPending ? 'from-amber-400 to-yellow-500' : 'from-rose-500 to-red-500'
          }`} />

          {/* Amount and Status Header */}
          <div className="text-center pt-2 pb-1 space-y-2">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider font-mono">Amount Transacted</span>
            <h1 className={`text-2xl font-black font-mono tracking-tight ${
              tx.type === TransactionType.Withdraw ? 'text-rose-400' : isSuccess ? 'text-emerald-400' : 'text-white'
            }`}>
              {tx.type === TransactionType.Withdraw ? '-' : '+'}{tx.amount.toFixed(2)} <span className="text-xs text-zinc-400 font-bold uppercase">USDT</span>
            </h1>
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-bold uppercase font-mono tracking-wider shadow-sm mt-1 ${statusColor}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isPending ? 'bg-amber-400 animate-pulse' : isSuccess ? 'bg-emerald-400' : 'bg-rose-500'}`} />
              <span>{statusText}</span>
            </div>
          </div>

          {/* Separation line */}
          <div className="border-t border-zinc-850/60 my-2" />

          {/* Transaction Metadata Grid */}
          <div className="space-y-4 text-xs font-mono">
            {/* Order Type */}
            <div className="flex justify-between items-center py-0.5">
              <span className="text-zinc-500 uppercase font-bold text-[9px] tracking-wider">Transaction Type</span>
              <span className="text-white font-bold uppercase bg-zinc-900 px-2 py-0.5 border border-zinc-800 rounded-md">
                {tx.type === TransactionType.CopyTrade ? 'Copy Trade Order' : tx.type}
              </span>
            </div>

            {/* Order Number / ID */}
            <div className="flex justify-between items-start py-0.5">
              <span className="text-zinc-500 uppercase font-bold text-[9px] tracking-wider mt-1">Order Number</span>
              <div className="flex items-center gap-1.5 text-right">
                <span className="text-zinc-300 font-bold">{tx.id.toUpperCase()}</span>
                <button
                  onClick={() => handleCopy(tx.id)}
                  className="p-1 hover:bg-zinc-850 active:scale-95 text-zinc-400 hover:text-white rounded-md transition"
                  title="Copy Order Number"
                >
                  {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                </button>
              </div>
            </div>

            {/* Timestamp */}
            <div className="flex justify-between items-center py-0.5">
              <span className="text-zinc-500 uppercase font-bold text-[9px] tracking-wider">Date & Time</span>
              <span className="text-zinc-300 font-bold text-right">{formattedDate}</span>
            </div>

            {/* Dynamic content depending on transaction types */}
            {tx.type === TransactionType.CopyTrade && (
              <>
                <div className="border-t border-zinc-850/60 my-2 pt-3" />
                
                {/* Copy Trader Section with Face Avatar */}
                <div className="flex justify-between items-center py-1 bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-900">
                  <span className="text-zinc-500 uppercase font-bold text-[9px] tracking-wider font-mono">Expert Copy Trader</span>
                  <div className="flex items-center gap-2">
                    <img 
                      src={tx.traderAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face'} 
                      alt={tx.traderName || 'Trader'} 
                      referrerPolicy="no-referrer"
                      className="w-6 h-6 rounded-full border border-cyan-400/40 object-cover"
                    />
                    <span className="text-cyan-400 font-black">{tx.traderName || 'Elite Trader'}</span>
                  </div>
                </div>

                {/* Market Pair */}
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-zinc-500 uppercase font-bold text-[9px] tracking-wider">Market Trade Pair</span>
                  <span className="text-amber-400 font-bold uppercase">{tx.tradePair || 'BTC/USDT'}</span>
                </div>

                {/* Settled Profit Return */}
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-zinc-500 uppercase font-bold text-[9px] tracking-wider">Return Profit Yield</span>
                  {tx.profit && tx.profit > 0 ? (
                    <span className="text-emerald-400 font-black font-mono">+{tx.profit.toFixed(2)} USDT</span>
                  ) : tx.status === TransactionStatus.Pending ? (
                    <span className="text-yellow-400 font-bold animate-pulse">Running (30m countdown)</span>
                  ) : (
                    <span className="text-zinc-500 font-bold">0.00 USDT</span>
                  )}
                </div>

                {/* Total Balance Return */}
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-zinc-500 uppercase font-bold text-[9px] tracking-wider">Settled Payout</span>
                  <span className="text-white font-bold">
                    {tx.status === TransactionStatus.Success 
                      ? `${(tx.amount + (tx.profit || 0)).toFixed(2)} USDT`
                      : 'Pending Settlement'
                    }
                  </span>
                </div>
              </>
            )}

            {/* Deposit / Withdraw Specifics */}
            {(tx.type === TransactionType.Deposit || tx.type === TransactionType.Withdraw) && (
              <>
                <div className="border-t border-zinc-850/60 my-2 pt-3" />

                {/* Network Protocol */}
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-zinc-500 uppercase font-bold text-[9px] tracking-wider">Network Protocol</span>
                  <span className="text-white font-bold font-mono">{tx.network || 'USDT-TRC20'}</span>
                </div>

                {/* Wallet Target Address */}
                {tx.address && (
                  <div className="flex flex-col gap-1.5 py-0.5">
                    <span className="text-zinc-500 uppercase font-bold text-[9px] tracking-wider">Destination Address</span>
                    <span className="text-zinc-400 font-bold text-[10px] bg-zinc-950 p-2 border border-zinc-900 rounded-lg break-all select-all leading-relaxed font-mono">
                      {tx.address}
                    </span>
                  </div>
                )}

                {/* Processing Fee */}
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-zinc-500 uppercase font-bold text-[9px] tracking-wider">Network Processing Fee</span>
                  <span className="text-zinc-400 font-bold">
                    {tx.type === TransactionType.Withdraw ? '1.00 USDT' : '0.00 USDT'}
                  </span>
                </div>
              </>
            )}

            {/* Staking specific details */}
            {tx.type === TransactionType.Staking && (
              <>
                <div className="border-t border-zinc-850/60 my-2 pt-3" />
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-zinc-500 uppercase font-bold text-[9px] tracking-wider">Staking Tier Yield</span>
                  <span className="text-purple-400 font-bold uppercase">Elite Smart Staking</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-zinc-500 uppercase font-bold text-[9px] tracking-wider">Yield Interest Rate</span>
                  <span className="text-emerald-400 font-bold">+18.4% APY</span>
                </div>
              </>
            )}

            {/* Bonus/Commission specific details */}
            {(tx.type === TransactionType.Bonus || tx.type === TransactionType.Commission) && (
              <>
                <div className="border-t border-zinc-850/60 my-2 pt-3" />
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-zinc-500 uppercase font-bold text-[9px] tracking-wider">Promo Category</span>
                  <span className="text-amber-400 font-bold uppercase">
                    {tx.type === TransactionType.Bonus ? 'System Welcome Bonus' : 'Affiliate Team Commission'}
                  </span>
                </div>
              </>
            )}
          </div>

          <div className="border-t border-zinc-850/60 my-2 pt-1" />

          {/* Secure Guarantee Tag */}
          <div className="flex items-center justify-center gap-1.5 text-zinc-500 text-[9px] font-bold tracking-wider uppercase font-mono text-center">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" style={{ animationDuration: '3s' }} />
            NGK Securitized Blockchain Ledger Receipt
          </div>
        </div>

        {/* Back Button Action */}
        <button
          onClick={() => setSelectedTx(null)}
          className="w-full py-3 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-white font-bold text-xs uppercase tracking-wider font-mono border border-zinc-800 transition active:scale-95"
        >
          Return to History List
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-4 px-4 pb-12"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => onNavigate('dashboard')} 
            className="text-zinc-400 hover:text-white transition p-1 hover:bg-zinc-850 rounded-lg"
          >
            <ArrowLeft size={18} />
          </button>
          <h2 className="text-lg font-bold text-white tracking-tight">HISTORY</h2>
        </div>
        
        <button 
          onClick={onReload}
          className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white active:scale-95 transition"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Categories Horizontal Filters */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {filters.map(f => {
          const isActive = filter === f;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded text-[11px] font-bold uppercase transition whitespace-nowrap border outline-none font-mono ${
                isActive
                  ? 'bg-cyan-500 text-zinc-950 border-cyan-500 font-bold shadow-sm'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white hover:bg-zinc-800'
              }`}
            >
              {f === 'CopyTrade' ? 'Copy Trade' : f === 'Staking' ? 'Staking' : f}
            </button>
          );
        })}
      </div>

      {/* Transactions List */}
      <div className="space-y-3">
        {filteredTransactions.length === 0 ? (
          <div className="coding-card rounded-xl p-8 text-center flex flex-col items-center justify-center">
            <Receipt size={28} className="text-zinc-600 mb-2" />
            <p className="text-xs text-zinc-500 font-bold uppercase">No transactions found</p>
            <p className="text-[10px] text-zinc-600 mt-1 max-w-[200px] mx-auto">
              Your transactions will appear here.
            </p>
          </div>
        ) : (
          filteredTransactions.map(tx => {
            // Determine type-specific icons and colors
            let icon = <Receipt size={14} />;
            let iconBg = 'bg-zinc-950 border-zinc-800 text-zinc-300';
            let amtPrefix = '';
            let amtColor = 'text-white';

            if (tx.type === TransactionType.Deposit) {
              icon = <ArrowDownLeft size={14} />;
              iconBg = 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
              amtPrefix = '+';
              amtColor = 'text-emerald-400';
            } else if (tx.type === TransactionType.Withdraw) {
              icon = <ArrowUpRight size={14} />;
              iconBg = 'bg-red-500/10 border-red-500/20 text-red-400';
              amtPrefix = '-';
              amtColor = 'text-red-400';
            } else if (tx.type === TransactionType.CopyTrade) {
              icon = <Copy size={14} />;
              iconBg = 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400';
              amtColor = tx.status === TransactionStatus.Success ? 'text-emerald-400' : 'text-white';
              amtPrefix = tx.status === TransactionStatus.Success ? '+' : '';
            } else if (tx.type === TransactionType.Staking) {
              icon = <Coins size={14} />;
              iconBg = 'bg-purple-500/10 border-purple-500/20 text-purple-400';
              amtColor = 'text-purple-400';
            } else if (tx.type === TransactionType.Bonus || tx.type === TransactionType.Commission) {
              icon = <Gift size={14} />;
              iconBg = 'bg-amber-500/10 border-amber-500/20 text-amber-400';
              amtPrefix = '+';
              amtColor = 'text-amber-400';
            }

            const dateObj = new Date(tx.timestamp);
            const yyyy = dateObj.getFullYear();
            const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
            const dd = String(dateObj.getDate()).padStart(2, '0');
            const hh = String(dateObj.getHours()).padStart(2, '0');
            const min = String(dateObj.getMinutes()).padStart(2, '0');
            const ss = String(dateObj.getSeconds()).padStart(2, '0');
            const formattedDate = `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;

            const displayAmount = tx.amount % 1 === 0 ? tx.amount.toString() : tx.amount.toFixed(4);
            const currencySuffix = tx.type === TransactionType.Withdraw ? 'USDT-TRC20' : 'USDT-TRC20';

            return (
              <div 
                key={tx.id} 
                onClick={() => setSelectedTx(tx)}
                className="bg-[#181b22] border border-zinc-900/80 rounded-2xl p-5 transition relative overflow-hidden cursor-pointer hover:bg-[#1f222b] active:scale-[0.98] duration-200 flex items-center justify-between"
              >
                {/* Left Side: Amount & Timestamp */}
                <div className="space-y-2">
                  <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">
                    {displayAmount} <span className="text-zinc-300 font-medium text-xs sm:text-sm">{currencySuffix}</span>
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-zinc-500 font-mono tracking-normal">
                    {formattedDate}
                  </p>
                </div>

                {/* Right Side: Completed/Pending Button Badge */}
                <div>
                  {tx.status === TransactionStatus.Success ? (
                    <div className="bg-[#132c25] text-[#29a779] px-5 py-2 rounded-full text-[11px] sm:text-xs font-bold text-center select-none shadow-sm">
                      Completed
                    </div>
                  ) : tx.status === TransactionStatus.Pending || tx.status === TransactionStatus.Hold ? (
                    <div className="bg-[#2d2412] text-[#b3952b] px-5 py-2 rounded-full text-[11px] sm:text-xs font-bold text-center select-none shadow-sm animate-pulse">
                      Pending
                    </div>
                  ) : (
                    <div className="bg-[#2d1212] text-[#c93b3b] px-5 py-2 rounded-full text-[11px] sm:text-xs font-bold text-center select-none shadow-sm">
                      Rejected
                    </div>
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
