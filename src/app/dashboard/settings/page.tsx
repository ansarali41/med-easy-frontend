'use client';

import Link from 'next/link';

const SETTINGS_SECTIONS = [
  {
    href: '/dashboard/branches',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
      </svg>
    ),
    label: 'Branches',
    description: 'Create and manage hospital branches. Set a main branch, add contact info, and assign staff to locations.',
    accent: 'teal',
  },
  {
    href: '/dashboard/roles',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    label: 'Roles & Permissions',
    description: 'Define custom roles like Doctor, Nurse, Receptionist, or Patient. Control which modules each role can access.',
    accent: 'violet',
  },
];

const ACCENT_CLASSES: Record<string, string> = {
  teal:   'text-teal-400   bg-teal-400/10   border-teal-400/20   group-hover:bg-teal-400/20',
  violet: 'text-violet-400 bg-violet-400/10 border-violet-400/20 group-hover:bg-violet-400/20',
};

export default function SettingsPage() {
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
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-400 hover:text-white hover:bg-slate-700/60 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
            </svg>
            Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-slate-500 mt-1 text-sm">Configure your hospital — manage branches, roles, and permissions.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SETTINGS_SECTIONS.map((section) => (
            <Link
              key={section.label}
              href={section.href}
              className="group bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-slate-700 hover:bg-slate-900/80 transition-all"
            >
              <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl border mb-4 transition-colors ${ACCENT_CLASSES[section.accent]}`}>
                {section.icon}
              </div>
              <h3 className="font-semibold text-white mb-1.5">{section.label}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{section.description}</p>
              <div className="flex items-center gap-1 mt-4 text-xs font-medium text-slate-500 group-hover:text-slate-300 transition-colors">
                <span>Open</span>
                <svg className="w-3.5 h-3.5 translate-x-0 group-hover:translate-x-0.5 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
