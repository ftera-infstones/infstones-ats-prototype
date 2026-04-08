import { useState } from 'react';
import { Shield, Plus, X, Lock } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useLang } from '../context/LangContext';
import { useApp } from '../context/AppContext';

const ADMIN_EMAILS = ['zhenwu@infstones.com'];

type Role = 'Admin' | 'Member';
type Base = 'US' | 'CHN';

interface Member {
  email: string;
  role: Role;
  base?: Base;
}

const INITIAL_MEMBERS: Member[] = [
  { email: 'zhenwu@infstones.com', role: 'Admin' },
  { email: 'shan@infstones.com', role: 'Member', base: 'CHN' },
  { email: 'melissa@infstones.com', role: 'Member', base: 'US' },
];

export default function AccessControlPage() {
  const { t } = useLang();
  const { currentUser } = useApp();
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [addEmail, setAddEmail] = useState('');
  const [addRole, setAddRole] = useState<Role>('Member');
  const [addBase, setAddBase] = useState<Base>('US');
  const [addOpen, setAddOpen] = useState(false);

  const isAdmin = ADMIN_EMAILS.includes(currentUser?.email ?? '');

  // Non-admin: redirect to home
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-zinc-50">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-64 gap-3 text-zinc-400">
          <Lock size={32} />
          <p className="text-sm">Access restricted to Admins only.</p>
        </div>
      </div>
    );
  }

  const handleAdd = () => {
    const email = addEmail.trim().toLowerCase();
    if (!email) return;
    if (members.some(m => m.email === email)) return;
    setMembers(prev => [...prev, { email, role: addRole, location: addRole === 'Member' ? addBase : undefined }]);
    setAddEmail('');
    setAddRole('Member');
    setAddBase('US');
    setAddOpen(false);
  };

  const handleRemove = (email: string) => {
    const isLastAdmin = members.filter(m => m.role === 'Admin').length === 1 && members.find(m => m.email === email)?.role === 'Admin';
    if (isLastAdmin) return;
    setMembers(prev => prev.filter(m => m.email !== email));
  };

  const handleRoleChange = (email: string, role: Role) => {
    setMembers(prev => prev.map(m => m.email === email ? { ...m, role } : m));
  };

  const handleBaseChange = (email: string, base: Base) => {
    setMembers(prev => prev.map(m => m.email === email ? { ...m, base } : m));
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      <Navbar backLink={{ to: '/settings/stages', label: t('nav_settings') }} title={t('access_control_title')} />

      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-indigo-500" />
              <h2 className="text-sm font-semibold text-zinc-800">{t('access_control_members')}</h2>
            </div>
            {isAdmin && (
              <button
                onClick={() => setAddOpen(true)}
                className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Plus size={13} />
                {t('access_control_add_btn')}
              </button>
            )}
          </div>

          <p className="text-xs text-zinc-400 px-6 py-2 border-b border-zinc-100">{t('access_control_description')}</p>

          {/* Members table */}
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-zinc-400 bg-zinc-50 border-b border-zinc-100">
                <th className="text-left px-6 py-2.5 font-medium">{t('access_control_email')}</th>
                <th className="text-left px-6 py-2.5 font-medium">{t('access_control_role')}</th>
                <th className="text-left px-6 py-2.5 font-medium">Base</th>
                {isAdmin && <th className="text-left px-6 py-2.5 font-medium">{t('access_control_actions')}</th>}
              </tr>
            </thead>
            <tbody>
              {members.map((m, idx) => {
                const isCurrentAdmin = m.role === 'Admin' && members.filter(x => x.role === 'Admin').length === 1;
                return (
                  <tr key={m.email} className={`border-b border-zinc-100 ${idx % 2 === 0 ? '' : 'bg-zinc-50/40'}`}>
                    <td className="px-6 py-3 text-zinc-700">{m.email}</td>
                    <td className="px-6 py-3">
                      {isAdmin ? (
                        <select
                          value={m.role}
                          onChange={e => handleRoleChange(m.email, e.target.value as Role)}
                          disabled={isCurrentAdmin}
                          className="border border-zinc-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          <option value="Admin">{t('access_control_admin')}</option>
                          <option value="Member">{t('access_control_recruiter')}</option>
                        </select>
                      ) : (
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${m.role === 'Admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-zinc-100 text-zinc-600'}`}>
                          {m.role === 'Admin' ? t('access_control_admin') : t('access_control_recruiter')}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3">
                      {m.role === 'Member' ? (
                        isAdmin ? (
                          <select
                            value={m.base ?? 'US'}
                            onChange={e => handleBaseChange(m.email, e.target.value as Base)}
                            className="border border-zinc-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400"
                          >
                            <option value="US">US</option>
                            <option value="CHN">CHN</option>
                          </select>
                        ) : (
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${m.base === 'US' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                            {m.base ?? '—'}
                          </span>
                        )
                      ) : (
                        <span className="text-zinc-300 text-xs">—</span>
                      )}
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-3">
                        <button
                          onClick={() => handleRemove(m.email)}
                          disabled={isCurrentAdmin}
                          className="text-xs text-red-500 hover:text-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                          {t('access_control_remove')}
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Member Modal */}
      {addOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-zinc-900">{t('access_control_add_member')}</h2>
              <button onClick={() => setAddOpen(false)} className="text-zinc-400 hover:text-zinc-700"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-zinc-700 block mb-1.5">{t('access_control_email')}</label>
                <input
                  type="email"
                  value={addEmail}
                  onChange={e => setAddEmail(e.target.value)}
                  placeholder="name@infstones.com"
                  className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-zinc-700 block mb-1.5">{t('access_control_role')}</label>
                <select
                  value={addRole}
                  onChange={e => setAddRole(e.target.value as Role)}
                  className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  <option value="Admin">{t('access_control_admin')}</option>
                  <option value="Member">{t('access_control_recruiter')}</option>
                </select>
              </div>
              {addRole === 'Member' && (
                <div>
                  <label className="text-sm font-medium text-zinc-700 block mb-1.5">Base</label>
                  <select
                    value={addBase}
                    onChange={e => setAddBase(e.target.value as Base)}
                    className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  >
                    <option value="US">US</option>
                    <option value="CHN">CHN</option>
                  </select>
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setAddOpen(false)} className="flex-1 py-2.5 rounded-lg border border-zinc-200 text-zinc-600 text-sm font-medium hover:bg-zinc-50">
                {t('access_control_cancel')}
              </button>
              <button
                onClick={handleAdd}
                disabled={!addEmail.trim()}
                className="flex-1 py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white text-sm font-medium transition-colors"
              >
                {t('access_control_save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
