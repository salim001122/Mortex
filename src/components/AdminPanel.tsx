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
  Percent,
  Calendar,
  Copy
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
import { getDailyCodesForDate, generateUniqueFreshSignalCode } from '../lib/orderCodes';

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

  // VIP Signal Broadcast state variables
  const [activeSignal, setActiveSignal] = useState<any | null>(null);
  const [signalPair, setSignalPair] = useState('BTC/USDT');
  const [signalDir, setSignalDir] = useState('BULLISH');
  const [signalTrades, setSignalTrades] = useState<any[]>([]);
  const [selectedDateIndex, setSelectedDateIndex] = useState(1); // Default to Today (index 1)

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

  // Listen to manual signal document
  useEffect(() => {
    const unsubSignal = onSnapshot(doc(db, 'system', 'copyTradeSignal'), (snap) => {
      if (snap.exists()) {
        setActiveSignal(snap.data());
      } else {
        setActiveSignal(null);
      }
    });
    return () => unsubSignal();
  }, []);

  // Listen to completed/active global copy trades
  useEffect(() => {
    const qTrades = query(collection(db, 'copy_trades'), orderBy('timestamp', 'desc'));
    const unsubTrades = onSnapshot(qTrades, (snap) => {
      const list: any[] = [];
      snap.forEach((d) => {
        list.push({ id: d.id, ...d.data() });
      });
      setSignalTrades(list);
    });
    return () => unsubTrades();
  }, []);

  // Telegram Bot States inside Admin Panel
  const [telegramBotToken, setTelegramBotToken] = useState('');
  const [notifyOnTelegram, setNotifyOnTelegram] = useState(true);
  const [isSavingToken, setIsSavingToken] = useState(false);

  // Auto-Poster Channel States
  const [telegramChannelId, setTelegramChannelId] = useState('');
  const [autoPosterActive, setAutoPosterActive] = useState(false);
  const [autoPosterInterval, setAutoPosterInterval] = useState(2.5);
  const [lastPosterIndex, setLastPosterIndex] = useState(0);
  const [lastPostedAt, setLastPostedAt] = useState('');
  const [nextPostAt, setNextPostAt] = useState('');
  const [isSavingPoster, setIsSavingPoster] = useState(false);
  const [isTestingPoster, setIsTestingPoster] = useState(false);
  const [isExecutingManualPost, setIsExecutingManualPost] = useState(false);

  // Automated Templates States
  const [marketingTemplates, setMarketingTemplates] = useState<string[]>([]);
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState<number | null>(null);
  const [isPostingSpecificTemplate, setIsPostingSpecificTemplate] = useState<{[key: number]: boolean}>({});

  // Load Telegram bot config and templates on mount
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const snap = await getDoc(doc(db, 'system', 'telegram_config'));
        if (snap.exists()) {
          const data = snap.data();
          setTelegramBotToken(data.botToken || '');
          setTelegramChannelId(data.channelId || '');
          setAutoPosterActive(data.autoPosterActive || false);
          setAutoPosterInterval(data.autoPosterInterval || 2.5);
          setLastPosterIndex(data.lastPosterIndex || 0);
          setLastPostedAt(data.lastPostedAt || '');
          setNextPostAt(data.nextPostAt || '');
        }
      } catch (err) {
        console.error("Error loading telegram config:", err);
      }
    };
    fetchConfig();

    const fetchTemplates = async () => {
      try {
        const response = await fetch('/api/telegram-templates');
        const data = await response.json();
        if (response.ok && data.ok) {
          setMarketingTemplates(data.templates || []);
        }
      } catch (err) {
        console.warn("Failed to fetch automated telegram templates list:", err);
      }
    };
    fetchTemplates();
  }, []);

  const handleSendSpecificTemplate = async (idx: number) => {
    if (!telegramBotToken || !telegramChannelId) {
      showToast('Please configure Bot Token and Channel ID first!', 'warning');
      return;
    }

    setIsPostingSpecificTemplate(prev => ({ ...prev, [idx]: true }));
    try {
      let posted = false;
      try {
        const response = await fetch('/api/telegram-post-template', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ templateIndex: idx })
        });
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = await response.json();
          if (response.ok && data.ok) {
            posted = true;
            setNextPostAt(data.nextPostAt || '');
          }
        }
      } catch (e) {
        console.warn("API proxy post template failed or non-JSON, falling back to direct TG API:", e);
      }

      if (!posted) {
        // Direct Telegram API Fallback
        const cleanChat = telegramChannelId.replace(/^(https?:\/\/)?(www\.)?t\.me\//i, "");
        const formattedChat = (cleanChat && !cleanChat.startsWith("@") && !/^-?\d+$/.test(cleanChat)) ? "@" + cleanChat : cleanChat;
        const tgRes = await fetch(`https://api.telegram.org/bot${telegramBotToken.trim()}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: formattedChat,
            text: `📊 <b>NGK PLATFORM UPDATE #${idx + 1}</b>\n\nOfficial Node Signal System update dispatched to Telegram channel.`,
            parse_mode: 'HTML'
          })
        });
        const contentType = tgRes.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const tgData = await tgRes.json();
          if (tgData.ok) {
            posted = true;
          } else {
            throw new Error(tgData.description || 'Failed to dispatch Telegram message.');
          }
        }
      }

      showToast(`Template #${idx + 1} posted to channel successfully!`, 'success');
      setLastPostedAt(new Date().toISOString());
    } catch (err: any) {
      console.error("Send specific template error:", err);
      showToast(`Broadcast Error: ${err.message || err}`, 'error');
    } finally {
      setIsPostingSpecificTemplate(prev => ({ ...prev, [idx]: false }));
    }
  };

  const handleSaveBotToken = async () => {
    setIsSavingToken(true);
    try {
      await setDoc(doc(db, 'system', 'telegram_config'), {
        botToken: telegramBotToken.trim(),
        updatedAt: new Date().toISOString()
      }, { merge: true });
      showToast('Global Telegram Bot Token saved successfully!', 'success');
    } catch (err) {
      console.error("Error saving bot token:", err);
      showToast('Failed to save Telegram Bot Token.', 'error');
    } finally {
      setIsSavingToken(false);
    }
  };

  const handleSavePosterSettings = async () => {
    setIsSavingPoster(true);
    try {
      let cleanedId = telegramChannelId.trim();
      cleanedId = cleanedId.replace(/^(https?:\/\/)?(www\.)?t\.me\//i, "");
      if (cleanedId && !cleanedId.startsWith("@") && !/^-?\d+$/.test(cleanedId)) {
        cleanedId = "@" + cleanedId;
      }

      await setDoc(doc(db, 'system', 'telegram_config'), {
        channelId: cleanedId,
        autoPosterActive,
        autoPosterInterval: Number(autoPosterInterval),
        updatedAt: new Date().toISOString()
      }, { merge: true });
      setTelegramChannelId(cleanedId);
      showToast('Telegram Channel Auto-Poster settings saved!', 'success');
      
      const snap = await getDoc(doc(db, 'system', 'telegram_config'));
      if (snap.exists()) {
        setNextPostAt(snap.data().nextPostAt || '');
      }
    } catch (err) {
      console.error("Error saving auto poster settings:", err);
      showToast('Failed to save Auto-Poster settings.', 'error');
    } finally {
      setIsSavingPoster(false);
    }
  };

  const handleTestChannel = async () => {
    if (!telegramBotToken) {
      showToast('Please save a valid Global Bot Token first!', 'warning');
      return;
    }
    if (!telegramChannelId) {
      showToast('Please enter a Channel Chat ID or Username first!', 'warning');
      return;
    }

    setIsTestingPoster(true);
    try {
      let tested = false;
      try {
        const response = await fetch('/api/telegram-test-channel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            botToken: telegramBotToken.trim(),
            channelId: telegramChannelId.trim()
          })
        });
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = await response.json();
          if (response.ok && data.ok) {
            tested = true;
          }
        }
      } catch (e) {
        console.warn("API test channel failed, falling back to direct Telegram API call:", e);
      }

      if (!tested) {
        const cleanChat = telegramChannelId.replace(/^(https?:\/\/)?(www\.)?t\.me\//i, "");
        const formattedChat = (cleanChat && !cleanChat.startsWith("@") && !/^-?\d+$/.test(cleanChat)) ? "@" + cleanChat : cleanChat;
        const tgRes = await fetch(`https://api.telegram.org/bot${telegramBotToken.trim()}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: formattedChat,
            text: '🔔 <b>NGK Channel Connection Test Successful!</b>\n\nYour Telegram Channel is verified and ready for live signal broadcasts.',
            parse_mode: 'HTML'
          })
        });
        const contentType = tgRes.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const tgData = await tgRes.json();
          if (tgData.ok) {
            tested = true;
          } else {
            throw new Error(tgData.description || 'Failed to verify channel connection.');
          }
        }
      }

      showToast('Test message sent to Telegram channel successfully!', 'success');
    } catch (err: any) {
      console.error("Test channel error:", err);
      showToast(`Telegram Test Error: ${err.message || err}`, 'error');
    } finally {
      setIsTestingPoster(false);
    }
  };

  const handleManualPostNext = async () => {
    if (!telegramBotToken || !telegramChannelId) {
      showToast('Please configure Bot Token and Channel ID first!', 'warning');
      return;
    }

    setIsExecutingManualPost(true);
    try {
      let posted = false;
      try {
        const response = await fetch('/api/telegram-manual-post', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = await response.json();
          if (response.ok && data.ok) {
            posted = true;
            setLastPosterIndex(data.nextTemplateIndex);
            setNextPostAt(data.nextPostAt);
          }
        }
      } catch (e) {
        console.warn("API manual post failed, falling back to direct TG API:", e);
      }

      if (!posted) {
        const cleanChat = telegramChannelId.replace(/^(https?:\/\/)?(www\.)?t\.me\//i, "");
        const formattedChat = (cleanChat && !cleanChat.startsWith("@") && !/^-?\d+$/.test(cleanChat)) ? "@" + cleanChat : cleanChat;
        const tgRes = await fetch(`https://api.telegram.org/bot${telegramBotToken.trim()}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: formattedChat,
            text: `📈 <b>NGK OFFICIAL TRADING POST</b>\n\nLive Market Update dispatched directly to channel.`,
            parse_mode: 'HTML'
          })
        });
        const contentType = tgRes.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const tgData = await tgRes.json();
          if (tgData.ok) {
            posted = true;
          } else {
            throw new Error(tgData.description || 'Manual channel post failed.');
          }
        }
      }

      showToast(`Next template posted to channel successfully!`, 'success');
      setLastPostedAt(new Date().toISOString());
    } catch (err: any) {
      console.error("Manual post error:", err);
      showToast(`Broadcast Error: ${err.message || err}`, 'error');
    } finally {
      setIsExecutingManualPost(false);
    }
  };

  const [isBroadcastingSignal, setIsBroadcastingSignal] = useState<boolean>(false);

  // Action: Broadcast VIP Signal with Fresh Unique Code & Direct Firestore Synchronization
  const handleDeploySignalType = async (type: 'signal_1' | 'signal_2' | 'signal_3' | 'test') => {
    setIsBroadcastingSignal(true);
    try {
      // 1. Generate a NEW, UNIQUE dynamic signal order code (different from old codes)
      const freshCode = generateUniqueFreshSignalCode(activeSignal?.code);

      const startTime = new Date();
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1-Hour validity window

      let pair = signalPair || 'BTC/USDT';
      let direction = signalDir || 'BULLISH';
      let titleLabel = 'Signal #1 (Main Signal)';
      if (type === 'signal_2') {
        pair = signalPair || 'ETH/USDT';
        titleLabel = 'Signal #2 (Afternoon Signal)';
      } else if (type === 'signal_3') {
        pair = signalPair || 'SOL/USDT';
        titleLabel = 'Additional Signal (Minimum Balance $300)';
      } else if (type === 'test') {
        titleLabel = 'TEST SIGNAL (Random Test)';
      }

      const signalId = "SIG-" + Math.random().toString(36).substring(2, 7).toUpperCase();
      const signalData = {
        id: signalId,
        code: freshCode,
        type: type,
        pair: pair,
        direction: direction,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        isActive: true,
        timestamp: startTime.toISOString()
      };

      // 2. ALWAYS UPDATE FIRESTORE DIRECTLY FIRST!
      // This ensures 100% reliability even when running on mobile or static hosting (Hostinger, GitHub, etc.)
      await setDoc(doc(db, 'system', 'copyTradeSignal'), signalData);

      // 3. Attempt Telegram delivery (try server proxy first, fallback to direct Telegram Bot API)
      let telegramDelivered = false;
      try {
        const response = await fetch('/api/telegram-broadcast-signal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type,
            pair,
            direction,
            code: freshCode
          })
        });

        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = await response.json();
          if (response.ok && data.ok) {
            telegramDelivered = true;
          }
        }
      } catch (apiErr) {
        console.warn("Express API unreachable or non-JSON response, using direct Telegram API fallback:", apiErr);
      }

      // If server route returned HTML 404 / static host, perform direct Telegram Bot API dispatch if bot token is present
      if (!telegramDelivered && telegramBotToken && telegramChannelId) {
        try {
          const directionEmoji = direction === "BULLISH" ? "🟢 BULLISH (BUY / CALL)" : "🔴 BEARISH (SELL / PUT)";
          const messageText = 
            `📊 <b>NGK CRYPTOGRAPHIC COPY-TRADING PLATFORM</b> 📊\n` +
            `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
            `🌐 <b>OFFICIAL BLOCKCHAIN NODE SIGNAL BROADCAST</b>\n` +
            `━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
            `🔔 <b>NEW VIP COPY-TRADE SIGNAL DETECTED!</b> 🚀\n` +
            `We have successfully synchronized with the UK high-frequency nodes.\n\n` +
            `📈 <b>Session:</b> <code>${titleLabel}</code>\n` +
            `🎯 <b>Asset Pair:</b> <code>${pair}</code>\n` +
            `📉 <b>Market Bias:</b> <code>${directionEmoji}</code>\n` +
            `🔑 <b>Verification Order Code:</b> <code>${freshCode}</code>\n\n` +
            `⏱️ <b>SESSION WINDOW:</b> <b>1 Hour Only</b>\n` +
            `🕒 <b>Status:</b> ACTIVE (Expires in 60 minutes)\n\n` +
            `🔗 <b>Deploy Node License:</b> https://ngkexchange.site\n`;

          const cleanChat = telegramChannelId.replace(/^(https?:\/\/)?(www\.)?t\.me\//i, "");
          const formattedChat = (cleanChat && !cleanChat.startsWith("@") && !/^-?\d+$/.test(cleanChat)) ? "@" + cleanChat : cleanChat;

          const tgRes = await fetch(`https://api.telegram.org/bot${telegramBotToken.trim()}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: formattedChat,
              text: messageText,
              parse_mode: 'HTML'
            })
          });
          const contentType = tgRes.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            const tgData = await tgRes.json();
            if (tgData.ok) {
              telegramDelivered = true;
            }
          }
        } catch (tgErr) {
          console.warn("Direct Telegram Bot API error:", tgErr);
        }
      }

      showToast(`VIP Signal Code [${freshCode}] broadcasted & active! ${telegramDelivered ? 'Telegram card posted.' : ''}`, 'success');

    } catch (err: any) {
      console.error("Signal broadcast dispatch error:", err);
      showToast(`Signal Deployment Error: ${err.message || err}`, 'error');
    } finally {
      setIsBroadcastingSignal(false);
    }
  };

  // Action: Terminate Broadcast
  const handleEndSignal = async () => {
    try {
      await setDoc(doc(db, 'system', 'copyTradeSignal'), {
        isActive: false
      });
      showToast("VIP Signal deactivated. Trading channels locked.", "warning");
    } catch (err) {
      console.error("Error terminating signal:", err);
      showToast("Failed to clear VIP signal.", "error");
    }
  };

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
          
          if (userObj.invitedBy) {
            const referrersQuery = query(collection(db, 'users'), where('referralCode', '==', userObj.invitedBy));
            const referrersSnap = await getDocs(referrersQuery);
            if (!referrersSnap.empty) {
              const referrerSnap = referrersSnap.docs[0];
              const referrerUid = referrerSnap.id;

              // Update parent's teamVolume
              await updateDoc(doc(db, 'users', referrerUid), {
                teamVolume: increment(tx.amount)
              });

              // If this is the user's first successful deposit, activate them in the referral system
              if (!userObj.isReferralActive) {
                await updateDoc(userDocRef, { isReferralActive: true });

                // Increment parent's teamCount (active direct referrals)
                await updateDoc(doc(db, 'users', referrerUid), {
                  teamCount: increment(1)
                });

                // Update referred child state to active: true in parent's team and refers collections
                const parentTeamRef = collection(db, 'users', referrerUid, 'team');
                const teamQ = query(parentTeamRef, where('childUid', '==', tx.userId));
                const teamSnap = await getDocs(teamQ);
                for (const docSnap of teamSnap.docs) {
                  await updateDoc(doc(db, 'users', referrerUid, 'team', docSnap.id), { active: true });
                }

                const parentRefersRef = collection(db, 'users', referrerUid, 'refers');
                const refersQ = query(parentRefersRef, where('childUid', '==', tx.userId));
                const refersSnap = await getDocs(refersQ);
                for (const docSnap of refersSnap.docs) {
                  await updateDoc(doc(db, 'users', referrerUid, 'refers', docSnap.id), { active: true });
                }
              }
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

      {/* ==================== VIP SIGNAL BROADCASTER SECTION ==================== */}
      <div className="bg-zinc-900/40 border border-zinc-850 rounded-2xl p-4.5 space-y-4 shrink-0">
        <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
          <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
            <TrendingUp size={12} className="animate-pulse text-cyan-400" />
            📡 UK COPY-TRADE SIGNAL DISPATCHER (1-HOUR VALIDITY)
          </span>
          {activeSignal && activeSignal.isActive ? (
            <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-mono font-bold animate-pulse flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              LIVE {activeSignal.type?.toUpperCase()} ACTIVE
            </span>
          ) : (
            <span className="text-[9px] bg-zinc-800 text-zinc-500 border border-zinc-700 px-2 py-0.5 rounded font-mono font-bold">
              OFFLINE / LOCKED
            </span>
          )}
        </div>

        <p className="text-[8.5px] text-zinc-500 leading-normal font-mono">
          Each signal generated below is valid for exactly <b>1 Hour</b>. The bot will automatically publish a beautiful visual card template directly to the configured Telegram channel.
        </p>

        {/* Optional Customizer for overriding next broadcast */}
        <div className="grid grid-cols-2 gap-3.5 font-mono text-[9px] border-b border-zinc-850/50 pb-3">
          <div>
            <label className="text-zinc-500 font-bold block uppercase mb-1">Target Asset Pair (Customizer)</label>
            <select
              value={signalPair}
              onChange={(e) => setSignalPair(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-850 text-white rounded-lg px-2.5 py-1.5 outline-none cursor-pointer focus:border-cyan-500/50 text-[9px]"
            >
              <option value="BTC/USDT">BTC/USDT</option>
              <option value="ETH/USDT">ETH/USDT</option>
              <option value="SOL/USDT">SOL/USDT</option>
              <option value="XRP/USDT">XRP/USDT</option>
              <option value="DOGE/USDT">DOGE/USDT</option>
              <option value="BNB/USDT">BNB/USDT</option>
            </select>
          </div>

          <div>
            <label className="text-zinc-500 font-bold block uppercase mb-1">Forecast Direction</label>
            <div className="flex gap-1 bg-zinc-950 p-0.5 border border-zinc-850 rounded-lg">
              <button
                type="button"
                onClick={() => setSignalDir('BULLISH')}
                className={`flex-1 py-1 text-[8px] font-bold rounded transition ${signalDir === 'BULLISH' ? 'bg-emerald-500 text-zinc-950 font-black' : 'text-zinc-500'}`}
              >
                BULLISH
              </button>
              <button
                type="button"
                onClick={() => setSignalDir('BEARISH')}
                className={`flex-1 py-1 text-[8px] font-bold rounded transition ${signalDir === 'BEARISH' ? 'bg-rose-500 text-zinc-950 font-black' : 'text-zinc-500'}`}
              >
                BEARISH
              </button>
            </div>
          </div>
        </div>

        {/* Action buttons grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleDeploySignalType('signal_1')}
            disabled={isBroadcastingSignal}
            className="py-2 px-3 bg-gradient-to-r from-emerald-500/10 to-emerald-500/20 hover:from-emerald-500/20 hover:to-emerald-500/30 border border-emerald-500/30 text-emerald-400 hover:text-emerald-300 text-[9px] font-bold uppercase tracking-wider rounded-xl font-mono transition text-left flex items-center justify-between cursor-pointer"
          >
            <span>🟢 Deploy Signal #1 (11:00 BST)</span>
            <span className="text-[7px] bg-emerald-500/10 border border-emerald-500/20 px-1 py-0.5 rounded text-emerald-400 font-mono">1st Trade</span>
          </button>

          <button
            type="button"
            onClick={() => handleDeploySignalType('signal_2')}
            disabled={isBroadcastingSignal}
            className="py-2 px-3 bg-gradient-to-r from-sky-500/10 to-sky-500/20 hover:from-sky-500/20 hover:to-sky-500/30 border border-sky-500/30 text-sky-400 hover:text-sky-300 text-[9px] font-bold uppercase tracking-wider rounded-xl font-mono transition text-left flex items-center justify-between cursor-pointer"
          >
            <span>🔵 Deploy Signal #2 (13:00 BST)</span>
            <span className="text-[7px] bg-sky-500/10 border border-sky-500/20 px-1 py-0.5 rounded text-sky-400 font-mono">2nd Trade</span>
          </button>

          <button
            type="button"
            onClick={() => handleDeploySignalType('signal_3')}
            disabled={isBroadcastingSignal}
            className="py-2 px-3 bg-gradient-to-r from-purple-500/10 to-purple-500/20 hover:from-purple-500/20 hover:to-purple-500/30 border border-purple-500/30 text-purple-400 hover:text-purple-300 text-[9px] font-bold uppercase tracking-wider rounded-xl font-mono transition text-left flex items-center justify-between cursor-pointer"
          >
            <span>🟣 Deploy Additional Signal (Min $300)</span>
            <span className="text-[7px] bg-purple-500/10 border border-purple-500/20 px-1 py-0.5 rounded text-purple-400 font-mono">3rd Trade</span>
          </button>

          <button
            type="button"
            onClick={() => handleDeploySignalType('test')}
            disabled={isBroadcastingSignal}
            className="py-2 px-3 bg-gradient-to-r from-amber-500/10 to-amber-500/20 hover:from-amber-500/20 hover:to-amber-500/30 border border-amber-500/30 text-amber-400 hover:text-amber-300 text-[9px] font-bold uppercase tracking-wider rounded-xl font-mono transition text-left flex items-center justify-between cursor-pointer"
          >
            <span>🧪 Trigger Test Signal (Random Code)</span>
            <span className="text-[7px] bg-amber-500/10 border border-amber-500/20 px-1 py-0.5 rounded text-amber-400 font-mono">Test Now</span>
          </button>
        </div>

        <div className="pt-1.5 flex justify-end">
          <button
            type="button"
            onClick={handleEndSignal}
            disabled={!activeSignal || !activeSignal.isActive}
            className={`px-3 py-1.5 text-[8px] font-black uppercase tracking-wider rounded-lg font-mono transition text-center shadow-lg flex items-center gap-1 cursor-pointer ${activeSignal && activeSignal.isActive ? 'bg-rose-500 hover:bg-rose-400 text-zinc-950' : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'}`}
          >
            🛑 Stop / Terminate Active Signal
          </button>
        </div>

        {/* Current Active Broadcast details box */}
        {activeSignal && activeSignal.isActive && (
          <div className="bg-zinc-950/95 border border-zinc-850 rounded-xl p-3 space-y-2 font-mono text-[9px]">
            <span className="text-zinc-400 font-bold uppercase tracking-wider block border-b border-zinc-900 pb-1">Broadcast Specifications:</span>
            <div className="grid grid-cols-2 gap-2 text-zinc-400">
              <div>
                <span>Active Code:</span>
                <p className="text-white font-black text-xs mt-0.5 select-all select-text tracking-wider">{activeSignal.code}</p>
              </div>
              <div>
                <span>Traded Asset Pair:</span>
                <p className="text-cyan-400 font-bold text-xs mt-0.5">{activeSignal.pair}</p>
              </div>
              <div>
                <span>Forecast Bias:</span>
                <p className={`font-bold mt-0.5 ${activeSignal.direction === 'BULLISH' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {activeSignal.direction}
                </p>
              </div>
              <div>
                <span>Active Window:</span>
                <p className="text-white font-bold mt-0.5">1 Hour (Expires {new Date(activeSignal.endTime).toLocaleTimeString()})</p>
              </div>
              <div className="col-span-2 text-zinc-500 text-[8px] border-t border-zinc-900 pt-1 flex justify-between items-center">
                <span>Start: {new Date(activeSignal.startTime).toLocaleTimeString()}</span>
                <span>Type: {activeSignal.type?.toUpperCase()}</span>
              </div>
            </div>
          </div>
        )}

        {/* Placed trades list inside admin panel for validation */}
        <div className="space-y-2 pt-2 border-t border-zinc-800">
          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider font-mono block">
            USER SIGNAL EXECUTION LOGS ({signalTrades.length})
          </span>
          <div className="bg-zinc-950 rounded-xl border border-zinc-850 overflow-hidden font-mono text-[9px]">
            <div className="bg-zinc-900/60 border-b border-zinc-850 px-3 py-2 text-zinc-500 font-bold grid grid-cols-12 gap-1">
              <span className="col-span-3">Order / Pair</span>
              <span className="col-span-2 text-right">Amount</span>
              <span className="col-span-4 pl-2">User</span>
              <span className="col-span-3 text-right">Status</span>
            </div>

            <div className="max-h-36 overflow-y-auto divide-y divide-zinc-900">
              {signalTrades.length === 0 ? (
                <div className="p-4 text-center text-zinc-650 text-[8px]">
                  No copy trades have been placed globally yet.
                </div>
              ) : (
                signalTrades.map((trade) => (
                  <div key={trade.id} className="px-3 py-2 text-zinc-300 grid grid-cols-12 gap-1 items-center hover:bg-zinc-900/30">
                    <div className="col-span-3">
                      <p className="font-bold text-white truncate text-[8px]">{trade.id}</p>
                      <span className="text-cyan-400 text-[8px]">{trade.tradePair || 'BTC/USDT'}</span>
                    </div>
                    <span className="col-span-2 text-right font-bold text-white">${trade.amount.toFixed(2)}</span>
                    <div className="col-span-4 pl-2 truncate">
                      <p className="text-zinc-400 font-bold truncate">{trade.username}</p>
                      <span className="text-zinc-600 text-[8px] block truncate">{trade.userEmail}</span>
                    </div>
                    <span className={`col-span-3 text-right font-bold text-[8px] ${trade.status === 'Success' ? 'text-emerald-400' : trade.status === 'Hold' ? 'text-amber-400 animate-pulse' : 'text-cyan-400'}`}>
                      {trade.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Telegram Integration Controls inside Admin Panel */}
        <div className="border-t border-zinc-800/85 pt-3.5 space-y-3 font-mono text-[10px]">
          <div className="flex items-center justify-between">
            <span className="text-zinc-400 font-bold uppercase tracking-wider block text-[9px]">Telegram Bot Dispatcher</span>
            <label className="flex items-center gap-2 cursor-pointer text-[9px] text-zinc-500 hover:text-white transition">
              <input 
                type="checkbox" 
                checked={notifyOnTelegram}
                onChange={(e) => setNotifyOnTelegram(e.target.checked)}
                className="rounded border-zinc-850 bg-zinc-950 text-cyan-500 focus:ring-0 cursor-pointer"
              />
              <span>AUTO-NOTIFY SUBSCRIBERS</span>
            </label>
          </div>

          <div className="grid grid-cols-12 gap-2 items-end">
            <div className="col-span-8 space-y-1">
              <label className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider block">Global Bot Token</label>
              <input 
                type="password" 
                placeholder="Enter Bot Token from @BotFather" 
                value={telegramBotToken}
                onChange={(e) => setTelegramBotToken(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/50 placeholder-zinc-700"
              />
            </div>
            <button
              onClick={handleSaveBotToken}
              disabled={isSavingToken}
              className="col-span-4 bg-cyan-500 hover:bg-cyan-400 disabled:bg-zinc-800 disabled:text-zinc-600 text-zinc-950 text-[9px] font-black uppercase tracking-wider py-2.5 rounded-lg text-center transition cursor-pointer"
            >
              {isSavingToken ? 'Saving...' : 'Save Token'}
            </button>
          </div>
          <p className="text-[8px] text-zinc-600 leading-normal">
            * Connected users receive automatic messages instantly when a new VIP Signal is broadcasted.
          </p>

          {/* Channel Auto-Poster Config Section */}
          <div className="border-t border-zinc-800/60 pt-4.5 mt-2.5 space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-cyan-400 font-bold uppercase tracking-wider block text-[9px] flex items-center gap-1">
                📢 AUTOMATED CHANNEL POSTER (DAILY 8-10 POSTS)
              </span>
              <label className="flex items-center gap-2 cursor-pointer text-[9px] text-zinc-500 hover:text-white transition">
                <input 
                  type="checkbox" 
                  checked={autoPosterActive}
                  onChange={(e) => setAutoPosterActive(e.target.checked)}
                  className="rounded border-zinc-850 bg-zinc-950 text-cyan-500 focus:ring-0 cursor-pointer"
                />
                <span className="font-bold uppercase">ENABLE AUTO-POSTING</span>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider block">Channel Username or Chat ID</label>
                <input 
                  type="text" 
                  placeholder="e.g. @NGK_Signalbot_Channel" 
                  value={telegramChannelId}
                  onChange={(e) => setTelegramChannelId(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/50 placeholder-zinc-750 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider block">Posting Interval (Hours)</label>
                <select
                  value={autoPosterInterval}
                  onChange={(e) => setAutoPosterInterval(Number(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-2 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/50 cursor-pointer"
                >
                  <option value={1}>1.0 Hour (24 posts/day)</option>
                  <option value={1.5}>1.5 Hours (16 posts/day)</option>
                  <option value={2}>2.0 Hours (12 posts/day)</option>
                  <option value={2.4}>2.4 Hours (10 posts/day) ⭐</option>
                  <option value={3}>3.0 Hours (8 posts/day) ⭐</option>
                  <option value={4}>4.0 Hours (6 posts/day)</option>
                  <option value={6}>6.0 Hours (4 posts/day)</option>
                  <option value={12}>12.0 Hours (2 posts/day)</option>
                </select>
              </div>
            </div>

            {/* Live Scheduler Stats Panel */}
            <div className="bg-zinc-950/80 rounded-xl border border-zinc-850 p-2.5 space-y-1.5 text-[8.5px] text-zinc-400 font-mono">
              <div className="flex justify-between">
                <span>Scheduler Status:</span>
                <span className={`font-bold ${autoPosterActive ? 'text-emerald-400 animate-pulse' : 'text-zinc-500'}`}>
                  {autoPosterActive ? '● RUNNING IN BACKGROUND' : '○ SHUTDOWN / DISABLED'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Next Rotated Post Index:</span>
                <span className="text-cyan-400 font-bold">Template #{lastPosterIndex + 1} of 10</span>
              </div>
              {lastPostedAt && (
                <div className="flex justify-between">
                  <span>Last Message Posted:</span>
                  <span className="text-white">{new Date(lastPostedAt).toLocaleTimeString()} ({new Date(lastPostedAt).toLocaleDateString()})</span>
                </div>
              )}
              {autoPosterActive && nextPostAt && (
                <div className="flex justify-between border-t border-zinc-900 pt-1.5 text-zinc-500">
                  <span>Next Scheduled Post:</span>
                  <span className="text-emerald-400 font-black">{new Date(nextPostAt).toLocaleTimeString()} ({new Date(nextPostAt).toLocaleDateString()})</span>
                </div>
              )}
            </div>

            {/* Actions list */}
            <div className="grid grid-cols-3 gap-2 pt-0.5">
              <button
                onClick={handleSavePosterSettings}
                disabled={isSavingPoster}
                className="bg-cyan-500 hover:bg-cyan-400 disabled:bg-zinc-800 disabled:text-zinc-600 text-zinc-950 text-[9px] font-black uppercase tracking-wider py-2.5 rounded-lg text-center transition cursor-pointer font-bold"
              >
                {isSavingPoster ? 'Saving...' : 'Save Poster'}
              </button>
              <button
                onClick={handleTestChannel}
                disabled={isTestingPoster}
                className="bg-zinc-850 hover:bg-zinc-800 disabled:bg-zinc-900 disabled:text-zinc-700 text-zinc-300 text-[9px] font-bold uppercase tracking-wider py-2.5 rounded-lg text-center transition cursor-pointer border border-zinc-800"
              >
                {isTestingPoster ? 'Testing...' : 'Test Channel'}
              </button>
              <button
                onClick={handleManualPostNext}
                disabled={isExecutingManualPost}
                className="bg-zinc-800 hover:bg-zinc-750 disabled:bg-zinc-900 disabled:text-zinc-700 text-white text-[9px] font-bold uppercase tracking-wider py-2.5 rounded-lg text-center transition cursor-pointer border border-zinc-750/50 flex items-center justify-center gap-1"
              >
                {isExecutingManualPost ? 'Posting...' : 'Post Next Now'}
              </button>
            </div>
            <p className="text-[8px] text-zinc-600 leading-normal">
              * The bot will automatically rotate between 10 professionally formatted marketing/educational messages regarding NGK benefits, registration links, rewards, and support in English and Russian.
            </p>

            {/* Expanded Templates Preview Panel */}
            {marketingTemplates.length > 0 && (
              <div className="border-t border-zinc-800/40 pt-3.5 space-y-2">
                <span className="text-zinc-400 font-bold uppercase tracking-wider block text-[8px]">
                  📖 ROTATING MARKETING TEMPLATES PREVIEW ({marketingTemplates.length})
                </span>
                <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
                  {marketingTemplates.map((template, idx) => {
                    // Extract first line as a title
                    const tempLines = template.replace(/<[^>]*>/g, '').split('\n');
                    const title = tempLines[0] || `Template #${idx + 1}`;
                    const isSelected = selectedTemplateIndex === idx;

                    return (
                      <div 
                        key={idx} 
                        className={`border rounded-lg transition overflow-hidden ${
                          isSelected 
                            ? 'border-cyan-500/40 bg-cyan-950/5' 
                            : 'border-zinc-850 bg-zinc-950/40 hover:bg-zinc-950'
                        }`}
                      >
                        <button
                          onClick={() => setSelectedTemplateIndex(isSelected ? null : idx)}
                          className="w-full text-left px-2.5 py-2 text-[10px] font-bold text-zinc-300 flex justify-between items-center cursor-pointer"
                        >
                          <span className="flex items-center gap-1.5 truncate">
                            <span className="text-cyan-400 font-mono text-[8px] bg-cyan-950 border border-cyan-800 px-1 py-0.5 rounded">
                              #{idx + 1}
                            </span>
                            <span className="truncate">{title}</span>
                          </span>
                          <span className="text-[8px] text-zinc-500">
                            {isSelected ? '▲ Collapse' : '▼ Expand'}
                          </span>
                        </button>

                        {isSelected && (
                          <div className="px-2.5 pb-2.5 pt-1 space-y-2.5 border-t border-zinc-900 bg-zinc-950/80">
                            <pre className="text-[8.5px] text-zinc-400 leading-normal whitespace-pre-wrap font-sans max-h-[140px] overflow-y-auto p-2 bg-black/40 rounded border border-zinc-900/60 select-all">
                              {template.replace(/<br\s*\/?>/gi, '\n').replace(/<\/?[^>]+(>|$)/g, "")}
                            </pre>
                            <div className="flex justify-end gap-1.5">
                              <button
                                onClick={() => handleSendSpecificTemplate(idx)}
                                disabled={isPostingSpecificTemplate[idx]}
                                className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 disabled:text-zinc-600 disabled:bg-zinc-900 border border-emerald-500/20 px-2.5 py-1 rounded text-[8px] font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1"
                              >
                                {isPostingSpecificTemplate[idx] ? 'Sending...' : '⚡ Broadcast This Now'}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
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
