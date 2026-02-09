import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../src/config/db';
import Category from '../src/models/Category';

dotenv.config();

const categories = [
  { name: 'Health', slug: 'health', description: 'General health topics' },
  { name: 'Wellbeing', slug: 'wellbeing', description: 'Mental and emotional wellbeing' },
  { name: 'Lifestyle', slug: 'lifestyle', description: 'Lifestyle choices and tips' },
  { name: 'Fitness', slug: 'fitness', description: 'Workouts and physical fitness' },
  { name: 'Nutrition', slug: 'nutrition', description: 'Diet and nutrition advice' },
];

const seedCategories = async () => {
  try {
    await connectDB();

    // Check if categories exist
    const count = await Category.countDocuments();
    if (count > 0) {
      console.log('Categories already exist. Skipping seeding.');
      process.exit();
    }

    await Category.insertMany(categories);
    console.log('Categories seeded successfully');
    process.exit();
  } catch (error) {
    console.error('Error seeding categories:', error);
    process.exit(1);
  }
};

seedCategories();
