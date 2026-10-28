const Task = require('../models/Task');
const Project = require('../models/Project');

// Ensures a project id belongs to the logged-in user
async function checkProject(projectId, userId) {
  if (!projectId) return null;
  const p = await Project.findOne({ _id: projectId, user: userId });
  if (!p) { const e = new Error('Project not found'); e.status = 404; throw e; }
  return p._id;
}

exports.getTasks = async (req, res, next) => {
  try {
    const { search, status, priority, project, due, sort = '-createdAt' } = req.query;
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 500);
    const filter = { user: req.user._id }; // ownership enforced here
    if (search) filter.title = { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (project) filter.project = project === 'none' ? null : project;

    const startOfToday = new Date(); startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(startOfToday); endOfToday.setDate(endOfToday.getDate() + 1);
    const endOfWeek = new Date(startOfToday); endOfWeek.setDate(endOfWeek.getDate() + 7);
    if (due === 'overdue') { filter.dueDate = { $lt: startOfToday }; if (!status) filter.status = { $ne: 'Completed' }; }
    if (due === 'today') filter.dueDate = { $gte: startOfToday, $lt: endOfToday };
    if (due === 'week') filter.dueDate = { $gte: startOfToday, $lt: endOfWeek };
    if (due === 'none') filter.dueDate = null;

    const allowedSorts = ['createdAt', '-createdAt', 'dueDate', '-dueDate', 'title', '-title', 'priority'];
    const sortBy = allowedSorts.includes(sort) ? sort : '-createdAt';

    const [tasks, total] = await Promise.all([
      Task.find(filter).populate('project', 'name color').sort(sortBy).skip((page - 1) * limit).limit(limit),
      Task.countDocuments(filter),
    ]);
    res.json({ tasks, total, page, pages: Math.ceil(total / limit) || 1 });
  } catch (err) { next(err); }
};

exports.createTask = async (req, res, next) => {
  try {
    const { title, description, priority, status, dueDate, project } = req.body;
    const projectId = await checkProject(project, req.user._id);
    const task = await Task.create({
      user: req.user._id, title, description, priority, status, project: projectId,
      dueDate: dueDate || null, completedAt: status === 'Completed' ? new Date() : null,
    });
    res.status(201).json({ task: await task.populate('project', 'name color') });
  } catch (err) { next(err); }
};

exports.getTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id }).populate('project', 'name color');
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ task });
  } catch (err) { next(err); }
};

exports.updateTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    const { title, description, priority, status, dueDate, project } = req.body;
    if (project !== undefined) task.project = await checkProject(project, req.user._id);
    task.title = title;
    if (description !== undefined) task.description = description;
    if (priority) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate || null;
    if (status && status !== task.status) {
      task.status = status;
      task.completedAt = status === 'Completed' ? new Date() : null;
    }
    await task.save();
    res.json({ task: await task.populate('project', 'name color') });
  } catch (err) { next(err); }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    task.status = req.body.status;
    task.completedAt = task.status === 'Completed' ? new Date() : null;
    await task.save();
    res.json({ task: await task.populate('project', 'name color') });
  } catch (err) { next(err); }
};

exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted' });
  } catch (err) { next(err); }
};
