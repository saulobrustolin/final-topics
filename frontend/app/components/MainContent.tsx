import React, { useState } from "react";
import { Clock3, Pin } from "lucide-react";
import { usePlayer, type Music } from "../contexts/PlayerContext";
import { ContextMenu } from "./ContextMenu";
import { Button } from "./Button";
import type { Playlist } from "~/routes/dashboard";

interface MainContentProps {
  title: string;
  description?: string;
  coverUrl?: string;
  owner?: string;
  type: "playlist" | "album" | "search";
  tracks: Music[];
  playlists?: Playlist[];
  onAddToPlaylist?: (trackId: number, playlistId: number) => void;
  onDeleteToPlaylist?: (trackId: number, playlistId: number) => void;
  onEdit?: () => void;
  isPrivate?: boolean;
  playlistOwner?: any;
}

export function MainContent({ title, description, coverUrl, owner, type, tracks, playlists = [], onAddToPlaylist, onDeleteToPlaylist, onEdit, isPrivate, playlistOwner }: MainContentProps) {
  const { playTrack, setQueue, currentTrack, isPlaying } = usePlayer();
  
  const [menuConfig, setMenuConfig] = useState<{ x: number, y: number, trackId: number } | null>(null);

  const handlePlayTrack = (track: Music) => {
    setQueue(tracks);
    playTrack(track);
  };

  const handleContextMenu = (e: React.MouseEvent, trackId: number) => {
    e.preventDefault();
    setMenuConfig({ x: e.clientX, y: e.clientY, trackId });
  };

  const getSubtitle = () => {
    if (type === "playlist") return isPrivate ? "Playlist Privada" : "Playlist Pública";
    if (type === "search") return "Resultados da Busca";
    return "Álbum";
  };

  return (
    <main className="flex-1 bg-white font-sans">
      {type !== "search" ? (
        <div className="h-64 bg-gray-50 flex items-end p-8 gap-6 border-b border-gray-100">
          <div 
            className={`w-48 h-48 bg-gray-100 rounded shadow-md overflow-hidden shrink-0 relative group ${onEdit ? 'cursor-pointer' : ''}`}
            onClick={onEdit}
          >
            {coverUrl ? (
              <img src={coverUrl} alt={title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300 italic text-sm">Sem capa</div>
            )}
            
            {onEdit && (
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Pin className="w-8 h-8 text-white fill-current" />
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2 pb-2 flex-1">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">{getSubtitle()}</span>
            <h1 className="text-6xl font-black text-black truncate">{title}</h1>
            <p className="text-sm text-gray-500 mt-2 line-clamp-2">
              <span className="font-bold text-gray-700">{owner || "Usuário"}</span>
              {description ? ` • ${description}` : ""} • {tracks.length} músicas
            </p>
          </div>
        </div>
      ) : null}

      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          {onEdit && type === "playlist" && (
            <Button 
              onClick={onEdit}
              className="bg-black text-white hover:bg-gray-800 rounded-full px-6 font-bold"
            >
              Editar
            </Button>
          )}
        </div>

        <table className="w-full text-left">
          <thead>
            <tr className="text-xs uppercase tracking-widest text-gray-400 border-b border-gray-100">
              <th className="pb-4 w-10 font-normal">#</th>
              <th className="pb-4 font-normal">Título</th>
              <th className="pb-4 font-normal">Álbum</th>
              <th className="pb-4 w-10 text-right font-normal">
                <Clock3 className="w-4 h-4 ml-auto" />
              </th>
            </tr>
          </thead>
          <tbody>
            {tracks.map((track, index) => {
              const isCurrent = currentTrack?.id === track.id;
              
              return (
                <tr 
                  key={track.id} 
                  onClick={() => handlePlayTrack(track)}
                  onContextMenu={(e) => handleContextMenu(e, track.id)}
                  className={`group transition-colors rounded-md bg-stone-50 cursor-pointer ${isCurrent ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                >
                  <td className={`py-3 text-sm font-medium text-center ${isCurrent ? 'text-green-600' : 'text-gray-400'}`}>
                    {isCurrent && isPlaying ? (
                      <div className="w-4 h-4 flex items-end justify-between px-0.5 opacity-80">
                        <div className="w-0.5 bg-green-600 animate-[bounce_1s_infinite_alternate] h-full"></div>
                        <div className="w-0.5 bg-green-600 animate-[bounce_0.8s_infinite_alternate] h-2/3"></div>
                        <div className="w-0.5 bg-green-600 animate-[bounce_1.2s_infinite_alternate] h-4/5"></div>
                      </div>
                    ) : (
                      index + 1
                    )}
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      {track.coverUrl && (
                        <img src={track.coverUrl} className="w-10 h-10 rounded object-cover" alt="" />
                      )}
                      <div className="flex flex-col">
                        <span className={`text-sm font-semibold ${isCurrent ? 'text-green-600' : 'text-black group-hover:text-black'}`}>
                          {track.title}
                        </span>
                        <span className="text-xs text-gray-500">{track.artists?.join(", ")}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-sm text-gray-500">{track.albumName || "Unknown"}</td>
                  <td className="py-3 text-sm text-gray-400 text-center">{track.duration}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {tracks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 italic">
            Esta lista está vazia.
          </div>
        )}
      </div>

      {menuConfig && (
        <ContextMenu 
          x={menuConfig.x}
          y={menuConfig.y}
          playlists={playlists.filter(p => ({ id: p.id, title: p.title }))}
          onClose={() => setMenuConfig(null)}
          onDeleteToPlaylist={() => onDeleteToPlaylist?.(menuConfig.trackId, playlistOwner.id)}
          onAddToPlaylist={(playlistId) => onAddToPlaylist?.(menuConfig.trackId, playlistId)}
        />
      )}
    </main>
  );
}
