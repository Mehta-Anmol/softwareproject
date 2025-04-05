# Solvit Frontend

This is the frontend application for Solvit, a Stack Overflow clone for VIT students. The application is built using React and Tailwind CSS.

## Features

- User authentication with VIT email and OTP verification
- Question and answer management
- Voting system for questions and answers
- User profiles with statistics
- Dark mode design
- Responsive layout

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory with the following variables:
```
REACT_APP_API_URL=http://localhost:5000
```

3. Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:3000`.

## Project Structure

```
src/
├── components/     # Reusable UI components
├── context/       # React context providers
├── pages/         # Page components
├── App.js         # Main application component
├── index.js       # Application entry point
└── index.css      # Global styles
```

## Available Scripts

- `npm start`: Runs the app in development mode
- `npm test`: Launches the test runner
- `npm run build`: Builds the app for production
- `npm run eject`: Ejects from Create React App

## Development Guidelines

1. Follow the existing code style and formatting
2. Use functional components with hooks
3. Implement proper error handling
4. Write meaningful commit messages
5. Test your changes before submitting

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Submit a pull request

## License

This project is licensed under the MIT License. 