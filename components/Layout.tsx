import React, { ReactNode } from 'react';
import { User } from 'firebase/auth';
import { ExternalLinks } from '../types';
import { useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../services/firebase';

interface LayoutProps {
  children: ReactNode;
  user: User | null;
  isAdmin: boolean;
  links: ExternalLinks | null;
}

const Layout: React.FC<LayoutProps> = ({ children, user, isAdmin, links }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-zinc-950 text-white font-sans">
      {/* Sidebar / Mobile Header */}
      <aside className="w-full md:w-64 bg-black flex-shrink-0 flex flex-col border-b md:border-b-0 md:border-r border-zinc-800 sticky top-0 z-50 md:h-screen">
        <div className="p-6 flex items-center gap-3">
          <i className="fa-brands fa-spotify text-3xl text-green-500"></i>
          <span className="text-xl font-bold tracking-tight">LOFI MUSIC</span>
        </div>

        <nav className="flex-1 px-4 space-y-2 hidden md:block">
          <button 
            onClick={() => navigate('/')}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-md transition-colors ${location.pathname === '/' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'}`}
          >
            <i className="fa-solid fa-house text-lg"></i>
            <span className="font-medium">Home</span>
          </button>
          
          {user && (
             <div className="mt-8">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider px-4 mb-2">My Library</h3>
              <div className="px-4 py-2 flex items-center gap-3 text-zinc-400">
                <i className="fa-solid fa-heart"></i>
                <span>Liked Songs</span>
              </div>
            </div>
          )}

          {isAdmin && (
            <div className="mt-8">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider px-4 mb-2">Admin</h3>
              <button 
                onClick={() => navigate('/admin')}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-md transition-colors ${location.pathname === '/admin' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'}`}
              >
                <i className="fa-solid fa-lock text-lg"></i>
                <span className="font-medium">Dashboard</span>
              </button>
            </div>
          )}
        </nav>

        {/* Mobile Nav */}
        <div className="md:hidden flex justify-around p-2 bg-zinc-900">
          <button onClick={() => navigate('/')} className="p-3 text-zinc-400 hover:text-white">
            <i className="fa-solid fa-house text-xl"></i>
          </button>
          {isAdmin && (
             <button onClick={() => navigate('/admin')} className="p-3 text-zinc-400 hover:text-white">
               <i className="fa-solid fa-lock text-xl"></i>
             </button>
          )}
           <button onClick={handleLogout} className="p-3 text-zinc-400 hover:text-white">
            <i className="fa-solid fa-right-from-bracket text-xl"></i>
          </button>
        </div>

        {/* Sidebar Footer (Desktop) */}
        <div className="p-6 border-t border-zinc-800 hidden md:block">
          {user ? (
            <div className="flex items-center gap-3 mb-4">
              <img 
                src={user.photoURL || "https://picsum.photos/200"} 
                alt="Profile" 
                className="w-10 h-10 rounded-full border border-zinc-700" 
              />
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium truncate">{user.displayName}</p>
                <p className="text-xs text-zinc-500 truncate">{user.email}</p>
              </div>
            </div>
          ) : (
             <div className="mb-4 text-sm text-zinc-400">Guest Mode</div>
          )}
          
          <div className="flex gap-2 mb-4">
            {links?.youtube && (
              <a href={links.youtube} target="_blank" rel="noreferrer" className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded text-center text-sm transition font-medium">
                <i className="fa-brands fa-youtube mr-1"></i> Sub
              </a>
            )}
            {links?.telegram && (
              <a href={links.telegram} target="_blank" rel="noreferrer" className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded text-center text-sm transition font-medium">
                <i className="fa-brands fa-telegram mr-1"></i> Join
              </a>
            )}
          </div>

          <button 
            onClick={handleLogout}
            className="w-full border border-zinc-600 hover:border-white text-zinc-300 hover:text-white py-2 rounded text-sm font-bold transition"
          >
            Log out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gradient-to-b from-zinc-900 to-black relative pb-20 md:pb-0">
        <header className="sticky top-0 z-30 bg-zinc-950/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
           {/* Mobile Profile Indicator */}
           <div className="md:hidden flex items-center gap-2">
              {user && <img src={user.photoURL || ""} className="w-8 h-8 rounded-full" />}
           </div>

           <div className="flex-1 md:flex-none"></div>

           {/* Top Actions */}
           <div className="flex items-center gap-4">
              {links?.youtube && (
                 <a href={links.youtube} target="_blank" className="md:hidden text-red-500 hover:text-red-400">
                   <i className="fa-brands fa-youtube text-2xl"></i>
                 </a>
              )}
               {links?.telegram && (
                 <a href={links.telegram} target="_blank" className="md:hidden text-blue-500 hover:text-blue-400">
                   <i className="fa-brands fa-telegram text-2xl"></i>
                 </a>
              )}
           </div>
        </header>

        <div className="px-6 py-6">
          {children}
        </div>
        
        <footer className="p-6 text-center text-zinc-600 text-xs mt-10 border-t border-zinc-900">
          © 2025 LOFI WITH YT MUSIC. All Rights Reserved.
        </footer>
      </main>
    </div>
  );
};

export default Layout;
