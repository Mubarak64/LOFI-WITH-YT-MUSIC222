import React, { useEffect, useState } from 'react';
import { fetchCollection } from '../services/firebase';
import { Song, Banner, AdConfig } from '../types';
import SongCard from '../components/SongCard';

const Home: React.FC = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [ads, setAds] = useState<AdConfig[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      const songsData = await fetchCollection<Song>('songs');
      const bannersData = await fetchCollection<Banner>('banners');
      const adsData = await fetchCollection<AdConfig>('ads');
      
      setSongs(songsData.sort((a, b) => b.createdAt - a.createdAt));
      setBanners(bannersData.filter(b => b.active).sort((a, b) => a.order - b.order));
      setAds(adsData.filter(a => a.active));
    };
    loadData();
  }, []);

  // Banner Auto-slide
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const filteredSongs = songs.filter(song => 
    song.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const topAd = ads.find(ad => ad.placement === 'top');
  const bottomAd = ads.find(ad => ad.placement === 'bottom');

  const renderAd = (ad: AdConfig) => {
    if (ad.type === 'image') {
      return <img src={ad.content} alt="Ad" className="w-full max-h-32 object-cover rounded-md" />;
    }
    return <div dangerouslySetInnerHTML={{ __html: ad.content }} className="w-full overflow-hidden" />;
  };

  return (
    <div className="space-y-8">
      
      {/* Search Bar */}
      <div className="relative max-w-md mx-auto md:mx-0">
        <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"></i>
        <input 
          type="text" 
          placeholder="What do you want to listen to?" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-zinc-800 text-white pl-12 pr-4 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-white/20 placeholder-zinc-500 transition"
        />
      </div>

      {/* Top Ad */}
      {topAd && (
        <div className="w-full bg-zinc-900 rounded-md p-2 flex justify-center">
          {renderAd(topAd)}
        </div>
      )}

      {/* Banners */}
      {banners.length > 0 && (
        <div className="relative w-full h-48 md:h-80 rounded-xl overflow-hidden shadow-2xl bg-zinc-800 group">
           {banners.map((banner, index) => (
             <div 
                key={banner.id}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentBannerIndex ? 'opacity-100' : 'opacity-0'}`}
             >
                <img src={banner.imageUrl} alt="Banner" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
             </div>
           ))}
           {/* Dots */}
           <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {banners.map((_, idx) => (
                <button 
                  key={idx}
                  onClick={() => setCurrentBannerIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${idx === currentBannerIndex ? 'bg-white w-4' : 'bg-white/50'}`}
                />
              ))}
           </div>
        </div>
      )}

      {/* Songs Grid */}
      <div>
        <h2 className="text-2xl font-bold mb-6 text-white">Latest Releases</h2>
        {filteredSongs.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredSongs.map(song => (
              <SongCard key={song.id} song={song} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-zinc-500">
            <i className="fa-solid fa-music text-4xl mb-4"></i>
            <p>No songs found matching "{searchTerm}"</p>
          </div>
        )}
      </div>

       {/* Bottom Ad */}
       {bottomAd && (
        <div className="w-full bg-zinc-900 rounded-md p-2 flex justify-center mt-12">
          {renderAd(bottomAd)}
        </div>
      )}

    </div>
  );
};

export default Home;