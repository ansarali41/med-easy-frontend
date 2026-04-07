'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getBranches, createBranch, type BranchDto } from '@/lib/api';
import { useAuth } from '@/lib/use-auth';
import { useToast } from '@/components/toaster';
import { BranchListSkeleton } from '@/components/skeleton';
import { CreateBranchModal } from './_components/create-branch-modal';

export default function BranchesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const toast = useToast();
  const [branches, setBranches] = useState<BranchDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) return;
    loadBranches();
  }, [authLoading, user]);

  async function loadBranches() {
    try {
      const data = await getBranches();
      setBranches(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load branches.');
    } finally {
      setLoading(false);
    }
  }

  if (authLoading || loading) return <BranchListSkeleton />;

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
            Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Branches</h1>
            <p className="text-slate-500 text-sm mt-1">{branches.length} {branches.length === 1 ? 'branch' : 'branches'}</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 text-sm font-bold rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
            </svg>
            Add Branch
          </button>
        </div>

        {branches.length === 0 ? (
          <div className="text-center py-24">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 mb-4">
              <svg className="w-8 h-8 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
              </svg>
            </div>
            <p className="text-white font-semibold mb-1">No branches yet</p>
            <p className="text-slate-500 text-sm">Add your first branch to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {branches.map(branch => (
              <Link
                key={branch.id}
                href={`/dashboard/branches/${branch.id}`}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 flex flex-col gap-3 transition-colors group"
              >
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-semibold text-white group-hover:text-teal-400 transition-colors">{branch.name}</h2>
                  {branch.isMainBranch && (
                    <span className="flex-shrink-0 text-xs font-semibold text-teal-400 bg-teal-400/10 border border-teal-400/20 px-2 py-0.5 rounded-full">Main</span>
                  )}
                </div>
                <div className="space-y-1 text-sm text-slate-400">
                  {branch.city && <p>{branch.city}</p>}
                  {branch.phone && <p>{branch.phone}</p>}
                  {branch.email && <p className="truncate">{branch.email}</p>}
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-500">
                  <span className={`font-medium ${branch.isActive ? 'text-teal-500' : 'text-slate-600'}`}>
                    {branch.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <span className="flex items-center gap-1 text-slate-400 group-hover:text-teal-400 transition-colors">
                    View branch
                    <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {showCreate && (
        <CreateBranchModal
          onClose={() => setShowCreate(false)}
          onSuccess={() => { setShowCreate(false); loadBranches(); }}
        />
      )}
    </div>
  );
}
