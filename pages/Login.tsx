import React, { useState } from 'react';
import { loginWithGoogle } from '../services/firebase';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError('');
    try {
      const user = await loginWithGoogle();
      if (user) {
        navigate('/');
      }
    } catch (err: any) {
      console.error("Login failed:", err);
      
      if (err.code === 'auth/unauthorized-domain') {
        const currentDomain = window.location.hostname;
        setError(`Domain Error: The domain "${currentDomain}" is not authorized. Please add it to your Firebase Console under Authentication > Settings > Authorized Domains.`);
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError('Login cancelled by user.');
      } else {
        setError(err.message || 'Failed to sign in. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Gradient Blob */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-green-900/20 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-zinc-900/80 backdrop-blur-sm p-8 rounded-2xl border border-zinc-800 shadow-2xl z-10 text-center">
        <div className="mb-8">
          <i className="fa-brands fa-spotify text-6xl text-green-500 mb-4"></i>
          <h1 className="text-3xl font-bold text-white tracking-tight">LOFI WITH YT MUSIC</h1>
          <p className="text-zinc-400 mt-2">Download & Chill with premium Lofi tracks.</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded text-red-400 text-sm text-left break-words">
            <i className="fa-solid fa-triangle-exclamation mr-2"></i>
            {error}
          </div>
        )}

        <button 
          onClick={handleLogin}
          className="w-full bg-white text-black font-bold py-4 rounded-full flex items-center justify-center gap-3 hover:scale-105 transition duration-200"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
          Continue with Google
        </button>

        <p className="mt-8 text-xs text-zinc-600">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
      
      <footer className="absolute bottom-4 text-zinc-700 text-xs">
         © 2025 LOFI WITH YT MUSIC
      </footer>
    </div>
  );
};

export default Login;