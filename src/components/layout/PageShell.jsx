// src/components/layout/PageShell.jsx
import { NavLink, Outlet, ScrollRestoration } from "react-router-dom";
import logoUrl from "@/assets/logo.png";

export default function PageShell() {
  return (
    <div className="min-h-dvh flex flex-col bg-neutral-200 text-text-primary">
      {/* Skip link for a11y */}
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 bg-neutral-100 px-3 py-2 rounded"
      >
        Skip to content
      </a>

      {/* Header (no sidebar) */}
      <header className="sticky top-0 z-40 bg-neutral-100 border-b">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-3">
          <img src={logoUrl} alt="Company logo" className="h-7 w-auto" />
          <span className="font-semibold">Contractor Portal</span>
        </div>
      </header>

      {/* Main content */}
      <main id="content" className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-6 md:py-8">
          <Outlet />
        </div>
        {/* Works if you’re using a Data Router (createBrowserRouter). Harmless otherwise. */}
        <ScrollRestoration />
      </main>

      {/* Footer (optional) */}
      <footer className="border-t bg-neutral-100">
        <div className="mx-auto max-w-7xl px-4 py-3 text-sm opacity-70">
          © {new Date().getFullYear()} Your Company
        </div>
      </footer>
    </div>
  );
}
