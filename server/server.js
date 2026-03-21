// Allow self-signed certs (VPN/corporate proxy intercepting HTTPS)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const app = require('./src/app');
const connectDB = require('./src/config/db');
const { port } = require('./src/config/env');

const start = async () => {
  await connectDB();
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
};

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
