'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { useToast } from '@/components/toaster';
import { ProfileSkeleton } from '@/components/skeleton';
import type { User } from '@supabase/supabase-js';

export default function ProfilePage() {
  const router = useRouter();
  const toast = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.replace('/login'); return; }
      setUser(data.user);
      setFirstName(data.user.user_metadata?.first_name ?? '');
      setLastName(data.user.user_metadata?.last_name ?? '');
      setLoading(false);
    });
  }, [router]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        data: { first_name: firstName, last_name: lastName },
      });
      if (error) throw new Error(error.message);
      toast.success('Profile updated successfully.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace('/login');
  }

  if (loading) return <ProfileSkeleton />;

  const initials = `${firstName.charAt(0)}${lastName.charAt(0) || ''}`.toUpperCase() || user?.email?.charAt(0).toUpperCase() || '?';

  const INPUT = 'w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 text-white text-sm rounded-lg placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition';

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
          <Link href="/dashboard" className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-400 hover:text-white hover:bg-slate-700/60 rounded-lg transition-colors">
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
            </svg>
            Back to dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12">
        {/* Avatar + name */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-2xl shadow-teal-500/20 mb-4">
            <span className="text-slate-950 text-3xl font-bold">{initials}</span>
          </div>
          <h1 className="text-xl font-bold text-white">{firstName} {lastName}</h1>
          <p className="text-slate-500 text-sm mt-1">{user?.email}</p>
          <span className="inline-block mt-2 text-xs font-medium text-teal-400 bg-teal-400/10 border border-teal-400/20 px-3 py-1 rounded-full">
            {user?.user_metadata?.role === 'super_admin' ? 'Super Admin' : user?.user_metadata?.role === 'hospital_admin' ? 'Hospital Admin' : (user?.user_metadata?.role ?? 'Staff')}
          </span>
        </div>

        {/* Edit form */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800">
            <h2 className="font-semibold text-white">Personal information</h2>
            <p className="text-xs text-slate-500 mt-0.5">Update your name and account details</p>
          </div>

          <form onSubmit={handleSave} className="p-6 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">First name</label>
                <input type="text" className={INPUT} value={firstName}
                  onChange={(e) => setFirstName(e.target.value)} placeholder="John" required />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">Last name</label>
                <input type="text" className={INPUT} value={lastName}
                  onChange={(e) => setLastName(e.target.value)} placeholder="Smith" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">Email address</label>
              <input type="email" className={`${INPUT} opacity-60 cursor-not-allowed`} value={user?.email ?? ''} disabled />
              <p className="text-xs text-slate-600">Email address cannot be changed here.</p>
            </div>

            <div className="pt-2 flex justify-end">
              <button type="submit" disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-teal-500 hover:bg-teal-400 disabled:bg-teal-500/40 disabled:cursor-not-allowed text-slate-950 text-sm font-bold rounded-lg transition-colors">
                {saving ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Danger zone */}
        <div className="mt-6 bg-slate-800 border border-rose-500/20 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800">
            <h2 className="font-semibold text-rose-400">Session</h2>
            <p className="text-xs text-slate-500 mt-0.5">Manage your active session</p>
          </div>
          <div className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Sign out of Med-Easy</p>
              <p className="text-xs text-slate-500 mt-0.5">You will be redirected to the login page</p>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 hover:text-rose-300 text-sm font-semibold rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
              </svg>
              Sign out
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
