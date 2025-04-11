import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

export default function QuestionDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [newComment, setNewComment] = useState("");
  const [, setCommentingOn] = useState(null);

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        console.log("Fetching question with ID:", id);
        const [questionResponse, answersResponse] = await Promise.all([
          axios.get(`http://localhost:5000/api/questions/${id}`),
          axios.get(`http://localhost:5000/api/answers/question/${id}`),
        ]);
        console.log("Question data:", questionResponse.data);
        console.log("Answers data:", answersResponse.data);
        setQuestion(questionResponse.data);
        setAnswers(answersResponse.data);
      } catch (error) {
        console.error("Error fetching question:", error);
        if (error.response?.status === 404) {
          setError("Question not found");
        } else {
          setError("Failed to fetch question details. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchQuestion();
    } else {
      setError("Invalid question ID");
      setLoading(false);
    }
  }, [id]);

  const handleVote = async (type, itemId, voteType) => {
    try {
      if (!user) {
        setError("Please log in to vote");
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please log in to vote");
        return;
      }

      const endpoint = type === "question" ? "questions" : "answers";
      const response = await axios.post(
        `http://localhost:5000/api/${endpoint}/${itemId}/vote`,
        { voteType },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update the data based on the response
      if (type === "question") {
        setQuestion(response.data);
      } else {
        setAnswers(
          answers.map((answer) =>
            answer._id === itemId ? response.data : answer
          )
        );
      }
    } catch (error) {
      console.error("Vote error:", error);
      if (error.response?.status === 401) {
        setError("Please log in to vote");
      } else if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError("Failed to vote. Please try again.");
      }
    }
  };

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    try {
      if (!user) {
        setError("Please log in to answer");
        return;
      }

      if (!newAnswer.trim()) {
        setError("Please enter your answer");
        return;
      }

      const response = await axios.post("http://localhost:5000/api/answers", {
        content: newAnswer,
        questionId: id,
      });

      // Add the new answer to the list
      setAnswers([response.data, ...answers]);
      setNewAnswer("");
      setError("");
    } catch (error) {
      if (error.response?.status === 401) {
        setError("Please log in to answer");
      } else if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError("Failed to submit answer. Please try again.");
      }
    }
  };

  const handleSubmitComment = async (e, itemId, type) => {
    e.preventDefault();
    try {
      if (!user) {
        setError("Please log in to comment");
        return;
      }

      const endpoint = type === "question" ? "questions" : "answers";
      await axios.post(
        `http://localhost:5000/api/${endpoint}/${itemId}/comments`,
        {
          content: newComment,
        }
      );

      // Refresh the data
      const [questionResponse, answersResponse] = await Promise.all([
        axios.get(`http://localhost:5000/api/questions/${id}`),
        axios.get(`http://localhost:5000/api/answers/question/${id}`),
      ]);
      setQuestion(questionResponse.data);
      setAnswers(answersResponse.data);
      setNewComment("");
      setCommentingOn(null);
    } catch (error) {
      setError("Failed to submit comment");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">Loading question details...</div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-red-500 text-xl">
          {error || "Question not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-4 bg-red-500 text-white p-4 rounded-md">
            {error}
          </div>
        )}

        {/* Question */}
        <div className="card mb-8">
          <div className="flex items-start space-x-4">
            <div className="flex flex-col items-center space-y-2">
              <button
                className="text-gray-400 hover:text-primary-500"
                onClick={() => handleVote("question", question._id, "upvote")}
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 15l7-7 7 7"
                  />
                </svg>
              </button>
              <span className="text-white font-medium">
                {question.upvotes.length - question.downvotes.length}
              </span>
              <button
                className="text-gray-400 hover:text-primary-500"
                onClick={() => handleVote("question", question._id, "downvote")}
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white">
                {question.title}
              </h1>
              <p className="mt-4 text-gray-300">{question.content}</p>
              <div className="mt-4 flex items-center space-x-4 text-sm text-gray-400">
                <span>Asked by {question.author.name}</span>
                <span>•</span>
                <span>{new Date(question.createdAt).toLocaleDateString()}</span>
                <span>•</span>
                <span>{question.views} views</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {question.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 text-xs font-medium bg-gray-700 text-gray-300 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Comments */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-white mb-4">Comments</h2>
            <div className="space-y-4">
              {question.comments.map((comment) => (
                <div key={comment._id} className="bg-gray-800 p-4 rounded-lg">
                  <p className="text-gray-300">{comment.content}</p>
                  <div className="mt-2 text-sm text-gray-400">
                    <span>Commented by {comment.author.name}</span>
                    <span className="mx-2">•</span>
                    <span>
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {user && (
              <form
                onSubmit={(e) =>
                  handleSubmitComment(e, question._id, "question")
                }
                className="mt-4"
              >
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="input"
                  rows="3"
                />
                <button type="submit" className="btn btn-primary mt-2">
                  Add Comment
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Answers */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-white">
            {answers.length} {answers.length === 1 ? "Answer" : "Answers"}
          </h2>
          {answers.map((answer) => (
            <div key={answer._id} className="card">
              <div className="flex items-start space-x-4">
                <div className="flex flex-col items-center space-y-2">
                  <button
                    className="text-gray-400 hover:text-primary-500"
                    onClick={() => handleVote("answer", answer._id, "upvote")}
                  >
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 15l7-7 7 7"
                      />
                    </svg>
                  </button>
                  <span className="text-white font-medium">
                    {answer.upvotes.length - answer.downvotes.length}
                  </span>
                  <button
                    className="text-gray-400 hover:text-primary-500"
                    onClick={() => handleVote("answer", answer._id, "downvote")}
                  >
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                </div>
                <div className="flex-1">
                  <p className="text-gray-300">{answer.content}</p>
                  <div className="mt-4 flex items-center space-x-4 text-sm text-gray-400">
                    <span>Answered by {answer.author.name}</span>
                    <span>•</span>
                    <span>
                      {new Date(answer.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Answer Comments */}
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Comments
                    </h3>
                    <div className="space-y-4">
                      {answer.comments.map((comment) => (
                        <div
                          key={comment._id}
                          className="bg-gray-800 p-4 rounded-lg"
                        >
                          <p className="text-gray-300">{comment.content}</p>
                          <div className="mt-2 text-sm text-gray-400">
                            <span>Commented by {comment.author.name}</span>
                            <span className="mx-2">•</span>
                            <span>
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    {user && (
                      <form
                        onSubmit={(e) =>
                          handleSubmitComment(e, answer._id, "answer")
                        }
                        className="mt-4"
                      >
                        <textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Add a comment..."
                          className="input"
                          rows="3"
                        />
                        <button type="submit" className="btn btn-primary mt-2">
                          Add Comment
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Answer Form */}
        {user ? (
          <div className="mt-8 bg-gray-800 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-white mb-4">Your Answer</h2>
            <form onSubmit={handleSubmitAnswer} className="space-y-4">
              <div>
                <textarea
                  value={newAnswer}
                  onChange={(e) => setNewAnswer(e.target.value)}
                  placeholder="Write your answer here..."
                  className="w-full p-4 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  rows="6"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                Post Answer
              </button>
            </form>
          </div>
        ) : (
          <div className="mt-8 bg-gray-800 p-6 rounded-lg">
            <p className="text-white">
              Please{" "}
              <a href="/login" className="text-primary-500 hover:underline">
                log in
              </a>{" "}
              to post an answer.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
