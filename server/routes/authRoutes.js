const router = require('express').Router();
const c = require('../controllers/authController');
const protect = require('../middleware/auth');
const { registerRules, loginRules } = require('../middleware/validate');

router.post('/register', registerRules, c.register);
router.post('/login', loginRules, c.login);
router.post('/logout', c.logout);
router.get('/me', protect, c.me);
module.exports = router;
