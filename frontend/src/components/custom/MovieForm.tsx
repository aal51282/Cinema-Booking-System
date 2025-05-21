import { useState, useEffect } from 'react'
import { Movie, Room, Show } from '@/util/types'
import { Button } from "@/components/ui/button"
import MovieDetails from './MovieDetails'
import CastSection from './CastSection'
import TrailerSection from './TrailerSection'
import ShowTimesSection from './ShowTimesSection'
import ReviewsSection from './ReviewsSection'

interface MovieFormProps {
  movie: Movie
  categories: string[]
  rooms: Room[]
  onSubmit: (movie: Movie) => void
  isLoading: boolean
}

export default function MovieForm({ movie, categories, rooms, onSubmit, isLoading }: MovieFormProps) {
  const [currentMovie, setCurrentMovie] = useState<Movie>(movie)

  useEffect(() => {
    setCurrentMovie(movie)
  }, [movie])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(currentMovie)
  }

  const updateMovie = (field: keyof Movie, value: any) => {
    console.log(`Updating value for ${JSON.stringify(field)} to: ${JSON.stringify(value)}`)
    setCurrentMovie(prev => ({ ...prev, [field]: value }))
  }

  const handleMovieDetailsChange = (field: keyof Movie, value: any) => {
    updateMovie(field, value);
  };

  const handleCastChange = (newCast: string[]) => {
    updateMovie('cast', newCast);
  };

  const handleTrailerChange = (newTrailers: string[]) => {
    updateMovie('trailer', { ...currentMovie.trailer, video: newTrailers });
  };

  const handleReviewsChange = (newReviews: Movie['reviews']) => {
    updateMovie('reviews', newReviews);
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
      <MovieDetails 
        movie={currentMovie} 
        categories={categories} 
        onChange={handleMovieDetailsChange}
      />
      <CastSection 
        cast={currentMovie.cast} 
        onChange={handleCastChange}
      />
      <TrailerSection 
        trailers={currentMovie.trailer.video} 
        onChange={handleTrailerChange}
      />
      <ShowTimesSection 
        shows={currentMovie.shows || null} 
        rooms={rooms} 
        onShowsChange={(newShows) => updateMovie('shows', newShows)} 
        movieId={currentMovie.id}
      />
      <ReviewsSection 
        reviews={currentMovie.reviews} 
        onChange={handleReviewsChange}
      />
      <Button type="submit" variant={'secondary'} className='w-fit'>
        {isLoading ? "Loading..." : (currentMovie.id ? 'Update Movie' : 'Add Movie')}
      </Button>
    </form>
  )
}

