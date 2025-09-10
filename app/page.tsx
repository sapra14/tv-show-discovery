"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";

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
  const [genresMap, setGenresMap] = useState<Record<number, string>>({});
  const router = useRouter();

  const TMDB_API_KEY = "551d84b416252b6687752aad820e2fb8";

  // Fetch genres
  useEffect(() => {
    fetch(
      `https://api.themoviedb.org/3/genre/tv/list?api_key=${TMDB_API_KEY}&language=en-US`
    )
      .then((res) => res.json())
      .then((data) => {
        const map: Record<number, string> = {};
        data.genres.forEach((g: Genre) => (map[g.id] = g.name));
        setGenresMap(map);
      });
  }, []);

  // Fetch popular shows
  useEffect(() => {
    fetch(
      `https://api.themoviedb.org/3/tv/popular?api_key=${TMDB_API_KEY}&language=en-US&page=1`
    )
      .then((res) => res.json())
      .then((data) => {
        setShows(data.results);
        setLoading(false);
      });
  }, []);

  // Search typeahead
  useEffect(() => {
    if (!searchQuery.trim()) return setSearchResults([]);

    const timer = setTimeout(() => {
      fetch(
        `https://api.themoviedb.org/3/search/tv?api_key=${TMDB_API_KEY}&query=${searchQuery}`
      )
        .then((res) => res.json())
        .then((data) => setSearchResults(data.results || []));
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Navigate to episode viewer page
  const handleShowClick = (show: Show) => {
    router.push(`/show/${show.id}`);
  };

  const groupedByGenre: Record<string, Show[]> = shows.reduce(
    (acc: Record<string, Show[]>, show) => {
      const genreName = show.genre_ids?.[0]
        ? genresMap[show.genre_ids[0]] || "Others"
        : "Others";
      acc[genreName] = acc[genreName] || [];
      acc[genreName].push(show);
      return acc;
    },
    {}
  );

  return (
    <main className="min-h-screen bg-gray-950 text-white px-6 py-10">
      {/* Heading */}
<header className="mb-10 text-center">
  <h1 className="text-5xl font-extrabold text-white">
    🎬 TV SHOW DISCOVERY
  </h1>
</header>

      {/* Search */}
      <div className="flex justify-center mb-10 relative">
        <div className="w-full md:w-3/4 relative">
          <input
            type="text"
            placeholder="Search TV shows..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-16 py-5 rounded-full bg-gray-900/90 text-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-purple-500 shadow-lg text-lg"
          />
          <Search
            className="absolute left-6 top-1/2 -translate-y-1/2 text-purple-400 pointer-events-none"
            size={24}
          />

          {searchResults.length > 0 && (
            <div className="absolute top-full mt-2 w-full bg-gray-800 border border-purple-500 rounded-xl shadow-lg max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500 scrollbar-track-gray-800 z-20">
              {searchResults.map((s) => (
                <div
                  key={s.id}
                  onClick={() => handleShowClick(s)}
                  className="px-4 py-3 hover:bg-purple-700 cursor-pointer rounded-lg"
                >
                  {s.name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <p className="text-center text-xl text-gray-400 animate-pulse">
          Loading shows...
        </p>
      ) : (
        <>
          {Object.keys(groupedByGenre).map((genre) => (
            <section key={genre} className="mb-10">
              <h2 className="text-2xl font-bold mb-4 text-purple-300">{genre}</h2>
              <div className="flex gap-6 overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-purple-500 scrollbar-track-gray-800">
                {groupedByGenre[genre].map((show) => (
                  <div
                    key={show.id}
                    className="flex-none w-40 border border-purple-500 rounded-lg overflow-hidden shadow-md cursor-pointer hover:scale-105 transform transition"
                    onClick={() => handleShowClick(show)}
                  >
                    <img
                      src={
                        show.poster_path
                          ? `https://image.tmdb.org/t/p/w300${show.poster_path}`
                          : "/no-image.png"
                      }
                      alt={show.name}
                      className="w-full h-56 object-cover"
                    />
                    <h3 className="text-sm text-purple-300 font-bold text-center p-2">
                      {show.name}
                    </h3>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </>
      )}

      <footer className="mt-16 text-center text-gray-500 text-sm">
        Made by sunitasapra
      </footer>
    </main>
  );
}
