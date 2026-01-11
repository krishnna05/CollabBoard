import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const [roomId, setRoomId] = useState('');
    const [username, setUsername] = useState('');
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

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full border border-gray-100">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Start Collaborating</h2>

                <form onSubmit={createNewRoom} className="mb-6">
                    <div className="mb-4">
                        <label htmlFor="usernameCreate" className="block text-gray-700 text-sm font-bold mb-2">
                            Enter Your Name
                        </label>
                        <input
                            type="text"
                            id="usernameCreate"
                            placeholder="Your Name..."
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={!username}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
                    >
                        <span>✨</span> Create New Room
                    </button>
                    <p className="text-center text-gray-500 text-sm mt-3">Start a fresh whiteboard session</p>
                </form>

                <div className="relative flex py-2 items-center">
                    <div className="grow border-t border-gray-200"></div>
                    <span className="shrink mx-4 text-gray-400 text-sm">Or join existing</span>
                    <div className="grow border-t border-gray-200"></div>
                </div>

                <form onSubmit={joinRoom} className="mt-6">
                    <div className="mb-4">
                        <label htmlFor="usernameJoin" className="block text-gray-700 text-sm font-bold mb-2">
                            Enter Your Name
                        </label>
                        <input
                            type="text"
                            id="usernameJoin"
                            placeholder="Your Name..."
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="roomId" className="block text-gray-700 text-sm font-bold mb-2">
                            Room ID
                        </label>
                        <input
                            type="text"
                            id="roomId"
                            placeholder="Enter Room ID..."
                            value={roomId}
                            onChange={(e) => setRoomId(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={!roomId || !username}
                        className="w-full bg-gray-800 hover:bg-gray-900 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition duration-200"
                    >
                        Join Room
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Home;
