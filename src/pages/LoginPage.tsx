import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useLang } from '../context/LangContext';

export default function LoginPage() {
  const { isLoggedIn, loading } = useApp();
  const { lang, setLang, t } = useLang();
  const navigate = useNavigate();

  // If already logged in, redirect to jobs
  useEffect(() => {
    if (!loading && isLoggedIn) {
      navigate('/jobs', { replace: true });
    }
  }, [isLoggedIn, loading, navigate]);

  const handleGoogleLogin = () => {
    window.location.href = '/api/auth/google';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="text-zinc-400 text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg border border-zinc-200 p-10 w-full max-w-sm text-center">
        {/* Lang toggle */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setLang(lang === 'en' ? 'zh' : 'en')}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold border border-zinc-200 hover:bg-zinc-50 text-zinc-600 transition-colors"
          >
            {lang === 'en' ? t('nav_lang_toggle') : t('nav_lang_toggle_en')}
          </button>
        </div>

        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center">
            <span className="text-white text-sm font-bold">ATS</span>
          </div>
          <div className="text-left">
            <div className="text-zinc-800 font-bold text-lg leading-tight">InfStones ATS</div>
            <div className="text-zinc-400 text-xs">Applicant Tracking System</div>
          </div>
        </div>

        <h1 className="text-zinc-800 text-2xl font-semibold mb-2">{t('login_welcome')}</h1>
        <p className="text-zinc-500 text-sm mb-8">{t('login_subtitle')}</p>

        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white border-2 border-zinc-200 hover:border-indigo-300 hover:bg-indigo-50 text-zinc-700 font-medium py-3 px-4 rounded-xl transition-all duration-150 group"
        >
          {/* Google SVG */}
          <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
              fill="#4285F4"
            />
            <path
              d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"
              fill="#34A853"
            />
            <path
              d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z"
              fill="#FBBC05"
            />
            <path
              d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"
              fill="#EA4335"
            />
          </svg>
          {t('login_btn_google')}
        </button>

        <p className="text-zinc-400 text-xs mt-6">{t('login_internal_note')}</p>
      </div>
    </div>
  );
}
