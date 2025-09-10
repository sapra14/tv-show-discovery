"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface Episode {
  id: number;
  name: string;
  overview: string;
  episode_number: number;
  still_path: string | null;
}

export default function EpisodeViewer() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showName, setShowName] = useState("");

  const TMDB_API_KEY = "551d84b416252b6687752aad820e2fb8";

  useEffect(() => {
    if (!id) return;

    const fetchEpisodes = async () => {
      try {
        const resDetails = await fetch(
          `https://api.themoviedb.org/3/tv/${id}?api_key=${TMDB_API_KEY}&language=en-US`
        );
        const showDetails = await resDetails.json();
        setShowName(showDetails.name);

        const firstSeason = showDetails.seasons?.[0]?.season_number || 1;

        const resEpisodes = await fetch(
          `https://api.themoviedb.org/3/tv/${id}/season/${firstSeason}?api_key=${TMDB_API_KEY}&language=en-US`
        );
        const seasonData = await resEpisodes.json();
        setEpisodes(seasonData.episodes || []);
      } catch (err) {
        console.error("Error fetching episodes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEpisodes();
  }, [id]);

  return (
    <main className="min-h-screen bg-gray-950 text-white px-4 sm:px-6 py-6">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-gray-900/90 border-b border-purple-500 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between px-2 sm:px-6 gap-2 sm:gap-0">
        <h1 className="text-xl sm:text-2xl font-bold text-purple-300 break-words">
          {showName}
        </h1>
        <button
          onClick={() => router.push("/")}
          className="bg-purple-600 px-3 py-2 sm:px-4 sm:py-2 rounded-lg hover:bg-purple-700 transition text-sm sm:text-base"
        >
          ⬅ Back
        </button>
      </header>

      {loading ? (
        <p className="text-center mt-10 text-base sm:text-lg">Loading episodes...</p>
      ) : (
        <div className="flex flex-col gap-4 mt-6">
          {episodes.map((ep) => (
            <div
              key={ep.id}
              className="border-2 border-purple-500 rounded-xl p-3 sm:p-4 bg-gray-900 shadow-lg flex flex-col sm:flex-row gap-3 sm:gap-4"
            >
              {ep.still_path && (
                <img
                  src={`https://image.tmdb.org/t/p/w300${ep.still_path}`}
                  alt={ep.name}
                  className="w-full sm:w-28 h-20 sm:h-20 object-cover rounded-lg border-2 border-purple-400 flex-shrink-0"
                />
              )}
              <div className="flex-1">
                <h2 className="text-base sm:text-lg font-bold text-purple-300">
                  Episode {ep.episode_number}: {ep.name}
                </h2>
                <p className="text-gray-300 text-sm sm:text-base mt-1 break-words">
                  {ep.overview || "No description available."}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
