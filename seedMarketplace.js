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

    // 3. Clear existing demo open orders if needed, or check
    const existingOpenCount = await Booking.countDocuments({ status: 'open' });
    if (existingOpenCount === 0) {
      const sampleOrders = [
        {
          title: 'Sunset Pre-Wedding Photoshoot & Drone Video',
          customerName: 'Rahul Sharma & Sneha',
          customerEmail: 'rahul.sneha@gmail.com',
          customerPhone: '+91 98201 12345',
          eventType: 'pre-wedding',
          eventDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // in 14 days
          eventLocation: 'Lonavala & Pawna Lake, Maharashtra',
          eventDuration: 'Full Day',
          guestCount: 2,
          budget: 18000,
          commissionRate: 10,
          platformFee: 1800,
          freelancerPayout: 16200,
          message: 'Looking for a creative photographer for a cinematic sunset pre-wedding shoot with drone shots. 2-3 outfit changes required.',
          status: 'open',
          expiryHours: 24,
          expiresAt: new Date(Date.now() + 18 * 60 * 60 * 1000), // 18 hours from now
          client: client._id
        },
        {
          title: 'Traditional Wedding Ceremony & Candid Photography',
          customerName: 'Pooja Patel',
          customerEmail: 'pooja.weddings@gmail.com',
          customerPhone: '+91 98112 44556',
          eventType: 'wedding',
          eventDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // in 30 days
          eventLocation: 'Kalyan West, Thane',
          eventDuration: '2 Days',
          guestCount: 350,
          budget: 45000,
          commissionRate: 10,
          platformFee: 4500,
          freelancerPayout: 40500,
          message: 'Need 1 lead candid photographer and 1 traditional videographer for 2-day wedding (Haldi, Sangeet & Reception).',
          status: 'open',
          expiryHours: 12,
          expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours from now (expiring soon!)
          client: client._id
        },
        {
          title: 'Fashion Brand Lookbook & Model Portfolio Shoot',
          customerName: 'Kunal Deshmukh',
          customerEmail: 'kunal.fashion@gmail.com',
          customerPhone: '+91 99230 77889',
          eventType: 'commercial',
          eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // in 7 days
          eventLocation: 'Bandra Studio, Mumbai',
          eventDuration: 'Half Day',
          guestCount: 5,
          budget: 12000,
          commissionRate: 10,
          platformFee: 1200,
          freelancerPayout: 10800,
          message: 'Indoor studio shoot with studio lights for our upcoming autumn clothing line. Need 20 retouched high-res photos.',
          status: 'open',
          expiryHours: 24,
          expiresAt: new Date(Date.now() + 22 * 60 * 60 * 1000), // 22 hours from now
          client: client._id
        }
      ];

      await Booking.insertMany(sampleOrders);
      console.log(`Created ${sampleOrders.length} sample active marketplace orders with countdown timers.`);
    } else {
      console.log(`Marketplace already has ${existingOpenCount} active orders.`);
    }

    await mongoose.disconnect();
    console.log('Database disconnected.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding marketplace:', error);
    process.exit(1);
  }
};

seedMarketplace();
