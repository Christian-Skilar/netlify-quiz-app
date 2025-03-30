// src/components/Quiz.js
import { useState } from 'react';
import scam from '../components/images/scamtxt.png';
import qrcode from '../components/images/qrcode.png';
import sale from '../components/images/sale.png';
import mail from '../components/images/mail.png';
import win from '../components/images/win.png';
import warning from '../components/images/warning.png';
import help from '../components/images/help.png';
import './Quiz.css';

function Quiz() {
  const questions = [
    {
      id: 1,
      question: "What do you do when you get this message?",
      options: ["Open", "Ignore", "Check Link", "Send sms STOP"],
      correctAnswer: "Ignore",
      image: scam
    },
    {
      id: 2,
      question: "Are QR codes harmful?",
      options: ["Don't think so", "Never", "Can be", "Easy to see if fake"],
      correctAnswer: "Can be",
      image: qrcode
    },
    {
      id: 3,
      question: "New iPhone 90% OFF!! Take action before it's gone! What do you do?",
      options: ["Be quick", "Too good to be true", "See if any left", "JACKPOT"],
      correctAnswer: "Too good to be true",
      image: sale
    },
    {
      id: 4,
      question: "You get email that appears to be from your bank, asking to verify your account due to suspicious activity",
      options: ["Click the link", "Forward mail to the bank", "Reply", "Call the number"],
      correctAnswer: "Forward mail to the bank",
      image: mail
    }
  ];

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizCompleted, setQuizCompleted] = useState(false);

  const handleAnswerSelect = (questionId, answer) => {
    const newAnswers = {
      ...selectedAnswers,
      [questionId]: answer
    };
    setSelectedAnswers(newAnswers);
    
    // Auto-advance or submit
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        handleSubmit(newAnswers);
      }
    }, 300);
  };

  const calculateScore = () => {
    return questions.reduce((correct, question) => (
      selectedAnswers[question.id] === question.correctAnswer ? correct + 1 : correct
    ), 0);
  };

  const handleSubmit = async (answers = selectedAnswers) => {
    setQuizCompleted(true);
    try {
      await fetch('/.netlify/functions/saveQuizResults', {
        method: 'POST',
        body: JSON.stringify({
          answers,
          score: calculateScore(),
          timestamp: new Date().toISOString()
        }),
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Submission error:', error);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setQuizCompleted(false);
  };

  const renderCompletionScreen = () => {
    const correct = calculateScore();
    const wrong = questions.length - correct;

    return (
      <div className={`completion-screen ${
        wrong === 0 ? 'perfect-score' :
        wrong === 1 ? 'good-score' : 'average-score'
      }`}>
        <h2>{
          wrong === 0 ? "Perfect! You got all answers right!" :
          wrong === 1 ? `Good job! You got ${correct} out of ${questions.length} right!` :
          "Thank you for completing the quiz!"
        }</h2>
        <div className="result-image">
          <img src={
            wrong === 0 ? win :
            wrong === 1 ? warning : help
          } alt="Result" />
          <p>{
            wrong === 0 ? "You are as aware as can be - Excellent job!" :
            wrong === 1 ? "Almost perfect! Ask our staff for safety tips" :
            "This was not a good result, ask our staff for guidance"
          }</p>
        </div>
        <button className="restart-button" onClick={restartQuiz}>
          Take the Quiz Again
        </button>
      </div>
    );
  };

  if (quizCompleted) return renderCompletionScreen();

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="quiz-container">
      <div className="progress-indicator">
        Question {currentQuestionIndex + 1} of {questions.length}
      </div>
      
      <h2 className="question-text">{currentQuestion.question}</h2>
      
      <div className="question-image">
        <img src={currentQuestion.image} alt="Question visual" />
      </div>
      
      <div className="options-grid">
        {currentQuestion.options.map((option, index) => (
          <button
            key={index}
            className={`option-button ${
              selectedAnswers[currentQuestion.id] === option ? 'selected' : ''
            }`}
            onClick={() => handleAnswerSelect(currentQuestion.id, option)}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

export default Quiz;