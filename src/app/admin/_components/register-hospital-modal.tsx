'use client';

import { useState } from 'react';
import { createHospital } from '@/lib/api';
import { useToast } from '@/components/toaster';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

const INPUT = 'w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 text-white text-sm rounded-lg placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition';
const LABEL = 'block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5';

export function RegisterHospitalModal({ onClose, onSuccess }: Props) {
  const toast = useToast();
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [website, setWebsite] = useState('');

  const [adminFirstName, setAdminFirstName] = useState('');
  const [adminLastName, setAdminLastName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await createHospital({
        hospital: { name, type: type || undefined, phone: phone || undefined, email: email || undefined, address: address || undefined, city: city || undefined, country: country || undefined, website: website || undefined },
        adminEmail,
        adminPassword,
        adminFirstName,
        adminLastName,
      });
      toast.success('Hospital registered successfully.');
      onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to register hospital.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-white">Register Hospital</h2>
            <p className="text-xs text-slate-500 mt-0.5">Create a new hospital with an admin account</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[75vh]">
          <div className="p-6 space-y-5">
            <h3 className="text-xs font-semibold text-teal-400 uppercase tracking-wider">Hospital Information</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className={LABEL}>Hospital Name *</label>
                <input type="text" className={INPUT} value={name} onChange={e => setName(e.target.value)} placeholder="City General Hospital" required />
              </div>
              <div>
                <label className={LABEL}>Type</label>
                <input type="text" className={INPUT} value={type} onChange={e => setType(e.target.value)} placeholder="General, Specialty..." />
              </div>
              <div>
                <label className={LABEL}>Phone</label>
                <input type="text" className={INPUT} value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 234 567 8900" />
              </div>
              <div>
                <label className={LABEL}>Email</label>
                <input type="email" className={INPUT} value={email} onChange={e => setEmail(e.target.value)} placeholder="info@hospital.com" />
              </div>
              <div>
                <label className={LABEL}>Website</label>
                <input type="text" className={INPUT} value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://hospital.com" />
              </div>
              <div>
                <label className={LABEL}>City</label>
                <input type="text" className={INPUT} value={city} onChange={e => setCity(e.target.value)} placeholder="New York" />
              </div>
              <div>
                <label className={LABEL}>Country</label>
                <input type="text" className={INPUT} value={country} onChange={e => setCountry(e.target.value)} placeholder="United States" />
              </div>
              <div className="col-span-2">
                <label className={LABEL}>Address</label>
                <input type="text" className={INPUT} value={address} onChange={e => setAddress(e.target.value)} placeholder="123 Main St" />
              </div>
            </div>

            <div className="border-t border-slate-800 pt-5">
              <h3 className="text-xs font-semibold text-teal-400 uppercase tracking-wider mb-4">Admin Account</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={LABEL}>First Name *</label>
                  <input type="text" className={INPUT} value={adminFirstName} onChange={e => setAdminFirstName(e.target.value)} placeholder="John" required />
                </div>
                <div>
                  <label className={LABEL}>Last Name *</label>
                  <input type="text" className={INPUT} value={adminLastName} onChange={e => setAdminLastName(e.target.value)} placeholder="Smith" required />
                </div>
                <div>
                  <label className={LABEL}>Admin Email *</label>
                  <input type="email" className={INPUT} value={adminEmail} onChange={e => setAdminEmail(e.target.value)} placeholder="admin@hospital.com" required />
                </div>
                <div>
                  <label className={LABEL}>Password *</label>
                  <input type="password" className={INPUT} value={adminPassword} onChange={e => setAdminPassword(e.target.value)} placeholder="Min 8 characters" minLength={8} required />
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm text-slate-400 hover:text-white border border-slate-700 hover:border-slate-600 rounded-lg transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="px-6 py-2.5 bg-teal-500 hover:bg-teal-400 disabled:bg-teal-500/40 disabled:cursor-not-allowed text-slate-950 text-sm font-bold rounded-lg transition-colors">
              {saving ? 'Registering...' : 'Register Hospital'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
