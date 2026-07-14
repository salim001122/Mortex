import { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Send, 
  User as UserIcon, 
  Sparkles,
  Activity,
  Headphones
} from 'lucide-react';
import { motion } from 'motion/react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, doc, setDoc } from 'firebase/firestore';

interface SupportProps {
  user: any;
  onNavigate: (screen: string) => void;
}

interface Message {
  id: string;
  sender: 'user' | 'agent';
  senderName: string;
  message: string;
  timestamp: string;
  agentAvatar?: string;
}

export default function Support({ user, onNavigate }: SupportProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Determine active agent based on the last agent message, or default to Agent Sophia
  const lastAgentMsg = [...messages].reverse().find(m => m.sender === 'agent');
  const activeAgent = {
    name: lastAgentMsg ? lastAgentMsg.senderName : 'Agent Sophia',
    avatar: lastAgentMsg?.agentAvatar || 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face'
  };

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Connect to Firestore real-time customer support chat subcollection
  useEffect(() => {
    if (!user?.uid) return;

    const messagesQuery = query(
      collection(db, 'support_chats', user.uid, 'messages'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const loaded: Message[] = [];
      snapshot.forEach((docSnap) => {
        loaded.push({ id: docSnap.id, ...docSnap.data() } as Message);
      });
      setMessages(loaded);
    }, (error) => {
      console.error("Error reading personal support messages:", error);
    });

    return () => unsubscribe();
  }, [user]);

  const handleSendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || !user?.uid) return;

    setInputText('');

    try {
      const newMsg = {
        sender: 'user' as const,
        senderName: user.username || 'Investor',
        message: trimmed,
        timestamp: new Date().toISOString()
      };

      // Add user message to subcollection
      await addDoc(collection(db, 'support_chats', user.uid, 'messages'), newMsg);

      // Upsert parent chat session document
      await setDoc(doc(db, 'support_chats', user.uid), {
        userId: user.uid,
        username: user.username || 'Investor',
        userEmail: user.email || 'investor@ngk.exchange',
        lastMessage: trimmed,
        lastTimestamp: new Date().toISOString(),
        status: 'open'
      }, { merge: true });

    } catch (err) {
      console.error("Error writing user message to support chat:", err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="px-4 pb-4 flex flex-col flex-1 h-full min-h-0 space-y-3"
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 bg-zinc-900/40 p-3 rounded-xl border border-zinc-900 shrink-0">
        <button 
          onClick={() => onNavigate('dashboard')} 
          className="text-zinc-400 hover:text-white transition p-1.5 hover:bg-zinc-800 rounded-lg"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h2 className="text-xs font-bold text-white tracking-tight font-mono uppercase">NGK Customer Desk</h2>
          <p className="text-[9px] text-[#00bfa5] font-bold uppercase font-mono tracking-wider flex items-center gap-1">
            <Activity size={9} className="animate-pulse" /> Live Representatives Online
          </p>
        </div>
      </div>

      {/* Assigned Agent Box */}
      <div className="bg-gradient-to-r from-zinc-900 to-zinc-950 border border-zinc-850 p-3 rounded-xl flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <img 
            src={activeAgent.avatar} 
            alt={activeAgent.name} 
            className="w-10 h-10 rounded-lg object-cover border border-zinc-800"
            referrerPolicy="no-referrer"
          />
          <div>
            <h3 className="text-xs font-bold text-white font-mono uppercase">{activeAgent.name}</h3>
            <p className="text-[9px] text-zinc-500 font-mono uppercase">Your assigned representative</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg text-[9px] font-bold text-emerald-400 font-mono uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>ONLINE</span>
        </div>
      </div>

      {/* Chat Messages Viewport */}
      <div className="flex-1 overflow-y-auto bg-zinc-950 border border-zinc-900 rounded-2xl p-4 space-y-4 min-h-0">
        {/* Automatic Welcome Message when thread is fresh */}
        {messages.length === 0 && (
          <div className="flex justify-start">
            <div className="flex gap-3 max-w-[85%]">
              <div className="shrink-0">
                <img 
                  src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face" 
                  alt="Welcome Officer"
                  className="w-8 h-8 rounded-lg object-cover border border-zinc-800"
                />
              </div>
              <div className="rounded-2xl px-4 py-3 bg-zinc-900 border border-zinc-850 text-zinc-200 rounded-tl-none">
                <p className="text-[8px] font-bold uppercase text-zinc-500 mb-1 flex items-center gap-1 font-mono">
                  <Sparkles size={8} className="text-cyan-400" /> NGK Exchange Welcome
                </p>
                <p className="text-xs leading-relaxed font-sans font-medium">
                  Welcome to NGK Exchange Customer Desk! Our manual support agents are ready to assist you. 
                  Please write your deposit, withdrawal, staking, or copy-trading query below, and we will reply to you in real-time.
                </p>
              </div>
            </div>
          </div>
        )}

        {messages.map((msg) => {
          const isAgent = msg.sender === 'agent';
          return (
            <div 
              key={msg.id} 
              className={`flex ${isAgent ? 'justify-start' : 'justify-end'}`}
            >
              <div className={`flex gap-3 max-w-[85%] ${isAgent ? 'flex-row' : 'flex-row-reverse'}`}>
                {/* Portrait Bubble */}
                <div className="shrink-0">
                  {isAgent ? (
                    <img 
                      src={msg.agentAvatar || activeAgent.avatar} 
                      alt={msg.senderName}
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded-lg object-cover border border-zinc-800"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 text-cyan-400 flex items-center justify-center text-xs font-mono font-black uppercase">
                      {(user?.username || user?.email || 'I').charAt(0)}
                    </div>
                  )}
                </div>

                {/* Bubble Message */}
                <div className={`rounded-2xl px-4 py-3 border ${
                  isAgent 
                    ? 'bg-zinc-900/60 border-zinc-850 text-zinc-200 rounded-tl-none' 
                    : 'bg-[#0f2e2a] border-[#00bfa5]/20 text-zinc-100 rounded-tr-none'
                }`}>
                  <p className="text-[8px] font-bold uppercase text-zinc-500 mb-1 flex items-center gap-1 font-mono">
                    {isAgent ? (
                      <>
                        <Sparkles size={8} className="text-cyan-400" /> {msg.senderName}
                      </>
                    ) : (
                      'Investor Account'
                    )}
                  </p>
                  <p className="text-xs leading-relaxed font-sans font-medium whitespace-pre-wrap">
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
      <div className="flex gap-2 bg-zinc-900 p-2 rounded-xl border border-zinc-850 shadow-sm shrink-0">
        <input 
          type="text" 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputText)}
          placeholder={`Type a message...`}
          className="flex-1 bg-transparent text-white placeholder-zinc-550 outline-none border-none text-xs px-2 py-2 font-bold font-mono"
        />
        
        <button
          onClick={() => handleSendMessage(inputText)}
          className="bg-cyan-500 hover:bg-cyan-400 w-8.5 h-8.5 rounded-lg flex items-center justify-center text-zinc-950 active:scale-95 transition"
        >
          <Send size={14} />
        </button>
      </div>
    </motion.div>
  );
}
