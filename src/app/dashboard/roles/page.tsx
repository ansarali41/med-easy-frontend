'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getRoles, deleteRole, type HospitalRoleDto } from '@/lib/api';
import { useAuth } from '@/lib/use-auth';
import { useToast } from '@/components/toaster';
import { RolesPageSkeleton } from '@/components/skeleton';
import { RoleModal } from './_components/role-modal';

export default function RolesPage() {
  const { user, loading: authLoading } = useAuth();
  const toast = useToast();
  const [roles, setRoles] = useState<HospitalRoleDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<HospitalRoleDto | null>(null);

  useEffect(() => {
    if (authLoading || !user) return;
    loadRoles();
  }, [authLoading, user]);

  async function loadRoles() {
    try {
      const data = await getRoles();
      setRoles(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load roles.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(role: HospitalRoleDto) {
    try {
      await deleteRole(role.id);
      toast.success(`Role "${role.name}" deactivated.`);
      setRoles(prev => prev.filter(r => r.id !== role.id));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to deactivate role.');
    }
  }

  if (authLoading || loading) return <RolesPageSkeleton />;

  const PERM_LABELS: Record<string, string> = {
    branches: 'Branches', staff: 'Staff', patients: 'Patients', appointments: 'Appointments', billing: 'Billing',
  };

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
            <h1 className="text-2xl font-bold text-white">Roles</h1>
            <p className="text-slate-500 text-sm mt-1">Define custom roles and permissions for your staff</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 text-sm font-bold rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
            </svg>
            Create Role
          </button>
        </div>

        {roles.length === 0 ? (
          <div className="text-center py-24">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 mb-4">
              <svg className="w-8 h-8 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <p className="text-white font-semibold mb-1">No roles yet</p>
            <p className="text-slate-500 text-sm">Create roles to assign to your staff members.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {roles.map(role => (
              <div key={role.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
                <div>
                  <h2 className="font-semibold text-white">{role.name}</h2>
                  {role.description && <p className="text-xs text-slate-500 mt-1">{role.description}</p>}
                </div>

                {/* Permission badges */}
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(role.permissions).map(([resource, actions]) => {
                    const enabled = Object.values(actions).some(Boolean);
                    if (!enabled) return null;
                    const actionList = Object.entries(actions).filter(([, v]) => v).map(([k]) => k).join(', ');
                    return (
                      <span key={resource} className="text-xs font-medium text-teal-400 bg-teal-400/10 border border-teal-400/15 px-2 py-0.5 rounded-full">
                        {PERM_LABELS[resource] ?? resource}: {actionList}
                      </span>
                    );
                  })}
                  {Object.values(role.permissions).every(actions => Object.values(actions).every(v => !v)) && (
                    <span className="text-xs text-slate-600">No permissions granted</span>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
                  <button
                    onClick={() => setEditTarget(role)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
                    </svg>
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(role)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-lg transition-colors"
                  >
                    Deactivate
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showCreate && (
        <RoleModal
          onClose={() => setShowCreate(false)}
          onSuccess={() => { setShowCreate(false); loadRoles(); }}
        />
      )}
      {editTarget && (
        <RoleModal
          existing={editTarget}
          onClose={() => setEditTarget(null)}
          onSuccess={() => { setEditTarget(null); loadRoles(); }}
        />
      )}
    </div>
  );
}
