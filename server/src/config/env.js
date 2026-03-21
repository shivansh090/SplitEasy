const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const useDB = process.env.USE_DB === 'true';

const requiredVars = ['JWT_SECRET', 'OPENROUTER_API_KEY'];
if (useDB) requiredVars.push('MONGODB_URI');

for (const varName of requiredVars) {
  if (!process.env[varName]) {
    console.error(`Missing required environment variable: ${varName}`);
    process.exit(1);
  }
}

module.exports = {
  port: parseInt(process.env.PORT, 10) || 5000,
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  openrouterApiKey: process.env.OPENROUTER_API_KEY,
  llmModel: process.env.LLM_MODEL || 'openrouter/auto',
  nodeEnv: process.env.NODE_ENV || 'development',
  useDB,
};
