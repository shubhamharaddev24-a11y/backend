# Shubham Photos Studio Backend

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start MongoDB**
   ```bash
   mongod
   ```

4. **Start Server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## Default Admin Access

- **Username:** admin
- **Password:** password

⚠️ **Change default credentials in production!**

## API Base URL

- **Development:** http://localhost:5000/api
- **Health Check:** http://localhost:5000/health

## Key Features

✅ Professional layered architecture
✅ JWT Authentication with role-based access
✅ Complete CRUD operations for all entities
✅ Email notifications (Nodemailer)
✅ SMS/WhatsApp integration (Twilio)
✅ File upload with Cloudinary
✅ Input validation and sanitization
✅ Rate limiting and security
✅ Comprehensive error handling
✅ Database indexing for performance
✅ Graceful shutdown handling

## Documentation

See [README.md](./README.md) for detailed documentation.
