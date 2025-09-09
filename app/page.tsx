"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";

interface Show {
  id: number;
  name: string;
  poster_path: string | null;
  overview?: string;
  genre_ids?: number[];
}

interface Genre {
  id: number;
  name: string;
}

export default function Home() {
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Show[]>([]);
  const [selectedShow, setSelectedShow] = useState<Show | null>(null);
  const [genresMap, setGenresMap] = useState<Record<number, string>>({});

  const TMDB_API_KEY = "551d84b416252b6687752aad820e2fb8"; // replace with your key

  // Fetch genres map
  useEffect(() => {
    fetch(`https://api.themoviedb.org/3/genre/tv/list?api_key=${TMDB_API_KEY}&language=en-US`)
      .then((res) => res.json())
      .then((data) => {
        const map: Record<number, string> = {};
        data.genres.forEach((g: Genre) => (map[g.id] = g.name));
        setGenresMap(map);
      });
  }, []);

  // Fetch popular TV shows
  useEffect(() => {
    fetch(`https://api.themoviedb.org/3/tv/popular?api_key=${TMDB_API_KEY}&language=en-US&page=1`)
      .then((res) => res.json())
      .then((data) => {
        setShows(data.results);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching shows:", err);
        setLoading(false);
      });
  }, []);

  // Typeahead search
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(() => {
      fetch(`https://api.themoviedb.org/3/search/tv?api_key=${TMDB_API_KEY}&language=en-US&query=${searchQuery}&page=1`)
        .then((res) => res.json())
        .then((data) => setSearchResults(data.results || []))
        .catch((err) => console.error(err));
    }, 300); // debounce 300ms
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleShowClick = (show: Show) => {
    setSelectedShow(show);
    setSearchResults([]);
    setSearchQuery("");
  };

  // Group shows by first genre
  const groupedByGenre: Record<string, Show[]> = shows.reduce((acc: Record<string, Show[]>, show) => {
    const genreName = show.genre_ids?.[0] ? genresMap[show.genre_ids[0]] || "Others" : "Others";
    acc[genreName] = acc[genreName] || [];
    acc[genreName].push(show);
    return acc;
  }, {});

  return (
    <main className="min-h-screen bg-gray-950 text-white px-6 py-10">
      {/* Header */}
      <header className="mb-10 text-center">
        <h1 className="text-6xl md:text-7xl font-extrabold text-white drop-shadow-[0_0_25px_rgba(236,72,153,0.9)] animate-[pulse_2s_ease-in-out_infinite]">
          🎬 TV DISCOVERY SHOW
        </h1>
        <p className="text-lg mt-3 text-gray-300 italic">
          Explore, search, and discover your next binge-worthy show!
        </p>
      </header>

      {/* Search */}
      <div className="flex justify-center mb-10 relative">
        <div className="w-full md:w-3/4 relative">
          <input
            type="text"
            placeholder="Search TV shows..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-16 py-5 rounded-full bg-gray-900/90 text-white placeholder-gray-400 
                       focus:outline-none focus:ring-4 focus:ring-purple-500 shadow-lg text-lg z-10 relative"
          />
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-purple-400 pointer-events-none" size={24} />

          {searchResults.length > 0 && (
            <div className="absolute top-full mt-2 w-full bg-gray-800 border border-purple-500 rounded-xl shadow-lg max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500 scrollbar-track-gray-800 z-20">
              {searchResults.map((show) => (
                <div
                  key={show.id}
                  className="px-4 py-3 hover:bg-purple-700 cursor-pointer rounded-lg transition"
                  onClick={() => handleShowClick(show)}
                >
                  {show.name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <p className="text-center text-xl text-gray-400 animate-pulse">
          Loading shows...
        </p>
      ) : (
        <>
          {Object.keys(groupedByGenre).map((genre) => (
            <section key={genre} className="mb-10">
              <h2 className="text-2xl font-bold mb-4 text-purple-300">{genre}</h2>

              <div className="flex gap-6 overflow-x-auto scrollbar-thin scrollbar-thumb-purple-500 scrollbar-track-gray-800 pb-3">
                {groupedByGenre[genre].map((show) => (
                  <div
                    key={show.id}
                    className="flex-none w-36 border border-purple-500 rounded-lg overflow-hidden shadow-md
                               transform transition duration-300 hover:scale-105 hover:shadow-purple-500/60 cursor-pointer"
                    onClick={() => handleShowClick(show)}
                  >
                    <img
                      src={show.poster_path ? `https://image.tmdb.org/t/p/w300${show.poster_path}` : "/no-image.png"}
                      alt={show.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-2 text-center">
                      <h3 className="text-sm font-bold text-purple-300">{show.name}</h3>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </>
      )}

      {/* Modal */}
      {selectedShow && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
          <div className="bg-gray-900 p-6 rounded-xl max-w-lg w-full relative shadow-2xl border-2 border-purple-500 animate-[scale-in_0.3s_ease-out]">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-white text-xl font-bold"
              onClick={() => setSelectedShow(null)}
            >
              ✕
            </button>
            <h2 className="text-2xl font-bold text-purple-300 mb-4">{selectedShow.name}</h2>
            {selectedShow.poster_path && (
              <img
                src={`https://image.tmdb.org/t/p/w500${selectedShow.poster_path}`}
                alt={selectedShow.name}
                className="w-full mb-4 rounded-lg"
              />
            )}
            <p className="text-gray-200 mb-2">{selectedShow.overview || "No summary available."}</p>
          </div>
        </div>
      )}

      <footer className="mt-16 text-center text-gray-500 text-sm">
        Made with Next.js & TMDB API by sunitasapra
      </footer>
    </main>
  );
}
