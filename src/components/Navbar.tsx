import { Home, LineChart, Copy, Coins, Users, User } from 'lucide-react';
import { motion } from 'motion/react';

interface NavbarProps {
  currentScreen: string;
  onNavigate: (screen: string) => void;
  unreadCount?: number;
}

export default function Navbar({ currentScreen, onNavigate }: NavbarProps) {
  const navItems = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'market', label: 'Market', icon: LineChart },
    { id: 'copyTrade', label: 'Copy', icon: Copy },
    { id: 'refer', label: 'Refer', icon: Users },
    { id: 'more', label: 'Profile', icon: User }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/90 backdrop-blur-md border-t border-zinc-900 px-4 py-2.5 max-w-md mx-auto shadow-md">
      <div className="flex justify-around items-center">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentScreen === item.id || 
            (item.id === 'more' && ['more', 'history', 'leaderboard'].includes(currentScreen));

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="relative flex flex-col items-center justify-center py-1 px-3 transition-colors outline-none group"
            >
              <div className="relative">
                <Icon
                  size={18}
                  className={`transition-transform duration-200 ${
                    isActive
                      ? 'text-cyan-400 scale-105'
                      : 'text-zinc-500 group-hover:text-zinc-350'
                  }`}
                />
                
                {/* Active plain dot indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-1 h-1 bg-cyan-400 rounded-full"
                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  />
                )}
              </div>

              <span
                className={`text-[9px] mt-1.5 font-bold tracking-wider transition-colors duration-200 uppercase font-mono ${
                  isActive ? 'text-cyan-400' : 'text-zinc-500 group-hover:text-zinc-400'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
