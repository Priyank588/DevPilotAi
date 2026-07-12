const mongoose = require('mongoose');

const InterviewQuestionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
    },
    topic: {
      type: String,
      required: [true, 'Topic is required'],
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    language: {
      type: String,
    },
    mcqs: [
      {
        question: { type: String },
        options: { type: [String] },
        correctAnswer: { type: Number },
        explanation: { type: String },
      },
    ],
    codingQuestions: [
      {
        question: { type: String },
        hint: { type: String },
        solution: { type: String },
        difficulty: { type: String },
      },
    ],
    hrQuestions: [
      {
        question: { type: String },
        sampleAnswer: { type: String },
        tips: { type: String },
      },
    ],
    technicalQuestions: [
      {
        question: { type: String },
        answer: { type: String },
        topic: { type: String },
      },
    ],
    followUpQuestions: [
      {
        question: { type: String },
        context: { type: String },
        expectedAnswer: { type: String },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('InterviewQuestion', InterviewQuestionSchema);
