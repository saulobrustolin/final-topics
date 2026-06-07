import React from "react";
import { Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, Volume2, VolumeX } from "lucide-react";
import { usePlayer } from "../contexts/PlayerContext";

export function PlayerBar() {
  const { 
    currentTrack, 
    isPlaying, 
    volume, 
    isMuted, 
    currentTime, 
    duration, 
    togglePlayPause, 
    setVolume, 
    toggleMute, 
    seek, 
    playNext, 
    playPrevious 
  } = usePlayer();

  const [isDragging, setIsDragging] = React.useState(false);
  const [dragTime, setDragTime] = React.useState(0);

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value));
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setDragTime(val);
    if (!isDragging) {
      seek(val);
    }
  };

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => {
    setIsDragging(false);
    seek(dragTime);
  };

  const displayTime = isDragging ? dragTime : currentTime;
  const progressPercent = duration > 0 ? (displayTime / duration) * 100 : 0;

  return (
    <footer className="h-24 bg-white border-t border-gray-100 px-6 flex items-center justify-between sticky bottom-0 z-20 font-sans">
      {/* Current Track */}
      <div className="flex items-center gap-4 w-1/3">
        {currentTrack ? (
          <>
            <div className="w-14 h-14 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
              {currentTrack.coverUrl ? (
                <img src={currentTrack.coverUrl} alt={currentTrack.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 italic text-xs">Sem capa</div>
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-black truncate">{currentTrack.title}</span>
              <span className="text-xs text-gray-500 truncate">
                {currentTrack.artists?.join(", ") || currentTrack.albumName || "Artista Desconhecido"}
              </span>
            </div>
          </>
        ) : (
          <div className="text-xs text-gray-400">Nenhuma música tocando</div>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center gap-2 flex-1 max-w-2xl">
        <div className="flex items-center gap-6">
          <button className="text-gray-400 hover:text-black transition-colors">
            <Shuffle className="w-4 h-4" />
          </button>
          <button onClick={playPrevious} className="text-gray-600 hover:text-black transition-colors" disabled={!currentTrack}>
            <SkipBack className="w-5 h-5 fill-current" />
          </button>
          <button 
            onClick={togglePlayPause} 
            disabled={!currentTrack}
            className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </button>
          <button onClick={playNext} className="text-gray-600 hover:text-black transition-colors" disabled={!currentTrack}>
            <SkipForward className="w-5 h-5 fill-current" />
          </button>
          <button className="text-gray-400 hover:text-black transition-colors">
            <Repeat className="w-4 h-4" />
          </button>
        </div>
        
        <div className="w-full flex items-center gap-2 text-xs text-gray-400">
          <span className="w-10 text-right">{formatTime(displayTime)}</span>
          <div className="flex-1 relative flex items-center h-4 group">
            <div className="absolute left-0 right-0 h-1 bg-gray-100 rounded-full pointer-events-none">
              <div 
                className="absolute top-0 left-0 h-full bg-black rounded-full pointer-events-none group-hover:bg-green-600"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <input 
              type="range" 
              min="0" 
              max={duration || 0} 
              step="0.1"
              value={displayTime} 
              onChange={handleSeekChange}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onTouchStart={handleMouseDown}
              onTouchEnd={handleMouseUp}
              disabled={!currentTrack || duration === 0}
              className="w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            />
          </div>
          <span className="w-10 text-left">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Volume */}
      <div className="flex items-center justify-end gap-3 w-1/3 text-gray-400">
        <button onClick={toggleMute} className="hover:text-black transition-colors">
          {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
        <div className="w-24 relative flex items-center h-4 group">
          <div className="absolute left-0 right-0 h-1 bg-gray-100 rounded-full pointer-events-none">
            <div 
              className="absolute top-0 left-0 h-full bg-black rounded-full pointer-events-none group-hover:bg-green-600"
              style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
            ></div>
          </div>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.01" 
            value={isMuted ? 0 : volume} 
            onChange={handleVolumeChange}
            className="w-full h-full opacity-0 cursor-pointer"
          />
        </div>
      </div>
    </footer>
  );
}
