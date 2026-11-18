const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/shubham-photos';

const clearAllOrders = async () => {
  try {
    console.log('Connecting to database:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB Connected.');

    const Booking = require('./src/models/Booking.model');
    const User = require('./src/models/User.model');

    // 1. Delete all bookings / orders
    const deleteResult = await Booking.deleteMany({});
    console.log(`Successfully cleared ${deleteResult.deletedCount} orders from the database.`);

    // 2. Reset mock / seeded user earnings to 0 so all earnings are 100% dynamically derived from real shoots
    const updateResult = await User.updateMany({}, { totalEarnings: 0 });
    console.log(`Reset totalEarnings to 0 for ${updateResult.matchedCount} users.`);

    const remaining = await Booking.countDocuments();
    console.log(`Remaining orders in database: ${remaining}`);

    await mongoose.disconnect();
    console.log('Database disconnected. All dummy orders cleared successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error clearing orders:', error);
    process.exit(1);
  }
};

clearAllOrders();
