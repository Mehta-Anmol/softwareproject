const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const auth = require("../middleware/auth");
const Question = require("../models/Question");
const User = require("../models/User");

// Get all questions
router.get("/", async (req, res) => {
  try {
    const questions = await Question.find()
      .populate("author", "name")
      .sort({ createdAt: -1 });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get single question
router.get("/:id", async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate("author", "name")
      .populate("answers.author", "name")
      .populate("comments.author", "name");

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Increment view count
    question.views += 1;
    await question.save();

    res.json(question);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Create question
router.post(
  "/",
  auth,
  [
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("content").trim().notEmpty().withMessage("Content is required"),
    body("tags").optional().isArray().withMessage("Tags must be an array"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, content, tags } = req.body;

      const question = new Question({
        title,
        content,
        tags,
        author: req.user._id,
      });

      await question.save();

      // Increment user's questions count
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { questionsAsked: 1 },
      });

      res.status(201).json(question);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Update question
router.put(
  "/:id",
  auth,
  [
    body("title")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Title cannot be empty"),
    body("content")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Content cannot be empty"),
    body("tags").optional().isArray().withMessage("Tags must be an array"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const question = await Question.findById(req.params.id);
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }

      if (question.author.toString() !== req.user._id.toString()) {
        return res
          .status(403)
          .json({ message: "Not authorized to edit this question" });
      }

      const { title, content, tags } = req.body;
      if (title) question.title = title;
      if (content) question.content = content;
      if (tags) question.tags = tags;

      await question.save();
      res.json(question);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Delete question
router.delete("/:id", auth, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    if (question.author.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this question" });
    }

    await question.remove();

    // Decrement user's questions count
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { questionsAsked: -1 },
    });

    res.json({ message: "Question deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Add comment to question
router.post(
  "/:id/comments",
  auth,
  [
    body("content")
      .trim()
      .notEmpty()
      .withMessage("Comment content is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const question = await Question.findById(req.params.id);
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }

      question.comments.push({
        content: req.body.content,
        author: req.user._id,
      });

      await question.save();
      res.json(question);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Vote on question
router.post(
  "/:id/vote",
  auth,
  [
    body("voteType")
      .isIn(["upvote", "downvote"])
      .withMessage("Invalid vote type"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const question = await Question.findById(req.params.id);
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }

      const { voteType } = req.body;
      question.addVote(req.user._id, voteType);

      await question.save();
      await question.populate("author", "name");
      await question.populate("upvotes", "_id");
      await question.populate("downvotes", "_id");

      res.json(question);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

module.exports = router;
