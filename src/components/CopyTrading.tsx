import { useState, useEffect } from 'react';
import { 
  Copy, 
  TrendingUp, 
  Users, 
  ArrowLeft, 
  Sparkles, 
  ShieldCheck, 
  Hourglass, 
  DollarSign, 
  AlertTriangle, 
  Clock, 
  Award, 
  Lock, 
  Compass, 
  Globe, 
  CheckCircle2, 
  Terminal 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Transaction, TransactionStatus } from '../types';

export interface CountrySignalSchedule {
  name: string;
  flag: string;
  timezone: string;
  offset: number; // Offset in hours relative to UTC
  firstSignal: string;
  secondSignal: string;
  additionalSignal: string;
}

export const COUNTRIES_SCHEDULE: CountrySignalSchedule[] = [
  { name: 'Pakistan', flag: '🇵🇰', timezone: 'UTC+5', offset: 5, firstSignal: '5:30pm', secondSignal: '8:00pm', additionalSignal: '8:40pm' },
  { name: 'Egypt', flag: '🇪🇬', timezone: 'UTC+2', offset: 2, firstSignal: '2:30pm', secondSignal: '5:00pm', additionalSignal: '5:40pm' },
  { name: 'Dubai', flag: '🇦🇪', timezone: 'UTC+4', offset: 4, firstSignal: '4:30pm', secondSignal: '7:00pm', additionalSignal: '7:40pm' },
  { name: 'Saudi Arabia', flag: '🇸🇦', timezone: 'UTC+3', offset: 3, firstSignal: '3:30pm', secondSignal: '6:00pm', additionalSignal: '6:40pm' },
  { name: 'Oman', flag: '🇴🇲', timezone: 'UTC+4', offset: 4, firstSignal: '4:30pm', secondSignal: '7:00pm', additionalSignal: '7:40pm' },
  { name: 'Muscat', flag: '🇴🇲', timezone: 'UTC+4', offset: 4, firstSignal: '4:30pm', secondSignal: '7:00pm', additionalSignal: '7:40pm' },
  { name: 'Arab Mamalik', flag: '🇦🇪', timezone: 'UTC+4', offset: 4, firstSignal: '4:30pm', secondSignal: '7:00pm', additionalSignal: '7:40pm' },
  { name: 'Italy', flag: '🇮🇹', timezone: 'UTC+2 (DST)', offset: 2, firstSignal: '2:30pm', secondSignal: '5:00pm', additionalSignal: '5:40pm' },
  { name: 'Germany', flag: '🇩🇪', timezone: 'UTC+2 (DST)', offset: 2, firstSignal: '2:30pm', secondSignal: '5:00pm', additionalSignal: '5:40pm' },
  { name: 'India', flag: '🇮🇳', timezone: 'UTC+5.5', offset: 5.5, firstSignal: '6:00pm', secondSignal: '8:30pm', additionalSignal: '9:10pm' },
  { name: 'Bangladesh', flag: '🇧🇩', timezone: 'UTC+6', offset: 6, firstSignal: '6:30pm', secondSignal: '9:00pm', additionalSignal: '9:40pm' },
  { name: 'Uzbekistan', flag: '🇺🇿', timezone: 'UTC+5', offset: 5, firstSignal: '5:30pm', secondSignal: '8:00pm', additionalSignal: '8:40pm' },
  { name: 'United Kingdom', flag: '🇬🇧', timezone: 'UTC+1 (BST)', offset: 1, firstSignal: '1:30pm', secondSignal: '4:00pm', additionalSignal: '4:40pm' },
  { name: 'Nicaragua', flag: '🇳🇮', timezone: 'UTC-6', offset: -6, firstSignal: '6:30am', secondSignal: '9:00am', additionalSignal: '9:40am' },
  { name: 'Indonesia', flag: '🇮🇩', timezone: 'UTC+7', offset: 7, firstSignal: '7:30pm', secondSignal: '10:00pm', additionalSignal: '10:40pm' },
  { name: 'Peru', flag: '🇵🇪', timezone: 'UTC-5', offset: -5, firstSignal: '7:30am', secondSignal: '10:00am', additionalSignal: '10:40am' },
  { name: 'Colombia', flag: '🇨🇴', timezone: 'UTC-5', offset: -5, firstSignal: '7:30am', secondSignal: '10:00am', additionalSignal: '10:40am' },
  { name: 'Romania', flag: '🇷🇴', timezone: 'UTC+3 (DST)', offset: 3, firstSignal: '3:30pm', secondSignal: '6:00pm', additionalSignal: '6:40pm' },
  { name: 'Moldova', flag: '🇲🇩', timezone: 'UTC+3', offset: 3, firstSignal: '3:30pm', secondSignal: '6:00pm', additionalSignal: '6:40pm' },
  { name: 'Philippines', flag: '🇵🇭', timezone: 'UTC+8', offset: 8, firstSignal: '8:30pm', secondSignal: '11:00pm', additionalSignal: '11:40pm' },
  { name: 'Kazakhstan', flag: '🇰🇿', timezone: 'UTC+5', offset: 5, firstSignal: '5:30pm', secondSignal: '8:00pm', additionalSignal: '8:40pm' },
  { name: 'Spain', flag: '🇪🇸', timezone: 'UTC+2 (DST)', offset: 2, firstSignal: '2:30pm', secondSignal: '5:00pm', additionalSignal: '5:40pm' },
  { name: 'Ukraine', flag: '🇺🇦', timezone: 'UTC+3 (DST)', offset: 3, firstSignal: '3:30pm', secondSignal: '6:00pm', additionalSignal: '6:40pm' },
  { name: 'Poland', flag: '🇵🇱', timezone: 'UTC+2 (DST)', offset: 2, firstSignal: '2:30pm', secondSignal: '5:00pm', additionalSignal: '5:40pm' },
  { name: 'Syria', flag: '🇸🇾', timezone: 'UTC+3 (DST)', offset: 3, firstSignal: '3:30pm', secondSignal: '6:00pm', additionalSignal: '6:40pm' },
  { name: 'Brazil', flag: '🇧🇷', timezone: 'UTC-3', offset: -3, firstSignal: '9:30am', secondSignal: '12:00pm', additionalSignal: '12:40pm' },
  { name: 'Mexico', flag: '🇲🇽', timezone: 'UTC-5 (CDT)', offset: -5, firstSignal: '7:30am', secondSignal: '10:00am', additionalSignal: '10:40am' },
  { name: 'Ghana', flag: '🇬🇭', timezone: 'UTC+0', offset: 0, firstSignal: '12:30pm', secondSignal: '3:00pm', additionalSignal: '3:40pm' },
  { name: 'Netherlands', flag: '🇳🇱', timezone: 'UTC+2 (CEST)', offset: 2, firstSignal: '2:30pm', secondSignal: '5:00pm', additionalSignal: '5:40pm' },
  { name: 'Austria', flag: '🇦🇹', timezone: 'CEST (UTC+2)', offset: 2, firstSignal: '2:30pm', secondSignal: '5:00pm', additionalSignal: '5:40pm' }
];

export interface CountryTrader {
  name: string;
  avatar: string;
  winRate: number;
  followers: number;
  roi30d: number;
  minAmount: number;
}

export const getTradersForCountry = (countryName: string): CountryTrader[] => {
  // Compute a seed from the countryName so it's deterministic but unique per country
  let seedNum = 0;
  for (let i = 0; i < countryName.length; i++) {
    seedNum += countryName.charCodeAt(i) * (i + 1);
  }

  // A wide pool of high-quality, professional face portraits from Unsplash
  const avatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1513956589380-bad6acb9b9d4?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face'
  ];

  // Pick three distinct avatars based on country name seed
  const avatar1 = avatars[seedNum % avatars.length];
  const avatar2 = avatars[(seedNum + 5) % avatars.length];
  const avatar3 = avatars[(seedNum + 11) % avatars.length];

  // Tailored regional localized names
  let names = ['Alpha Pulse', 'Infinity Trades', 'Quant Edge'];

  if (countryName === 'Pakistan') {
    names = ['Hamza Crypto 🇵🇰', 'Ayesha FX 🇵🇰', 'Zayn Scalping 🇵🇰'];
  } else if (countryName === 'Egypt') {
    names = ['Amr Ibrahim 🇪🇬', 'Nour Trade 🇪🇬', 'Tarek El-Amin 🇪🇬'];
  } else if (countryName === 'Dubai') {
    names = ['Zayed Capital 🇦🇪', 'Amira Trades 🇦🇪', 'Khalifa Whale 🇦🇪'];
  } else if (countryName === 'Saudi Arabia') {
    names = ['Riyadh Scalp 🇸🇦', 'Fahad Al-Saud 🇸🇦', 'Yasmin Forex 🇸🇦'];
  } else if (countryName === 'Oman' || countryName === 'Muscat') {
    names = ['Said Al-Said 🇴🇲', 'Omani Bull 🇴🇲', 'Muscat Quantum 🇴🇲'];
  } else if (countryName === 'Arab Mamalik') {
    names = ['Emaar Capital 🇦🇪', 'Al-Maktoum FX 🇦🇪', 'Bait-Al-Mal 🇸🇦'];
  } else if (countryName === 'India') {
    names = ['Rajesh Crypto 🇮🇳', 'Priya Quant 🇮🇳', 'Aditya Whale 🇮🇳'];
  } else if (countryName === 'Bangladesh') {
    names = ['Sabbir FX 🇧🇩', 'Tariq Al-Mamun 🇧🇩', 'Nusrat Coins 🇧🇩'];
  } else if (countryName === 'Italy') {
    names = ['Giovanni Milan 🇮🇹', 'Sofia Trade 🇮🇹', 'Matteo Crypto 🇮🇹'];
  } else if (countryName === 'Germany') {
    names = ['Hans Berlin 🇩🇪', 'Emma Scalper 🇩🇪', 'Maximilian Quant 🇩🇪'];
  } else if (countryName === 'Uzbekistan') {
    names = ['Sherzod Crypto 🇺🇿', 'Nodira Trades 🇺🇿', 'Alisher USDT 🇺🇿'];
  } else if (countryName === 'United Kingdom') {
    names = ['Sterling FX 🇬🇧', 'Victoria Coins 🇬🇧', 'Oliver Trades 🇬🇧'];
  } else if (countryName === 'Indonesia') {
    names = ['Budi Santoso 🇮🇩', 'Siti Rahma 🇮🇩', 'Pratama Trade 🇮🇩'];
  } else {
    const key = countryName.slice(0, 5);
    names = [`${key} Elite`, `${key} Alpha`, `${key} Quant`];
  }

  // Calculate high performance stats deterministically
  const roi1 = 135 + (seedNum % 55);
  const roi2 = 110 + ((seedNum + 15) % 45);
  const roi3 = 95 + ((seedNum + 30) % 50);

  const winRate1 = (96.5 + (seedNum % 2.9)).toFixed(1);
  const winRate2 = (95.1 + ((seedNum + 3) % 3.4)).toFixed(1);
  const winRate3 = (94.0 + ((seedNum + 7) % 4.2)).toFixed(1);

  const followers1 = 1200 + (seedNum % 2100);
  const followers2 = 900 + ((seedNum + 120) % 1500);
  const followers3 = 750 + ((seedNum + 240) % 1800);

  return [
    { name: names[0], avatar: avatar1, winRate: parseFloat(winRate1), followers: followers1, roi30d: roi1, minAmount: 30 },
    { name: names[1], avatar: avatar2, winRate: parseFloat(winRate2), followers: followers2, roi30d: roi2, minAmount: 30 },
    { name: names[2], avatar: avatar3, winRate: parseFloat(winRate3), followers: followers3, roi30d: roi3, minAmount: 30 }
  ];
};

const Confetti = () => {
  const colors = ['bg-cyan-400', 'bg-emerald-400', 'bg-amber-400', 'bg-rose-400', 'bg-indigo-400', 'bg-purple-400'];
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-50">
      {Array.from({ length: 45 }).map((_, i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 3;
        const duration = 2 + Math.random() * 2.5;
        const size = 5 + Math.random() * 7;
        const color = colors[Math.floor(Math.random() * colors.length)];
        return (
          <div
            key={i}
            className={`absolute rounded-xs ${color} opacity-90`}
            style={{
              left: `${left}%`,
              top: `-20px`,
              width: `${size}px`,
              height: `${size}px`,
              animation: `fall ${duration}s linear infinite`,
              animationDelay: `${delay}s`,
              transform: `rotate(${Math.random() * 360}deg)`
            }}
          />
        );
      })}
      <style>{`
        @keyframes fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

function ActiveTradeTimer({ endTime }: { endTime?: string }) {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    if (!endTime) return;
    const endMs = new Date(endTime).getTime();
    const durationMs = 30 * 60 * 1000; // 30 minutes
    const startMs = endMs - durationMs;

    const updateTimer = () => {
      const now = Date.now();
      const remaining = endMs - now;
      if (remaining <= 0) {
        setTimeLeft(0);
        setProgress(100);
      } else {
        setTimeLeft(remaining);
        const elapsed = now - startMs;
        const percent = Math.min(100, Math.max(0, (elapsed / durationMs) * 100));
        setProgress(percent);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  if (!endTime) return null;

  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);

  if (timeLeft <= 0) {
    return (
      <div className="mt-3 text-[10px] font-bold text-emerald-400 font-mono flex items-center gap-1.5 bg-emerald-950/20 border border-emerald-900/30 px-2.5 py-1.5 rounded-lg">
        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
        Order Payout Ready
      </div>
    );
  }

  return (
    <div className="space-y-2 mt-3 bg-zinc-950/40 border border-zinc-850/40 p-2.5 rounded-xl">
      <div className="flex justify-between items-center text-[10px] text-zinc-500 font-mono font-bold">
        <span className="flex items-center gap-1">
          <Clock size={11} className="text-amber-500 animate-spin" style={{ animationDuration: '6s' }} />
          Positions Live
        </span>
        <span className="text-amber-400 font-bold font-mono">{minutes}m {seconds}s left</span>
      </div>
      <div className="h-1 bg-zinc-950 rounded-full overflow-hidden border border-zinc-900">
        <div 
          className="h-full bg-gradient-to-r from-cyan-500 via-amber-500 to-emerald-500 rounded-full transition-all duration-1000"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

interface CopyTradingProps {
  user: User;
  onNavigate: (screen: string) => void;
  traders: any[]; // Kept for backwards compatibility
  activeTrades: Transaction[];
  onStartCopyTrade: (traderName: string, amount: number, traderAvatar?: string, tradePair?: string) => void;
  onReleaseTrade: (txId: string, totpCode: string) => boolean | Promise<boolean>;
  onInstantSettleTrade?: (txId: string) => void;
  showToast?: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

export default function CopyTrading({
  user,
  onNavigate,
  activeTrades,
  onStartCopyTrade,
  onReleaseTrade,
  onInstantSettleTrade,
  showToast
}: CopyTradingProps) {
  const showToastHelper = showToast || ((msg: string) => alert(msg));

  const [selectedCountryName, setSelectedCountryName] = useState<string>(() => {
    return localStorage.getItem('gtx_selected_country') || localStorage.getItem('futuregrotex_selected_country') || 'Uzbekistan';
  });
  const [scheduleSearchQuery, setScheduleSearchQuery] = useState<string>('');
  const [countdownStr, setCountdownStr] = useState<string>('');
  const [activeSignalIndex, setActiveSignalIndex] = useState<number | null>(null);
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('');

  // Custom step modal flow for launching trades
  const [modalTrader, setModalTrader] = useState<CountryTrader | null>(null);
  const [modalStep, setModalStep] = useState<number>(1); // 1: Amount form, 2: Terminal assignment animation
  const [investmentAmt, setInvestmentAmt] = useState<string>('100');
  const [assignedPair, setAssignedPair] = useState<string>('');
  const [assignedDirection, setAssignedDirection] = useState<'LONG' | 'SHORT'>('LONG');
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);

  // Congratulations modal state
  const [congratsTx, setCongratsTx] = useState<Transaction | null>(null);
  const [totpInputs, setTotpInputs] = useState<{[txId: string]: string}>({});

  const activeCountry = COUNTRIES_SCHEDULE.find(c => c.name === selectedCountryName) || COUNTRIES_SCHEDULE[0];
  const countryTraders = getTradersForCountry(selectedCountryName);

  // Filter countries list
  const filteredCountries = COUNTRIES_SCHEDULE.filter(c => 
    c.name.toLowerCase().includes(scheduleSearchQuery.toLowerCase())
  );

  // Helper to calculate and format target country local time
  const getCountryLocalTime = (offset: number): string => {
    const now = new Date();
    const utcMs = now.getTime() + (now.getTimezoneOffset() * 60000);
    const targetDate = new Date(utcMs + (3600000 * offset));
    
    let hours = targetDate.getHours();
    const minutes = targetDate.getMinutes();
    const seconds = targetDate.getSeconds();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; 
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    const secondsStr = seconds < 10 ? '0' + seconds : seconds;
    
    return `${hours}:${minutesStr}:${secondsStr} ${ampm}`;
  };

  // Live countdown to UK signal times and dynamic clock update
  useEffect(() => {
    const updateTimeAndCountdown = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Europe/London',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      };
      setCurrentTimeStr(now.toLocaleTimeString('en-GB', options) + ' BST');

      const utcHours = now.getUTCHours();
      const utcMinutes = now.getUTCMinutes();
      const utcSeconds = now.getUTCSeconds();
      const currentUtcSeconds = utcHours * 3600 + utcMinutes * 60 + utcSeconds;

      // UK Signal times translated to UTC seconds
      const s1 = 12 * 3600 + 30 * 60; // 12:30 UTC
      const s2 = 15 * 3600 + 0 * 60;  // 15:00 UTC
      const s3 = 15 * 3600 + 40 * 60; // 15:40 UTC

      const activeWindow = 60 * 60; // 1 hour active window

      if (currentUtcSeconds >= s1 && currentUtcSeconds < s1 + activeWindow) {
        setActiveSignalIndex(0);
        const remainingActive = s1 + activeWindow - currentUtcSeconds;
        const mins = Math.floor(remainingActive / 60);
        const secs = remainingActive % 60;
        setCountdownStr(`Signal #1 is ACTIVE! Ends in ${mins}m ${secs}s`);
      } else if (currentUtcSeconds >= s2 && currentUtcSeconds < s2 + activeWindow) {
        setActiveSignalIndex(1);
        const remainingActive = s2 + activeWindow - currentUtcSeconds;
        const mins = Math.floor(remainingActive / 60);
        const secs = remainingActive % 60;
        setCountdownStr(`Signal #2 is ACTIVE! Ends in ${mins}m ${secs}s`);
      } else if (currentUtcSeconds >= s3 && currentUtcSeconds < s3 + activeWindow) {
        setActiveSignalIndex(2);
        const remainingActive = s3 + activeWindow - currentUtcSeconds;
        const mins = Math.floor(remainingActive / 60);
        const secs = remainingActive % 60;
        setCountdownStr(`Additional Signal is ACTIVE! Ends in ${mins}m ${secs}s`);
      } else {
        setActiveSignalIndex(null);
        let nextSignalTimeSeconds = 0;
        let label = '';

        if (currentUtcSeconds < s1) {
          nextSignalTimeSeconds = s1;
          label = 'Signal #1';
        } else if (currentUtcSeconds < s2) {
          nextSignalTimeSeconds = s2;
          label = 'Signal #2';
        } else if (currentUtcSeconds < s3) {
          nextSignalTimeSeconds = s3;
          label = 'Additional Signal';
        } else {
          nextSignalTimeSeconds = s1 + 24 * 3600;
          label = 'Signal #1 (Tomorrow)';
        }

        const diffSeconds = nextSignalTimeSeconds - currentUtcSeconds;
        const hours = Math.floor(diffSeconds / 3600);
        const mins = Math.floor((diffSeconds % 3600) / 60);
        const secs = diffSeconds % 60;

        const hrsStr = hours > 0 ? `${hours}h ` : '';
        setCountdownStr(`${label} starts in ${hrsStr}${mins}m ${secs}s`);
      }
    };

    updateTimeAndCountdown();
    const timer = setInterval(updateTimeAndCountdown, 1000);
    return () => clearInterval(timer);
  }, []);

  // Monitor active trades for real-time natural completion to show Congrats modal automatically
  useEffect(() => {
    // Check if any trade endTime has passed
    const checker = setInterval(() => {
      const now = Date.now();
      const finishedTrade = activeTrades.find(t => {
        if (t.status === TransactionStatus.Pending && t.endTime) {
          return now >= new Date(t.endTime).getTime();
        }
        return false;
      });

      if (finishedTrade && !congratsTx) {
        // Automatically set finished trade to congrats modal
        setCongratsTx(finishedTrade);
      }
    }, 2000);

    return () => clearInterval(checker);
  }, [activeTrades, congratsTx]);

  const handleCountryChange = (countryName: string) => {
    setSelectedCountryName(countryName);
    localStorage.setItem('gtx_selected_country', countryName);
    localStorage.setItem('futuregrotex_selected_country', countryName);
  };

  const handleOpenTraderModal = (trader: CountryTrader) => {
    if (activeSignalIndex === null) {
      showToastHelper("Copy trade blocked! Trading is only permitted during active signal hours. Please wait for the next signal.", "error");
      return;
    }
    setModalTrader(trader);
    setInvestmentAmt('100');
    setModalStep(1);
    setTerminalLogs([]);
  };

  const handleProceedToDeploymentSim = () => {
    if (activeSignalIndex === null) {
      showToastHelper("Copy trade blocked! Trading is only permitted during active signal hours. Please wait for the next signal.", "error");
      setModalTrader(null);
      return;
    }
    const amt = parseFloat(investmentAmt);
    if (isNaN(amt) || amt < 30 || amt > user.mainBalance) return;
    
    setModalStep(2);

    // Random Cryptocurreny Pair Pick
    const pairs = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'XRP/USDT', 'DOGE/USDT', 'BNB/USDT', 'ADA/USDT'];
    const chosen = pairs[Math.floor(Math.random() * pairs.length)];
    const dir = Math.random() > 0.5 ? 'LONG' : 'SHORT';
    setAssignedPair(chosen);
    setAssignedDirection(dir);

    // Add staggered logging simulations for incredible professional feeling
    const logs = [
      `Establishing secure REST socket with ${modalTrader?.name}...`,
      `API Client Authenticated. Latency check: 12ms (Secure Tunnel)...`,
      `Scanning global orderbooks for copy trade matching...`,
      `Analyzing liquidity depth on Binance, OKX, and Bybit...`,
      `Matching leverage margin allocation ratio...`,
      `SUCCESS: Order matched on live feeds!`,
      `Position established on ${chosen} (${dir}) at market rates! 🚀`
    ];

    logs.forEach((log, index) => {
      setTimeout(() => {
        setTerminalLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${log}`]);
      }, (index + 1) * 350);
    });
  };

  const handleFinalDeploy = () => {
    if (!modalTrader) return;
    if (activeSignalIndex === null) {
      showToastHelper("Copy trade blocked! Trading is only permitted during active signal hours. Please wait for the next signal.", "error");
      setModalTrader(null);
      return;
    }
    const amt = parseFloat(investmentAmt);
    
    // Deploys the actual copy trade
    onStartCopyTrade(modalTrader.name, amt, modalTrader.avatar, assignedPair);
    
    // Close modal
    setModalTrader(null);
    setModalStep(1);
  };

  const handleSettleNow = (trade: Transaction) => {
    // Open congrats modal first
    setCongratsTx(trade);
  };

  const handleClaimProfit = () => {
    if (!congratsTx) return;
    
    if (onInstantSettleTrade) {
      onInstantSettleTrade(congratsTx.id);
    }
    setCongratsTx(null);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-4 px-4 pb-14"
    >
      {/* 1. Dynamic UK and Local Time Header Clock */}
      <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-850 rounded-2xl p-4.5 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-3">
          <Globe size={40} className="text-cyan-500/5 animate-spin" style={{ animationDuration: '30s' }} />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="space-y-0.5">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider font-mono">Server Clock</span>
              <p className="text-sm font-black text-white font-mono flex items-center gap-1.5">
                <Clock size={13} className="text-cyan-400" />
                {currentTimeStr}
              </p>
            </div>

            <div className="text-right space-y-0.5">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider font-mono">{activeCountry.name} Local</span>
              <p className="text-sm font-black text-amber-400 font-mono flex items-center justify-end gap-1.5">
                <span className="text-xs">{activeCountry.flag}</span>
                {getCountryLocalTime(activeCountry.offset)}
              </p>
            </div>
          </div>

          {/* Active signals countdown panel */}
          <div className="bg-zinc-950/70 border border-zinc-900 rounded-xl px-3 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-[10px] text-zinc-300 font-bold font-mono tracking-wide uppercase">
                {countdownStr}
              </span>
            </div>
            <span className="text-[9px] font-black text-cyan-400 font-mono bg-cyan-400/10 px-2 py-0.5 border border-cyan-400/20 rounded-md">
              LIVE SIGNAL
            </span>
          </div>
        </div>
      </div>

      {/* 2. Country Selector Dropdown Container */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4 space-y-3.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-mono flex items-center gap-1.5">
            <Compass size={13} className="text-cyan-400" />
            Target Area Protocol
          </span>
          <span className="text-[9px] text-cyan-400 font-bold font-mono uppercase">
            {COUNTRIES_SCHEDULE.length} regions available
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* Custom elegant Select Country component */}
          <div className="col-span-2 relative">
            <select
              value={selectedCountryName}
              onChange={(e) => handleCountryChange(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 text-white font-mono text-xs rounded-xl px-3 py-2.5 outline-none appearance-none cursor-pointer focus:border-cyan-500/50"
            >
              {COUNTRIES_SCHEDULE.map(country => (
                <option key={country.name} value={country.name}>
                  {country.flag} {country.name} ({country.timezone})
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-zinc-400 text-[10px]">
              ▼
            </div>
          </div>
        </div>

        {/* Dynamic Display of Local UK BST Match Schedule */}
        <div className="bg-zinc-900/30 border border-zinc-900 rounded-xl p-3 space-y-2.5 font-mono text-[10px]">
          <span className="text-zinc-500 uppercase font-bold tracking-wider block">Signal Times Matrix ({activeCountry.name})</span>
          
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-zinc-950 p-2 border border-zinc-900 rounded-lg text-center space-y-1">
              <span className="text-zinc-500 text-[8px] font-bold block">SIGNAL #1</span>
              <span className="text-white font-bold block">13:30 BST</span>
              <span className="text-amber-400 text-[8px] font-bold block">{activeCountry.firstSignal} local</span>
            </div>

            <div className="bg-zinc-950 p-2 border border-zinc-900 rounded-lg text-center space-y-1">
              <span className="text-zinc-500 text-[8px] font-bold block">SIGNAL #2</span>
              <span className="text-white font-bold block">16:00 BST</span>
              <span className="text-amber-400 text-[8px] font-bold block">{activeCountry.secondSignal} local</span>
            </div>

            <div className="bg-zinc-950 p-2 border border-zinc-900 rounded-lg text-center space-y-1">
              <span className="text-zinc-500 text-[8px] font-bold block">ADDITIONAL</span>
              <span className="text-white font-bold block">16:40 BST</span>
              <span className="text-amber-400 text-[8px] font-bold block">{activeCountry.additionalSignal} local</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Top Copy Traders List for Target Region */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 font-mono flex items-center gap-1.5">
            <Award size={12} className="text-cyan-400" />
            Top Copy Traders in {activeCountry.name}
          </h3>
          <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-mono font-bold">
            UK TIME MATCHED
          </span>
        </div>

        <div className="space-y-3">
          {countryTraders.map(t => (
            <div 
              key={t.name}
              onClick={() => handleOpenTraderModal(t)}
              className="bg-zinc-900/40 border border-zinc-850 hover:border-cyan-500/40 hover:bg-zinc-900/70 rounded-2xl p-4 transition-all duration-200 cursor-pointer shadow-md group relative overflow-hidden"
            >
              <div className="flex justify-between items-start gap-3">
                <div className="flex items-center gap-3">
                  {/* Trader Avatar */}
                  <div className="relative w-11 h-11 shrink-0 rounded-xl overflow-hidden border border-zinc-750 bg-zinc-950">
                    <img src={t.avatar} alt={t.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <div className="absolute bottom-0 right-0 bg-emerald-500 w-2.5 h-2.5 rounded-full border border-zinc-900 shadow animate-pulse" />
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-white group-hover:text-cyan-400 transition font-mono truncate">{t.name}</span>
                      <ShieldCheck size={12} className="text-cyan-400" />
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono">
                      <span className="flex items-center gap-0.5"><Users size={10} /> {t.followers.toLocaleString()} copiers</span>
                    </div>
                  </div>
                </div>

                <div className="text-right space-y-1">
                  <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md font-mono">
                    +{t.roi30d}% ROI
                  </span>
                  <p className="text-[8px] text-zinc-500 uppercase font-mono">30D Return</p>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-2 gap-2 mt-3.5 pt-3 border-t border-zinc-850/60 font-mono text-[9px] text-zinc-500">
                <div className="bg-zinc-950/40 p-1.5 rounded-lg border border-zinc-900 flex justify-between items-center px-2.5">
                  <span>Win Rate</span>
                  <span className="text-white font-bold">{t.winRate}%</span>
                </div>
                <div className="bg-zinc-950/40 p-1.5 rounded-lg border border-zinc-900 flex justify-between items-center px-2.5">
                  <span>Min Invest</span>
                  <span className="text-cyan-400 font-bold">30 USDT</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Active Copy & Signal Trades */}
      {activeTrades.length > 0 && (
        <div className="space-y-3.5 pt-2">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5 font-mono">
            <Hourglass size={12} className="text-amber-400 animate-pulse" />
            Active Copy Contracts ({activeTrades.length})
          </h3>

          <div className="space-y-3">
            {activeTrades.map(trade => {
              const isHold = trade.status === TransactionStatus.Hold;
              
              return (
                <div 
                  key={trade.id} 
                  className={`border rounded-2xl p-4 shadow-xl relative overflow-hidden transition duration-200 ${
                    isHold ? 'bg-amber-950/15 border-amber-500/30' : 'bg-zinc-900/60 border-zinc-850'
                  }`}
                >
                  <div className="flex justify-between items-center gap-3">
                    <div className="flex items-center gap-3">
                      {trade.traderAvatar ? (
                        <img 
                          src={trade.traderAvatar} 
                          alt={trade.traderName} 
                          className="w-9 h-9 rounded-xl object-cover border border-zinc-750 bg-zinc-950" 
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-xl bg-zinc-950 border border-zinc-850 flex items-center justify-center font-black text-cyan-400 font-mono text-xs uppercase">
                          {trade.traderName.slice(0, 2)}
                        </div>
                      )}

                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white font-mono">{trade.traderName}</span>
                          {isHold ? (
                            <span className="text-[8px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/20 font-bold font-mono uppercase tracking-wider animate-pulse flex items-center gap-1">
                              <Lock size={8} /> HOLD
                            </span>
                          ) : (
                            <span className="text-[8px] bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded-full border border-cyan-500/20 font-bold font-mono uppercase tracking-wider animate-pulse">
                              MIRRORING
                            </span>
                          )}
                        </div>
                        {trade.tradePair && (
                          <p className="text-[9px] text-cyan-400 font-mono font-bold uppercase mt-0.5">Asset: {trade.tradePair}</p>
                        )}
                        <p className="text-[9px] text-zinc-500 mt-0.5 font-mono">Amount: {trade.amount.toFixed(2)} USDT</p>
                      </div>
                    </div>

                    <div className="text-right space-y-2">
                      <span className="text-xs font-mono font-bold text-emerald-400 block">
                        +${(trade.amount * 0.0219).toFixed(2)} USDT
                      </span>
                      
                      {/* Settle Now bypass button for instant result experience */}
                      {!isHold && (
                        <button
                          onClick={() => handleSettleNow(trade)}
                          className="px-2.5 py-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-zinc-950 text-[9px] font-black uppercase rounded-md shadow-lg hover:brightness-110 active:scale-95 transition font-mono flex items-center gap-1"
                        >
                          ⚡ Settle Now
                        </button>
                      )}
                    </div>
                  </div>

                  {isHold ? (
                    <div className="mt-4 pt-3.5 border-t border-amber-500/15 space-y-2.5">
                      <p className="text-[9px] text-zinc-400 leading-normal font-mono">
                        ⚠️ <span className="text-amber-400 font-bold">2ND DAILY TRADE ESCROW HOLD:</span> Payout held in security review. Enter your 6-digit Google Authenticator code below to release.
                      </p>
                      
                      {!user.twoFactorEnabled ? (
                        <button
                          onClick={() => onNavigate('more')}
                          className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-[9px] font-black uppercase tracking-wider rounded-xl font-mono transition shadow-lg"
                        >
                          Enable 2FA to Release Funds
                        </button>
                      ) : (
                        <div className="flex gap-2 items-center">
                          <input 
                            type="text"
                            maxLength={6}
                            placeholder="000000"
                            value={totpInputs[trade.id] || ''}
                            onChange={(e) => setTotpInputs(prev => ({ ...prev, [trade.id]: e.target.value.replace(/\D/g, '') }))}
                            className="bg-zinc-950 border border-zinc-800 text-white rounded-xl px-2.5 py-2 text-center text-xs font-mono tracking-widest w-24 outline-none focus:border-amber-500 transition"
                          />
                          <button
                            onClick={() => {
                              const code = totpInputs[trade.id];
                              if (!code || code.length !== 6) {
                                alert("Please enter a 6-digit 2FA code.");
                                return;
                              }
                              const success = onReleaseTrade(trade.id, code);
                              if (success) {
                                setTotpInputs(prev => ({ ...prev, [trade.id]: '' }));
                              }
                            }}
                            className="flex-1 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-[9px] font-black uppercase tracking-wider rounded-xl font-mono transition py-2.5 text-center shadow-lg"
                          >
                            Verify & Release
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <ActiveTradeTimer endTime={trade.endTime} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Custom Deployed Modal - Step-by-Step interactive copy trading flow */}
      <AnimatePresence>
        {modalTrader && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5.5 w-full max-w-sm shadow-2xl relative"
            >
              <div className="flex justify-between items-center mb-4 border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <img src={modalTrader.avatar} alt={modalTrader.name} className="w-6 h-6 rounded-md object-cover" referrerPolicy="no-referrer" />
                  <div>
                    <h3 className="font-bold text-xs text-white font-mono">{modalTrader.name}</h3>
                    <p className="text-[8px] text-cyan-400 font-bold font-mono uppercase mt-0.5">MATCH: {activeCountry.name}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setModalTrader(null)}
                  className="w-6 h-6 bg-zinc-950 hover:bg-zinc-800 rounded-lg text-zinc-400 flex items-center justify-center border border-zinc-850 transition text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              {modalStep === 1 ? (
                /* STEP 1: Investment Amount selection */
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2 font-mono text-[9px] text-zinc-400 text-center">
                    <div className="bg-zinc-950 p-2 border border-zinc-850 rounded-xl">
                      <span>Win Rate</span>
                      <p className="text-xs font-bold text-emerald-400 mt-0.5">{modalTrader.winRate}%</p>
                    </div>
                    <div className="bg-zinc-950 p-2 border border-zinc-850 rounded-xl">
                      <span>ROI 30D</span>
                      <p className="text-xs font-bold text-cyan-400 mt-0.5">+{modalTrader.roi30d}%</p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[9px] text-zinc-500 font-bold uppercase font-mono">
                      <label>Deploy Investment Size</label>
                      <span>Min: 30 USDT</span>
                    </div>

                    <div className="relative bg-zinc-950 rounded-xl px-4 py-3 border border-zinc-850 focus-within:border-cyan-500 transition">
                      <div className="flex items-center gap-2.5">
                        <img src="https://assets.coingecko.com/coins/images/325/large/Tether.png" alt="USDT" className="w-5 h-5 rounded-full" />
                        <input 
                          type="number" 
                          min={30}
                          value={investmentAmt}
                          onChange={(e) => setInvestmentAmt(e.target.value)}
                          className="w-full bg-transparent text-white font-bold text-sm outline-none border-none placeholder-zinc-700 font-mono focus:ring-0 p-0"
                          placeholder="30.00"
                        />
                        <span className="text-[10px] text-zinc-500 font-bold font-mono">USDT</span>
                      </div>
                    </div>
                  </div>

                  {/* Percentage shortcuts */}
                  <div className="grid grid-cols-4 gap-1.5">
                    {[0.25, 0.50, 0.75, 1.0].map((percent) => {
                      const amount = Math.max(30, Math.floor(user.mainBalance * percent));
                      return (
                        <button
                          key={percent}
                          onClick={() => setInvestmentAmt(amount.toString())}
                          className="bg-zinc-950 hover:bg-zinc-800 border border-zinc-850 text-zinc-300 rounded-lg py-1 text-[9px] font-bold font-mono transition"
                        >
                          {percent * 100}%
                        </button>
                      );
                    })}
                  </div>

                  <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-850 flex justify-between items-center text-xs text-zinc-400">
                    <div>
                      <p className="font-bold text-white text-[10px] uppercase font-mono">Estimated Profit</p>
                      <p className="text-[8px] text-zinc-500 mt-0.5">Expected 30-min return (2.19%)</p>
                    </div>
                    <span className="text-xs font-mono font-black text-emerald-400">
                      +${(parseFloat(investmentAmt) * 0.0219 || 0).toFixed(2)} USDT
                    </span>
                  </div>

                  {/* Balance validator error block */}
                  {parseFloat(investmentAmt) > user.mainBalance ? (
                    <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-2.5 rounded-xl text-[9px] flex items-center gap-1.5 font-mono uppercase font-bold">
                      <AlertTriangle size={12} className="shrink-0" />
                      <span>Insufficient main balance (${user.mainBalance.toFixed(2)} USDT)</span>
                    </div>
                  ) : parseFloat(investmentAmt) < 30 ? (
                    <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 p-2.5 rounded-xl text-[9px] flex items-center gap-1.5 font-mono uppercase font-bold">
                      <AlertTriangle size={12} className="shrink-0" />
                      <span>Minimum deposit size is 30 USDT</span>
                    </div>
                  ) : null}

                  <button
                    disabled={isNaN(parseFloat(investmentAmt)) || parseFloat(investmentAmt) < 30 || parseFloat(investmentAmt) > user.mainBalance}
                    onClick={handleProceedToDeploymentSim}
                    className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-center transition duration-200 font-mono ${
                      isNaN(parseFloat(investmentAmt)) || parseFloat(investmentAmt) < 30 || parseFloat(investmentAmt) > user.mainBalance
                        ? 'bg-zinc-800 text-zinc-500 border border-zinc-850 cursor-not-allowed'
                        : 'bg-cyan-500 text-zinc-950 hover:bg-cyan-400 font-black'
                    }`}
                  >
                    Initiate Copy Trade 🚀
                  </button>
                </div>
              ) : (
                /* STEP 2: Live simulation terminals logs */
                <div className="space-y-4">
                  <div className="bg-black/90 rounded-xl p-3 border border-zinc-800 font-mono text-[9px] text-zinc-400 space-y-1.5 h-36 overflow-y-auto shadow-inner select-none">
                    <div className="flex items-center gap-1.5 text-cyan-400 font-bold border-b border-zinc-900 pb-1.5 mb-1.5">
                      <Terminal size={11} />
                      <span>TERMINAL CONNECTION PROXY</span>
                    </div>
                    {terminalLogs.map((log, i) => (
                      <div key={i} className="leading-normal animate-fade-in">{log}</div>
                    ))}
                    {terminalLogs.length < 7 && (
                      <div className="text-cyan-400 flex items-center gap-1 animate-pulse">
                        <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping" />
                        Allocating live API bridge...
                      </div>
                    )}
                  </div>

                  {terminalLogs.length >= 6 && (
                    <motion.div 
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-cyan-500/10 border border-cyan-500/25 rounded-xl p-3 text-center space-y-1 font-mono"
                    >
                      <span className="text-[8px] text-cyan-400 font-bold uppercase tracking-wider">Assigned Pair Feeds</span>
                      <p className="text-sm font-black text-white">{assignedPair} <span className={assignedDirection === 'LONG' ? 'text-emerald-400' : 'text-rose-400'}>({assignedDirection})</span></p>
                    </motion.div>
                  )}

                  <button
                    disabled={terminalLogs.length < 7}
                    onClick={handleFinalDeploy}
                    className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-center transition duration-200 font-mono ${
                      terminalLogs.length < 7
                        ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                        : 'bg-emerald-500 text-zinc-950 hover:bg-emerald-400 font-black shadow-[0_0_15px_rgba(16,185,129,0.35)]'
                    }`}
                  >
                    {terminalLogs.length < 7 ? 'Establishing Match...' : 'Deploy Mirror Trades Now! 🟢'}
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. Stunning Full-Screen Interactive Congratulations Success Overlay */}
      <AnimatePresence>
        {congratsTx && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/90 backdrop-blur-md">
            {/* Confetti Animation Layer */}
            <Confetti />

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-zinc-900 border-2 border-emerald-500/30 rounded-3xl p-6.5 w-full max-w-sm text-center shadow-[0_0_50px_rgba(16,185,129,0.15)] space-y-5.5 relative overflow-hidden"
            >
              {/* Star Orb Glowing Effect */}
              <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-40 h-40 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />

              <div className="space-y-2">
                <div className="w-16 h-16 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                  <CheckCircle2 size={36} className="text-zinc-950" />
                </div>
                <h2 className="text-base font-black text-white uppercase tracking-tight font-mono mt-3">CONGRATULATIONS! 🎉</h2>
                <p className="text-[10px] text-zinc-400 font-mono uppercase tracking-wide">Copy trading contract closed successfully</p>
              </div>

              {/* Trade Receipt Details Box */}
              <div className="bg-zinc-950/90 border border-zinc-850 rounded-2xl p-4 text-left space-y-3 font-mono text-[10px] shadow-inner">
                <div className="flex justify-between items-center pb-2.5 border-b border-zinc-900">
                  <span className="text-zinc-500">Master Trader</span>
                  <div className="flex items-center gap-1.5">
                    {congratsTx.traderAvatar && (
                      <img src={congratsTx.traderAvatar} alt={congratsTx.traderName} className="w-4 h-4 rounded-full object-cover" referrerPolicy="no-referrer" />
                    )}
                    <span className="text-white font-bold">{congratsTx.traderName}</span>
                  </div>
                </div>

                {congratsTx.tradePair && (
                  <div className="flex justify-between items-center pb-2.5 border-b border-zinc-900">
                    <span className="text-zinc-500">Asset Traded</span>
                    <span className="text-cyan-400 font-bold">{congratsTx.tradePair}</span>
                  </div>
                )}

                <div className="flex justify-between items-center pb-2.5 border-b border-zinc-900">
                  <span className="text-zinc-500">Investment Capital</span>
                  <span className="text-white font-bold">{congratsTx.amount.toFixed(2)} USDT</span>
                </div>

                <div className="flex justify-between items-center pb-2.5 border-b border-zinc-900">
                  <span className="text-zinc-500">Return Profit Rate</span>
                  <span className="text-emerald-400 font-bold font-black bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">+2.19% ROI</span>
                </div>

                <div className="flex justify-between items-center pt-1">
                  <span className="text-zinc-500">Net Profit Earned</span>
                  <span className="text-emerald-400 font-black text-sm">+${(congratsTx.amount * 0.0219).toFixed(2)} USDT</span>
                </div>
              </div>

              {/* Total return box */}
              <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 p-3.5 rounded-2xl text-center space-y-1">
                <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider font-mono">Total Returned to wallet</span>
                <p className="text-lg font-black text-white font-mono">${(congratsTx.amount * 1.0219).toFixed(2)} USDT</p>
              </div>

              <button
                onClick={handleClaimProfit}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:brightness-110 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-2xl transition duration-200 font-mono shadow-[0_4px_20px_rgba(16,185,129,0.3)]"
              >
                Collect Profits &amp; return 🚀
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
