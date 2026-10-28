const User = require('../models/User');
const { publicUser } = require('./authController');

exports.getMe = (req, res) => res.json({ user: publicUser(req.user) });

exports.updateMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('+password');
    if (req.body.name !== undefined) user.name = req.body.name;
    if (req.body.newPassword) {
      if (!(await user.matchPassword(req.body.currentPassword))) return res.status(400).json({ message: 'Current password is incorrect' });
      user.password = req.body.newPassword; // hashed by the pre-save hook
    }
    await user.save();
    res.json({ user: publicUser(user) });
  } catch (err) { next(err); }
};
