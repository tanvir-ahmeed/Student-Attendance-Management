# How to Run the Application

## Prerequisites
1. MongoDB running on localhost:27017
2. Node.js installed (v14+)

## Steps to Run

1. Install dependencies:
   ```
   npm install
   ```

2. Compile TypeScript files:
   ```
   npx tsc -p tsconfig.server.json
   ```

3. Start the backend server:
   ```
   npm run dev:server
   ```
   This starts the Express server on port 5000.

4. In a new terminal, start the frontend development server:
   ```
   npm run dev
   ```
   This starts the Vite development server (usually on port 3011 or next available).

5. Open your browser to the URL shown in the terminal (e.g., http://localhost:3011)

## Troubleshooting Proxy Errors

If you encounter a proxy error like `[vite] http proxy error: /api/auth/login`, it means the Vite proxy cannot reach the backend server. Make sure:

1. The backend server is running on port 5000
2. There are no firewall issues blocking the connection
3. The MongoDB database is accessible

You can test the backend directly by visiting:
- http://localhost:5000/api/health (should return server status)
- http://localhost:5000/api/test (should return test message)