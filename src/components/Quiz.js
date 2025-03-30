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
      question: "What would you do if you were expecting a package and you get this message?",
      options: ["Click to avoid missing delivery", "Ignore and check directly", "Forward to friend for their opinion", "Reply STOP to unsubscribe"],
      correctAnswer: "Ignore and check directly",
      image: scam
    },
    {
      id: 2,
      question: "A colleague message you to scan a QR code for required document.",
      options: ["QR codes are always safe", "Verify with the colleague in person", "Scan if it looks professionall", "Check if your phone has virus protection first"],
      correctAnswer: "Scan if it looks professionall",
      image: qrcode
    },
    {
      id: 3,
      question: "You see an ad offering the latest iPhone for 90% off with only 2 left in stock! What's the most likely explanation?",
      options: ["A limited-time clearance sale", "A pricing error, take advantage", "A scam attempting to create urgency", "A special loyalty reward program"],
      correctAnswer: "A scam attempting to create urgency",
      image: sale
    },
    {
      id: 4,
      question: "An email from your bank requests immediate verification of your account details due to suspicious activity. What's the most secure response?",
      options: ["Click Verify Account in the email", "Call the number provided in the email", "Log in directly through your banking app", "Forward the email to the bank"],
      correctAnswer: "Log in directly through your banking app",
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
          wrong === 1 ? `You got ${correct} out of ${questions.length} right!` :
          "Hold up!"
        }</h2>
        <div className="result-image">
          <img src={
            wrong === 0 ? win :
            wrong === 1 ? warning : help
          } alt="Result" />
          <p>{
            wrong === 0 ? "Safety champion! Your knowledge is impressive. Remember, our safety team is always available if you have questions or want to discuss best practices." :
            wrong === 1 ? "Great work! You're clearly safety-conscious. For those last few areas to perfect, ask our experts to share some safety tips." :
            "Safety is a learning journey! Our team would be happy to review these concepts with you and share important safety tips."
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