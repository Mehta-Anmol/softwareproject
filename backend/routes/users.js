const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Question = require('../models/Question');
const Answer = require('../models/Answer');

// Get user profile
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -otp');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's questions and answers
    const questions = await Question.find({ author: user._id })
      .select('title createdAt views')
      .sort({ createdAt: -1 })
      .limit(5);

    const answers = await Answer.find({ author: user._id })
      .select('content createdAt isAccepted')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      user,
      recentQuestions: questions,
      recentAnswers: answers
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/:id',
  auth,
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      if (req.params.id !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to update this profile' });
      }

      const { name } = req.body;
      if (name) req.user.name = name;

      await req.user.save();
      res.json(req.user);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Get user's questions
router.get('/:id/questions', async (req, res) => {
  try {
    const questions = await Question.find({ author: req.params.id })
      .populate('author', 'name')
      .sort({ createdAt: -1 });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's answers
router.get('/:id/answers', async (req, res) => {
  try {
    const answers = await Answer.find({ author: req.params.id })
      .populate('author', 'name')
      .populate('question', 'title')
      .sort({ createdAt: -1 });
    res.json(answers);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's statistics
router.get('/:id/stats', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const stats = {
      questionsAsked: user.questionsAsked,
      questionsAnswered: user.questionsAnswered,
      reputation: user.reputation,
      totalViews: await Question.aggregate([
        { $match: { author: user._id } },
        { $group: { _id: null, total: { $sum: '$views' } } }
      ]).then(result => result[0]?.total || 0),
      acceptedAnswers: await Answer.countDocuments({
        author: user._id,
        isAccepted: true
      })
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 