import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI environment variable is not set");
}

export async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB successfully");
    
    // Drop unique index on student email to allow multiple accounts with same email
    try {
      const db = mongoose.connection.db;
      if (db) {
        await db.collection('students').dropIndex('email_1').catch(() => {});
      }
    } catch (e) {
      // Index may not exist, ignore error
    }
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}

export { mongoose };
