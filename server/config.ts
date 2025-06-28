export const config = {
  database: {
    type: process.env.DB_TYPE || 'memory',
    connectionString: process.env.DB_CONNECTION_STRING || '',
  },
  server: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || 'localhost',
  },
  api: {
    basePath: process.env.API_BASE_PATH || '/api',
    version: process.env.API_VERSION || 'v1',
  },
  auth: {
    sessionSecret: process.env.SESSION_SECRET || '',
    sessionMaxAge: parseInt(process.env.SESSION_MAX_AGE || '86400000'),
  },
  email: {
    provider: process.env.EMAIL_PROVIDER || 'resend',
    apiKey: process.env.EMAIL_API_KEY || '',
    fromEmail: process.env.FROM_EMAIL || 'noreply@example.com',
  },
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'),
    allowedTypes: process.env.ALLOWED_FILE_TYPES?.split(',') || ['.pdf', '.doc', '.docx'],
    uploadDir: process.env.UPLOAD_DIR || './uploads',
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  },
  maps: {
    apiKey: process.env.GOOGLE_MAPS_API_KEY || '',
  }
};

export const getApiPath = (endpoint: string) => `${config.api.basePath}${endpoint}`;

export const validateConfig = () => {
  const required = [
    { key: 'DB_CONNECTION_STRING', value: config.database.connectionString },
    { key: 'SESSION_SECRET', value: config.auth.sessionSecret },
    { key: 'EMAIL_API_KEY', value: config.email.apiKey },
    { key: 'GOOGLE_MAPS_API_KEY', value: config.maps.apiKey },
  ];

  const missing = required.filter(item => !item.value);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.map(item => item.key).join(', ')}`);
  }
}; 