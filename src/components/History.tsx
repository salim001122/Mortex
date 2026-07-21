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
        <div className="bg-gradient-to-b from-zinc-900 via-[#12141c] to-black border border-zinc-850 rounded-2xl p-6 shadow-2xl relative overflow-hidden space-y-5 animate-in fade-in duration-300">
          {/* Decorative Top Bar Accent */}
          <div className={`absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r ${
            isSuccess ? 'from-emerald-500 to-teal-400' : isPending ? 'from-amber-400 to-yellow-500' : 'from-rose-500 to-red-500'
          }`} />

          {/* Amount and Status Header */}
          <div className="text-center pt-3 pb-1 space-y-2 relative">
            <div className="absolute top-1 right-1 opacity-10 pointer-events-none">
              <Receipt size={70} className="text-zinc-400" />
            </div>
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest font-mono">Receipt Vol. Transacted</span>
            <h1 className={`text-3xl font-black font-mono tracking-tight ${
              tx.type === TransactionType.Withdraw ? 'text-rose-400' : isSuccess ? 'text-emerald-400' : 'text-white'
            }`}>
              {tx.type === TransactionType.Withdraw ? '-' : '+'}{tx.amount.toFixed(2)} <span className="text-xs text-zinc-400 font-bold uppercase">USDT</span>
            </h1>
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase font-mono tracking-wider shadow-md mt-1 ${statusColor}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isPending ? 'bg-amber-400 animate-pulse' : isSuccess ? 'bg-emerald-400' : 'bg-rose-500'}`} />
              <span>{statusText}</span>
            </div>
          </div>

          {/* Realistic Ticket Tearing Separation Line with Left & Right Cut-outs */}
          <div className="relative my-4">
            <div className="absolute -left-8 -top-2 w-4 h-4 bg-[#09090b] rounded-full border-r border-zinc-850" />
            <div className="absolute -right-8 -top-2 w-4 h-4 bg-[#09090b] rounded-full border-l border-zinc-850" />
            <div className="border-t-2 border-dashed border-zinc-800/85 w-full pt-1" />
          </div>

          {/* Transaction Metadata Grid */}
          <div className="space-y-4 text-xs font-mono">
            {/* Order Type */}
            <div className="flex justify-between items-center py-0.5">
              <span className="text-zinc-500 uppercase font-bold text-[9px] tracking-wider">Transaction Type</span>
              <span className="text-white font-black uppercase bg-zinc-900 px-2.5 py-1 border border-zinc-800 rounded-lg text-[10px]">
                {tx.type === TransactionType.CopyTrade ? 'Copy Trade Order' : tx.type}
              </span>
            </div>

            {/* Order Number / ID */}
            <div className="flex justify-between items-start py-0.5">
              <span className="text-zinc-500 uppercase font-bold text-[9px] tracking-wider mt-1">Order Number</span>
              <div className="flex items-center gap-1.5 text-right">
                <span className="text-zinc-300 font-bold bg-zinc-950 px-2 py-1 rounded border border-zinc-900 text-[11px] font-mono tracking-wide">{tx.id.toUpperCase()}</span>
                <button
                  onClick={() => handleCopy(tx.id)}
                  className="p-1.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 active:scale-95 text-zinc-400 hover:text-white rounded-lg transition"
                  title="Copy Order Number"
                >
                  {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
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
                <div className="border-t border-zinc-850/40 my-2 pt-3" />
                
                {/* Copy Trader Section with Face Avatar */}
                <div className="flex justify-between items-center py-1.5 bg-zinc-950/80 p-3 rounded-2xl border border-zinc-850/60 shadow-inner">
                  <span className="text-zinc-500 uppercase font-bold text-[9px] tracking-wider font-mono">Expert Copy Trader</span>
                  <div className="flex items-center gap-2">
                    <img 
                      src={tx.traderAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face'} 
                      alt={tx.traderName || 'Trader'} 
                      referrerPolicy="no-referrer"
                      className="w-7 h-7 rounded-full border border-cyan-400/40 object-cover"
                    />
                    <span className="text-cyan-400 font-black tracking-wide text-[11px]">{tx.traderName || 'Elite Trader'}</span>
                  </div>
                </div>

                {/* Market Pair */}
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-zinc-500 uppercase font-bold text-[9px] tracking-wider">Market Trade Pair</span>
                  <span className="text-amber-400 font-black uppercase text-[11px] tracking-wider">{tx.tradePair || 'BTC/USDT'}</span>
                </div>

                {/* Settled Profit Return */}
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-zinc-500 uppercase font-bold text-[9px] tracking-wider">Return Profit Yield</span>
                  {tx.profit && tx.profit > 0 ? (
                    <span className="text-emerald-400 font-black font-mono">+{tx.profit.toFixed(2)} USDT</span>
                  ) : tx.status === TransactionStatus.Pending ? (
                    <span className="text-yellow-400 font-bold animate-pulse text-[10px]">Running (30m countdown)</span>
                  ) : (
                    <span className="text-zinc-500 font-bold">0.00 USDT</span>
                  )}
                </div>

                {/* Total Balance Return */}
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-zinc-500 uppercase font-bold text-[9px] tracking-wider">Settled Payout</span>
                  <span className="text-white font-black text-[11.5px]">
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
                <div className="border-t border-zinc-850/40 my-2 pt-3" />

                {/* Network Protocol */}
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-zinc-500 uppercase font-bold text-[9px] tracking-wider">Network Protocol</span>
                  <span className="text-white font-black font-mono tracking-wide">{tx.network || 'USDT-TRC20'}</span>
                </div>

                {/* Wallet Target Address */}
                {tx.address && (
                  <div className="flex flex-col gap-1.5 py-1">
                    <span className="text-zinc-500 uppercase font-bold text-[9px] tracking-wider">Destination Address</span>
                    <span className="text-zinc-400 font-bold text-[10px] bg-zinc-950 p-2.5 border border-zinc-900 rounded-xl break-all select-all leading-relaxed font-mono">
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
                <div className="border-t border-zinc-850/40 my-2 pt-3" />
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-zinc-500 uppercase font-bold text-[9px] tracking-wider">Staking Tier Yield</span>
                  <span className="text-purple-400 font-black uppercase tracking-wider text-[10px]">Elite Smart Staking</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-zinc-500 uppercase font-bold text-[9px] tracking-wider">Yield Interest Rate</span>
                  <span className="text-emerald-400 font-black">+18.4% APY</span>
                </div>
              </>
            )}

            {/* Bonus/Commission specific details */}
            {(tx.type === TransactionType.Bonus || tx.type === TransactionType.Commission) && (
              <>
                <div className="border-t border-zinc-850/40 my-2 pt-3" />
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-zinc-500 uppercase font-bold text-[9px] tracking-wider">Promo Category</span>
                  <span className="text-amber-400 font-black uppercase text-[10px] tracking-wider">
                    {tx.type === TransactionType.Bonus ? 'System Welcome Bonus' : 'Affiliate Team Commission'}
                  </span>
                </div>
              </>
            )}
          </div>

          <div className="relative my-4">
            <div className="border-t border-dashed border-zinc-800/85 w-full pt-1" />
          </div>

          {/* Secure Guarantee Tag */}
          <div className="flex items-center justify-center gap-1.5 text-zinc-500 text-[8.5px] font-black tracking-widest uppercase font-mono text-center">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            NGK SECURED LEDGER BLOCKCHAIN RECEIPT
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
            // Determine type-specific icons, labels and colors
            let icon = <Receipt size={16} />;
            let iconBg = 'bg-zinc-950 border-zinc-800 text-zinc-300';
            let amtPrefix = '';
            let amtColor = 'text-white';
            let txLabel = 'Transaction';
            let txDetail = 'Blockchain Ledger';

            if (tx.type === TransactionType.Deposit) {
              icon = <ArrowDownLeft size={16} />;
              iconBg = 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400';
              amtPrefix = '+';
              amtColor = 'text-emerald-400';
              txLabel = 'Ledger Node Deposit';
              txDetail = 'USDT • TRC20';
            } else if (tx.type === TransactionType.Withdraw) {
              icon = <ArrowUpRight size={16} />;
              iconBg = 'bg-rose-500/10 border-rose-500/25 text-rose-400';
              amtPrefix = '-';
              amtColor = 'text-rose-400';
              txLabel = 'Payout Withdrawal';
              txDetail = 'USDT • TRC20';
            } else if (tx.type === TransactionType.CopyTrade) {
              icon = <Copy size={15} />;
              iconBg = 'bg-cyan-500/10 border-cyan-500/25 text-cyan-400';
              amtColor = tx.status === TransactionStatus.Success ? 'text-emerald-400' : 'text-zinc-200';
              amtPrefix = tx.status === TransactionStatus.Success ? '+' : '';
              txLabel = tx.traderName ? `${tx.traderName} Copy Trade` : 'Expert Copy Trade';
              txDetail = tx.tradePair || 'BTC/USDT';
            } else if (tx.type === TransactionType.Staking) {
              icon = <Coins size={16} />;
              iconBg = 'bg-purple-500/10 border-purple-500/25 text-purple-400';
              amtColor = 'text-purple-400';
              txLabel = 'Secure Smart Stake';
              txDetail = 'Mainnet Pool';
            } else if (tx.type === TransactionType.Bonus || tx.type === TransactionType.Commission) {
              icon = <Gift size={16} />;
              iconBg = 'bg-amber-500/10 border-amber-500/25 text-amber-400';
              amtPrefix = '+';
              amtColor = 'text-amber-400';
              txLabel = tx.type === TransactionType.Bonus ? 'Promo Welcome Bonus' : 'Affiliate Commission';
              txDetail = 'Bonus Pool';
            }

            const dateObj = new Date(tx.timestamp);
            const yyyy = dateObj.getFullYear();
            const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
            const dd = String(dateObj.getDate()).padStart(2, '0');
            const hh = String(dateObj.getHours()).padStart(2, '0');
            const min = String(dateObj.getMinutes()).padStart(2, '0');
            const ss = String(dateObj.getSeconds()).padStart(2, '0');
            const formattedDate = `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;

            const displayAmount = tx.amount % 1 === 0 ? tx.amount.toString() : tx.amount.toFixed(2);

            return (
              <div 
                key={tx.id} 
                onClick={() => setSelectedTx(tx)}
                className="bg-gradient-to-b from-zinc-900/60 to-black border border-zinc-850 rounded-2xl p-4 transition relative overflow-hidden cursor-pointer hover:border-cyan-500/40 hover:from-zinc-900 hover:to-zinc-950 active:scale-[0.99] duration-200 flex items-center justify-between gap-3 shadow-md"
              >
                {/* Visual glow element on hover */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/[0.01] rounded-full blur-xl pointer-events-none" />

                <div className="flex items-center gap-3">
                  {/* Left Side: Themed Icon container */}
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${iconBg} shadow-inner`}>
                    {icon}
                  </div>

                  {/* Middle: Details & Timestamp */}
                  <div className="space-y-0.5 min-w-0">
                    <h3 className="text-[12.5px] font-black text-white tracking-wide truncate uppercase font-mono">
                      {txLabel}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[9px] font-mono text-zinc-500">
                      <span className="font-bold text-zinc-400">{txDetail}</span>
                      <span>•</span>
                      <span>{formattedDate}</span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Amount and compact Status Pill */}
                <div className="text-right flex flex-col items-end gap-1.5 shrink-0">
                  <h4 className={`text-xs sm:text-sm font-black font-mono tracking-tight ${amtColor}`}>
                    {amtPrefix}{displayAmount} <span className="text-[9px] text-zinc-400 font-bold uppercase">USDT</span>
                  </h4>
                  
                  {tx.status === TransactionStatus.Success ? (
                    <span className="inline-flex items-center gap-1 text-[8.5px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-bold uppercase font-mono">
                      <span className="w-1 h-1 bg-emerald-400 rounded-full" />
                      Success
                    </span>
                  ) : tx.status === TransactionStatus.Pending || tx.status === TransactionStatus.Hold ? (
                    <span className="inline-flex items-center gap-1 text-[8.5px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded-full font-bold uppercase font-mono animate-pulse">
                      <span className="w-1 h-1 bg-amber-400 rounded-full animate-ping" />
                      Pending
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[8.5px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2.5 py-0.5 rounded-full font-bold uppercase font-mono">
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
