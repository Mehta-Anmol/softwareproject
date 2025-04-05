const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  upvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  downvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isAccepted: {
    type: Boolean,
    default: false
  },
  comments: [{
    content: {
      type: String,
      required: true
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
answerSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for vote count
answerSchema.virtual('voteCount').get(function() {
  return this.upvotes.length - this.downvotes.length;
});

// Method to check if a user has voted
answerSchema.methods.hasVoted = function(userId) {
  return this.upvotes.includes(userId) || this.downvotes.includes(userId);
};

// Method to add a vote
answerSchema.methods.addVote = function(userId, voteType) {
  if (voteType === 'upvote') {
    if (!this.upvotes.includes(userId)) {
      this.upvotes.push(userId);
      const downvoteIndex = this.downvotes.indexOf(userId);
      if (downvoteIndex > -1) {
        this.downvotes.splice(downvoteIndex, 1);
      }
    }
  } else if (voteType === 'downvote') {
    if (!this.downvotes.includes(userId)) {
      this.downvotes.push(userId);
      const upvoteIndex = this.upvotes.indexOf(userId);
      if (upvoteIndex > -1) {
        this.upvotes.splice(upvoteIndex, 1);
      }
    }
  }
};

const Answer = mongoose.model('Answer', answerSchema);

module.exports = Answer; 