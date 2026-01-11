import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Whiteboard from './components/Canvas/Whiteboard';
import Home from './components/Home/Home';

function App() {
  return (
    <BrowserRouter>
      <div className="w-screen h-screen overflow-hidden bg-slate-50 text-slate-900">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/board/:roomId" element={<Whiteboard />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;