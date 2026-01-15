const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Check if MONGO_URI is set
        if (!process.env.MONGO_URI) {
            console.error('❌ Error: MONGO_URI is not defined in .env file');
            console.log('📝 Please add MONGO_URI to your .env file');
            console.log('   Example: MONGO_URI=mongodb://localhost:27017/crm-db');
            process.exit(1);
        }

        // Validate MONGO_URI format
        const mongoUri = process.env.MONGO_URI.trim();
        if (mongoUri.length < 10) {
            console.error('❌ Error: MONGO_URI appears to be invalid or too short');
            console.log('📝 Current MONGO_URI:', mongoUri);
            console.log('📝 For local MongoDB: mongodb://localhost:27017/crm-db');
            console.log('📝 For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/crm-db');
            process.exit(1);
        }

        await mongoose.connect(mongoUri);
        console.log('✅ MongoDB connected successfully');
    } catch (error) {
        console.error('❌ MongoDB connection error:');
        console.error('   Error:', error.message);
        
        if (error.message.includes('ENOTFOUND') || error.message.includes('querySrv')) {
            console.error('\n📝 This usually means:');
            console.error('   1. MONGO_URI is malformed or incomplete');
            console.error('   2. For local MongoDB, make sure MongoDB is running');
            console.error('   3. For Atlas, check your connection string format');
            console.error('\n📝 Check your .env file:');
            console.error('   Current MONGO_URI:', process.env.MONGO_URI || 'NOT SET');
        }
        
        process.exit(1);
    }
};

module.exports = connectDB;