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
  Phone,
  Shield
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
import AdminPanel from './components/AdminPanel';
import AgentSupportPanel from './components/AgentSupportPanel';
import { VALID_ORDER_NUMBERS } from './lib/orderCodes';

// Firebase imports
import { auth, db } from './firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  increment
} from 'firebase/firestore';

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
  { id: 'c1', userId: 'm1', username: 'CryptoKing', userEmail: 'king@crypto.com', message: 'NGK is paying out insane staking yields today. Already collected 3.6%!', timestamp: new Date(Date.now() - 3600000).toISOString() },
  { id: 'c2', userId: 'm2', username: 'WhaleWatcher', userEmail: 'whale@watch.com', message: 'Just mirrored Kieranmoris copy trade with 500 USDT, locked and ready 🚀', timestamp: new Date(Date.now() - 1800000).toISOString() },
  { id: 'c3', userId: 'm3', username: 'TradeWizard', userEmail: 'wizard@trade.com', message: 'Does anyone know the withdrawal limit? Try to withdraw 120 USDT.', timestamp: new Date(Date.now() - 600000).toISOString() },
  { id: 'c4', userId: 'm4', username: 'Satoshi', userEmail: 'sat@btc.com', message: 'wizard@trade.com min is 4 USDT. Works instantly! Verified my KYC yesterday as well.', timestamp: new Date(Date.now() - 300000).toISOString() }
];

export default function App() {
  // Screens & Navigation
  const [currentScreen, setCurrentScreen] = useState<string>('dashboard');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);
  
  // NEW: NGK Animated Splash Screen State & Timer
  const [showSplash, setShowSplash] = useState<boolean>(true);
  useEffect(() => {
    const splashTimer = setTimeout(() => {
      setShowSplash(false);
    }, 3200);
    return () => clearTimeout(splashTimer);
  }, []);

  // Auth Screen states
  const [isLoginMode, setIsLoginMode] = useState<boolean>(true);
  const [authMethod, setAuthMethod] = useState<'email' | 'tel'>('email');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [authUsername, setAuthUsername] = useState<string>('');
  const [authEmail, setAuthEmail] = useState<string>('');
  const [authPassword, setAuthPassword] = useState<string>('');
  const [authPin, setAuthPin] = useState<string>('');
  const [authRefCode, setAuthRefCode] = useState<string>('');

  // Loading States to prevent double-clicks & accidental duplicates
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [depositLoading, setDepositLoading] = useState<boolean>(false);
  const [withdrawLoading, setWithdrawLoading] = useState<boolean>(false);
  const [isClaimingBonus, setIsClaimingBonus] = useState<boolean>(false);

  // Core App states
  const [activeUid, setActiveUid] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [adminSignal, setAdminSignal] = useState<any | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeStake, setActiveStake] = useState<Stake | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newChatMessage, setNewChatMessage] = useState<string>('');
  const [unreadChatCount, setUnreadChatCount] = useState<number>(3);

  // 2FA Security states for current logged in session
  const [sessionTwoFaVerified, setSessionTwoFaVerified] = useState<boolean>(false);
  const [loginTwoFaCode, setLoginTwoFaCode] = useState<string>('');
  const [isVerifyingLogin2Fa, setIsVerifyingLogin2Fa] = useState<boolean>(false);

  // Admin secure gate states
  const [adminGateEmail, setAdminGateEmail] = useState<string>('admin@gmail.com');
  const [adminGatePassword, setAdminGatePassword] = useState<string>('');

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

  // NEW: Password Strength Analyser
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, text: 'Empty', color: 'text-zinc-650', barColor: 'bg-zinc-850', width: 'w-0' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 2) {
      return { score, text: 'Weak (Should have numbers & upper case)', color: 'text-rose-500', barColor: 'bg-rose-500', width: 'w-1/3' };
    } else if (score <= 4) {
      return { score, text: 'Medium Strength', color: 'text-amber-500', barColor: 'bg-amber-500', width: 'w-2/3' };
    } else {
      return { score, text: 'Strong Password', color: 'text-emerald-400', barColor: 'bg-emerald-400', width: 'w-full' };
    }
  };

  // NEW: Secure Admin Gate Submit Handler
  const handleAdminGateSubmit = async () => {
    if (adminGateEmail.trim() !== 'admin@gmail.com' || adminGatePassword !== 'admin3737') {
      showToast('Decryption failed. Unauthorized security key sequence.', 'error');
      return;
    }

    try {
      const adminUid = 'NGK-ADMIN-NODE';
      const adminDocRef = doc(db, 'users', adminUid);
      const adminSnap = await getDoc(adminDocRef);
      if (!adminSnap.exists()) {
        await setDoc(adminDocRef, {
          uid: adminUid,
          username: 'NGK Admin Officer',
          email: 'admin@gmail.com',
          password: 'admin3737',
          phone: '+1 800-NGK-NODE',
          mainBalance: 999999.99,
          profitBalance: 999999.99,
          totalCommission: 0,
          teamVolume: 0,
          invitedBy: '',
          referralCode: 'NGK-ADMIN-NODE',
          kycStatus: 'Verified',
          google2fa: true,
          twoFaSecret: 'NGKSECRET',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
          totalVolume: 999999,
          streakDays: 365,
          lastBonusClaim: new Date().toISOString()
        });
      }
      setActiveUid(adminUid);
      localStorage.setItem('ngk_fallback_uid', adminUid);
      showToast('Administrative Console Decrypted successfully.', 'success');
      setAdminGatePassword('');
    } catch (err) {
      console.error(err);
      showToast('System validation error.', 'error');
    }
  };

  // NEW: URL Router and Security Guardian
  useEffect(() => {
    const handleUrlRouting = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      const search = window.location.search;

      const isPanel = path.includes('/panel') || hash.includes('panel') || search.includes('page=panel');
      const isSupport = path.includes('/support') || hash.includes('support') || search.includes('page=support');

      if (isPanel) {
        if (currentScreen !== 'admin') {
          setCurrentScreen('admin');
        }
      } else if (isSupport) {
        if (currentScreen !== 'support') {
          setCurrentScreen('support');
        }
      } else {
        // Enforce that admin and support are inaccessible unless the url contains the secret additions
        if (currentScreen === 'admin' || currentScreen === 'support') {
          setCurrentScreen('dashboard');
        }
      }
    };

    // Run on boot
    handleUrlRouting();

    // Check on standard state events and intervals to be completely bulletproof
    const interval = setInterval(handleUrlRouting, 400);
    window.addEventListener('popstate', handleUrlRouting);
    window.addEventListener('hashchange', handleUrlRouting);

    return () => {
      clearInterval(interval);
      window.removeEventListener('popstate', handleUrlRouting);
      window.removeEventListener('hashchange', handleUrlRouting);
    };
  }, [currentScreen]);

  // Pre-seed user's Telegram Bot Token
  useEffect(() => {
    const seedTelegramConfig = async () => {
      try {
        const docRef = doc(db, 'system', 'telegram_config');
        const snap = await getDoc(docRef);
        if (!snap.exists() || snap.data()?.botToken !== '8719761017:AAF-MI0AJu9cC-drfoHciDucr6fIxhJl4UQ') {
          await setDoc(docRef, {
            botToken: '8719761017:AAF-MI0AJu9cC-drfoHciDucr6fIxhJl4UQ',
            updatedAt: new Date().toISOString()
          }, { merge: true });
          console.log("Pre-seeded user's Telegram Bot Token successfully.");
        }
      } catch (err) {
        console.error("Error seeding Telegram bot config:", err);
      }
    };
    seedTelegramConfig();
  }, []);

  // 2. Synchronize URL, Chats, and Authentication status on boot
  useEffect(() => {
    // A. Parse referral code from invitation URL query params
    const params = new URLSearchParams(window.location.search);
    const invite = params.get('ref') || params.get('invite');
    if (invite) {
      setAuthRefCode(invite.toUpperCase());
    }

    // B. Real-time community chats listener
    const chatsRef = collection(db, 'chats');
    const qChats = query(chatsRef, orderBy('timestamp', 'asc'));
    const unsubscribeChats = onSnapshot(qChats, async (snapshot) => {
      if (!snapshot.empty) {
        const msgs: ChatMessage[] = [];
        snapshot.forEach((doc) => {
          msgs.push({ id: doc.id, ...doc.data() } as ChatMessage);
        });
        setChatMessages(msgs);
      } else {
        // If chat is empty on first boot, write high-quality initial seed messages to Firestore
        try {
          for (const msg of SEED_CHAT_MESSAGES) {
            await addDoc(chatsRef, {
              userId: msg.userId,
              username: msg.username,
              userEmail: msg.userEmail,
              message: msg.message,
              timestamp: msg.timestamp
            });
          }
        } catch (err) {
          console.error('Error seeding chat messages:', err);
        }
      }
    });

    // C. Real-time Firebase Authentication state observer with fallback validation
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setActiveUid(firebaseUser.uid);
      } else {
        const fallbackUid = localStorage.getItem('ngk_fallback_uid');
        if (fallbackUid) {
          setActiveUid(fallbackUid);
        } else {
          setActiveUid(null);
        }
      }
    });

    return () => {
      unsubscribeChats();
      unsubscribeAuth();
    };
  }, []);

  // 2.5 Real-time Firestore synchronizer for user metadata and ledger updates
  useEffect(() => {
    if (!activeUid) {
      setCurrentUser(null);
      setTransactions([]);
      setActiveStake(null);
      return;
    }

    const uid = activeUid;
    const userRef = doc(db, 'users', uid);

    // Listen to User document real-time
    const unsubUser = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data() as User;
        // Pre-assign avatar images dynamically from stable high-contrast presets if missing
        if (!userData.avatarUrl) {
          const portraits = [
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face'
          ];
          const seed = userData.email || userData.username || uid;
          let sum = 0;
          for (let i = 0; i < seed.length; i++) sum += seed.charCodeAt(i);
          userData.avatarUrl = portraits[sum % portraits.length];
        }
        setCurrentUser(userData);
      }
    });

    // Listen to User's subcollection `/transactions` inside user document
    const txsQuery = query(
      collection(db, 'users', uid, 'transactions'),
      orderBy('timestamp', 'desc')
    );
    const unsubTxs = onSnapshot(txsQuery, (snap) => {
      const loadedTxs: Transaction[] = [];
      snap.forEach((txDoc) => {
        loadedTxs.push({ id: txDoc.id, ...txDoc.data() } as Transaction);
      });
      setTransactions(loadedTxs);
    });

    // Listen to User's active stakes
    const stakesQuery = query(
      collection(db, 'users', uid, 'stakes'),
      where('status', '==', 'Active')
    );
    const unsubStakes = onSnapshot(stakesQuery, (snap) => {
      if (!snap.empty) {
        const activeOne = { id: snap.docs[0].id, ...snap.docs[0].data() } as Stake;
        setActiveStake(activeOne);
      } else {
        setActiveStake(null);
      }
    });

    return () => {
      unsubUser();
      unsubTxs();
      unsubStakes();
    };
  }, [activeUid]);

  // Global real-time listener for manual Admin Signals
  useEffect(() => {
    const unsubSignal = onSnapshot(doc(db, 'system', 'copyTradeSignal'), (docSnap) => {
      if (docSnap.exists()) {
        setAdminSignal(docSnap.data());
      } else {
        setAdminSignal(null);
      }
    });
    return () => unsubSignal();
  }, []);

  // 3. Real-time intervals check for Copy Trades expiration and Staking Yield accumulation
  useEffect(() => {
    if (!currentUser) return;

    const timer = setInterval(async () => {
      const nowStr = new Date().toISOString();

      try {
        // Query pending copy trades
        const txsRef = collection(db, 'users', currentUser.uid, 'transactions');
        const qPending = query(
          txsRef,
          where('type', '==', TransactionType.CopyTrade),
          where('status', '==', TransactionStatus.Pending)
        );
        const pendingSnap = await getDocs(qPending);

        for (const txDoc of pendingSnap.docs) {
          const tx = { id: txDoc.id, ...txDoc.data() } as Transaction;
          if (tx.endTime && tx.endTime <= nowStr) {
            const profit = tx.amount * 0.02; // exactly 2% profit rate
            const totalReturn = tx.amount + profit;

            if (tx.requiresApproval) {
              // 2nd daily trade gets placed on hold
              await updateDoc(doc(db, 'users', currentUser.uid, 'transactions', tx.id), {
                status: TransactionStatus.Hold,
                profit,
                totalReturn
              });
              try {
                await updateDoc(doc(db, 'copy_trades', tx.id), {
                  status: TransactionStatus.Hold,
                  profit,
                  totalReturn
                });
              } catch (err) {
                console.warn("Global copy_trades doc update failed:", err);
              }
              showToast(`VIP Daily Limit Trade finished! Placed on Security HOLD for Audit.`, 'warning');
            } else {
              await updateDoc(doc(db, 'users', currentUser.uid, 'transactions', tx.id), {
                status: TransactionStatus.Success,
                profit,
                totalReturn
              });
              try {
                await updateDoc(doc(db, 'copy_trades', tx.id), {
                  status: TransactionStatus.Success,
                  profit,
                  totalReturn
                });
              } catch (err) {
                console.warn("Global copy_trades doc update failed:", err);
              }

              await updateDoc(doc(db, 'users', currentUser.uid), {
                mainBalance: increment(totalReturn),
                profitBalance: increment(profit)
              });

              showToast(`Copy trade with ${tx.traderName} complete! +$${profit.toFixed(2)} USDT profits added.`, 'success');
              
              // Distribute Level 1 and Level 2 profit commissions
              await distributeProfitCommissions(currentUser.uid, profit);
            }
          }
        }

        // Check Staking yields
        const stakesRef = collection(db, 'users', currentUser.uid, 'stakes');
        const qStakes = query(stakesRef, where('status', '==', 'Active'));
        const stakesSnap = await getDocs(qStakes);

        for (const stakeDoc of stakesSnap.docs) {
          const st = { id: stakeDoc.id, ...stakeDoc.data() } as Stake;
          const startMs = new Date(st.startDate).getTime();
          const endMs = new Date(st.endDate).getTime();
          const nowMs = Date.now();

          if (nowMs >= endMs) {
            // Stake complete
            await updateDoc(doc(db, 'users', currentUser.uid, 'stakes', st.id), {
              status: 'Completed'
            });

            await updateDoc(doc(db, 'users', currentUser.uid), {
              mainBalance: increment(st.amount),
              totalStaked: increment(-st.amount)
            });

            showToast(`Staking completed! Staked $${st.amount.toFixed(2)} USDT returned to balance.`, 'success');
          } else {
            // Check daily yield payout (simulated every 1 minute)
            const lastClaimMs = new Date(st.lastClaimed).getTime();
            const elapsedSecs = (nowMs - lastClaimMs) / 1000;

            if (elapsedSecs >= 60) {
              const dailyYield = st.amount * 0.036;

              // Update stake last claimed
              await updateDoc(doc(db, 'users', currentUser.uid, 'stakes', st.id), {
                lastClaimed: new Date().toISOString(),
                totalClaimed: increment(dailyYield)
              });

              // Add a yield bonus transaction
              const txId = 'ST-ROI-' + Math.random().toString(36).substring(2, 9).toUpperCase();
              const newTx: Transaction = {
                id: txId,
                userId: currentUser.uid,
                type: TransactionType.Bonus,
                amount: dailyYield,
                status: TransactionStatus.Success,
                timestamp: new Date().toISOString(),
                traderName: 'AI Yield'
              };

              await setDoc(doc(db, 'users', currentUser.uid, 'transactions', txId), newTx);

              // Update user profit balance
              await updateDoc(doc(db, 'users', currentUser.uid), {
                profitBalance: increment(dailyYield)
              });

              showToast(`Staking profit unlocked! +$${dailyYield.toFixed(2)} USDT added to profits.`, 'success');
            }
          }
        }
      } catch (err) {
        console.error('Simulation check error:', err);
      }

    }, 3000); // Checked every 3 seconds for fast feedback

    return () => clearInterval(timer);
  }, [currentUser]);

  // Simulated chats interval to generate lively discussions inside the Community Chat window
  useEffect(() => {
    const chatTicker = setInterval(async () => {
      if (!currentUser || currentScreen !== 'community') return;

      const mockTraders = ['Express Trader', 'CryptoWhale', 'Satoshi_AI', 'Alpha Signals', 'ProfitPulse', 'WhaleWatcher'];
      const mockTalks = [
        'Bitcoin is holding solid above 90k, copy trades are highly accurate today!',
        'Just claimed daily bonus streak multipliers. Streak 5 lets go 🔥',
        'Staked another 500 USDT into the AI quantitative pool. Free yields!',
        'Withdrawal of 45 USDT completed in 3 seconds. NGK does not play!',
        'Invite links are yielding massive commissions. Level 1 referral unlocked me 25 USDT reward.',
        'Anyone mirroring Satoshi_AI master profile? Win rate is crazy!'
      ];

      const rTrader = mockTraders[Math.floor(Math.random() * mockTraders.length)];
      const rTalk = mockTalks[Math.floor(Math.random() * mockTalks.length)];

      try {
        await addDoc(collection(db, 'chats'), {
          userId: 'm-' + Math.random().toString(36).substring(2, 5),
          username: rTrader,
          userEmail: `${rTrader.toLowerCase().replace(' ', '')}@ngk.com`,
          message: rTalk,
          timestamp: new Date().toISOString()
        });
      } catch (err) {
        console.error(err);
      }

    }, 24000); // Periodically post chats

    return () => clearInterval(chatTicker);
  }, [currentUser, currentScreen]);

  // 4. Handle Registration & Authentications
  const handleSignUp = async () => {
    if (!authEmail || !authPassword || !authUsername) {
      showToast('Please fill out all required fields.', 'error');
      return;
    }

    if (authPassword.length < 6) {
      showToast('Password must be at least 6 characters.', 'error');
      return;
    }

    if (authPin.length !== 6) {
      showToast('Withdrawal PIN must be exactly 6 digits.', 'error');
      return;
    }

    if (authEmail.trim().toLowerCase() === 'admin@gmail.com') {
      showToast('This email address is reserved for administrative services.', 'error');
      return;
    }

    setAuthLoading(true);

    try {
      // Validate invitation code if provided
      if (authRefCode) {
        const q = query(collection(db, 'users'), where('referralCode', '==', authRefCode));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
          showToast('Invalid invitation code. Please verify or leave it blank.', 'error');
          setAuthLoading(false);
          return;
        }
      }

      // 1. Create firebase auth user with Custom Database fallback for robustness
      let uid = '';
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, authEmail, authPassword);
        uid = userCredential.user.uid;
      } catch (authErr: any) {
        console.warn("Firebase Auth failed, falling back to custom Firestore Account system:", authErr);
        
        // Verify email uniqueness in Firestore
        const qEmail = query(collection(db, 'users'), where('email', '==', authEmail));
        const emailSnap = await getDocs(qEmail);
        if (!emailSnap.empty) {
          throw { code: 'auth/email-already-in-use', message: 'Email is already registered.' };
        }
        
        uid = 'NGK-USR-' + Math.random().toString(36).substring(2, 9).toUpperCase();
        localStorage.setItem('ngk_fallback_uid', uid);
      }

      // 2. Generate referral code
      const generatedRefCode = 'NGK-' + Math.random().toString(36).substring(2, 7).toUpperCase();

      const portraits = [
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face'
      ];
      const assignedAvatar = portraits[Math.floor(Math.random() * portraits.length)];

      // 3. Setup initial document
      const initialUser: User = {
        uid,
        username: authUsername,
        email: authEmail,
        phone: authMethod === 'tel' ? authEmail : '',
        password: authPassword, // Saved for recovery/profile viewing
        withdrawalPin: authPin,
        referrer: authRefCode || '',
        invitedBy: authRefCode || '',
        referralCode: generatedRefCode,
        mainBalance: 10.0, // 10 USDT welcome gift!
        profitBalance: 0.0,
        totalStaked: 0.0,
        totalCommission: 0.0,
        totalVolume: 0.0,
        teamVolume: 0.0,
        teamProfit: 0.0,
        teamCount: 0,
        loginStreak: 1,
        lastBonusClaim: null,
        copyTradeResetTime: null,
        copyTradeCount: 0,
        tier: VIPRank.Silver,
        isSupportOnline: true,
        kycStatus: 'not_submitted',
        twoFactorEnabled: false,
        twoFactorSecret: '',
        createdAt: new Date().toISOString(),
        avatarUrl: assignedAvatar
      };

      // Create document in Firestore
      await setDoc(doc(db, 'users', uid), initialUser);

      // Add a Welcome Gift transaction inside the user's transactions subcollection
      const giftTxId = 'NGK-GIFT-' + Math.random().toString(36).substring(2, 9).toUpperCase();
      const giftTx: Transaction = {
        id: giftTxId,
        userId: uid,
        type: TransactionType.Bonus,
        amount: 10.0,
        status: TransactionStatus.Success,
        timestamp: new Date().toISOString(),
        traderName: 'Welcome Gift'
      };

      await setDoc(doc(db, 'users', uid, 'transactions', giftTxId), giftTx);

      // Handle inviter relationships
      if (authRefCode) {
        const q = query(collection(db, 'users'), where('referralCode', '==', authRefCode));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const parentDoc = querySnapshot.docs[0];
          const parentUid = parentDoc.id;

          // Add child metadata to parent's `/team` and `/refers` subcollections
          const refMetaId = 'NGK-REF-META-' + Math.random().toString(36).substring(2, 9).toUpperCase();
          const teamMember = {
            id: refMetaId,
            name: authUsername,
            childUid: uid,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
            profit: '0.00 USDT',
            active: false, // Inactive until first successful deposit
            level: 1,
            timestamp: new Date().toISOString()
          };

          await setDoc(doc(db, 'users', parentUid, 'team', refMetaId), teamMember);
          await setDoc(doc(db, 'users', parentUid, 'refers', refMetaId), teamMember);
        }
      }

      // Trigger active Uid synchronization directly for fallback flow
      setActiveUid(uid);

      showToast('Registration successful! Placed $10.00 USDT welcome bonus!', 'success');
      setAuthEmail('');
      setAuthUsername('');
      setAuthPassword('');
      setAuthPin('');
      setAuthRefCode('');

    } catch (err: any) {
      console.error(err);
      let errMsg = 'Registration failed.';
      if (err.code === 'auth/email-already-in-use') {
        errMsg = 'Email is already registered.';
      } else if (err.code === 'auth/invalid-email') {
        errMsg = 'Invalid email address format.';
      } else if (err.code === 'auth/weak-password') {
        errMsg = 'Password is too weak.';
      }
      showToast(errMsg, 'error');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignIn = async () => {
    if (!authEmail || !authPassword) {
      showToast('Please enter your email and password.', 'error');
      return;
    }

    setAuthLoading(true);

    // Override for admin node account
    if (authEmail.trim().toLowerCase() === 'admin@gmail.com') {
      if (authPassword !== 'admin3737') {
        showToast('Invalid security password for administrative node.', 'error');
        setAuthLoading(false);
        return;
      }
      try {
        const adminUid = 'NGK-ADMIN-NODE';
        const adminDocRef = doc(db, 'users', adminUid);
        const adminSnap = await getDoc(adminDocRef);
        if (!adminSnap.exists()) {
          await setDoc(adminDocRef, {
            uid: adminUid,
            username: 'NGK Admin Officer',
            email: 'admin@gmail.com',
            password: 'admin3737',
            phone: '+1 800-NGK-NODE',
            mainBalance: 999999.99,
            profitBalance: 999999.99,
            totalCommission: 0,
            teamVolume: 0,
            invitedBy: '',
            referralCode: 'NGK-ADMIN-NODE',
            kycStatus: 'Verified',
            google2fa: true,
            twoFaSecret: 'NGKSECRET',
            avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
            totalVolume: 999999,
            streakDays: 365,
            lastBonusClaim: new Date().toISOString()
          });
        }
        setActiveUid(adminUid);
        localStorage.setItem('ngk_fallback_uid', adminUid);
        showToast('Administrative Console Decrypted successfully.', 'success');
        setAuthEmail('');
        setAuthPassword('');
        setAuthLoading(false);
        return;
      } catch (err) {
        console.error(err);
        showToast('Error initializing admin node.', 'error');
        setAuthLoading(false);
        return;
      }
    }

    try {
      let uid = '';
      try {
        const userCredential = await signInWithEmailAndPassword(auth, authEmail, authPassword);
        uid = userCredential.user.uid;
      } catch (authErr: any) {
        console.warn("Firebase Auth login failed, checking custom Firestore database records:", authErr);
        
        // Search for user by email in Firestore
        const qEmail = query(collection(db, 'users'), where('email', '==', authEmail));
        const emailSnap = await getDocs(qEmail);
        if (emailSnap.empty) {
          throw { code: 'auth/user-not-found', message: 'Invalid email address or password.' };
        }
        
        const userDoc = emailSnap.docs[0];
        const userData = userDoc.data();
        if (userData.password !== authPassword) {
          throw { code: 'auth/wrong-password', message: 'Invalid email address or password.' };
        }
        
        uid = userDoc.id;
        localStorage.setItem('ngk_fallback_uid', uid);
      }

      // Commit to state immediately to log the user in
      setActiveUid(uid);

      showToast('Welcome back to NGK Trading!', 'success');
      setAuthEmail('');
      setAuthPassword('');
    } catch (err: any) {
      console.error(err);
      let errMsg = 'Authentication failed. Please check credentials.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        errMsg = 'Invalid email address or password.';
      }
      showToast(errMsg, 'error');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('ngk_fallback_uid');
      setActiveUid(null);
      setSessionTwoFaVerified(false);
      setLoginTwoFaCode('');
      showToast('Successfully signed out of secure session.', 'info');
      setCurrentScreen('dashboard');
    } catch (err) {
      console.error(err);
      showToast('Sign out failed.', 'error');
    }
  };

  const handleVerifyLogin2Fa = async () => {
    if (!currentUser) return;
    if (!currentUser.twoFactorSecret) {
      setSessionTwoFaVerified(true);
      return;
    }

    if (!loginTwoFaCode.trim()) {
      showToast('Please enter your 2FA authenticator code.', 'error');
      return;
    }

    setIsVerifyingLogin2Fa(true);
    try {
      const totp = new OTPAuth.TOTP({
        issuer: 'NGK',
        label: currentUser.email,
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        secret: currentUser.twoFactorSecret
      });

      const delta = totp.validate({
        token: loginTwoFaCode.trim(),
        window: 2
      });

      if (delta !== null) {
        setSessionTwoFaVerified(true);
        showToast('Google 2FA security verification success!', 'success');
        setLoginTwoFaCode('');
      } else {
        showToast('Invalid 2FA Google Authenticator code!', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to verify Authenticator code.', 'error');
    } finally {
      setIsVerifyingLogin2Fa(false);
    }
  };

  // Claim streak bonus
  const handleClaimDailyBonus = async () => {
    if (!currentUser) return;
    if (isClaimingBonus) return;

    setIsClaimingBonus(true);

    try {
      // 1. Enforce active deposit restriction: at least one successful deposit
      const txsRef = collection(db, 'users', currentUser.uid, 'transactions');
      const qDeposit = query(
        txsRef, 
        where('type', '==', TransactionType.Deposit), 
        where('status', '==', TransactionStatus.Success)
      );
      const depositSnap = await getDocs(qDeposit);
      if (depositSnap.empty) {
        showToast("Access Denied: Only users with a successful deposit history can claim the daily bonus.", "error");
        setIsClaimingBonus(false);
        return;
      }

      // 2. Check already claimed today
      let streak = 1;
      if (currentUser.lastBonusClaim) {
        const lastClaimDate = new Date(currentUser.lastBonusClaim);
        const diffMs = Date.now() - lastClaimDate.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);

        if (diffHours < 24) {
          showToast("You have already claimed your daily bonus today!", "warning");
          setIsClaimingBonus(false);
          return;
        } else if (diffHours < 48) {
          streak = (currentUser.loginStreak || 0) + 1;
        } else {
          streak = 1; // Reset streak if missed a day
        }
      }

      // 3. Perfect reward scaling (0.1 USDT on 1st day, 0.2 USDT on 2nd, etc.)
      const reward = streak * 0.10;

      const txId = 'NGK-STREAK-' + Math.random().toString(36).substring(2, 9).toUpperCase();
      const bonusTx: Transaction = {
        id: txId,
        userId: currentUser.uid,
        type: TransactionType.Bonus,
        amount: reward,
        status: TransactionStatus.Success,
        timestamp: new Date().toISOString(),
        traderName: 'Daily Claim'
      };

      await setDoc(doc(db, 'users', currentUser.uid, 'transactions', txId), bonusTx);

      await updateDoc(doc(db, 'users', currentUser.uid), {
        mainBalance: increment(reward),
        loginStreak: streak,
        lastBonusClaim: new Date().toISOString()
      });

      showToast(`+$${reward.toFixed(2)} USDT Daily Claim added! Streak: ${streak} Days`, 'success');
    } catch (err) {
      console.error(err);
      showToast("Error processing daily claim. Please try again.", "error");
    } finally {
      setIsClaimingBonus(false);
    }
  };

  // Copy trade deployment
  const handleStartCopyTrade = async (
    traderName: string, 
    amount: number, 
    traderAvatar?: string, 
    tradePair?: string,
    orderNumber?: string
  ): Promise<boolean> => {
    if (!currentUser) return false;

    if (!orderNumber) {
      showToast('Please enter a valid order number.', 'error');
      return false;
    }

    if (orderNumber.includes(' ')) {
      showToast('Order number cannot contain spaces.', 'error');
      return false;
    }

    const cleanCode = orderNumber.trim().toUpperCase();

    // 1. Check if there is an active signal and it has not expired
    const nowMs = Date.now();
    const startMs = adminSignal?.startTime ? new Date(adminSignal.startTime).getTime() : 0;
    const endMs = adminSignal?.endTime ? new Date(adminSignal.endTime).getTime() : 0;
    const isSignalActiveNow = adminSignal && adminSignal.isActive && nowMs >= startMs && nowMs <= endMs;

    if (!isSignalActiveNow) {
      showToast('Copy trade blocked! No active signal code is currently broadcasting or the previous code has expired (1-hour validity).', 'error');
      return false;
    }

    if (cleanCode !== adminSignal.code.trim().toUpperCase()) {
      showToast('Invalid Order Code. Please check the active order code shared in the official group.', 'error');
      return false;
    }

    // 2. Check if this is the additional signal (Signal 3), which requires minimum $300 balance
    if (adminSignal.type === 'signal_3') {
      if (currentUser.mainBalance < 300) {
        showToast('Additional Trade blocked! Signal #3 is only permitted for VIP users with a main balance of 300 USDT or more.', 'error');
        return false;
      }
    }

    if (amount < 100) {
      showToast('Minimum copy trading amount is 100 USDT.', 'error');
      return false;
    }

    if (currentUser.mainBalance < amount) {
      showToast('Insufficient main balance. Please deposit funds.', 'error');
      return false;
    }

    try {
      // 1. Verify that this specific user has not already used this order/signal code
      const qCode = query(
        collection(db, 'users', currentUser.uid, 'transactions'),
        where('type', '==', TransactionType.CopyTrade),
        where('orderNumber', '==', cleanCode)
      );
      const codeSnap = await getDocs(qCode);
      if (!codeSnap.empty) {
        showToast('You have already deployed a license with this signal code. Please wait for the next signal code.', 'error');
        return false;
      }

      // Query past copy trades for count checks
      const q = query(
        collection(db, 'users', currentUser.uid, 'transactions'),
        where('type', '==', TransactionType.CopyTrade)
      );
      const snapshot = await getDocs(q);
      
      // Calculate copy trades placed in the last 24 hours
      const nowTimeMs = Date.now();
      const userCopyTradesLast24h = snapshot.docs
        .map(doc => doc.data() as Transaction)
        .filter(t => (nowTimeMs - new Date(t.timestamp).getTime()) < 24 * 60 * 60 * 1000);

      if (userCopyTradesLast24h.length >= 2) {
        showToast('Daily limit of 2 copy trades reached. Please wait for the next 24-hour cycle to participate.', 'warning');
        return false;
      }

      const totalTradesCount = snapshot.docs.length;
      const isSecondTrade = totalTradesCount === 1;

      // Adjust user VIP Rank dynamically based on total Volume
      const newVolume = currentUser.totalVolume + amount;
      let newTier = currentUser.tier;
      if (newVolume >= 20000) {
        newTier = VIPRank.Platinum;
      } else if (newVolume >= 5000) {
        newTier = VIPRank.Gold;
      } else if (newVolume >= 800) {
        newTier = VIPRank.Silver;
      }

      const txId = 'NGK-CT-' + Math.random().toString(36).substring(2, 9).toUpperCase();
      const endTime = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 minutes!

      const copyTradeTx: Transaction = {
        id: txId,
        userId: currentUser.uid,
        type: TransactionType.CopyTrade,
        amount,
        status: TransactionStatus.Pending,
        timestamp: new Date().toISOString(),
        traderName,
        endTime,
        requiresApproval: isSecondTrade,
        traderAvatar,
        tradePair,
        orderNumber: cleanCode
      };

      await setDoc(doc(db, 'users', currentUser.uid, 'transactions', txId), copyTradeTx);
      
      // Write a mirror of copy trade globally for admin convenience
      try {
        await setDoc(doc(db, 'copy_trades', txId), {
          ...copyTradeTx,
          username: currentUser.username,
          userEmail: currentUser.email,
          userId: currentUser.uid
        });
      } catch (err) {
        console.warn("Global copy_trades write failed:", err);
      }

      await updateDoc(doc(db, 'users', currentUser.uid), {
        mainBalance: increment(-amount),
        totalVolume: increment(amount),
        copyTradeCount: totalTradesCount + 1,
        tier: newTier
      });

      if (isSecondTrade) {
        showToast(`VIP 2nd Trade deployed! Placed on Security Escrow upon 30m completion.`, 'info');
      } else {
        showToast(`Copy Trade with ${traderName} started! Settle in 30 minutes.`, 'success');
      }

      return true;

    } catch (err) {
      console.error(err);
      showToast('Failed to start copy trade.', 'error');
      return false;
    }
  };

  // Instant settle
  const handleInstantSettleTrade = async (txId: string) => {
    if (!currentUser) return;

    try {
      const txRef = doc(db, 'users', currentUser.uid, 'transactions', txId);
      const txSnap = await getDoc(txRef);
      if (!txSnap.exists()) return;

      const tx = txSnap.data() as Transaction;
      if (tx.status !== TransactionStatus.Pending) return;

      const profit = tx.amount * 0.02; // exactly 2% profit rate
      const totalReturn = tx.amount + profit;
      const isSecondTrade = tx.requiresApproval;

      if (isSecondTrade) {
        await updateDoc(txRef, {
          status: TransactionStatus.Hold,
          profit,
          totalReturn
        });
        try {
          await updateDoc(doc(db, 'copy_trades', txId), {
            status: TransactionStatus.Hold,
            profit,
            totalReturn
          });
        } catch (err) {
          console.warn("Global copy_trades status update failed:", err);
        }
        showToast(`VIP Security check triggered on trade ${tx.id}. Funds placed in Escrow.`, 'warning');
      } else {
        await updateDoc(txRef, {
          status: TransactionStatus.Success,
          profit,
          totalReturn
        });
        try {
          await updateDoc(doc(db, 'copy_trades', txId), {
            status: TransactionStatus.Success,
            profit,
            totalReturn
          });
        } catch (err) {
          console.warn("Global copy_trades status update failed:", err);
        }

        await updateDoc(doc(db, 'users', currentUser.uid), {
          mainBalance: increment(totalReturn),
          profitBalance: increment(profit)
        });

        showToast(`Copy trade complete! +$${profit.toFixed(2)} USDT profits added.`, 'success');
        
        // Distribute Level 1 and Level 2 profit commissions
        await distributeProfitCommissions(currentUser.uid, profit);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Release hold transaction using real 2FA verification
  const handleReleaseTrade = async (txId: string, totpCode: string): Promise<boolean> => {
    if (!currentUser) return false;

    if (!currentUser.twoFactorEnabled || !currentUser.twoFactorSecret) {
      showToast('Please enable 2FA in your Security profile first!', 'warning');
      return false;
    }

    try {
      const totp = new OTPAuth.TOTP({
        issuer: 'NGK',
        label: currentUser.email,
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        secret: currentUser.twoFactorSecret
      });

      const delta = totp.validate({
        token: totpCode,
        window: 2
      });

      if (delta === null) {
        showToast('Invalid 2FA Authenticator code!', 'error');
        return false;
      }

      const txRef = doc(db, 'users', currentUser.uid, 'transactions', txId);
      const txSnap = await getDoc(txRef);
      if (!txSnap.exists()) {
        showToast('Held trade not found.', 'error');
        return false;
      }

      const tx = txSnap.data() as Transaction;
      if (tx.status !== TransactionStatus.Hold) {
        showToast('Held trade not found or already settled.', 'error');
        return false;
      }

      const profit = tx.profit || (tx.amount * 0.0219);
      const totalReturn = tx.totalReturn || (tx.amount + profit);

      await updateDoc(txRef, {
        status: TransactionStatus.Success,
        profit,
        totalReturn
      });

      await updateDoc(doc(db, 'users', currentUser.uid), {
        mainBalance: increment(totalReturn),
        profitBalance: increment(profit)
      });

      showToast(`2FA Verified! +$${profit.toFixed(2)} USDT released to your main balance!`, 'success');
      
      // Distribute Level 1 and Level 2 profit commissions
      await distributeProfitCommissions(currentUser.uid, profit);
      
      return true;
    } catch (err) {
      console.error(err);
      showToast('Error verifying security authenticator.', 'error');
      return false;
    }
  };

  // Reusable helper to distribute profit commissions to inviters (5% Level 1, 3% Level 2)
  const distributeProfitCommissions = async (childUid: string, profitAmount: number) => {
    try {
      const childDocRef = doc(db, 'users', childUid);
      const childSnap = await getDoc(childDocRef);
      if (!childSnap.exists()) return;
      const childObj = childSnap.data();

      // Check Level 1 Direct Referral (5%)
      if (childObj.invitedBy) {
        const parent1Query = query(collection(db, 'users'), where('referralCode', '==', childObj.invitedBy));
        const parent1Snap = await getDocs(parent1Query);
        if (!parent1Snap.empty) {
          const parent1Doc = parent1Snap.docs[0];
          const parent1Uid = parent1Doc.id;
          const parent1Obj = parent1Doc.data();
          const commission1 = profitAmount * 0.05; // 5% Level 1 Direct commission on profit

          if (commission1 > 0) {
            await updateDoc(doc(db, 'users', parent1Uid), {
              mainBalance: increment(commission1),
              totalCommission: increment(commission1)
            });

            const txId1 = 'NGK-COMM1-' + Math.random().toString(36).substring(2, 9).toUpperCase();
            const commTx1 = {
              id: txId1,
              userId: parent1Uid,
              type: TransactionType.Commission,
              amount: commission1,
              status: TransactionStatus.Success,
              timestamp: new Date().toISOString(),
              traderName: `Level 1 Ref Profit: ${childObj.username || 'Investor'}`
            };

            await setDoc(doc(db, 'users', parent1Uid, 'transactions', txId1), commTx1);
            await setDoc(doc(db, 'users', parent1Uid, 'refers', txId1), {
              ...commTx1,
              subMemberName: childObj.username || 'Investor',
              level: 1,
              profit: commission1
            });
          }

          // Check Level 2 Indirect Referral (3%)
          if (parent1Obj.invitedBy) {
            const parent2Query = query(collection(db, 'users'), where('referralCode', '==', parent1Obj.invitedBy));
            const parent2Snap = await getDocs(parent2Query);
            if (!parent2Snap.empty) {
              const parent2Doc = parent2Snap.docs[0];
              const parent2Uid = parent2Doc.id;
              const commission2 = profitAmount * 0.03; // 3% Level 2 Indirect commission on profit

              if (commission2 > 0) {
                await updateDoc(doc(db, 'users', parent2Uid), {
                  mainBalance: increment(commission2),
                  totalCommission: increment(commission2)
                });

                const txId2 = 'NGK-COMM2-' + Math.random().toString(36).substring(2, 9).toUpperCase();
                const commTx2 = {
                  id: txId2,
                  userId: parent2Uid,
                  type: TransactionType.Commission,
                  amount: commission2,
                  status: TransactionStatus.Success,
                  timestamp: new Date().toISOString(),
                  traderName: `Level 2 Ref Profit: ${childObj.username || 'Investor'}`
                };

                await setDoc(doc(db, 'users', parent2Uid, 'transactions', txId2), commTx2);
                await setDoc(doc(db, 'users', parent2Uid, 'refers', txId2), {
                  ...commTx2,
                  subMemberName: childObj.username || 'Investor',
                  level: 2,
                  profit: commission2
                });
              }
            }
          }
        }
      }
    } catch (err) {
      console.error('Error distributing profit commissions:', err);
    }
  };

  // Staking
  const handleStartStaking = async (amount: number, durationDays: number, dailyROI: number) => {
    if (!currentUser) return;

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        mainBalance: increment(-amount),
        totalStaked: increment(amount)
      });

      const stakeId = 'STAKE-' + Math.random().toString(36).substring(2, 9).toUpperCase();
      const newStake: Stake = {
        id: stakeId,
        userId: currentUser.uid,
        amount,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + durationDays * 60 * 1000).toISOString(), // 1 minute = 1 day lock
        dailyROI,
        lastClaimed: new Date().toISOString(),
        status: 'Active',
        totalClaimed: 0
      };

      await setDoc(doc(db, 'users', currentUser.uid, 'stakes', stakeId), newStake);

      const stakeTxId = 'NGK-STAKE-' + Math.random().toString(36).substring(2, 9).toUpperCase();
      const stakeTx: Transaction = {
        id: stakeTxId,
        userId: currentUser.uid,
        type: TransactionType.Staking,
        amount,
        status: TransactionStatus.Success,
        timestamp: new Date().toISOString(),
        traderName: `${durationDays}-Day Pool`
      };

      await setDoc(doc(db, 'users', currentUser.uid, 'transactions', stakeTxId), stakeTx);

      showToast(`$${amount.toFixed(2)} USDT staked successfully in the ${durationDays}-day pool with ${(dailyROI * 100).toFixed(1)}% daily return!`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Staking failed.', 'error');
    }
  };

  // KYC Verification Submission
  const handleUpdateKYC = async (fullName: string, idNumber: string, nationality: string, documentImage: string, phoneNumber: string) => {
    if (!currentUser) return;
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        kycStatus: 'pending',
        kycData: {
          fullName,
          idNumber,
          nationality,
          documentImage,
          phoneNumber,
          submittedAt: new Date().toISOString()
        }
      });
      showToast('Identity verification submitted. Documents are under review.', 'info');
    } catch (err) {
      console.error(err);
      showToast('KYC submission failed.', 'error');
    }
  };

  // Avatar profile updates
  const handleUpdateAvatar = async (avatarUrl: string) => {
    if (!currentUser) return;
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        avatarUrl
      });
      showToast('Profile avatar updated successfully!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Avatar update failed.', 'error');
    }
  };

  // 2FA Google Authenticator configuration
  const handleUpdate2FA = async (secret: string) => {
    if (!currentUser) return;
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        twoFactorEnabled: true,
        twoFactorSecret: secret
      });
      showToast('Google 2FA security code has been enabled.', 'success');
    } catch (err) {
      console.error(err);
      showToast('2FA enablement failed.', 'error');
    }
  };

  // Secure Password settings update
  const handleUpdatePassword = async (pass: string) => {
    if (!currentUser) return;
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        password: pass
      });
      showToast('Password has been updated successfully.', 'success');
    } catch (err) {
      console.error(err);
      showToast('Password update failed.', 'error');
    }
  };

  // Deposit USDT
  const handleConfirmDeposit = async () => {
    if (!currentUser) return;
    const amt = parseFloat(depositAmount);
    if (isNaN(amt) || amt < 25) {
      showToast('Minimum deposit is 25 USDT.', 'error');
      return;
    }

    setDepositLoading(true);

    try {
      const bonus = amt * 0.10; // 10% Welcome Bonus!
      const txId = 'NGK-DEP-' + Math.random().toString(36).substring(2, 9).toUpperCase();

      const depTx: Transaction = {
        id: txId,
        userId: currentUser.uid,
        type: TransactionType.Deposit,
        amount: amt,
        status: TransactionStatus.Pending,
        timestamp: new Date().toISOString(),
        network: depositNetwork,
        address: depositAddresses[depositNetwork],
        bonus
      };

      // Write deposit doc to subcollection `/users/{uid}/deposit`
      await setDoc(doc(db, 'users', currentUser.uid, 'deposit', txId), depTx);
      // Write transactions doc to subcollection `/users/{uid}/transactions`
      await setDoc(doc(db, 'users', currentUser.uid, 'transactions', txId), depTx);

      // Write to root admin_pending for real Admin Panel approval/rejection
      await setDoc(doc(db, 'admin_pending', txId), {
        id: txId,
        userId: currentUser.uid,
        username: currentUser.username,
        userEmail: currentUser.email,
        type: 'Deposit',
        amount: amt,
        bonus,
        status: 'Pending',
        timestamp: depTx.timestamp,
        network: depositNetwork,
        address: depositAddresses[depositNetwork]
      });

      setDepositOpen(false);
      setDepositLoading(false);
      showToast('Deposit Submitted! After blockchain confirmation, your deposit amount will be credited to your account.', 'success');

    } catch (err) {
      console.error(err);
      showToast('Deposit request failed to submit.', 'error');
      setDepositLoading(false);
    }

    setDepositAmount('');
  };

  // Withdraw USDT
  const handleConfirmWithdraw = async () => {
    if (!currentUser) return;
    const amt = parseFloat(withdrawAmount);
    if (isNaN(amt) || amt < 10) {
      showToast('Minimum withdrawal is 10 USDT.', 'error');
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

    setWithdrawLoading(true);

    try {
      let newProfitBalance = currentUser.profitBalance;
      let newMainBalance = currentUser.mainBalance;

      if (amt <= currentUser.profitBalance) {
        newProfitBalance -= amt;
      } else {
        const remainder = amt - currentUser.profitBalance;
        newProfitBalance = 0;
        newMainBalance = Math.max(0, currentUser.mainBalance - remainder);
      }

      const txId = 'NGK-WITH-' + Math.random().toString(36).substring(2, 9).toUpperCase();

      const wTx: Transaction = {
        id: txId,
        userId: currentUser.uid,
        type: TransactionType.Withdraw,
        amount: amt,
        status: TransactionStatus.Pending,
        timestamp: new Date().toISOString(),
        address: withdrawAddress
      };

      await setDoc(doc(db, 'users', currentUser.uid, 'withdraw', txId), wTx);
      await setDoc(doc(db, 'users', currentUser.uid, 'transactions', txId), wTx);

      await updateDoc(doc(db, 'users', currentUser.uid), {
        profitBalance: newProfitBalance,
        mainBalance: newMainBalance
      });

      // Write to root admin_pending for real Admin Panel approval/rejection
      await setDoc(doc(db, 'admin_pending', txId), {
        id: txId,
        userId: currentUser.uid,
        username: currentUser.username,
        userEmail: currentUser.email,
        type: 'Withdraw',
        amount: amt,
        status: 'Pending',
        timestamp: wTx.timestamp,
        address: withdrawAddress
      });

      setWithdrawOpen(false);
      setWithdrawLoading(false);
      showToast('Withdrawal Submitted! After blockchain network processing, your withdrawal will be completed.', 'success');

    } catch (err) {
      console.error(err);
      showToast('Withdrawal failed to submit.', 'error');
      setWithdrawLoading(false);
    }

    setWithdrawAmount('');
    setWithdrawAddress('');
    setWithdrawPin('');
  };

  // Send Chat Message
  const handleSendChatMessage = async () => {
    if (!currentUser || !newChatMessage.trim()) return;

    try {
      const newMsg = {
        userId: currentUser.uid,
        username: currentUser.username,
        userEmail: currentUser.email,
        message: newChatMessage.trim(),
        timestamp: new Date().toISOString()
      };

      await addDoc(collection(db, 'chats'), newMsg);
      setNewChatMessage('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-zinc-950 text-zinc-100 min-h-screen relative font-sans overflow-x-hidden pb-24">
      
      {/* 0. NGK Animated Splash Screen Overlay */}
      <AnimatePresence>
        {showSplash && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="fixed inset-0 z-[100] bg-zinc-950 flex flex-col items-center justify-center p-6 text-center select-none"
          >
            <div className="space-y-6 max-w-sm mx-auto flex flex-col items-center justify-center">
              {/* Rotating glowing metallic token/logo */}
              <motion.div
                animate={{ rotateY: 360 }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
                className="relative flex items-center justify-center p-2 rounded-full"
              >
                <ThreeDLogo size="lg" showText={false} />
              </motion.div>

              <div className="space-y-1.5">
                <motion.h1 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl font-black text-white tracking-widest uppercase font-mono"
                >
                  NGK EXCHANGE
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono font-bold leading-relaxed max-w-[280px]"
                >
                  Automated Quantitative Node &amp; High-Yield Staking Pool
                </motion.p>
              </div>

              {/* Status bar loading simulation */}
              <div className="w-48 h-1 bg-zinc-900 rounded-full overflow-hidden border border-zinc-850/40 mt-4">
                <motion.div 
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2.8, ease: "easeInOut" }}
                  className="h-full bg-gradient-to-r from-cyan-500 to-[#00bfa5] rounded-full"
                />
              </div>

              <span className="text-[8px] text-zinc-650 font-bold uppercase tracking-widest font-mono mt-1 block">
                Verifying Secure SSL Nodes...
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
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
                  onClick={() => showToast("NGK Global English support node selected.", "info")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900/50 border border-zinc-850/60 text-[10px] font-bold text-zinc-300 hover:text-white transition"
                >
                  <Globe size={12} className="text-cyan-400" />
                  <span>EN</span>
                </button>
                <button 
                  onClick={() => showToast("Connecting to live NGK Support Node...", "info")}
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
                    {isLoginMode ? "Welcome to NGK" : "Create NGK Account"}
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
                          placeholder={authMethod === 'email' ? 'trader@gmail.com' : 'Please enter mobile number'}
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

                      {/* Password Strength Indicator Widget */}
                      {authPassword && (
                        <div className="space-y-1 px-1">
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="text-zinc-500 uppercase font-bold font-mono">Security Check:</span>
                            <span className={`font-bold font-mono ${getPasswordStrength(authPassword).color}`}>
                              {getPasswordStrength(authPassword).text}
                            </span>
                          </div>
                          <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
                            <div className={`h-full transition-all duration-300 ${getPasswordStrength(authPassword).barColor} ${getPasswordStrength(authPassword).width}`} />
                          </div>
                        </div>
                      )}

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
                        disabled={authLoading}
                        className={`w-full font-black py-3 rounded-xl text-xs uppercase tracking-wider text-center transition duration-200 shadow-lg flex items-center justify-center gap-2 ${
                          authLoading 
                            ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-850' 
                            : 'bg-cyan-500 hover:bg-cyan-400 text-zinc-950 shadow-cyan-500/10 active:scale-[0.98]'
                        }`}
                      >
                        {authLoading ? (
                          <>
                            <span className="w-3.5 h-3.5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                            Signing In...
                          </>
                        ) : (
                          'Login'
                        )}
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

                      {/* Password Strength Indicator Widget */}
                      {authPassword && (
                        <div className="space-y-1 px-1">
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="text-zinc-500 uppercase font-bold font-mono">Password Quality:</span>
                            <span className={`font-bold font-mono ${getPasswordStrength(authPassword).color}`}>
                              {getPasswordStrength(authPassword).text}
                            </span>
                          </div>
                          <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
                            <div className={`h-full transition-all duration-300 ${getPasswordStrength(authPassword).barColor} ${getPasswordStrength(authPassword).width}`} />
                          </div>
                        </div>
                      )}

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
                        disabled={authLoading}
                        className={`w-full font-black py-3 rounded-xl text-xs uppercase tracking-wider text-center transition duration-200 shadow-lg flex items-center justify-center gap-2 ${
                          authLoading 
                            ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-850' 
                            : 'bg-cyan-500 hover:bg-cyan-400 text-zinc-950 shadow-cyan-500/10 active:scale-[0.98]'
                        }`}
                      >
                        {authLoading ? (
                          <>
                            <span className="w-3.5 h-3.5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                            Registering...
                          </>
                        ) : (
                          'Register Now'
                        )}
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
        ) : (currentUser.twoFactorEnabled && !sessionTwoFaVerified) ? (
          // ================================== Google 2FA Verification Page ==================================
          <div className="flex-1 flex flex-col justify-center px-6 py-12 relative font-mono text-center space-y-6">
            <div className="text-center space-y-3">
              <div className="mx-auto w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shadow-lg">
                <Shield size={28} className="animate-pulse" />
              </div>
              <div className="space-y-1.5">
                <h1 className="text-xl font-black text-white tracking-widest uppercase">
                  2FA SECURITY CORE
                </h1>
                <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">
                  Google Authenticator Verification Required
                </p>
              </div>
            </div>

            <div className="coding-card rounded-2xl p-6 shadow-2xl relative overflow-hidden text-left space-y-5 max-w-sm mx-auto w-full">
              <div className="space-y-1">
                <h2 className="text-xs font-bold text-white uppercase tracking-wider">Two-Factor Code</h2>
                <p className="text-[9px] text-zinc-500 leading-normal">
                  Open your Google Authenticator app on your mobile device to retrieve your 6-digit verification code.
                </p>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <Lock size={15} />
                  </div>
                  <input 
                    id="login-2fa-input"
                    type="text" 
                    maxLength={6}
                    placeholder="Enter 6-digit code"
                    value={loginTwoFaCode}
                    onChange={(e) => setLoginTwoFaCode(e.target.value.replace(/\D/g, ''))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleVerifyLogin2Fa();
                    }}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-xl pl-10 pr-4 py-3 text-sm text-center tracking-widest text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 font-mono transition duration-200 font-bold"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleLogout}
                    className="flex-1 bg-zinc-950 hover:bg-zinc-900 text-zinc-400 hover:text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider text-center transition border border-zinc-850 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    id="confirm-login-2fa-btn"
                    onClick={handleVerifyLogin2Fa}
                    disabled={isVerifyingLogin2Fa}
                    className={`flex-1 font-black py-3 rounded-xl text-xs uppercase tracking-wider text-center transition duration-200 shadow-lg flex items-center justify-center gap-1.5 cursor-pointer ${
                      isVerifyingLogin2Fa 
                        ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-850' 
                        : 'bg-cyan-500 hover:bg-cyan-400 text-zinc-950 shadow-cyan-500/10'
                    }`}
                  >
                    {isVerifyingLogin2Fa ? 'Verifying...' : 'Confirm'}
                  </button>
                </div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-[9px] text-zinc-650 font-bold uppercase tracking-wider">
                NGK Cryptographic Node Security System
              </p>
            </div>
          </div>
        ) : (
          // ================================== MAIN CORE WORKSPACE ==================================
          <>
            {currentScreen !== 'admin' && currentScreen !== 'support' && (
              <Header 
                user={currentUser} 
                onNavigate={(screen) => setCurrentScreen(screen)} 
                unreadChatCount={unreadChatCount} 
              />
            )}

            <main className={`flex-1 pt-3 ${currentScreen === 'user-support' || currentScreen === 'support' ? 'overflow-hidden flex flex-col h-full min-h-0' : 'overflow-y-auto'}`}>
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
                      activeTrades={transactions.filter(t => t.type === TransactionType.CopyTrade && (t.status === TransactionStatus.Pending || t.status === TransactionStatus.Hold))}
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
                      activeTrades={transactions.filter(t => t.type === TransactionType.CopyTrade && (t.status === TransactionStatus.Pending || t.status === TransactionStatus.Hold))}
                      onStartCopyTrade={handleStartCopyTrade}
                      onReleaseTrade={handleReleaseTrade}
                      onInstantSettleTrade={handleInstantSettleTrade}
                      showToast={showToast}
                      adminSignal={adminSignal}
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
                      onShowSupport={() => setCurrentScreen('user-support')}
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
                        showToast('Transaction list updated.', 'success');
                      }}
                    />
                  </div>
                )}

                {currentScreen === 'support' && (
                  <div key="support" className="flex-1 flex flex-col h-full min-h-0">
                    <AgentSupportPanel 
                      onNavigate={(screen) => setCurrentScreen(screen)} 
                      showToast={showToast}
                    />
                  </div>
                )}

                {currentScreen === 'user-support' && (
                  <div key="user-support" className="flex-1 flex flex-col h-full min-h-0">
                    <Support 
                      user={currentUser!}
                      onNavigate={(screen) => setCurrentScreen(screen)} 
                    />
                  </div>
                )}

                {currentScreen === 'admin' && (
                  <div key="admin">
                    {currentUser?.email === 'admin@gmail.com' ? (
                      <AdminPanel 
                        onNavigate={(screen) => setCurrentScreen(screen)} 
                        currentUser={currentUser!}
                        showToast={showToast}
                      />
                    ) : (
                      <div className="p-6 max-w-md mx-auto text-center space-y-6">
                        <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mx-auto animate-pulse">
                          <Shield size={32} />
                        </div>
                        
                        <div className="space-y-1.5">
                          <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">NGK SECURE NODE</h2>
                          <p className="text-[10px] text-zinc-500 font-mono uppercase">Decryption password required for administrative deck</p>
                        </div>

                        <div className="bg-zinc-950 border border-zinc-850 rounded-2xl p-5 space-y-4 text-left">
                          <div className="space-y-1">
                            <label className="text-[9px] text-zinc-500 uppercase font-mono font-bold tracking-wider">Officer Email</label>
                            <input 
                              type="email" 
                              placeholder="admin@gmail.com"
                              value={adminGateEmail}
                              onChange={(e) => setAdminGateEmail(e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white placeholder-zinc-700 font-mono focus:outline-none focus:border-cyan-500"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] text-zinc-500 uppercase font-mono font-bold tracking-wider">Secure Password Key</label>
                            <input 
                              type="password" 
                              placeholder="••••••••"
                              value={adminGatePassword}
                              onChange={(e) => setAdminGatePassword(e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white placeholder-zinc-700 font-mono focus:outline-none focus:border-cyan-500"
                            />
                          </div>

                          <button 
                            onClick={handleAdminGateSubmit}
                            className="w-full bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-black py-3 rounded-xl text-xs uppercase tracking-wider text-center transition font-mono shadow-md shadow-cyan-500/10 active:scale-[0.98]"
                          >
                            Decrypt Admin Console
                          </button>
                        </div>
                      </div>
                    )}
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
            {currentScreen !== 'admin' && currentScreen !== 'support' && (
              <Navbar 
                currentScreen={currentScreen} 
                onNavigate={(screen) => setCurrentScreen(screen)} 
              />
            )}
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
                            className={`border rounded-xl p-3 text-center cursor-pointer flex flex-col items-center justify-center transition duration-200 ${
                              isSel 
                                ? 'border-cyan-500 bg-cyan-950/30 text-cyan-400 font-bold' 
                                : 'border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-400'
                            }`}
                          >
                            {net === 'BEP20' && (
                              <svg className="w-5 h-5 mb-1.5 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2L16.24 6.24L12 10.48L7.76 6.24L12 2Z" fill="#F3BA2F"/>
                                <path d="M12 13.52L16.24 17.76L12 22L7.76 17.76L12 13.52Z" fill="#F3BA2F"/>
                                <path d="M22 12L17.76 16.24L13.52 12L17.76 7.76L22 12Z" fill="#F3BA2F"/>
                                <path d="M10.48 12L6.24 16.24L2 12L6.24 7.76L10.48 12Z" fill="#F3BA2F"/>
                                <path d="M12 8.59L15.41 12L12 15.41L8.59 12L12 8.59Z" fill="#F3BA2F"/>
                              </svg>
                            )}
                            {net === 'TRC20' && (
                              <svg className="w-5 h-5 mb-1.5 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22 6L11 2L2 9L10 22L22 6ZM10.5 5.5L17 8L6.5 11.5L10.5 5.5ZM9 13.5L5.5 11L10 18.5L9 13.5ZM12.5 17L18.5 8.5L11.5 13L12.5 17Z" fill="#EF0027"/>
                              </svg>
                            )}
                            {net === 'ERC20' && (
                              <svg className="w-5 h-5 mb-1.5 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2L4.5 12L12 16.5L19.5 12L12 2Z" fill="#627EEA"/>
                                <path d="M12 2L12 16.5L19.5 12L12 2Z" fill="#455A9F"/>
                                <path d="M12 18L4.5 13.5L12 22L12 18Z" fill="#627EEA"/>
                                <path d="M12 18L12 22L19.5 13.5L12 18Z" fill="#455A9F"/>
                              </svg>
                            )}
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
                        disabled={parseFloat(depositAmount) < 25 || depositLoading}
                        className={`flex-1 font-bold py-3 rounded text-xs uppercase tracking-wider transition font-mono flex items-center justify-center gap-2 ${
                          parseFloat(depositAmount) < 25 || depositLoading
                            ? 'bg-zinc-900 text-zinc-500 border border-zinc-800 cursor-not-allowed'
                            : 'bg-cyan-500 hover:bg-cyan-400 text-zinc-950'
                        }`}
                      >
                        {depositLoading ? (
                          <>
                            <span className="w-3.5 h-3.5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                            Processing...
                          </>
                        ) : (
                          'Confirm Deposit'
                        )}
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
                      <span>Min: 10 USDT</span>
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
                          min="10"
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
                      disabled={parseFloat(withdrawAmount) < 10 || !withdrawAddress || !withdrawPin || withdrawLoading}
                      className={`flex-1 font-bold py-3 rounded text-xs uppercase tracking-wider transition font-mono flex items-center justify-center gap-2 ${
                        parseFloat(withdrawAmount) < 10 || !withdrawAddress || !withdrawPin || withdrawLoading
                          ? 'bg-zinc-900 text-zinc-500 border border-zinc-800 cursor-not-allowed'
                          : 'bg-cyan-500 hover:bg-cyan-400 text-zinc-950'
                      }`}
                    >
                      {withdrawLoading ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                          Processing...
                        </>
                      ) : (
                        'Withdraw'
                      )}
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
