import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function UserProfile() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const [userResponse, statsResponse] = await Promise.all([
          axios.get(`http://localhost:5000/api/users/${id}`),
          axios.get(`http://localhost:5000/api/users/${id}/stats`),
        ]);
        setUser(userResponse.data);
        setStats(statsResponse.data);
      } catch (error) {
        setError("Failed to fetch user data");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* User Info */}
        <div className="card mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className="h-16 w-16 rounded-full bg-primary-500 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {user?.user?.name.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                {user?.user?.name}
              </h1>
              <p className="text-gray-400">{user?.user?.email}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-2">
              Questions Asked
            </h3>
            <p className="text-3xl font-bold text-primary-500">
              {stats.questionsAsked}
            </p>
          </div>
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-2">
              Questions Answered
            </h3>
            <p className="text-3xl font-bold text-primary-500">
              {stats.questionsAnswered}
            </p>
          </div>
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-2">
              Reputation
            </h3>
            <p className="text-3xl font-bold text-primary-500">
              {stats.reputation}
            </p>
          </div>
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-2">
              Total Views
            </h3>
            <p className="text-3xl font-bold text-primary-500">
              {stats.totalViews}
            </p>
          </div>
        </div>

        {/* Recent Questions */}
        <div className="card mb-8">
          <h2 className="text-xl font-bold text-white mb-4">
            Recent Questions
          </h2>
          <div className="space-y-4">
            {user.recentQuestions.map((question) => (
              <div
                key={question._id}
                className="border-b border-gray-700 pb-4 last:border-0"
              >
                <h3 className="text-lg font-medium text-white hover:text-primary-500">
                  {question.title}
                </h3>
                <div className="mt-2 flex items-center space-x-4 text-sm text-gray-400">
                  <span>{question.views} views</span>
                  <span>•</span>
                  <span>
                    {new Date(question.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Answers */}
        <div className="card">
          <h2 className="text-xl font-bold text-white mb-4">Recent Answers</h2>
          <div className="space-y-4">
            {user.recentAnswers.map((answer) => (
              <div
                key={answer._id}
                className="border-b border-gray-700 pb-4 last:border-0"
              >
                <p className="text-gray-300 line-clamp-2">{answer.content}</p>
                <div className="mt-2 flex items-center space-x-4 text-sm text-gray-400">
                  <span>{answer.isAccepted ? "Accepted" : "Not accepted"}</span>
                  <span>•</span>
                  <span>{new Date(answer.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
