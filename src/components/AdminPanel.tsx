import { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Check, 
  X, 
  Search, 
  TrendingUp, 
  TrendingDown, 
  RefreshCw,
  Clock,
  Shield,
  User as UserIcon,
  HelpCircle,
  Percent
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  updateDoc, 
  doc, 
  getDoc,
  increment,
  setDoc,
  getDocs,
  where
} from 'firebase/firestore';
import { db } from '../firebase';
import { User, Transaction, TransactionStatus, TransactionType } from '../types';

interface AdminPanelProps {
  onNavigate: (screen: string) => void;
  currentUser: User;
  showToast: (msg: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export default function AdminPanel({ onNavigate, currentUser, showToast }: AdminPanelProps) {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'deposit' | 'withdraw'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'Pending' | 'Success' | 'Rejected'>('Pending');
  const [processingTxId, setProcessingTxId] = useState<string | null>(null);

  // Load transactions in real-time
  useEffect(() => {
    const q = query(collection(db, 'admin_pending'), orderBy('timestamp', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const txs: any[] = [];
      snapshot.forEach((doc) => {
        txs.push({ id: doc.id, ...doc.data() });
      });
      setTransactions(txs);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching admin transactions: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Filter transactions
  const filteredTxs = transactions.filter(tx => {
    const matchesSearch = 
      (tx.username || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tx.userEmail || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tx.id || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = 
      filterType === 'all' || 
      tx.type?.toLowerCase() === filterType.toLowerCase();

    const matchesStatus = 
      filterStatus === 'all' || 
      tx.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  // Action: Approve
  const handleApprove = async (tx: any) => {
    if (processingTxId) return;
    setProcessingTxId(tx.id);

    try {
      // 1. Update in admin_pending
      await updateDoc(doc(db, 'admin_pending', tx.id), { status: 'Success' });

      // 2. Update user transaction log
      const userTxRef = doc(db, 'users', tx.userId, 'transactions', tx.id);
      await updateDoc(userTxRef, { status: 'Success' });

      // 3. Update type-specific subcollection (deposit/withdraw)
      const subCollName = tx.type === 'Deposit' ? 'deposit' : 'withdraw';
      const subDocRef = doc(db, 'users', tx.userId, subCollName, tx.id);
      await updateDoc(subDocRef, { status: 'Success' });

      // 4. Update balance
      if (tx.type === 'Deposit') {
        const totalCredit = tx.amount + (tx.bonus || 0);
        
        // Load the target user to see if they are referred
        const userDocRef = doc(db, 'users', tx.userId);
        const userSnap = await getDoc(userDocRef);
        
        await updateDoc(userDocRef, {
          mainBalance: increment(totalCredit)
        });

        if (userSnap.exists()) {
          const userObj = userSnap.data();
          // Pay referral commission if exists
          if (userObj.invitedBy) {
            const referrersQuery = query(collection(db, 'users'), where('referralCode', '==', userObj.invitedBy));
            const referrersSnap = await getDocs(referrersQuery);
            if (!referrersSnap.empty) {
              const referrerSnap = referrersSnap.docs[0];
              const referrerUid = referrerSnap.id;
              const commissionAmount = tx.amount * 0.05; // 5% L1 Referral Reward

              await updateDoc(doc(db, 'users', referrerUid), {
                mainBalance: increment(commissionAmount),
                totalCommission: increment(commissionAmount),
                teamVolume: increment(tx.amount)
              });

              const refTxId = 'NGK-REF-' + Math.random().toString(36).substring(2, 9).toUpperCase();
              const refTx: Transaction = {
                id: refTxId,
                userId: referrerUid,
                type: TransactionType.Commission,
                amount: commissionAmount,
                status: TransactionStatus.Success,
                timestamp: new Date().toISOString(),
                traderName: `Ref: ${userObj.username || 'Investor'}`
              };

              await setDoc(doc(db, 'users', referrerUid, 'transactions', refTxId), refTx);
              await setDoc(doc(db, 'users', referrerUid, 'refers', refTxId), {
                ...refTx,
                subMemberName: userObj.username || 'Investor',
                level: 1
              });
            }
          }
        }
        
        showToast(`Deposit of $${tx.amount.toFixed(2)} USDT (+$${(tx.bonus || 0).toFixed(2)} Bonus) APPROVED! Balance updated.`, 'success');
      } else {
        // For Withdrawal, the amount is already deducted from balance when user requested.
        // So we just complete it.
        showToast(`Withdrawal of $${tx.amount.toFixed(2)} USDT APPROVED! Released on block.`, 'success');
      }

    } catch (err) {
      console.error("Error approving transaction:", err);
      showToast("Approve operation failed.", "error");
    } finally {
      setProcessingTxId(null);
    }
  };

  // Action: Reject
  const handleReject = async (tx: any) => {
    if (processingTxId) return;
    setProcessingTxId(tx.id);

    try {
      // 1. Update in admin_pending
      await updateDoc(doc(db, 'admin_pending', tx.id), { status: 'Rejected' });

      // 2. Update user transactions log
      const userTxRef = doc(db, 'users', tx.userId, 'transactions', tx.id);
      await updateDoc(userTxRef, { status: 'Rejected' });

      // 3. Update type-specific log
      const subCollName = tx.type === 'Deposit' ? 'deposit' : 'withdraw';
      const subDocRef = doc(db, 'users', tx.userId, subCollName, tx.id);
      await updateDoc(subDocRef, { status: 'Rejected' });

      // 4. Refund balance if it was a withdrawal
      if (tx.type === 'Withdraw') {
        const userDocRef = doc(db, 'users', tx.userId);
        await updateDoc(userDocRef, {
          mainBalance: increment(tx.amount)
        });
        showToast(`Withdrawal of $${tx.amount.toFixed(2)} USDT REJECTED. Refunded to user balance.`, 'warning');
      } else {
        showToast(`Deposit of $${tx.amount.toFixed(2)} USDT REJECTED.`, 'error');
      }

    } catch (err) {
      console.error("Error rejecting transaction:", err);
      showToast("Reject operation failed.", "error");
    } finally {
      setProcessingTxId(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-4 px-4 pb-12 flex flex-col min-h-[calc(100vh-140px)]"
    >
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => onNavigate('more')} 
            className="text-zinc-400 hover:text-white transition p-1.5 hover:bg-zinc-850 rounded-lg"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight uppercase font-mono">NGK ADMIN PORTAL</h2>
            <p className="text-[10px] text-cyan-400 font-bold uppercase font-mono tracking-wider flex items-center gap-1">
              <Shield size={10} /> Authorized Ledger Administrator
            </p>
          </div>
        </div>
        <div className="bg-zinc-950 px-2 py-1 rounded text-[9px] border border-zinc-850 font-mono text-zinc-500 uppercase tracking-widest">
          ONLINE
        </div>
      </div>

      {/* Stats Counter Row */}
      <div className="grid grid-cols-3 gap-2.5 shrink-0">
        <div className="bg-zinc-900/40 p-3 rounded-xl border border-zinc-850 text-center">
          <span className="text-[8px] text-zinc-500 uppercase font-mono font-bold block">Pending Requests</span>
          <span className="text-base font-black text-amber-400 font-mono block mt-1">
            {transactions.filter(t => t.status === 'Pending').length}
          </span>
        </div>
        <div className="bg-zinc-900/40 p-3 rounded-xl border border-zinc-850 text-center">
          <span className="text-[8px] text-zinc-500 uppercase font-mono font-bold block">Approved</span>
          <span className="text-base font-black text-emerald-400 font-mono block mt-1">
            {transactions.filter(t => t.status === 'Success').length}
          </span>
        </div>
        <div className="bg-zinc-900/40 p-3 rounded-xl border border-zinc-850 text-center">
          <span className="text-[8px] text-zinc-500 uppercase font-mono font-bold block">Rejected</span>
          <span className="text-base font-black text-rose-500 font-mono block mt-1">
            {transactions.filter(t => t.status === 'Rejected').length}
          </span>
        </div>
      </div>

      {/* Filters Area */}
      <div className="bg-zinc-900/20 border border-zinc-850 rounded-xl p-3 space-y-2.5 shrink-0">
        {/* Search Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
            <Search size={14} />
          </div>
          <input 
            type="text" 
            placeholder="Search by Username, Email, or TX ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-850 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-550 focus:outline-none focus:border-cyan-500 font-mono transition"
          />
        </div>

        {/* Tab Switchers */}
        <div className="grid grid-cols-2 gap-2">
          {/* Status Tab */}
          <div className="flex gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-850/60">
            {(['Pending', 'Success', 'Rejected', 'all'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`flex-1 text-[9px] py-1 font-bold rounded uppercase tracking-wider font-mono transition ${
                  filterStatus === st 
                    ? 'bg-zinc-800 text-cyan-400 shadow-sm' 
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {st === 'all' ? 'All' : st}
              </button>
            ))}
          </div>

          {/* Type Tab */}
          <div className="flex gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-850/60">
            {(['all', 'deposit', 'withdraw'] as const).map((tp) => (
              <button
                key={tp}
                onClick={() => setFilterType(tp)}
                className={`flex-1 text-[9px] py-1 font-bold rounded uppercase tracking-wider font-mono transition ${
                  filterType === tp 
                    ? 'bg-zinc-800 text-cyan-400 shadow-sm' 
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {tp === 'all' ? 'All' : tp}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Transaction List View */}
      <div className="flex-1 overflow-y-auto bg-zinc-950/40 border border-zinc-900 rounded-2xl p-3 min-h-[220px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <RefreshCw size={24} className="text-cyan-400 animate-spin" />
            <span className="text-xs text-zinc-500 font-bold uppercase font-mono tracking-wider">Syncing Ledger...</span>
          </div>
        ) : filteredTxs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2 text-center">
            <Clock size={28} className="text-zinc-750" />
            <h4 className="text-xs font-bold text-zinc-400 font-mono uppercase mt-2">No Matching Requests</h4>
            <p className="text-[10px] text-zinc-650 max-w-[200px]">All user deposits and withdrawals are processed and up to date.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTxs.map((tx) => {
              const isDeposit = tx.type === 'Deposit';
              const isPending = tx.status === 'Pending';
              const isSuccess = tx.status === 'Success';
              const isRejected = tx.status === 'Rejected';

              return (
                <div 
                  key={tx.id} 
                  className={`border rounded-xl p-3.5 space-y-3 font-mono transition-all duration-200 ${
                    isPending 
                      ? 'bg-zinc-900/30 border-amber-500/20 shadow-sm shadow-amber-500/2' 
                      : isSuccess 
                        ? 'bg-zinc-900/10 border-zinc-900 opacity-70' 
                        : 'bg-zinc-900/10 border-zinc-950 opacity-60'
                  }`}
                >
                  {/* Top user / status header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500">
                        <UserIcon size={12} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white leading-none">{tx.username || 'Investor'}</h4>
                        <span className="text-[9px] text-zinc-500">{tx.userEmail}</span>
                      </div>
                    </div>

                    <span className={`text-[8px] font-bold px-2 py-0.5 rounded border uppercase ${
                      isPending 
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                        : isSuccess 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}>
                      {tx.status}
                    </span>
                  </div>

                  {/* Transaction info body */}
                  <div className="grid grid-cols-2 gap-2 bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-850/60 text-[10px]">
                    <div>
                      <span className="text-zinc-500 block uppercase text-[8px] tracking-wider">Type / Amount</span>
                      <div className="flex items-center gap-1 font-bold mt-0.5">
                        {isDeposit ? (
                          <TrendingUp size={11} className="text-emerald-400" />
                        ) : (
                          <TrendingDown size={11} className="text-rose-400" />
                        )}
                        <span className={isDeposit ? 'text-emerald-400' : 'text-rose-400'}>
                          {isDeposit ? 'DEPOSIT' : 'WITHDRAW'}
                        </span>
                        <span className="text-white block ml-1">${tx.amount?.toFixed(2)}</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-zinc-500 block uppercase text-[8px] tracking-wider">Network / Address</span>
                      <span className="text-white block mt-0.5 font-bold truncate">
                        {tx.network ? `${tx.network} - ` : ''}
                        {tx.address ? `${tx.address.slice(0, 5)}...${tx.address.slice(-4)}` : 'Blockchain'}
                      </span>
                    </div>

                    {isDeposit && tx.bonus > 0 && (
                      <div className="col-span-2 pt-1 border-t border-zinc-900 flex items-center gap-1.5 text-[9px] text-zinc-400">
                        <Percent size={10} className="text-cyan-400" />
                        <span>Includes welcome promotion:</span>
                        <span className="text-emerald-400 font-bold font-mono">+${tx.bonus.toFixed(2)} USDT bonus</span>
                      </div>
                    )}
                  </div>

                  {/* ID & Date row */}
                  <div className="flex justify-between items-center text-[9px] text-zinc-500">
                    <span>ID: <span className="text-zinc-400 select-all font-bold">{tx.id}</span></span>
                    <span>{new Date(tx.timestamp).toLocaleString()}</span>
                  </div>

                  {/* Pending actions */}
                  {isPending && (
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handleReject(tx)}
                        disabled={processingTxId !== null}
                        className="flex-1 border border-rose-500/25 hover:bg-rose-500/10 text-rose-400 py-2 rounded text-[10px] font-bold uppercase tracking-wider transition flex items-center justify-center gap-1 bg-rose-500/5"
                      >
                        {processingTxId === tx.id ? (
                          <span className="w-2.5 h-2.5 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <X size={12} />
                        )}
                        Reject
                      </button>
                      <button
                        onClick={() => handleApprove(tx)}
                        disabled={processingTxId !== null}
                        className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-zinc-950 py-2 rounded text-[10px] font-black uppercase tracking-wider transition flex items-center justify-center gap-1"
                      >
                        {processingTxId === tx.id ? (
                          <span className="w-2.5 h-2.5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Check size={12} />
                        )}
                        Approve
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
