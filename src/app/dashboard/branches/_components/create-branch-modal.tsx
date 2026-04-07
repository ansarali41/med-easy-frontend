'use client';

import { useState } from 'react';
import { createBranch } from '@/lib/api';
import { useToast } from '@/components/toaster';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

const INPUT = 'w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 text-white text-sm rounded-lg placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition';
const LABEL = 'block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5';

export function CreateBranchModal({ onClose, onSuccess }: Props) {
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isMainBranch, setIsMainBranch] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await createBranch({ name, address: address || undefined, city: city || undefined, phone: phone || undefined, email: email || undefined, isMainBranch });
      toast.success('Branch created successfully.');
      onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create branch.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="font-semibold text-white">Add Branch</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label className={LABEL}>Branch Name *</label>
              <input type="text" className={INPUT} value={name} onChange={e => setName(e.target.value)} placeholder="Main Branch" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={LABEL}>City</label>
                <input type="text" className={INPUT} value={city} onChange={e => setCity(e.target.value)} placeholder="New York" />
              </div>
              <div>
                <label className={LABEL}>Phone</label>
                <input type="text" className={INPUT} value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 234 567 8900" />
              </div>
            </div>
            <div>
              <label className={LABEL}>Email</label>
              <input type="email" className={INPUT} value={email} onChange={e => setEmail(e.target.value)} placeholder="branch@hospital.com" />
            </div>
            <div>
              <label className={LABEL}>Address</label>
              <input type="text" className={INPUT} value={address} onChange={e => setAddress(e.target.value)} placeholder="123 Main St" />
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => setIsMainBranch(p => !p)}
                className={`relative w-10 h-6 rounded-full transition-colors ${isMainBranch ? 'bg-teal-500' : 'bg-slate-700'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${isMainBranch ? 'left-5' : 'left-1'}`} />
              </div>
              <span className="text-sm text-slate-300">Set as main branch</span>
            </label>
          </div>

          <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm text-slate-400 hover:text-white border border-slate-700 hover:border-slate-600 rounded-lg transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="px-6 py-2.5 bg-teal-500 hover:bg-teal-400 disabled:bg-teal-500/40 disabled:cursor-not-allowed text-slate-950 text-sm font-bold rounded-lg transition-colors">
              {saving ? 'Creating...' : 'Create Branch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
