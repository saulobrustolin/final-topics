import React, { useState, useEffect } from "react";
import { Sidebar } from "../components/Sidebar";
import { TopBar } from "../components/TopBar";
import { PlayerBar } from "../components/PlayerBar";
import { MainContent } from "../components/MainContent";
import { Tabs } from "../components/Tabs";
import { Dialog } from "../components/Dialog";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { requireAuth } from "../utils/protected";
import { toast } from "sonner";
import { type Music } from "../contexts/PlayerContext";
import { api } from "../utils/api";
import { Plus } from "lucide-react";

export function meta() {
  return [
    { title: "Dashboard - Music Platform" },
  ];
}

export function clientLoader() {
  requireAuth();
  return null;
}

interface AlbumResult {
  id: number;
  name: string;
  artist: string;
  coverUrl?: string;
  albumUrl: string;
}

interface PlaylistResult {
  id: number;
  name: string;
  owner: string;
  coverUrl?: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<any>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<any>(null);
  const [searchResults, setSearchResults] = useState<{ tracks: Music[], albums: AlbumResult[], playlists: PlaylistResult[], query: string } | null>(null);
  const [loading, setLoading] = useState(true);

  // Create Playlist State
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false);
  const [playlistTitle, setPlaylistTitle] = useState("");
  const [playlistDescription, setPlaylistDescription] = useState("");
  const [playlistFile, setPlaylistFile] = useState<File | null>(null);
  const [isSubmittingPlaylist, setIsSubmittingPlaylist] = useState(false);
  const [createPreviewUrl, setCreatePreviewUrl] = useState<string | null>(null);

  // Edit Playlist State
  const [isEditPlaylistOpen, setIsEditPlaylistOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editPreviewUrl, setEditPreviewUrl] = useState<string | null>(null);
  const [isUpdatingPlaylist, setIsSubmittingUpdate] = useState(false);

  useEffect(() => {
    const init = async () => {
      await Promise.all([fetchUser(), fetchPlaylists()]);
    };
    init();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await api.get("/user");
      setUser(response.data);
    } catch (err) {
      console.error("Erro ao carregar usuário");
    }
  };

  const fetchPlaylists = async () => {
    try {
      const response = await api.get("/playlist");
      const data = response.data;
      setPlaylists(data);
      if (data.length > 0 && !selectedPlaylist && !selectedAlbum && !searchResults) {
        fetchPlaylistDetails(data[0].id);
      }
    } catch (err) {
      toast.error("Erro ao carregar playlists");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEditPlaylist = () => {
    if (!selectedPlaylist) return;
    setEditTitle(selectedPlaylist.title);
    setEditDescription(selectedPlaylist.description || "");
    setEditFile(null);
    setEditPreviewUrl(selectedPlaylist.coverUrl || null);
    setIsEditPlaylistOpen(true);
  };

  const handleCancelEdit = () => {
    if (editPreviewUrl && editPreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(editPreviewUrl);
    }
    setIsEditPlaylistOpen(false);
    setEditTitle("");
    setEditDescription("");
    setEditFile(null);
    setEditPreviewUrl(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setEditFile(file);
      const url = URL.createObjectURL(file);
      if (editPreviewUrl && editPreviewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(editPreviewUrl);
      }
      setEditPreviewUrl(url);
    }
  };

  const handleFileChangeCreate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setPlaylistFile(file);
      const url = URL.createObjectURL(file);
      if (createPreviewUrl && createPreviewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(createPreviewUrl);
      }
      setCreatePreviewUrl(url);
    }
  };

  const handleUpdatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim()) {
      toast.error("O título da playlist é obrigatório");
      return;
    }

    try {
      setIsSubmittingUpdate(true);
      const formData = new FormData();
      formData.append("title", editTitle);
      formData.append("description", editDescription);
      if (editFile) {
        formData.append("cover", editFile);
      }

      const response = await api.patch(`/playlist/${selectedPlaylist.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      toast.success("Playlist atualizada!");
      if (editPreviewUrl && editPreviewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(editPreviewUrl);
      }
      setIsEditPlaylistOpen(false);
      setEditPreviewUrl(null);
      setEditFile(null);
      
      // Preserve existing musics while updating other metadata
      setSelectedPlaylist({
        ...response.data,
        musics: selectedPlaylist.musics
      });

      // Refresh sidebar list
      fetchPlaylists();
    } catch (err) {
      toast.error("Erro ao atualizar playlist");
    } finally {
      setIsSubmittingUpdate(false);
    }
  };

  const handleCreatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playlistTitle.trim()) {
      toast.error("O título da playlist é obrigatório");
      return;
    }

    try {
      setIsSubmittingPlaylist(true);
      const formData = new FormData();
      formData.append("title", playlistTitle);
      formData.append("description", playlistDescription);
      if (playlistFile) {
        formData.append("cover", playlistFile);
      }

      const response = await api.post("/playlist", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      toast.success("Playlist criada com sucesso!");
      if (createPreviewUrl && createPreviewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(createPreviewUrl);
      }
      setIsCreatePlaylistOpen(false);
      setPlaylistTitle("");
      setPlaylistDescription("");
      setPlaylistFile(null);
      setCreatePreviewUrl(null);
      
      // Refresh list and select the new one
      await fetchPlaylists();
      fetchPlaylistDetails(response.data.id);
    } catch (err) {
      toast.error("Erro ao criar playlist");
    } finally {
      setIsSubmittingPlaylist(false);
    }
  };

  const fetchPlaylistDetails = async (id: number) => {
    try {
      const response = await api.get(`/playlist/${id}`);
      setSelectedPlaylist(response.data);
      setSelectedAlbum(null);
      setSearchResults(null); // Clear search when a playlist is selected
    } catch (err) {
      toast.error("Erro ao carregar detalhes da playlist");
    }
  };

  const fetchAlbumDetails = async (id: number) => {
    try {
      setLoading(true);
      const response = await api.get(`/album/${id}`);
      setSelectedAlbum(response.data);
      setSelectedPlaylist(null);
      setSearchResults(null);
    } catch (err) {
      toast.error("Erro ao carregar detalhes do álbum");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults(null);
      return;
    }
    try {
      setLoading(true);
      const response = await api.get(`/search?q=${encodeURIComponent(query)}`);
      const data = response.data;
      
      // Map backend search results to Music interface
      const tracks: Music[] = (data.musics || []).map((m: any) => ({
        id: m.id,
        title: m.name,
        duration: m.duration,
        coverUrl: m.coverUrl,
        artists: m.artistics,
        albumName: m.albumName || "Desconhecido"
      }));

      // Map backend search results to AlbumResult interface
      const albums: AlbumResult[] = (data.albuns || []).map((a: any) => ({
        id: a.id,
        name: a.name,
        artist: a.artist,
        coverUrl: a.coverUrl,
        albumUrl: a.albumUrl
      }));

      // Map backend search results to PlaylistResult interface
      const playlistsResults: PlaylistResult[] = (data.playlists || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        owner: p.owner,
        coverUrl: p.coverUrl
      }));

      setSelectedAlbum(null);
      setSelectedPlaylist(null);
      setSearchResults({ tracks, albums, playlists: playlistsResults, query });
    } catch (err) {
      toast.error("Erro ao realizar busca");
    } finally {
      setLoading(false);
    }
  };

  const handleFollowPlaylist = async (playlistId: number) => {
    try {
      await api.post(`/playlist/${playlistId}/follow`);
      toast.success("Playlist adicionada à sua biblioteca!");
      await fetchPlaylists();
    } catch (err: any) {
      toast.error("Erro ao seguir playlist");
    }
  };

  const formatMusicData = (musics: any[], defaultAlbumName?: string, defaultArtist?: string): Music[] => {
    return musics.map((pm: any) => {
      const musicObj = pm.music || pm; // handles both playlist (pm.music) and album/search (pm)
      
      const artists = musicObj.artists?.map((a: any) => typeof a === 'string' ? a : a.name);
      const finalArtists = artists && artists.length > 0 ? artists : [musicObj.owner || defaultArtist || "Unknown Artist"];

      return {
        id: musicObj.id,
        title: musicObj.title,
        duration: typeof musicObj.duration === 'number' ? formatDuration(musicObj.duration) : (musicObj.duration || "0:00"),
        coverUrl: musicObj.coverUrl,
        artists: finalArtists,
        albumName: musicObj.album?.title || defaultAlbumName || "Unknown Album"
      };
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAddToPlaylist = async (trackId: number, playlistId: number) => {
    try {
      await api.post(`/playlist/${playlistId}`, { musicId: trackId });
      toast.success("Música adicionada à playlist!");
    } catch (err: any) {
      const message = err.response?.data?.message || "Erro ao adicionar música";
      toast.error(message);
    }
  };

  const PlaylistSearchResultList = ({ playlists, onSelectPlaylist, onFollow }: { playlists: PlaylistResult[], onSelectPlaylist: (id: number) => void, onFollow: (id: number) => void }) => (
    <div className="p-8">
      {playlists.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 italic">
          Nenhuma playlist encontrada.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {playlists.map((playlist) => (
            <div 
              key={playlist.id} 
              className="group flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all border border-transparent hover:border-gray-200"
            >
              <div className="flex items-center gap-4 cursor-pointer flex-1 min-w-0" onClick={() => onSelectPlaylist(playlist.id)}>
                <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden shrink-0 shadow-sm">
                  {playlist.coverUrl ? (
                    <img src={playlist.coverUrl} alt={playlist.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                       <Plus className="w-6 h-6 rotate-45" /> {/* placeholder icon */}
                    </div>
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <h3 className="font-bold text-black truncate">{playlist.name}</h3>
                  <p className="text-xs text-gray-500 truncate">Playlist • Por {playlist.owner}</p>
                </div>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onFollow(playlist.id);
                }}
                className="p-2 border border-gray-200 rounded-lg hover:bg-black hover:text-white transition-colors bg-white shadow-sm cursor-pointer ml-4"
                title="Adicionar à biblioteca"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const AlbumList = ({ albums, onSelectAlbum }: { albums: AlbumResult[], onSelectAlbum: (id: number) => void }) => (
    <div className="p-8">
       {albums.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 italic">
          Nenhum álbum encontrado.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {albums.map((album) => (
            <div 
              key={album.id} 
              onClick={() => onSelectAlbum(album.id)}
              className="group cursor-pointer bg-gray-50 p-4 rounded-xl hover:bg-gray-100 transition-all border border-transparent hover:border-gray-200"
            >
              <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden mb-4 shadow-sm relative">
                {album.coverUrl ? (
                  <img src={album.coverUrl} alt={album.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm italic">Sem capa</div>
                )}
              </div>
              <h3 className="font-bold text-black truncate mb-1">{album.name}</h3>
              <p className="text-xs text-gray-500 truncate">{album.artist}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-white font-sans text-black">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          playlists={playlists} 
          onSelectPlaylist={fetchPlaylistDetails} 
          onOpenCreatePlaylist={() => setIsCreatePlaylistOpen(true)}
        />
        
        <div className="flex flex-col flex-1 relative overflow-hidden">
          <TopBar onSearch={handleSearch} />
          
          <div className="flex-1 flex flex-col overflow-hidden">
            {searchResults ? (
              <div className="flex flex-col h-full">
                <div className="p-8 pb-4">
                  <h1 className="text-3xl font-black text-black mb-2">Busca: "{searchResults.query}"</h1>
                  <p className="text-sm text-gray-500">Encontramos resultados em músicas e álbuns</p>
                </div>
                
                <Tabs 
                  tabs={[
                    {
                      id: "musics",
                      label: `Músicas (${searchResults.tracks.length})`,
                      content: (
                        <MainContent 
                          title=""
                          type="search"
                          tracks={searchResults.tracks}
                          playlists={playlists}
                          onAddToPlaylist={handleAddToPlaylist}
                        />
                      )
                    },
                    {
                      id: "albums",
                      label: `Álbuns (${searchResults.albums.length})`,
                      content: <AlbumList albums={searchResults.albums} onSelectAlbum={fetchAlbumDetails} />
                    },
                    {
                      id: "playlists",
                      label: `Playlists (${searchResults.playlists.length})`,
                      content: <PlaylistSearchResultList playlists={searchResults.playlists} onSelectPlaylist={fetchPlaylistDetails} onFollow={handleFollowPlaylist} />
                    }
                  ]}
                />
              </div>
            ) : selectedAlbum ? (
              <div className="flex-1 overflow-y-auto">
                 <MainContent 
                  title={selectedAlbum.title}
                  description={selectedAlbum.description}
                  coverUrl={selectedAlbum.coverUrl}
                  type="album"
                  tracks={formatMusicData(selectedAlbum.musics || [], selectedAlbum.title)}
                  playlists={playlists}
                  onAddToPlaylist={handleAddToPlaylist}
                />
              </div>
            ) : selectedPlaylist ? (
              <div className="flex-1 overflow-y-auto">
                <MainContent 
                  title={selectedPlaylist.title}
                  description={selectedPlaylist.description}
                  coverUrl={selectedPlaylist.coverUrl}
                  owner={selectedPlaylist.owner}
                  type="playlist"
                  tracks={formatMusicData(selectedPlaylist.musics || [])}
                  playlists={playlists}
                  onAddToPlaylist={handleAddToPlaylist}
                  onEdit={selectedPlaylist.userId === user?.id ? handleOpenEditPlaylist : undefined}
                />
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400 italic">
                {loading ? "Carregando..." : "Selecione uma playlist ou álbum para começar"}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <PlayerBar />

      {/* Create Playlist Dialog */}
      <Dialog 
        isOpen={isCreatePlaylistOpen} 
        onClose={() => setIsCreatePlaylistOpen(false)} 
        title="Criar Nova Playlist"
      >
        <form onSubmit={handleCreatePlaylist} className="space-y-4">
          <div className="flex flex-col items-center gap-4">
            <div className="w-48 h-48 bg-gray-100 rounded-lg overflow-hidden shadow-md relative group border border-gray-100">
              {createPreviewUrl ? (
                <img src={createPreviewUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm italic">Sem capa</div>
              )}
              <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                <span className="text-white text-xs font-bold uppercase tracking-wider">Alterar Foto</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChangeCreate}
                />
              </label>
            </div>
            <p className="text-xs text-gray-400">Clique na imagem para alterar a capa</p>
          </div>
          <Input 
            label="Título"
            placeholder="Minha Playlist Super Legal"
            value={playlistTitle}
            onChange={(e) => setPlaylistTitle(e.target.value)}
            required
          />
          <Input 
            label="Descrição (Opcional)"
            placeholder="Uma playlist para relaxar..."
            value={playlistDescription}
            onChange={(e) => setPlaylistDescription(e.target.value)}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsCreatePlaylistOpen(false)}
              disabled={isSubmittingPlaylist}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmittingPlaylist}
            >
              {isSubmittingPlaylist ? "Criando..." : "Criar Playlist"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Edit Playlist Dialog */}
      <Dialog 
        isOpen={isEditPlaylistOpen} 
        onClose={handleCancelEdit} 
        title="Editando playlist"
      >
        <form onSubmit={handleUpdatePlaylist} className="space-y-6">
          <div className="flex flex-col items-center gap-4">
            <div className="w-48 h-48 bg-gray-100 rounded-lg overflow-hidden shadow-md relative group border border-gray-100">
              {editPreviewUrl ? (
                <img src={editPreviewUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm italic">Sem capa</div>
              )}
              <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                <span className="text-white text-xs font-bold uppercase tracking-wider">Alterar Foto</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>
            <p className="text-xs text-gray-400">Clique na imagem para alterar a capa</p>
          </div>

          <div className="space-y-4">
            <Input 
              label="Título"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              required
            />
            <Input 
              label="Descrição"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Adicione uma descrição opcional..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-50">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleCancelEdit}
              disabled={isUpdatingPlaylist}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isUpdatingPlaylist}
            >
              {isUpdatingPlaylist ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
