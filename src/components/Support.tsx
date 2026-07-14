import { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Send, 
  Bot, 
  User as UserIcon, 
  Sparkles,
  ShieldCheck,
  Zap,
  Activity,
  Headphones
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SupportMessage } from '../types';

interface SupportProps {
  onNavigate: (screen: string) => void;
}

interface SupportAgent {
  id: string;
  name: string;
  role: string;
  avatar: string;
  badge: string;
  intro: string;
  personality: string;
}

const SUPPORT_AGENTS: SupportAgent[] = [
  {
    id: 'sarah',
    name: 'Agent Sarah',
    role: 'Senior Finance Officer',
    badge: 'Finance / Ledger Desk',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    intro: 'Hello, I am Sarah from the Finance Division. I specialize in deposit clearing, withdrawal authorizations, and wallet synchronization. Let me check your ledger.',
    personality: 'finance'
  },
  {
    id: 'marcus',
    name: 'Agent Marcus',
    role: 'USDT Node Specialist',
    badge: 'On-chain Networks',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
    intro: 'Marcus here from the Network Engineering team. I monitor the smart contract staking pools and TRC20/BEP20 node states. How is your connection?',
    personality: 'technical'
  },
  {
    id: 'elena',
    name: 'Agent Elena',
    role: 'VIP Accounts Host',
    badge: 'Private Staking / High Yield',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
    intro: 'Greetings, I am Elena, your dedicated VIP desk partner. I help our premium traders maximize their yields through top-tier copy trading signals and exclusive staking options.',
    personality: 'vip'
  },
  {
    id: 'ai_bot',
    name: 'NGK AI Assistant',
    role: 'Automated Agent Program',
    badge: 'Instant Automated Helper',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&h=150&fit=crop&crop=face',
    intro: 'Hi! I am the automated NGK smart-bot, here to answer frequently asked questions about limits, security, and operations instantly.',
    personality: 'ai'
  }
];

export default function Support({ onNavigate }: SupportProps) {
  const [activeAgent, setActiveAgent] = useState<SupportAgent>(SUPPORT_AGENTS[0]);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialize welcome message for selected agent
  useEffect(() => {
    setMessages([
      {
        id: `welcome-${activeAgent.id}`,
        sender: 'bot',
        message: activeAgent.intro,
        timestamp: new Date().toISOString()
      }
    ]);
  }, [activeAgent]);

  // Auto scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Standard suggestions helper
  const suggestions = [
    { label: '💳 Deposit Help', query: 'How to deposit?' },
    { label: '💸 Withdraw Help', query: 'How to withdraw?' },
    { label: '📈 Copy Trading', query: 'Copy trade explained' },
    { label: '👥 Referral Partner', query: 'Referral commission' },
    { label: '💰 Min Limits', query: 'What is the minimum?' }
  ];

  // Personalized responses depending on selected agent
  const getAgentResponse = (query: string, agent: SupportAgent): string => {
    const l = query.toLowerCase();

    if (agent.personality === 'finance') {
      if (l.includes('deposit')) {
        return "Sarah here: Deposits require at least 15 block confirmations. Minimum deposit is 25 USDT, and you get an automatic 10% bonus instantly credited. If your transaction is pending, you can use the Profile > Admin Portal to approve it instantly!";
      }
      if (l.includes('withdraw')) {
        return "Sarah here: Withdrawals process within 5 to 15 minutes. Minimum is 4 USDT. Your funds are secured by multi-signature escrow. If you requested a withdrawal, please head to the Admin Portal in Profile to approve or reject it immediately!";
      }
      if (l.includes('minimum') || l.includes('min') || l.includes('limit')) {
        return "Sarah here: Finance limits are: Min Deposit 25 USDT, Min Withdrawal 4 USDT, Min Copy Trade 100 USDT, Min Staking 25 USDT.";
      }
      return "Sarah here: I have pulled up your financial dossier. Your available USDT principal and earnings are synced with our secure Ledger node. Let me know if you would like me to review a specific TX ID.";
    }

    if (agent.personality === 'technical') {
      if (l.includes('deposit') || l.includes('withdraw') || l.includes('limit')) {
        return "Marcus here: Our on-chain gateway is currently operating on BSC (BEP20), TRON (TRC20), and Ethereum (ERC20) networks. All nodes are reporting green with average block confirmations under 12 seconds.";
      }
      if (l.includes('copy') || l.includes('trade')) {
        return "Marcus here: The copy-trading framework runs our low-latency execution node, mirroring top global traders within 40ms. Settle your trades in demomode in 30 seconds for a quick test.";
      }
      if (l.includes('stake') || l.includes('staking')) {
        return "Marcus here: Staking pools are deployed as audited smart contracts on BSC network. Principal funds are locked securely for 15 days, yielding a stable 3.6% daily payout.";
      }
      return "Marcus here: Technical node status is optimal. Ping: 28ms. Network load: 4.2%. Standard on-chain multi-signatures are fully synchronized. Let me know if your terminal shows any latency.";
    }

    if (agent.personality === 'vip') {
      if (l.includes('copy') || l.includes('trade')) {
        return "Elena here: Welcome to the private desk. Our VIP members have priority access to Satoshi_AI and CryptoWhale with leverage pools. The standard minimum is 100 USDT but we can offer customizable slots up to 50,000 USDT with optimized risk hedging.";
      }
      if (l.includes('deposit') || l.includes('withdraw')) {
        return "Elena here: VIP accounts enjoy unlimited instant withdraw channels and priority queues. Any deposit you submit is handled directly by our clearing partners, ensuring absolute security and confidentiality.";
      }
      return "Elena here: It is an honor to assist you. At NGK, we prioritize bespoke wealth preservation and elite trading. Would you like me to unlock special signal pools or custom high-commission refer plans for you today?";
    }

    // Default AI Bot responses
    if (l.includes('deposit')) {
      return "AI Bot: To deposit, click 'Deposit' on the dashboard. Choose your preferred network (BEP20, TRC20, or ERC20), and copy the unique address. Send USDT. Minimum is 25 USDT. It will instantly credit with +10% welcome bonus!";
    }
    if (l.includes('withdraw')) {
      return "AI Bot: To withdraw, select 'Withdraw' on the dashboard, input your wallet address, enter the amount (minimum 4 USDT), and enter your 6-digit withdrawal PIN. Process time is 5-15 mins.";
    }
    if (l.includes('copy')) {
      return "AI Bot: Copy Trading enables you to replicate professional traders. Select Copy Trading, choose your desired master trader, enter an amount (minimum 100 USDT) and launch.";
    }
    if (l.includes('refer') || l.includes('invite') || l.includes('commission')) {
      return "AI Bot: Copy your invitation link from the Referral screen. You earn 5% Level 1 and 3% Level 2 commissions on trades and stake amounts submitted by your team!";
    }
    if (l.includes('minimum') || l.includes('min') || l.includes('limit')) {
      return "AI Bot: Minimum limits are: Deposit $25 USDT, Withdrawal $4 USDT, Copy Trading $100 USDT, Staking $25 USDT.";
    }
    return "AI Bot: I am an automated response bot. For direct manual help, please choose one of our active human agents (Sarah, Marcus, or Elena) at the top of this screen!";
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
        message: getAgentResponse(trimmed, activeAgent),
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, botMsg]);
    }, 500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-3.5 px-4 pb-12 flex flex-col h-[calc(100vh-140px)]"
    >
      {/* Header */}
      <div className="flex items-center gap-2 shrink-0">
        <button 
          onClick={() => onNavigate('dashboard')} 
          className="text-zinc-400 hover:text-white transition p-1.5 hover:bg-zinc-850 rounded-lg"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="text-sm font-bold text-white tracking-tight font-mono uppercase">NGK Customer Desk</h2>
          <p className="text-[9px] text-[#00bfa5] font-bold uppercase font-mono tracking-wider flex items-center gap-1">
            <Activity size={9} className="animate-pulse" /> Live Representatives Online
          </p>
        </div>
      </div>

      {/* NEW: Horizontal Agent Switcher Bar */}
      <div className="bg-zinc-900/40 p-2 border border-zinc-850 rounded-xl space-y-1.5 shrink-0">
        <span className="text-[8px] text-zinc-500 font-bold uppercase font-mono tracking-wider px-1 block flex items-center gap-1">
          <Headphones size={10} className="text-cyan-400" /> Select Customer Support Representative:
        </span>
        <div className="grid grid-cols-4 gap-1.5">
          {SUPPORT_AGENTS.map((agent) => {
            const isSelected = activeAgent.id === agent.id;
            return (
              <button
                key={agent.id}
                onClick={() => setActiveAgent(agent)}
                className={`p-1.5 rounded-lg border text-center transition duration-150 flex flex-col items-center gap-1 outline-none relative ${
                  isSelected 
                    ? 'bg-cyan-500/10 border-cyan-500/30' 
                    : 'bg-zinc-950/50 border-zinc-900 hover:border-zinc-800'
                }`}
              >
                {/* Active Indicator */}
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-emerald-400 rounded-full border border-zinc-950"></span>
                
                {/* Image */}
                <img 
                  src={agent.avatar} 
                  alt={agent.name}
                  referrerPolicy="no-referrer"
                  className={`w-7 h-7 rounded-lg object-cover border transition ${
                    isSelected ? 'border-cyan-400' : 'border-zinc-800'
                  }`}
                />
                
                {/* Label */}
                <div className="text-[7px] font-bold uppercase tracking-wide truncate max-w-full font-mono text-white leading-none">
                  {agent.name.split(' ')[1] || agent.name}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Suggestion Chips */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none shrink-0">
        {suggestions.map((s, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(s.query)}
            className="px-3 py-1 bg-zinc-900 hover:bg-zinc-850 border border-zinc-850 text-zinc-300 rounded text-[10px] font-bold transition whitespace-nowrap outline-none font-mono"
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Chat Messages Viewport */}
      <div className="flex-1 overflow-y-auto bg-zinc-950 border border-zinc-900 rounded-2xl p-4.5 space-y-4 min-h-[120px]">
        {messages.map((msg) => {
          const isBot = msg.sender === 'bot';
          return (
            <div 
              key={msg.id} 
              className={`flex ${isBot ? 'justify-start' : 'justify-end'}`}
            >
              <div className={`flex gap-3 max-w-[85%] ${isBot ? 'flex-row' : 'flex-row-reverse'}`}>
                {/* Portrait Bubble */}
                <div className="shrink-0">
                  {isBot ? (
                    <img 
                      src={activeAgent.avatar} 
                      alt={activeAgent.name}
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded-lg object-cover border border-zinc-800"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 text-cyan-400 flex items-center justify-center">
                      <UserIcon size={14} />
                    </div>
                  )}
                </div>

                {/* Bubble Message */}
                <div className={`rounded-2xl px-4 py-3 border ${
                  isBot 
                    ? 'bg-zinc-900/60 border-zinc-850 text-zinc-200 rounded-tl-none' 
                    : 'bg-[#0f2e2a] border-[#00bfa5]/20 text-zinc-100 rounded-tr-none'
                }`}>
                  <p className="text-[8px] font-bold uppercase text-zinc-500 mb-1 flex items-center gap-1 font-mono">
                    {isBot ? (
                      <>
                        <Sparkles size={8} className="text-cyan-400" /> {activeAgent.name} <span className="text-zinc-600">({activeAgent.badge})</span>
                      </>
                    ) : (
                      'Investor Account'
                    )}
                  </p>
                  <p className="text-xs leading-relaxed font-sans font-medium whitespace-pre-line">
                    {msg.message}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      {/* Input Container */}
      <div className="flex gap-2 bg-zinc-900 p-2 rounded-xl border border-zinc-800 shadow-sm shrink-0">
        <input 
          type="text" 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputText)}
          placeholder={`Type message to ${activeAgent.name}...`}
          className="flex-1 bg-transparent text-white placeholder-zinc-550 outline-none border-none text-xs px-2 py-2 font-bold font-mono"
        />
        
        <button
          onClick={() => handleSendMessage(inputText)}
          className="bg-cyan-500 hover:bg-cyan-400 w-8.5 h-8.5 rounded-lg flex items-center justify-center text-zinc-950 active:scale-95 transition"
        >
          <Send size={14} />
        </button>
      </div>

      {/* Admin Quick Link tip */}
      <p className="text-[8px] text-zinc-500 text-center uppercase tracking-wider font-bold font-mono shrink-0">
        Ledger Testing? Make deposit/withdrawal requests then go to <span className="text-cyan-400">Profile &gt; Admin Portal</span> to approve them.
      </p>
    </motion.div>
  );
}
