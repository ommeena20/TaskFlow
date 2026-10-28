const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    description: { type: String, trim: true, maxlength: 500, default: '' },
    color: { type: String, default: '#4f46e5', match: /^#[0-9a-fA-F]{6}$/ },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Project', projectSchema);
