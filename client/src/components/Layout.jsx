import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ListChecks, FolderKanban, UserCog, LogOut, Menu, X } from 'lucide-react';
import { Logo } from './ui.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { initials } from '../utils/helpers.js';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/tasks', label: 'My Tasks', icon: ListChecks },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
  { to: '/profile', label: 'Profile', icon: UserCog },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => { await logout(); toast.success('Logged out'); navigate('/login'); };

  return (
    <div className="app-shell">
      <header className="mobile-bar">
        <Logo />
        <button className="icon-btn" onClick={() => setOpen(!open)} aria-label="Toggle menu" aria-expanded={open}>{open ? <X /> : <Menu />}</button>
      </header>
      {open && <div className="scrim" onClick={() => setOpen(false)} />}
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-logo"><Logo light /></div>
        <nav aria-label="Main">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} onClick={() => setOpen(false)} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Icon size={18} /> {label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-user">
          <div className="avatar">{initials(user?.name)}</div>
          <div className="who"><strong>{user?.name}</strong><span>{user?.email}</span></div>
          <button className="icon-btn light" onClick={handleLogout} aria-label="Log out"><LogOut size={18} /></button>
        </div>
      </aside>
      <main className="main"><Outlet /></main>
    </div>
  );
}
