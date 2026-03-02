const mongoose = require('mongoose');

const entitySchema = new mongoose.Schema({
  icon: { type: String, required: true },
  route: { type: String, required: true },
  label: { type: String, required: true },
  action: [{ 
    type: String, 
    enum: ['read', 'create', 'edit', 'delete', 'store', 'view'], 
    required: true 
  }]
}, { _id: false });

const RoleSchema = new mongoose.Schema({
  role: { type: String, required: true },
  slug: { type: String, unique: true, index: true },
  panel: { type: String, required: true },
  entity: [entitySchema],
  createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
  }
}, { timestamps: true });

// Pre-save hook to generate slug from role field
// RoleSchema.pre('save', function(next) {
//   if (this.isModified('role') || !this.slug) {
//     this.slug = this.role.toLowerCase().trim().replace(/\s+/g, '-');
//   }
//   next();
// });

RoleSchema.pre('save', function () {
  if (this.isModified('role') || !this.slug) {
    this.slug = this.role
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-');
  }
});


module.exports = mongoose.model('Role', RoleSchema);