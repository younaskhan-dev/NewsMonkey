import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI environment variable is not defined");
    }
    
    // Add robust TLS options to handle Windows OpenSSL / Atlas handshake alerts
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      tls: true,
      tlsAllowInvalidCertificates: true,
      serverSelectionTimeoutMS: 15000,
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};
