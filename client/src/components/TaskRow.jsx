import { Link } from 'react-router-dom';
import { Calendar, Pencil, Trash2, Check } from 'lucide-react';
import { Badge } from './ui.jsx';
import { fmtDate, isOverdue } from '../utils/helpers.js';

// One task line. Used on Tasks, Dashboard (no actions) and Project details.
export default function TaskRow({ task, onToggle, onEdit, onDelete }) {
  const done = task.status === 'Completed';
  return (
    <div className={`task-row ${done ? 'is-done' : ''}`}>
      {onToggle ? (
        <button className={`check ${done ? 'checked' : ''}`} onClick={() => onToggle(task)} aria-label={done ? 'Mark as not completed' : 'Mark as completed'}>
          {done && <Check size={14} />}
        </button>
      ) : <span className="dot" style={{ background: task.project?.color || '#cbd5e1' }} />}
      <div className="task-main">
        <Link to={`/tasks/${task._id}`} className="task-title">{task.title}</Link>
        <div className="task-meta">
          {task.project && <span className="chip"><i style={{ background: task.project.color }} />{task.project.name}</span>}
          <span className={`meta-date ${isOverdue(task) ? 'overdue' : ''}`}><Calendar size={13} /> {fmtDate(task.dueDate)}{isOverdue(task) && ' · Overdue'}</span>
        </div>
      </div>
      <div className="task-badges"><Badge kind="priority" value={task.priority} /><Badge kind="status" value={task.status} /></div>
      {(onEdit || onDelete) && (
        <div className="row-actions">
          {onEdit && <button className="icon-btn" onClick={() => onEdit(task)} aria-label={`Edit ${task.title}`}><Pencil size={16} /></button>}
          {onDelete && <button className="icon-btn danger" onClick={() => onDelete(task)} aria-label={`Delete ${task.title}`}><Trash2 size={16} /></button>}
        </div>
      )}
    </div>
  );
}
