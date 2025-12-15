import React, { useState } from 'react';
import { Song } from '../types';

interface SongCardProps {
  song: Song;
}

const SongCard: React.FC<SongCardProps> = ({ song }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio] = useState(new Audio(song.audioUrl));

  const togglePlay = () => {
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  // Cleanup audio on unmount
  React.useEffect(() => {
    audio.addEventListener('ended', () => setIsPlaying(false));
    return () => {
      audio.pause();
      audio.removeEventListener('ended', () => setIsPlaying(false));
    };
  }, [audio]);

  return (
    <div className="bg-zinc-900/40 hover:bg-zinc-800 p-4 rounded-lg transition duration-300 group relative">
      <div className="relative aspect-square mb-4 rounded-md overflow-hidden shadow-lg">
        <img 
          src={song.coverUrl || "https://picsum.photos/300/300"} 
          alt={song.title} 
          className="w-full h-full object-cover group-hover:opacity-80 transition"
        />
        <button 
          onClick={togglePlay}
          className={`absolute bottom-2 right-2 w-12 h-12 rounded-full bg-green-500 text-black flex items-center justify-center shadow-xl transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition duration-300 hover:scale-105 ${isPlaying ? 'opacity-100 translate-y-0' : ''}`}
        >
          <i className={`fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'} text-xl`}></i>
        </button>
      </div>
      
      <div className="mb-2">
        <h3 className="font-bold text-white truncate" title={song.title}>{song.title}</h3>
        <p className="text-sm text-zinc-400 truncate">{song.artist || "Unknown Artist"}</p>
      </div>

      <a 
        href={song.audioUrl} 
        download={song.title} 
        target="_blank"
        rel="noreferrer"
        className="w-full block text-center mt-3 py-2 rounded-full border border-zinc-600 text-zinc-300 hover:border-white hover:text-white text-xs font-bold uppercase tracking-wider transition"
      >
        Download
      </a>
    </div>
  );
};

export default SongCard;