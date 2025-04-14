import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function Questions() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/questions');
        setQuestions(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch questions');
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  if (loading) return <div className="text-center text-white">Loading...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">All Questions</h1>
      <div className="space-y-4">
        {questions.map((question) => (
          <div key={question._id} className="bg-gray-800 rounded-lg p-6">
            <Link to={`/question/${question._id}`} className="block">
              <h2 className="text-xl font-semibold text-white hover:text-primary-500">
                {question.title}
              </h2>
            </Link>
            <p className="mt-2 text-gray-300">{question.content}</p>
            <div className="mt-4 flex items-center text-sm text-gray-400">
              <span>{question.answers?.length || 0} answers</span>
              <span className="mx-2">•</span>
              <span>Asked by {question.author?.name}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Questions; 