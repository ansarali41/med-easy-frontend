'use client';

import { useEffect, useState } from 'react';
import { createPatient, getRoles, type HospitalRoleDto } from '@/lib/api';
import { useToast } from '@/components/toaster';

interface Props {
  branchId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const INPUT = 'w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 text-white text-sm rounded-lg placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition';
const LABEL = 'block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5';

export function CreatePatientModal({ branchId, onClose, onSuccess }: Props) {
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [roles, setRoles] = useState<HospitalRoleDto[]>([]);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [hospitalRoleId, setHospitalRoleId] = useState('');
  const [canLogin, setCanLogin] = useState(true);

  useEffect(() => {
    getRoles().then(setRoles).catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await createPatient(branchId, {
        firstName,
        lastName,
        canLogin,
        ...(hospitalRoleId ? { hospitalRoleId } : {}),
        ...(canLogin ? { email, password } : {}),
      });
      toast.success('Patient account created successfully.');
      onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create patient account.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="font-semibold text-white">Add Patient</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={LABEL}>First Name *</label>
                <input type="text" className={INPUT} value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Jane" required />
              </div>
              <div>
                <label className={LABEL}>Last Name *</label>
                <input type="text" className={INPUT} value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Doe" required />
              </div>
            </div>

            {roles.length > 0 && (
              <div>
                <label className={LABEL}>Role <span className="normal-case text-slate-600">(optional)</span></label>
                <select
                  className={`${INPUT} cursor-pointer`}
                  value={hospitalRoleId}
                  onChange={e => setHospitalRoleId(e.target.value)}
                >
                  <option value="">No role assigned</option>
                  {roles.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Allow Login toggle */}
            <div className="flex items-center justify-between py-3 px-4 bg-slate-800/50 border border-slate-700 rounded-lg">
              <div>
                <p className="text-sm font-medium text-white">Allow Login</p>
                <p className="text-xs text-slate-500 mt-0.5">Patient can sign in to the system</p>
              </div>
              <button
                type="button"
                onClick={() => setCanLogin(v => !v)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${canLogin ? 'bg-teal-500' : 'bg-slate-600'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${canLogin ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            {canLogin && (
              <>
                <div>
                  <label className={LABEL}>Email *</label>
                  <input type="email" className={INPUT} value={email} onChange={e => setEmail(e.target.value)} placeholder="patient@email.com" required={canLogin} />
                </div>
                <div>
                  <label className={LABEL}>Password *</label>
                  <input type="password" className={INPUT} value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 8 characters" minLength={8} required={canLogin} />
                </div>
              </>
            )}
          </div>

          <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm text-slate-400 hover:text-white border border-slate-700 hover:border-slate-600 rounded-lg transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="px-6 py-2.5 bg-teal-500 hover:bg-teal-400 disabled:bg-teal-500/40 disabled:cursor-not-allowed text-slate-950 text-sm font-bold rounded-lg transition-colors">
              {saving ? 'Creating...' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
