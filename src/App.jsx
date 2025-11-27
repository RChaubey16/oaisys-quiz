import { Routes, Route, Navigate } from 'react-router-dom';
import Game from './pages/Game';
import Leaderboard from './pages/Leaderboard';
import TestGame from './pages/TestGame';

const App = () => {
  return (
    <Routes>
      <Route path="/game" element={<Game />} />
      <Route path="/test-game" element={<TestGame />} />
      <Route path="/leaderboard" element={<Leaderboard />} />
      <Route path="/" element={<Navigate to="/game" replace />} />
    </Routes>
  );
};

export default App;
