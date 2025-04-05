# Solvit - VIT's Q&A Platform

Solvit is a Stack Overflow clone specifically designed for VIT students. It provides a platform where students can ask questions, provide answers, and engage in meaningful discussions.

## Features

- User authentication with VIT email verification
- Ask and answer questions
- Upvote and downvote questions and answers
- Comment on questions and answers
- Search functionality
- User profiles with statistics
- Dark mode interface
- Responsive design

## Tech Stack

- Frontend: React.js
- Backend: Node.js with Express
- Database: MongoDB
- Authentication: JWT with OTP verification
- Styling: Tailwind CSS

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```
3. Set up environment variables:
   - Create `.env` file in the backend directory
   - Add the following variables:
     ```
     MONGODB_URI=your_mongodb_uri
     JWT_SECRET=your_jwt_secret
     SMTP_HOST=your_smtp_host
     SMTP_PORT=your_smtp_port
     SMTP_USER=your_smtp_user
     SMTP_PASS=your_smtp_password
     ```

4. Start the development servers:
   ```bash
   # Start backend server
   cd backend
   npm run dev

   # Start frontend server
   cd frontend
   npm start
   ```

## Project Structure

```
solvit/
├── frontend/           # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   └── utils/
│   └── public/
└── backend/           # Node.js backend
    ├── controllers/
    ├── models/
    ├── routes/
    ├── middleware/
    └── utils/
``` 