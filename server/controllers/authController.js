const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
const publicUser = (u) => ({ id: u._id, name: u.name, email: u.email, createdAt: u.createdAt });

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (await User.findOne({ email: email.toLowerCase() })) return res.status(409).json({ message: 'That email is already registered' });
    const user = await User.create({ name, email, password });
    res.status(201).json({ token: signToken(user._id), user: publicUser(user) });
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email.toLowerCase() }).select('+password');
    // Same message for both failures so attackers can't tell which emails exist
    if (!user || !(await user.matchPassword(req.body.password))) return res.status(401).json({ message: 'Incorrect email or password' });
    res.json({ token: signToken(user._id), user: publicUser(user) });
  } catch (err) { next(err); }
};

// With header-based JWT the server stores no session; the client deletes its token.
exports.logout = (req, res) => res.json({ message: 'Logged out' });

exports.me = (req, res) => res.json({ user: publicUser(req.user) });
exports.publicUser = publicUser;
