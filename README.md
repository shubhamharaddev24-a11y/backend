# Shubham Photos Studio Backend

A professional, scalable Node.js/Express backend API for Shubham Photos Studio with enterprise-level architecture.

## 🏗️ Architecture Overview

This backend follows a **layered architecture pattern** with separation of concerns:

```
src/
├── app.js                # Express app configuration
├── server.js             # Server startup and graceful shutdown
├── config/               # Configuration files
├── routes/               # API route definitions
├── controllers/          # Business logic handlers
├── models/               # Database schemas
├── services/             # External service integrations
├── middlewares/          # Custom middleware functions
├── utils/                # Utility functions
└── validators/           # Input validation schemas
```

## 🚀 Features

### **Core Functionality**
- ✅ **RESTful API** with proper HTTP methods
- ✅ **MongoDB** with Mongoose ODM
- ✅ **JWT Authentication** with role-based access
- ✅ **Input Validation** with express-validator
- ✅ **File Upload** with Cloudinary integration
- ✅ **Email Service** with Nodemailer
- ✅ **SMS/WhatsApp** with Twilio integration
- ✅ **Rate Limiting** for API protection
- ✅ **Error Handling** with custom error classes
- ✅ **Security** with Helmet.js
- ✅ **CORS** configuration
- ✅ **Compression** for performance
- ✅ **Logging** with Morgan

### **Business Modules**
- 📸 **Services Management** - Photography services catalog
- 📋 **Lead Management** - Contact form submissions
- 📅 **Booking System** - Event booking with status tracking
- 👥 **User Management** - Admin authentication
- 📧 **Email Notifications** - Automated email alerts
- 📱 **SMS Notifications** - WhatsApp/SMS integration

## 📡 API Endpoints

### **Authentication**
```
POST /api/auth/login          # User login
POST /api/auth/register       # User registration
GET  /api/auth/me           # Get current user
PUT  /api/auth/update-password # Update password
POST /api/auth/logout        # Logout
```

### **Services**
```
GET    /api/services           # Get all services (public)
GET    /api/services/:id       # Get service by ID
POST   /api/services           # Create service (admin)
PUT    /api/services/:id       # Update service (admin)
DELETE /api/services/:id       # Delete service (admin)
PATCH  /api/services/:id/toggle-active # Toggle service (admin)
```

### **Leads** (Contact Form)
```
POST   /api/leads             # Create lead (public)
GET    /api/leads             # Get all leads (admin)
GET    /api/leads/:id         # Get lead by ID (admin)
PATCH  /api/leads/:id/status  # Update lead status (admin)
DELETE /api/leads/:id         # Delete lead (admin)
GET    /api/leads/stats/summary # Get lead statistics (admin)
```

### **Bookings**
```
POST   /api/bookings          # Create booking (public)
GET    /api/bookings          # Get all bookings (admin)
GET    /api/bookings/:id      # Get booking by ID (admin)
PATCH  /api/bookings/:id/status # Update booking status (admin)
PUT    /api/bookings/:id      # Update booking (admin)
DELETE /api/bookings/:id      # Delete booking (admin)
GET    /api/bookings/stats/summary # Get booking statistics (admin)
```

## 🗄️ Database Models

### **User Model**
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (user/admin),
  phone: String,
  avatar: String,
  isActive: Boolean,
  lastLogin: Date
}
```

### **Service Model**
```javascript
{
  name: String,
  description: String,
  category: String (photography/videography/digital/printing),
  price: Number,
  duration: String,
  features: [String],
  images: [{ url, caption, isFeatured }],
  includes: [String],
  deliveryTime: String,
  isActive: Boolean,
  sortOrder: Number,
  tags: [String],
  createdBy: ObjectId (ref: User)
}
```

### **Lead Model**
```javascript
{
  name: String,
  email: String,
  phone: String,
  subject: String (enum),
  message: String,
  status: String (new/read/replied/closed),
  priority: String (low/medium/high),
  source: String (website/phone/referral/social),
  assignedTo: ObjectId (ref: User),
  notes: [{ content, addedBy, createdAt }],
  followUpDate: Date
}
```

### **Booking Model**
```javascript
{
  customerName: String,
  customerEmail: String,
  customerPhone: String,
  service: ObjectId (ref: Service),
  eventType: String (wedding/portrait/event/commercial/other),
  eventDate: Date,
  eventLocation: String,
  eventDuration: String,
  guestCount: Number,
  budget: Number,
  message: String,
  status: String (pending/confirmed/cancelled/completed),
  totalPrice: Number,
  advancePaid: Number,
  balanceDue: Number,
  assignedTo: ObjectId (ref: User),
  notes: [{ content, addedBy, createdAt }],
  contractSent: Boolean,
  contractSigned: Boolean
}
```

## 🔧 Setup Instructions

### **1. Prerequisites**
- Node.js 16+ and npm 8+
- MongoDB 4.4+
- Cloudinary account (for file uploads)
- Gmail account (for email)
- Twilio account (for SMS/WhatsApp)

### **2. Installation**
```bash
# Clone repository
git clone <repository-url>
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit environment variables
nano .env
```

### **3. Environment Configuration**
```env
# Server
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/shubham-photos

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d

# Email (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# SMS (Twilio)
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=+1234567890

# File Upload (Cloudinary)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# CORS
FRONTEND_URL=http://localhost:3000
```

### **4. Start Server**
```bash
# Development
npm run dev

# Production
npm start
```

## 🔐 Security Features

- **Helmet.js** - Security headers
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - API abuse prevention
- **Input Validation** - Data sanitization
- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcrypt.js encryption
- **File Upload Security** - Type and size validation

## 📧 Email Templates

### **Lead Notification**
- Professional HTML design
- Complete lead details
- Admin notification

### **Booking Confirmation**
- Customer confirmation
- Booking details summary
- Professional branding

### **Status Updates**
- Real-time status changes
- Customer notifications

## 📱 SMS/WhatsApp Integration

### **Twilio Configuration**
- SMS notifications for urgent leads
- WhatsApp messaging support
- Phone number formatting

## 📊 Analytics & Reporting

### **Lead Statistics**
- Total leads count
- Status breakdown
- Conversion tracking

### **Booking Statistics**
- Revenue tracking
- Status distribution
- Upcoming events

## 🚀 Deployment

### **Production Setup**
```bash
# Set production environment
export NODE_ENV=production

# Install production dependencies
npm ci --only=production

# Start production server
npm start
```

### **Environment Variables**
- Use strong JWT secrets
- Configure production database
- Set up proper CORS origins
- Configure email/SMS services

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## 📝 API Documentation

### **Response Format**
```json
{
  "success": true,
  "data": {...},
  "message": "Operation successful",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### **Error Format**
```json
{
  "success": false,
  "message": "Error description",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🔄 Development Workflow

1. **Feature Development**
   - Create/modify models
   - Implement controllers
   - Define routes
   - Add validation
   - Test endpoints

2. **Code Quality**
   - ESLint for code style
   - Input validation
   - Error handling
   - Documentation

3. **Testing**
   - Unit tests for utilities
   - Integration tests for API
   - Manual testing

## 📈 Performance Features

- **Database Indexing** - Optimized queries
- **Response Compression** - Faster load times
- **Rate Limiting** - Prevent abuse
- **Caching** - Redis ready (future)
- **File CDN** - Cloudinary integration

## 🛠️ Monitoring & Debugging

- **Morgan Logging** - Request/response logging
- **Error Tracking** - Comprehensive error handling
- **Health Check** - `/health` endpoint
- **Graceful Shutdown** - Proper cleanup

## 📞 Support

For technical support:
- Email: tech@shubhamphotos.com
- Phone: +91 92714 56749
- Documentation: https://docs.shubhamphotos.com

---

**Built with ❤️ for Shubham Photos Studio**
