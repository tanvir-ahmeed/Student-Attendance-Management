# Student Attendance Management System

A full-stack web application for managing student attendance built with React,
TypeScript, Node.js, Express, and MongoDB.

## Features

- Teacher/Admin authentication
- Class management
- Student management
- Attendance tracking
- Attendance history with filtering
- Responsive UI with Tailwind CSS

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Backend**: Node.js, Express, MongoDB with Mongoose
- **Authentication**: JWT
- **State Management**: React Context API

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)

## Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd student-attendance-management
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables: Create a `.env` file in the root directory with
   the following variables:

   ```
   MONGODB_URI=mongodb://localhost:27017/attendance_system
   JWT_SECRET=your_jwt_secret_key
   PORT=5000
   ```

4. Start MongoDB locally or update the `MONGODB_URI` to point to your MongoDB
   instance.
   - For local MongoDB installation: `mongod`
   - For MongoDB Atlas (cloud): Update `MONGODB_URI` with your connection string

## Running the Application

### Development Mode

1. Start the backend server:

   ```bash
   npm run dev:server
   ```

2. In a separate terminal, start the frontend development server:
   ```bash
   npm run dev
   ```

### Production Mode

1. Build the frontend:

   ```bash
   npm run build
   ```

2. Start the backend server:
   ```bash
   npm run server
   ```

## Seeding Initial Data

To seed the database with initial data (admin user, classes, students, and
attendance records):

1. Make sure MongoDB is running
2. Run the seed script:
   ```bash
   npm run seed
   ```

This will create an admin user with the following credentials:

- Email: admin@example.com
- Password: password123

## API Endpoints

### Authentication

- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register (for testing)

### Classes

- `GET /api/classes` - Get all classes
- `POST /api/classes` - Create a class
- `PUT /api/classes/:id` - Update a class
- `DELETE /api/classes/:id` - Delete a class

### Students

- `GET /api/students` - Get all students
- `GET /api/students/class/:classId` - Get students by class
- `POST /api/students` - Create a student
- `PUT /api/students/:id` - Update a student
- `DELETE /api/students/:id` - Delete a student

### Attendance

- `GET /api/attendance` - Get attendance records
- `POST /api/attendance` - Mark attendance
- `GET /api/attendance/summary/:classId/:date` - Get attendance summary

## Folder Structure

```
student-attendance-management/
├── models/          # Mongoose models
├── routes/          # API routes
├── middleware/      # Express middleware
├── db/              # Database connection
├── utils/           # Utility functions
├── components/      # React components
├── pages/           # Page components
├── contexts/        # React context providers
├── public/          # Static assets
└── src/             # Source files
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a pull request

## License

This project is licensed under the MIT License.
