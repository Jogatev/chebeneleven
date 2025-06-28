# 7-Eleven Job Application Management System

A job application management web app specifically designed for 7-Eleven franchisees, streamlining the connection between job seekers and franchise opportunities.

## Environment Variables

This application requires several environment variables to be configured. Copy `env.example` to `.env` and fill in your values:

```bash
cp env.example .env
```

### Required Environment Variables

- `DB_CONNECTION_STRING`: PostgreSQL connection string
- `SESSION_SECRET`: Secret key for session management
- `EMAIL_API_KEY`: API key for email service (Resend)
- `GOOGLE_MAPS_API_KEY`: Google Maps API key
- `VITE_GOOGLE_MAPS_API_KEY`: Google Maps API key for client-side (same as above)

### Optional Environment Variables

- `DB_TYPE`: Database type (default: 'memory')
- `PORT`: Server port (default: 3000)
- `HOST`: Server host (default: 'localhost')
- `NODE_ENV`: Environment (development/production)
- `API_BASE_PATH`: API base path (default: '/api')
- `API_VERSION`: API version (default: 'v1')
- `SESSION_MAX_AGE`: Session max age in milliseconds (default: 86400000)
- `EMAIL_PROVIDER`: Email provider (default: 'resend')
- `FROM_EMAIL`: From email address
- `MAX_FILE_SIZE`: Maximum file upload size (default: 5242880)
- `ALLOWED_FILE_TYPES`: Comma-separated allowed file types
- `UPLOAD_DIR`: Upload directory (default: './uploads')
- `CORS_ORIGIN`: CORS origin (default: 'http://localhost:5173')

## Security Notes

- Never commit `.env` files to version control
- Use strong, unique values for `SESSION_SECRET`
- Keep API keys secure and rotate them regularly
- Use environment-specific configurations for production

## Running with Docker

This project can be easily run using Docker. Follow these steps:

### Prerequisites

- Docker installed on your machine
- Docker Compose installed on your machine

### Steps to Run

1. Clone the repository:
   ```
   git clone <repository-url>
   cd <repository-directory>
   ```

2. Set up environment variables:
   Edit the `docker-compose.yml` file and replace `your_session_secret_here` with a secure secret key.

3. Build and start the Docker container:
   ```
   docker-compose up -d
   ```

4. Access the application:
   Open your browser and navigate to http://localhost:5000

5. To stop the application:
   ```
   docker-compose down
   ```

## Development

To run the application in development mode without Docker:

1. Install dependencies:
   ```
   npm install
   ```

2. Set the SESSION_SECRET environment variable:
   ```
   export SESSION_SECRET=your_secret_here
   ```

3. Start the development server:
   ```
   npm run dev
   ```

## Features

- User authentication for franchisees and job applicants
- Job posting management for franchisees
- Application submission and tracking
- Resume upload
- Application status management

## Technology Stack

- TypeScript
- React.js with Vite
- Express.js backend
- In-memory storage (can be configured for persistent database)
- tailwindcss and shadcn/ui for styling