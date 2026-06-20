import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Always resolve .env from the server/ directory, regardless of where the process starts
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000, // timeout after 10s instead of buffering forever
      connectTimeoutMS: 10000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('');
    console.error('══════════════════════════════════════════════════');
    console.error('❌ MONGODB CONNECTION FAILED — Auth will not work!');
    console.error(`   Error: ${error.message}`);
    console.error('');
    console.error('🔧 FIX: Go to MongoDB Atlas → Network Access');
    console.error('   → Add IP Address → Allow access from anywhere (0.0.0.0/0)');
    console.error('   OR update MONGODB_URI in server/.env');
    console.error('══════════════════════════════════════════════════');
    console.error('');
    // Don't exit - let server run so other endpoints still respond
  }
};

// Log DB events
mongoose.connection.on('connected', () => console.log('✅ Mongoose connected to MongoDB'));
mongoose.connection.on('error', (err) => console.error(`❌ Mongoose error: ${err.message}`));
mongoose.connection.on('disconnected', () => console.warn('⚠️  Mongoose disconnected'));

export default connectDB;
