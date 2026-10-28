const router = require('express').Router();
const c = require('../controllers/taskController');
const protect = require('../middleware/auth');
const { taskRules, statusRules } = require('../middleware/validate');

router.use(protect);
router.route('/').get(c.getTasks).post(taskRules, c.createTask);
router.route('/:id').get(c.getTask).put(taskRules, c.updateTask).delete(c.deleteTask);
router.patch('/:id/status', statusRules, c.updateStatus);
module.exports = router;
