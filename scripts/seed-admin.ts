import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import AdminUser from '../src/models/AdminUser';

// #region agent log
fetch('http://127.0.0.1:7242/ingest/878f4f3b-cbb0-40d7-8e65-1ddb684cc19e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mensHealthBackend/scripts/seed-admin.ts:4',message:'Seed script starting',data:{},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'seed-script'})}).catch(()=>{});
// #endregion

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
