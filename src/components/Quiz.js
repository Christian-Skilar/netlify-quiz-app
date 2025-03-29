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
      question: "Are QR codes harmfull?",
      options: ["Don't think so", "Never", "Can be", "Easy to see if fake"],
      correctAnswer: "Can be",
      image: qrcode
    },
    {
      id: 3,
      question: "New iPhone 90% OFF!! Take action before its gone! What do you do?",
      options: ["Be quick", "To good to be true", "See if its still some left", "JACKPOT"],
      correctAnswer: "To good to be true",
      image: sale
    },
    {
      id: 4,
      question: "You get email that appears to be from your bank, asking you to verify your account due to suspicious activity",
      options: ["Click the link", "Forward mail to the bank", "Reply", "Call the provided number"],
      correctAnswer: "Forward mail to the bank",
      image: mail
    }
  ];

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizCompleted, setQuizCompleted] = useState(false);

  const handleAnswerSelect = (questionId, answer) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: answer
    });
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach(question => {
      if (selectedAnswers[question.id] === question.correctAnswer) {
        correct++;
      }
    });
    return correct;
  };

  const handleSubmit = async () => {
    setQuizCompleted(true);
    
    const quizData = {
      answers: selectedAnswers,
      score: calculateScore(),
      timestamp: new Date().toISOString()
    };

    try {
      const response = await fetch('/.netlify/functions/saveQuizResults', {
        method: 'POST',
        body: JSON.stringify(quizData),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) throw new Error('Failed to save results');
      console.log('Results saved successfully');
    } catch (error) {
      console.error('Error saving results:', error);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setQuizCompleted(false);
  };

  const renderCompletionScreen = () => {
    const correctAnswers = calculateScore();
    const wrongAnswers = questions.length - correctAnswers;

    if (wrongAnswers === 0) {
      return (
        <div className="completion-screen perfect-score">
          <h2>Perfect! You got all answers right!</h2>
          <div className="result-image">
            <img src={win} alt="Perfect score" />
            <p>You are as aware as can be - Excellent job!</p>
          </div>
          <button className="restart-button" onClick={restartQuiz}>
            Take the Quiz Again
          </button>
        </div>
      );
    } else if (wrongAnswers === 1) {
      return (
        <div className="completion-screen good-score">
          <h2>Good job! You got {correctAnswers} out of {questions.length} right!</h2>
          <div className="result-image">
            <img src={warning} alt="Good score" />
            <p>Almost perfect! Ask one of our staff how to be safer online</p>
          </div>
          <button className="restart-button" onClick={restartQuiz}>
            Take the Quiz Again
          </button>
        </div>
      );
    } else {
      return (
        <div className="completion-screen average-score">
          <h2>Thank you for completing the quiz!</h2>
          <div className="result-image">
            <img src={help} alt="Average score" />
            <p>This was not a good result, You should be more aware - Ask one of our staff how to be safer online</p>
          </div>
          <button className="restart-button" onClick={restartQuiz}>
            Take the Quiz Again
          </button>
        </div>
      );
    }
  };

  if (quizCompleted) {
    return renderCompletionScreen();
  }

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
      
      <div className="navigation-buttons">
        {currentQuestionIndex < questions.length - 1 ? (
          <button 
            className="nav-button next-button" 
            onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
            disabled={!selectedAnswers[currentQuestion.id]}
          >
            Next Question
          </button>
        ) : (
          <button 
            className="nav-button submit-button" 
            onClick={handleSubmit}
            disabled={!selectedAnswers[currentQuestion.id]}
          >
            Submit Quiz
          </button>
        )}
      </div>
    </div>
  );
}

export default Quiz;