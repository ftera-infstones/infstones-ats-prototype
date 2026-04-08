import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Settings, LogOut, ChevronDown } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLang } from '../context/LangContext';
import logoSrc from '../assets/logo.png';

interface NavbarProps {
  backLink?: { to: string; label: string };
  title?: string;
}

export default function Navbar({ backLink, title }: NavbarProps) {
  const { currentUser, login, logout } = useApp();
  const { lang, setLang, t } = useLang();
  const navigate = useNavigate();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Debug accounts for demo switching
  const DEMO_ACCOUNTS = [
    { id: 'u_admin', name: 'Zhenwu Shi (Admin)', email: 'zhenwu@infstones.com', avatar_initials: 'ZS' },
    { id: 'u_shan', name: 'Shan Guan (Member)', email: 'shan@infstones.com', avatar_initials: 'SG' },
    { id: 'u_melissa', name: 'Melissa DeArce (Member)', email: 'melissa@infstones.com', avatar_initials: 'MD' },
  ];
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setSettingsOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <nav className="bg-white border-b border-zinc-200 px-6 py-3 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-3">
        {backLink && (
          <Link
            to={backLink.to}
            className="text-zinc-500 hover:text-zinc-800 text-sm flex items-center gap-1 mr-2"
          >
            ← {backLink.label}
          </Link>
        )}
        <Link to="/jobs" className="flex items-center gap-2">
          <img src={logoSrc} alt="InfStones" className="w-8 h-8 rounded-lg object-cover" />
          {!backLink && (
            <span className="text-zinc-800 font-semibold text-sm">{t('nav_platform_title')}</span>
          )}
        </Link>
        {title && (
          <>
            <span className="text-zinc-300">/</span>
            <span className="text-zinc-700 font-medium text-sm">{title}</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Language toggle */}
        <button
          onClick={() => setLang(lang === 'en' ? 'zh' : 'en')}
          className="px-2.5 py-1 rounded-lg text-xs font-semibold border border-zinc-200 hover:bg-zinc-50 text-zinc-600 transition-colors"
        >
          {lang === 'en' ? t('nav_lang_toggle') : t('nav_lang_toggle_en')}
        </button>

        {/* Settings dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setSettingsOpen(o => !o)}
            className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-800 text-sm transition-colors"
          >
            <Settings size={15} />
            {t('nav_settings')}
            <ChevronDown size={13} className={`transition-transform ${settingsOpen ? 'rotate-180' : ''}`} />
          </button>
          {settingsOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-48 bg-white border border-zinc-200 rounded-xl shadow-lg py-1 z-50">
              <Link
                to="/settings/stages"
                onClick={() => setSettingsOpen(false)}
                className="block px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors"
              >
                {t('nav_settings_stages')}
              </Link>
              <Link
                to="/interviewers"
                onClick={() => setSettingsOpen(false)}
                className="block px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors"
              >
                {t('nav_settings_interviewers')}
              </Link>
              <Link
                to="/settings/feedback-forms"
                onClick={() => setSettingsOpen(false)}
                className="block px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors"
              >
                {t('nav_settings_feedback_forms')}
              </Link>
              {/* Access Control — Admin only */}
              {['zhenwu@infstones.com'].includes(currentUser?.email ?? '') && (
                <Link
                  to="/settings/access-control"
                  onClick={() => setSettingsOpen(false)}
                  className="block px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors"
                >
                  {t('access_control_title')}
                </Link>
              )}
            </div>
          )}
        </div>

        {currentUser && (
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen(o => !o)}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-semibold">
                {currentUser.avatar_initials}
              </div>
              <span className="text-zinc-600 text-sm hidden sm:block">{currentUser.name}</span>
              <ChevronDown size={12} className={`text-zinc-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
            </button>
            {userMenuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-56 bg-white border border-zinc-200 rounded-xl shadow-lg py-1 z-50">
                <p className="text-[10px] text-zinc-400 px-3 py-1.5 font-medium uppercase tracking-wider border-b border-zinc-100">🛠 Debug: Switch Account</p>
                {DEMO_ACCOUNTS.map(acc => (
                  <button
                    key={acc.id}
                    onClick={() => { login(acc); setUserMenuOpen(false); }}
                    className={`w-full text-left flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-zinc-50 transition-colors ${currentUser.email === acc.email ? 'text-indigo-600 font-semibold bg-indigo-50' : 'text-zinc-700'}`}
                  >
                    <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                      {acc.avatar_initials}
                    </div>
                    <div>
                      <p className="leading-tight">{acc.name}</p>
                      <p className="text-[10px] text-zinc-400">{acc.email}</p>
                    </div>
                    {currentUser.email === acc.email && <span className="ml-auto text-xs">✓</span>}
                  </button>
                ))}
                <div className="border-t border-zinc-100 mt-1 pt-1">
                  <button
                    onClick={() => { handleLogout(); setUserMenuOpen(false); }}
                    className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={14} />
                    {t('nav_logout')}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
