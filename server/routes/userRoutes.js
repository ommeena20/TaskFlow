const router = require('express').Router();
const c = require('../controllers/userController');
const protect = require('../middleware/auth');
const { profileRules } = require('../middleware/validate');

router.use(protect);
router.route('/me').get(c.getMe).patch(profileRules, c.updateMe);
module.exports = router;
