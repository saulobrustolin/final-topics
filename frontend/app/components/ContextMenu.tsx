import React, { useEffect, useState, useRef } from "react";
import { ChevronRight } from "lucide-react";

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  playlists: { id: number; title: string }[];
  onAddToPlaylist: (playlistId: number) => void;
}

export function ContextMenu({ x, y, onClose, playlists, onAddToPlaylist }: ContextMenuProps) {
  const [showSubmenu, setShowSubmenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const submenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  // Adjust position if menu goes off screen
  const [adjustedX, setAdjustedX] = useState(x);
  const [adjustedY, setAdjustedY] = useState(y);

  useEffect(() => {
    if (menuRef.current) {
      const { innerWidth, innerHeight } = window;
      const { offsetWidth, offsetHeight } = menuRef.current;

      let nextX = x;
      let nextY = y;

      if (x + offsetWidth > innerWidth) {
        nextX = x - offsetWidth;
      }
      if (y + offsetHeight > innerHeight) {
        nextY = y - offsetHeight;
      }

      setAdjustedX(nextX);
      setAdjustedY(nextY);
    }
  }, [x, y]);

  return (
    <div 
      ref={menuRef}
      className="fixed z-50 bg-white border border-gray-100 shadow-xl rounded-lg py-1 w-56 animate-in fade-in zoom-in-95 duration-100 font-sans"
      style={{ top: adjustedY, left: adjustedX }}
    >
      <div 
        className="relative group"
        onMouseEnter={() => setShowSubmenu(true)}
        onMouseLeave={() => setShowSubmenu(false)}
      >
        <button className={`w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-black hover:text-white transition-colors text-left ${showSubmenu ? 'bg-gray-50' : ''}`}>
          <span>Adicionar a playlist</span>
          <ChevronRight className="w-4 h-4" />
        </button>

        {showSubmenu && (
          <div 
            ref={submenuRef}
            className="absolute left-full top-0 ml-px bg-white border border-gray-100 shadow-xl rounded-lg py-1 w-56 animate-in fade-in slide-in-from-left-2 duration-100"
          >
            {playlists.length > 0 ? (
              playlists.map((playlist) => (
                <button
                  key={playlist.id}
                  onClick={() => {
                    onAddToPlaylist(playlist.id);
                    onClose();
                  }}
                  className="w-full px-3 py-2 text-sm text-gray-700 hover:bg-black hover:text-white transition-colors text-left truncate"
                >
                  {playlist.title}
                </button>
              ))
            ) : (
              <div className="px-3 py-2 text-xs text-gray-400 italic">
                Nenhuma playlist criada
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
