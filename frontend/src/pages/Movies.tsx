import { useState } from "react";
import { Movie } from "@/util/types";
import { useNavigate } from "react-router-dom";
import SearchBox from "@/components/custom/SearchBox";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function MovieList() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const nav = useNavigate();
  const [displayLimit, setDisplayLimit] = useState({
    currentlyRunning: 8,
    comingSoon: 8,
  });

  const today = new Date();
  const week = 7.0 * 24 * 60 * 60 * 1000;

  const { currentlyRunning, comingSoon } = movies.reduce(
    (acc, movie) => {
      if (movie.soonestShow) {
        const showTime = new Date(movie.soonestShow);
        if (showTime.getTime() < today.getTime() + week) {
          acc.currentlyRunning.push(movie);
        } else {
          acc.comingSoon.push(movie);
        }
      } else {
        acc.comingSoon.push(movie);
      }
      return acc;
    },
    { currentlyRunning: [] as Movie[], comingSoon: [] as Movie[] }
  );

  const MovieCard = ({ movie }: { movie: Movie }) => (
    <div
      className="group relative overflow-hidden rounded-lg shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer lg:w-1/5 md:w-1/4"
      onClick={() => nav(`/movies/${movie.id}`)}
    >
      <img
        src={movie.movie_poster}
        alt={`${movie.title} Poster`}
        className="w-full h-full object-cover"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-white text-xl font-bold mb-2 text-center">
            {movie.title}
          </h3>
          {movie.soonestShow && (
            <p className="text-gray-300 text-sm">
              Releases on: {new Date(movie.soonestShow).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  const handleLoadMore = (section: "currentlyRunning" | "comingSoon") => {
    setDisplayLimit((prev) => ({
      ...prev,
      [section]: prev[section] + 8,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-900/70 to-black text-white relative">
      <SearchBox onMoviesUpdate={setMovies} />
      <Card className="mx-auto bg-darkgray-800/70 border-darkgray-700 w-fit p-0 group mb-8">
        <CardContent className="inline-flex w-fit text-nowrap items-center gap-2 p-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-blue-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-muted-foreground group-hover:text-foreground cursor-default">
            Click on any movie poster to view more details and book your
            tickets.
          </p>
        </CardContent>
      </Card>

      {currentlyRunning.length > 0 && (
        <section className="px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-8 text-center">
            Currently Running
          </h2>
          <div className="flex flex-row flex-wrap justify-center gap-8">
            {currentlyRunning
              .slice(0, displayLimit.currentlyRunning)
              .map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
          </div>
          {currentlyRunning.length > displayLimit.currentlyRunning && (
            <div className="text-center mt-8">
              <Button
                variant="outline"
                onClick={() => handleLoadMore("currentlyRunning")}
                className="bg-red-900/20 hover:bg-red-900/40 text-white hover:text-white border-red-900"
              >
                Load More
              </Button>
            </div>
          )}
        </section>
      )}

      {comingSoon.length > 0 && (
        <section className="py-8 px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-8 text-center">Coming Soon</h2>
          <div className="flex flex-row flex-wrap justify-center gap-8">
            {comingSoon.slice(0, displayLimit.comingSoon).map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
          {comingSoon.length > displayLimit.comingSoon && (
            <div className="text-center mt-8">
              <Button
                variant="outline"
                onClick={() => handleLoadMore("comingSoon")}
                className="bg-red-900/20 hover:bg-red-900/40 text-white border-red-900 hover:text-white"
              >
                Load More
              </Button>
            </div>
          )}
        </section>
      )}

      {currentlyRunning.length === 0 && comingSoon.length === 0 && (
        <p className="text-center text-gray-400 mt-8">
          No movies found with those filters.
        </p>
      )}
    </div>
  );
}
