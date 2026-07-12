import { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Send, 
  Bot, 
  User as UserIcon, 
  Sparkles
} from 'lucide-react';
import { motion } from 'motion/react';
import { SupportMessage } from '../types';

interface SupportProps {
  onNavigate: (screen: string) => void;
}

export default function Support({ onNavigate }: SupportProps) {
  const [messages, setMessages] = useState<SupportMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      message: 'Hello! 👋 Welcome to FutureGrotex Live Support. I am your help bot. How can I assist you with trading, deposits, or staking today?',
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Suggestions list with simple labels
  const suggestions = [
    { label: '💳 Deposit Help', query: 'How to deposit?' },
    { label: '💸 Withdraw Help', query: 'How to withdraw?' },
    { label: '📈 Copy Trading', query: 'Copy trade explained' },
    { label: '👥 Referral Partner', query: 'Referral commission' },
    { label: '💰 Min Limits', query: 'What is the minimum?' }
  ];

  // Auto scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getBotResponse = (query: string): string => {
    const l = query.toLowerCase();
    if (l.includes('deposit')) {
      return "To deposit: Click 'Deposit' on the home screen, choose a network (BEP20, TRC20, or ERC20), and copy the deposit address to send USDT. The minimum deposit is 25 USDT. You will get a +10% deposit bonus once confirmed!";
    }
    if (l.includes('withdraw')) {
      return "To withdraw: Click 'Withdraw' on the home screen, enter your USDT receiving wallet address, enter the amount (minimum 4 USDT), and use your 6-digit PIN. Withdrawals process within 5 to 15 minutes.";
    }
    if (l.includes('copy')) {
      return "Copy trading lets you copy top traders automatically. The minimum amount is 100 USDT. Trades complete in 30 seconds in demo mode, with a guaranteed profit of 2.19% added directly to your balance.";
    }
    if (l.includes('refer') || l.includes('invite') || l.includes('partner')) {
      return "Invite your friends using your referral link from the 'Refer' section. You earn 5% Level 1 and 3% Level 2 commission when they trade or stake.";
    }
    if (l.includes('minimum') || l.includes('min') || l.includes('limit')) {
      return "Current limits: Minimum Deposit is 25 USDT, Minimum Withdrawal is 4 USDT, Minimum Copy Trade amount is 100 USDT, and Minimum Staking is 25 USDT.";
    }
    if (l.includes('kyc') || l.includes('verify') || l.includes('identity')) {
      return "To verify your account: Go to Profile > ID Verification. Complete the name and ID number fields, and upload a clear photo of your ID card or Passport. Reviews take 12-24 hours.";
    }
    if (l.includes('staking') || l.includes('stake') || l.includes('pool')) {
      return "Staking locks your USDT for 15 days, paying 3.6% daily profit. After 15 days, your original staked amount is returned to your account balance.";
    }
    return "I'm sorry, I don't understand that question. Please contact our live support supervisor on Telegram: @Bnx_HubPro for immediate help.";
  };

  const handleSendMessage = (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed) return;

    const userMsg: SupportMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      message: trimmed,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');

    // Simulated typing delay
    setTimeout(() => {
      const botMsg: SupportMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        message: getBotResponse(trimmed),
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, botMsg]);
    }, 400);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-4 px-4 pb-12 flex flex-col h-[calc(100vh-140px)]"
    >
      {/* Header */}
      <div className="flex items-center gap-2 shrink-0">
        <button 
          onClick={() => onNavigate('dashboard')} 
          className="text-zinc-400 hover:text-white transition p-1 hover:bg-zinc-850 rounded-lg"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">LIVE SUPPORT</h2>
          <p className="text-[10px] text-emerald-400 font-bold uppercase font-mono tracking-wider">AI Representative Active</p>
        </div>
      </div>

      {/* Suggestion Chips */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none shrink-0">
        {suggestions.map((s, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(s.query)}
            className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 rounded text-[11px] font-bold transition whitespace-nowrap outline-none font-mono"
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Chat messages viewport */}
      <div className="flex-1 overflow-y-auto bg-zinc-950 border border-zinc-900 rounded-xl p-4 space-y-4 min-h-[150px]">
        {messages.map(msg => {
          const isBot = msg.sender === 'bot';
          return (
            <div 
              key={msg.id} 
              className={`flex ${isBot ? 'justify-start' : 'justify-end'}`}
            >
              <div className={`flex gap-2.5 max-w-[85%] ${isBot ? 'flex-row' : 'flex-row-reverse'}`}>
                {/* Profile bubble */}
                <div className={`w-8 h-8 rounded-lg border shrink-0 flex items-center justify-center ${
                  isBot 
                    ? 'bg-zinc-900 border-zinc-800 text-cyan-400' 
                    : 'bg-zinc-900 border-zinc-800 text-emerald-400'
                }`}>
                  {isBot ? <Bot size={14} /> : <UserIcon size={14} />}
                </div>

                {/* Bubble message */}
                <div className={`rounded-xl px-3.5 py-2.5 border ${
                  isBot 
                    ? 'bg-zinc-900 border-zinc-850 text-zinc-300 rounded-tl-none' 
                    : 'bg-cyan-950 border-cyan-800/40 text-zinc-100 rounded-tr-none'
                }`}>
                  <p className="text-[9px] font-bold uppercase text-zinc-500 mb-1 flex items-center gap-1 font-mono">
                    {isBot ? (
                      <>
                        <Sparkles size={8} className="text-cyan-400" /> Support Bot
                      </>
                    ) : 'Investor'}
                  </p>
                  <p className="text-xs leading-relaxed font-sans">
                    {msg.message}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      {/* Input container */}
      <div className="flex gap-2 bg-zinc-900 p-1.5 rounded-xl border border-zinc-800 shadow-sm shrink-0">
        <input 
          type="text" 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputText)}
          placeholder="Type your question here..."
          className="flex-1 bg-transparent text-white placeholder-zinc-650 outline-none border-none text-xs px-3 py-2 font-semibold"
        />
        
        <button
          onClick={() => handleSendMessage(inputText)}
          className="bg-cyan-500 hover:bg-cyan-400 w-8 h-8 rounded flex items-center justify-center text-zinc-950 active:scale-95 transition"
        >
          <Send size={14} />
        </button>
      </div>

      <p className="text-[10px] text-zinc-550 text-center uppercase tracking-wide font-bold font-mono shrink-0">
        Supervisor Telegram: <span className="text-cyan-400 select-all font-mono font-bold">@Bnx_HubPro</span>
      </p>
    </motion.div>
  );
}
