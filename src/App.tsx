import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { 
  ArrowLeft, 
  ArrowRight, 
  Lock, 
  LogOut,
  Info,
  Gift,
  X,
  MessageSquare,
  Users,
  Coins,
  Copy,
  LineChart,
  User as UserIcon,
  HelpCircle,
  TrendingUp,
  Award,
  Eye,
  EyeOff,
  Headphones,
  Globe,
  Mail,
  Phone
} from 'lucide-react';

import { 
  User, 
  Transaction, 
  Trader, 
  Stake, 
  ChatMessage, 
  VIPRank, 
  TransactionType, 
  TransactionStatus 
} from './types';

import * as OTPAuth from 'otpauth';

import ThreeDLogo from './components/ThreeDLogo';
import TradingViewWidget from './components/TradingViewWidget';
import Navbar from './components/Navbar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import CopyTrading from './components/CopyTrading';
import Referral from './components/Referral';
import Profile from './components/Profile';
import History from './components/History';
import Support from './components/Support';

// Seamlessly intercept localStorage to migrate from 'futuregrotex_' prefix to 'gtx_' prefix
const originalGetItem = Storage.prototype.getItem;
const originalSetItem = Storage.prototype.setItem;
const originalRemoveItem = Storage.prototype.removeItem;

Storage.prototype.getItem = function (key: string) {
  if (key && key.includes('futuregrotex_')) {
    const newKey = key.replace('futuregrotex_', 'gtx_');
    const val = originalGetItem.call(this, newKey);
    if (val !== null) return val;
    const oldVal = originalGetItem.call(this, key);
    if (oldVal !== null) {
      originalSetItem.call(this, newKey, oldVal);
    }
    return oldVal;
  }
  return originalGetItem.call(this, key);
};

Storage.prototype.setItem = function (key: string, value: string) {
  if (key && key.includes('futuregrotex_')) {
    const newKey = key.replace('futuregrotex_', 'gtx_');
    originalSetItem.call(this, newKey, value);
  } else {
    originalSetItem.call(this, key, value);
  }
};

Storage.prototype.removeItem = function (key: string) {
  if (key && key.includes('futuregrotex_')) {
    const newKey = key.replace('futuregrotex_', 'gtx_');
    originalRemoveItem.call(this, newKey);
    originalRemoveItem.call(this, key);
  } else {
    originalRemoveItem.call(this, key);
  }
};

// Seed Initial Elite Traders
const INITIAL_TRADERS: Trader[] = [
  { id: '1', name: 'Kieranmoris_Trades', winRate: 98.2, roi30d: 156, followers: 2400, color: 'cyan', avatarLetter: 'K', riskScore: 'Low', weeklyProfit: 45680, minAmount: 100 },
  { id: '2', name: 'Express Trader', winRate: 96.7, roi30d: 142, followers: 1800, color: 'purple', avatarLetter: 'E', riskScore: 'Low', weeklyProfit: 32110, minAmount: 150 },
  { id: '3', name: 'CryptoWhale', winRate: 94.5, roi30d: 128, followers: 3200, color: 'emerald', avatarLetter: 'C', riskScore: 'Medium', weeklyProfit: 68900, minAmount: 300 },
  { id: '4', name: 'Satoshi_AI', winRate: 97.8, roi30d: 189, followers: 5100, color: 'amber', avatarLetter: 'S', riskScore: 'Low', weeklyProfit: 104200, minAmount: 500 },
  { id: '5', name: 'Alpha Signals', winRate: 93.2, roi30d: 115, followers: 1200, color: 'teal', avatarLetter: 'A', riskScore: 'High', weeklyProfit: 18900, minAmount: 200 },
  { id: '6', name: 'MoonBag', winRate: 91.8, roi30d: 98, followers: 890, color: 'indigo', avatarLetter: 'M', riskScore: 'High', weeklyProfit: 12400, minAmount: 100 }
];

// Initial Chat Messages to seed the community
const SEED_CHAT_MESSAGES: ChatMessage[] = [
  { id: 'c1', userId: 'm1', username: 'CryptoKing', userEmail: 'king@crypto.com', message: 'GTX is paying out insane staking yields today. Already collected 3.6%!', timestamp: new Date(Date.now() - 3600000).toISOString() },
  { id: 'c2', userId: 'm2', username: 'WhaleWatcher', userEmail: 'whale@watch.com', message: 'Just mirrored Kieranmoris copy trade with 500 USDT, locked and ready 🚀', timestamp: new Date(Date.now() - 1800000).toISOString() },
  { id: 'c3', userId: 'm3', username: 'TradeWizard', userEmail: 'wizard@trade.com', message: 'Does anyone know the withdrawal limit? Try to withdraw 120 USDT.', timestamp: new Date(Date.now() - 600000).toISOString() },
  { id: 'c4', userId: 'm4', username: 'Satoshi', userEmail: 'sat@btc.com', message: 'wizard@trade.com min is 4 USDT. Works instantly! Verified my KYC yesterday as well.', timestamp: new Date(Date.now() - 300000).toISOString() }
];

export default function App() {
  // Screens & Navigation
  const [currentScreen, setCurrentScreen] = useState<string>('dashboard');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);

  // Auth Screen states
  const [isLoginMode, setIsLoginMode] = useState<boolean>(true);
  const [authMethod, setAuthMethod] = useState<'email' | 'tel'>('email');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [authUsername, setAuthUsername] = useState<string>('');
  const [authEmail, setAuthEmail] = useState<string>('');
  const [authPassword, setAuthPassword] = useState<string>('');
  const [authPin, setAuthPin] = useState<string>('');
  const [authRefCode, setAuthRefCode] = useState<string>('');

  // Core App states
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeStake, setActiveStake] = useState<Stake | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newChatMessage, setNewChatMessage] = useState<string>('');
  const [unreadChatCount, setUnreadChatCount] = useState<number>(3);

  // Modals state
  const [depositOpen, setDepositOpen] = useState<boolean>(false);
  const [depositStep, setDepositStep] = useState<number>(1);
  const [depositNetwork, setDepositNetwork] = useState<string>('BEP20');
  const [depositAmount, setDepositAmount] = useState<string>('');

  const [withdrawOpen, setWithdrawOpen] = useState<boolean>(false);
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [withdrawAddress, setWithdrawAddress] = useState<string>('');
  const [withdrawPin, setWithdrawPin] = useState<string>('');

  const depositAddresses: Record<string, string> = {
    BEP20: '0x9921dc583f33b9acde735720732d7fa0ad8ae344',
    TRC20: 'TXRsYoutdJBu6jmWjgAT29tpgtVuTwr8en',
    ERC20: '0x5adfb3f4eec60d388f995ecff770cbc8af02da05'
  };

  // 1. Toast Notification Helper
  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // 2. Load Init Datasets from LocalStorage
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const invite = params.get('ref') || params.get('invite');
    if (invite) {
      setAuthRefCode(invite.toUpperCase());
    }

    const chatFromLocal = localStorage.getItem('futuregrotex_chats');
    if (chatFromLocal) {
      setChatMessages(JSON.parse(chatFromLocal));
    } else {
      localStorage.setItem('futuregrotex_chats', JSON.stringify(SEED_CHAT_MESSAGES));
      setChatMessages(SEED_CHAT_MESSAGES);
    }

    const currentSession = localStorage.getItem('futuregrotex_current_user');
    if (currentSession) {
      const userObj = JSON.parse(currentSession) as User;
      if (!userObj.avatarUrl) {
        const portraits = [
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
          'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
          'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
          'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face',
          'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&h=150&fit=crop&crop=face',
          'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop&crop=face',
          'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
          'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
          'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face'
        ];
        const seed = userObj.email || userObj.username || userObj.uid || '';
        let sum = 0;
        for (let i = 0; i < seed.length; i++) sum += seed.charCodeAt(i);
        userObj.avatarUrl = portraits[sum % portraits.length];
      }
      setCurrentUser(userObj);
      loadUserRelatedData(userObj.uid);
    }
  }, []);

  // Helper to sync user data across state and storage
  const syncUser = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    localStorage.setItem('futuregrotex_current_user', JSON.stringify(updatedUser));
    
    const usersListStr = localStorage.getItem('futuregrotex_users') || '[]';
    const usersList = JSON.parse(usersListStr) as User[];
    const idx = usersList.findIndex(u => u.uid === updatedUser.uid);
    if (idx !== -1) {
      usersList[idx] = updatedUser;
    } else {
      usersList.push(updatedUser);
    }
    localStorage.setItem('futuregrotex_users', JSON.stringify(usersList));
  };

  const loadUserRelatedData = (uid: string) => {
    const txsStr = localStorage.getItem('futuregrotex_transactions') || '[]';
    const txsList = JSON.parse(txsStr) as Transaction[];
    const userTxs = txsList.filter(t => t.userId === uid);
    setTransactions(userTxs);

    const stakesStr = localStorage.getItem('futuregrotex_stakes') || '[]';
    const stakesList = JSON.parse(stakesStr) as Stake[];
    const activeUserStake = stakesList.find(s => s.userId === uid && s.status === 'Active') || null;
    setActiveStake(activeUserStake);
  };

  // 3. Real-time intervals check for Copy Trades expiration and Staking Yield accumulation
  useEffect(() => {
    const timer = setInterval(() => {
      if (!currentUser) return;

      const nowStr = new Date().toISOString();
      const txsStr = localStorage.getItem('futuregrotex_transactions') || '[]';
      const allTxs = JSON.parse(txsStr) as Transaction[];

      let updated = false;
      const updatedTxs = allTxs.map(tx => {
        if (tx.userId === currentUser.uid && tx.type === TransactionType.CopyTrade && tx.status === TransactionStatus.Pending) {
          if (tx.endTime && tx.endTime <= nowStr) {
            updated = true;
            const profit = tx.amount * 0.0219;
            const totalReturn = tx.amount + profit;

            if (tx.requiresApproval) {
              // 2nd daily trade gets placed on hold
              showToast(`VIP Daily Limit Trade finished! Placed on Security HOLD for Audit.`, 'warning');
              return {
                ...tx,
                status: TransactionStatus.Hold,
                profit,
                totalReturn
              };
            } else {
              const currentSession = localStorage.getItem('futuregrotex_current_user');
              if (currentSession) {
                const u = JSON.parse(currentSession) as User;
                u.mainBalance += totalReturn;
                u.profitBalance += profit;
                syncUser(u);
              }

              showToast(`Copy trade with ${tx.traderName} complete! +$${profit.toFixed(2)} USDT profits added.`, 'success');
              return {
                ...tx,
                status: TransactionStatus.Success,
                profit,
                totalReturn
              };
            }
          }
        }
        return tx;
      });

      if (updated) {
        localStorage.setItem('futuregrotex_transactions', JSON.stringify(updatedTxs));
        setTransactions(updatedTxs.filter(t => t.userId === currentUser.uid));
      }

      // Check Staking yields
      const stakesStr = localStorage.getItem('futuregrotex_stakes') || '[]';
      const allStakes = JSON.parse(stakesStr) as Stake[];
      let stakeUpdated = false;

      const updatedStakes = allStakes.map(st => {
        if (st.userId === currentUser.uid && st.status === 'Active') {
          const startMs = new Date(st.startDate).getTime();
          const endMs = new Date(st.endDate).getTime();
          const nowMs = new Date().getTime();

          if (nowMs >= endMs) {
            stakeUpdated = true;
            const currentSession = localStorage.getItem('futuregrotex_current_user');
            if (currentSession) {
              const u = JSON.parse(currentSession) as User;
              u.mainBalance += st.amount;
              u.totalStaked = Math.max(0, u.totalStaked - st.amount);
              syncUser(u);
            }
            showToast(`Staking completed! Staked $${st.amount.toFixed(2)} USDT returned to balance.`, 'success');
            return {
              ...st,
              status: 'Completed' as const
            };
          }

          const lastClaimMs = new Date(st.lastClaimed).getTime();
          const elapsedSecs = (nowMs - lastClaimMs) / 1000;

          if (elapsedSecs >= 60) { // Every 1 minute in demo compiles 1 day of 3.6% ROI!
            stakeUpdated = true;
            const dailyYield = st.amount * 0.036;

            const currentSession = localStorage.getItem('futuregrotex_current_user');
            if (currentSession) {
              const u = JSON.parse(currentSession) as User;
              u.profitBalance += dailyYield;
              syncUser(u);
            }

            showToast(`Staking profit unlocked! +$${dailyYield.toFixed(2)} USDT added to profits.`, 'success');

            const newTx: Transaction = {
              id: 'ST-ROI-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
              userId: currentUser.uid,
              type: TransactionType.Bonus,
              amount: dailyYield,
              status: TransactionStatus.Success,
              timestamp: new Date().toISOString(),
              traderName: 'AI Yield'
            };

            const txs = JSON.parse(localStorage.getItem('futuregrotex_transactions') || '[]') as Transaction[];
            txs.push(newTx);
            localStorage.setItem('futuregrotex_transactions', JSON.stringify(txs));
            setTransactions(txs.filter(t => t.userId === currentUser.uid));

            return {
              ...st,
              lastClaimed: new Date().toISOString(),
              totalClaimed: st.totalClaimed + dailyYield
            };
          }
        }
        return st;
      });

      if (stakeUpdated) {
        localStorage.setItem('futuregrotex_stakes', JSON.stringify(updatedStakes));
        const activeOne = updatedStakes.find(s => s.userId === currentUser.uid && s.status === 'Active') || null;
        setActiveStake(activeOne);
      }

    }, 1000);

    return () => clearInterval(timer);
  }, [currentUser]);

  // Simulated chats interval
  useEffect(() => {
    const chatTicker = setInterval(() => {
      if (!currentUser || currentScreen !== 'community') return;

      const mockTraders = ['Express Trader', 'CryptoWhale', 'Satoshi_AI', 'Alpha Signals', 'ProfitPulse', 'WhaleWatcher'];
      const mockTalks = [
        'Bitcoin is holding solid above 90k, copy trades are highly accurate today!',
        'Just claimed daily bonus streak multipliers. Streak 5 lets go 🔥',
        'Staked another 500 USDT into the AI quantitative pool. Free yields!',
        'Withdrawal of 45 USDT completed in 3 seconds. GTX does not play!',
        'Invite links are yielding massive commissions. Level 1 referral unlocked me 25 USDT reward.',
        'Anyone mirroring Satoshi_AI master profile? Win rate is crazy!'
      ];

      const rTrader = mockTraders[Math.floor(Math.random() * mockTraders.length)];
      const rTalk = mockTalks[Math.floor(Math.random() * mockTalks.length)];

      const incomingMsg: ChatMessage = {
        id: 'c-' + Date.now(),
        userId: 'm-' + Math.random().toString(36).substring(2, 5),
        username: rTrader,
        userEmail: `${rTrader.toLowerCase().replace(' ', '')}@gtx.com`,
        message: rTalk,
        timestamp: new Date().toISOString()
      };

      setChatMessages(prev => {
        const next = [...prev, incomingMsg];
        localStorage.setItem('futuregrotex_chats', JSON.stringify(next));
        return next;
      });

    }, 12000);

    return () => clearInterval(chatTicker);
  }, [currentUser, currentScreen]);

  // 4. Handle Registration & Authentications
  const handleSignUp = () => {
    if (!authUsername || !authEmail || !authPassword || !authPin) {
      showToast('Please fill in all details to sign up.', 'error');
      return;
    }
    if (authPassword.length < 6) {
      showToast('Password must be at least 6 characters long.', 'error');
      return;
    }
    if (!/^\d{6}$/.test(authPin)) {
      showToast('Withdrawal PIN must be exactly 6 numbers.', 'error');
      return;
    }

    const usersListStr = localStorage.getItem('futuregrotex_users') || '[]';
    const usersList = JSON.parse(usersListStr) as User[];

    const exists = usersList.some(u => u.email.toLowerCase() === authEmail.toLowerCase());
    if (exists) {
      showToast('This email is already registered.', 'error');
      return;
    }

    let referrerUid: string | null = null;
    if (authRefCode) {
      const matchRef = usersList.find(u => u.referralCode.toUpperCase() === authRefCode.toUpperCase());
      if (matchRef) {
        referrerUid = matchRef.uid;
        matchRef.teamCount += 1;
        const idx = usersList.findIndex(u => u.uid === matchRef.uid);
        if (idx !== -1) {
          usersList[idx] = matchRef;
        }
        localStorage.setItem('futuregrotex_users', JSON.stringify(usersList));
      } else {
        showToast('Invite code not found. Continuing sign up anyway.', 'warning');
      }
    }

    const refCodeGenerated = 'FG' + Math.random().toString(36).substring(2, 8).toUpperCase();

    const portraits = [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face'
    ];
    const seed = authEmail || authUsername || 'UID-' + Math.random();
    let sum = 0;
    for (let i = 0; i < seed.length; i++) sum += seed.charCodeAt(i);
    const assignedAvatar = portraits[sum % portraits.length];

    const newUser: User = {
      uid: 'UID-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
      username: authUsername,
      email: authEmail,
      mainBalance: 10, // Welcome gift of 10 USDT!
      profitBalance: 0,
      totalVolume: 0,
      totalStaked: 0,
      teamVolume: 0,
      teamProfit: 0,
      teamCount: 0,
      totalCommission: 0,
      tier: VIPRank.Bronze,
      loginStreak: 1,
      lastBonusClaim: new Date().toISOString(),
      referralCode: refCodeGenerated,
      referrer: referrerUid,
      withdrawalPin: authPin,
      twoFactorEnabled: false,
      twoFactorSecret: null,
      kycStatus: 'not_submitted',
      copyTradeCount: 0,
      copyTradeResetTime: null,
      createdAt: new Date().toISOString(),
      avatarUrl: assignedAvatar
    };

    usersList.push(newUser);
    localStorage.setItem('futuregrotex_users', JSON.stringify(usersList));
    syncUser(newUser);

    const initialTx: Transaction = {
      id: 'FG-BONUS-WEL',
      userId: newUser.uid,
      type: TransactionType.Bonus,
      amount: 10,
      status: TransactionStatus.Success,
      timestamp: new Date().toISOString(),
      traderName: 'Welcome Gift'
    };
    const txs = JSON.parse(localStorage.getItem('futuregrotex_transactions') || '[]') as Transaction[];
    txs.push(initialTx);
    localStorage.setItem('futuregrotex_transactions', JSON.stringify(txs));

    showToast('Account created successfully! Enjoy your 10 USDT Welcome Gift.', 'success');
    loadUserRelatedData(newUser.uid);
  };

  const handleSignIn = () => {
    if (!authEmail || !authPassword) {
      showToast('Email and password are required.', 'error');
      return;
    }

    const usersListStr = localStorage.getItem('futuregrotex_users') || '[]';
    const usersList = JSON.parse(usersListStr) as User[];

    const userMatch = usersList.find(u => u.email.toLowerCase() === authEmail.toLowerCase());
    if (!userMatch) {
      showToast('No account found with this email.', 'error');
      return;
    }

    syncUser(userMatch);
    loadUserRelatedData(userMatch.uid);
    showToast(`Welcome back, ${userMatch.username}!`, 'success');
  };

  const handleLogout = () => {
    localStorage.removeItem('futuregrotex_current_user');
    setCurrentUser(null);
    setTransactions([]);
    setActiveStake(null);
    setCurrentScreen('dashboard');
    showToast('Logged out successfully.', 'info');
  };

  // Claim streak bonus
  const handleClaimDailyBonus = () => {
    if (!currentUser) return;
    const streak = currentUser.loginStreak + 1;
    const reward = streak * 0.15;

    const u = { ...currentUser };
    u.mainBalance += reward;
    u.loginStreak = streak;
    u.lastBonusClaim = new Date().toISOString();
    syncUser(u);

    const bonusTx: Transaction = {
      id: 'FG-STREAK-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
      userId: currentUser.uid,
      type: TransactionType.Bonus,
      amount: reward,
      status: TransactionStatus.Success,
      timestamp: new Date().toISOString(),
      traderName: 'Daily Claim'
    };

    const txList = JSON.parse(localStorage.getItem('futuregrotex_transactions') || '[]') as Transaction[];
    txList.push(bonusTx);
    localStorage.setItem('futuregrotex_transactions', JSON.stringify(txList));
    setTransactions(txList.filter(t => t.userId === currentUser.uid));

    showToast(`+$${reward.toFixed(2)} USDT Daily Claim added! Streak: ${streak} Days`, 'success');
  };

  // Copy trade deployment
  const handleStartCopyTrade = (traderName: string, amount: number, traderAvatar?: string, tradePair?: string) => {
    if (!currentUser) return;

    // Real active copy trades in the last 24 hours
    const txListStr = localStorage.getItem('futuregrotex_transactions') || '[]';
    const txListAll = JSON.parse(txListStr) as Transaction[];
    const userCopyTradesLast24h = txListAll.filter(t => 
      t.userId === currentUser.uid && 
      t.type === TransactionType.CopyTrade && 
      (Date.now() - new Date(t.timestamp).getTime()) < 24 * 60 * 60 * 1000
    );

    if (userCopyTradesLast24h.length >= 2) {
      const sorted = [...userCopyTradesLast24h].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      const firstTxTime = new Date(sorted[0].timestamp).getTime();
      const nextAvailableTime = new Date(firstTxTime + 24 * 60 * 60 * 1000);
      const remainingMs = nextAvailableTime.getTime() - Date.now();
      const remainingHours = Math.floor(remainingMs / (60 * 60 * 1000));
      const remainingMins = Math.ceil((remainingMs % (60 * 60 * 1000)) / (60 * 1000));
      
      showToast(`Daily limit reached! Next trade slot opens in ${remainingHours}h ${remainingMins}m.`, 'warning');
      return;
    }

    const isSecondTrade = userCopyTradesLast24h.length === 1;

    const u = { ...currentUser };
    u.mainBalance -= amount;
    u.totalVolume += amount;
    u.copyTradeCount = userCopyTradesLast24h.length + 1;
    
    if (u.totalVolume >= 20000) {
      u.tier = VIPRank.Platinum;
    } else if (u.totalVolume >= 5000) {
      u.tier = VIPRank.Gold;
    } else if (u.totalVolume >= 800) {
      u.tier = VIPRank.Silver;
    }

    syncUser(u);

    const endTime = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 minutes!
    const copyTradeTx: Transaction = {
      id: 'FG-CT-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
      userId: currentUser.uid,
      type: TransactionType.CopyTrade,
      amount,
      status: TransactionStatus.Pending,
      timestamp: new Date().toISOString(),
      traderName,
      endTime,
      requiresApproval: isSecondTrade,
      traderAvatar,
      tradePair
    };

    txListAll.push(copyTradeTx);
    localStorage.setItem('futuregrotex_transactions', JSON.stringify(txListAll));
    setTransactions(txListAll.filter(t => t.userId === currentUser.uid));

    if (isSecondTrade) {
      showToast(`VIP 2nd Trade deployed! Placed on Security Hold upon 30m completion.`, 'info');
    } else {
      showToast(`Copy Trade with ${traderName} started! Ends in 30 minutes.`, 'info');
    }
  };

  // Instant settle for testability and demonstration
  const handleInstantSettleTrade = (txId: string) => {
    if (!currentUser) return;
    const txsStr = localStorage.getItem('futuregrotex_transactions') || '[]';
    const allTxs = JSON.parse(txsStr) as Transaction[];
    const txIndex = allTxs.findIndex(t => t.id === txId && t.status === TransactionStatus.Pending);
    
    if (txIndex === -1) return;
    
    const tx = allTxs[txIndex];
    const profit = tx.amount * 0.0219;
    const totalReturn = tx.amount + profit;
    const isSecondTrade = tx.requiresApproval;
    
    const u = { ...currentUser };
    if (isSecondTrade) {
      allTxs[txIndex] = {
        ...tx,
        status: TransactionStatus.Hold,
        profit,
        totalReturn
      };
      showToast(`VIP Security check triggered on trade ${tx.id}. Funds placed in Escrow.`, 'warning');
    } else {
      u.mainBalance += totalReturn;
      u.profitBalance += profit;
      syncUser(u);
      
      allTxs[txIndex] = {
        ...tx,
        status: TransactionStatus.Success,
        profit,
        totalReturn
      };
      showToast(`Copy trade complete! +$${profit.toFixed(2)} USDT profits added.`, 'success');
    }
    
    localStorage.setItem('futuregrotex_transactions', JSON.stringify(allTxs));
    setTransactions(allTxs.filter(t => t.userId === u.uid));
  };

  // Release hold transaction using real 2FA verification
  const handleReleaseTrade = (txId: string, totpCode: string): boolean => {
    if (!currentUser) return false;

    if (!currentUser.twoFactorEnabled || !currentUser.twoFactorSecret) {
      showToast('Please enable 2FA in your Security profile first!', 'warning');
      return false;
    }

    try {
      // Create OTP instance
      const totp = new OTPAuth.TOTP({
        issuer: 'GTX',
        label: currentUser.email,
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        secret: currentUser.twoFactorSecret
      });

      // Validate code
      const delta = totp.validate({
        token: totpCode,
        window: 2 // allow clock drift
      });

      if (delta === null) {
        showToast('Invalid 2FA Authenticator code!', 'error');
        return false;
      }

      const txsStr = localStorage.getItem('futuregrotex_transactions') || '[]';
      const allTxs = JSON.parse(txsStr) as Transaction[];
      const txIndex = allTxs.findIndex(t => t.id === txId && t.status === TransactionStatus.Hold);

      if (txIndex === -1) {
        showToast('Held trade not found or already settled.', 'error');
        return false;
      }

      const tx = allTxs[txIndex];
      const profit = tx.profit || (tx.amount * 0.0219);
      const totalReturn = tx.totalReturn || (tx.amount + profit);

      const u = { ...currentUser };
      u.mainBalance += totalReturn;
      u.profitBalance += profit;
      syncUser(u);

      allTxs[txIndex] = {
        ...tx,
        status: TransactionStatus.Success,
        profit,
        totalReturn
      };

      localStorage.setItem('futuregrotex_transactions', JSON.stringify(allTxs));
      setTransactions(allTxs.filter(t => t.userId === currentUser.uid));

      showToast(`2FA Verified! +$${profit.toFixed(2)} USDT released to your main balance!`, 'success');
      return true;
    } catch (err) {
      console.error(err);
      showToast('Error verifying security authenticator.', 'error');
      return false;
    }
  };

  // Staking
  const handleStartStaking = (amount: number, durationDays: number, dailyROI: number) => {
    if (!currentUser) return;

    const u = { ...currentUser };
    u.mainBalance -= amount;
    u.totalStaked += amount;
    syncUser(u);

    const newStake: Stake = {
      id: 'STAKE-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
      userId: currentUser.uid,
      amount,
      startDate: new Date().toISOString(),
      // 1 minute in demo = 1 day of staking lock!
      endDate: new Date(Date.now() + durationDays * 60 * 1000).toISOString(),
      dailyROI,
      lastClaimed: new Date().toISOString(),
      status: 'Active',
      totalClaimed: 0
    };

    const stakes = JSON.parse(localStorage.getItem('futuregrotex_stakes') || '[]') as Stake[];
    stakes.push(newStake);
    localStorage.setItem('futuregrotex_stakes', JSON.stringify(stakes));
    setActiveStake(newStake);

    const stakeTx: Transaction = {
      id: 'FG-STAKE-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
      userId: currentUser.uid,
      type: TransactionType.Staking,
      amount,
      status: TransactionStatus.Success,
      timestamp: new Date().toISOString(),
      traderName: `${durationDays}-Day Pool`
    };

    const txs = JSON.parse(localStorage.getItem('futuregrotex_transactions') || '[]') as Transaction[];
    txs.push(stakeTx);
    localStorage.setItem('futuregrotex_transactions', JSON.stringify(txs));
    setTransactions(txs.filter(t => t.userId === currentUser.uid));

    showToast(`$${amount.toFixed(2)} USDT staked successfully in the ${durationDays}-day pool with ${(dailyROI * 100).toFixed(1)}% daily return!`, 'success');
  };

  // KYC
  const handleUpdateKYC = (fullName: string, idNumber: string, nationality: string, documentImage: string) => {
    if (!currentUser) return;
    const u = { ...currentUser };
    u.kycStatus = 'pending';
    u.kycData = {
      fullName,
      idNumber,
      nationality,
      documentImage,
      submittedAt: new Date().toISOString()
    };
    syncUser(u);
    showToast('Identity verification submitted. Documents are under review.', 'info');
  };

  // Avatar update
  const handleUpdateAvatar = (avatarUrl: string) => {
    if (!currentUser) return;
    const u = { ...currentUser, avatarUrl };
    syncUser(u);
    showToast('Profile avatar updated successfully!', 'success');
  };

  // 2FA
  const handleUpdate2FA = (secret: string) => {
    if (!currentUser) return;
    const u = { ...currentUser };
    u.twoFactorEnabled = true;
    u.twoFactorSecret = secret;
    syncUser(u);
    showToast('Google 2FA security code has been enabled.', 'success');
  };

  // Change Password
  const handleUpdatePassword = (pass: string) => {
    showToast('Password has been updated successfully.', 'success');
  };

  // Deposit USDT
  const handleConfirmDeposit = () => {
    if (!currentUser) return;
    const amt = parseFloat(depositAmount);
    if (isNaN(amt) || amt < 25) {
      showToast('Minimum deposit is 25 USDT.', 'error');
      return;
    }

    const bonus = amt * 0.10; // 10% Welcome Bonus!

    const depTx: Transaction = {
      id: 'FG-DEP-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
      userId: currentUser.uid,
      type: TransactionType.Deposit,
      amount: amt,
      status: TransactionStatus.Pending,
      timestamp: new Date().toISOString(),
      network: depositNetwork,
      address: depositAddresses[depositNetwork],
      bonus
    };

    const txs = JSON.parse(localStorage.getItem('futuregrotex_transactions') || '[]') as Transaction[];
    txs.push(depTx);
    localStorage.setItem('futuregrotex_transactions', JSON.stringify(txs));
    setTransactions(txs.filter(t => t.userId === currentUser.uid));

    setDepositOpen(false);
    showToast(`Deposit submitted! Processing on the blockchain in 5 seconds...`, 'info');

    setTimeout(() => {
      const allTxList = JSON.parse(localStorage.getItem('futuregrotex_transactions') || '[]') as Transaction[];
      const matchIdx = allTxList.findIndex(t => t.id === depTx.id);
      
      if (matchIdx !== -1) {
        allTxList[matchIdx].status = TransactionStatus.Success;
        localStorage.setItem('futuregrotex_transactions', JSON.stringify(allTxList));

        const session = localStorage.getItem('futuregrotex_current_user');
        if (session) {
          const u = JSON.parse(session) as User;
          u.mainBalance += (amt + bonus);
          syncUser(u);
        }

        const curUserObj = JSON.parse(localStorage.getItem('futuregrotex_current_user') || '{}') as User;
        if (curUserObj.referrer) {
          const uList = JSON.parse(localStorage.getItem('futuregrotex_users') || '[]') as User[];
          const refIdx = uList.findIndex(u => u.uid === curUserObj.referrer);
          if (refIdx !== -1) {
            const l1Reward = amt * 0.05; // 5% Level 1 referral
            uList[refIdx].mainBalance += l1Reward;
            uList[refIdx].totalCommission += l1Reward;
            uList[refIdx].teamVolume += amt;
            localStorage.setItem('futuregrotex_users', JSON.stringify(uList));

            const refTx: Transaction = {
              id: 'FG-REF-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
              userId: curUserObj.referrer,
              type: TransactionType.Commission,
              amount: l1Reward,
              status: TransactionStatus.Success,
              timestamp: new Date().toISOString(),
              traderName: `Ref: ${curUserObj.username}`
            };
            const masterTxs = JSON.parse(localStorage.getItem('futuregrotex_transactions') || '[]') as Transaction[];
            masterTxs.push(refTx);
            localStorage.setItem('futuregrotex_transactions', JSON.stringify(masterTxs));
          }
        }

        showToast(`Deposit successful! +$${(amt + bonus).toFixed(2)} USDT (including +10% bonus) credited.`, 'success');
        
        const activeSess = localStorage.getItem('futuregrotex_current_user');
        if (activeSess) {
          loadUserRelatedData(JSON.parse(activeSess).uid);
        }
      }
    }, 5000);

    setDepositAmount('');
  };

  // Withdraw USDT
  const handleConfirmWithdraw = () => {
    if (!currentUser) return;
    const amt = parseFloat(withdrawAmount);
    if (isNaN(amt) || amt < 4) {
      showToast('Minimum withdrawal is 4 USDT.', 'error');
      return;
    }

    if (!withdrawAddress) {
      showToast('Please enter your receiving wallet address.', 'error');
      return;
    }

    if (withdrawPin !== currentUser.withdrawalPin) {
      showToast('Incorrect Withdrawal PIN.', 'error');
      return;
    }

    const withdrawable = currentUser.totalVolume >= 800 
      ? currentUser.mainBalance + currentUser.profitBalance 
      : currentUser.profitBalance;

    if (amt > withdrawable) {
      showToast(`Insufficient withdrawable balance. Max: $${withdrawable.toFixed(2)} USDT. (Requires $800 total trading volume to unlock principal).`, 'error');
      return;
    }

    const u = { ...currentUser };
    if (amt <= u.profitBalance) {
      u.profitBalance -= amt;
    } else {
      const remainder = amt - u.profitBalance;
      u.profitBalance = 0;
      u.mainBalance = Math.max(0, u.mainBalance - remainder);
    }

    syncUser(u);

    const wTx: Transaction = {
      id: 'FG-WITH-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
      userId: currentUser.uid,
      type: TransactionType.Withdraw,
      amount: amt,
      status: TransactionStatus.Pending,
      timestamp: new Date().toISOString(),
      address: withdrawAddress
    };

    const txs = JSON.parse(localStorage.getItem('futuregrotex_transactions') || '[]') as Transaction[];
    txs.push(wTx);
    localStorage.setItem('futuregrotex_transactions', JSON.stringify(txs));
    setTransactions(txs.filter(t => t.userId === currentUser.uid));

    setWithdrawOpen(false);
    showToast(`Withdrawal request of $${amt.toFixed(2)} USDT submitted.`, 'success');

    setTimeout(() => {
      const allTxList = JSON.parse(localStorage.getItem('futuregrotex_transactions') || '[]') as Transaction[];
      const matchIdx = allTxList.findIndex(t => t.id === wTx.id);
      
      if (matchIdx !== -1) {
        allTxList[matchIdx].status = TransactionStatus.Success;
        localStorage.setItem('futuregrotex_transactions', JSON.stringify(allTxList));
        
        showToast(`Withdrawal of $${amt.toFixed(2)} USDT completed on-chain! Check your wallet.`, 'success');
        
        const activeSess = localStorage.getItem('futuregrotex_current_user');
        if (activeSess) {
          loadUserRelatedData(JSON.parse(activeSess).uid);
        }
      }
    }, 8000);

    setWithdrawAmount('');
    setWithdrawAddress('');
    setWithdrawPin('');
  };

  // Send Chat
  const handleSendChatMessage = () => {
    if (!currentUser || !newChatMessage.trim()) return;

    const newMsg: ChatMessage = {
      id: 'c-' + Date.now(),
      userId: currentUser.uid,
      username: currentUser.username,
      userEmail: currentUser.email,
      message: newChatMessage.trim(),
      timestamp: new Date().toISOString()
    };

    const next = [...chatMessages, newMsg];
    localStorage.setItem('futuregrotex_chats', JSON.stringify(next));
    setChatMessages(next);
    setNewChatMessage('');
  };

  return (
    <div className="bg-zinc-950 text-zinc-100 min-h-screen relative font-sans overflow-x-hidden pb-24">
      
      {/* Toast Alert popovers */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-4 left-4 right-4 z-50 max-w-sm mx-auto pointer-events-none"
          >
            <div className={`p-3.5 rounded border flex items-center gap-3 shadow-md ${
              toast.type === 'success' 
                ? 'bg-emerald-950 border-emerald-800 text-emerald-300'
                : toast.type === 'error'
                ? 'bg-red-950 border-red-800 text-red-300'
                : toast.type === 'warning'
                ? 'bg-amber-950 border-amber-800 text-amber-300'
                : 'bg-cyan-950 border-cyan-800 text-cyan-300'
            }`}>
              <span className="text-xs">
                {toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : toast.type === 'warning' ? '⚠️' : 'ℹ️'}
              </span>
              <p className="text-[11px] font-bold uppercase font-mono leading-relaxed">{toast.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-md mx-auto relative min-h-screen bg-zinc-950 flex flex-col border-x border-zinc-900 shadow-xl">
        
        {/* ================================== AUTH GATES ================================== */}
        {!currentUser ? (
          <div className="flex-1 flex flex-col justify-start px-4 py-6 relative">
            {/* Top Navigation Support Bar */}
            <div className="flex items-center justify-between w-full mb-8">
              <button 
                onClick={() => setIsLoginMode(true)}
                className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-850 flex items-center justify-center text-white hover:bg-zinc-800 transition"
              >
                <ArrowLeft size={16} />
              </button>
              <div className="flex items-center gap-3.5">
                <button 
                  onClick={() => showToast("GTX Global English support node selected.", "info")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900/50 border border-zinc-850/60 text-[10px] font-bold text-zinc-300 hover:text-white transition"
                >
                  <Globe size={12} className="text-cyan-400" />
                  <span>EN</span>
                </button>
                <button 
                  onClick={() => showToast("Connecting to live GTX Support Node...", "info")}
                  className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-850 flex items-center justify-center text-zinc-300 hover:text-white hover:border-cyan-500/40 transition"
                >
                  <Headphones size={15} />
                </button>
              </div>
            </div>

            <div className="w-full max-w-sm mx-auto space-y-6">
              {/* Logo section */}
              <div className="text-center space-y-3">
                <ThreeDLogo size="md" />
                <div className="space-y-1">
                  <h1 className="text-2xl font-black text-white tracking-tight uppercase font-mono">
                    {isLoginMode ? "Welcome to GTX" : "Create GTX Account"}
                  </h1>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                    {isLoginMode ? "Secure Copy Trading & Staking Syndicate" : "Claim your 10 USDT Welcome Gift Now"}
                  </p>
                </div>
              </div>

              {/* Form card */}
              <div className="coding-card rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                {isLoginMode ? (
                  // Sign In Panel
                  <div className="space-y-5">
                    {/* Email / Tel selector tabs */}
                    <div className="grid grid-cols-2 p-1 bg-zinc-950 rounded-xl border border-zinc-900">
                      <button
                        onClick={() => {
                          setAuthMethod('email');
                          setAuthEmail('');
                        }}
                        className={`py-2 text-xs font-bold uppercase tracking-wider font-mono rounded-lg transition-all ${
                          authMethod === 'email'
                            ? 'bg-[#0f2e2a] text-[#00bfa5] border border-[#00bfa5]/25 shadow-sm'
                            : 'text-zinc-500 hover:text-zinc-350'
                        }`}
                      >
                        Email
                      </button>
                      <button
                        onClick={() => {
                          setAuthMethod('tel');
                          setAuthEmail('');
                        }}
                        className={`py-2 text-xs font-bold uppercase tracking-wider font-mono rounded-lg transition-all ${
                          authMethod === 'tel'
                            ? 'bg-[#0f2e2a] text-[#00bfa5] border border-[#00bfa5]/25 shadow-sm'
                            : 'text-zinc-500 hover:text-zinc-350'
                        }`}
                      >
                        Tel
                      </button>
                    </div>

                    <div className="space-y-3.5">
                      {/* Email or Tel input wrapper */}
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                          {authMethod === 'email' ? <Mail size={15} /> : <Phone size={15} />}
                        </div>
                        <input 
                          type={authMethod === 'email' ? 'email' : 'tel'} 
                          placeholder={authMethod === 'email' ? 'alipy175@gmail.com' : 'Please enter mobile number'}
                          value={authEmail}
                          onChange={(e) => setAuthEmail(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-850 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 font-mono transition duration-200"
                        />
                      </div>

                      {/* Password input with toggle */}
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                          <Lock size={15} />
                        </div>
                        <input 
                          type={showPassword ? 'text' : 'password'} 
                          placeholder="Password"
                          value={authPassword}
                          onChange={(e) => setAuthPassword(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-850 rounded-xl pl-10 pr-10 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 font-mono transition duration-200"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-zinc-300 transition"
                        >
                          {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>

                      {/* Forgot password */}
                      <div className="text-right">
                        <button 
                          onClick={() => showToast("Security reset links sent. Please check your recovery inbox or contact support.", "info")}
                          className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold font-mono transition"
                        >
                          Forgot Password?
                        </button>
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={handleSignIn}
                        className="w-full bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-black py-3 rounded-xl text-xs uppercase tracking-wider text-center transition duration-200 shadow-lg shadow-cyan-500/10 active:scale-[0.98]"
                      >
                        Login
                      </button>

                      {/* Toggle panel view */}
                      <div className="text-center pt-2">
                        <button 
                          onClick={() => setIsLoginMode(false)}
                          className="text-[10px] text-zinc-400 hover:text-cyan-400 font-bold font-mono uppercase tracking-wide"
                        >
                          Don't have an account? <span className="underline text-cyan-400">Sign Up</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Sign Up Panel
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Create Account</h2>
                      <p className="text-[10px] text-zinc-400">Join to activate direct yield mirroring and lock-pools.</p>
                    </div>

                    <div className="space-y-3">
                      {/* Username */}
                      <input 
                        type="text" 
                        placeholder="Username"
                        value={authUsername}
                        onChange={(e) => setAuthUsername(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-4 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500 font-mono transition duration-200"
                      />

                      {/* Email/Phone */}
                      <input 
                        type="email" 
                        placeholder="Email Address or Mobile"
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-4 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500 font-mono transition duration-200"
                      />

                      {/* Password */}
                      <div className="relative">
                        <input 
                          type={showPassword ? 'text' : 'password'} 
                          placeholder="Password (6+ characters)"
                          value={authPassword}
                          onChange={(e) => setAuthPassword(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-4 pr-10 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500 font-mono transition duration-200"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-500 hover:text-zinc-300 transition"
                        >
                          {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>

                      {/* Pin */}
                      <input 
                        type="password" 
                        maxLength={6}
                        placeholder="Withdrawal PIN (6 Digits)"
                        value={authPin}
                        onChange={(e) => setAuthPin(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-4 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500 font-mono text-center tracking-widest transition duration-200"
                      />

                      {/* Invite Code */}
                      <input 
                        type="text" 
                        placeholder="Invitation Code (Optional)"
                        value={authRefCode}
                        onChange={(e) => setAuthRefCode(e.target.value.toUpperCase())}
                        className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-4 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500 font-mono transition duration-200"
                      />

                      {/* Register Submit */}
                      <button
                        onClick={handleSignUp}
                        className="w-full bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-black py-3 rounded-xl text-xs uppercase tracking-wider text-center transition duration-200 shadow-lg shadow-cyan-500/10 active:scale-[0.98]"
                      >
                        Register Now
                      </button>

                      {/* Toggle panel view */}
                      <div className="text-center pt-2">
                        <button 
                          onClick={() => setIsLoginMode(true)}
                          className="text-[10px] text-zinc-400 hover:text-cyan-400 font-bold font-mono uppercase tracking-wide"
                        >
                          Have an account? <span className="underline text-cyan-400">Sign In</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          // ================================== MAIN CORE WORKSPACE ==================================
          <>
            <Header 
              user={currentUser} 
              onNavigate={(screen) => setCurrentScreen(screen)} 
              unreadChatCount={unreadChatCount} 
            />

            <main className="flex-1 overflow-y-auto pt-3">
              <AnimatePresence mode="wait">
                {currentScreen === 'dashboard' && (
                  <div key="dashboard">
                    <Dashboard
                      user={currentUser}
                      onNavigate={(screen) => setCurrentScreen(screen)}
                      onDepositClick={() => {
                        setDepositStep(1);
                        setDepositAmount('');
                        setDepositOpen(true);
                      }}
                      onWithdrawClick={() => {
                        setWithdrawAmount('');
                        setWithdrawAddress('');
                        setWithdrawPin('');
                        setWithdrawOpen(true);
                      }}
                      onClaimBonus={handleClaimDailyBonus}
                      activeTrades={transactions.filter(t => t.status === TransactionStatus.Pending || t.status === TransactionStatus.Hold)}
                      activeStakeAmount={activeStake ? activeStake.amount : 0}
                      onReleaseTrade={handleReleaseTrade}
                    />
                  </div>
                )}

                {currentScreen === 'market' && (
                  <motion.div
                    key="market"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4 px-4 pb-12"
                  >
                    <div className="flex justify-between items-center">
                      <h2 className="text-sm font-bold text-white tracking-tight uppercase font-mono">Live Spot Market</h2>
                    </div>
                    <TradingViewWidget height={310} />
                  </motion.div>
                )}

                {currentScreen === 'copyTrade' && (
                  <div key="copyTrade">
                    <CopyTrading
                      user={currentUser}
                      onNavigate={(screen) => setCurrentScreen(screen)}
                      traders={INITIAL_TRADERS}
                      activeTrades={transactions.filter(t => t.status === TransactionStatus.Pending || t.status === TransactionStatus.Hold)}
                      onStartCopyTrade={handleStartCopyTrade}
                      onReleaseTrade={handleReleaseTrade}
                      onInstantSettleTrade={handleInstantSettleTrade}
                    />
                  </div>
                )}

                {currentScreen === 'refer' && (
                  <div key="refer">
                    <Referral
                      user={currentUser}
                      onNavigate={(screen) => setCurrentScreen(screen)}
                      onCopySuccess={() => showToast('Affiliate invitation link copied.', 'success')}
                    />
                  </div>
                )}

                {currentScreen === 'more' && (
                  <div key="profile">
                    <Profile
                      user={currentUser}
                      onNavigate={(screen) => setCurrentScreen(screen)}
                      onUpdateKYC={handleUpdateKYC}
                      onUpdate2FA={handleUpdate2FA}
                      onUpdatePassword={handleUpdatePassword}
                      onLogout={handleLogout}
                      onShowSupport={() => setCurrentScreen('support')}
                      onShowToast={showToast}
                      onUpdateAvatar={handleUpdateAvatar}
                    />
                  </div>
                )}

                {currentScreen === 'history' && (
                  <div key="history">
                    <History
                      onNavigate={(screen) => setCurrentScreen(screen)}
                      transactions={transactions}
                      onReload={() => {
                        loadUserRelatedData(currentUser.uid);
                        showToast('Transaction list updated.', 'success');
                      }}
                    />
                  </div>
                )}

                {currentScreen === 'support' && (
                  <div key="support">
                    <Support 
                      onNavigate={(screen) => setCurrentScreen(screen)} 
                    />
                  </div>
                )}

                {currentScreen === 'leaderboard' && (
                  <motion.div
                    key="leaderboard"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4 px-4 pb-12"
                  >
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setCurrentScreen('dashboard')} 
                        className="text-zinc-400 hover:text-white transition p-1 hover:bg-zinc-850 rounded"
                      >
                        <ArrowLeft size={18} />
                      </button>
                      <h2 className="text-sm font-bold text-white tracking-tight uppercase font-mono">TOP PERFORMANCE TRADERS</h2>
                    </div>

                    <div className="coding-card rounded-xl p-4">
                      <div className="flex border-b border-zinc-800 pb-2 text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-3 font-mono">
                        <span className="w-12 text-center">Rank</span>
                        <span className="flex-1">Trader Profile</span>
                        <span className="w-20 text-right">30D ROI</span>
                      </div>

                      <div className="space-y-3.5">
                        {INITIAL_TRADERS.map((t, idx) => (
                          <div key={t.id} className="flex items-center justify-between border-b border-zinc-900 pb-2 text-xs font-mono">
                            <span className="w-12 text-center text-cyan-400 font-bold">#{idx + 1}</span>
                            <div className="flex-1 flex items-center gap-2">
                              <span className="text-white font-bold">{t.name}</span>
                              <span className="text-[9px] bg-zinc-950 border border-zinc-800 px-1.5 py-0.5 rounded text-zinc-500">ID: #{t.id}</span>
                            </div>
                            <span className="w-20 text-right text-emerald-400 font-bold">+{t.roi30d}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}


              </AnimatePresence>
            </main>

            {/* Bottom Global Navigation */}
            <Navbar 
              currentScreen={currentScreen} 
              onNavigate={(screen) => setCurrentScreen(screen)} 
            />
          </>
        )}

        {/* ================================== GLOBAL MODAL COVERS ================================== */}
        
        {/* A. Deposit Wallet Modal */}
        <AnimatePresence>
          {depositOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-xs">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="coding-card rounded-xl p-5 w-full max-w-sm relative"
              >
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="font-bold text-sm text-white uppercase font-mono">Deposit USDT</h3>
                    <p className="text-[10px] text-cyan-400 font-bold uppercase font-mono mt-0.5">Add funds to your account balance</p>
                  </div>
                  <button 
                    onClick={() => setDepositOpen(false)} 
                    className="w-7 h-7 bg-zinc-900 hover:bg-zinc-800 rounded text-zinc-400 flex items-center justify-center border border-zinc-800 transition text-xs font-bold font-mono"
                  >
                    ✕
                  </button>
                </div>

                {depositStep === 1 ? (
                  // Network Selector
                  <div className="space-y-4">
                    <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider font-mono">Select Blockchain Network</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['BEP20', 'TRC20', 'ERC20'].map(net => {
                        const isSel = depositNetwork === net;
                        return (
                          <div
                            key={net}
                            onClick={() => setDepositNetwork(net)}
                            className={`border rounded p-3.5 text-center cursor-pointer transition ${
                              isSel 
                                ? 'border-cyan-500 bg-cyan-950/30 text-cyan-400 font-bold' 
                                : 'border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-400'
                            }`}
                          >
                            <span className="block text-xs uppercase font-bold font-mono">{net}</span>
                            <span className="text-[8px] text-zinc-500 block mt-0.5">
                              {net === 'BEP20' ? 'Binance' : net === 'TRC20' ? 'TRON' : 'Ethereum'}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="bg-zinc-950 p-4 rounded border border-zinc-800 relative">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider font-mono">
                          Wallet Deposit Address
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 bg-zinc-900 rounded p-2 border border-zinc-800">
                        <span className="text-[10px] text-zinc-300 font-mono truncate select-all flex-1">
                          {depositAddresses[depositNetwork]}
                        </span>
                        
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(depositAddresses[depositNetwork]);
                            showToast('Address copied to clipboard.', 'success');
                          }}
                          className="bg-cyan-500 hover:bg-cyan-400 text-zinc-950 px-2.5 py-1 rounded text-[9px] font-bold font-mono uppercase"
                        >
                          Copy
                        </button>
                      </div>

                      <p className="text-[9px] text-yellow-500 font-semibold mt-2 font-mono">
                        ⚠️ Send only USDT tokens on this network.
                      </p>
                    </div>

                    <button
                      onClick={() => setDepositStep(2)}
                      className="w-full bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold py-3 rounded text-xs uppercase tracking-wider text-center transition font-mono flex items-center justify-center gap-1"
                    >
                      Continue <ArrowRight size={12} />
                    </button>
                  </div>
                ) : (
                  // Amount Selector
                  <div className="space-y-4">
                    <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block font-mono">Enter Deposit Amount</label>
                    <div className="bg-zinc-950 rounded p-4 border border-zinc-800 text-center relative">
                      <div className="flex items-center gap-2 justify-center mb-2">
                        <img src="https://assets.coingecko.com/coins/images/325/large/Tether.png" className="w-5 h-5 rounded-full" />
                        <span className="text-xs text-zinc-400 font-bold font-mono">USDT</span>
                      </div>
                      
                      <input 
                        type="number" 
                        min="25"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        placeholder="0.00"
                        className="bg-transparent text-center text-3xl font-bold text-white outline-none border-none placeholder-zinc-800 w-full font-mono focus:ring-0"
                      />
                      <p className="text-[10px] text-zinc-500 mt-2 font-mono">≈ ${parseFloat(depositAmount || '0').toFixed(2)} USD value</p>
                    </div>

                    <div className="bg-emerald-500/5 border border-emerald-500/20 p-3 rounded flex justify-between items-center text-[10px] text-zinc-400 font-mono">
                      <div>
                        <p className="font-bold text-white uppercase">Welcome Bonus Multiplier</p>
                        <p className="mt-0.5">Get a 10% bonus instantly on every deposit</p>
                      </div>
                      <span className="text-xs font-black text-emerald-400">+10%</span>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => setDepositStep(1)} 
                        className="flex-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 font-bold py-3 rounded text-xs uppercase tracking-wider transition font-mono"
                      >
                        Back
                      </button>
                      
                      <button 
                        onClick={handleConfirmDeposit}
                        disabled={parseFloat(depositAmount) < 25}
                        className={`flex-1 font-bold py-3 rounded text-xs uppercase tracking-wider transition font-mono ${
                          parseFloat(depositAmount) < 25
                            ? 'bg-zinc-900 text-zinc-500 border border-zinc-800 cursor-not-allowed'
                            : 'bg-cyan-500 hover:bg-cyan-400 text-zinc-950'
                        }`}
                      >
                        Confirm Deposit
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* B. Withdraw Wallet Modal */}
        <AnimatePresence>
          {withdrawOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-xs">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="coding-card rounded-xl p-5 w-full max-w-sm relative"
              >
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="font-bold text-sm text-white uppercase font-mono">Withdraw USDT</h3>
                    <p className="text-[10px] text-cyan-400 font-bold uppercase font-mono mt-0.5">Withdraw funds to your private wallet</p>
                  </div>
                  <button 
                    onClick={() => setWithdrawOpen(false)} 
                    className="w-7 h-7 bg-zinc-900 hover:bg-zinc-800 rounded text-zinc-400 flex items-center justify-center border border-zinc-800 transition text-xs font-bold font-mono"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Account overview available caps */}
                  <div className="bg-zinc-950 p-4 rounded border border-zinc-800 relative">
                    <div className="flex justify-between items-center text-[10px] text-zinc-500 font-bold uppercase font-mono mb-1">
                      <span>Available Balance</span>
                      <span>Min: 4 USDT</span>
                    </div>

                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-white tracking-tight font-mono">
                        {currentUser && (currentUser.totalVolume >= 800 ? currentUser.mainBalance + currentUser.profitBalance : currentUser.profitBalance).toFixed(2)}
                      </span>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase font-mono">USDT</span>
                    </div>

                    <p className="text-[10px] text-yellow-500 font-semibold mt-2 leading-relaxed font-mono">
                      ⚠️ Note: You must reach $800 in total trade volume to withdraw your initial deposit. Only your earned profits are withdrawable before this.
                    </p>
                  </div>

                  {/* Input Size */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block font-mono">Amount to Withdraw</label>
                    <div className="relative bg-zinc-950 rounded px-4 py-3 border border-zinc-800 focus-within:border-cyan-500 transition">
                      <div className="flex items-center gap-2">
                        <img src="https://assets.coingecko.com/coins/images/325/large/Tether.png" className="w-5 h-5 rounded-full" />
                        <input 
                          type="number" 
                          min="4"
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                          className="w-full bg-transparent text-white font-bold text-sm outline-none border-none placeholder-zinc-700 font-mono"
                          placeholder="0.00"
                        />
                        <span className="text-[10px] text-zinc-500 font-bold uppercase font-mono">USDT</span>
                      </div>
                    </div>
                  </div>

                  {/* Input Address Destination */}
                  <div className="space-y-1.5 font-mono">
                    <label className="text-[10px] text-zinc-500 font-bold uppercase block">Recipient Address (TRC20 / BEP20)</label>
                    <input 
                      type="text" 
                      placeholder="Enter USDT target address" 
                      value={withdrawAddress}
                      onChange={(e) => setWithdrawAddress(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded px-4 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>

                  {/* Input PIN Authentication code */}
                  <div className="space-y-1.5 font-mono">
                    <label className="text-[10px] text-zinc-500 font-bold uppercase block">Withdrawal PIN (6 digits)</label>
                    <input 
                      type="password" 
                      maxLength={6}
                      placeholder="••••••" 
                      value={withdrawPin}
                      onChange={(e) => setWithdrawPin(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded px-4 py-3 text-center text-xl tracking-widest text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button 
                      onClick={() => setWithdrawOpen(false)} 
                      className="flex-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 font-bold py-3 rounded text-xs uppercase tracking-wider transition font-mono"
                    >
                      Cancel
                    </button>
                    
                    <button 
                      onClick={handleConfirmWithdraw}
                      disabled={parseFloat(withdrawAmount) < 4 || !withdrawAddress || !withdrawPin}
                      className={`flex-1 font-bold py-3 rounded text-xs uppercase tracking-wider transition font-mono ${
                        parseFloat(withdrawAmount) < 4 || !withdrawAddress || !withdrawPin
                          ? 'bg-zinc-900 text-zinc-500 border border-zinc-800 cursor-not-allowed'
                          : 'bg-cyan-500 hover:bg-cyan-400 text-zinc-950'
                      }`}
                    >
                      Withdraw
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
