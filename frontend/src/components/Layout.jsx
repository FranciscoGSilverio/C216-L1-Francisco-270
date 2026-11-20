import { Film, Users } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { card } from "../ui";

function navClass({ isActive }) {
  return `inline-flex items-center gap-1 rounded px-3 py-2 text-sm font-medium ${
    isActive ? "bg-blue-600 text-white" : "text-slate-700 hover:bg-slate-100"
  }`;
}

export default function Layout() {
  return (
    <div className="min-h-screen bg-blue-100">
      <div className="mx-auto max-w-4xl space-y-4 px-4 py-6">
        <header className={`${card} flex items-center justify-between py-4`}>
          <h1 className="text-xl font-semibold text-slate-900">Cinema</h1>
          <nav className="flex gap-2" aria-label="Navegação principal">
            <NavLink to="/filmes" className={navClass}>
              <Film size={16} aria-hidden="true" /> Filmes
            </NavLink>
            <NavLink to="/atores" className={navClass}>
              <Users size={16} aria-hidden="true" /> Atores
            </NavLink>
          </nav>
        </header>
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
