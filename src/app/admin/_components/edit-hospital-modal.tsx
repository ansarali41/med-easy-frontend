'use client';

import { useState } from 'react';
import { updateHospital, type HospitalDto } from '@/lib/api';
import { useToast } from '@/components/toaster';

interface Props {
  hospital: HospitalDto;
  onClose: () => void;
  onSuccess: () => void;
}

const INPUT = 'w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 text-white text-sm rounded-lg placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition';
const LABEL = 'block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5';

export function EditHospitalModal({ hospital, onClose, onSuccess }: Props) {
  const toast = useToast();
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState(hospital.name);
  const [type, setType] = useState(hospital.type ?? '');
  const [phone, setPhone] = useState(hospital.phone ?? '');
  const [email, setEmail] = useState(hospital.email ?? '');
  const [address, setAddress] = useState(hospital.address ?? '');
  const [city, setCity] = useState(hospital.city ?? '');
  const [country, setCountry] = useState(hospital.country ?? '');
  const [website, setWebsite] = useState(hospital.website ?? '');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await updateHospital(hospital.id, {
        name: name || undefined,
        type: type || undefined,
        phone: phone || undefined,
        email: email || undefined,
        address: address || undefined,
        city: city || undefined,
        country: country || undefined,
        website: website || undefined,
      });
      toast.success('Hospital updated successfully.');
      onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update hospital.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-white">Edit Hospital</h2>
            <p className="text-xs text-slate-500 mt-0.5">{hospital.name}</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[70vh]">
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className={LABEL}>Hospital Name *</label>
                <input type="text" className={INPUT} value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div>
                <label className={LABEL}>Type</label>
                <input type="text" className={INPUT} value={type} onChange={e => setType(e.target.value)} placeholder="General, Specialty..." />
              </div>
              <div>
                <label className={LABEL}>Phone</label>
                <input type="text" className={INPUT} value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
              <div>
                <label className={LABEL}>Email</label>
                <input type="email" className={INPUT} value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div>
                <label className={LABEL}>Website</label>
                <input type="text" className={INPUT} value={website} onChange={e => setWebsite(e.target.value)} />
              </div>
              <div>
                <label className={LABEL}>City</label>
                <input type="text" className={INPUT} value={city} onChange={e => setCity(e.target.value)} />
              </div>
              <div>
                <label className={LABEL}>Country</label>
                <input type="text" className={INPUT} value={country} onChange={e => setCountry(e.target.value)} />
              </div>
              <div className="col-span-2">
                <label className={LABEL}>Address</label>
                <input type="text" className={INPUT} value={address} onChange={e => setAddress(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm text-slate-400 hover:text-white border border-slate-700 hover:border-slate-600 rounded-lg transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="px-6 py-2.5 bg-teal-500 hover:bg-teal-400 disabled:bg-teal-500/40 disabled:cursor-not-allowed text-slate-950 text-sm font-bold rounded-lg transition-colors">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
