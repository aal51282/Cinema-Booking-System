import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { CalendarIcon, Clock, PlusCircle, X } from 'lucide-react'
import { format } from "date-fns"
import { Room } from '@/util/types'
import { deleteShow } from '@/services/movieAPI'

interface Show {
  showId?: number
  showDate: number
  roomId: number
}

interface ShowTimesSectionProps {
  shows: Show[] | null
  rooms: Room[]
  onShowsChange: (shows: Show[]) => void
  movieId?: number
}

export default function ShowTimesSection({ shows, rooms, onShowsChange, movieId }: ShowTimesSectionProps) {
  const [selectedTheaterId, setSelectedTheaterId] = useState<number | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTimes, setSelectedTimes] = useState<number[]>([])
  const [allShows, setAllShows] = useState<Show[]>(shows || [])

  useEffect(() => {
    if (rooms.length > 0 && !selectedTheaterId) {
      setSelectedTheaterId(rooms[0].roomId)
    }
  }, [rooms, selectedTheaterId])

  useEffect(() => {
    setAllShows(shows || [])
  }, [shows])

  const handleTheaterChange = (theaterId: string) => {
    setSelectedTheaterId(Number(theaterId))
    setSelectedDate(null)
    setSelectedTimes([])
  }

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date)
      setSelectedTimes([])
    }
  }

  const handleTimeAdd = (hour: number) => {
    if (selectedDate && selectedTheaterId) {
      const newTime = new Date(selectedDate)
      newTime.setHours(hour, 0, 0, 0)
      const timeMs = newTime.getTime()
      
      if (!selectedTimes.includes(timeMs)) {
        const updatedTimes = [...selectedTimes, timeMs].sort((a, b) => a - b)
        setSelectedTimes(updatedTimes)
        
        const newShow: Show = { showDate: timeMs, roomId: selectedTheaterId }
        const updatedShows = [...allShows, newShow]
        setAllShows(updatedShows)
        onShowsChange(updatedShows)
      }
    }
  }

  const handleTimeRemove = async (showToRemove: Show) => {
    if (movieId) {
      try {
        if (showToRemove.showId) {
          await deleteShow(movieId, showToRemove.showId!);
        }
      } catch (error) {
        console.error('Error deleting show time:', error);
        return;
      }
    }
    
    const updatedShows = allShows.filter(show => 
      show.showDate !== showToRemove.showDate || show.roomId !== showToRemove.roomId
    )
    setAllShows(updatedShows)
    onShowsChange(updatedShows)

    if (showToRemove.roomId === selectedTheaterId) {
      setSelectedTimes(selectedTimes.filter(time => time !== showToRemove.showDate))
    }
  }

  const availableTimes = [10, 13, 16, 19, 22] // Available show times

  return (
    <div className="grid items-start gap-4">
      <Label>Show Times</Label>
      <div className="space-y-4">
        <Select onValueChange={handleTheaterChange} value={selectedTheaterId?.toString()}>
          <SelectTrigger>
            <SelectValue placeholder="Select a theater" />
          </SelectTrigger>
          <SelectContent>
            {rooms.map((room) => (
              <SelectItem key={room.roomId} value={room.roomId.toString()}>
                {room.roomName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedTheaterId && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                {selectedDate ? format(selectedDate, 'PPP') : <span>Pick a date</span>}
                <CalendarIcon className="ml-2 h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate || undefined}
                onSelect={handleDateChange}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        )}

        {selectedDate && (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {selectedTimes.map(time => (
                <div key={time} className="flex items-center space-x-1 bg-secondary text-secondary-foreground rounded-md px-2 py-1">
                  <span>{format(new Date(time), 'HH:mm')}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleTimeRemove({ showDate: time, roomId: selectedTheaterId! })}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <Clock className="mr-2 h-4 w-4" />
                  Add Time
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <div className="grid gap-2 p-2">
                  {availableTimes.map((hour) => (
                    <Button
                      key={hour}
                      variant="ghost"
                      onClick={() => handleTimeAdd(hour)}
                      disabled={selectedTimes.some(time => new Date(time).getHours() === hour)}
                    >
                      {`${hour}:00`}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        )}
      </div>

      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2">Scheduled Shows</h3>
        {allShows.length === 0 ? (
          <p>No shows scheduled yet.</p>
        ) : (
          <ul className="space-y-2">
            {allShows.map((show, index) => (
              <li key={index} className="flex justify-between items-center bg-secondary text-secondary-foreground rounded-md px-3 py-2">
                <span>
                  {rooms.find(room => room.roomId === show.roomId)?.roomName} - {format(new Date(show.showDate), 'PPP HH:mm')}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleTimeRemove(show)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

