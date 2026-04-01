const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Audit = require('./models/Audit');
const Checklist = require('./models/Checklist');
const Assignment = require('./models/Assignment');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // Clear existing data
  await Promise.all([User.deleteMany(), Audit.deleteMany(), Checklist.deleteMany(), Assignment.deleteMany()]);
  console.log('Cleared existing data');

  // Create users
  const adminUser = await User.create({ name: 'Admin User', email: 'admin@demo.com', password: 'password123', role: 'admin' });
  const auditor1 = await User.create({ name: 'Sarah Chen', email: 'auditor@demo.com', password: 'password123', role: 'auditor' });
  const dept1 = await User.create({ name: 'John IT', email: 'dept@demo.com', password: 'password123', role: 'department', department: 'IT' });
  const dept2 = await User.create({ name: 'Alice Finance', email: 'finance@demo.com', password: 'password123', role: 'department', department: 'Finance' });
  console.log('Created users');

  // Create audit
  const audit = await Audit.create({
    title: 'Annual ISO 27001 Compliance Audit 2024',
    description: 'Annual information security management system audit',
    framework: 'ISO 27001',
    status: 'active',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    createdBy: adminUser._id,
    departments: ['IT', 'Finance', 'HR']
  });
  console.log('Created audit');

  // Create checklist items
  const items = await Checklist.insertMany([
    { audit: audit._id, title: 'Data Encryption at Rest', description: 'Verify all sensitive data is encrypted using AES-256', category: 'Data Security', assignedDepartment: 'IT', priority: 'critical' },
    { audit: audit._id, title: 'Access Control Policy', description: 'Review and validate role-based access control implementation', category: 'Access Control', assignedDepartment: 'IT', priority: 'high' },
    { audit: audit._id, title: 'Incident Response Plan', description: 'Ensure a documented incident response procedure exists', category: 'Incident Management', assignedDepartment: 'IT', priority: 'high' },
    { audit: audit._id, title: 'Financial Data Backup', description: 'Verify daily backups of all financial records', category: 'Backup & Recovery', assignedDepartment: 'Finance', priority: 'critical' },
    { audit: audit._id, title: 'Vendor Risk Assessment', description: 'Assess risks from third-party financial vendors', category: 'Risk Management', assignedDepartment: 'Finance', priority: 'medium' },
    { audit: audit._id, title: 'Password Policy Enforcement', description: 'Confirm minimum password complexity requirements are enforced', category: 'Access Control', assignedDepartment: 'IT', priority: 'medium', status: 'compliant' },
    { audit: audit._id, title: 'Network Penetration Testing', description: 'Annual penetration test results and remediation', category: 'Network Security', assignedDepartment: 'IT', priority: 'high' },
    { audit: audit._id, title: 'User Awareness Training', description: 'Security awareness training completion records', category: 'Training', assignedDepartment: 'Finance', priority: 'medium', status: 'in-progress' },
  ]);
  console.log('Created checklist items');

  // Create assignment
  await Assignment.create({ audit: audit._id, auditor: auditor1._id, assignedBy: adminUser._id, departments: ['IT', 'Finance'], notes: 'Focus on data security and access control sections first' });
  console.log('Created assignment');

  console.log('\n✅ Seed completed!\n');
  console.log('Demo accounts:');
  console.log('  Admin:    admin@demo.com    / password123');
  console.log('  Auditor:  auditor@demo.com  / password123');
  console.log('  IT Dept:  dept@demo.com     / password123');
  console.log('  Finance:  finance@demo.com  / password123\n');

  await mongoose.disconnect();
}

seed().catch(console.error);
