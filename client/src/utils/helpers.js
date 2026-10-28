export const STATUSES = ['Todo', 'In Progress', 'Completed'];
export const PRIORITIES = ['Low', 'Medium', 'High'];
export const PROJECT_COLORS = ['#4f46e5', '#0d9488', '#e11d48', '#d97706', '#7c3aed', '#0284c7', '#16a34a', '#db2777'];

export const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'No due date');
export const toInputDate = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '');

export const isOverdue = (task) => {
  if (!task.dueDate || task.status === 'Completed') return false;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  return new Date(task.dueDate) < today;
};

export const pct = (done, total) => (total ? Math.round((done / total) * 100) : 0);
export const initials = (name = '') => name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
