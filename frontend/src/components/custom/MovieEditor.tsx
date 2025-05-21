'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { addMovie, getMovieById, getCategories, getAllRooms, editMovie } from "@/services/movieAPI"
import { Movie, Room } from '@/util/types'
import MovieForm from './MovieForm'

const CLOSED = 1, OPEN = 2, LOADING = 3;

interface MovieEditorButtonProps {
  refreshList?: () => void;
  movieId?: number
}

export default function MovieEditorButton({ movieId, refreshList }: MovieEditorButtonProps) {
  const [movie, setMovie] = useState<Movie>({
    id: -1,
    title: '',
    category: '',
    cast: [],
    director: '',
    producer: '',
    movie_poster: '',
    synopsis: '',
    reviews: [],
    trailer: { picture: '', video: [] },
    mpaa_rating: '',
    duration: 0.0,
    shows: []
  })
  const [categories, setCategories] = useState<string[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [openState, setOpenState] = useState(CLOSED)

  useEffect(() => {
    if (movieId) {
      getMovieById(movieId).then(setMovie)
    }
    getCategories().then(setCategories)
    getAllRooms().then(setRooms)
  }, [openState])

  const handleSubmit = async (updatedMovie: Movie) => {
    setOpenState(LOADING)
    try {
      if (movieId) {
        console.log(JSON.stringify(updatedMovie, null, "\t"))
        await editMovie(movieId, updatedMovie)
      } else {
        console.log(await addMovie(updatedMovie))
      }
      if (refreshList) {
        refreshList()
      }
      setOpenState(CLOSED)
    } catch (error) {
      // console.error('Error saving movie:', error)
      setOpenState(OPEN)
    }
  }

  return (
    <Dialog open={openState !== CLOSED} onOpenChange={() => setOpenState(openState === CLOSED ? OPEN : CLOSED)}>
      <DialogTrigger asChild>
        <Button variant="outline">{movieId ? 'Edit Movie' : 'Add New Movie'}</Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-[95vw] h-[95vh] max-h-[95vh] overflow-y-auto dark text-white">
        <DialogHeader>
          <DialogTitle>{movieId ? 'Edit Movie' : 'Add New Movie'}</DialogTitle>
        </DialogHeader>
        <MovieForm
          movie={movie}
          categories={categories}
          rooms={rooms}
          onSubmit={handleSubmit}
          isLoading={openState === LOADING}
        />
      </DialogContent>
    </Dialog>
  )
}
