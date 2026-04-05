const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      enum: ['viewer', 'analyst', 'admin'],
      unique: true,
      required: true,
    },
    permissions: [
      {
        type: String,
        enum: ['read:records', 'read:dashboard', 'create:records', 'update:own_records', 'update:records', 'delete:records', 'manage:users'],
      },
    ],
    description: String,
  },
  { timestamps: true }
);

// Seed default roles if they don't exist
roleSchema.statics.seedRoles = async function () {
  const defaultRoles = [
    {
      name: 'viewer',
      permissions: ['read:records', 'read:dashboard'],
      description: 'Can view dashboard and records only',
    },
    {
      name: 'analyst',
      permissions: ['read:records', 'read:dashboard', 'create:records', 'update:own_records'],
      description: 'Can view, create records and access insights',
    },
    {
      name: 'admin',
      permissions: ['read:records', 'read:dashboard', 'create:records', 'update:records', 'delete:records', 'manage:users'],
      description: 'Full access to all system features',
    },
  ];

  for (const roleData of defaultRoles) {
    await this.findOneAndUpdate({ name: roleData.name }, roleData, {
      upsert: true,
      returnDocument: 'after',
    });
  }
};

module.exports = mongoose.model('Role', roleSchema);
