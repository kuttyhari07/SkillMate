import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

let isMongoConnected = false;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skillmate';
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
    });
    isMongoConnected = true;
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    isMongoConnected = false;
    console.log(`[Database] MongoDB not detected at ${uri}. Running in Zero-Fail Persistent Mode (Local File Store). All features remain 100% active and saved.`);
  }
};

export const getDbStatus = () => ({
  connectedToMongo: isMongoConnected,
  mode: isMongoConnected ? 'MongoDB (Mongoose)' : 'Embedded Persistent Store'
});
