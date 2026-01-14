import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';
import { 
    LayoutTemplate, 
    ArrowRight, 
    Plus, 
    Users, 
    Zap,
    Globe,
    ShieldCheck
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
        <div className="relative h-dvh w-full bg-[#FDFDFE] text-slate-900 font-['Inter',sans-serif] flex flex-col selection:bg-indigo-100 selection:text-indigo-700 overflow-hidden">
            
            {/* Background Decorations */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                {/* Dot Pattern */}
                <div className="absolute inset-0 opacity-[0.4]" 
                    style={{
                        backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
                        backgroundSize: '24px 24px'
                    }}>
                </div>
                
                {/* Ambient Gradients */}
                <div className="absolute top-[-10%] left-[-20%] w-[70vw] h-[45vh] bg-indigo-500/5 rounded-full blur-[90px] mix-blend-multiply" />
                <div className="absolute bottom-[-10%] right-[-20%] w-[70vw] h-[45vh] bg-purple-500/5 rounded-full blur-[90px] mix-blend-multiply" />
                
                {/* Hero Visual */}
                <svg className="hidden sm:block absolute top-[10%] left-[5%] w-56 h-56 md:w-80 md:h-80 opacity-[0.03] text-indigo-600" viewBox="0 0 200 200">
                    <path fill="currentColor" d="M45.7,18.4c-6.8-2.6-13.3,2.9-12,9.9c2.5,13.6,17.4,19.3,29.3,12.7c3.9-2.2,6.5-6.3,6.5-10.9 C69.5,22.7,58.1,13.8,45.7,18.4z"/>
                    <path fill="currentColor" d="M158.3,42.1c-9.2-4-18.7,3.1-17.6,13.1c1.9,16.8,22.1,24.8,37.6,16.8c5.4-2.8,9.1-8.2,9.3-14.3 C188.3,48.1,173.8,35.6,158.3,42.1z"/>
                    <path fill="none" stroke="currentColor" strokeWidth="1" d="M57,25 C100,50 120,40 150,55" />
                    <circle cx="100" cy="45" r="3" fill="currentColor" />
                </svg>
            </div>

            {/* Navbar */}
            <nav className="relative z-10 w-full px-4 sm:px-6 md:px-8 py-2 sm:py-4 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2 group cursor-pointer">
                    <div className="bg-white border border-indigo-50 p-1.5 rounded-lg text-indigo-600 shadow-sm shadow-indigo-100/50 group-hover:scale-105 transition-all duration-300">
                        <LayoutTemplate className="w-4 h-4" strokeWidth={2.5} />
                    </div>
                    <span className="text-base font-['Manrope',sans-serif] font-bold tracking-tight text-slate-900">
                        CollabBoard
                    </span>
                </div>
            </nav>

            {/* Main Content */}
            <main className="relative z-10 flex-1 w-full max-w-[1080px] mx-auto px-3 sm:px-6 md:px-8 py-2 sm:py-0 pb-4 sm:pb-12 flex flex-col lg:grid lg:grid-cols-12 gap-4 sm:gap-8 lg:gap-16 items-center justify-center h-full sm:h-auto min-h-0 sm:min-h-[calc(100vh-80px)]">

                {/* Left Side: Text Content */}
                <div className="w-full lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left space-y-3 sm:space-y-6 mt-0">
                    
                    <div className="space-y-2 sm:space-y-4">
                        <h1 className="font-['Manrope',sans-serif] text-3xl sm:text-5xl lg:text-[3.5rem] font-extrabold tracking-tight text-slate-900 leading-[1.1]">
                            Ideas flow better <br className="hidden sm:block"/>
                            <span className="relative inline-block sm:mt-2">
                                <span className="absolute -inset-1 bg-indigo-100/50 blur-xl rounded-full"></span>
                                <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 animate-gradient-x">
                                    on a shared canvas.
                                </span>
                            </span>
                        </h1>
                        
                        <p className="text-sm sm:text-base text-slate-500 max-w-sm sm:max-w-md leading-relaxed font-medium mx-auto lg:mx-0">
                            The infinite whiteboard for modern teams. Sketch, plan, and collaborate in real-time. No sign-up needed.
                        </p>
                    </div>

                    {/* Feature Pills */}
                    <div className="flex flex-wrap gap-2 justify-center lg:justify-start w-full">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-100 text-slate-600 shadow-sm text-[10px] font-bold uppercase tracking-wide">
                            <Zap size={10} className="fill-indigo-500 text-indigo-500" />
                            Real-time
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-100 text-slate-600 shadow-sm text-[10px] font-bold uppercase tracking-wide">
                            <Users size={10} className="fill-purple-500 text-purple-500" />
                            Multi-user
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-100 text-slate-600 shadow-sm text-[10px] font-bold uppercase tracking-wide">
                            <Globe size={10} className="text-emerald-500" />
                            Free
                        </div>
                    </div>
                </div>

                {/* Right Side: Action Card */}
                <div className="w-full lg:col-span-5 max-w-[380px] mx-auto lg:mr-0">
                    <div className="relative group perspective-1000">
                        
                        {/* Decorative Back Glow */}
                        <div className="hidden lg:block absolute -inset-1 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-[24px] blur-xl opacity-0 group-hover:opacity-100 transition duration-700"></div>
                        
                        {/* Main Container */}
                        <div className="relative overflow-hidden transition-all duration-300 
                            bg-transparent p-0 border-none shadow-none
                            lg:bg-white/80 lg:backdrop-blur-2xl lg:border lg:border-white/40 lg:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] lg:rounded-[24px] lg:p-6 lg:hover:shadow-[0_25px_60px_-12px_rgba(0,0,0,0.12)]">
                            
                            {/* Gradient Sheen Overlay */}
                            <div className="hidden lg:block absolute inset-0 bg-gradient-to-b from-white/50 to-transparent pointer-events-none"></div>

                            <div className="relative space-y-5">
                                
                                {/* Identity Input */}
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between mb-1 ml-1">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            Identify Yourself
                                        </span>
                                    </div>
                                    <div className={`relative flex items-center transition-all duration-200 bg-white border rounded-xl overflow-hidden shadow-sm ${isInputFocused ? 'border-indigo-500 ring-2 ring-indigo-500/10' : 'border-slate-200 hover:border-slate-300'}`}>
                                        <div className="pl-3.5 text-slate-400">
                                            <Users size={16} />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Enter your name"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            onFocus={() => setIsInputFocused(true)}
                                            onBlur={() => setIsInputFocused(false)}
                                            className="w-full h-11 bg-transparent border-none outline-none px-3 text-sm font-medium text-slate-700 placeholder:text-slate-400"
                                        />
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="space-y-3 pt-1">
                                    <button
                                        onClick={createNewRoom}
                                        disabled={!username}
                                        className="w-full h-11 relative overflow-hidden rounded-xl font-bold text-sm text-white shadow-lg shadow-indigo-500/20 transition-all duration-300 
                                        bg-gradient-to-r from-indigo-600 to-violet-600
                                        hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0
                                        disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0"
                                    >
                                        <span className="relative z-10 flex items-center justify-center gap-2">
                                            <Plus size={16} strokeWidth={3} />
                                            Create New Board
                                        </span>
                                    </button>

                                    <div className="relative flex items-center py-1">
                                        <div className="grow border-t border-slate-200/60 lg:border-slate-100"></div>
                                        <span className="shrink-0 mx-3 text-[9px] font-bold text-slate-400 lg:text-slate-300 uppercase tracking-widest">or join</span>
                                        <div className="grow border-t border-slate-200/60 lg:border-slate-100"></div>
                                    </div>

                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Paste Room ID"
                                            value={roomId}
                                            onChange={(e) => setRoomId(e.target.value)}
                                            onKeyDown={handleInputEnter}
                                            className="flex-1 h-10 px-3 bg-white border border-slate-200 rounded-lg text-xs font-['JetBrains_Mono',monospace] font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none transition-all placeholder:text-slate-400 shadow-sm"
                                        />
                                        <button
                                            onClick={joinRoom}
                                            disabled={!roomId || !username}
                                            className="h-10 px-3 bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 rounded-lg transition-all duration-200 flex items-center justify-center shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ArrowRight size={16} />
                                        </button>
                                    </div>
                                </div>

                                {/* Footer Badges */}
                                <div className="hidden lg:flex pt-2 justify-center gap-4 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                                    <div className="flex items-center gap-1 text-[9px] font-medium text-slate-500">
                                        <ShieldCheck size={10} className="text-emerald-500" />
                                        <span>Secure</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-[9px] font-medium text-slate-500">
                                        <Zap size={10} className="text-amber-500" />
                                        <span>Fast</span>
                                    </div>
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