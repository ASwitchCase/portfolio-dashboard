import { NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, Sparkles, Briefcase, GraduationCap, FolderKanban, Mail, LogOut } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { resources } from "../resources/definitions";

const ICONS = {
  skills: Sparkles,
  portfolioprojects: FolderKanban,
  workexperiences: Briefcase,
  educations: GraduationCap,
  contacts: Mail,
};

export default function Layout() {
  const { email, logout } = useAuth();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">Portfolio Dashboard</div>
        <nav className="sidebar-nav">
          <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")}>
            <LayoutDashboard size={18} />
            Overview
          </NavLink>
          {resources.map((resource) => {
            const Icon = ICONS[resource.key];
            return (
              <NavLink key={resource.key} to={`/${resource.key}`} className={({ isActive }) => (isActive ? "active" : "")}>
                <Icon size={18} />
                {resource.labelPlural}
              </NavLink>
            );
          })}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user">{email}</div>
          <button type="button" className="link-button" onClick={logout}>
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
