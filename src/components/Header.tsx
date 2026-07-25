import { useState, useRef, useEffect } from 'react';
import { Flame, Globe, ChevronDown, Check, ShieldCheck } from 'lucide-react';
import { User } from '../types';
import ThreeDLogo from './ThreeDLogo';
import { Language, LANGUAGES, getTranslation } from '../translations';

interface HeaderProps {
  user: User | null;
  onNavigate: (screen: string) => void;
  unreadChatCount: number;
  lang?: Language;
  onLanguageChange?: (lang: Language) => void;
}

export default function Header({ 
  user, 
  onNavigate, 
  unreadChatCount,
  lang = 'en',
  onLanguageChange 
}: HeaderProps) {
  const avatarUrl = user?.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user?.email || 'default')}`;
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLangObj = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setLangDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-900 px-4 py-2.5 flex justify-between items-center max-w-md mx-auto">
      {/* Brand Logo & VIP status details */}
      <div className="flex items-center gap-2.5">
        <button 
          onClick={() => onNavigate('dashboard')} 
          className="relative group active:scale-95 transition"
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
            <ThreeDLogo size="sm" showText={false} />
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full border border-zinc-950 shadow-md"></div>
        </button>

        <div>
          <h1 className="text-xs font-bold tracking-tight text-white flex items-center gap-1 uppercase font-mono">
            NGK<span className="text-emerald-400">Ecosystem</span>
            {user?.kycStatus === 'verified' && (
              <span className="inline-flex items-center gap-0.5 bg-emerald-500/10 text-emerald-400 text-[8px] font-extrabold px-1 py-0.2 rounded border border-emerald-500/20 font-mono">
                <ShieldCheck size={10} className="text-emerald-400" />
                VERIFIED
              </span>
            )}
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
                {user?.loginStreak || 0}d {getTranslation(lang, 'streak')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Shortcuts & Language Switcher */}
      <div className="flex items-center gap-2">
        {/* Language Switcher Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            id="language-switcher-btn"
            onClick={() => setLangDropdownOpen(!langDropdownOpen)}
            className="flex items-center gap-1 bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-800 rounded-lg px-2 py-1 text-[10px] font-bold text-zinc-300 font-mono transition active:scale-95"
            title={getTranslation(lang, 'selectLanguage')}
          >
            <span className="text-xs">{currentLangObj.flag}</span>
            <span className="uppercase text-[9px] text-zinc-300 font-black">{currentLangObj.code}</span>
            <ChevronDown size={10} className={`text-zinc-500 transition-transform ${langDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {langDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-36 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl p-1 z-50 divide-y divide-zinc-850 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-2 py-1 text-[8px] font-bold text-zinc-500 uppercase tracking-wider font-mono">
                {getTranslation(lang, 'selectLanguage')}
              </div>
              <div className="py-0.5">
                {LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      if (onLanguageChange) onLanguageChange(l.code);
                      setLangDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 text-[11px] rounded-lg transition text-left font-mono ${
                      lang === l.code 
                        ? 'bg-cyan-500/15 text-cyan-400 font-bold border border-cyan-500/20' 
                        : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{l.flag}</span>
                      <span>{l.nativeName}</span>
                    </div>
                    {lang === l.code && <Check size={12} className="text-cyan-400 shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

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

