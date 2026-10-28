import { useCallback, useEffect, useState } from 'react';
import { Plus, Search, ListChecks, ChevronLeft, ChevronRight, FilterX } from 'lucide-react';
import api, { errMsg } from '../api.js';
import { useToast } from '../context/ToastContext.jsx';
import { Skeleton, EmptyState, ConfirmDialog } from '../components/ui.jsx';
import TaskRow from '../components/TaskRow.jsx';
import TaskForm from '../components/TaskForm.jsx';
import { STATUSES, PRIORITIES } from '../utils/helpers.js';

const initialFilters = { search: '', status: '', priority: '', due: '', project: '', sort: '-createdAt' };

export default function Tasks() {
  const toast = useToast();
  const [filters, setFilters] = useState(initialFilters);
  const [debounced, setDebounced] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ tasks: [], total: 0, pages: 1 });
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // task | 'new' | null
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);

  // Wait 350ms after typing before calling the API
  useEffect(() => { const t = setTimeout(() => setDebounced(filters.search), 350); return () => clearTimeout(t); }, [filters.search]);
  useEffect(() => { api.get('/projects').then((r) => setProjects(r.data.projects)).catch(() => {}); }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters, search: debounced, page, limit: 8 };
      Object.keys(params).forEach((k) => params[k] === '' && delete params[k]);
      const { data } = await api.get('/tasks', { params });
      setData(data);
    } catch (err) { toast.error(errMsg(err)); } finally { setLoading(false); }
  }, [filters.status, filters.priority, filters.due, filters.project, filters.sort, debounced, page]); // eslint-disable-line
  useEffect(() => { load(); }, [load]);

  const setFilter = (k) => (e) => { setFilters({ ...filters, [k]: e.target.value }); setPage(1); };
  const hasFilters = filters.search || filters.status || filters.priority || filters.due || filters.project;

  const toggle = async (task) => {
    try {
      await api.patch(`/tasks/${task._id}/status`, { status: task.status === 'Completed' ? 'Todo' : 'Completed' });
      toast.success(task.status === 'Completed' ? 'Task reopened' : 'Nice! Task completed');
      load();
    } catch (err) { toast.error(errMsg(err)); }
  };

  const confirmDelete = async () => {
    setBusy(true);
    try {
      await api.delete(`/tasks/${deleting._id}`);
      toast.success('Task deleted'); setDeleting(null); load();
    } catch (err) { toast.error(errMsg(err)); } finally { setBusy(false); }
  };

  return (
    <div className="page">
      <div className="page-head">
        <div><h1>My Tasks</h1><p className="muted">{data.total} task{data.total === 1 ? '' : 's'}</p></div>
        <button className="btn btn-primary" onClick={() => setEditing('new')}><Plus size={18} /> New task</button>
      </div>

      <div className="card filters">
        <div className="input-icon search">
          <Search size={16} className="lead-icon" />
          <input aria-label="Search tasks" placeholder="Search tasks..." value={filters.search} onChange={setFilter('search')} />
        </div>
        <select aria-label="Filter by status" value={filters.status} onChange={setFilter('status')}><option value="">All statuses</option>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
        <select aria-label="Filter by priority" value={filters.priority} onChange={setFilter('priority')}><option value="">All priorities</option>{PRIORITIES.map((s) => <option key={s}>{s}</option>)}</select>
        <select aria-label="Filter by due date" value={filters.due} onChange={setFilter('due')}>
          <option value="">Any due date</option><option value="overdue">Overdue</option><option value="today">Due today</option><option value="week">Next 7 days</option><option value="none">No due date</option>
        </select>
        <select aria-label="Filter by project" value={filters.project} onChange={setFilter('project')}>
          <option value="">All projects</option><option value="none">No project</option>{projects.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
        </select>
        <select aria-label="Sort tasks" value={filters.sort} onChange={setFilter('sort')}>
          <option value="-createdAt">Newest first</option><option value="createdAt">Oldest first</option><option value="dueDate">Due date (soonest)</option><option value="-dueDate">Due date (latest)</option><option value="title">Title A–Z</option>
        </select>
        {hasFilters && <button className="btn btn-ghost" onClick={() => { setFilters(initialFilters); setPage(1); }}><FilterX size={16} /> Clear</button>}
      </div>

      <div className="card list-card">
        {loading ? <Skeleton rows={5} /> : data.tasks.length === 0 ? (
          hasFilters
            ? <EmptyState icon={Search} title="No matching tasks" text="Try changing or clearing your filters." />
            : <EmptyState icon={ListChecks} title="No tasks yet" text="Add your first task to get started." action={<button className="btn btn-primary" onClick={() => setEditing('new')}>Create task</button>} />
        ) : data.tasks.map((t) => <TaskRow key={t._id} task={t} onToggle={toggle} onEdit={setEditing} onDelete={setDeleting} />)}
      </div>

      {data.pages > 1 && (
        <div className="pagination">
          <button className="btn btn-ghost" disabled={page <= 1} onClick={() => setPage(page - 1)}><ChevronLeft size={16} /> Prev</button>
          <span>Page {data.page} of {data.pages}</span>
          <button className="btn btn-ghost" disabled={page >= data.pages} onClick={() => setPage(page + 1)}>Next <ChevronRight size={16} /></button>
        </div>
      )}

      {editing && <TaskForm task={editing === 'new' ? null : editing} projects={projects} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />}
      {deleting && <ConfirmDialog title="Delete task?" message={`“${deleting.title}” will be permanently deleted.`} busy={busy} onConfirm={confirmDelete} onCancel={() => setDeleting(null)} />}
    </div>
  );
}
