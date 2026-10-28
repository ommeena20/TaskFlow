const Project = require('../models/Project');
const Task = require('../models/Task');

exports.getProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({ user: req.user._id }).sort('-createdAt').lean();
    // Count tasks per project in one query
    const counts = await Task.aggregate([
      { $match: { user: req.user._id, project: { $ne: null } } },
      { $group: { _id: '$project', total: { $sum: 1 }, completed: { $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] } } } },
    ]);
    const map = Object.fromEntries(counts.map((c) => [c._id.toString(), c]));
    res.json({
      projects: projects.map((p) => ({ ...p, taskCount: map[p._id]?.total || 0, completedCount: map[p._id]?.completed || 0 })),
    });
  } catch (err) { next(err); }
};

exports.createProject = async (req, res, next) => {
  try {
    const { name, description, color } = req.body;
    const project = await Project.create({ user: req.user._id, name, description, color });
    res.status(201).json({ project });
  } catch (err) { next(err); }
};

exports.getProject = async (req, res, next) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, user: req.user._id });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    const tasks = await Task.find({ project: project._id, user: req.user._id }).sort('-createdAt');
    res.json({ project, tasks });
  } catch (err) { next(err); }
};

exports.updateProject = async (req, res, next) => {
  try {
    const { name, description, color } = req.body;
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { name, description, color },
      { new: true, runValidators: true }
    );
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json({ project });
  } catch (err) { next(err); }
};

exports.deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    // Keep the tasks, just detach them from the deleted project
    await Task.updateMany({ project: project._id, user: req.user._id }, { project: null });
    res.json({ message: 'Project deleted' });
  } catch (err) { next(err); }
};
