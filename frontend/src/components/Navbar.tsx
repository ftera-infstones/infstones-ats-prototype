import { Link, useNavigate } from 'react-router-dom';
import { Settings, LogOut } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface NavbarProps {
  backLink?: { to: string; label: string };
  title?: string;
}

export default function Navbar({ backLink, title }: NavbarProps) {
  const { currentUser, logout } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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
          <div className="w-7 h-7 bg-indigo-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">ATS</span>
          </div>
          {!backLink && (
            <span className="text-zinc-800 font-semibold text-sm">InfStones ATS</span>
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
        <Link
          to="/settings/stages"
          className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-800 text-sm transition-colors"
        >
          <Settings size={15} />
          Settings
        </Link>

        {currentUser && (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-semibold">
              {currentUser.avatar_initials}
            </div>
            <span className="text-zinc-600 text-sm hidden sm:block">{currentUser.name}</span>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-zinc-500 hover:text-red-500 text-sm transition-colors"
        >
          <LogOut size={15} />
          <span className="hidden sm:block">Logout</span>
        </button>
      </div>
    </nav>
  );
}
