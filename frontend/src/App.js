import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AskQuestion from "./pages/AskQuestion";
import QuestionDetail from "./pages/QuestionDetail";
import UserProfile from "./pages/UserProfile";
import Questions from "./pages/Questions";

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-900">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/ask" element={<AskQuestion />} />
            <Route path="/questions" element={<Questions />} />
            <Route path="/question/:id" element={<QuestionDetail />} />
            <Route path="/profile/:id" element={<UserProfile />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
