import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Calendar, Clock, Star, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button"
import { getMovieById } from '@/services/movieAPI'; // Import the new function
import { Movie, Show } from '@/util/types';
import { useAuth } from '@/components/custom/AuthContext';
import { cn } from '@/lib/utils';

const ReviewCard = React.memo(({ review }: { review: Movie['reviews'][0] }) => (
  <div className="bg-darkgray-800 p-4 rounded-lg">
    <p className="font-medium text-lg">{review.reviewer}</p>
    <p className="text-darkgray-300 mb-2">{review.comment}</p>
    <div className="flex items-center">
      <Star className="w-5 h-5 text-yellow-400 mr-1" />
      <span className="text-lg">{review.rating}/10</span>
    </div>
  </div>
));

const TrailerCarousel = React.memo(({ trailers, title }: { trailers: string[], title: string }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? trailers.length - 1 : prevIndex - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === trailers.length - 1 ? 0 : prevIndex + 1));
  };

  const getYouTubeEmbedUrl = (url: string) => {
    console.log('Attempting to parse URL:', url);
    try {
      if(url.includes("/embed/")) return url;
      const parsedUrl = new URL(url);
      let videoId;
      if (parsedUrl.hostname === 'youtu.be') {
        // Shortened URL format
        videoId = parsedUrl.pathname.slice(1);
      } else {
        // Standard URL format
        videoId = parsedUrl.searchParams.get('v');
      }
      if (!videoId) throw new Error('Invalid YouTube URL');
      return `https://www.youtube.com/embed/${videoId}`;
    } catch (err) {
      console.error('Error parsing YouTube URL:', err);
      setError('Invalid YouTube URL');
      return '';
    }
  };

  if (error) {
    return <div className="text-red-500">Error loading trailer: {error}</div>;
  }

  return (
    <div className="relative w-full max-w-full mx-auto">
      {trailers.length > 0 ? (
        <iframe 
          className="w-full aspect-video"
          src={getYouTubeEmbedUrl(trailers[currentIndex])}
          title={`${title} Trailer ${currentIndex + 1}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
          allowFullScreen
        />
      ) : (
        <div className="text-center p-4">No trailers available</div>
      )}
      {trailers.length > 1 && (
        <>
          <Button 
            variant="outline" 
            size="icon" 
            className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-darkgray-800 text-white"
            onClick={goToPrevious}
            aria-label="Previous trailer"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-darkgray-800 text-white"
            onClick={goToNext}
            aria-label="Next trailer"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {trailers.map((_, index) => (
              <div 
                key={`trailer-dot-${index}`}
                className={`w-2 h-2 rounded-full ${index === currentIndex ? 'bg-white' : 'bg-darkgray-500'}`}
                aria-label={`Trailer ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
});

const MPAARating: React.FC<{ rating: string }> = ({ rating }) => {
  const getBgColor = (rating: string) => {
    switch (rating) {
      case 'G': return 'bg-green-600';
      case 'PG': return 'bg-yellow-500';
      case 'PG-13': return 'bg-yellow-600';
      case 'R': return 'bg-red-600';
      case 'NC-17': return 'bg-red-700';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div className={`inline-flex items-center justify-center ${getBgColor(rating)} text-white font-bold text-sm px-2 py-1 rounded border-2 border-white`}>
      {rating}
    </div>
  );
};

function formatDate(date:Date) {
  const pad = (number:number) => String(number).padStart(2, '0');

  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const year = date.getFullYear();
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());

  return [`${month}/${day}/${year}`, `${hours}:${minutes}`];
}

export default function MoviePage() {
  const navigate = useNavigate();
  const { stringId } = useParams();
  const user = useAuth();
  const id = Number(stringId);

  const [movie, setMovie] = useState<Movie | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isNaN(id)) {
      navigate('/');
      return;
    }
    const fetchMovie = async () => {
      try {
        const fetchedMovie = await getMovieById(id);
        console.log('Fetched movie:', fetchedMovie);
        if (fetchedMovie) {
          console.log('Raw trailer data:', fetchedMovie.trailer);
          const processedMovie: Movie = {
            ...fetchedMovie,
            moviePoster: fetchedMovie.moviePoster,
            mpaa_rating: fetchedMovie.mpaa_rating,
            category: fetchedMovie.category,
            trailer: {
              picture: fetchedMovie.trailer.picture,
              video: Array.isArray(fetchedMovie.trailer.video) 
                ? fetchedMovie.trailer.video
                : [fetchedMovie.trailer.video]
            }
          };
          console.log('Processed trailer data:', processedMovie.trailer);
          setMovie(processedMovie);
        } else {
          setError('No movie data received');
        }
      } catch (error) {
        console.error('Error fetching movie:', error);
        setError('Failed to fetch movie data. Please try again later.');
      }
    };
    fetchMovie();
  }, [id, navigate]);

  const renderEmbed = useMemo(() => {
    if (!movie) return null;
    return <TrailerCarousel trailers={movie.trailer.video} title={movie.title} />;
  }, [movie]);

  const renderReviews = useCallback(() => {
    if (!movie) return null;
    return movie.reviews.map((review, index) => (
      <ReviewCard key={index} review={review} />
    ));
  }, [movie]);

  const renderShowTimes = useCallback(() => {
    if (!movie || !movie.shows) return null;
    const sorted = movie.shows.sort((a, b) => new Date(a.showDate).getTime() - new Date(b.showDate).getTime());
    
    return sorted.map((show: Show) => {
      const formatted = formatDate(new Date(show.showDate));
      const handleShowClick = () => {
        if (!user.user) {
          sessionStorage.setItem('redirectAfterLogin', `/shows/${show.showId}`);
          navigate('/login');
          return;
        }
        navigate(`/shows/${show.showId}`);
      };

      return (
        <div
          key={`${show.showDate}-${show.roomId}`}
          onClick={handleShowClick}
          className={cn(
            "text-center p-2 bg-darkgray-700 border-2 rounded transition-colors duration-200 flex flex-col w-fit h-fit gap-2 cursor-pointer",
            user.user 
              ? "hover:bg-darkgray-600 border-darkgray-300 hover:border-red-600" 
              : "hover:bg-darkgray-600 border-darkgray-300 hover:border-yellow-600"
          )}
        >
          <span className='font-semibold'>Theater {show.roomId}</span>
          <span className='inline-flex gap-2'><Calendar /> {formatted[0]}</span>
          <span className='inline-flex gap-2'><Clock/> {formatted[1]}</span>
          {!user.user && (
            <span className="text-sm text-yellow-400">Login to purchase</span>
          )}
        </div>
      );
    });
  }, [movie, user.user, navigate]);

  if (error) {
    return <div className='w-fit m-auto mt-10 text-3xl text-white'>{error}</div>;
  }

  if (!movie) {
    return <div className='w-full h-screen flex items-center justify-center text-2xl text-white'>Loading Movie...</div>;
  }

  return (
    <div className="bg-darkgray-900 text-white min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <Button
          variant="ghost"
          className="mb-4 text-white hover:text-red-400 transition-colors"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Movies
        </Button>

        <div className="space-y-4">
          <h1 className='text-3xl font-bold text-center'>{movie.title}</h1>
          <div className="aspect-video w-full">
            {renderEmbed}
          </div>

          <div className="bg-darkgray-800 p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2">Synopsis</h2>
            <p className="text-base leading-relaxed">{movie.synopsis}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-darkgray-800 p-4 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-2">Cast</h2>
              <p className="text-sm">{movie.cast.join(', ')}</p>
            </div>
            <div className="bg-darkgray-800 p-4 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-2">Crew</h2>
              <p className="text-sm"><span className="font-medium">Director:</span> {movie.director}</p>
              <p className="text-sm"><span className="font-medium">Producer:</span> {movie.producer}</p>
            </div>
          </div>

          <div className="bg-darkgray-800 p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2">Reviews</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {renderReviews()}
            </div>
          </div>

          <div className="bg-darkgray-800 p-4 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Show Times</h2>
            <div className="flex flex-row gap-4 max-w-full flex-wrap">
              {renderShowTimes() || "This movie does not currently have any show times, check back later!"}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {/* Category */}
            <div className="flex items-center space-x-2">
              <span className="text-lg font-medium">Category:</span>
              <span className="text-lg">{movie.category}</span>
            </div>

            {/* MPAA Rating */}
            <div className="flex items-center space-x-2">
              <span className="text-lg font-medium">MPAA Rating:</span>
              <MPAARating rating={movie.mpaa_rating} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}