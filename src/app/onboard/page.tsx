'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useToast } from '@/components/toaster';

interface HospitalData {
  name: string;
  type: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  country: string;
  website: string;
}

interface AdminData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const HOSPITAL_TYPES = [
  { value: 'general', label: 'General Hospital' },
  { value: 'specialty', label: 'Specialty Hospital' },
  { value: 'clinic', label: 'Clinic / Polyclinic' },
  { value: 'diagnostic', label: 'Diagnostic Center' },
  { value: 'dental', label: 'Dental Clinic' },
  { value: 'maternity', label: 'Maternity Hospital' },
];

const INPUT_CLASS =
  'w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 text-white text-sm rounded-lg placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition';

const SELECT_CLASS =
  'w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 text-white text-sm rounded-lg appearance-none pr-10 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition';

function StepBar({ step }: { step: number }) {
  const steps = ['Hospital Info', 'Admin Account', 'Complete'];
  return (
    <div className="mb-8">
      <div className="flex items-start justify-between relative mb-3">
        <div className="absolute top-4 left-0 right-0 h-px bg-slate-800 z-0 mx-8" />
        <div
          className="absolute top-4 left-0 h-px bg-teal-500 z-0 ml-8 transition-all duration-500"
          style={{ width: `calc(${((step - 1) / 2) * 100}% - 4rem)` }}
        />
        {steps.map((label, idx) => {
          const n = idx + 1;
          const done = step > n;
          const active = step === n;
          return (
            <div key={label} className="flex flex-col items-center gap-2 z-10 flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-colors
                  ${done ? 'bg-teal-500 border-teal-500 text-slate-950' : active ? 'bg-teal-500/10 border-teal-500 text-teal-400' : 'bg-slate-800 border-slate-700 text-slate-600'}`}
              >
                {done ? (
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                ) : n}
              </div>
              <span className={`text-xs font-medium whitespace-nowrap ${active ? 'text-teal-400' : done ? 'text-slate-400' : 'text-slate-600'}`}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Field({ label, id, required, children }: { label: string; id: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-medium text-slate-400 uppercase tracking-wider">
        {label}
        {required && <span className="text-teal-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

export default function OnboardPage() {
  const toast = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [hospital, setHospital] = useState<HospitalData>({
    name: '', type: '', phone: '', email: '', address: '', city: '', country: '', website: '',
  });

  const [admin, setAdmin] = useState<AdminData>({
    firstName: '', lastName: '', email: '', password: '', confirmPassword: '',
  });

  function setH(field: keyof HospitalData, value: string) {
    setHospital((prev) => ({ ...prev, [field]: value }));
  }

  function setA(field: keyof AdminData, value: string) {
    setAdmin((prev) => ({ ...prev, [field]: value }));
  }

  function goToStep2(e: React.FormEvent) {
    e.preventDefault();
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();

    if (admin.password !== admin.confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    if (admin.password.length < 8) {
      toast.error('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      const apiBase = process.env.NEXT_PUBLIC_HOSPITAL_SERVICE_URL ?? 'http://localhost:3001';
      const res = await fetch(`${apiBase}/api/hospitals/onboard`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hospital: {
            name: hospital.name,
            type: hospital.type,
            phone: hospital.phone,
            email: hospital.email,
            address: hospital.address,
            city: hospital.city,
            country: hospital.country,
            website: hospital.website || undefined,
          },
          adminEmail: admin.email,
          adminPassword: admin.password,
          adminFirstName: admin.firstName,
          adminLastName: admin.lastName,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { message?: string }).message ?? 'Failed to register hospital. Please try again.');
      }

      toast.success('Hospital registered successfully!');
      setStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 bg-grid flex items-start justify-center p-4 py-12">
      {/* Glow */}
      <div className="pointer-events-none fixed inset-0 flex items-center justify-center">
        <div className="w-[700px] h-[700px] rounded-full bg-teal-500/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-2xl">
        {/* Brand */}
        <div className="text-center mb-8">
          <Link href="/login" className="inline-flex items-center gap-2.5 group">
            <div className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20">
              <svg className="w-5 h-5 text-teal-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14v-4H8v-2h4V7h2v4h4v2h-4v4h-2z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-white">Med-Easy</span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl shadow-black/40">

          {step < 3 && <StepBar step={step} />}

          {/* ── Step 1: Hospital Info ── */}
          {step === 1 && (
            <form onSubmit={goToStep2}>
              <h2 className="text-xl font-semibold text-white mb-1">Register your hospital</h2>
              <p className="text-slate-500 text-sm mb-7">Tell us about your hospital or clinic</p>

              <div className="space-y-5">
                <Field label="Hospital name" id="hospName" required>
                  <input id="hospName" type="text" className={INPUT_CLASS} placeholder="City General Hospital"
                    value={hospital.name} onChange={(e) => setH('name', e.target.value)} required />
                </Field>

                <Field label="Type" id="hospType" required>
                  <div className="relative">
                    <select id="hospType" className={SELECT_CLASS}
                      value={hospital.type} onChange={(e) => setH('type', e.target.value)} required>
                      <option value="" disabled className="bg-slate-800">Select hospital type</option>
                      {HOSPITAL_TYPES.map((t) => (
                        <option key={t.value} value={t.value} className="bg-slate-800">{t.label}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                      <svg className="w-4 h-4 text-slate-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Phone" id="hospPhone" required>
                    <input id="hospPhone" type="tel" className={INPUT_CLASS} placeholder="+1 555 000 0000"
                      value={hospital.phone} onChange={(e) => setH('phone', e.target.value)} required />
                  </Field>
                  <Field label="Hospital email" id="hospEmail" required>
                    <input id="hospEmail" type="email" className={INPUT_CLASS} placeholder="info@hospital.com"
                      value={hospital.email} onChange={(e) => setH('email', e.target.value)} required />
                  </Field>
                </div>

                <Field label="Address" id="hospAddress" required>
                  <input id="hospAddress" type="text" className={INPUT_CLASS} placeholder="123 Medical Drive, Suite 100"
                    value={hospital.address} onChange={(e) => setH('address', e.target.value)} required />
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="City" id="hospCity" required>
                    <input id="hospCity" type="text" className={INPUT_CLASS} placeholder="New York"
                      value={hospital.city} onChange={(e) => setH('city', e.target.value)} required />
                  </Field>
                  <Field label="Country" id="hospCountry" required>
                    <input id="hospCountry" type="text" className={INPUT_CLASS} placeholder="United States"
                      value={hospital.country} onChange={(e) => setH('country', e.target.value)} required />
                  </Field>
                </div>

                <Field label="Website" id="hospWebsite">
                  <input id="hospWebsite" type="url" className={INPUT_CLASS} placeholder="https://www.hospital.com (optional)"
                    value={hospital.website} onChange={(e) => setH('website', e.target.value)} />
                </Field>
              </div>

              <div className="mt-8 flex justify-end">
                <button type="submit"
                  className="flex items-center gap-2 px-6 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 text-sm font-bold rounded-lg transition-colors">
                  Continue
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </form>
          )}

          {/* ── Step 2: Admin Account ── */}
          {step === 2 && (
            <form onSubmit={handleRegister}>
              <h2 className="text-xl font-semibold text-white mb-1">Create admin account</h2>
              <p className="text-slate-500 text-sm mb-7">
                This account will manage{' '}
                <span className="font-medium text-teal-400">{hospital.name}</span>
              </p>

              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="First name" id="adminFirst" required>
                    <input id="adminFirst" type="text" className={INPUT_CLASS} placeholder="John"
                      value={admin.firstName} onChange={(e) => setA('firstName', e.target.value)} required />
                  </Field>
                  <Field label="Last name" id="adminLast" required>
                    <input id="adminLast" type="text" className={INPUT_CLASS} placeholder="Smith"
                      value={admin.lastName} onChange={(e) => setA('lastName', e.target.value)} required />
                  </Field>
                </div>

                <Field label="Email address" id="adminEmail" required>
                  <input id="adminEmail" type="email" autoComplete="email" className={INPUT_CLASS}
                    placeholder="admin@hospital.com" value={admin.email}
                    onChange={(e) => setA('email', e.target.value)} required />
                </Field>

                <Field label="Password" id="adminPassword" required>
                  <input id="adminPassword" type="password" autoComplete="new-password" className={INPUT_CLASS}
                    placeholder="Min. 8 characters" value={admin.password}
                    onChange={(e) => setA('password', e.target.value)} required minLength={8} />
                </Field>

                <Field label="Confirm password" id="adminConfirm" required>
                  <input id="adminConfirm" type="password" autoComplete="new-password" className={INPUT_CLASS}
                    placeholder="Re-enter your password" value={admin.confirmPassword}
                    onChange={(e) => setA('confirmPassword', e.target.value)} required />
                </Field>
              </div>

              <div className="mt-8 flex items-center justify-between">
                <button type="button" onClick={() => setStep(1)}
                  className="flex items-center gap-1.5 px-4 py-2.5 text-slate-500 hover:text-slate-300 text-sm font-medium transition-colors">
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
                  </svg>
                  Back
                </button>

                <button type="submit" disabled={loading}
                  className="flex items-center gap-2 px-6 py-2.5 bg-teal-500 hover:bg-teal-400 disabled:bg-teal-500/40 disabled:cursor-not-allowed text-slate-950 text-sm font-bold rounded-lg transition-colors">
                  {loading && (
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  )}
                  {loading ? 'Registering...' : 'Register hospital'}
                </button>
              </div>
            </form>
          )}

          {/* ── Step 3: Success ── */}
          {step === 3 && (
            <div className="text-center py-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-teal-500/10 border border-teal-500/20 mb-6">
                <svg className="w-10 h-10 text-teal-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                </svg>
              </div>

              <h2 className="text-2xl font-semibold text-white mb-3">Registration complete!</h2>
              <p className="text-slate-500 text-sm max-w-sm mx-auto mb-8 leading-relaxed">
                <span className="font-medium text-teal-400">{hospital.name}</span> has been registered.
                You can now sign in with{' '}
                <span className="font-medium text-slate-300">{admin.email}</span>.
              </p>

              <Link href="/login"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 text-sm font-bold rounded-lg transition-colors">
                Go to login
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          )}
        </div>

        {step < 3 && (
          <p className="text-center text-sm text-slate-600 mt-6">
            Already registered?{' '}
            <Link href="/login" className="text-teal-400 hover:text-teal-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
