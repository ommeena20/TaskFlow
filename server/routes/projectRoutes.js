const router = require('express').Router();
const c = require('../controllers/projectController');
const protect = require('../middleware/auth');
const { projectRules } = require('../middleware/validate');

router.use(protect);
router.route('/').get(c.getProjects).post(projectRules, c.createProject);
router.route('/:id').get(c.getProject).put(projectRules, c.updateProject).delete(c.deleteProject);
module.exports = router;
