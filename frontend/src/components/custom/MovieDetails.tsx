import { useState } from 'react'
import { Movie } from '@/util/types'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface MovieDetailsProps {
  movie: Movie
  categories: string[]
  onChange: (field: keyof Movie, value: any) => void
}

const mpaaRatings = ["G", "PG", "PG-13", "R", "NC-17"];

export default function MovieDetails({ movie, categories, onChange }: MovieDetailsProps) {
  //const [movieDetails, setMovieDetails] = useState(movie)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange(e.target.name as keyof Movie, e.target.value);
  };

  const handleSelectChange = (field: keyof Movie, value: string) => {
    onChange(field, value);
  };

  return (
    <div className="grid gap-4">
      <div className="grid items-center gap-4">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          value={movie.title}
          onChange={handleInputChange}
        />
      </div>
      <div className="grid items-center gap-4">
        <Label htmlFor="category">Category</Label>
        <div className="flex gap-2">
          <Input
            id="category"
            name="category"
            value={movie.category}
            onChange={handleInputChange}
            list="categories"
            placeholder="Select or enter a category"
          />
          <datalist id="categories">
            {categories.map((category) => (
              <option key={category} value={category} />
            ))}
          </datalist>
        </div>
      </div>
      <div className="grid items-center gap-4">
        <Label htmlFor="director">Director</Label>
        <Input
          id="director"
          name="director"
          value={movie.director}
          onChange={handleInputChange}
        />
      </div>
      <div className="grid items-center gap-4">
        <Label htmlFor="producer">Producer</Label>
        <Input
          id="producer"
          name="producer"
          value={movie.producer}
          onChange={handleInputChange}
        />
      </div>
      <div className="grid items-start gap-4">
        <Label htmlFor="movie_poster">Movie Poster</Label>
        <Input
          id="movie_poster"
          name="movie_poster"
          value={movie.movie_poster}
          onChange={handleInputChange}
          placeholder="Enter poster URL"
        />
        {movie.movie_poster && (
          <img src={movie.movie_poster} alt="Movie poster preview" className="w-auto h-[200px] object-contain" />
        )}
      </div>
      <div className="grid items-start gap-4">
        <Label htmlFor="synopsis">Synopsis</Label>
        <Textarea
          id="synopsis"
          name="synopsis"
          value={movie.synopsis}
          onChange={handleInputChange}
        />
      </div>
      <div className="grid items-center gap-4">
        <Label htmlFor="mpaa_rating">MPAA Rating</Label>
        <Select onValueChange={(value) => handleSelectChange('mpaa_rating', value)} value={movie.mpaa_rating}>
          <SelectTrigger>
            <SelectValue placeholder="Select a Rating"/>
          </SelectTrigger>
          <SelectContent>
            {mpaaRatings.map((rating) => (
              <SelectItem key={rating} value={rating}>
                {rating}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid items-center gap-4">
        <Label htmlFor="duration">Duration (minutes)</Label>
        <Input
          id="duration"
          name="duration"
          type="number"
          value={movie.duration}
          onChange={handleInputChange}
          min="0"
        />
      </div>
    </div>
  )
}

