import { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Send, 
  User as UserIcon, 
  Lock, 
  Check, 
  ShieldAlert, 
  LogOut, 
  MessageSquare, 
  Clock, 
  UserCheck, 
  Activity,
  Headphones,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, doc, getDocs } from 'firebase/firestore';

interface Agent {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

const SUPPORT_AGENTS: Agent[] = [
  {
    id: 'sarah',
    name: 'Sarah',
    role: 'Senior Finance Desk',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: 'marcus',
    name: 'Marcus',
    role: 'On-chain Node Specialist',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: 'elena',
    name: 'Elena',
    role: 'VIP Accounts Host',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: 'alex',
    name: 'Alex',
    role: 'Lead Operations Agent',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: 'sophia',
    name: 'Sophia',
    role: 'Staking Pool Coordinator',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face'
  }
];

interface AgentSupportPanelProps {
  onNavigate: (screen: string) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

interface SupportChatSession {
  id: string; // user's uid
  userId: string;
  username: string;
  userEmail: string;
  lastMessage: string;
  lastTimestamp: string;
  status?: string;
}

interface Message {
  id: string;
  sender: 'user' | 'agent';
  senderName: string;
  message: string;
  timestamp: string;
  agentAvatar?: string;
}

export default function AgentSupportPanel({ onNavigate, showToast }: AgentSupportPanelProps) {
  // Session tracking
  const [loggedAgent, setLoggedAgent] = useState<Agent | null>(() => {
    const saved = localStorage.getItem('ngk_logged_agent');
    if (saved) {
      try { return JSON.parse(saved); } catch { return null; }
    }
    return null;
  });

  // Login form States
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Dashboard States
  const [chats, setChats] = useState<SupportChatSession[]>([]);
  const [selectedChat, setSelectedChat] = useState<SupportChatSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll inside chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Sync active support chat sessions from Firestore
  useEffect(() => {
    if (!loggedAgent) return;

    const chatsQuery = query(
      collection(db, 'support_chats'),
      orderBy('lastTimestamp', 'desc')
    );

    const unsubChats = onSnapshot(chatsQuery, (snapshot) => {
      const loaded: SupportChatSession[] = [];
      snapshot.forEach((docSnap) => {
        loaded.push({ id: docSnap.id, ...docSnap.data() } as SupportChatSession);
      });
      setChats(loaded);
    }, (error) => {
      console.error("Error reading support chats:", error);
    });

    return () => unsubChats();
  }, [loggedAgent]);

  // Sync selected chat's messages
  useEffect(() => {
    if (!loggedAgent || !selectedChat) {
      setMessages([]);
      return;
    }

    const messagesQuery = query(
      collection(db, 'support_chats', selectedChat.id, 'messages'),
      orderBy('timestamp', 'asc')
    );

    const unsubMessages = onSnapshot(messagesQuery, (snapshot) => {
      const loaded: Message[] = [];
      snapshot.forEach((docSnap) => {
        loaded.push({ id: docSnap.id, ...docSnap.data() } as Message);
      });
      setMessages(loaded);
    }, (error) => {
      console.error("Error loading chat messages:", error);
    });

    return () => unsubMessages();
  }, [loggedAgent, selectedChat]);

  // Handle agent login
  const handleAgentLogin = () => {
    if (!selectedAgent) return;
    setIsVerifying(true);

    const expectedPassword = `${selectedAgent.name}1091`;
    const cleanedInput = passwordInput.trim();

    setTimeout(() => {
      if (cleanedInput === expectedPassword || cleanedInput.toLowerCase() === expectedPassword.toLowerCase()) {
        setLoggedAgent(selectedAgent);
        localStorage.setItem('ngk_logged_agent', JSON.stringify(selectedAgent));
        showToast(`Welcome back, Agent ${selectedAgent.name}! Session decrypter synchronized.`, 'success');
        setPasswordInput('');
        setSelectedAgent(null);
      } else {
        showToast('Decryption code mismatch. Authorization key rejected.', 'error');
      }
      setIsVerifying(false);
    }, 400);
  };

  // Handle agent logout
  const handleAgentLogout = () => {
    localStorage.removeItem('ngk_logged_agent');
    setLoggedAgent(null);
    setSelectedChat(null);
    showToast('Secure agent session terminated.', 'info');
  };

  // Send message from logged support agent
  const handleSendAgentMessage = async () => {
    if (!loggedAgent || !selectedChat || !inputText.trim()) return;

    const messageText = inputText.trim();
    setInputText('');

    try {
      const newMsg = {
        sender: 'agent' as const,
        senderName: `Agent ${loggedAgent.name}`,
        message: messageText,
        timestamp: new Date().toISOString(),
        agentAvatar: loggedAgent.avatar
      };

      // Add to messages subcollection
      await addDoc(collection(db, 'support_chats', selectedChat.id, 'messages'), newMsg);

      // Update parent document
      await updateDoc(doc(db, 'support_chats', selectedChat.id), {
        lastMessage: messageText,
        lastTimestamp: new Date().toISOString(),
        assignedAgentName: `Agent ${loggedAgent.name}`
      });

    } catch (err) {
      console.error("Error sending agent message:", err);
      showToast('Error syncing communication block.', 'error');
    }
  };

  return (
    <div className="px-4 pb-4 flex flex-col flex-1 h-full min-h-0 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between bg-zinc-900/60 p-3 rounded-xl border border-zinc-900">
        <div className="flex items-center gap-2.5">
          <button 
            onClick={() => onNavigate('dashboard')} 
            className="text-zinc-400 hover:text-white transition p-1.5 hover:bg-zinc-850 rounded-lg"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h2 className="text-xs font-bold text-white tracking-wide uppercase font-mono">Support Agent Core</h2>
            <p className="text-[9px] text-[#00bfa5] font-bold uppercase font-mono tracking-wider flex items-center gap-1">
              <Activity size={9} className="animate-pulse" /> NGK Exchange Node
            </p>
          </div>
        </div>

        {loggedAgent && (
          <button 
            onClick={handleAgentLogout}
            className="text-[9px] font-bold text-rose-400 hover:text-rose-300 transition uppercase tracking-wider font-mono bg-rose-500/10 border border-rose-500/20 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5"
          >
            <LogOut size={11} />
            <span>Exit Node</span>
          </button>
        )}
      </div>

      {!loggedAgent ? (
        /* 1. AGENT LOGIN VIEW */
        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mx-auto">
              <Headphones size={24} />
            </div>
            <h1 className="text-sm font-black text-white tracking-wider uppercase font-mono">Agent Identity Gateway</h1>
            <p className="text-[10px] text-zinc-500 font-mono uppercase">Select your customer support officer node to decrypt active chats</p>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {SUPPORT_AGENTS.map((agent) => (
              <button
                key={agent.id}
                onClick={() => {
                  setSelectedAgent(agent);
                  setPasswordInput('');
                }}
                className="bg-zinc-900 hover:bg-zinc-850 border border-zinc-850/70 rounded-xl p-3 flex items-center justify-between text-left transition active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  <img 
                    src={agent.avatar} 
                    alt={agent.name} 
                    className="w-10 h-10 rounded-lg object-cover border border-zinc-800"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h3 className="text-xs font-bold text-white font-mono uppercase">Agent {agent.name}</h3>
                    <p className="text-[9px] text-zinc-500 font-mono uppercase">{agent.role}</p>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-lg bg-zinc-950 flex items-center justify-center border border-zinc-900 text-cyan-400">
                  <Lock size={12} />
                </div>
              </button>
            ))}
          </div>

          {/* Login Password Modal */}
          <AnimatePresence>
            {selectedAgent && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-xs">
                <motion.div
                  initial={{ scale: 0.96, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.96, opacity: 0 }}
                  className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5.5 w-full max-w-sm shadow-2xl relative"
                >
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
                    <div className="flex items-center gap-2.5">
                      <img 
                        src={selectedAgent.avatar} 
                        alt={selectedAgent.name} 
                        className="w-8 h-8 rounded-lg object-cover border border-zinc-800"
                      />
                      <div>
                        <h3 className="font-bold text-xs text-white font-mono uppercase">Decrypt Agent {selectedAgent.name}</h3>
                        <p className="text-[8px] text-cyan-400 font-mono uppercase tracking-wider font-bold">{selectedAgent.role}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setSelectedAgent(null)} 
                      className="w-6 h-6 bg-zinc-950 hover:bg-zinc-800 rounded text-zinc-400 flex items-center justify-center border border-zinc-850 text-xs font-bold"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-4 font-mono text-left">
                    <div className="space-y-1">
                      <label className="text-[9px] text-zinc-500 uppercase font-mono font-bold tracking-wider">Node Password (e.g. {selectedAgent.name}1091)</label>
                      <input 
                        type="password" 
                        placeholder="••••••••"
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-cyan-500"
                        onKeyDown={(e) => e.key === 'Enter' && handleAgentLogin()}
                      />
                    </div>

                    <button 
                      onClick={handleAgentLogin}
                      disabled={isVerifying}
                      className="w-full bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-black py-3 rounded-xl text-xs uppercase tracking-wider text-center transition shadow-md flex items-center justify-center gap-1.5"
                    >
                      {isVerifying ? 'Verifying Node Access...' : 'Authorize Operator'}
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        /* 2. LIVE CHAT DASHBOARD VIEW */
        <div className="flex-1 flex gap-3 h-full min-h-0 overflow-hidden">
          {/* Left panel: Active chat rooms list */}
          <div className={`w-full md:w-80 shrink-0 border border-zinc-900 bg-zinc-950/40 rounded-2xl flex flex-col overflow-hidden ${selectedChat ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-3 border-b border-zinc-900 shrink-0">
              <span className="text-[8px] text-zinc-500 font-bold uppercase font-mono tracking-wider flex items-center gap-1.5">
                <MessageSquare size={11} className="text-cyan-400" /> Active Communications ({chats.length})
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-1.5 space-y-1">
              {chats.length === 0 ? (
                <div className="p-6 text-center text-[10px] text-zinc-650 font-mono uppercase">
                  No active support sessions found.
                </div>
              ) : (
                chats.map((c) => {
                  const isSelected = selectedChat?.id === c.id;
                  const formattedTime = c.lastTimestamp 
                    ? new Date(c.lastTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : '';

                  return (
                    <button
                      key={c.id}
                      onClick={() => setSelectedChat(c)}
                      className={`w-full p-2.5 rounded-xl text-left border transition flex flex-col space-y-1 outline-none ${
                        isSelected 
                          ? 'bg-cyan-500/10 border-cyan-500/20' 
                          : 'bg-zinc-900/30 border-transparent hover:bg-zinc-900/50 hover:border-zinc-850'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-white font-mono uppercase truncate max-w-[70%]">{c.username}</span>
                        <span className="text-[8px] text-zinc-500 font-mono">{formattedTime}</span>
                      </div>
                      <span className="text-[8px] text-zinc-400 truncate block font-mono">{c.userEmail}</span>
                      <p className="text-[9px] text-zinc-400 truncate block pt-0.5 leading-normal">{c.lastMessage}</p>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right panel: Active chat thread */}
          <div className={`flex-1 border border-zinc-900 bg-zinc-950/20 rounded-2xl flex flex-col overflow-hidden ${selectedChat ? 'flex' : 'hidden md:flex'}`}>
            {selectedChat ? (
              <>
                {/* Active Thread User Info */}
                <div className="p-3 border-b border-zinc-900 flex justify-between items-center bg-zinc-950/60 shrink-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <button 
                      onClick={() => setSelectedChat(null)} 
                      className="md:hidden p-1 bg-zinc-900 border border-zinc-850 hover:bg-zinc-850 rounded text-zinc-400 mr-1 shrink-0 transition"
                    >
                      <ArrowLeft size={13} />
                    </button>
                    <div className="w-7 h-7 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center text-cyan-400 text-xs font-mono font-black shrink-0">
                      {(selectedChat.username || selectedChat.userEmail || 'I').charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-[10px] font-bold text-white font-mono uppercase leading-tight truncate">{selectedChat.username || selectedChat.userEmail}</h3>
                      <p className="text-[8px] text-zinc-500 font-mono truncate">{selectedChat.userEmail}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-[8px] text-emerald-400 font-bold uppercase font-mono shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>Live Tunnel Secured</span>
                  </div>
                </div>

                {/* Messages Viewport */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-zinc-950/40">
                  {messages.map((m) => {
                    const isAgent = m.sender === 'agent';
                    return (
                      <div key={m.id} className={`flex ${isAgent ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex gap-2 max-w-[85%] ${isAgent ? 'flex-row-reverse' : 'flex-row'}`}>
                          {/* Portrait Bubble */}
                          <div className="shrink-0">
                            {isAgent ? (
                              <img 
                                src={m.agentAvatar || loggedAgent.avatar} 
                                alt={m.senderName} 
                                className="w-6 h-6 rounded-lg object-cover border border-zinc-800"
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-lg bg-zinc-900 border border-zinc-800 text-cyan-400 flex items-center justify-center text-[10px] font-black">
                                {(selectedChat.username || selectedChat.userEmail || 'I').charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>

                          {/* Bubble message body */}
                          <div className={`rounded-xl px-3 py-2 border ${
                            isAgent 
                              ? 'bg-[#0f2e2a] border-[#00bfa5]/20 text-zinc-100 rounded-tr-none' 
                              : 'bg-zinc-900 border-zinc-850 text-zinc-200 rounded-tl-none'
                          }`}>
                            <p className="text-[7px] font-bold uppercase text-zinc-500 mb-0.5 font-mono">
                              {m.senderName}
                            </p>
                            <p className="text-xs leading-relaxed font-sans font-medium whitespace-pre-wrap">
                              {m.message}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={chatEndRef} />
                </div>

                {/* Input Controls */}
                <div className="p-2.5 border-t border-zinc-900 bg-zinc-950/60 flex gap-2 shrink-0">
                  <input 
                    type="text" 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendAgentMessage()}
                    placeholder={`Write your official response to ${selectedChat.username}...`}
                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-650 outline-none focus:border-cyan-500 font-mono"
                  />
                  <button
                    onClick={handleSendAgentMessage}
                    className="bg-cyan-500 hover:bg-cyan-400 text-zinc-950 px-4 rounded-xl text-xs font-black transition active:scale-95 uppercase tracking-wider font-mono flex items-center justify-center gap-1"
                  >
                    <Send size={12} />
                    <span>Send</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col justify-center items-center p-6 space-y-3.5 text-center">
                <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-850 flex items-center justify-center text-zinc-500">
                  <MessageSquare size={20} />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-zinc-400 font-mono uppercase">Communication Decrypter Idle</h3>
                  <p className="text-[9px] text-zinc-500 font-mono uppercase mt-1">Select an active investor chat session from the left queue to begin live assistance</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
