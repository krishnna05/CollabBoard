import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Whiteboard from './components/Canvas/Whiteboard';
import Home from './components/Home/Home';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <header className="fixed top-0 left-0 w-full p-4 bg-white shadow-sm z-10 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            🎨 CollabBoard <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Real-Time</span>
          </h1>
        </header>

        <main className="w-full h-full pt-16">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/board/:roomId" element={<Whiteboard />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;