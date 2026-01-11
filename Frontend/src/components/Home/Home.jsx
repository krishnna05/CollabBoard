import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';
import { 
    LayoutTemplate, 
    ArrowRight, 
    Sparkles, 
    Plus, 
    Users, 
    Keyboard,
    Command,
    Zap,
    Menu
} from 'lucide-react';

const Home = () => {
    const [roomId, setRoomId] = useState('');
    const [username, setUsername] = useState('');
    const [isInputFocused, setIsInputFocused] = useState(false);
    const navigate = useNavigate();

    const createNewRoom = (e) => {
        e.preventDefault();
        const id = uuidv4();
        navigate(`/board/${id}`, { state: { username } });
    };

    const joinRoom = (e) => {
        e.preventDefault();
        if (!roomId || !username) return;
        navigate(`/board/${roomId}`, { state: { username } });
    };

    const handleInputEnter = (e) => {
        if (e.key === 'Enter') {
            joinRoom(e);
        }
    }

    return (
        <div className="relative min-h-screen w-full bg-[#FDFDFE] text-slate-900 font-['Inter',sans-serif] flex flex-col selection:bg-indigo-100 selection:text-indigo-700 overflow-x-hidden">
            
            <div className="fixed inset-0 z-0 overflow-hidden">
                <div className="absolute inset-0 opacity-40" 
                    style={{
                        backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
                        backgroundSize: '20px 20px'
                    }}>
                </div>
                <div className="absolute top-[-5%] left-[-5%] w-[40vw] h-[40vh] bg-indigo-300/20 rounded-full blur-[80px] pointer-events-none mix-blend-multiply animate-pulse" style={{animationDuration: '4s'}} />
                <div className="absolute bottom-[-5%] right-[-5%] w-[40vw] h-[40vh] bg-purple-300/20 rounded-full blur-[80px] pointer-events-none mix-blend-multiply animate-pulse" style={{animationDuration: '7s'}} />
            </div>
            <nav className="relative z-10 w-full px-5 md:px-8 py-4 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2.5 group cursor-pointer">
                    <div className="bg-white border border-indigo-100 p-2 rounded-lg text-indigo-600 shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-300">
                        <LayoutTemplate size={18} />
                    </div>
                    <span className="text-lg font-['Manrope',sans-serif] font-bold tracking-tight text-slate-900">
                        CollabBoard
                    </span>
                </div>
                
                {/* Systems Online Badge - Scaled down */}
                <div className="hidden md:flex items-center gap-3">
                    <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/50 border border-white/60 backdrop-blur-md shadow-sm transition-all hover:bg-white/80">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></span>
                        </span>
                        <span className="text-[10px] font-bold text-slate-600 tracking-wide uppercase">Systems Online</span>
                    </span>
                </div>
            </nav>

            <main className="relative z-10 flex-1 w-full max-w-[1100px] mx-auto px-5 md:px-8 py-6 lg:py-0 grid lg:grid-cols-2 gap-8 lg:gap-4 items-center justify-items-center lg:justify-items-stretch">

                <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-6 max-w-xl order-2 lg:order-1">

                    <h1 className="font-['Manrope',sans-serif] text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold tracking-tight text-slate-900 leading-[1.1]">
                        Ideas flow better <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 animate-gradient-x">
                            when shared.
                        </span>
                    </h1>
                    
                    <p className="text-sm sm:text-base text-slate-500 max-w-md leading-relaxed font-medium">
                        The infinite canvas for modern teams. No sign-up needed. <br className="hidden lg:block" />
                        Just create a room and start collaborating instantly.
                    </p>

                    {/* Features - Compact list */}
                    <div className="pt-1 flex flex-wrap gap-4 text-xs font-semibold text-slate-500 justify-center lg:justify-start">
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-white/50 transition-colors cursor-default">
                            <div className="p-0.5 rounded bg-amber-100 text-amber-600">
                                <Zap size={12} fill="currentColor" />
                            </div>
                            Real-time Sync
                        </div>
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-white/50 transition-colors cursor-default">
                            <div className="p-0.5 rounded bg-indigo-100 text-indigo-600">
                                <Users size={12} fill="currentColor" />
                            </div>
                            Multi-user
                        </div>
                    </div>
                </div>

                <div className="w-full max-w-[360px] lg:ml-auto order-1 lg:order-2 perspective-1000">
                    <div className="relative bg-white/40 backdrop-blur-2xl border border-white/50 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] rounded-[1.5rem] p-1.5 ring-1 ring-white/60 transition-all duration-500 hover:scale-[1.01] hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.12)]">
                        
                        <div className="bg-white/60 rounded-[20px] border border-white/50 p-5 sm:p-6 space-y-5 backdrop-blur-sm">
                            
                            {/* USERNAME FIELD */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1 flex items-center gap-1.5">
                                    <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[9px]">1</span>
                                    Identify Yourself
                                </label>
                                
                                <div className={`group relative flex items-center transition-all duration-300 rounded-lg border ${isInputFocused ? 'border-indigo-400 bg-white shadow-[0_0_0_3px_rgba(99,102,241,0.15)]' : 'border-transparent bg-slate-50/80 hover:bg-white hover:border-slate-200 hover:shadow-sm'}`}>
                                    <div className="pl-3 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                                        <Users size={16} className="transition-transform duration-300 group-hover:scale-110" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Enter your name..."
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        onFocus={() => setIsInputFocused(true)}
                                        onBlur={() => setIsInputFocused(false)}
                                        className="w-full h-10 bg-transparent border-none outline-none px-3 text-sm font-semibold text-slate-700 placeholder:text-slate-400/80"
                                    />
                                </div>
                            </div>

                            {/* SPLITTER */}
                            <div className="relative flex items-center py-1">
                                <div className="flex-grow border-t border-slate-200/60"></div>
                                <span className="flex-shrink-0 mx-3 text-[9px] font-bold text-slate-400 uppercase tracking-widest bg-white/0 px-1">Action</span>
                                <div className="flex-grow border-t border-slate-200/60"></div>
                            </div>

                            <div className="grid gap-3">
                                {/* Create Button */}
                                <button
                                    onClick={createNewRoom}
                                    disabled={!username}
                                    className="group relative w-full h-10 overflow-hidden rounded-lg font-bold text-xs text-white shadow-md shadow-indigo-500/20 transition-all duration-300 
                                    bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600
                                    hover:shadow-[0_0_15px_rgba(99,102,241,0.5)] hover:-translate-y-0.5 
                                    active:scale-[0.98] active:translate-y-0
                                    disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0 disabled:hover:scale-100"
                                >
                                    <div className="relative flex items-center justify-center gap-1.5">
                                        <div className="bg-white/20 p-0.5 rounded backdrop-blur-sm transition-transform duration-300 group-hover:rotate-90">
                                            <Plus size={14} strokeWidth={3} />
                                        </div>
                                        <span>Create New Board</span>
                                    </div>
                                </button>

                                {/* Join Input Group */}
                                <div className="flex gap-2 h-10">
                                    <div className="relative flex-1 h-full group">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                                            <Keyboard size={16} className="transition-transform duration-300 group-hover:scale-110"/>
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Paste Room ID"
                                            value={roomId}
                                            onChange={(e) => setRoomId(e.target.value)}
                                            onKeyDown={handleInputEnter}
                                            className="w-full h-full pl-9 pr-3 bg-slate-50/80 border border-transparent hover:border-slate-200 focus:bg-white focus:border-indigo-300 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.1)] rounded-lg text-xs font-['JetBrains_Mono',monospace] font-medium focus:outline-none transition-all placeholder:text-slate-400/80 placeholder:font-sans"
                                        />
                                    </div>
                                    <button
                                        onClick={joinRoom}
                                        disabled={!roomId || !username}
                                        className="aspect-square h-full bg-white border border-indigo-100 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 disabled:bg-slate-50 disabled:text-slate-300 disabled:border-transparent rounded-lg transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95"
                                    >
                                        <ArrowRight size={16} />
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
};

export default Home;