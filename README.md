# 7-Eleven Job Application Management System

A job application management web app specifically designed for 7-Eleven franchisees, streamlining the connection between job seekers and franchise opportunities.

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