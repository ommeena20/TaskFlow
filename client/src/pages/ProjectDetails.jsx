import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Pencil, Trash2, ListChecks } from 'lucide-react';
import api, { errMsg } from '../api.js';
import { useToast } from '../context/ToastContext.jsx';
import { Skeleton, EmptyState, ConfirmDialog } from '../components/ui.jsx';
import TaskRow from '../components/TaskRow.jsx';
import TaskForm from '../components/TaskForm.jsx';
import ProjectForm from '../components/ProjectForm.jsx';
import { pct } from '../utils/helpers.js';

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [taskForm, setTaskForm] = useState(null);
  const [editProject, setEditProject] = useState(false);
  const [deleteProject, setDeleteProject] = useState(false);
  const [deleteTask, setDeleteTask] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try { const { data } = await api.get(`/projects/${id}`); setProject(data.project); const pr = { _id: data.project._id, name: data.project.name, color: data.project.color }; setTasks(data.tasks.map((t) => ({ ...t, project: pr }))); }
    catch (err) { if (err.response?.status === 404) setNotFound(true); else toast.error(errMsg(err)); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [id]); // eslint-disable-line

  const toggle = async (t) => {
    try { await api.patch(`/tasks/${t._id}/status`, { status: t.status === 'Completed' ? 'Todo' : 'Completed' }); load(); }
    catch (err) { toast.error(errMsg(err)); }
  };
  const removeTask = async () => {
    setBusy(true);
    try { await api.delete(`/tasks/${deleteTask._id}`); toast.success('Task deleted'); setDeleteTask(null); load(); }
    catch (err) { toast.error(errMsg(err)); } finally { setBusy(false); }
  };
  const removeProject = async () => {
    setBusy(true);
    try { await api.delete(`/projects/${id}`); toast.success('Project deleted'); navigate('/projects'); }
    catch (err) { toast.error(errMsg(err)); setBusy(false); }
  };

  if (loading) return <div className="page"><Skeleton rows={4} /></div>;
  if (notFound) return <div className="page card"><EmptyState title="Project not found" text="It may have been deleted." action={<Link className="btn btn-primary" to="/projects">Back to projects</Link>} /></div>;

  const done = tasks.filter((t) => t.status === 'Completed').length;
  const percent = pct(done, tasks.length);

  return (
    <div className="page">
      <Link to="/projects" className="back"><ArrowLeft size={16} /> All projects</Link>
      <div className="card project-hero" style={{ '--accent': project.color }}>
        <div className="between wrap">
          <div><h1>{project.name}</h1><p className="muted">{project.description || 'No description'}</p></div>
          <div className="inline-actions">
            <button className="btn btn-ghost" onClick={() => setEditProject(true)}><Pencil size={16} /> Edit</button>
            <button className="btn btn-danger-ghost" onClick={() => setDeleteProject(true)}><Trash2 size={16} /> Delete</button>
          </div>
        </div>
        <div className="progress big"><span style={{ width: `${percent}%`, background: project.color }} /></div>
        <p className="muted">{done} of {tasks.length} tasks completed · {percent}%</p>
      </div>

      <div className="page-head"><h2>Tasks</h2><button className="btn btn-primary" onClick={() => setTaskForm('new')}><Plus size={18} /> Add task</button></div>
      <div className="card list-card">
        {tasks.length === 0
          ? <EmptyState icon={ListChecks} title="No tasks in this project" text="Add a task to start making progress." action={<button className="btn btn-primary" onClick={() => setTaskForm('new')}>Add task</button>} />
          : tasks.map((t) => <TaskRow key={t._id} task={t} onToggle={toggle} onEdit={setTaskForm} onDelete={setDeleteTask} />)}
      </div>

      {taskForm && <TaskForm task={taskForm === 'new' ? null : taskForm} projects={[project]} defaultProject={project._id}
        onClose={() => setTaskForm(null)} onSaved={() => { setTaskForm(null); load(); }} />}
      {editProject && <ProjectForm project={project} onClose={() => setEditProject(false)} onSaved={(p) => { setProject(p); setEditProject(false); }} />}
      {deleteProject && <ConfirmDialog title="Delete project?" message="Tasks will be kept but unassigned." busy={busy} onConfirm={removeProject} onCancel={() => setDeleteProject(false)} />}
      {deleteTask && <ConfirmDialog title="Delete task?" message={`“${deleteTask.title}” will be permanently deleted.`} busy={busy} onConfirm={removeTask} onCancel={() => setDeleteTask(null)} />}
    </div>
  );
}
