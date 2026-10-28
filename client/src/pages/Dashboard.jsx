import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ListTodo, CheckCircle2, Clock, AlertTriangle, Plus, Rocket } from 'lucide-react';
import api, { errMsg } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { Skeleton, EmptyState } from '../components/ui.jsx';
import TaskRow from '../components/TaskRow.jsx';
import TaskForm from '../components/TaskForm.jsx';
import { isOverdue, pct, fmtDate } from '../utils/helpers.js';

export default function Dashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    try {
      const [t, p] = await Promise.all([api.get('/tasks?limit=500'), api.get('/projects')]);
      setTasks(t.data.tasks); setProjects(p.data.projects);
    } catch (err) { toast.error(errMsg(err)); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []); // eslint-disable-line

  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === 'Completed').length;
  const overdue = tasks.filter(isOverdue).length;
  const pending = total - completed;
  const percent = pct(completed, total);
  const recent = tasks.slice(0, 5); // API returns newest first
  const upcoming = tasks.filter((t) => t.dueDate && t.status !== 'Completed' && !isOverdue(t)).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)).slice(0, 5);

  const stats = [
    { label: 'Total tasks', value: total, icon: ListTodo, cls: 'indigo' },
    { label: 'Completed', value: completed, icon: CheckCircle2, cls: 'green' },
    { label: 'Pending', value: pending, icon: Clock, cls: 'amber' },
    { label: 'Overdue', value: overdue, icon: AlertTriangle, cls: 'red' },
  ];

  return (
    <div className="page">
      <div className="page-head">
        <div><h1>Hello, {user.name.split(' ')[0]} 👋</h1><p className="muted">Here’s what’s happening with your work today.</p></div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}><Plus size={18} /> New task</button>
      </div>

      {loading ? <Skeleton rows={5} /> : total === 0 && projects.length === 0 ? (
        <div className="card"><EmptyState icon={Rocket} title="Your workspace is ready" text="Create your first task or project to start tracking progress."
          action={<div className="inline-actions"><button className="btn btn-primary" onClick={() => setShowForm(true)}>Create a task</button><Link className="btn btn-ghost" to="/projects">Create a project</Link></div>} /></div>
      ) : (<>
        <div className="stat-grid">
          {stats.map(({ label, value, icon: Icon, cls }) => (
            <div className="card stat" key={label}><div className={`stat-icon ${cls}`}><Icon size={20} /></div><div><span className="muted">{label}</span><strong>{value}</strong></div></div>
          ))}
        </div>

        <div className="card progress-card">
          <div className="between"><h2>Overall completion</h2><strong>{percent}%</strong></div>
          <div className="progress big"><span style={{ width: `${percent}%` }} /></div>
          <p className="muted">{completed} of {total} tasks completed</p>
        </div>

        <div className="dash-grid">
          <section className="card">
            <div className="between"><h2>Recent tasks</h2><Link to="/tasks" className="link">View all</Link></div>
            {recent.length ? recent.map((t) => <TaskRow key={t._id} task={t} />) : <p className="muted pad">No tasks yet.</p>}
          </section>
          <section className="card">
            <div className="between"><h2>Upcoming deadlines</h2></div>
            {upcoming.length ? upcoming.map((t) => (
              <Link to={`/tasks/${t._id}`} className="deadline" key={t._id}><strong>{t.title}</strong><span className="muted">{fmtDate(t.dueDate)}</span></Link>
            )) : <p className="muted pad">No upcoming deadlines. Add a due date to a task to see it here.</p>}
          </section>
        </div>

        <section className="card">
          <div className="between"><h2>Project summary</h2><Link to="/projects" className="link">Manage</Link></div>
          {projects.length ? (
            <div className="proj-summary">
              {projects.map((p) => (
                <Link to={`/projects/${p._id}`} key={p._id} className="proj-mini">
                  <div className="between"><span><i className="dot" style={{ background: p.color }} /> {p.name}</span><span className="muted">{pct(p.completedCount, p.taskCount)}%</span></div>
                  <div className="progress"><span style={{ width: `${pct(p.completedCount, p.taskCount)}%`, background: p.color }} /></div>
                </Link>
              ))}
            </div>
          ) : <p className="muted pad">No projects yet. <Link className="link" to="/projects">Create one</Link> to group related tasks.</p>}
        </section>
      </>)}

      {showForm && <TaskForm projects={projects} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load(); }} />}
    </div>
  );
}
