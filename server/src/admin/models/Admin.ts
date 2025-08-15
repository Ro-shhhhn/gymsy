import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

interface IAdmin extends mongoose.Document {
  email: string;
  password: string;
  name: string;
  role: 'super_admin' | 'admin';
  isActive: boolean;
  lastLogin?: Date;
  loginCount?: number; // Added this property
  permissions?: string[]; // Added this property - adjust type as needed
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['super_admin', 'admin'], default: 'admin' },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  loginCount: { type: Number, default: 0 }, // Added this field
  permissions: { type: [String], default: [] } // Added this field - adjust as needed
}, { timestamps: true });

adminSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IAdmin>('Admin', adminSchema);