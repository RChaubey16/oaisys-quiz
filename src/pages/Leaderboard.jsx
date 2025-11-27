import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Trophy } from 'lucide-react';
import { loadPlayers } from '../../utils/db_utils';

const Leaderboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [leaderboard, setLeaderboard] = useState([]);
  
  // Get score and playerName from navigation state if available
  const { score, playerName } = location.state || {};

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        // Fetch players from Supabase
        const players = await loadPlayers();
        
        if (players && players.length > 0) {
          // Use Supabase data
          setLeaderboard(players);
        } else {
          // Fallback to localStorage if Supabase returns no data
          const scores = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('score:')) {
              const data = localStorage.getItem(key);
              if (data) {
                scores.push(JSON.parse(data));
              }
            }
          }
          scores.sort((a, b) => b.score - a.score);
          setLeaderboard(scores);
        }
      } catch (error) {
        console.log('Loading leaderboard:', error);
        // Fallback to localStorage on error
        try {
          const scores = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('score:')) {
              const data = localStorage.getItem(key);
              if (data) {
                scores.push(JSON.parse(data));
              }
            }
          }
          scores.sort((a, b) => b.score - a.score);
          setLeaderboard(scores);
        } catch (fallbackError) {
          console.error('Fallback to localStorage failed:', fallbackError);
          setLeaderboard([]);
        }
      }
    };
    loadLeaderboard();
  }, []);

  const resetGame = () => {
    navigate('/game');
  };

  const currentPlayerRank = playerName && score !== undefined 
    ? leaderboard.findIndex(p => p.name === playerName && p.score === score) + 1
    : 0;
    
  const top10 = leaderboard.slice(0, 10);
  const isInTop10 = currentPlayerRank > 0 && currentPlayerRank <= 10;

  return (
    <div className="min-h-screen bg-slate-950 p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-linear-to-br from-[#CC1111]/20 via-[#E62222]/20 to-[#CC1111]/20"></div>
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-[#CC1111]/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-[#E62222]/30 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1.5s'}}></div>
      </div>

      <div className="max-w-2xl mx-auto relative">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-4 border border-white/20">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-linear-to-br from-[#FF4444] to-[#CC1111] rounded-2xl mb-6 shadow-lg">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-linear-to-r from-[#CC1111] to-[#E62222] bg-clip-text text-transparent mb-4">
              Leaderboard
            </h1>
            {score !== undefined && (
              <div className="inline-block bg-slate-100 px-6 py-3 rounded-2xl">
                <span className="text-slate-600 text-lg">You scored </span>
                <span className="font-bold text-2xl bg-linear-to-r from-[#CC1111] to-[#E62222] bg-clip-text text-transparent">
                  {score}
                </span>
                <span className="text-slate-600 text-lg"> points</span>
              </div>
            )}
          </div>

          <div className="space-y-3 mb-8">
            {top10.map((player, index) => {
              const isCurrentPlayer = player.name === playerName && player.score === score;
              const medals = ['🥇', '🥈', '🥉'];
              
              return (
                <div
                  key={index}
                  className={`flex items-center justify-between p-2 rounded-2xl transition-all ${
                    isCurrentPlayer
                      ? 'bg-linear-to-r from-[#CC1111] to-[#E62222] text-white shadow-xl scale-[1.02]'
                      : 'bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 flex items-center justify-center text-2xl">
                      {index < 3 ? medals[index] : (
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                          isCurrentPlayer ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {index + 1}
                        </div>
                      )}
                    </div>
                    <span className={`font-semibold text-lg ${isCurrentPlayer ? 'text-white' : 'text-slate-700'}`}>
                      {player.name} {`(${player.email})`}
                    </span>
                  </div>
                  <span className={`font-bold text-2xl ${isCurrentPlayer ? 'text-white' : 'bg-linear-to-r from-[#CC1111] to-[#E62222] bg-clip-text text-transparent'}`}>
                    {player.score}
                  </span>
                </div>
              );
            })}
          </div>

          {!isInTop10 && currentPlayerRank > 0 && (
            <div className="mb-8 pt-6 border-t-2 border-slate-200">
              <p className="text-center text-slate-600 mb-4 font-semibold">Your Ranking</p>
              <div className="flex items-center justify-between p-5 rounded-2xl bg-linear-to-r from-[#CC1111] to-[#E62222] text-white shadow-xl">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold bg-white/20 text-white">
                    {currentPlayerRank}
                  </div>
                  <span className="font-semibold text-lg">{playerName}</span>
                </div>
                <span className="font-bold text-2xl">{score}</span>
              </div>
            </div>
          )}

          <button
            onClick={resetGame}
            className="w-full bg-linear-to-r from-[#CC1111] to-[#E62222] text-white font-semibold py-4 px-6 rounded-2xl hover:shadow-xl hover:scale-[1.02] transition-all text-lg"
          >
            Play Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
