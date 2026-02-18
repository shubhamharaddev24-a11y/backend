const http = require('http');
const app = require('./app');
const { PORT } = require('./config/env');

// Create HTTP server
const server = http.createServer(app);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

// Start server
const port = PORT || 5000;
server.listen(port, () => {
  console.log(`🚀 Server running on port ${port} in ${process.env.NODE_ENV} mode`);
  console.log(`📱 Health check: http://localhost:${port}/health`);
  console.log(`🔗 API Base URL: http://localhost:${port}/api`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    console.log('💥 Process terminated!');
  });
});
