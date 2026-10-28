import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, FolderKanban, Pencil, Trash2, Clock } from 'lucide-react';
import api, { errMsg } from '../api.js';
import { useToast } from '../context/ToastContext.jsx';
import { Skeleton, Badge, ConfirmDialog, EmptyState } from '../components/ui.jsx';
import TaskForm from '../components/TaskForm.jsx';
import { STATUSES, PRIORITIES, fmtDate, isOverdue } from '../utils/helpers.js';

export default function TaskDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [task, setTask] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([api.get(`/tasks/${id}`), api.get('/projects')])
      .then(([t, p]) => { setTask(t.data.task); setProjects(p.data.projects); })
      .catch((err) => { if (err.response?.status === 404) setNotFound(true); else toast.error(errMsg(err)); })
      .finally(() => setLoading(false));
  }, [id]); // eslint-disable-line

  const quickUpdate = async (patch) => {
    try {
      const body = { title: task.title, description: task.description, priority: task.priority, status: task.status, dueDate: task.dueDate, project: task.project?._id || null, ...patch };
      const { data } = await api.put(`/tasks/${id}`, body);
      setTask(data.task); toast.success('Task updated');
    } catch (err) { toast.error(errMsg(err)); }
  };

  const remove = async () => {
    setBusy(true);
    try { await api.delete(`/tasks/${id}`); toast.success('Task deleted'); navigate('/tasks'); }
    catch (err) { toast.error(errMsg(err)); setBusy(false); }
  };

  if (loading) return <div className="page"><Skeleton rows={4} /></div>;
  if (notFound || !task) return <div className="page card"><EmptyState title="Task not found" text="It may have been deleted." action={<Link className="btn btn-primary" to="/tasks">Back to tasks</Link>} /></div>;

  return (
    <div className="page narrow">
      <Link to="/tasks" className="back"><ArrowLeft size={16} /> Back to tasks</Link>
      <div className="card detail">
        <div className="between wrap">
          <h1>{task.title}</h1>
          <div className="inline-actions">
            <button className="btn btn-ghost" onClick={() => setEditing(true)}><Pencil size={16} /> Edit</button>
            <button className="btn btn-danger-ghost" onClick={() => setDeleting(true)}><Trash2 size={16} /> Delete</button>
          </div>
        </div>
        <div className="detail-badges"><Badge kind="priority" value={task.priority} /><Badge kind="status" value={task.status} />{isOverdue(task) && <span className="badge badge-overdue">Overdue</span>}</div>
        <p className="detail-desc">{task.description || <span className="muted">No description provided.</span>}</p>

        <div className="grid-2 detail-controls">
          <div className="field"><label htmlFor="d-status">Status</label>
            <select id="d-status" value={task.status} onChange={(e) => quickUpdate({ status: e.target.value })}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select></div>
          <div className="field"><label htmlFor="d-pri">Priority</label>
            <select id="d-pri" value={task.priority} onChange={(e) => quickUpdate({ priority: e.target.value })}>{PRIORITIES.map((s) => <option key={s}>{s}</option>)}</select></div>
        </div>

        <dl className="info-list">
          <div><dt><Calendar size={16} /> Due date</dt><dd className={isOverdue(task) ? 'overdue' : ''}>{fmtDate(task.dueDate)}</dd></div>
          <div><dt><FolderKanban size={16} /> Project</dt><dd>{task.project ? <Link className="link" to={`/projects/${task.project._id}`}>{task.project.name}</Link> : 'None'}</dd></div>
          <div><dt><Clock size={16} /> Created</dt><dd>{fmtDate(task.createdAt)}</dd></div>
          {task.completedAt && <div><dt><Clock size={16} /> Completed</dt><dd>{fmtDate(task.completedAt)}</dd></div>}
        </dl>
      </div>
      {editing && <TaskForm task={task} projects={projects} onClose={() => setEditing(false)} onSaved={(t) => { setTask(t); setEditing(false); }} />}
      {deleting && <ConfirmDialog title="Delete task?" message="This action cannot be undone." busy={busy} onConfirm={remove} onCancel={() => setDeleting(false)} />}
    </div>
  );
}
