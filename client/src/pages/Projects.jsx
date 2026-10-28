import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FolderKanban, Pencil, Trash2 } from 'lucide-react';
import api, { errMsg } from '../api.js';
import { useToast } from '../context/ToastContext.jsx';
import { Skeleton, EmptyState, ConfirmDialog } from '../components/ui.jsx';
import ProjectForm from '../components/ProjectForm.jsx';
import { pct } from '../utils/helpers.js';

export default function Projects() {
  const toast = useToast();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try { setProjects((await api.get('/projects')).data.projects); }
    catch (err) { toast.error(errMsg(err)); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []); // eslint-disable-line

  const remove = async () => {
    setBusy(true);
    try { await api.delete(`/projects/${deleting._id}`); toast.success('Project deleted'); setDeleting(null); load(); }
    catch (err) { toast.error(errMsg(err)); } finally { setBusy(false); }
  };

  return (
    <div className="page">
      <div className="page-head">
        <div><h1>Projects</h1><p className="muted">Group related tasks and track progress.</p></div>
        <button className="btn btn-primary" onClick={() => setEditing('new')}><Plus size={18} /> New project</button>
      </div>

      {loading ? <Skeleton rows={3} /> : projects.length === 0 ? (
        <div className="card"><EmptyState icon={FolderKanban} title="No projects yet" text="Projects help you group tasks, like “Portfolio” or “Exam prep”."
          action={<button className="btn btn-primary" onClick={() => setEditing('new')}>Create project</button>} /></div>
      ) : (
        <div className="project-grid">
          {projects.map((p) => {
            const percent = pct(p.completedCount, p.taskCount);
            return (
              <article className="card project-card" key={p._id} style={{ '--accent': p.color }}>
                <div className="between">
                  <span className="proj-badge"><FolderKanban size={18} /></span>
                  <div className="row-actions">
                    <button className="icon-btn" aria-label={`Edit ${p.name}`} onClick={() => setEditing(p)}><Pencil size={16} /></button>
                    <button className="icon-btn danger" aria-label={`Delete ${p.name}`} onClick={() => setDeleting(p)}><Trash2 size={16} /></button>
                  </div>
                </div>
                <h3><Link to={`/projects/${p._id}`}>{p.name}</Link></h3>
                <p className="muted clamp">{p.description || 'No description'}</p>
                <div className="progress"><span style={{ width: `${percent}%`, background: p.color }} /></div>
                <div className="between small"><span className="muted">{p.completedCount}/{p.taskCount} tasks done</span><strong>{percent}%</strong></div>
              </article>
            );
          })}
        </div>
      )}

      {editing && <ProjectForm project={editing === 'new' ? null : editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />}
      {deleting && <ConfirmDialog title="Delete project?" message={`“${deleting.name}” will be deleted. Its tasks will be kept but unassigned.`} busy={busy} onConfirm={remove} onCancel={() => setDeleting(null)} />}
    </div>
  );
}
