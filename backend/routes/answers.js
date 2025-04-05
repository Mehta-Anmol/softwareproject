const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Answer = require('../models/Answer');
const Question = require('../models/Question');
const User = require('../models/User');

// Get answers for a question
router.get('/question/:questionId', async (req, res) => {
  try {
    const answers = await Answer.find({ question: req.params.questionId })
      .populate('author', 'name')
      .populate('comments.author', 'name')
      .sort({ createdAt: -1 });
    res.json(answers);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create answer
router.post('/',
  auth,
  [
    body('content').trim().notEmpty().withMessage('Content is required'),
    body('questionId').notEmpty().withMessage('Question ID is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { content, questionId } = req.body;

      // Check if question exists
      const question = await Question.findById(questionId);
      if (!question) {
        return res.status(404).json({ message: 'Question not found' });
      }

      const answer = new Answer({
        content,
        question: questionId,
        author: req.user._id
      });

      await answer.save();

      // Add answer to question
      question.answers.push(answer._id);
      await question.save();

      // Increment user's answers count
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { questionsAnswered: 1 }
      });

      res.status(201).json(answer);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Update answer
router.put('/:id',
  auth,
  [body('content').trim().notEmpty().withMessage('Content cannot be empty')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const answer = await Answer.findById(req.params.id);
      if (!answer) {
        return res.status(404).json({ message: 'Answer not found' });
      }

      if (answer.author.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to edit this answer' });
      }

      answer.content = req.body.content;
      await answer.save();

      res.json(answer);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Delete answer
router.delete('/:id', auth, async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);
    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    if (answer.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this answer' });
    }

    // Remove answer from question
    await Question.findByIdAndUpdate(answer.question, {
      $pull: { answers: answer._id }
    });

    await answer.remove();

    // Decrement user's answers count
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { questionsAnswered: -1 }
    });

    res.json({ message: 'Answer deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add comment to answer
router.post('/:id/comments',
  auth,
  [body('content').trim().notEmpty().withMessage('Comment content is required')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const answer = await Answer.findById(req.params.id);
      if (!answer) {
        return res.status(404).json({ message: 'Answer not found' });
      }

      answer.comments.push({
        content: req.body.content,
        author: req.user._id
      });

      await answer.save();
      res.json(answer);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Vote on answer
router.post('/:id/vote',
  auth,
  [body('voteType').isIn(['upvote', 'downvote']).withMessage('Invalid vote type')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const answer = await Answer.findById(req.params.id);
      if (!answer) {
        return res.status(404).json({ message: 'Answer not found' });
      }

      const { voteType } = req.body;
      answer.addVote(req.user._id, voteType);

      await answer.save();
      res.json(answer);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Accept answer
router.post('/:id/accept', auth, async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);
    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    const question = await Question.findById(answer.question);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    if (question.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the question author can accept an answer' });
    }

    // Update answer status
    answer.isAccepted = true;
    await answer.save();

    // Update user reputation
    await User.findByIdAndUpdate(answer.author, {
      $inc: { reputation: 15 }
    });

    res.json(answer);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 