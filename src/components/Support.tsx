import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Send, 
  User as UserIcon, 
  Sparkles,
  Activity,
  Headphones,
  Plus,
  Image as ImageIcon,
  X,
  Volume2,
  VolumeX
} from 'lucide-react';
import { motion } from 'motion/react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, doc, setDoc } from 'firebase/firestore';
import { playOutgoingSound, playIncomingSound } from '../lib/sound';

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
  imageUrl?: string;
}

export default function Support({ user, onNavigate }: SupportProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const prevMsgCountRef = useRef<number>(0);
  const isFirstLoadRef = useRef<boolean>(true);

  // Determine active agent based on the last agent message, or default to Agent Sophia
  const lastAgentMsg = [...messages].reverse().find(m => m.sender === 'agent');
  const activeAgent = {
    name: lastAgentMsg ? lastAgentMsg.senderName : 'Agent Sophia',
    avatar: lastAgentMsg?.agentAvatar || 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face'
  };

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedImage]);

  // Sound Chime Notification for incoming agent messages
  useEffect(() => {
    if (isFirstLoadRef.current) {
      if (messages.length > 0) {
        isFirstLoadRef.current = false;
        prevMsgCountRef.current = messages.length;
      }
      return;
    }

    if (messages.length > prevMsgCountRef.current) {
      const latestMsg = messages[messages.length - 1];
      if (latestMsg && latestMsg.sender === 'agent' && soundEnabled) {
        playIncomingSound();
      }
    }
    prevMsgCountRef.current = messages.length;
  }, [messages, soundEnabled]);

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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 800;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
        setSelectedImage(compressedDataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if ((!trimmed && !selectedImage) || !user?.uid) return;

    const imageToSend = selectedImage;
    setInputText('');
    setSelectedImage(null);

    if (soundEnabled) {
      playOutgoingSound();
    }

    try {
      const newMsg: any = {
        sender: 'user' as const,
        senderName: user.username || 'Investor',
        message: trimmed || '📷 Sent an image attachment',
        timestamp: new Date().toISOString()
      };

      if (imageToSend) {
        newMsg.imageUrl = imageToSend;
      }

      // Add user message to subcollection
      await addDoc(collection(db, 'support_chats', user.uid, 'messages'), newMsg);

      // Upsert parent chat session document
      await setDoc(doc(db, 'support_chats', user.uid), {
        userId: user.uid,
        username: user.username || 'Investor',
        userEmail: user.email || 'investor@ngk.exchange',
        lastMessage: imageToSend ? '📷 Image attachment' : trimmed,
        lastTimestamp: new Date().toISOString(),
        status: 'open'
      }, { merge: true });

      // Trigger AI Auto-Reply if it's a text message
      if (trimmed) {
        fetch('/api/support-auto-reply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.uid,
            username: user.username || 'Investor',
            userMessage: trimmed,
            userEmail: user.email || ''
          })
        }).catch((err) => console.error("Auto-reply trigger error:", err));
      }

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
      <div className="flex items-center justify-between bg-zinc-900/40 p-3 rounded-xl border border-zinc-900 shrink-0">
        <div className="flex items-center gap-2.5">
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

        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          title={soundEnabled ? "Mute notification sounds" : "Enable notification sounds"}
          className={`p-1.5 rounded-lg border text-xs font-mono transition flex items-center gap-1 ${
            soundEnabled 
              ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' 
              : 'bg-zinc-800 border-zinc-700 text-zinc-400'
          }`}
        >
          {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
        </button>
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

                  {msg.imageUrl && (
                    <div className="mt-2">
                      <a href={msg.imageUrl} target="_blank" rel="noopener noreferrer">
                        <img 
                          src={msg.imageUrl} 
                          alt="Attachment" 
                          className="max-w-[220px] max-h-[220px] rounded-xl object-cover border border-zinc-700/80 hover:opacity-95 transition shadow-md" 
                        />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      {/* Selected Image Preview Chip */}
      {selectedImage && (
        <div className="flex items-center gap-2 bg-zinc-900 border border-cyan-500/30 p-2 rounded-xl shrink-0">
          <div className="relative">
            <img src={selectedImage} alt="Attachment Preview" className="w-12 h-12 object-cover rounded-lg border border-zinc-800" />
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white rounded-full p-0.5 hover:bg-rose-400 transition"
            >
              <X size={10} />
            </button>
          </div>
          <div className="text-[10px] text-cyan-400 font-mono font-bold">
            Image Attached (Ready to Send)
          </div>
        </div>
      )}

      {/* Input Container */}
      <div className="flex items-center gap-2 bg-zinc-900 p-2 rounded-xl border border-zinc-850 shadow-sm shrink-0">
        <input 
          type="file" 
          ref={fileInputRef} 
          accept="image/*" 
          className="hidden" 
          onChange={handleImageSelect} 
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          title="Attach photo/screenshot"
          className="bg-zinc-800 hover:bg-zinc-750 text-cyan-400 border border-zinc-700/60 w-8.5 h-8.5 rounded-lg flex items-center justify-center shrink-0 transition active:scale-95"
        >
          <Plus size={16} />
        </button>

        <input 
          type="text" 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputText)}
          placeholder={`Type a message...`}
          className="flex-1 bg-transparent text-white placeholder-zinc-550 outline-none border-none text-xs px-1 py-2 font-bold font-mono"
        />
        
        <button
          onClick={() => handleSendMessage(inputText)}
          className="bg-cyan-500 hover:bg-cyan-400 w-8.5 h-8.5 rounded-lg flex items-center justify-center text-zinc-950 shrink-0 active:scale-95 transition"
        >
          <Send size={14} />
        </button>
      </div>
    </motion.div>
  );
}
