const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  tags: [
    {
      type: String,
      trim: true,
    },
  ],
  upvotes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  downvotes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  answers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Answer",
    },
  ],
  comments: [
    {
      content: {
        type: String,
        required: true,
      },
      author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  views: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt timestamp before saving
questionSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for vote count
questionSchema.virtual("voteCount").get(function () {
  return this.upvotes.length - this.downvotes.length;
});

// Method to check if a user has voted
questionSchema.methods.hasVoted = function (userId) {
  return this.upvotes.includes(userId) || this.downvotes.includes(userId);
};

// Method to add a vote
questionSchema.methods.addVote = function (userId, voteType) {
  if (!userId) return;

  this.upvotes = this.upvotes.filter(
    (id) => id && id.toString() !== userId.toString()
  );
  this.downvotes = this.downvotes.filter(
    (id) => id && id.toString() !== userId.toString()
  );

  if (voteType === "upvote") {
    this.upvotes.push(userId);
  } else if (voteType === "downvote") {
    this.downvotes.push(userId);
  }
};

const Question = mongoose.model("Question", questionSchema);

module.exports = Question;
