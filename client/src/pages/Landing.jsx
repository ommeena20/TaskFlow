import { Link } from 'react-router-dom';
import { ListChecks, FolderKanban, CalendarClock, BarChart3, ShieldCheck, Search, ArrowRight, Github } from 'lucide-react';
import { Logo } from '../components/ui.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const features = [
  { icon: ListChecks, title: 'Capture every task', text: 'Priorities, statuses and due dates in one clean list.' },
  { icon: FolderKanban, title: 'Organize by project', text: 'Color-coded projects with live progress bars.' },
  { icon: CalendarClock, title: 'Never miss a deadline', text: 'Overdue and upcoming work is surfaced for you.' },
  { icon: BarChart3, title: 'See your progress', text: 'A dashboard that shows how much you have finished.' },
  { icon: Search, title: 'Find things fast', text: 'Search, filter and sort across all your tasks.' },
  { icon: ShieldCheck, title: 'Private by design', text: 'JWT-secured accounts. Only you can see your data.' },
];

export default function Landing() {
  const { user } = useAuth();
  return (
    <div className="landing">
      <header className="l-nav">
        <Logo />
        <nav className="l-links" aria-label="Landing">
          <a href="#features">Features</a>
          <a href="#preview">Preview</a>
        </nav>
        <div className="l-cta">
          {user ? <Link className="btn btn-primary" to="/dashboard">Open dashboard</Link> : (<>
            <Link className="btn btn-ghost" to="/login">Log in</Link>
            <Link className="btn btn-primary" to="/register">Sign up free</Link>
          </>)}
        </div>
      </header>

      <section className="hero">
        <span className="pill">Plan · Focus · Finish</span>
        <h1>Turn a messy to-do list into <em>steady progress.</em></h1>
        <p>TaskFlow brings your tasks, projects and deadlines together so you always know what to do next.</p>
        <div className="hero-cta">
          <Link className="btn btn-primary btn-lg" to={user ? '/dashboard' : '/register'}>Get started <ArrowRight size={18} /></Link>
          <a className="btn btn-ghost btn-lg" href="#features">See features</a>
        </div>
      </section>

      <section id="preview" className="mock-wrap" aria-label="Dashboard preview">
        <div className="mock">
          <div className="mock-side"><Logo light /><i /><i /><i /><i /></div>
          <div className="mock-body">
            <div className="mock-stats">
              {[['Total', '24'], ['Done', '15'], ['Pending', '7'], ['Overdue', '2']].map(([k, v]) => <div key={k}><span>{k}</span><strong>{v}</strong></div>)}
            </div>
            <div className="mock-bar"><b style={{ width: '63%' }} /></div>
            {[['Build dashboard UI', 'High', '#e11d48'], ['Revise React hooks', 'Medium', '#d97706'], ['Deploy to Vercel', 'Low', '#16a34a']].map(([t, p, c]) => (
              <div className="mock-task" key={t}><span className="check" /><span>{t}</span><em style={{ color: c }}>{p}</em></div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="l-section">
        <h2>Everything you need, nothing you don’t</h2>
        <div className="feature-grid">
          {features.map(({ icon: Icon, title, text }) => (
            <article className="feature" key={title}><div className="f-icon"><Icon size={22} /></div><h3>{title}</h3><p>{text}</p></article>
          ))}
        </div>
      </section>

      <section className="l-section band">
        <h2>Ready to get organized?</h2>
        <Link className="btn btn-light btn-lg" to={user ? '/dashboard' : '/register'}>Create your free account</Link>
      </section>

      <footer className="l-footer">
        <Logo />
        <span>© {new Date().getFullYear()} TaskFlow. Built with the MERN stack.</span>
        <div>
          <Link to="/login">Log in</Link>
          <Link to="/register">Sign up</Link>
          <a href="https://github.com/" target="_blank" rel="noreferrer" aria-label="GitHub"><Github size={18} /></a>
        </div>
      </footer>
    </div>
  );
}
