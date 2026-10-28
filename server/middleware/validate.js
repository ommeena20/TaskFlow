const STATUS = ['Todo', 'In Progress', 'Completed'];
const PRIORITY = ['Low', 'Medium', 'High'];
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Wraps a rules function: rules(body) returns an array of error strings
const validate = (rules) => (req, res, next) => {
  const errors = rules(req.body || {});
  if (errors.length) return res.status(400).json({ message: errors[0], errors });
  next();
};

const strongPassword = (p) => typeof p === 'string' && p.length >= 8 && /[A-Za-z]/.test(p) && /\d/.test(p);

exports.registerRules = validate((b) => {
  const e = [];
  if (!b.name || !b.name.trim()) e.push('Name is required');
  if (!emailRe.test(b.email || '')) e.push('A valid email is required');
  if (!strongPassword(b.password)) e.push('Password must be 8+ characters with a letter and a number');
  return e;
});

exports.loginRules = validate((b) => {
  const e = [];
  if (!emailRe.test(b.email || '')) e.push('A valid email is required');
  if (!b.password) e.push('Password is required');
  return e;
});

exports.taskRules = validate((b) => {
  const e = [];
  if (!b.title || !b.title.trim()) e.push('Title is required');
  if (b.status !== undefined && !STATUS.includes(b.status)) e.push('Invalid status');
  if (b.priority !== undefined && !PRIORITY.includes(b.priority)) e.push('Invalid priority');
  if (b.dueDate && isNaN(Date.parse(b.dueDate))) e.push('Invalid due date');
  return e;
});
exports.statusRules = validate((b) => (STATUS.includes(b.status) ? [] : ['Invalid status']));

exports.projectRules = validate((b) => {
  const e = [];
  if (!b.name || !b.name.trim()) e.push('Project name is required');
  if (b.color && !/^#[0-9a-fA-F]{6}$/.test(b.color)) e.push('Color must be a hex value like #4f46e5');
  return e;
});

exports.profileRules = validate((b) => {
  const e = [];
  if (b.name !== undefined && !b.name.trim()) e.push('Name cannot be empty');
  if (b.newPassword !== undefined) {
    if (!b.currentPassword) e.push('Current password is required to set a new one');
    if (!strongPassword(b.newPassword)) e.push('New password must be 8+ characters with a letter and a number');
  }
  return e;
});
