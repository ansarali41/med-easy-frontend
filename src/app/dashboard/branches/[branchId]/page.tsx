'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getBranches, getStaff, getPatients, toggleLoginAccess, type BranchDto, type UserDto } from '@/lib/api';
import { useAuth } from '@/lib/use-auth';
import { useToast } from '@/components/toaster';
import { BranchDetailSkeleton } from '@/components/skeleton';
import { CreateStaffModal } from './_components/create-staff-modal';
import { CreatePatientModal } from './_components/create-patient-modal';

type Tab = 'staff' | 'patients';

const INPUT = 'w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 text-white text-sm rounded-lg placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition';
const LABEL = 'block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5';

export default function BranchDetailPage() {
  const { branchId } = useParams<{ branchId: string }>();
  const { user, loading: authLoading } = useAuth();
  const toast = useToast();

  const [branch, setBranch] = useState<BranchDto | null>(null);
  const [staff, setStaff] = useState<UserDto[]>([]);
  const [patients, setPatients] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('staff');
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [showAddPatient, setShowAddPatient] = useState(false);

  // Enable login modal state
  const [enableLoginUser, setEnableLoginUser] = useState<UserDto | null>(null);
  const [enableEmail, setEnableEmail] = useState('');
  const [enablePassword, setEnablePassword] = useState('');
  const [togglingLogin, setTogglingLogin] = useState(false);

  useEffect(() => {
    if (authLoading || !user) return;
    loadData();
  }, [authLoading, user]);

  async function loadData() {
    try {
      const [branches, staffData, patientsData] = await Promise.all([
        getBranches(),
        getStaff(branchId),
        getPatients(branchId),
      ]);
      const found = branches.find(b => b.id === branchId) ?? null;
      setBranch(found);
      setStaff(staffData);
      setPatients(patientsData);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load branch data.');
    } finally {
      setLoading(false);
    }
  }

  async function reloadStaff() {
    const data = await getStaff(branchId);
    setStaff(data);
  }

  async function reloadPatients() {
    const data = await getPatients(branchId);
    setPatients(data);
  }

  async function handleDisableLogin(userId: string) {
    if (!confirm('Disable login for this user? They will no longer be able to sign in.')) return;
    try {
      const updated = await toggleLoginAccess(userId, { canLogin: false });
      setStaff(prev => prev.map(u => u.id === updated.id ? updated : u));
      setPatients(prev => prev.map(u => u.id === updated.id ? updated : u));
      toast.success('Login access disabled.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to disable login.');
    }
  }

  async function handleEnableLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!enableLoginUser) return;
    setTogglingLogin(true);
    try {
      const updated = await toggleLoginAccess(enableLoginUser.id, {
        canLogin: true,
        email: enableEmail || undefined,
        password: enablePassword,
      });
      setStaff(prev => prev.map(u => u.id === updated.id ? updated : u));
      setPatients(prev => prev.map(u => u.id === updated.id ? updated : u));
      toast.success('Login access enabled.');
      setEnableLoginUser(null);
      setEnableEmail('');
      setEnablePassword('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to enable login.');
    } finally {
      setTogglingLogin(false);
    }
  }

  if (authLoading || loading) return <BranchDetailSkeleton />;

  if (!branch) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white font-semibold mb-2">Branch not found</p>
          <Link href="/dashboard/branches" className="text-teal-400 text-sm hover:underline">Back to branches</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Navbar */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-teal-500/15 border border-teal-500/25">
              <svg className="w-5 h-5 text-teal-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14v-4H8v-2h4V7h2v4h4v2h-4v4h-2z" />
              </svg>
            </div>
            <span className="font-bold text-white text-base tracking-tight">Med-Easy</span>
          </div>
          <Link href="/dashboard/branches" className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-400 hover:text-white hover:bg-slate-700/60 rounded-lg transition-colors">
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
            </svg>
            Branches
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Branch header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-white">{branch.name}</h1>
            {branch.isMainBranch && (
              <span className="text-xs font-semibold text-teal-400 bg-teal-400/10 border border-teal-400/20 px-2.5 py-1 rounded-full">Main Branch</span>
            )}
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${branch.isActive ? 'text-teal-400 bg-teal-400/10 border-teal-400/20' : 'text-slate-500 bg-slate-800 border-slate-700'}`}>
              {branch.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          <p className="text-slate-400 text-sm">{[branch.address, branch.city].filter(Boolean).join(', ')}</p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6 border-b border-slate-800">
          {(['staff', 'patients'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
                tab === t ? 'text-teal-400 border-teal-400' : 'text-slate-500 border-transparent hover:text-slate-300'
              }`}
            >
              {t} ({t === 'staff' ? staff.length : patients.length})
            </button>
          ))}
          <div className="ml-auto pb-2">
            {tab === 'staff' ? (
              <button
                onClick={() => setShowAddStaff(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-teal-400 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/20 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                </svg>
                Add Staff
              </button>
            ) : (
              <button
                onClick={() => setShowAddPatient(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-teal-400 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/20 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                </svg>
                Add Patient
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        {tab === 'staff' && (
          staff.length === 0 ? (
            <EmptyState icon="staff" label="No staff members yet" sub="Add doctors, nurses, or other staff to this branch." />
          ) : (
            <UserTable users={staff} onDisableLogin={handleDisableLogin} onEnableLogin={setEnableLoginUser} />
          )
        )}
        {tab === 'patients' && (
          patients.length === 0 ? (
            <EmptyState icon="patient" label="No patients yet" sub="Add patients assigned to this branch." />
          ) : (
            <UserTable users={patients} onDisableLogin={handleDisableLogin} onEnableLogin={setEnableLoginUser} />
          )
        )}
      </main>

      {showAddStaff && (
        <CreateStaffModal
          branchId={branchId}
          onClose={() => setShowAddStaff(false)}
          onSuccess={() => { setShowAddStaff(false); reloadStaff(); }}
        />
      )}
      {showAddPatient && (
        <CreatePatientModal
          branchId={branchId}
          onClose={() => setShowAddPatient(false)}
          onSuccess={() => { setShowAddPatient(false); reloadPatients(); }}
        />
      )}

      {/* Enable Login modal */}
      {enableLoginUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <h2 className="font-semibold text-white">Enable Login</h2>
              <button onClick={() => setEnableLoginUser(null)} className="text-slate-500 hover:text-slate-300 transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleEnableLogin}>
              <div className="p-6 space-y-4">
                <p className="text-sm text-slate-400">
                  Enabling login for <span className="text-white font-medium">{enableLoginUser.firstName} {enableLoginUser.lastName}</span>.
                </p>
                {!enableLoginUser.email && (
                  <div>
                    <label className={LABEL}>Email *</label>
                    <input
                      type="email"
                      className={INPUT}
                      value={enableEmail}
                      onChange={e => setEnableEmail(e.target.value)}
                      placeholder="user@hospital.com"
                      required
                    />
                  </div>
                )}
                <div>
                  <label className={LABEL}>Set Password *</label>
                  <input
                    type="password"
                    className={INPUT}
                    value={enablePassword}
                    onChange={e => setEnablePassword(e.target.value)}
                    placeholder="Min 8 characters"
                    minLength={8}
                    required
                  />
                </div>
              </div>
              <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setEnableLoginUser(null)} className="px-4 py-2.5 text-sm text-slate-400 hover:text-white border border-slate-700 hover:border-slate-600 rounded-lg transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={togglingLogin} className="px-6 py-2.5 bg-teal-500 hover:bg-teal-400 disabled:bg-teal-500/40 disabled:cursor-not-allowed text-slate-950 text-sm font-bold rounded-lg transition-colors">
                  {togglingLogin ? 'Enabling...' : 'Enable Login'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function UserTable({
  users,
  onDisableLogin,
  onEnableLogin,
}: {
  users: UserDto[];
  onDisableLogin: (userId: string) => void;
  onEnableLogin: (user: UserDto) => void;
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-800">
            <th className="text-left px-5 py-3.5 text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
            <th className="text-left px-5 py-3.5 text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
            <th className="text-left px-5 py-3.5 text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
            <th className="text-left px-5 py-3.5 text-xs font-medium text-slate-500 uppercase tracking-wider">Login</th>
            <th className="text-right px-5 py-3.5 text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {users.map(u => (
            <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
              <td className="px-5 py-3.5 text-white font-medium">{u.firstName} {u.lastName}</td>
              <td className="px-5 py-3.5 text-slate-400">{u.email ?? <span className="text-slate-600 italic">none</span>}</td>
              <td className="px-5 py-3.5">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${u.isActive ? 'text-teal-400 bg-teal-400/10 border-teal-400/20' : 'text-slate-500 bg-slate-800 border-slate-700'}`}>
                  {u.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="px-5 py-3.5">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${u.canLogin ? 'text-violet-400 bg-violet-400/10 border-violet-400/20' : 'text-slate-500 bg-slate-800 border-slate-700'}`}>
                  {u.canLogin ? 'Enabled' : 'No Login'}
                </span>
              </td>
              <td className="px-5 py-3.5 text-right">
                {u.canLogin ? (
                  <button
                    onClick={() => onDisableLogin(u.id)}
                    className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20 transition-colors"
                  >
                    Disable Login
                  </button>
                ) : (
                  <button
                    onClick={() => onEnableLogin(u)}
                    className="text-xs text-teal-400 hover:text-teal-300 hover:bg-teal-500/10 px-2.5 py-1 rounded-lg border border-teal-500/20 transition-colors"
                  >
                    Enable Login
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EmptyState({ icon, label, sub }: { icon: string; label: string; sub: string }) {
  return (
    <div className="text-center py-16">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 mb-4">
        <svg className="w-7 h-7 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
      </div>
      <p className="text-white font-semibold mb-1">{label}</p>
      <p className="text-slate-500 text-sm">{sub}</p>
    </div>
  );
}
