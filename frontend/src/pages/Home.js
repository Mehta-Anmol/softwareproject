import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const Home = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/questions');
      setQuestions(response.data);
    } catch (error) {
      setError('Failed to fetch questions');
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (questionId, voteType) => {
    if (!user) {
      setError('Please log in to vote');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to vote');
        return;
      }

      const response = await axios.post(
        `http://localhost:5000/api/questions/${questionId}/vote`,
        { voteType },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Update the questions list with the updated question
      setQuestions(questions.map(q => {
        if (q._id === questionId) {
          return {
            ...q,
            upvotes: response.data.upvotes,
            downvotes: response.data.downvotes
          };
        }
        return q;
      }));
    } catch (error) {
      console.error('Vote error:', error);
      if (error.response?.status === 401) {
        setError('Please log in to vote');
      } else if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Failed to vote. Please try again.');
      }
    }
  };

  const getVoteCount = (question) => {
    return (question.upvotes?.length || 0) - (question.downvotes?.length || 0);
  };

  const hasUserVoted = (question, voteType) => {
    if (!user) return false;
    if (voteType === 'upvote') {
      return question.upvotes?.some(id => id.toString() === user._id.toString());
    } else {
      return question.downvotes?.some(id => id.toString() === user._id.toString());
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="home-container">
      {/* Hero Banner */}
      <div className="hero-banner">
        <div className="hero-content">
          <h1>Got problems?</h1>
          <h2>SOLVIT now</h2>
          <p>Ask questions, get answers, and help others in your community</p>
          {!user && (
            <Link to="/register" className="cta-button">
              Get Started
            </Link>
          )}
        </div>
      </div>

      {/* Recent Questions Section */}
      <div className="recent-questions">
        <h2>Recently Asked Questions</h2>
        <div className="questions-grid">
          {questions.map(question => (
            <div key={question._id} className="question-card">
              <div className="question-votes">
                <button 
                  className={`vote-button ${hasUserVoted(question, 'upvote') ? 'voted' : ''}`}
                  onClick={() => handleVote(question._id, 'upvote')}
                >
                  ↑
                </button>
                <span className="vote-count">{getVoteCount(question)}</span>
                <button 
                  className={`vote-button ${hasUserVoted(question, 'downvote') ? 'voted' : ''}`}
                  onClick={() => handleVote(question._id, 'downvote')}
                >
                  ↓
                </button>
              </div>
              <div className="question-content">
                <h3>
                  <Link to={`/question/${question._id}`}>{question.title}</Link>
                </h3>
                <p className="question-preview">{question.content.substring(0, 150)}...</p>
                <div className="question-meta">
                  <span>Asked by {question.author?.name || 'Anonymous'}</span>
                  <span>{new Date(question.createdAt).toLocaleDateString()}</span>
                  <span>{question.answers?.length || 0} answers</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home; 