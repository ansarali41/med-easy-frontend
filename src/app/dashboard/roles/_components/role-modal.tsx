'use client';

import { useState } from 'react';
import { createRole, updateRole, type HospitalRoleDto } from '@/lib/api';
import { useToast } from '@/components/toaster';

type Resource = { key: string; label: string };
type Action = { key: string; label: string };

const RESOURCES: Resource[] = [
  { key: 'branches', label: 'Branches' },
  { key: 'staff', label: 'Staff' },
  { key: 'patients', label: 'Patients' },
  { key: 'appointments', label: 'Appointments' },
  { key: 'billing', label: 'Billing' },
];

const ACTIONS: Action[] = [
  { key: 'view', label: 'View' },
  { key: 'create', label: 'Create' },
  { key: 'edit', label: 'Edit' },
];

function defaultPermissions(): Record<string, Record<string, boolean>> {
  const p: Record<string, Record<string, boolean>> = {};
  for (const r of RESOURCES) {
    p[r.key] = {};
    for (const a of ACTIONS) {
      p[r.key][a.key] = false;
    }
  }
  return p;
}

interface Props {
  existing?: HospitalRoleDto;
  onClose: () => void;
  onSuccess: () => void;
}

const INPUT = 'w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 text-white text-sm rounded-lg placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition';
const LABEL = 'block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5';

export function RoleModal({ existing, onClose, onSuccess }: Props) {
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(existing?.name ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [permissions, setPermissions] = useState<Record<string, Record<string, boolean>>>(
    existing?.permissions && Object.keys(existing.permissions).length > 0
      ? existing.permissions
      : defaultPermissions(),
  );

  function toggle(resource: string, action: string) {
    setPermissions(prev => ({
      ...prev,
      [resource]: {
        ...prev[resource],
        [action]: !prev[resource]?.[action],
      },
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (existing) {
        await updateRole(existing.id, { name, description: description || undefined, permissions });
        toast.success('Role updated successfully.');
      } else {
        await createRole({ name, description: description || undefined, permissions });
        toast.success('Role created successfully.');
      }
      onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save role.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-white">{existing ? 'Edit Role' : 'Create Role'}</h2>
            <p className="text-xs text-slate-500 mt-0.5">Define permissions for this role</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[75vh]">
          <div className="p-6 space-y-5">
            <div>
              <label className={LABEL}>Role Name *</label>
              <input type="text" className={INPUT} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Head Nurse, Receptionist" required />
            </div>
            <div>
              <label className={LABEL}>Description</label>
              <input type="text" className={INPUT} value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief description of this role" />
            </div>

            {/* Permissions table */}
            <div>
              <label className={LABEL}>Permissions</label>
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Resource</th>
                      {ACTIONS.map(a => (
                        <th key={a.key} className="text-center px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">{a.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {RESOURCES.map(r => (
                      <tr key={r.key} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-4 py-3 text-slate-300 font-medium">{r.label}</td>
                        {ACTIONS.map(a => (
                          <td key={a.key} className="px-4 py-3 text-center">
                            <button
                              type="button"
                              onClick={() => toggle(r.key, a.key)}
                              className={`w-5 h-5 rounded flex items-center justify-center mx-auto transition-colors border ${
                                permissions[r.key]?.[a.key]
                                  ? 'bg-teal-500 border-teal-500 text-slate-950'
                                  : 'bg-slate-700 border-slate-600 text-transparent'
                              }`}
                            >
                              <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm text-slate-400 hover:text-white border border-slate-700 hover:border-slate-600 rounded-lg transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="px-6 py-2.5 bg-teal-500 hover:bg-teal-400 disabled:bg-teal-500/40 disabled:cursor-not-allowed text-slate-950 text-sm font-bold rounded-lg transition-colors">
              {saving ? 'Saving...' : existing ? 'Save Changes' : 'Create Role'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
