// Run with: npm run seed   (wipes the demo user's data and recreates it)
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Project = require('./models/Project');
const Task = require('./models/Task');

const day = (n) => { const d = new Date(); d.setDate(d.getDate() + n); d.setHours(12, 0, 0, 0); return d; };

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const old = await User.findOne({ email: 'demo@taskflow.dev' });
  if (old) { await Task.deleteMany({ user: old._id }); await Project.deleteMany({ user: old._id }); await old.deleteOne(); }

  const user = await User.create({ name: 'Demo User', email: 'demo@taskflow.dev', password: 'Demo@1234' });
  const [web, study, home] = await Project.insertMany([
    { user: user._id, name: 'Portfolio Website', description: 'Build and deploy my developer portfolio.', color: '#4f46e5' },
    { user: user._id, name: 'Interview Prep', description: 'DSA practice and MERN revision.', color: '#0d9488' },
    { user: user._id, name: 'Personal', description: 'Life admin and errands.', color: '#e11d48' },
  ]);
  const t = (project, title, description, priority, status, due) => ({
    user: user._id, project: project?._id || null, title, description, priority, status,
    dueDate: due === null ? null : day(due), completedAt: status === 'Completed' ? new Date() : null,
  });
  await Task.insertMany([
    t(web, 'Design landing page', 'Hero, features and footer sections.', 'High', 'Completed', -5),
    t(web, 'Set up Express API', 'Routes, controllers and JWT auth.', 'High', 'Completed', -3),
    t(web, 'Build dashboard UI', 'Stat cards and recent tasks.', 'High', 'In Progress', 2),
    t(web, 'Deploy frontend to Vercel', 'Add VITE_API_URL env variable.', 'Medium', 'Todo', 6),
    t(web, 'Write README with screenshots', 'Setup steps and features list.', 'Low', 'Todo', 9),
    t(study, 'Solve 5 array problems', 'Two pointers and sliding window.', 'Medium', 'In Progress', 0),
    t(study, 'Revise React hooks', 'useEffect, useMemo, useCallback.', 'High', 'Todo', -1),
    t(study, 'Mock interview with a friend', '', 'Medium', 'Todo', 4),
    t(home, 'Pay electricity bill', '', 'High', 'Todo', -2),
    t(home, 'Book train tickets', 'Itarsi to Bhopal.', 'Low', 'Completed', -1),
    t(null, 'Update resume', 'Add TaskFlow project bullets.', 'Medium', 'Todo', null),
  ]);
  console.log('Seeded! Login: demo@taskflow.dev / Demo@1234');
  await mongoose.disconnect();
})().catch((e) => { console.error(e); process.exit(1); });
