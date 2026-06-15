export function validateEnv() {
  const requiredVars = ['MONGODB_URI', 'GEMINI_API_KEY', 'CHANNEL_SERVICE_URL'];
  const missing = [];

  for (const envVar of requiredVars) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  if (missing.length > 0) {
    console.error('================================================');
    console.error('FATAL ERROR: Missing required environment variables');
    console.error('Please configure the following in your .env file:');
    missing.forEach(v => console.error(`- ${v}`));
    console.error('================================================');
    process.exit(1);
  }
}
