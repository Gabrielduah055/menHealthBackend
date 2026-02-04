import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import AdminUser from '../src/models/AdminUser';

dotenv.config();

const seedAdmin = async () => {
  try {
    const dbUri = process.env.MONGODB_URI;
    if (!dbUri) {
      throw new Error('MONGODB_URI is not defined');
    }

    await mongoose.connect(dbUri);
    console.log('MongoDB Connected');

    const email = 'admin@example.com';
    const password = 'password123';
    
    // Generate new hash
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    let admin = await AdminUser.findOne({ email });

    if (admin) {
      // Update existing admin password
      admin.passwordHash = passwordHash;
      admin.role = 'admin'; // ensure role is correct
      await admin.save();
      console.log('Existing admin password updated');
    } else {
      // Create new admin
      admin = new AdminUser({
        name: 'Super Admin',
        email,
        passwordHash,
        role: 'admin',
        isActive: true,
      });
      await admin.save();
      console.log('New admin user created');
    }

    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedAdmin();
