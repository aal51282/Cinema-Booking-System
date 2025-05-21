import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X } from 'lucide-react'

interface TrailerSectionProps {
  trailers: string[]
  onChange: (newTrailers: string[]) => void
}

export default function TrailerSection({ trailers, onChange }: TrailerSectionProps) {
  const [newTrailer, setNewTrailer] = useState('')
  const [error, setError] = useState('')

  const youtubeEmbedAdaptor = (url: string) => {
    try {
      const parsedUrl = new URL(url)
      let videoId
      if (parsedUrl.hostname === 'youtu.be') {
        videoId = parsedUrl.pathname.slice(1)
      } else {
        videoId = parsedUrl.searchParams.get('v')
      }
      if (!videoId) throw new Error('Invalid YouTube URL')
      return `https://www.youtube.com/embed/${videoId}`
    } catch (err) {
      console.error('Error parsing YouTube URL:', err)
      setError('Invalid YouTube URL')
      return ''
    }
  }

  const addTrailer = () => {
    const embedUrl = youtubeEmbedAdaptor(newTrailer);
    if (embedUrl) {
      onChange([...trailers, embedUrl]);
      setNewTrailer('');
      setError('');
    }
  };

  const removeTrailer = (index: number) => {
    const newTrailers = trailers.filter((_, i) => i !== index);
    onChange(newTrailers);
  };

  return (
    <div className="grid items-start gap-4">
      <Label>Trailers</Label>
      <div className="space-y-4">
        {trailers.map((trailer, index) => (
          <div key={index} className="flex flex-col items-start space-y-2">
            <div className="flex items-center w-full">
              <Input value={trailer} readOnly className="flex-grow" />
              <Button type="button" variant="ghost" size="icon" onClick={() => removeTrailer(index)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <iframe
              width="560"
              height="315"
              src={trailer}
              title={`YouTube video player ${index + 1}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        ))}
        <div className="flex items-center space-x-2">
          <Input
            value={newTrailer}
            onChange={(e) => setNewTrailer(e.target.value)}
            placeholder="Enter YouTube URL"
          />
          <Button type="button" variant='outline' onClick={addTrailer}>Add Trailer</Button>
        </div>
        {error && <p className="text-red-500">{error}</p>}
      </div>
    </div>
  )
}

