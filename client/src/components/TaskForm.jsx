import { useState } from 'react';
import { Modal, Field, Spinner } from './ui.jsx';
import api, { errMsg } from '../api.js';
import { useToast } from '../context/ToastContext.jsx';
import { STATUSES, PRIORITIES, toInputDate } from '../utils/helpers.js';

// Create or edit a task. Pass `task` to edit. Pass `defaultProject` to preselect a project.
export default function TaskForm({ task, projects, defaultProject = '', onSaved, onClose }) {
  const toast = useToast();
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    priority: task?.priority || 'Medium',
    status: task?.status || 'Todo',
    dueDate: toInputDate(task?.dueDate),
    project: task?.project?._id || defaultProject,
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    if (form.title.length > 120) errs.title = 'Title must be 120 characters or fewer';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSaving(true);
    try {
      const payload = { ...form, dueDate: form.dueDate || null, project: form.project || null };
      const { data } = task ? await api.put(`/tasks/${task._id}`, payload) : await api.post('/tasks', payload);
      toast.success(task ? 'Task updated' : 'Task created');
      onSaved(data.task);
    } catch (err) { toast.error(errMsg(err)); } finally { setSaving(false); }
  };

  return (
    <Modal title={task ? 'Edit task' : 'New task'} onClose={onClose}>
      <form onSubmit={submit} noValidate>
        <Field label="Title" htmlFor="t-title" error={errors.title}>
          <input id="t-title" value={form.title} onChange={set('title')} placeholder="e.g. Finish API documentation" autoFocus />
        </Field>
        <Field label="Description" htmlFor="t-desc">
          <textarea id="t-desc" rows={3} value={form.description} onChange={set('description')} placeholder="Optional details" />
        </Field>
        <div className="grid-2">
          <Field label="Priority" htmlFor="t-pri"><select id="t-pri" value={form.priority} onChange={set('priority')}>{PRIORITIES.map((p) => <option key={p}>{p}</option>)}</select></Field>
          <Field label="Status" htmlFor="t-status"><select id="t-status" value={form.status} onChange={set('status')}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select></Field>
          <Field label="Due date" htmlFor="t-due"><input id="t-due" type="date" value={form.dueDate} onChange={set('dueDate')} /></Field>
          <Field label="Project" htmlFor="t-proj">
            <select id="t-proj" value={form.project} onChange={set('project')}>
              <option value="">No project</option>
              {projects.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
          </Field>
        </div>
        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={saving}>{saving ? <Spinner /> : task ? 'Save changes' : 'Create task'}</button>
        </div>
      </form>
    </Modal>
  );
}
