import React, { useState } from "react";
import { Search, User, LogOut } from "lucide-react";
import { Input } from "./Input";
import { Popover } from "./Popover";
import { removeToken } from "../utils/auth";

interface TopBarProps {
  onSearch: (query: string) => void;
}

export function TopBar({ onSearch }: TopBarProps) {
  const [query, setQuery] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch(query);
    }
  };

  const handleLogout = () => {
    removeToken();
    window.location.href = "/login";
  };

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-gray-100 sticky top-0 z-10 font-sans shrink-0">
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            placeholder="O que você quer ouvir? (Pressione Enter)" 
            className="pl-10 bg-gray-50 border-transparent focus:bg-white transition-all w-full h-10 rounded-full"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4 ml-4">
        <Popover 
          trigger={
            <button className="p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer">
              <User className="w-5 h-5 text-black" />
            </button>
          }
        >
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair da conta</span>
          </button>
        </Popover>
      </div>
    </header>
  );
}
