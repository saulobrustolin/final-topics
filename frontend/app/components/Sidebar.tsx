import React from "react";
import { Library, Plus, Heart } from "lucide-react";

interface Playlist {
  id: number;
  title: string;
  coverUrl?: string;
  userId: number;
}

interface SidebarProps {
  playlists: Playlist[];
  onSelectPlaylist: (id: number) => void;
  onOpenCreatePlaylist: () => void;
}

export function Sidebar({ playlists, onSelectPlaylist, onOpenCreatePlaylist }: SidebarProps) {
  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col h-full font-sans">
      <div className="p-6 space-y-6 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between text-black mb-2">
          <div className="flex items-center gap-3">
            <Library className="w-6 h-6" />
            <span className="font-bold">Sua Biblioteca</span>
          </div>
          <button 
            onClick={onOpenCreatePlaylist}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            title="Criar Playlist"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <nav className="space-y-4">

          <div className="space-y-1">
            {playlists.map((playlist) => (
              <button
                key={playlist.id}
                onClick={() => onSelectPlaylist(playlist.id)}
                className="flex items-center gap-3 w-full p-2 hover:bg-gray-50 rounded-md transition-all text-left group"
              >
                <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden">
                  {playlist.coverUrl ? (
                    <img src={playlist.coverUrl} alt={playlist.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                       <Library className="w-6 h-6" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold truncate text-black">{playlist.title}</span>
                  <span className="text-xs text-gray-500">Playlist • Criada por você</span>
                </div>
              </button>
            ))}
          </div>
        </nav>
      </div>
    </aside>
  );
}
