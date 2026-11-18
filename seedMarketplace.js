const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/User.model');
const Booking = require('./src/models/Booking.model');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/shubham-photos';

const seedMarketplace = async () => {
  try {
    console.log('Connecting to database:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB Connected successfully.');

    // 1. Create or get sample Client
    let client = await User.findOne({ email: 'client@creaonnect.com' });
    if (!client) {
      client = await User.create({
        name: 'Rahul Sharma',
        email: 'client@creaonnect.com',
        password: 'ClientPassword123',
        role: 'client',
        phone: '+91 98201 12345',
        city: 'Mumbai',
        isActive: true
      });
      console.log('Sample Client created: client@creaonnect.com / ClientPassword123');
    }

    // 2. Create or get sample Freelancer Photographer
    let freelancer = await User.findOne({ email: 'creator@creaonnect.com' });
    if (!freelancer) {
      freelancer = await User.create({
        name: 'Aakash Verma',
        email: 'creator@creaonnect.com',
        password: 'CreatorPassword123',
        role: 'freelancer',
        phone: '+91 97654 32109',
        city: 'Thane',
        skills: ['Pre-Wedding', 'Cinematography', 'Drone Cinematics', 'Traditional Wedding'],
        totalEarnings: 24500,
        isActive: true
      });
      console.log('Sample Freelancer created: creator@creaonnect.com / CreatorPassword123');
    }

    // 3. Keep orders dynamic - do not insert mock orders
    console.log('Orders database is left clean for real dynamic photoshoot bookings.');

    await mongoose.disconnect();
    console.log('Database disconnected.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding marketplace:', error);
    process.exit(1);
  }
};

seedMarketplace();
