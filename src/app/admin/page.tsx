'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import {
  getAdminHospitals,
  setHospitalStatus,
  type HospitalDto,
  type HospitalStatus,
  type HospitalsPageDto,
} from '@/lib/api';
import { useToast } from '@/components/toaster';
import { AdminPageSkeleton } from '@/components/skeleton';
import { RegisterHospitalModal } from './_components/register-hospital-modal';
import { EditHospitalModal } from './_components/edit-hospital-modal';

type TabFilter = 'all' | HospitalStatus;

const PAGE_SIZE = 12;

const STATUS_LABEL: Record<number, string> = { 1: 'Active', 0: 'Inactive' };
const STATUS_STYLE: Record<number, string> = {
  1: 'text-teal-400 bg-teal-400/10 border-teal-400/20',
  0: 'text-slate-500 bg-slate-800 border-slate-700',
};

export default function AdminPage() {
  const router = useRouter();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [adminName, setAdminName] = useState('');

  const [page, setPage] = useState(1);
  const [tab, setTab] = useState<TabFilter>('all');
  const [pageData, setPageData] = useState<HospitalsPageDto | null>(null);

  const [showRegister, setShowRegister] = useState(false);
  const [editTarget, setEditTarget] = useState<HospitalDto | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user || data.user.user_metadata?.role !== 'super_admin') {
        router.replace('/login');
        return;
      }
      const first = data.user.user_metadata?.first_name ?? '';
      const last = data.user.user_metadata?.last_name ?? '';
      setAdminName(`${first} ${last}`.trim() || (data.user.email ?? ''));
    });
  }, [router]);

  const loadHospitals = useCallback(async (p: number, t: TabFilter) => {
    setLoading(true);
    try {
      const result = await getAdminHospitals({
        page: p,
        limit: PAGE_SIZE,
        status: t === 'all' ? undefined : t,
      });
      setPageData(result);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load hospitals.');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void loadHospitals(page, tab);
  }, [page, tab, loadHospitals]);

  function handleTabChange(t: TabFilter) {
    setTab(t);
    setPage(1);
  }

  async function handleSetStatus(hospital: HospitalDto, status: HospitalStatus) {
    setUpdatingId(hospital.id);
    try {
      await setHospitalStatus(hospital.id, status);
      const label = STATUS_LABEL[status] ?? 'Updated';
      toast.success(`${hospital.name} set to ${label}.`);
      void loadHospitals(page, tab);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update status.');
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace('/login');
  }

  const hospitals = pageData?.data ?? [];
  const totalPages = pageData?.totalPages ?? 1;
  const totalAll = (pageData?.activeCount ?? 0) + (pageData?.inactiveCount ?? 0);

  const tabs: { key: TabFilter; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: totalAll },
    { key: 1, label: 'Active', count: pageData?.activeCount ?? 0 },
    { key: 0, label: 'Inactive', count: pageData?.inactiveCount ?? 0 },
  ];

  if (loading && !pageData) return <AdminPageSkeleton />;

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
            <div>
              <span className="font-bold text-white text-base tracking-tight">Med-Easy</span>
              <span className="ml-2 text-xs font-medium text-violet-400 bg-violet-400/10 border border-violet-400/20 px-2 py-0.5 rounded-full">Super Admin</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400 hidden sm:block">{adminName}</span>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-400 hover:text-white hover:bg-slate-700/60 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
              </svg>
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Header row */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Hospitals</h1>
            <p className="text-slate-500 text-sm mt-1">
              {totalAll} registered {totalAll === 1 ? 'hospital' : 'hospitals'}
            </p>
          </div>
          <button
            onClick={() => setShowRegister(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 text-sm font-bold rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
            </svg>
            Register Hospital
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1 mb-6 bg-slate-900 border border-slate-800 rounded-xl p-1 w-fit">
          {tabs.map(t => (
            <button
              key={String(t.key)}
              onClick={() => handleTabChange(t.key)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                tab === t.key
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {t.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                tab === t.key
                  ? t.key === 1 ? 'bg-teal-500/20 text-teal-400'
                  : t.key === 0 ? 'bg-slate-600 text-slate-300'
                  : 'bg-slate-600 text-slate-300'
                  : 'bg-slate-800 text-slate-500'
              }`}>
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-5 animate-pulse">
                <div className="flex items-start justify-between mb-4">
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-slate-800 rounded w-2/3" />
                    <div className="h-3 bg-slate-800 rounded w-1/3" />
                  </div>
                  <div className="h-6 bg-slate-800 rounded-full w-16" />
                </div>
                <div className="space-y-2 mb-4">
                  <div className="h-3 bg-slate-800 rounded w-1/2" />
                  <div className="h-3 bg-slate-800 rounded w-2/3" />
                </div>
                <div className="flex gap-2 pt-3 border-t border-slate-800">
                  <div className="h-8 bg-slate-800 rounded-lg flex-1" />
                  <div className="h-8 bg-slate-800 rounded-lg flex-1" />
                </div>
              </div>
            ))}
          </div>
        ) : hospitals.length === 0 ? (
          <div className="text-center py-24">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 mb-4">
              <svg className="w-8 h-8 text-slate-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14v-4H8v-2h4V7h2v4h4v2h-4v4h-2z" />
              </svg>
            </div>
            <p className="text-white font-semibold mb-1">
              {tab === 'all' ? 'No hospitals yet' : `No ${STATUS_LABEL[tab as number] ?? ''} hospitals`}
            </p>
            <p className="text-slate-500 text-sm">
              {tab === 'all' ? 'Register the first hospital to get started.' : `No hospitals with this status.`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {hospitals.map(hospital => (
              <div key={hospital.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="font-semibold text-white truncate">{hospital.name}</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {[hospital.city, hospital.country].filter(Boolean).join(', ') || 'No location'}
                    </p>
                  </div>
                  <span className={`flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_STYLE[hospital.status]}`}>
                    {STATUS_LABEL[hospital.status]}
                  </span>
                </div>

                <div className="space-y-1.5 text-sm text-slate-400">
                  {hospital.type && <p><span className="text-slate-600">Type:</span> {hospital.type}</p>}
                  {hospital.phone && <p><span className="text-slate-600">Phone:</span> {hospital.phone}</p>}
                  {hospital.email && <p><span className="text-slate-600">Email:</span> {hospital.email}</p>}
                </div>

                <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
                  <button
                    onClick={() => setEditTarget(hospital)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
                      <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
                    </svg>
                    Edit
                  </button>

                  {/* Status actions — show only the transitions that make sense */}
                  {hospital.status !== 1 && (
                    <button
                      onClick={() => handleSetStatus(hospital, 1)}
                      disabled={updatingId === hospital.id}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-teal-400 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Activate
                    </button>
                  )}
                  {hospital.status !== 0 && (
                    <button
                      onClick={() => handleSetStatus(hospital, 0)}
                      disabled={updatingId === hospital.id}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Deactivate
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-800">
            <p className="text-sm text-slate-500">
              Page {page} of {totalPages} &middot; {pageData?.total ?? 0} total
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                </svg>
                Prev
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .reduce<(number | '...')[]>((acc, p, i, arr) => {
                  if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('...');
                  acc.push(p);
                  return acc;
                }, [])
                .map((item, i) =>
                  item === '...' ? (
                    <span key={`e-${i}`} className="px-2 text-slate-600 text-sm">…</span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => setPage(item as number)}
                      className={`w-8 h-8 text-sm rounded-lg transition-colors ${
                        page === item ? 'bg-teal-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      {item}
                    </button>
                  )
                )}

              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </main>

      {showRegister && (
        <RegisterHospitalModal
          onClose={() => setShowRegister(false)}
          onSuccess={() => { setShowRegister(false); void loadHospitals(page, tab); }}
        />
      )}

      {editTarget && (
        <EditHospitalModal
          hospital={editTarget}
          onClose={() => setEditTarget(null)}
          onSuccess={() => { setEditTarget(null); void loadHospitals(page, tab); }}
        />
      )}
    </div>
  );
}
