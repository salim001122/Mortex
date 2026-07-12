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
  Receipt 
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

  const filters = ['All', 'Deposit', 'Withdraw', 'CopyTrade', 'Staking'];

  const filteredTransactions = filter === 'All' 
    ? transactions 
    : transactions.filter(tx => tx.type === filter);

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

            const formattedDate = new Date(tx.timestamp).toLocaleString(undefined, {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <div 
                key={tx.id} 
                className="coding-card rounded-xl p-4 transition relative overflow-hidden"
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${iconBg}`}>
                      {icon}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">{tx.type}</h4>
                      <p className="text-[10px] text-zinc-500 flex items-center gap-1.5 mt-1 font-mono">
                        <Clock size={10} /> {formattedDate}
                      </p>
                    </div>
                  </div>

                  {/* Status Badges */}
                  <div className="flex items-center gap-1.5">
                    {tx.status === TransactionStatus.Pending && (
                      <>
                        <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse" />
                        <span className="text-[9px] font-bold text-yellow-400 uppercase tracking-wide font-mono">Pending</span>
                      </>
                    )}
                    {tx.status === TransactionStatus.Success && (
                      <>
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                        <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wide font-mono">Success</span>
                      </>
                    )}
                    {tx.status === TransactionStatus.Failed && (
                      <>
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                        <span className="text-[9px] font-bold text-red-500 uppercase tracking-wide font-mono">Failed</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Amount details */}
                <div className="mt-4 flex justify-between items-end border-t border-zinc-800/80 pt-3">
                  <div>
                    <span className={`text-sm font-mono font-bold ${amtColor}`}>
                      {amtPrefix}{tx.amount.toFixed(2)} USDT
                    </span>
                    
                    {/* Nested specifications details */}
                    {tx.bonus && tx.bonus > 0 && (
                      <p className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 mt-1 uppercase font-mono">
                        <Gift size={8} /> +{tx.bonus.toFixed(2)} USDT Bonus
                      </p>
                    )}
                    {tx.profit && tx.profit > 0 && (
                      <p className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 mt-1 uppercase font-mono">
                        <Coins size={8} /> +{tx.profit.toFixed(2)} USDT Profit Paid
                      </p>
                    )}
                    {tx.network && (
                      <p className="text-[10px] text-zinc-500 mt-1 font-mono">
                        Network: {tx.network} {tx.address ? `· Address: ${tx.address.slice(0, 6)}...${tx.address.slice(-4)}` : ''}
                      </p>
                    )}
                    {tx.traderName && (
                      <p className="text-[10px] text-cyan-400 font-bold mt-1 uppercase font-mono">
                        Trader: {tx.traderName}
                      </p>
                    )}
                  </div>
                  
                  <span className="text-[9px] text-zinc-550 font-mono">#{tx.id.slice(0, 8).toUpperCase()}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}
