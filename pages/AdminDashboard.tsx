import React, { useEffect, useState } from 'react';
import { db, storage, fetchCollection, fetchSettings } from '../services/firebase';
import { Song, Banner, AdConfig, ExternalLinks } from '../types';
import { collection, addDoc, deleteDoc, doc, updateDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

type Tab = 'songs' | 'banners' | 'ads' | 'settings';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('songs');
  const [message, setMessage] = useState<string>('');
  
  // Data State
  const [songs, setSongs] = useState<Song[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [ads, setAds] = useState<AdConfig[]>([]);
  const [settings, setSettings] = useState<ExternalLinks>({ youtube: '', telegram: '' });

  // Inputs
  const [newSongTitle, setNewSongTitle] = useState('');
  const [songFile, setSongFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Banner Input
  const [bannerFile, setBannerFile] = useState<File | null>(null);

  // Ad Input
  const [adContent, setAdContent] = useState('');
  const [adType, setAdType] = useState<'html' | 'image'>('html');
  const [adPlacement, setAdPlacement] = useState<'top' | 'bottom'>('top');

  const refreshData = async () => {
    setSongs(await fetchCollection<Song>('songs'));
    setBanners(await fetchCollection<Banner>('banners'));
    setAds(await fetchCollection<AdConfig>('ads'));
    setSettings(await fetchSettings() as ExternalLinks);
  };

  useEffect(() => {
    refreshData();
  }, []);

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  // --- Handlers ---

  const handleUploadSong = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!songFile || !coverFile || !newSongTitle) return alert("All fields required");
    
    setIsUploading(true);
    try {
      // 1. Upload Cover
      const coverRef = ref(storage, `covers/${Date.now()}_${coverFile.name}`);
      await uploadBytes(coverRef, coverFile);
      const coverUrl = await getDownloadURL(coverRef);

      // 2. Upload Audio
      const audioRef = ref(storage, `songs/${Date.now()}_${songFile.name}`);
      await uploadBytes(audioRef, songFile);
      const audioUrl = await getDownloadURL(audioRef);

      // 3. Save to Firestore
      await addDoc(collection(db, "songs"), {
        title: newSongTitle,
        coverUrl,
        audioUrl,
        createdAt: Date.now()
      });

      showMessage("Song uploaded successfully!");
      setNewSongTitle('');
      setSongFile(null);
      setCoverFile(null);
      refreshData();
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteSong = async (id: string, audioUrl: string, coverUrl: string) => {
    if (!window.confirm("Delete this song?")) return;
    try {
      await deleteDoc(doc(db, "songs", id));
      // Try to delete files (ignore errors if files don't exist)
      try { await deleteObject(ref(storage, audioUrl)); } catch(e){}
      try { await deleteObject(ref(storage, coverUrl)); } catch(e){}
      
      showMessage("Song deleted");
      refreshData();
    } catch (err) {
      alert("Error deleting song");
    }
  };

  const handleUploadBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerFile) return;
    setIsUploading(true);
    try {
      const bRef = ref(storage, `banners/${Date.now()}_${bannerFile.name}`);
      await uploadBytes(bRef, bannerFile);
      const url = await getDownloadURL(bRef);
      
      await addDoc(collection(db, "banners"), {
        imageUrl: url,
        active: true,
        order: banners.length + 1
      });
      showMessage("Banner added");
      setBannerFile(null);
      refreshData();
    } catch (err) {
      alert("Failed to add banner");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteBanner = async (id: string, url: string) => {
    try {
       await deleteDoc(doc(db, "banners", id));
       try { await deleteObject(ref(storage, url)); } catch(e){}
       refreshData();
    } catch(e) { alert("Error deleting banner"); }
  };

  const handleAddAd = async () => {
    try {
      await addDoc(collection(db, "ads"), {
        content: adContent,
        type: adType,
        placement: adPlacement,
        active: true
      });
      showMessage("Ad added");
      setAdContent('');
      refreshData();
    } catch(e) { alert("Error adding ad"); }
  };

  const handleSaveSettings = async () => {
    try {
      await setDoc(doc(db, "settings", "main"), settings);
      showMessage("Settings saved");
    } catch(e) { alert("Error saving settings"); }
  };

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      {message && (
        <div className="fixed top-20 right-4 bg-green-500 text-black px-6 py-3 rounded-lg shadow-xl z-50 animate-bounce">
          {message}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-zinc-800 mb-8 overflow-x-auto">
        {(['songs', 'banners', 'ads', 'settings'] as Tab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 font-medium capitalize whitespace-nowrap ${activeTab === tab ? 'text-green-500 border-b-2 border-green-500' : 'text-zinc-400 hover:text-white'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* SONGS TAB */}
      {activeTab === 'songs' && (
        <div className="space-y-8">
          <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
            <h2 className="text-xl font-bold mb-4">Upload Song</h2>
            <form onSubmit={handleUploadSong} className="space-y-4 max-w-xl">
              <input 
                type="text" 
                placeholder="Song Title" 
                value={newSongTitle}
                onChange={e => setNewSongTitle(e.target.value)}
                className="w-full bg-black border border-zinc-700 p-3 rounded text-white"
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm text-zinc-400 mb-1">Audio File (MP3)</label>
                   <input type="file" accept="audio/*" onChange={e => setSongFile(e.target.files?.[0] || null)} className="text-sm text-zinc-400" required />
                </div>
                <div>
                   <label className="block text-sm text-zinc-400 mb-1">Cover Image</label>
                   <input type="file" accept="image/*" onChange={e => setCoverFile(e.target.files?.[0] || null)} className="text-sm text-zinc-400" required />
                </div>
              </div>
              <button disabled={isUploading} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-bold">
                {isUploading ? "Uploading..." : "Upload Song"}
              </button>
            </form>
          </div>

          <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
            <h2 className="text-xl font-bold mb-4">Manage Songs ({songs.length})</h2>
            <div className="space-y-2">
              {songs.map(song => (
                <div key={song.id} className="flex items-center justify-between p-3 bg-black/50 rounded hover:bg-black transition">
                  <div className="flex items-center gap-3">
                    <img src={song.coverUrl} className="w-10 h-10 rounded" alt="cover" />
                    <span className="font-medium">{song.title}</span>
                  </div>
                  <button onClick={() => handleDeleteSong(song.id, song.audioUrl, song.coverUrl)} className="text-red-500 hover:text-red-400">
                    <i className="fa-solid fa-trash"></i>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* BANNERS TAB */}
      {activeTab === 'banners' && (
        <div className="space-y-8">
          <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
             <h2 className="text-xl font-bold mb-4">Add Banner</h2>
             <form onSubmit={handleUploadBanner} className="flex gap-4 items-end">
                <div className="flex-1">
                  <input type="file" accept="image/*" onChange={e => setBannerFile(e.target.files?.[0] || null)} className="text-sm text-zinc-400" required />
                </div>
                <button disabled={isUploading} className="bg-blue-600 text-white px-4 py-2 rounded">
                  {isUploading ? "..." : "Upload"}
                </button>
             </form>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {banners.map(banner => (
               <div key={banner.id} className="relative group">
                 <img src={banner.imageUrl} className="w-full h-40 object-cover rounded-lg" alt="banner" />
                 <button 
                  onClick={() => handleDeleteBanner(banner.id, banner.imageUrl)}
                  className="absolute top-2 right-2 bg-red-600 text-white w-8 h-8 rounded-full opacity-0 group-hover:opacity-100 transition"
                >
                   <i className="fa-solid fa-trash"></i>
                 </button>
               </div>
             ))}
          </div>
        </div>
      )}

      {/* ADS TAB */}
      {activeTab === 'ads' && (
        <div className="space-y-8">
           <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
             <h2 className="text-xl font-bold mb-4">Add Advertisement</h2>
             <div className="space-y-4 max-w-xl">
               <textarea 
                  placeholder="Paste HTML/JS Code or Image URL" 
                  value={adContent}
                  onChange={e => setAdContent(e.target.value)}
                  className="w-full bg-black border border-zinc-700 p-3 rounded text-white h-32 font-mono text-xs"
               />
               <div className="flex gap-4">
                 <select value={adType} onChange={(e: any) => setAdType(e.target.value)} className="bg-zinc-800 p-2 rounded text-white">
                   <option value="html">HTML Code</option>
                   <option value="image">Image URL</option>
                 </select>
                 <select value={adPlacement} onChange={(e: any) => setAdPlacement(e.target.value)} className="bg-zinc-800 p-2 rounded text-white">
                   <option value="top">Top</option>
                   <option value="bottom">Bottom</option>
                 </select>
               </div>
               <button onClick={handleAddAd} className="bg-purple-600 px-6 py-2 rounded text-white font-bold">Add Ad</button>
             </div>
           </div>
           
           <div className="space-y-2">
             {ads.map(ad => (
               <div key={ad.id} className="p-4 bg-zinc-900 rounded border border-zinc-800 flex justify-between items-center">
                 <div>
                   <span className="bg-zinc-700 text-xs px-2 py-1 rounded uppercase mr-2">{ad.placement}</span>
                   <span className="text-zinc-400 text-sm truncate max-w-xs inline-block align-bottom">{ad.content.substring(0, 50)}...</span>
                 </div>
                 <button onClick={async () => { await deleteDoc(doc(db, "ads", ad.id)); refreshData(); }} className="text-red-500"><i className="fa-solid fa-trash"></i></button>
               </div>
             ))}
           </div>
        </div>
      )}

      {/* SETTINGS TAB */}
      {activeTab === 'settings' && (
        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 max-w-xl">
          <h2 className="text-xl font-bold mb-6">External Links</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-zinc-400 mb-1">YouTube Channel URL</label>
              <input 
                type="text" 
                value={settings.youtube} 
                onChange={e => setSettings({...settings, youtube: e.target.value})}
                className="w-full bg-black border border-zinc-700 p-3 rounded text-white"
              />
            </div>
            <div>
              <label className="block text-zinc-400 mb-1">Telegram Channel URL</label>
              <input 
                type="text" 
                value={settings.telegram} 
                onChange={e => setSettings({...settings, telegram: e.target.value})}
                className="w-full bg-black border border-zinc-700 p-3 rounded text-white"
              />
            </div>
            <button onClick={handleSaveSettings} className="bg-green-600 px-6 py-2 rounded text-white font-bold w-full">Save Settings</button>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;