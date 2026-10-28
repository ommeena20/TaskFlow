import { useState } from 'react';
import { Modal, Field, Spinner } from './ui.jsx';
import api, { errMsg } from '../api.js';
import { useToast } from '../context/ToastContext.jsx';
import { PROJECT_COLORS } from '../utils/helpers.js';

export default function ProjectForm({ project, onSaved, onClose }) {
  const toast = useToast();
  const [form, setForm] = useState({ name: project?.name || '', description: project?.description || '', color: project?.color || PROJECT_COLORS[0] });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setError('Project name is required');
    setError(''); setSaving(true);
    try {
      const { data } = project ? await api.put(`/projects/${project._id}`, form) : await api.post('/projects', form);
      toast.success(project ? 'Project updated' : 'Project created');
      onSaved(data.project);
    } catch (err) { toast.error(errMsg(err)); } finally { setSaving(false); }
  };

  return (
    <Modal title={project ? 'Edit project' : 'New project'} onClose={onClose}>
      <form onSubmit={submit} noValidate>
        <Field label="Name" htmlFor="p-name" error={error}>
          <input id="p-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Portfolio Website" autoFocus />
        </Field>
        <Field label="Description" htmlFor="p-desc">
          <textarea id="p-desc" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </Field>
        <Field label="Color">
          <div className="swatches" role="radiogroup" aria-label="Project color">
            {PROJECT_COLORS.map((c) => (
              <button type="button" key={c} role="radio" aria-checked={form.color === c} aria-label={c}
                className={`swatch ${form.color === c ? 'active' : ''}`} style={{ background: c }} onClick={() => setForm({ ...form, color: c })} />
            ))}
          </div>
        </Field>
        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={saving}>{saving ? <Spinner /> : project ? 'Save changes' : 'Create project'}</button>
        </div>
      </form>
    </Modal>
  );
}
