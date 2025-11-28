import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Sparkles, Play } from 'lucide-react';
import csvData from "../assets/csv/shuffled_answers.csv?raw";

// Parse CSV data and create techLogos array
const parseCsvData = (csv) => {
  const lines = csv.trim().split('\n');
  const techLogos = [];
  
  // Skip header row (index 0)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Parse CSV line (handling potential commas in values)
    const values = line.split(',');
    
    if (values.length >= 6) {
      const logoUrl = values[0].trim();
      const optionA = values[1].trim();
      const optionB = values[2].trim();
      const optionC = values[3].trim();
      const optionD = values[4].trim();
      const correctAnswer = values[5].trim();
      
      // Map correct answer letter to the actual name
      let correctName = optionA; // Default to A
      if (correctAnswer === 'B') correctName = optionB;
      else if (correctAnswer === 'C') correctName = optionC;
      else if (correctAnswer === 'D') correctName = optionD;
      
      techLogos.push({
        name: correctName,
        icon: logoUrl,
        options: [optionA, optionB, optionC, optionD]
      });
    }
  }
  
  return techLogos;
};

// Tech logos and their names loaded from CSV
const techLogos = parseCsvData(csvData);

const getNewQuestion = (allLogos, index) => {
  const correct = allLogos[index];
  
  // If the logo has predefined options (from CSV), use them
  if (correct.options && correct.options.length === 4) {
    return {
      correct: correct.name,
      logo: correct,
      options: [...correct.options] // Use options in order from CSV
    };
  }
  
  // Fallback if no predefined options
  const wrongOptions = allLogos.filter(t => t.name !== correct.name);
  const options = [correct, ...wrongOptions.slice(0, 3)];
  
  return {
    correct: correct.name,
    logo: correct,
    options: options.map(opt => opt.name)
  };
};

const TestGame = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState('home'); // 'home' or 'play'
  const [playerName, setPlayerName] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [score, setScore] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const endGame = useCallback(() => {
    setGameActive(false);
    
    try {
      const timestamp = Date.now();
      const playerData = {
        name: playerName,
        score: score,
        timestamp: timestamp
      };
      
      localStorage.setItem(`score:${timestamp}`, JSON.stringify(playerData));
      // Navigate to leaderboard with score and playerName
      navigate('/leaderboard', { state: { score, playerName } });
    } catch (error) {
      console.error('Error saving score:', error);
      navigate('/leaderboard');
    }
  }, [playerName, score, navigate]);

  const generateQuestion = () => {
    // Check if we've reached the end of questions
    if (currentQuestionIndex >= techLogos.length) {
      endGame();
      return;
    }
    
    setCurrentQuestion(getNewQuestion(techLogos, currentQuestionIndex));
    setFeedback(null);
  };

  const startGame = (e) => {
    e.preventDefault();
    if (playerName.trim()) {
      setPage('play');
      setScore(0);
      setAnsweredCount(0);
      setCurrentQuestionIndex(0);
      setGameActive(true);
      setCurrentQuestion(getNewQuestion(techLogos, 0));
      setFeedback(null);
    }
  };

  const handleAnswer = (answer) => {
    if (!gameActive || feedback) return;
    
    const isCorrect = answer === currentQuestion.correct;
    setFeedback(isCorrect ? 'correct' : 'wrong');
    
    if (isCorrect) {
      setScore(score + 1);
    }
    setAnsweredCount(answeredCount + 1);
    
    setTimeout(() => {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      generateQuestion();
    }, 400);
  };

  if (page === 'home') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-linear-to-br from-[#CC1111]/20 via-[#E62222]/20 to-[#CC1111]/20"></div>
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#CC1111]/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#E62222]/30 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>
        
        <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-12 max-w-lg w-full border border-white/20">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-linear-to-br from-[#CC1111] to-[#E62222] rounded-2xl mb-6 shadow-lg">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-linear-to-r from-[#CC1111] to-[#E62222] bg-clip-text text-transparent mb-3">
              Logo Quiz
            </h1>
            <p className="text-slate-600 text-lg">Can you name them all?</p>
          </div>
          
          <div className="space-y-6">
            <div>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && startGame(e)}
                className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-[#CC1111] focus:bg-white focus:outline-none transition-all text-lg placeholder:text-slate-400"
                placeholder="Enter your name"
              />
            </div>
            
            <button
              onClick={startGame}
              className="w-full bg-linear-to-r from-[#CC1111] to-[#E62222] text-white font-semibold py-4 px-6 rounded-2xl hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3 text-lg"
            >
              <Play className="w-5 h-5" />
              Start Game
            </button>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-200">
            <div className="flex items-center justify-center gap-8 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                <span>Test your knowledge</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (page === 'play') {
    return (
      <div className="min-h-screen bg-slate-950 p-4 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-linear-to-br from-[#CC1111]/10 via-[#E62222]/10 to-[#CC1111]/10"></div>
        
        <div className="max-w-3xl mx-auto relative">
          {/* Stats */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex gap-4">
              <div className="bg-white/95 backdrop-blur-xl px-6 py-3 rounded-2xl shadow-lg border border-white/20">
                <div className="text-xs text-slate-500 mb-1">Score</div>
                <div className="text-2xl font-bold bg-linear-to-r from-[#CC1111] to-[#E62222] bg-clip-text text-transparent">
                  {score}
                </div>
              </div>
              <div className="bg-white/95 backdrop-blur-xl px-6 py-3 rounded-2xl shadow-lg border border-white/20">
                <div className="text-xs text-slate-500 mb-1">Progress</div>
                <div className="text-2xl font-bold text-slate-700">{answeredCount} / {techLogos.length}</div>
              </div>
            </div>
          </div>

          {/* Question card */}
          {currentQuestion && (
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-10 border border-white/20">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-slate-800 mb-8">What is this logo?</h2>
                <div 
                  className="inline-flex items-center justify-center w-40 h-40 rounded-3xl text-7xl shadow-2xl transform hover:scale-105 transition-transform"
                >
                  <img src={currentQuestion.logo.icon} alt={currentQuestion.logo.name} className='w-20 h-20' />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['A', 'B', 'C', 'D'].map((letter, index) => {
                  const isCorrectAnswer = currentQuestion.options[index] === currentQuestion.correct;
                  const showFeedback = feedback && isCorrectAnswer;
                  
                  return (
                    <button
                      key={letter}
                      onClick={() => handleAnswer(currentQuestion.options[index])}
                      disabled={!!feedback}
                      className={`py-5 px-6 rounded-2xl font-medium text-lg text-left transition-all transform hover:scale-[1.02] disabled:cursor-not-allowed ${
                        showFeedback && feedback === 'correct'
                          ? 'bg-linear-to-r from-green-500 to-emerald-500 text-white shadow-lg scale-[1.02]'
                          : showFeedback && feedback === 'wrong'
                          ? 'bg-linear-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 shadow-md hover:shadow-lg'
                      }`}
                    >
                      <span className="inline-block w-8 h-8 bg-white/20 rounded-lg text-center leading-8 mr-3 font-bold">
                        {letter}
                      </span>
                      {currentQuestion.options[index]}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  return null;
};

export default TestGame;
