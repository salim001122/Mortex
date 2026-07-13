import { Flame, MessageSquare, Zap } from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  user: User | null;
  onNavigate: (screen: string) => void;
  unreadChatCount: number;
}

export default function Header({ user, onNavigate, unreadChatCount }: HeaderProps) {
  const avatarUrl = user?.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user?.email || 'default')}`;

  return (
    <header className="sticky top-0 z-30 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-900 px-4 py-3 flex justify-between items-center max-w-md mx-auto">
      {/* Brand Logo & VIP status details */}
      <div className="flex items-center gap-3">
        <button 
          onClick={() => onNavigate('dashboard')} 
          className="relative group active:scale-95 transition"
        >
          <div className="w-8 h-8 bg-zinc-850 border border-zinc-700 rounded-lg flex items-center justify-center">
            <Zap size={16} className="text-cyan-400" />
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full border border-zinc-950 shadow-md"></div>
        </button>

        <div>
          <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5 uppercase font-mono">
            GTX<span className="text-cyan-400">Ecosystem</span>
            <span className="text-[9px] px-1 bg-cyan-500/10 text-cyan-400 rounded font-bold uppercase tracking-wider border border-cyan-500/20 font-mono">GTX</span>
          </h1>

          <div className="flex items-center gap-1.5 mt-0.5">
            {/* VIP Tier Badge */}
            <div className="flex items-center gap-0.5 bg-cyan-950 border border-cyan-800/40 px-1.5 py-0.5 rounded-full">
              <span className="text-[8px] font-bold text-cyan-400 uppercase tracking-wide">
                {user?.tier || 'Bronze'}
              </span>
            </div>

            {/* Streak Multiplier */}
            <div className="flex items-center gap-0.5 bg-amber-950 border border-amber-800/40 px-1.5 py-0.5 rounded-full">
              <Flame size={8} className="text-amber-400 fill-amber-400/10" />
              <span className="text-[8px] font-bold text-amber-400 tracking-wide font-mono">
                {user?.loginStreak || 0}d Streak
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Shortcuts */}
      <div className="flex items-center gap-2">
        {/* Profile picture button shortcut */}
        <button
          onClick={() => onNavigate('more')}
          className="w-8 h-8 rounded-lg overflow-hidden border border-zinc-700 hover:border-cyan-400 active:scale-95 transition"
        >
          <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
        </button>
      </div>
    </header>
  );
}
