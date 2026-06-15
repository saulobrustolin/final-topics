import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { getAuthHeaders } from "../utils/auth";
import { toast } from "sonner";
import { api } from "../utils/api";

export interface Music {
  id: number;
  title: string;
  duration: string | number;
  coverUrl?: string;
  artists?: string[];
  albumName?: string;
}

interface PlayerContextType {
  currentTrack: Music | null;
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  currentTime: number;
  duration: number;
  playTrack: (track: Music) => Promise<void>;
  togglePlayPause: () => void;
  setVolume: (value: number) => void;
  toggleMute: () => void;
  seek: (time: number) => void;
  playNext: () => void;
  playPrevious: () => void;
  setQueue: (tracks: Music[]) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Music | null>(null);
  const [queue, setQueue] = useState<Music[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => playNext();
    const handlePause = () => setIsPlaying(false);
    const handlePlay = () => setIsPlaying(true);

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("play", handlePlay);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("play", handlePlay);
      audio.pause();
      audio.src = "";
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [queue, currentTrack]);

  const loadAudio = async (track: Music) => {
    try {
      const response = await api.get(`/music/${track.id}/play`);
      const { url } = response.data;
      const audio = audioRef.current;
      if (!audio) return;

      if (Hls.isSupported()) {
        if (hlsRef.current) {
          hlsRef.current.destroy();
        }
        const hls = new Hls({
          xhrSetup: (xhr) => {
            const headers = getAuthHeaders();
            if (headers.Authorization) {
              xhr.setRequestHeader("Authorization", headers.Authorization);
            }
          }
        });
        hls.loadSource(url);
        hls.attachMedia(audio);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          audio.play().catch(e => console.error("Playback blocked by browser:", e));
        });
        hlsRef.current = hls;
      } else if (audio.canPlayType("application/vnd.apple.mpegurl")) {
        audio.src = url;
        audio.play().catch(e => console.error("Playback blocked by browser:", e));
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar música");
    }
  };

  const playTrack = async (track: Music) => {
    setCurrentTrack(track);
    await loadAudio(track);
  };

  const togglePlayPause = () => {
    if (!audioRef.current || !currentTrack) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.error("Playback blocked:", e));
    }
  };

  const setVolume = (value: number) => {
    if (audioRef.current) {
      audioRef.current.volume = value;
    }
    setVolumeState(value);
    if (value > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const newMutedState = !isMuted;
    audioRef.current.muted = newMutedState;
    setIsMuted(newMutedState);
  };

  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const playNext = () => {
    if (queue.length === 0 || !currentTrack) return;
    const currentIndex = queue.findIndex((t) => t.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % queue.length;
    playTrack(queue[nextIndex]);
  };

  const playPrevious = () => {
    if (queue.length === 0 || !currentTrack) return;
    const currentIndex = queue.findIndex((t) => t.id === currentTrack.id);
    const prevIndex = currentIndex === 0 ? queue.length - 1 : currentIndex - 1;
    playTrack(queue[prevIndex]);
  };

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        volume,
        isMuted,
        currentTime,
        duration,
        playTrack,
        togglePlayPause,
        setVolume,
        toggleMute,
        seek,
        playNext,
        playPrevious,
        setQueue,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
}
