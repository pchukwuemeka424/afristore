'use client';

export function DashboardTopbar({ onMenuToggle }: { onMenuToggle: () => void }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-gray-200 bg-white px-4 lg:px-6">
      {/* Mobile hamburger */}
      <button
        type="button"
        onClick={onMenuToggle}
        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
        aria-label="Toggle menu"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="18" x2="20" y2="18" />
        </svg>
      </button>

      {/* Breadcrumb / title area */}
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-500">Welcome back</p>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        <a
          href="/onboarding"
          className="hidden rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 sm:inline-flex"
        >
          + New store
        </a>
      </div>
    </header>
  );
}
